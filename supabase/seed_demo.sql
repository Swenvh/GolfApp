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
  v_guests  text[] := array['Ruud Koster', 'Inge Smit', 'Bas Mulder', 'Lotte de Graaf', 'Tom Hendriks', 'Fleur Dekker'];
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
      insert into tee_booking_players (booking_id, guest_name)
      values (v_booking, v_guests[((d + j) % 6) + 1]), (v_booking, v_guests[((d + j + 3) % 6) + 1]);

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
