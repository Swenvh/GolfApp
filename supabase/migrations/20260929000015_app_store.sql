-- =============================================================================
-- Klaar voor de App Store
--  1. Account verwijderen vanuit de app (Apple-richtlijn 5.1.1(v), AVG art. 17).
--     Verwijdert de inlog; het lidmaatschap blijft van de club en facturen blijven
--     bewaard (fiscale bewaarplicht). Opnieuw inloggen koppelt het lid weer.
--  2. Reviewaccount: één democlub met nepleden, waarmee Apple en Google elke clubapp
--     kunnen keuren zonder ooit echte ledengegevens te zien.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Account verwijderen
-- -----------------------------------------------------------------------------
create function delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Niet ingelogd' using errcode = '42501';
  end if;
  -- Een beheerder die zichzelf verwijdert, kan een club zonder beheerder achterlaten
  if exists (select 1 from club_staff where user_id = v_uid) or exists (select 1 from platform_staff where user_id = v_uid) then
    raise exception 'Je bent ook beheerder. Vraag een collega om eerst je beheerdersrol te verwijderen; daarna kun je je account verwijderen.'
      using errcode = 'P0001';
  end if;
  -- Vastleggen voor de club, zonder persoonsgegevens
  insert into audit_log (club_id, table_name, record_id, action)
  select m.club_id, 'members', m.id, 'ACCOUNT_DELETED' from members m where m.user_id = v_uid;
  -- Leden worden ontkoppeld (on delete set null), sessies en inlogcodes verdwijnen mee
  delete from auth.users where id = v_uid;
end $$;

revoke execute on function delete_my_account() from public, anon;
grant execute on function delete_my_account() to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Reviewclub
-- -----------------------------------------------------------------------------
alter table clubs add column is_review boolean not null default false;
create unique index clubs_single_review on clubs (is_review) where is_review;
comment on column clubs.is_review is 'Democlub voor de keuring door Apple en Google: nepleden, zichtbaar in elke clubapp voor het reviewaccount';

-- Alleen Greenside zet een club op review
create or replace function protect_club_contract() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_platform_staff() and (
       new.slug is distinct from old.slug
    or new.is_review is distinct from old.is_review
    or new.greenside_status is distinct from old.greenside_status
    or new.greenside_since is distinct from old.greenside_since
    or new.greenside_pilot_until is distinct from old.greenside_pilot_until
    or new.greenside_fee_cents is distinct from old.greenside_fee_cents) then
    raise exception 'Het contract met Greenside kan alleen Greenside wijzigen' using errcode = '42501';
  end if;
  return new;
end $$;
revoke execute on function protect_club_contract() from public, anon, authenticated;

-- De democlub (opnieuw) opbouwen en het reviewaccount eraan koppelen. Het account zelf
-- (e-mail + wachtwoord) maakt scripts/app-review.mjs aan met de service role.
-- Opnieuw draaien zet alles terug, ook als de keurder het account heeft verwijderd.
create function review_club_reset(p_email text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_email  text := lower(trim(p_email));
  v_user   uuid;
  v_club   uuid;
  v_course uuid;
  v_tee    uuid;
  v_a      uuid;
  v_w      uuid;
  v_me     uuid;
  v_inv    uuid;
begin
  if not (is_platform_staff() or coalesce(auth.jwt()->>'role', '') = 'service_role') then
    raise exception 'Alleen Greenside' using errcode = '42501';
  end if;
  select id into v_user from auth.users where lower(email) = v_email;
  if v_user is null then
    raise exception 'Maak eerst het reviewaccount aan met scripts/app-review.mjs' using errcode = 'P0001';
  end if;
  -- Het reviewaccount mag nooit bij een echte club horen
  if exists (select 1 from members m join clubs c on c.id = m.club_id where m.user_id = v_user and not c.is_review)
     or exists (select 1 from club_staff where user_id = v_user)
     or exists (select 1 from platform_staff where user_id = v_user) then
    raise exception 'Dit account hoort bij een echte club of bij Greenside. Gebruik een apart e-mailadres voor de keuring.' using errcode = 'P0001';
  end if;

  -- Oude democlub weg; wat naar leden of het rekeningschema verwijst eerst, anders blokkeert het
  select id into v_club from clubs where is_review;
  if v_club is not null then
    delete from orders where club_id = v_club;
    delete from payments where club_id = v_club;
    delete from direct_debit_items where invoice_id in (select id from invoices where club_id = v_club);
    delete from invoices where club_id = v_club;
    -- Boekhouding: boekingen en instellingen verwijzen naar het rekeningschema
    delete from journal_entries where club_id = v_club;
    delete from products where club_id = v_club;
    delete from finance_settings where club_id = v_club;
    delete from clubs where id = v_club;
  end if;

  insert into clubs (slug, name, email, phone, street, house_number, postal_code, city,
                     greenside_status, greenside_since, greenside_fee_cents, is_review)
  values ('app-review', 'Golfclub De Proefbaan', 'info@proefbaan.invalid', '010-0000000',
          'Fairwaylaan', '1', '1000 AA', 'Proefdorp', 'actief', current_date, 0, true)
  returning id into v_club;

  insert into membership_types (club_id, name, description, annual_fee_cents, entrance_fee_cents, vat_rate, min_age, can_book_weekend)
  values (v_club, 'A-lid (volledig)', 'Onbeperkt spelen, ook in het weekend.', 130000, 0, 0, 18, true) returning id into v_a;
  insert into membership_types (club_id, name, description, annual_fee_cents, entrance_fee_cents, vat_rate, min_age, can_book_weekend)
  values (v_club, 'Weekdaglid', 'Spelen van maandag tot en met vrijdag.', 95000, 0, 0, 18, false) returning id into v_w;

  insert into courses (club_id, name, holes, first_tee_time, last_tee_time, interval_minutes, round_minutes)
  values (v_club, 'Parkbaan (18 holes)', 18, '07:30', '18:00', 8, 240) returning id into v_course;
  insert into course_tees (course_id, name, gender, course_rating, slope_rating, par)
  values (v_course, 'Geel', 'male', 71.0, 128, 72) returning id into v_tee;
  insert into course_tees (course_id, name, gender, course_rating, slope_rating, par)
  values (v_course, 'Rood', 'female', 72.0, 127, 72);
  perform hq_standard_holes(v_course, 18);

  -- Het lid waarmee de keurder inlogt
  insert into members (club_id, user_id, member_number, first_name, last_name, gender, email, membership_type_id,
                       join_date, handicap_index, street, house_number, postal_code, city)
  values (v_club, v_user, '1001', 'Alex', 'Proef', 'other', v_email, v_a, current_date - 400, 18.4,
          'Fairwaylaan', '12', '1000 AB', 'Proefdorp')
  returning id into v_me;

  -- Clubgenoten (verzonnen namen, geen echte adressen)
  insert into members (club_id, member_number, first_name, infix, last_name, gender, membership_type_id, join_date, handicap_index)
  values
    (v_club, '1002', 'Sanne',  null,    'Voorbeeld', 'female', v_a, current_date - 900, 9.8),
    (v_club, '1003', 'Pieter', 'van',   'Proefsma',  'male',   v_w, current_date - 2000, 24.1),
    (v_club, '1004', 'Fatima', null,    'Testers',   'female', v_a, current_date - 300, 14.6),
    (v_club, '1005', 'Kees',   'de',    'Oefening',  'male',   v_a, current_date - 1500, 6.2),
    (v_club, '1006', 'Lotte',  null,    'Demo',      'female', v_w, current_date - 700, 28.0),
    (v_club, '1007', 'Ruben',  'van de', 'Proefbaan','male',   v_a, current_date - 120, 32.5);

  insert into news_posts (club_id, title, body, pinned, published_at) values
    (v_club, 'Welkom in de app van de club', 'Boek je starttijd, schrijf je in voor wedstrijden en houd je scores bij. Alles op één plek.', true, now() - interval '1 day'),
    (v_club, 'Baan in topconditie', 'De greens zijn deze week bezand en liggen er weer snel bij. Veel speelplezier!', false, now() - interval '3 days'),
    (v_club, 'Nieuwe openingstijden restaurant', 'Het restaurant is vanaf deze maand ook op maandag open.', false, now() - interval '6 days');

  insert into competitions (club_id, course_id, name, description, starts_at, registration_deadline, format, max_participants, entry_fee_cents, status)
  values
    (v_club, v_course, 'Clubkampioenschappen', 'Twee rondes strokeplay, bruto en netto klassement.',
     date_trunc('day', now()) + interval '10 days 9 hours', now() + interval '7 days', 'strokeplay', 72, 0, 'open'),
    (v_club, v_course, 'Dinsdagmiddag Stableford', 'Wekelijkse qualifying stableford.',
     date_trunc('day', now()) + interval '5 days 13 hours', now() + interval '4 days', 'stableford', 40, 0, 'open');

  insert into rounds (club_id, member_id, course_tee_id, played_on, hole_scores, course_handicap, stableford_points, score_differential, qualifying)
  select v_club, v_me, v_tee, r.d, r.s, 20, r.p, r.diff, true
  from (values
    (current_date - 9,  array[5,5,4,6,5,5,4,6,5, 5,4,5,6,5,5,4,6,5], 36, 18.1),
    (current_date - 23, array[5,6,3,6,5,5,4,7,5, 5,3,5,6,6,5,4,6,5], 34, 19.4),
    (current_date - 41, array[5,5,4,5,5,4,4,6,5, 4,4,5,6,5,5,3,6,5], 39, 16.2)
  ) as r(d, s, p, diff);

  -- Wat drukte op de baan morgen, zodat de starttijdenlijst niet leeg is
  with b as (
    insert into tee_bookings (club_id, course_id, starts_at)
    select v_club, v_course, ((current_date + 1) + t)::timestamp at time zone 'Europe/Amsterdam'
    from unnest(array[time '08:02', time '13:30']) t
    returning id, starts_at
  )
  insert into tee_booking_players (booking_id, member_id)
  select b.id, m.id from b
  join (values (time '08:02', '1002'), (time '08:02', '1005'), (time '13:30', '1004'), (time '13:30', '1006')) as p(t, nr)
    on (b.starts_at at time zone 'Europe/Amsterdam')::time = p.t
  join members m on m.club_id = v_club and m.member_number = p.nr;

  -- Aanbod: te bestellen, betalen gaat op rekening (de democlub heeft geen iDEAL)
  insert into products (club_id, category, name, description, price_cents, vat_rate, capacity, capacity_scope, pickup_note, icon, sort, guest_rate)
  values
    (v_club, 'rental',   'Buggy', 'Elektrische buggy voor je ronde.', 3306, 21, 4, 'slot', 'Sleutel ophalen bij de receptie.', 'car-sport-outline', 10, null),
    (v_club, 'greenfee', 'Greenfee introducé', 'Voor gasten die met een lid meespelen.', 5505, 9, null, 'day', null, 'people-outline', 20, 'intro'),
    (v_club, 'lesson',   'Privéles bij de pro (30 min)', 'De pro neemt contact met je op om een tijd af te spreken.', 4132, 21, 6, 'day', null, 'school-outline', 30, null);

  -- Een betaalde contributiefactuur
  insert into invoices (club_id, member_id, description, issue_date, due_date)
  values (v_club, v_me, 'Contributie ' || extract(year from current_date), current_date - 30, current_date - 16)
  returning id into v_inv;
  insert into invoice_lines (invoice_id, description, unit_price_cents, vat_rate)
  values (v_inv, 'Contributie A-lid (volledig)', 130000, 0);
  perform finalize_invoice_internal(v_inv);
  insert into payments (club_id, invoice_id, amount_cents, method, reference, paid_on)
  values (v_club, v_inv, 130000, 'bank_transfer', 'Overboeking', current_date - 20);

  return v_club;
end $$;

revoke execute on function review_club_reset(text) from public, anon;
grant execute on function review_club_reset(text) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Greenside HQ: de democlub telt niet mee als klant
-- -----------------------------------------------------------------------------
create or replace function hq_club_overview()
returns table (
  club_id uuid, name text, city text, status text, since date, pilot_until date, fee_cents bigint,
  members int, active_30d int, flights_30d int, app_revenue_30d_cents bigint, orders_30d int,
  last_activity timestamptz, bank_ready boolean, payments_ready boolean, open_leads int, retained int
)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, c.city, c.greenside_status, c.greenside_since, c.greenside_pilot_until, c.greenside_fee_cents,
    (select count(*)::int from members m where m.club_id = c.id and m.status = 'active'),
    -- Leden die de app echt gebruiken: in 30 dagen geboekt of besteld
    (select count(distinct x.member_id)::int from (
       select p.member_id from tee_booking_players p join tee_bookings b on b.id = p.booking_id
       where b.club_id = c.id and p.member_id is not null and b.starts_at > now() - interval '30 days' and b.starts_at <= now()
       union
       select o.member_id from orders o where o.club_id = c.id and o.created_at > now() - interval '30 days'
     ) x),
    (select count(*)::int from tee_bookings b where b.club_id = c.id and b.starts_at > now() - interval '30 days' and b.starts_at <= now()),
    (select coalesce(sum(r.revenue_incl_cents), 0)::bigint from app_revenue r
     where r.club_id = c.id and r.fulfil_on > current_date - 30 and r.fulfil_on <= current_date),
    (select count(*)::int from orders o where o.club_id = c.id and o.status <> 'cancelled' and o.created_at > now() - interval '30 days'),
    greatest(
      (select max(b.starts_at) from tee_bookings b where b.club_id = c.id and b.starts_at <= now()),
      (select max(o.created_at) from orders o where o.club_id = c.id)),
    c.iban is not null and c.sepa_creditor_id is not null,
    exists (select 1 from club_payment_settings s where s.club_id = c.id),
    (select count(*)::int from leads l where l.club_id = c.id and l.status = 'new'),
    (select count(*)::int from membership_changes mc
     where mc.club_id = c.id and mc.from_cancel_flow and mc.kind <> 'cancel' and mc.status <> 'rejected')
  from clubs c
  where is_platform_staff() and not c.is_review
  order by c.name
$$;

create or replace function hq_weekly(p_weeks int default 12)
returns table (week_start date, app_revenue_cents bigint, flights int)
language sql stable security definer set search_path = public as $$
  select w::date,
    (select coalesce(sum(r.revenue_incl_cents), 0)::bigint from app_revenue r
     where r.fulfil_on >= w::date and r.fulfil_on < w::date + 7
       and r.club_id not in (select id from clubs where is_review)),
    (select count(*)::int from tee_bookings b
     where (b.starts_at at time zone 'Europe/Amsterdam')::date >= w::date
       and (b.starts_at at time zone 'Europe/Amsterdam')::date < w::date + 7
       and b.club_id not in (select id from clubs where is_review))
  from generate_series(date_trunc('week', current_date) - make_interval(weeks => p_weeks - 1), date_trunc('week', current_date), interval '1 week') w
  where is_platform_staff()
  order by 1
$$;
