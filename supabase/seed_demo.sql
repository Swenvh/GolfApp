-- Demodata voor verkoopgesprekken: zes weken gebruik van de app bij Golfclub De Duinen.
-- Draait na seed.sql. Bestellingen lopen via dezelfde functie als in de app, dus
-- elke bestelling is ook een geboekte factuur in de administratie.

do $$
declare
  v_club    uuid := '00000000-0000-0000-0000-0000000c0001';
  v_course  uuid := '00000000-0000-0000-0000-0000000f0001';
  v_players uuid[] := array['00000000-0000-0000-0000-0000000e0001', '00000000-0000-0000-0000-0000000e0002',
                            '00000000-0000-0000-0000-0000000e0005', '00000000-0000-0000-0000-0000000e0004']::uuid[];
  v_times   time[] := array['08:02', '09:06', '10:58', '14:02']::time[];
  -- Introducés: veel verschillende gasten (elk een paar keer), plus twee vaste maatjes van Jan
  v_first   text[] := array['Ruud', 'Inge', 'Tom', 'Fleur', 'Koen', 'Sophie', 'Daan', 'Eva', 'Lars', 'Noor', 'Thijs', 'Anouk'];
  v_last    text[] := array['Koster', 'Smit', 'Hendriks', 'Dekker', 'Bos', 'Vos', 'Peters', 'Jacobs', 'Meijer', 'Visser', 'Kok'];
  v_g1      text;
  v_g2      text;
  v_lotte   int := 0;
  v_bas     int := 0;
  v_day     date;
  v_booking uuid;
  v_member  uuid;
  v_order   orders;
  p         record;
  d int; j int;
begin
  select
    max(id::text) filter (where name = 'Buggy')::uuid                        as buggy,
    max(id::text) filter (where name = 'Greenfee introducé')::uuid           as greenfee,
    max(id::text) filter (where name = 'Privéles bij de pro (30 min)')::uuid as lesson,
    max(id::text) filter (where name = 'Kluisje in de kleedkamer')::uuid     as locker,
    max(id::text) filter (where name = 'Stalling tas en trolley')::uuid      as storage,
    max(id::text) filter (where name = 'Wedstrijddiner')::uuid               as diner
  into p from products where club_id = v_club;

  -- Seizoenshuur, afgesloten via de app
  perform create_order_internal('00000000-0000-0000-0000-0000000e0001', jsonb_build_array(jsonb_build_object('product_id', p.locker)), null, null, current_date - 40, null, current_date - 40);
  perform create_order_internal('00000000-0000-0000-0000-0000000e0002', jsonb_build_array(jsonb_build_object('product_id', p.storage)), null, null, current_date - 38, null, current_date - 38);
  perform create_order_internal('00000000-0000-0000-0000-0000000e0005', jsonb_build_array(jsonb_build_object('product_id', p.storage)), null, null, current_date - 21, null, current_date - 21);
  perform create_order_internal('00000000-0000-0000-0000-0000000e0003', jsonb_build_array(jsonb_build_object('product_id', p.locker)), null, null, current_date - 9, null, current_date - 9);

  for d in 1..42 loop
    v_day := current_date - d;
    for j in 1..4 loop
      v_member := v_players[((d + j) % 4) + 1];

      insert into tee_bookings (club_id, course_id, starts_at)
      values (v_club, v_course, (v_day + v_times[j])::timestamp at time zone 'Europe/Amsterdam')
      returning id into v_booking;
      insert into tee_booking_players (booking_id, member_id) values (v_booking, v_member);
      v_g1 := v_first[((d * 8 + j * 2) % 12) + 1] || ' ' || v_last[(((d * 8 + j * 2) * 7) % 11) + 1];
      v_g2 := v_first[((d * 8 + j * 2 + 1) % 12) + 1] || ' ' || v_last[(((d * 8 + j * 2 + 1) * 7) % 11) + 1];
      if v_member = '00000000-0000-0000-0000-0000000e0001' and v_lotte < 4 then
        v_g1 := 'Lotte de Graaf'; v_lotte := v_lotte + 1;
      elsif v_member = '00000000-0000-0000-0000-0000000e0001' and v_bas < 3 then
        v_g1 := 'Bas Mulder'; v_bas := v_bas + 1;
      end if;
      insert into tee_booking_players (booking_id, guest_name) values (v_booking, v_g1), (v_booking, v_g2);

      -- Wat leden rond hun ronde regelen: buggy en de greenfee van hun introducés
      if j = 1 or (j = 3 and d % 2 = 0) then
        perform create_order_internal(v_member, jsonb_build_array(
          jsonb_build_object('product_id', p.buggy, 'quantity', 1),
          jsonb_build_object('product_id', p.greenfee, 'quantity', 2)), v_booking, null, v_day, null, v_day);
      elsif j = 2 or (j = 4 and d % 3 = 0) then
        perform create_order_internal(v_member, jsonb_build_array(
          jsonb_build_object('product_id', p.greenfee, 'quantity', 2)), v_booking, null, v_day, null, v_day);
      end if;
    end loop;

    -- Pieter (Handicart-pas) speelt doordeweeks met een buggy tegen het Handicart-tarief
    if extract(isodow from v_day) < 6 and d % 2 = 1 then
      insert into tee_bookings (club_id, course_id, starts_at)
      values (v_club, v_course, (v_day + time '12:10')::timestamp at time zone 'Europe/Amsterdam')
      returning id into v_booking;
      insert into tee_booking_players (booking_id, member_id) values (v_booking, '00000000-0000-0000-0000-0000000e0003');
      perform create_order_internal('00000000-0000-0000-0000-0000000e0003', jsonb_build_array(
        jsonb_build_object('product_id', p.buggy, 'quantity', 1)), v_booking, null, v_day, null, v_day);
    end if;

    -- Lessen bij de pro
    if d % 3 = 0 then
      perform create_order_internal('00000000-0000-0000-0000-0000000e0003', jsonb_build_array(
        jsonb_build_object('product_id', p.lesson, 'quantity', 1)), null, null, v_day, null, v_day);
    end if;
  end loop;

  -- Wedstrijddiners bij de Septembermedal (via inschrijving in de app)
  for v_member in select member_id from competition_entries e join competitions c on c.id = e.competition_id
                  where c.name = 'Septembermedal' and e.member_id <> '00000000-0000-0000-0000-0000000e0004' loop
    perform create_order_internal(v_member, jsonb_build_array(jsonb_build_object('product_id', p.diner)),
      null, (select id from competitions where name = 'Septembermedal'), null, null, current_date - 13);
  end loop;

  -- Alles in het verleden is geleverd. Leden met machtiging zijn via de wekelijkse incasso betaald,
  -- de rest binnen twee weken via iDEAL.
  update orders set status = 'fulfilled', fulfilled_at = (fulfil_on + time '18:00')::timestamp at time zone 'Europe/Amsterdam'
  where club_id = v_club and fulfil_on < current_date;

  insert into payments (club_id, invoice_id, amount_cents, method, paid_on, reference)
  select i.club_id, i.id, i.total_cents,
         case when i.collect_by_direct_debit then 'sepa_direct_debit' else 'ideal' end::payment_method,
         i.issue_date + case when i.collect_by_direct_debit then 5 else 2 end,
         case when i.collect_by_direct_debit then 'Wekelijkse incasso' else 'iDEAL via de app' end
  from orders o join invoices i on i.id = o.invoice_id
  where o.club_id = v_club and i.status = 'open'
    and i.issue_date < current_date - case when i.collect_by_direct_debit then 5 else 14 end;
end $$;

-- Leads die via de app binnenkwamen
insert into leads (club_id, member_id, type, name, email, phone, note, membership_type_id, value_cents, status, created_at) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0003', 'upgrade', 'Pieter van den Berg', 'pieter@example.test', null,
   'Wil ook in het weekend spelen.', '00000000-0000-0000-0000-0000000d0001', 60000, 'new', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'referral', 'Ruud Koster', 'ruud@example.test', '06-11122233',
   'Speelt al een paar keer als introducé mee, handicap 18.', '00000000-0000-0000-0000-0000000d0001', 235000, 'contacted', now() - interval '9 days'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0005', 'referral', 'Inge Smit', 'inge@example.test', null,
   'Net haar GVB gehaald.', '00000000-0000-0000-0000-0000000d0001', 235000, 'won', now() - interval '21 days'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0005', 'lesson', 'Mohammed el Amrani', 'mohammed@example.test', null,
   'Wil werken aan zijn drive.', null, 4500, 'new', now() - interval '1 day');

-- Gezinslid aangemeld via de app
insert into leads (club_id, member_id, type, name, email, phone, note, membership_type_id, value_cents, status, created_at) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'family', 'Marieke de Vries', 'marieke@example.test', '06-98765432',
   'Partner van Jan de Vries, geboren 03-09-1970 (56 jaar)', '00000000-0000-0000-0000-0000000d0005', 154500, 'new', now() - interval '3 days');

-- Opzeggen in de app: twee leden kozen voor een alternatief, één zegde toch op
insert into membership_changes (club_id, member_id, kind, target_membership_type_id, effective_date, reason, from_cancel_flow, status, handled_at, created_at) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0002', 'pause', '00000000-0000-0000-0000-0000000d0006',
   date_trunc('month', current_date + interval '1 month')::date, 'Blessure of gezondheid', true, 'requested', null, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0005', 'switch', '00000000-0000-0000-0000-0000000d0002',
   make_date(extract(year from current_date)::int + 1, 1, 1), 'Ik speel vooral doordeweeks', true, 'approved', now() - interval '10 days', now() - interval '12 days');

update sponsors set clicks = case name when 'Duinzicht Makelaardij' then 47 when 'Autobedrijf Van Leeuwen' then 31 else 62 end
where club_id = '00000000-0000-0000-0000-0000000c0001';

-- Vandaag op de baan (voor Mission control): leden met gasten en greenfeespelers, wie al gestart is staat ingecheckt
do $$
declare
  v_club    uuid := '00000000-0000-0000-0000-0000000c0001';
  v_duin    uuid := '00000000-0000-0000-0000-0000000f0001';
  v_par3    uuid := '00000000-0000-0000-0000-0000000f0002';
  v_names   text[] := array['Joost Brouwer', 'Ilse Kramer', 'Marco de Wit', 'Petra Dijkstra', 'Wouter Schouten', 'Nina Verbeek',
                            'Gerard Hoekstra', 'Linda Post', 'Hans Kuipers', 'Yvonne Mulder', 'Ferry Timmer', 'Anja de Boer'];
  v_booking uuid;
  v_buggy   uuid;
  k int; i int := 0;
  -- Duinbaan: minuten na 07:30 (raster van 8 minuten) met eventueel een lid
  v_slots int[]  := array[0, 1, 3, 4, 5, 7, 9, 12, 14, 17, 20, 23, 26, 29, 33, 37, 41, 45, 49, 50, 54, 58, 62];
  v_member uuid;
begin
  select id into v_buggy from products where club_id = v_club and name = 'Buggy';
  foreach k in array v_slots loop
    i := i + 1;
    v_member := case k when 4 then '00000000-0000-0000-0000-0000000e0001'::uuid when 5 then '00000000-0000-0000-0000-0000000e0002'::uuid
                       when 12 then '00000000-0000-0000-0000-0000000e0004'::uuid when 26 then '00000000-0000-0000-0000-0000000e0005'::uuid
                       when 49 then '00000000-0000-0000-0000-0000000e0001'::uuid when 50 then '00000000-0000-0000-0000-0000000e0002'::uuid
                       else null end;
    insert into tee_bookings (club_id, course_id, starts_at)
    values (v_club, v_duin, (current_date + time '07:30' + make_interval(mins => k * 8))::timestamp at time zone 'Europe/Amsterdam')
    returning id into v_booking;
    if v_member is not null then
      insert into tee_booking_players (booking_id, member_id) values (v_booking, v_member);
    end if;
    insert into tee_booking_players (booking_id, guest_name)
    select v_booking, v_names[((i * 3 + g) % 12) + 1] from generate_series(1, case when k % 3 = 0 then 3 when v_member is null then 2 else 1 end) g;
    if v_member is not null and k in (4, 26) then
      perform create_order_internal(v_member, jsonb_build_array(jsonb_build_object('product_id', v_buggy, 'quantity', 1)),
        v_booking, null, current_date, null, current_date);
    end if;
  end loop;
  -- Par-3: een paar korte rondes
  foreach k in array array[2, 6, 10, 21, 30, 44] loop
    i := i + 1;
    insert into tee_bookings (club_id, course_id, starts_at)
    values (v_club, v_par3, (current_date + time '08:00' + make_interval(mins => k * 8))::timestamp at time zone 'Europe/Amsterdam')
    returning id into v_booking;
    insert into tee_booking_players (booking_id, guest_name)
    select v_booking, v_names[((i * 5 + g) % 12) + 1] from generate_series(1, 2) g;
  end loop;
  -- Wie al gestart is, heeft zich gemeld
  update tee_booking_players p set checked_in = true
  from tee_bookings b where b.id = p.booking_id and b.club_id = v_club
    and b.starts_at <= now() and b.starts_at >= current_date::timestamp at time zone 'Europe/Amsterdam';
end $$;

-- Een openstaande conceptfactuur en een nieuwe aanmelding van vandaag
insert into leads (club_id, member_id, type, name, email, note, membership_type_id, value_cents, status, created_at) values
  ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0002', 'referral', 'Karin Smits', 'karin@example.test',
   'Speelde twee keer mee met Sanne, wil graag een proefles.', '00000000-0000-0000-0000-0000000d0001', 235000, 'new', now() - interval '2 hours');

-- Tijdstippen zoals in het echt: bestellingen op de dag zelf, betalingen op de betaaldatum
update orders set created_at = least(now() - interval '5 minutes', (fulfil_on + time '07:15')::timestamp at time zone 'Europe/Amsterdam'
  + make_interval(mins => (abs(hashtext(id::text)) % 600)))
where club_id = '00000000-0000-0000-0000-0000000c0001';
update payments set created_at = (paid_on + time '09:00')::timestamp at time zone 'Europe/Amsterdam' + make_interval(mins => (abs(hashtext(id::text)) % 480))
where club_id = '00000000-0000-0000-0000-0000000c0001' and paid_on < current_date;

-- -----------------------------------------------------------------------------
-- Greenside HQ: vier andere (verzonnen) klanten, zodat het overzicht over meerdere clubs gaat
-- -----------------------------------------------------------------------------
do $$
declare
  r         record;
  v_club    uuid;
  v_course  uuid;
  v_type    uuid;
  v_booking uuid;
  v_members uuid[];
  v_first   text[] := array['Anne', 'Bart', 'Carla', 'Dirk', 'Els', 'Frank', 'Greet', 'Henk', 'Ineke', 'Joop', 'Karin', 'Luuk',
                            'Marja', 'Niels', 'Olga', 'Paul', 'Rianne', 'Sjaak', 'Truus', 'Victor'];
  v_last    text[] := array['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder',
                            'de Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'Dekker', 'Brouwer', 'de Wit', 'Dijkstra', 'Smits', 'van Leeuwen'];
  v_buggy   uuid;
  v_fee     uuid;
  d int; f int; j int; n int; idx int; v_users int;
begin
  for r in select * from (values
    ('00000000-0000-0000-0000-0000000c0002'::uuid, 'het-woud',      'Golfclub Het Woud',       'Ede',        'actief',  420, null::int, 39900, 720, 22, 0, true,  0.55),
    ('00000000-0000-0000-0000-0000000c0003'::uuid, 'de-polder',     'Golfbaan De Polder',      'Zoetermeer', 'actief',  150, null::int, 29900, 480, 12, 0, false, 0.38),
    ('00000000-0000-0000-0000-0000000c0004'::uuid, 'rijnoever',     'Golfsociëteit Rijnoever', 'Arnhem',     'pilot',    40, 20,        39900, 310,  4, 0, true,  0.12),
    ('00000000-0000-0000-0000-0000000c0005'::uuid, 'heideveld',     'Golfclub Heideveld',      'Hilversum',  'actief',  300, null::int, 49900, 900, 15, 9, true,  0.45)
  ) as t(id, slug, name, city, status, since_days, pilot_days, fee, member_count, flights_per_day, quiet_days, bank, app_share)
  loop
    v_club := r.id;
    insert into clubs (id, slug, name, city, email, iban, sepa_creditor_id, greenside_status, greenside_since, greenside_pilot_until, greenside_fee_cents)
    values (v_club, r.slug, r.name, r.city, 'info@' || r.slug || '.test',
            case when r.bank then 'NL20INGB0001234567' end, case when r.bank then 'NL00ZZZ409876540000' end,
            r.status, current_date - r.since_days, case when r.pilot_days is not null then current_date + r.pilot_days end, r.fee);
    insert into courses (club_id, name, holes, first_tee_time, last_tee_time, interval_minutes, max_players, round_minutes)
    values (v_club, '18 holes', 18, '07:30', '17:00', 8, 4, 240) returning id into v_course;
    insert into membership_types (club_id, name, annual_fee_cents, can_book_weekend) values (v_club, 'A-lid', 145000, true)
    returning id into v_type;

    insert into members (club_id, member_number, first_name, last_name, membership_type_id, join_date)
    select v_club, (2000 + g)::text, v_first[(g % 20) + 1], v_last[((g * 7) % 21) + 1], v_type, current_date - (g % 3000)
    from generate_series(1, r.member_count) g;
    select array_agg(id order by member_number) into v_members from members where club_id = v_club;
    -- Alleen een deel van de leden gebruikt de app (al)
    v_users := greatest(1, round(r.member_count * r.app_share)::int);

    -- Zelfde aanbod als De Duinen (prijzen kiest de club later zelf)
    insert into products (club_id, category, name, description, price_cents, vat_rate, icon, sort, active, capacity, capacity_scope,
                          handicart_price_cents, pickup_note, grants_kind, grants_uses, grants_days, guest_rate)
    select v_club, category, name, description, price_cents, vat_rate, icon, sort, active, capacity, capacity_scope,
           handicart_price_cents, pickup_note, grants_kind, grants_uses, grants_days, guest_rate
    from products where club_id = '00000000-0000-0000-0000-0000000c0001';
    select id into v_buggy from products where club_id = v_club and name = 'Buggy';
    select id into v_fee from products where club_id = v_club and guest_rate = 'intro';

    -- Dertig dagen spelen; een stille club heeft de laatste dagen niets meer
    n := 0;
    for d in (r.quiet_days + 1)..30 loop
      for f in 0..(r.flights_per_day - 1) loop
        insert into tee_bookings (club_id, course_id, starts_at)
        values (v_club, v_course, (current_date - d + time '07:30' + make_interval(mins => f * 16))::timestamp at time zone 'Europe/Amsterdam')
        returning id into v_booking;
        for j in 1..3 loop
          idx := ((d * r.flights_per_day * 3 + f * 3 + j) % v_users) + 1;
          insert into tee_booking_players (booking_id, member_id) values (v_booking, v_members[idx]);
        end loop;
        insert into tee_booking_players (booking_id, guest_name) values (v_booking, 'Gast ' || v_first[((d + f) % 20) + 1]);
        -- Een deel regelt buggy of greenfee in de app
        n := n + 1;
        if n % 3 = 0 then
          perform create_order_internal(v_members[idx], jsonb_build_array(
            jsonb_build_object('product_id', case when n % 2 = 0 then v_buggy else v_fee end, 'quantity', 1)),
            v_booking, null, current_date - d, null, current_date - d);
        end if;
      end loop;
    end loop;
  end loop;

  update orders set status = 'fulfilled', created_at = (fulfil_on + time '08:00')::timestamp at time zone 'Europe/Amsterdam'
  where club_id <> '00000000-0000-0000-0000-0000000c0001' and fulfil_on < current_date;
end $$;

-- Verkoop: clubs waarmee Greenside in gesprek is
insert into hq_prospects (club_name, city, members_estimate, stage, monthly_value_cents, contact_name, contact_email, next_step, next_date, notes) values
  ('Golfclub Zeegezicht',     'Zandvoort',  850, 'proefperiode', 49900, 'Marleen Voskuil', 'secretariaat@zeegezicht.test', 'Evaluatiegesprek na proefmaand', current_date + 3, 'Enthousiast over Handicart en de takenlijst.'),
  ('Golfbaan Kastelenroute',  'Doorn',      620, 'demo',         39900, 'Rob Hoogland',    'bestuur@kastelenroute.test',   'Demo aan bestuur geven',         current_date + 6, 'Huidig systeem: e-golf4u, contract loopt tot 1 januari.'),
  ('Golfclub De Lage Vuursche','Baarn',     540, 'demo',         39900, 'Anja Terpstra',   'info@lagevuursche.test',       'Offerte sturen',                 current_date - 2, 'Vroeg naar koppeling met de NGF.'),
  ('Golfvereniging Maasdal',  'Venlo',      410, 'lead',         29900, 'Tom Peeters',     'penningmeester@maasdal.test',  'Eerste belafspraak',             current_date + 1, 'Via de penningmeester van Het Woud.'),
  ('Golfclub Waddenkust',     'Leeuwarden', 380, 'lead',         29900, null,              null,                           'Contactpersoon zoeken',          null,             'Veel weekdagleden: weekend-add-on is interessant.'),
  ('Golfsociëteit Veluwezoom','Rheden',     700, 'gewonnen',     39900, 'Pieter Wolters',  'bestuur@veluwezoom.test',      'Onboarding plannen',             current_date + 10, 'Start per 1 november.'),
  ('Golfclub Brabantse Heide','Tilburg',    560, 'verloren',     39900, 'Els van Dam',     'info@brabantseheide.test',     null,                             null,             'Kiest voorlopig voor bestaande leverancier; over een jaar opnieuw.');
