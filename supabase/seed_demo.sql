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
    max(id::text) filter (where name = 'E-buggy')::uuid                   as buggy,
    max(id::text) filter (where name = 'Elektrische trolley')::uuid       as trolley,
    max(id::text) filter (where name = 'Range-emmer (50 ballen)')::uuid   as range,
    max(id::text) filter (where name = 'Greenfee introducé')::uuid        as greenfee,
    max(id::text) filter (where name = 'Privéles bij de pro (30 min)')::uuid as lesson,
    max(id::text) filter (where name = 'Lunch na je ronde')::uuid         as lunch,
    max(id::text) filter (where name = 'Borrelplank voor de flight')::uuid as borrel,
    max(id::text) filter (where name = 'Titleist Pro V1 (12 ballen)')::uuid as balls
  into p from products where club_id = v_club;

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

      -- Wat leden rond hun ronde bestellen (niet iedere keer iets)
      if j = 1 then
        perform create_order_internal(v_member, jsonb_build_array(
          jsonb_build_object('product_id', p.buggy, 'quantity', 1),
          jsonb_build_object('product_id', p.range, 'quantity', 1)), v_booking, null, v_day, null, v_day);
      elsif j = 2 then
        perform create_order_internal(v_member, jsonb_build_array(
          jsonb_build_object('product_id', p.greenfee, 'quantity', 2),
          jsonb_build_object('product_id', p.lunch, 'quantity', 1)), v_booking, null, v_day, null, v_day);
      elsif j = 3 and d % 2 = 0 then
        perform create_order_internal(v_member, jsonb_build_array(
          jsonb_build_object('product_id', p.trolley, 'quantity', 1)), v_booking, null, v_day, null, v_day);
      elsif j = 4 and d % 3 = 0 then
        perform create_order_internal(v_member, jsonb_build_array(
          jsonb_build_object('product_id', p.borrel, 'quantity', 1),
          jsonb_build_object('product_id', p.greenfee, 'quantity', 1)), v_booking, null, v_day, null, v_day);
      end if;
    end loop;

    -- Losse aankopen: lessen en de proshop
    if d % 3 = 0 then
      perform create_order_internal('00000000-0000-0000-0000-0000000e0003', jsonb_build_array(
        jsonb_build_object('product_id', p.lesson, 'quantity', 1)), null, null, v_day, null, v_day);
    end if;
    if d % 5 = 0 then
      perform create_order_internal('00000000-0000-0000-0000-0000000e0002', jsonb_build_array(
        jsonb_build_object('product_id', p.balls, 'quantity', 1)), null, null, v_day, null, v_day);
    end if;
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
