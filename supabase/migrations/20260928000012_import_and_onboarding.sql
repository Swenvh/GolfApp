-- =============================================================================
-- Klaar voor een pilot
--  1. Leden importeren uit het vorige systeem (E-Golf4U, Nexxchange, IntoGolf):
--     in één keer, alles of niets, met foutmelding per regel.
--  2. Inloggen met een code koppelt het account vanzelf aan het lid of de
--     beheerder met hetzelfde (bevestigde) e-mailadres. Geen uitnodigingen per lid.
--  3. Greenside maakt een nieuwe club aan met een startinrichting:
--     lidmaatschappen, baan, aanbod (nog uit) en een uitnodiging voor de beheerder.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Uitnodigingen voor beheerders: worden bij de eerste keer inloggen een rol
-- -----------------------------------------------------------------------------
create table club_staff_invites (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  email       citext not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role        staff_role not null default 'admin',
  invited_by  uuid references auth.users(id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (club_id, email, role)
);
alter table club_staff_invites enable row level security;
create policy staff_invites_admin on club_staff_invites for all
  using (is_club_staff(club_id, array['admin']::staff_role[]) or is_platform_staff())
  with check (is_club_staff(club_id, array['admin']::staff_role[]) or is_platform_staff());

-- Welke club is uit welke verkoopkans ontstaan
alter table hq_prospects add column club_id uuid references clubs(id) on delete set null;

-- -----------------------------------------------------------------------------
-- Account koppelen na inloggen met een code
-- -----------------------------------------------------------------------------
create function claim_my_accounts() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_email   text;
  v_members int := 0;
  v_staff   int := 0;
begin
  if v_uid is null then
    return jsonb_build_object('members', 0, 'staff', 0);
  end if;
  -- Alleen een bevestigd e-mailadres telt: dat is het bewijs dat het adres van deze persoon is
  select lower(email) into v_email from auth.users where id = v_uid and email_confirmed_at is not null;
  if v_email is null then
    return jsonb_build_object('members', 0, 'staff', 0);
  end if;

  -- Per club alleen koppelen als er precies één lid met dit adres is (gezinnen delen soms een adres)
  with kandidaten as (
    select m.id, count(*) over (partition by m.club_id) as n
    from members m
    where lower(m.email) = v_email and m.user_id is null and m.status in ('active', 'suspended')
      and not exists (select 1 from members x where x.club_id = m.club_id and x.user_id = v_uid)
  )
  update members set user_id = v_uid
  where id in (select id from kandidaten where n = 1);
  get diagnostics v_members = row_count;

  insert into club_staff (club_id, user_id, role)
  select club_id, v_uid, role from club_staff_invites
  where lower(email) = v_email and accepted_at is null
  on conflict do nothing;
  get diagnostics v_staff = row_count;
  update club_staff_invites set accepted_at = now() where lower(email) = v_email and accepted_at is null;

  return jsonb_build_object('members', v_members, 'staff', v_staff);
end $$;

revoke execute on function claim_my_accounts() from anon;

-- -----------------------------------------------------------------------------
-- Leden importeren
--   p_rows: array van objecten met de kolommen van members, plus
--   membership_type (naam), bic, mandate_reference, mandate_signed_on, account_holder
--   en _line (regelnummer in het bestand, voor foutmeldingen).
-- -----------------------------------------------------------------------------
create function import_members(
  p_club            uuid,
  p_rows            jsonb,
  p_update_existing boolean default true,
  p_create_types    boolean default false
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  r            jsonb;
  v_line       text;
  v_num        text;
  v_next       bigint;
  v_type_name  text;
  v_type_id    uuid;
  v_member_id  uuid;
  v_iban       text;
  v_ref        text;
  v_inserted   int := 0;
  v_updated    int := 0;
  v_skipped    int := 0;
  v_mandates   int := 0;
  v_types      text[] := '{}';
begin
  if not is_club_staff(p_club, array['secretariat']::staff_role[]) then
    raise exception 'Geen rechten om leden te importeren' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'Het bestand bevat geen leden' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_rows) > 5000 then
    raise exception 'Maximaal 5000 leden per keer' using errcode = 'P0001';
  end if;

  -- Volgende vrije lidnummer voor regels zonder lidnummer: hoger dan alles in de club én in het bestand
  select greatest(
    (select max(member_number::bigint) from members where club_id = p_club and member_number ~ '^\d{1,12}$'),
    (select max((e->>'member_number')::bigint) from jsonb_array_elements(p_rows) e
     where trim(e->>'member_number') ~ '^\d{1,12}$'),
    1000) + 1 into v_next;

  for r in select * from jsonb_array_elements(p_rows) loop
    v_line := coalesce(r->>'_line', '?');
    begin
      if coalesce(trim(r->>'first_name'), '') = '' or coalesce(trim(r->>'last_name'), '') = '' then
        raise exception 'voornaam en achternaam zijn verplicht';
      end if;

      -- Lidmaatschap op naam
      v_type_name := nullif(trim(r->>'membership_type'), '');
      v_type_id := null;
      if v_type_name is not null then
        select id into v_type_id from membership_types
        where club_id = p_club and lower(name) = lower(v_type_name);
        if v_type_id is null then
          if not p_create_types then
            raise exception 'lidmaatschap "%" bestaat niet bij deze club', v_type_name;
          end if;
          insert into membership_types (club_id, name, description, annual_fee_cents)
          values (p_club, v_type_name, 'Aangemaakt bij het importeren. Vul de contributie in.', 0)
          returning id into v_type_id;
          v_types := v_types || v_type_name;
        end if;
      end if;

      v_num := nullif(trim(r->>'member_number'), '');
      if v_num is null then
        v_num := v_next::text;
        v_next := v_next + 1;
      end if;
      v_iban := nullif(upper(replace(r->>'iban', ' ', '')), '');

      select id into v_member_id from members where club_id = p_club and member_number = v_num;
      if v_member_id is not null then
        if not p_update_existing then
          v_skipped := v_skipped + 1;
          continue;
        end if;
        -- Alleen invullen wat het bestand meegeeft; niets wissen
        update members set
          ngf_number         = coalesce(nullif(r->>'ngf_number', ''), ngf_number),
          first_name         = trim(r->>'first_name'),
          infix              = coalesce(nullif(r->>'infix', ''), infix),
          last_name          = trim(r->>'last_name'),
          gender             = coalesce(nullif(r->>'gender', '')::gender, gender),
          date_of_birth      = coalesce(nullif(r->>'date_of_birth', '')::date, date_of_birth),
          email              = coalesce(nullif(r->>'email', '')::citext, email),
          phone              = coalesce(nullif(r->>'phone', ''), phone),
          street             = coalesce(nullif(r->>'street', ''), street),
          house_number       = coalesce(nullif(r->>'house_number', ''), house_number),
          postal_code        = coalesce(nullif(r->>'postal_code', ''), postal_code),
          city               = coalesce(nullif(r->>'city', ''), city),
          membership_type_id = coalesce(v_type_id, membership_type_id),
          status             = coalesce(nullif(r->>'status', '')::member_status, status),
          join_date          = coalesce(nullif(r->>'join_date', '')::date, join_date),
          end_date           = coalesce(nullif(r->>'end_date', '')::date, end_date),
          handicap_index     = coalesce(nullif(r->>'handicap_index', '')::numeric, handicap_index),
          iban               = coalesce(v_iban, iban),
          updated_at         = now()
        where id = v_member_id;
        v_updated := v_updated + 1;
      else
        insert into members (club_id, member_number, ngf_number, first_name, infix, last_name, gender,
                             date_of_birth, email, phone, street, house_number, postal_code, city,
                             membership_type_id, status, join_date, end_date, handicap_index, iban)
        values (p_club, v_num, nullif(r->>'ngf_number', ''), trim(r->>'first_name'), nullif(r->>'infix', ''),
                trim(r->>'last_name'), nullif(r->>'gender', '')::gender, nullif(r->>'date_of_birth', '')::date,
                nullif(r->>'email', '')::citext, nullif(r->>'phone', ''), nullif(r->>'street', ''),
                nullif(r->>'house_number', ''), nullif(r->>'postal_code', ''), nullif(r->>'city', ''),
                v_type_id, coalesce(nullif(r->>'status', '')::member_status, 'active'),
                coalesce(nullif(r->>'join_date', '')::date, current_date), nullif(r->>'end_date', '')::date,
                nullif(r->>'handicap_index', '')::numeric, v_iban)
        returning id into v_member_id;
        v_inserted := v_inserted + 1;
      end if;

      -- Machtiging: alleen met IBAN, kenmerk en datum van ondertekening, en als er nog geen actieve is
      v_ref := nullif(trim(r->>'mandate_reference'), '');
      if v_iban is not null and v_ref is not null and nullif(r->>'mandate_signed_on', '') is not null
         and not exists (select 1 from sepa_mandates where member_id = v_member_id and status = 'active')
         and not exists (select 1 from sepa_mandates where club_id = p_club and mandate_reference = v_ref) then
        insert into sepa_mandates (club_id, member_id, mandate_reference, account_holder, iban, bic, signed_on)
        values (p_club, v_member_id, v_ref,
                coalesce(nullif(trim(r->>'account_holder'), ''),
                         left(trim(r->>'first_name'), 1) || '. ' || concat_ws(' ', nullif(r->>'infix', ''), trim(r->>'last_name'))),
                v_iban, nullif(upper(r->>'bic'), ''), (r->>'mandate_signed_on')::date);
        v_mandates := v_mandates + 1;
      end if;
    exception
      when others then
        -- Eén foute regel: niets importeren, en precies zeggen waar het misging
        raise exception 'Regel %: %', v_line, sqlerrm using errcode = 'P0001';
    end;
  end loop;

  return jsonb_build_object('inserted', v_inserted, 'updated', v_updated, 'skipped', v_skipped,
                            'mandates', v_mandates, 'types_created', to_jsonb(v_types));
end $$;

revoke execute on function import_members(uuid, jsonb, boolean, boolean) from anon;

-- -----------------------------------------------------------------------------
-- Greenside maakt een club aan
--   p: name, slug, email, phone, website, city, layout ('9' | '18' | '18+9' | '27'),
--      status ('pilot' | 'actief'), pilot_days, fee_cents, manager_email, prospect_id
-- -----------------------------------------------------------------------------
create function hq_standard_holes(p_course uuid, p_holes int) returns void
language sql security definer set search_path = public as $$
  -- Standaardindeling (par 72 of 36); de club past par en stroke index aan in het beheer
  insert into course_holes (course_id, number, par, stroke_index)
  select p_course, n, p, si
  from unnest(array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
              array[4,4,3,5,4,4,3,5,4, 4,3,4,5,4,4,3,5,4],
              case when p_holes = 9 then array[1,3,5,7,9,11,13,15,17, 2,4,6,8,10,12,14,16,18]
                   else array[7,11,17,1,5,13,15,3,9, 8,18,12,2,6,10,16,4,14] end) as t(n, p, si)
  where n <= p_holes
$$;
revoke execute on function hq_standard_holes(uuid, int) from anon, authenticated;

create function hq_add_course(p_club uuid, p_name text, p_holes int, p_round_minutes int) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_course uuid;
begin
  insert into courses (club_id, name, holes, first_tee_time, last_tee_time, interval_minutes, round_minutes)
  values (p_club, p_name, p_holes, '08:00', '17:30', 8, p_round_minutes)
  returning id into v_course;
  -- Voorlopige baanwaarden; de echte course rating en slope staan op de scorekaart van de club
  insert into course_tees (course_id, name, gender, course_rating, slope_rating, par) values
    (v_course, 'Geel', 'male',   case when p_holes = 9 then 35.5 else 71.0 end, 128, case when p_holes = 9 then 36 else 72 end),
    (v_course, 'Rood', 'female', case when p_holes = 9 then 36.0 else 72.0 end, 127, case when p_holes = 9 then 36 else 72 end);
  perform hq_standard_holes(v_course, p_holes);
  return v_course;
end $$;
revoke execute on function hq_add_course(uuid, text, int, int) from anon, authenticated;

create function hq_create_club(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_club   uuid;
  v_name   text := nullif(trim(p->>'name'), '');
  v_slug   text := lower(nullif(trim(p->>'slug'), ''));
  v_layout text := coalesce(nullif(p->>'layout', ''), '18');
  v_status text := coalesce(nullif(p->>'status', ''), 'pilot');
  v_mgr    text := lower(nullif(trim(p->>'manager_email'), ''));
begin
  if not is_platform_staff() then
    raise exception 'Alleen Greenside kan clubs aanmaken' using errcode = '42501';
  end if;
  if v_name is null then
    raise exception 'Vul de naam van de club in' using errcode = 'P0001';
  end if;
  if v_slug is null or v_slug !~ '^[a-z0-9-]+$' then
    raise exception 'Het webadres mag alleen kleine letters, cijfers en streepjes bevatten' using errcode = 'P0001';
  end if;
  if exists (select 1 from clubs where slug = v_slug) then
    raise exception 'Er is al een club met het webadres "%"', v_slug using errcode = 'P0001';
  end if;
  if v_layout not in ('9', '18', '18+9', '27') then
    raise exception 'Onbekende baanindeling' using errcode = 'P0001';
  end if;
  if v_mgr is null or v_mgr !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Vul een geldig e-mailadres in voor de beheerder van de club' using errcode = 'P0001';
  end if;

  insert into clubs (slug, name, email, phone, website, city,
                     greenside_status, greenside_since, greenside_pilot_until, greenside_fee_cents)
  values (v_slug, v_name, nullif(p->>'email', '')::citext, nullif(p->>'phone', ''), nullif(p->>'website', ''),
          nullif(p->>'city', ''), v_status, current_date,
          case when v_status = 'pilot' then current_date + coalesce(nullif(p->>'pilot_days', '')::int, 90) end,
          coalesce(nullif(p->>'fee_cents', '')::bigint, 0))
  returning id into v_club;
  -- Rekeningschema en financiële instellingen komen er via de trigger clubs_seed_finance bij

  -- Gangbare lidmaatschappen; bedragen zijn een startpunt en staan in Instellingen om aan te passen
  insert into membership_types (club_id, name, description, annual_fee_cents, entrance_fee_cents, vat_rate, min_age, max_age, can_book_weekend, can_play) values
    (v_club, 'A-lid (volledig)', 'Onbeperkt spelen, ook in het weekend.',                         130000, 0, 0, 18, null, true,  true),
    (v_club, 'Weekdaglid',       'Spelen van maandag tot en met vrijdag.',                          95000, 0, 0, 18, null, false, true),
    (v_club, 'Gezinspartner',    'Voor de partner van een volledig lid.',                          100000, 0, 0, 18, null, true,  true),
    (v_club, 'Jeugdlid',         'Tot en met 17 jaar.',                                              30000, 0, 0, null, 17, true, true),
    (v_club, 'Studentlid',       'Van 18 tot en met 27 jaar, met studentenkaart.',                   55000, 0, 0, 18, 27, true,  true),
    (v_club, 'Rustend lid',      'Wel lid, niet spelen: bij blessure, verhuizing of een jaar weg.',  15000, 0, 0, 18, null, false, false);

  -- Baan of banen
  if v_layout = '9' then
    perform hq_add_course(v_club, 'Baan (9 holes)', 9, 120);
  elsif v_layout = '18' then
    perform hq_add_course(v_club, 'Baan (18 holes)', 18, 240);
  elsif v_layout = '18+9' then
    perform hq_add_course(v_club, 'Baan (18 holes)', 18, 240);
    perform hq_add_course(v_club, 'Par-3 baan', 9, 90);
  else
    perform hq_add_course(v_club, 'Lus A', 9, 120);
    perform hq_add_course(v_club, 'Lus B', 9, 120);
    perform hq_add_course(v_club, 'Lus C', 9, 120);
  end if;

  -- Aanbod in de app: klaargezet maar uit, zodat de club eerst de prijzen nakijkt
  insert into products (club_id, category, name, description, price_cents, handicart_price_cents, vat_rate,
                        capacity, capacity_scope, pickup_note, icon, sort, active, guest_rate,
                        grants_kind, grants_uses, grants_days) values
    (v_club, 'rental', 'Buggy', 'Elektrische buggy voor je ronde. Met een Handicart-pas betaal je het Handicart-tarief.',
     3306, 661, 21, 4, 'slot', 'Sleutel ophalen bij de receptie.', 'car-sport-outline', 10, false, null, null, null, 365),
    (v_club, 'greenfee', 'Greenfee introducé', 'Voor gasten die met een lid meespelen. Je gast hoeft niet langs de balie.',
     5505, null, 9, null, 'day', null, 'people-outline', 20, false, 'intro', null, null, 365),
    (v_club, 'greenfee', 'Greenfee gast', 'Voor gasten die de introductielimiet van dit jaar bereikt hebben.',
     6881, null, 9, null, 'day', null, 'person-outline', 21, false, 'regular', null, null, 365),
    (v_club, 'greenfee', 'Introductiekaart (5 introducés)', 'Vijf keer een gast meenemen tegen het introductietarief. Een jaar geldig.',
     22936, null, 9, null, 'day', null, 'ticket-outline', 22, false, null, 'intro', 5, 365),
    (v_club, 'playing_right', 'Weekendronde', 'Eén ronde in het weekend spelen met je weekdaglidmaatschap. Een jaar geldig.',
     3500, null, 0, null, 'day', null, 'sunny-outline', 60, false, null, 'weekend', 1, 365),
    (v_club, 'playing_right', 'Weekendpas (30 dagen)', 'Dertig dagen onbeperkt ook in het weekend spelen.',
     9500, null, 0, null, 'day', null, 'calendar-outline', 61, false, null, 'weekend', null, 30);

  -- De beheerder van de club: wordt beheerder zodra die inlogt met een code op dit adres
  insert into club_staff_invites (club_id, email, role) values (v_club, v_mgr, 'admin');

  if nullif(p->>'prospect_id', '') is not null then
    update hq_prospects set stage = 'gewonnen', club_id = v_club where id = (p->>'prospect_id')::uuid;
  end if;

  return v_club;
end $$;

revoke execute on function hq_create_club(jsonb) from anon;

-- Stand van de inrichting per club, voor Greenside (geen ledengegevens)
create function hq_club_setup(p_club uuid)
returns table (manager_email text, manager_joined boolean, members int, courses int, products_active int,
               bank_ready boolean, payments_ready boolean)
language sql stable security definer set search_path = public as $$
  select
    (select i.email::text from club_staff_invites i where i.club_id = p_club order by i.created_at limit 1),
    coalesce((select i.accepted_at is not null from club_staff_invites i where i.club_id = p_club order by i.created_at limit 1), true),
    (select count(*)::int from members m where m.club_id = p_club),
    (select count(*)::int from courses c where c.club_id = p_club),
    (select count(*)::int from products pr where pr.club_id = p_club and pr.active),
    (select c.iban is not null and c.sepa_creditor_id is not null from clubs c where c.id = p_club),
    exists (select 1 from club_payment_settings s where s.club_id = p_club)
  where is_platform_staff()
$$;
