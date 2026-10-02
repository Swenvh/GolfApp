-- =============================================================================
-- Reviewaccount: de democlub boekt de starttijden op de eerstvolgende werkdag.
-- Op vrijdag en zaterdag viel "morgen" in het weekend, waar Lotte (weekdaglid)
-- niet mag spelen; het klaarzetten van het reviewaccount mislukte dan.
-- =============================================================================

create or replace function review_club_reset(p_email text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  -- Eerstvolgende werkdag: Lotte (weekdaglid) mag niet in het weekend spelen
  v_day date := (current_date + 1) + case extract(isodow from current_date + 1) when 6 then 2 when 7 then 1 else 0 end;
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
    select v_club, v_course, (v_day + t)::timestamp at time zone 'Europe/Amsterdam'
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

