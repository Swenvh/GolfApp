-- =============================================================================
-- Beveiliging van import, koppelen en club aanmaken
--  1. Koppelen alleen na aantoonbaar bezit van het e-mailadres: een sessie die met
--     een code of e-maillink is verkregen. Een zelf aangemaakt account met wachtwoord
--     op het adres van een lid koppelt nooit, ook niet als het adres 'bevestigd' is.
--  2. Interne hulpfuncties niet aanroepbaar van buitenaf; overal expliciete rechten.
--  3. Import: strengere invoercontrole in de database zelf (niet alleen in de browser)
--     en één regel in het audit-log per import.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Koppelen: bewijs van e-mailbezit in deze sessie
-- -----------------------------------------------------------------------------
create or replace function claim_my_accounts() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_email   text;
  v_proof   boolean;
  v_members int := 0;
  v_staff   int := 0;
begin
  if v_uid is null then
    return jsonb_build_object('members', 0, 'staff', 0);
  end if;

  -- Hoe is deze sessie verkregen? Alleen een code of link per e-mail bewijst dat
  -- deze persoon het postvak van dit adres heeft. Een wachtwoord bewijst dat niet.
  select exists (
    select 1 from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) a
    where a ->> 'method' in ('otp', 'magiclink', 'invite', 'email/signup', 'recovery')
  ) into v_proof;
  if not v_proof then
    return jsonb_build_object('members', 0, 'staff', 0);
  end if;

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

-- -----------------------------------------------------------------------------
-- 2. Rechten: standaard mag iedereen (PUBLIC) een functie aanroepen; dat zetten we uit
-- -----------------------------------------------------------------------------
-- Interne bouwstenen van hq_create_club: alleen via die functie, nooit rechtstreeks
revoke execute on function hq_standard_holes(uuid, int) from public, anon, authenticated;
revoke execute on function hq_add_course(uuid, text, int, int) from public, anon, authenticated;

create or replace function hq_add_course(p_club uuid, p_name text, p_holes int, p_round_minutes int) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_course uuid;
begin
  -- Extra slot: ook bij een verkeerd ingestelde grant alleen voor Greenside
  if not is_platform_staff() then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  insert into courses (club_id, name, holes, first_tee_time, last_tee_time, interval_minutes, round_minutes)
  values (p_club, p_name, p_holes, '08:00', '17:30', 8, p_round_minutes)
  returning id into v_course;
  insert into course_tees (course_id, name, gender, course_rating, slope_rating, par) values
    (v_course, 'Geel', 'male',   case when p_holes = 9 then 35.5 else 71.0 end, 128, case when p_holes = 9 then 36 else 72 end),
    (v_course, 'Rood', 'female', case when p_holes = 9 then 36.0 else 72.0 end, 127, case when p_holes = 9 then 36 else 72 end);
  perform hq_standard_holes(v_course, p_holes);
  return v_course;
end $$;
revoke execute on function hq_add_course(uuid, text, int, int) from public, anon, authenticated;

-- Aanroepbaar door ingelogde gebruikers; de functies controleren zelf de rol
revoke execute on function claim_my_accounts() from public, anon;
grant execute on function claim_my_accounts() to authenticated;
revoke execute on function hq_create_club(jsonb) from public, anon;
grant execute on function hq_create_club(jsonb) to authenticated;
revoke execute on function hq_club_setup(uuid) from public, anon;
grant execute on function hq_club_setup(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Import: controle in de database en een spoor in het audit-log
-- -----------------------------------------------------------------------------
create function import_check_row(r jsonb) returns text
language plpgsql immutable set search_path = public as $$
declare
  k text;
  v text;
begin
  -- Alleen tekstvelden van redelijke lengte; geen geneste structuren
  for k, v in select key, value #>> '{}' from jsonb_each(r) loop
    if jsonb_typeof(r -> k) not in ('string', 'number', 'null') then
      return format('ongeldige waarde in veld %s', k);
    end if;
    if length(v) > 200 then
      return format('waarde in veld %s is te lang (maximaal 200 tekens)', k);
    end if;
  end loop;
  if nullif(r->>'email', '') is not null and (r->>'email') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return 'e-mailadres is ongeldig';
  end if;
  if nullif(r->>'iban', '') is not null and upper(replace(r->>'iban', ' ', '')) !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$' then
    return 'IBAN is ongeldig';
  end if;
  if nullif(r->>'member_number', '') is not null and trim(r->>'member_number') !~ '^[A-Za-z0-9._/-]{1,20}$' then
    return 'lidnummer mag alleen letters, cijfers en - . _ / bevatten';
  end if;
  return null;
end $$;
revoke execute on function import_check_row(jsonb) from public, anon, authenticated;

create or replace function import_members(
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
  v_problem    text;
  v_inserted   int := 0;
  v_updated    int := 0;
  v_skipped    int := 0;
  v_mandates   int := 0;
  v_types      text[] := '{}';
begin
  if auth.uid() is null or not is_club_staff(p_club, array['secretariat']::staff_role[]) then
    raise exception 'Geen rechten om leden te importeren' using errcode = '42501';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'Het bestand bevat geen leden' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_rows) > 5000 then
    raise exception 'Maximaal 5000 leden per keer' using errcode = 'P0001';
  end if;

  -- Eén import tegelijk per club: voorkomt dubbele lidnummers bij twee keer klikken
  perform pg_advisory_xact_lock(hashtext('import:' || p_club::text));

  -- Volgende vrije lidnummer voor regels zonder lidnummer: hoger dan alles in de club én in het bestand
  select greatest(
    (select max(member_number::bigint) from members where club_id = p_club and member_number ~ '^\d{1,12}$'),
    (select max((e->>'member_number')::bigint) from jsonb_array_elements(p_rows) e
     where jsonb_typeof(e) = 'object' and trim(e->>'member_number') ~ '^\d{1,12}$'),
    1000) + 1 into v_next;

  for r in select * from jsonb_array_elements(p_rows) loop
    begin
      if jsonb_typeof(r) <> 'object' then
        raise exception 'ongeldige regel';
      end if;
      v_line := coalesce(left(r->>'_line', 10), '?');
      v_problem := import_check_row(r);
      if v_problem is not null then
        raise exception '%', v_problem;
      end if;
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
        -- Alleen invullen wat het bestand meegeeft; niets wissen. Koppeling met een account blijft ongemoeid.
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
        raise exception 'Regel %: %', coalesce(v_line, '?'), sqlerrm using errcode = 'P0001';
    end;
  end loop;

  -- Wie importeerde wat en wanneer (AVG): één regel, zonder de persoonsgegevens zelf
  insert into audit_log (club_id, table_name, action, changed_by, new_data)
  values (p_club, 'members', 'IMPORT', auth.uid(),
          jsonb_build_object('rows', jsonb_array_length(p_rows), 'inserted', v_inserted, 'updated', v_updated,
                             'skipped', v_skipped, 'mandates', v_mandates, 'types_created', to_jsonb(v_types)));

  return jsonb_build_object('inserted', v_inserted, 'updated', v_updated, 'skipped', v_skipped,
                            'mandates', v_mandates, 'types_created', to_jsonb(v_types));
end $$;

revoke execute on function import_members(uuid, jsonb, boolean, boolean) from public, anon;
grant execute on function import_members(uuid, jsonb, boolean, boolean) to authenticated;
