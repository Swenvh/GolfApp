-- =============================================================================
-- Aanpassingen na de pilotreview
--  1. Baaninformatie: per baan open / beperkt / gesloten met een korte toelichting
--  2. Starttijd voor 9 of 18 holes
--  3. Horeca op rekening: de bar zet een bestelling op naam van een lid
--  4. Lid vult zelf het IBAN in (alleen zichtbaar voor het lid en de club)
--  5. Gezinslid aanmelden alleen met e-mailadres en telefoonnummer
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Baaninformatie
-- -----------------------------------------------------------------------------
alter table courses
  add column status text not null default 'open' check (status in ('open', 'beperkt', 'gesloten')),
  add column status_note text check (status_note is null or length(status_note) <= 200),
  add column status_updated_at timestamptz;

create function set_course_status(p_course uuid, p_status text, p_note text) returns void
language plpgsql security definer set search_path = public as $$
declare v_club uuid;
begin
  select club_id into v_club from courses where id = p_course;
  if v_club is null or not is_club_staff(v_club, array['marshal', 'secretariat']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if p_status not in ('open', 'beperkt', 'gesloten') then
    raise exception 'Kies open, beperkt of gesloten' using errcode = 'P0001';
  end if;
  update courses set status = p_status, status_note = nullif(trim(p_note), ''), status_updated_at = now() where id = p_course;
end $$;
revoke execute on function set_course_status(uuid, text, text) from public, anon;
grant execute on function set_course_status(uuid, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. 9 of 18 holes
-- -----------------------------------------------------------------------------
alter table tee_bookings add column holes smallint check (holes in (9, 18));
comment on column tee_bookings.holes is 'Gekozen aantal holes; leeg = de hele baan';

drop function book_tee_time(uuid, timestamptz, uuid[], text[]);
create function book_tee_time(
  p_course uuid, p_starts_at timestamptz, p_member_ids uuid[] default '{}', p_guest_names text[] default '{}',
  p_holes smallint default null
) returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_club    uuid;
  v_holes   smallint;
  v_booking uuid;
begin
  if coalesce(array_length(p_member_ids, 1), 0) + coalesce(array_length(p_guest_names, 1), 0) = 0 then
    raise exception 'Voeg minimaal één speler toe' using errcode = 'P0001';
  end if;

  select club_id, holes into v_club, v_holes from courses where id = p_course and active;
  if v_club is null then raise exception 'Baan niet gevonden' using errcode = 'P0001'; end if;
  if p_holes is not null and (p_holes not in (9, 18) or p_holes > v_holes) then
    raise exception 'Deze baan heeft % holes', v_holes using errcode = 'P0001';
  end if;

  -- Wie als eerste boekt, kiest 9 of 18 holes; wie aansluit, speelt mee
  insert into tee_bookings (club_id, course_id, starts_at, created_by, holes)
  values (v_club, p_course, p_starts_at, auth.uid(), case when p_holes = v_holes then null else p_holes end)
  on conflict (course_id, starts_at) do nothing
  returning id into v_booking;

  if v_booking is null then
    select id into v_booking from tee_bookings where course_id = p_course and starts_at = p_starts_at;
  end if;

  insert into tee_booking_players (booking_id, member_id)
  select v_booking, unnest(p_member_ids);

  insert into tee_booking_players (booking_id, guest_name)
  select v_booking, g from unnest(p_guest_names) g where trim(g) <> '';

  return v_booking;
end $$;
revoke execute on function book_tee_time(uuid, timestamptz, uuid[], text[], smallint) from public, anon;
grant execute on function book_tee_time(uuid, timestamptz, uuid[], text[], smallint) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Horeca op rekening
-- -----------------------------------------------------------------------------
alter table invoices add column category text check (category in ('horeca'));
comment on column invoices.category is 'Soort factuur voor het filter in de app; leeg = contributie, aanbod of los';

-- Bedragen komen binnen inclusief btw (zoals op de kassa); per regel exclusief en btw afgerond
create function horeca_invoice(p_member uuid, p_lines jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_club  uuid;
  v_term  int;
  v_inv   uuid;
  v_line  jsonb;
  v_pos   int := 0;
  v_rate  numeric;
  v_incl  bigint;
  v_desc  text;
begin
  select m.club_id, c.payment_term_days into v_club, v_term
  from members m join clubs c on c.id = m.club_id where m.id = p_member and m.status in ('active', 'suspended');
  if v_club is null or not is_club_staff(v_club, array['finance', 'secretariat']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 or jsonb_array_length(p_lines) > 30 then
    raise exception 'Voeg 1 tot 30 regels toe' using errcode = 'P0001';
  end if;

  insert into invoices (club_id, member_id, description, issue_date, due_date, category, created_by)
  values (v_club, p_member, 'Horeca', current_date, current_date + coalesce(v_term, 14), 'horeca', auth.uid())
  returning id into v_inv;

  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_pos := v_pos + 1;
    v_desc := nullif(trim(v_line->>'description'), '');
    v_rate := (v_line->>'vat_rate')::numeric;
    v_incl := (v_line->>'amount_incl_cents')::bigint;
    if v_desc is null or length(v_desc) > 120 then
      raise exception 'Regel %: vul een omschrijving in (maximaal 120 tekens)', v_pos using errcode = 'P0001';
    end if;
    if v_rate not in (0, 9, 21) then
      raise exception 'Regel %: btw is 0, 9 of 21 procent', v_pos using errcode = 'P0001';
    end if;
    if v_incl is null or v_incl <= 0 or v_incl > 100000 then
      raise exception 'Regel %: bedrag tussen € 0,01 en € 1.000', v_pos using errcode = 'P0001';
    end if;
    insert into invoice_lines (invoice_id, position, description, unit_price_cents, vat_rate)
    values (v_inv, v_pos, v_desc, round(v_incl * 100 / (100 + v_rate))::bigint, v_rate);
  end loop;

  perform finalize_invoice_internal(v_inv);
  return v_inv;
end $$;
revoke execute on function horeca_invoice(uuid, jsonb) from public, anon;
grant execute on function horeca_invoice(uuid, jsonb) to authenticated;

-- -----------------------------------------------------------------------------
-- 4. IBAN door het lid zelf
-- -----------------------------------------------------------------------------
create function iban_is_valid(p text) returns boolean
language plpgsql immutable set search_path = public as $$
declare
  v text := upper(regexp_replace(coalesce(p, ''), '\s', '', 'g'));
  r text;
  n int := 0;
  ch text;
begin
  if v !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$' then return false; end if;
  r := substr(v, 5) || substr(v, 1, 4);
  -- Letters worden getallen (A=10 … Z=35); rest bij deling door 97 moet 1 zijn
  for i in 1..length(r) loop
    ch := substr(r, i, 1);
    if ch ~ '[A-Z]' then
      n := (n * 100 + ascii(ch) - 55) % 97;
    else
      n := (n * 10 + ch::int) % 97;
    end if;
  end loop;
  return n = 1;
end $$;

create function member_set_iban(p_member uuid, p_iban text) returns void
language plpgsql security definer set search_path = public as $$
declare v text := upper(regexp_replace(coalesce(p_iban, ''), '\s', '', 'g'));
begin
  if p_member not in (select my_member_ids()) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v <> '' and not iban_is_valid(v) then
    raise exception 'Dit IBAN klopt niet. Controleer het nummer.' using errcode = 'P0001';
  end if;
  update members set iban = nullif(v, '') where id = p_member;
end $$;
revoke execute on function member_set_iban(uuid, text) from public, anon;
grant execute on function member_set_iban(uuid, text) to authenticated;
revoke execute on function iban_is_valid(text) from public, anon;

-- -----------------------------------------------------------------------------
-- 5. Gezinslid: e-mail en telefoon verplicht (een gezinslid logt zelf in)
-- -----------------------------------------------------------------------------
alter table leads add constraint leads_family_contact
  check (type <> 'family' or (email is not null and phone is not null)) not valid;
