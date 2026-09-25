-- Demodata voor lokale ontwikkeling (supabase db reset)
-- Inloggen: beheer@deduinen.test / golfapp123 (admin)  en  jan@example.test / golfapp123 (lid)

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change_token_new, email_change)
select id::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email,
       crypt('golfapp123', gen_salt('bf')), now(), now(), now(),
       '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''
from (values ('00000000-0000-0000-0000-00000000a001', 'beheer@deduinen.test'),
             ('00000000-0000-0000-0000-00000000a002', 'jan@example.test')) as u(id, email);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, 'email', jsonb_build_object('sub', id::text, 'email', email), now(), now(), now()
from auth.users where email in ('beheer@deduinen.test', 'jan@example.test');

insert into clubs (id, slug, name, ngf_club_code, email, phone, website, street, house_number, postal_code, city,
                   kvk_number, iban, bic, sepa_creditor_id, primary_color)
values ('00000000-0000-0000-0000-0000000c0001', 'de-duinen', 'Golfclub De Duinen', '0123',
        'info@deduinen.test', '071-1234567', 'https://deduinen.test', 'Duinweg', '1', '2201 AA', 'Noordwijk',
        '40123456', 'NL91ABNA0417164300', 'ABNANL2A', 'NL00ZZZ401234560000', '#1B5E20');

insert into club_staff (club_id, user_id, role) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-00000000a001', 'admin');

insert into membership_types (id, club_id, name, annual_fee_cents, entrance_fee_cents, vat_rate, min_age, max_age, can_book_weekend) values
  ('00000000-0000-0000-0000-0000000d0001', '00000000-0000-0000-0000-0000000c0001', 'A-lid (volledig)', 185000, 50000, 0, 18, null, true),
  ('00000000-0000-0000-0000-0000000d0002', '00000000-0000-0000-0000-0000000c0001', 'Weekdaglid',        125000, 25000, 0, 18, null, false),
  ('00000000-0000-0000-0000-0000000d0003', '00000000-0000-0000-0000-0000000c0001', 'Jeugdlid',           35000,     0, 0, null, 17, true),
  ('00000000-0000-0000-0000-0000000d0004', '00000000-0000-0000-0000-0000000c0001', 'Studentlid',         60000,     0, 0, 18, 27, true);

insert into members (id, club_id, user_id, member_number, ngf_number, first_name, infix, last_name, gender, date_of_birth,
                     email, phone, street, house_number, postal_code, city, membership_type_id, join_date, handicap_index, iban)
values
  ('00000000-0000-0000-0000-0000000e0001', '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-00000000a002',
   '1001', '12345678', 'Jan', 'de', 'Vries', 'male', '1968-04-12', 'jan@example.test', '06-12345678',
   'Zeestraat', '12', '2202 BB', 'Noordwijk', '00000000-0000-0000-0000-0000000d0001', '2015-03-01', 14.2, 'NL02RABO0123456789'),
  ('00000000-0000-0000-0000-0000000e0002', '00000000-0000-0000-0000-0000000c0001', null,
   '1002', '23456789', 'Sanne', null, 'Jansen', 'female', '1985-09-30', 'sanne@example.test', '06-23456789',
   'Kerkstraat', '4', '2201 CC', 'Noordwijk', '00000000-0000-0000-0000-0000000d0001', '2019-01-15', 8.7, 'NL44RABO0123456788'),
  ('00000000-0000-0000-0000-0000000e0003', '00000000-0000-0000-0000-0000000c0001', null,
   '1003', '34567890', 'Pieter', 'van den', 'Berg', 'male', '1952-11-02', 'pieter@example.test', null,
   'Duinlaan', '88', '2204 DD', 'Katwijk', '00000000-0000-0000-0000-0000000d0002', '2008-06-01', 22.5, 'NL69INGB0123456789'),
  ('00000000-0000-0000-0000-0000000e0004', '00000000-0000-0000-0000-0000000c0001', null,
   '1004', '45678901', 'Emma', null, 'Bakker', 'female', '2010-02-20', null, null,
   'Parkweg', '3', '2201 EE', 'Noordwijk', '00000000-0000-0000-0000-0000000d0003', '2022-04-01', 31.0, null),
  ('00000000-0000-0000-0000-0000000e0005', '00000000-0000-0000-0000-0000000c0001', null,
   '1005', '56789012', 'Mohammed', 'el', 'Amrani', 'male', '1979-07-07', 'mohammed@example.test', '06-34567890',
   'Strandweg', '21', '2202 FF', 'Noordwijk', '00000000-0000-0000-0000-0000000d0001', '2021-01-01', 11.4, 'NL20INGB0001234567');

insert into sepa_mandates (club_id, member_id, mandate_reference, account_holder, iban, bic, signed_on) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'DD-1001', 'J. de Vries',    'NL02RABO0123456789', 'RABONL2U', '2015-03-01'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0002', 'DD-1002', 'S. Jansen',      'NL44RABO0123456788', 'RABONL2U', '2019-01-15'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0005', 'DD-1005', 'M. el Amrani',   'NL20INGB0001234567', 'INGBNL2A', '2021-01-01');

insert into courses (id, club_id, name, holes, first_tee_time, last_tee_time, interval_minutes) values
  ('00000000-0000-0000-0000-0000000f0001', '00000000-0000-0000-0000-0000000c0001', 'Duinbaan (18 holes)', 18, '07:30', '17:00', 10),
  ('00000000-0000-0000-0000-0000000f0002', '00000000-0000-0000-0000-0000000c0001', 'Par-3 baan', 9, '08:00', '18:00', 8);

insert into course_tees (course_id, name, gender, course_rating, slope_rating, par) values
  ('00000000-0000-0000-0000-0000000f0001', 'Wit',   'male',   73.1, 135, 72),
  ('00000000-0000-0000-0000-0000000f0001', 'Geel',  'male',   71.4, 129, 72),
  ('00000000-0000-0000-0000-0000000f0001', 'Blauw', 'female', 73.6, 131, 72),
  ('00000000-0000-0000-0000-0000000f0001', 'Rood',  'female', 71.8, 125, 72);

insert into course_holes (course_id, number, par, stroke_index)
select '00000000-0000-0000-0000-0000000f0001', n, p, si
from unnest(array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
            array[4,4,3,5,4,4,3,5,4, 4,3,4,5,4,4,3,5,4],
            array[7,11,17,1,5,13,15,3,9, 8,18,12,2,6,10,16,4,14]) as t(n, p, si);

insert into news_posts (club_id, title, body, pinned, published_at) values
  ('00000000-0000-0000-0000-0000000c0001', 'Baan weer volledig open',
   'Na het onderhoud aan de greens is de Duinbaan vanaf vandaag weer volledig bespeelbaar. Veel speelplezier!', true, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000c0001', 'Inschrijving clubkampioenschappen geopend',
   'Schrijf je via de app in voor de clubkampioenschappen. Inschrijven kan tot en met vrijdag.', false, now() - interval '3 days');

insert into competitions (club_id, course_id, name, description, starts_at, registration_deadline, format, max_participants, entry_fee_cents, status) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000f0001', 'Clubkampioenschappen Strokeplay',
   'Twee rondes strokeplay, bruto en netto klassement.', date_trunc('day', now()) + interval '10 days 9 hours',
   now() + interval '7 days', 'strokeplay', 72, 1500, 'open'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000f0001', 'Dinsdagmiddag Stableford',
   'Wekelijkse qualifying stableford.', date_trunc('day', now()) + interval '5 days 13 hours',
   now() + interval '4 days', 'stableford', 40, 500, 'open');

-- Extra demodata: rondes van Jan (voor scoreverloop en handicapindicatie)
insert into rounds (club_id, member_id, course_tee_id, played_on, hole_scores, course_handicap, stableford_points, score_differential, qualifying)
select '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001',
       (select id from course_tees where name = 'Geel'), r.d, r.s, 16, r.p, r.diff, true
from (values
  (current_date - 8, array[4, 5, 3, 6, 5, 4, 4, 7, 4, 5, 3, 5, 6, 4, 6, 3, 6, 5], 38, 11.9),
  (current_date - 19, array[5, 4, 4, 6, 6, 5, 3, 6, 5, 4, 4, 5, 5, 5, 5, 4, 7, 4], 36, 13.7),
  (current_date - 33, array[4, 4, 4, 6, 4, 5, 3, 6, 5, 5, 3, 4, 6, 5, 4, 3, 6, 5], 41, 9.3),
  (current_date - 47, array[5, 5, 3, 7, 5, 4, 4, 6, 4, 5, 4, 6, 6, 4, 5, 4, 6, 5], 35, 14.5),
  (current_date - 62, array[4, 5, 3, 5, 5, 5, 3, 6, 4, 5, 3, 5, 5, 5, 5, 3, 5, 5], 42, 8.4),
  (current_date - 80, array[5, 4, 2, 6, 5, 4, 4, 6, 5, 4, 4, 5, 6, 4, 5, 4, 6, 4], 40, 10.2),
  (current_date - 101, array[4, 5, 4, 6, 4, 5, 3, 7, 5, 5, 3, 5, 6, 5, 4, 4, 6, 5], 37, 12.8)
) as r(d, s, p, diff);

-- Een afgelopen wedstrijd met klassement
with c as (
  insert into competitions (club_id, course_id, name, description, starts_at, format, max_participants, entry_fee_cents, status)
  values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000f0001', 'Septembermedal',
          'Maandelijkse medal, individueel stableford.', ((current_date - 12) + time '09:00')::timestamp at time zone 'Europe/Amsterdam', 'stableford', 60, 500, 'finished')
  returning id
)
insert into competition_entries (competition_id, member_id, stableford_points, position)
select c.id, m, p, pos from c, (values
  ('00000000-0000-0000-0000-0000000e0002'::uuid, 39, 1),
  ('00000000-0000-0000-0000-0000000e0001', 37, 2),
  ('00000000-0000-0000-0000-0000000e0005', 35, 3),
  ('00000000-0000-0000-0000-0000000e0003', 31, 4),
  ('00000000-0000-0000-0000-0000000e0004', 28, 5)) as e(m, p, pos);

-- Drukte op de baan morgen
with b as (
  insert into tee_bookings (club_id, course_id, starts_at, created_by)
  select '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000f0001',
         ((current_date + 1) + t)::timestamp at time zone 'Europe/Amsterdam', null
  from unnest(array[time '08:00', time '08:30', time '09:10', time '10:20']) t
  returning id, starts_at
)
insert into tee_booking_players (booking_id, member_id, guest_name)
select b.id, p.m, p.g from b join (values
  (time '08:00', '00000000-0000-0000-0000-0000000e0002'::uuid, null::text),
  (time '08:00', '00000000-0000-0000-0000-0000000e0005', null),
  (time '08:30', '00000000-0000-0000-0000-0000000e0003', null),
  (time '08:30', null, 'Henk Visser'),
  (time '09:10', '00000000-0000-0000-0000-0000000e0004', null),
  (time '10:20', '00000000-0000-0000-0000-0000000e0002', null),
  (time '10:20', '00000000-0000-0000-0000-0000000e0003', null),
  (time '10:20', '00000000-0000-0000-0000-0000000e0005', null),
  (time '10:20', null, 'Anouk de Boer')
) as p(t, m, g) on (b.starts_at at time zone 'Europe/Amsterdam')::time = p.t;

insert into news_posts (club_id, title, body, published_at) values
  ('00000000-0000-0000-0000-0000000c0001', 'Nieuwe openingstijden restaurant',
   'Vanaf oktober is het restaurant op maandag gesloten. De bar op het terras blijft dagelijks open tot zonsondergang.', now() - interval '6 days');

-- Een paar facturen: contributie via incasso en een losse factuur
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);
select generate_contribution_invoices('00000000-0000-0000-0000-0000000c0001', extract(year from now())::int);
select finalize_invoice(id) from invoices where club_id = '00000000-0000-0000-0000-0000000c0001' and status = 'draft';

insert into payments (club_id, invoice_id, amount_cents, method, reference, created_by)
select club_id, id, total_cents, 'bank_transfer', 'Overboeking', '00000000-0000-0000-0000-00000000a001'
from invoices where member_id = '00000000-0000-0000-0000-0000000e0003';
select set_config('request.jwt.claim.sub', '', false);
