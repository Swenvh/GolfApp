-- Database-tests: boekhouding in balans, factuurflow, incasso en RLS-afscherming.
-- Draait na migraties + seed (zie run-local.sh). Faalt met een exception.

create or replace function pg_temp.assert(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;

-- Testdag: de eerstvolgende woensdag, minstens twee dagen vooruit (geen weekendregels, altijd in de toekomst)
create or replace function pg_temp.test_day() returns date language sql stable as $$
  select current_date + 2 + ((3 - extract(isodow from current_date + 2)::int + 7) % 7)
$$;
-- Tijdstip op de testdag in Nederlandse tijd
create or replace function pg_temp.at(t time, d date default null) returns timestamptz language sql stable as $$
  select (coalesce(d, pg_temp.test_day()) + t)::timestamp at time zone 'Europe/Amsterdam'
$$;

-- 1. Seed: contributiefacturen zijn aangemaakt, genummerd en geboekt ------------
select pg_temp.assert((select count(*) from invoices where status in ('open','paid')) = 5, 'vijf contributiefacturen');
select pg_temp.assert((select count(*) from invoices where invoice_number is null) = 0, 'alle facturen hebben een nummer');
select pg_temp.assert(
  (select sum(debit_cents) = sum(credit_cents) from journal_lines), 'grootboek als geheel in balans');
select pg_temp.assert(
  (select status from invoices where member_id = '00000000-0000-0000-0000-0000000e0003') = 'paid',
  'betaalde factuur staat op paid');
select pg_temp.assert(
  (select balance_cents from ledger_balances where code = '1300'
     and club_id = '00000000-0000-0000-0000-0000000c0001')
  = (select sum(total_cents - paid_cents) from invoices where status = 'open'),
  'saldo debiteuren = openstaande facturen');

-- 2. Nieuwe factuur met BTW, afronding en korting --------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);
set role authenticated;

insert into invoices (club_id, member_id, description)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0002', 'Greenfeekaart + lessen');
with inv as (select id from invoices where description = 'Greenfeekaart + lessen')
insert into invoice_lines (invoice_id, description, quantity, unit_price_cents, vat_rate, ledger_account_id)
select inv.id, d, q, p, v, (select id from ledger_accounts where code = c and club_id = '00000000-0000-0000-0000-0000000c0001')
from inv, (values
  ('Golfles 30 min', 3::numeric, 3250::bigint, 21::numeric, '8300'),
  ('Greenfee gast',  1, 7500, 9, '8100'),
  ('Korting',        1, -1000, 21, '8300')
) as l(d, q, p, v, c);

select pg_temp.assert(
  (select (subtotal_cents, vat_cents, total_cents) = (16250::bigint, 2513::bigint, 18763::bigint)
   from invoices where description = 'Greenfeekaart + lessen'),
  'factuurtotalen incl. BTW 21%/9% en korting');

select finalize_invoice(id) from invoices where description = 'Greenfeekaart + lessen';
select pg_temp.assert(
  (select invoice_number like extract(year from now())::text || '-%' from invoices where description = 'Greenfeekaart + lessen'),
  'factuurnummer toegekend');

-- Definitieve factuur mag niet meer wijzigen
do $$ begin
  begin
    insert into invoice_lines (invoice_id, description, unit_price_cents)
    select id, 'extra', 100 from invoices where description = 'Greenfeekaart + lessen';
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Deelbetaling via iDEAL en daarna restant
insert into payments (club_id, invoice_id, amount_cents, method, created_by)
select club_id, id, 10000, 'ideal', auth.uid() from invoices where description = 'Greenfeekaart + lessen';
select pg_temp.assert((select status from invoices where description = 'Greenfeekaart + lessen') = 'open', 'deelbetaling -> open');
insert into payments (club_id, invoice_id, amount_cents, method, created_by)
select club_id, id, 8763, 'bank_transfer', auth.uid() from invoices where description = 'Greenfeekaart + lessen';
select pg_temp.assert((select status from invoices where description = 'Greenfeekaart + lessen') = 'paid', 'volledig betaald -> paid');

-- 3. SEPA-incasso ------------------------------------------------------------------
select create_direct_debit_batch('00000000-0000-0000-0000-0000000c0001', current_date + 7);
select pg_temp.assert((select item_count from direct_debit_batches) = 3, 'incassobatch bevat 3 leden met mandaat');
select pg_temp.assert((select count(*) from direct_debit_items where sequence_type = 'FRST') = 3, 'eerste incasso = FRST');
select process_direct_debit_batch(id) from direct_debit_batches;
select pg_temp.assert((select count(*) from sepa_mandates where first_collected) = 3, 'mandaten nu RCUR');
select pg_temp.assert(
  (select count(*) from invoices where collect_by_direct_debit and status = 'paid') = 3, 'incassofacturen betaald');

-- 4. Crediteren ------------------------------------------------------------------
select cancel_invoice(id, 'Lid opgezegd') from invoices where member_id = '00000000-0000-0000-0000-0000000e0004';
select pg_temp.assert(
  (select status from invoices where member_id = '00000000-0000-0000-0000-0000000e0004') = 'cancelled', 'factuur gecrediteerd');

reset role;
select pg_temp.assert((select sum(debit_cents) = sum(credit_cents) from journal_lines), 'grootboek blijft in balans');
select pg_temp.assert(
  (select balance_cents from ledger_balances where code = '1300'
     and club_id = '00000000-0000-0000-0000-0000000c0001')
  = (select coalesce(sum(total_cents - paid_cents), 0) from invoices where status = 'open'),
  'debiteurensaldo sluit aan na alle mutaties');
select pg_temp.assert((select count(*) from audit_log where table_name = 'invoices') > 0, 'audit-log gevuld');

-- 5. RLS: een gewoon lid ---------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;

select pg_temp.assert((select count(*) from members) = 1, 'lid ziet alleen eigen ledenrecord');
select pg_temp.assert((select count(*) from club_directory('00000000-0000-0000-0000-0000000c0001')) = 5, 'lid ziet ledenlijst (beperkt)');
select pg_temp.assert((select count(*) from invoices) = 1, 'lid ziet alleen eigen facturen');
select pg_temp.assert((select count(*) from journal_lines) = 0, 'lid ziet geen grootboek');
select pg_temp.assert((select count(*) from ledger_balances) = 0, 'lid ziet geen grootboeksaldi');
select pg_temp.assert((select count(*) from news_posts) = 3, 'lid ziet nieuws');

-- Starttijd boeken en flight-limiet
insert into tee_bookings (club_id, course_id, starts_at, created_by)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000f0001',
        pg_temp.at('10:02'), auth.uid());
insert into tee_booking_players (booking_id, member_id, guest_name)
select b.id, m, g from (select id from tee_bookings where created_by = auth.uid()) b,
  (values ('00000000-0000-0000-0000-0000000e0001'::uuid, null::text),
          ('00000000-0000-0000-0000-0000000e0002', null),
          (null, 'Gast 1'), (null, 'Gast 2')) as p(m, g);
do $$ begin
  begin
    insert into tee_booking_players (booking_id, guest_name) select id, 'Vijfde speler' from tee_bookings where created_by = auth.uid();
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Lid kan geen facturen aanmaken of betalingen boeken
do $$ begin
  begin
    insert into invoices (club_id, member_id) values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
do $$ begin
  begin
    perform finalize_invoice((select id from invoices limit 1));
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Lid kan inschrijven voor een open wedstrijd
insert into competition_entries (competition_id, member_id)
select id, '00000000-0000-0000-0000-0000000e0001' from competitions where name = 'Dinsdagmiddag Stableford';

reset role;

-- 6. Starttijdenlijst toont namen aan leden ------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
select pg_temp.assert(
  (select count(*) from tee_sheet('00000000-0000-0000-0000-0000000f0001', pg_temp.test_day())) = 4,
  'tee_sheet geeft 4 spelers');
select pg_temp.assert(
  (select bool_or(player_name = 'Sanne Jansen') from tee_sheet('00000000-0000-0000-0000-0000000f0001', pg_temp.test_day())),
  'naam medespeler zichtbaar');
select pg_temp.assert(
  (select count(*) from competition_participants((select id from competitions where name = 'Dinsdagmiddag Stableford'))) = 1,
  'deelnemerslijst zichtbaar');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000ffff', false);
set role authenticated;
select pg_temp.assert(
  (select count(*) from tee_sheet('00000000-0000-0000-0000-0000000f0001', pg_temp.test_day())) = 0,
  'niet-lid ziet geen starttijden');
select pg_temp.assert((select count(*) from clubs) = 0, 'niet-lid ziet geen club');
reset role;

-- 7. Geen dubbele boekingen: rondes van hetzelfde lid mogen niet overlappen -------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;

-- Sanne staat om 10:02 op de Duinbaan (ronde van 4 uur). Om 12:02 kan niet.
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0001',
      pg_temp.at('12:02'),
      array['00000000-0000-0000-0000-0000000e0002'::uuid]);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like 'Sanne Jansen staat al ingeschreven om %' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;
-- Mislukte boeking laat geen lege flight achter (alles in één transactie)
select pg_temp.assert(
  not exists (select 1 from tee_bookings where starts_at = pg_temp.at('12:02')),
  'mislukte boeking laat geen lege flight achter');

-- Ook op een andere baan telt de overlap (par-3 om 13:04 valt binnen de ronde van 10:02)
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0002',
      pg_temp.at('13:04'),
      array['00000000-0000-0000-0000-0000000e0002'::uuid]);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Na afloop van de ronde (14:02) mag het wel, met een gast erbij
select pg_temp.assert(
  book_tee_time('00000000-0000-0000-0000-0000000f0001',
    pg_temp.at('14:02'),
    array['00000000-0000-0000-0000-0000000e0002'::uuid, '00000000-0000-0000-0000-0000000e0004'::uuid],
    array['Gast Middag']) is not null,
  'boeking na afloop van de vorige ronde lukt');
select pg_temp.assert(
  (select count(*) from tee_booking_players p join tee_bookings b on b.id = p.booking_id
   where b.starts_at = pg_temp.at('14:02')) = 3,
  'flight met twee leden en een gast');

-- Aansluiten bij een bestaande flight via dezelfde functie
select book_tee_time('00000000-0000-0000-0000-0000000f0001',
  pg_temp.at('14:02'), array['00000000-0000-0000-0000-0000000e0005'::uuid]);
select pg_temp.assert(
  (select count(*) from tee_bookings where starts_at = pg_temp.at('14:02')) = 1,
  'aansluiten maakt geen tweede flight');

-- Vijfde speler via de functie: flight vol
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0001',
      pg_temp.at('14:02'), '{}', array['Te veel']);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like 'Deze flight is vol%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;
reset role;

-- Clubkleur bestaat niet meer
select pg_temp.assert(
  not exists (select 1 from information_schema.columns where table_name = 'clubs' and column_name = 'primary_color'),
  'clubkleur is verwijderd');

-- 8. Starttijdenraster (8 minuten) en weekenddagen -------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('10:05'),
      array['00000000-0000-0000-0000-0000000e0001'::uuid]);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like 'Geen geldige starttijd%elke 8 minuten%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;

-- Pieter is weekdaglid: zaterdag niet, woensdag wel
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0001',
      pg_temp.at('16:02', pg_temp.test_day() + 3), array['00000000-0000-0000-0000-0000000e0003'::uuid]);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like '%niet in het weekend%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;
select pg_temp.assert(
  book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('16:02'),
    array['00000000-0000-0000-0000-0000000e0003'::uuid]) is not null,
  'weekdaglid kan doordeweeks boeken');

-- 9. Upsells: bestellen bij een starttijd -------------------------------------------------
-- Jan staat om 10:02 in de flight (zie 5). Buggy + greenfee voor zijn introducé.
select pg_temp.assert(
  (select total_cents from place_order('00000000-0000-0000-0000-0000000e0001',
     jsonb_build_array(
       jsonb_build_object('product_id', (select id from products where name = 'Buggy'), 'quantity', 1),
       jsonb_build_object('product_id', (select id from products where name = 'Greenfee introducé'), 'quantity', 1)),
     (select b.id from tee_bookings b where b.starts_at = pg_temp.at('10:02')))) = 10000,
  'bestelling: buggy 40,00 + greenfee introducé 60,00 incl. btw');
select pg_temp.assert(
  (select (i.status, i.collect_by_direct_debit, i.invoice_number is not null)::text from orders o join invoices i on i.id = o.invoice_id
   where o.member_id = '00000000-0000-0000-0000-0000000e0001' order by o.created_at desc limit 1) = '(open,t,t)',
  'bestelling is een definitieve factuur die via incasso loopt');

-- Niet bestellen op andermans flight
do $$ begin
  begin
    perform place_order('00000000-0000-0000-0000-0000000e0001',
      jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Buggy'))),
      (select b.id from tee_bookings b where b.starts_at = pg_temp.at('16:02')));
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Beperkte vloot: 8 buggy's, per tijdvak geteld. Rond 10:02 is er al 1 weg.
do $$ begin
  begin
    perform place_order('00000000-0000-0000-0000-0000000e0001',
      jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Buggy'), 'quantity', 8)),
      (select b.id from tee_bookings b where b.starts_at = pg_temp.at('10:02')));
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like 'Nog maar 7 × Buggy beschikbaar rond deze starttijd%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;
select pg_temp.assert(
  (select remaining from product_availability('00000000-0000-0000-0000-0000000c0001', pg_temp.test_day(), pg_temp.at('12:02'))
   where product_id = (select id from products where name = 'Buggy')) = 7,
  'om 12:02 rijdt de buggy van 10:02 nog');
select pg_temp.assert(
  (select remaining from product_availability('00000000-0000-0000-0000-0000000c0001', pg_temp.test_day(), pg_temp.at('16:02'))
   where product_id = (select id from products where name = 'Buggy')) = 8,
  'om 16:02 is de buggy van 10:02 weer vrij');

-- Buggy alleen bij een starttijd
do $$ begin
  begin
    perform place_order('00000000-0000-0000-0000-0000000e0001',
      jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Buggy'))));
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like '%reserveer je bij een starttijd%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;

-- Kluisje: seizoensvoorraad van 40
select place_order('00000000-0000-0000-0000-0000000e0001',
  jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Kluisje in de kleedkamer'))));
select pg_temp.assert(
  (select remaining from product_availability('00000000-0000-0000-0000-0000000c0001', current_date)
   where product_id = (select id from products where name = 'Kluisje in de kleedkamer')) = 39,
  'kluisjes tellen per seizoen');

-- Handicart-pas vastleggen door het lid zelf
do $$ begin
  begin
    perform member_set_handicart('00000000-0000-0000-0000-0000000e0001', 'HC-1', 'temporary', null);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
select member_set_handicart('00000000-0000-0000-0000-0000000e0001', 'hc-777', 'temporary', current_date + 100);
select pg_temp.assert((select handicart_pass_number from members where id = '00000000-0000-0000-0000-0000000e0001') = 'HC-777', 'pas vastgelegd');
select member_set_handicart('00000000-0000-0000-0000-0000000e0001', null);
select pg_temp.assert((select handicart_pass_number is null from members where id = '00000000-0000-0000-0000-0000000e0001'), 'pas verwijderd');
do $$ begin
  begin
    perform member_set_handicart('00000000-0000-0000-0000-0000000e0003', 'HC-1');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Pieter (Handicart-pas) krijgt automatisch het Handicart-tarief bij zijn ronde van 16:02
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a003', false);
set role authenticated;
select pg_temp.assert(
  (select total_cents from place_order('00000000-0000-0000-0000-0000000e0003',
     jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Buggy'), 'quantity', 1)),
     (select b.id from tee_bookings b where b.starts_at = pg_temp.at('16:02')))) = 800,
  'Handicart-tarief: 8,00 in plaats van 40,00');
select pg_temp.assert(
  (select bool_and(l.handicart) from order_lines l join orders o on o.id = l.order_id
   where o.member_id = '00000000-0000-0000-0000-0000000e0003' and o.booking_id = (select id from tee_bookings where starts_at = pg_temp.at('16:02'))),
  'regel gemarkeerd als Handicart');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;

-- Leden kunnen niet om de controles heen
do $$ begin
  begin
    perform create_order_internal('00000000-0000-0000-0000-0000000e0002', '[]'::jsonb);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
do $$ begin
  begin
    perform place_order('00000000-0000-0000-0000-0000000e0002',
      jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Kluisje in de kleedkamer'))));
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;

-- Wedstrijd: inschrijfgeld + diner in één bestelling (Jan staat ingeschreven, zie 5)
select pg_temp.assert(
  (select total_cents from place_order('00000000-0000-0000-0000-0000000e0001',
     jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Wedstrijddiner'))),
     null, (select id from competitions where name = 'Dinsdagmiddag Stableford'))) = 4000,
  'inschrijfgeld 5,00 + diner 35,00 incl. btw');

-- Afmelden voor de starttijd annuleert de bijbehorende bestelling en crediteert de factuur
delete from tee_booking_players
where member_id = '00000000-0000-0000-0000-0000000e0001'
  and booking_id = (select id from tee_bookings where starts_at = pg_temp.at('10:02'));
select pg_temp.assert(
  (select (o.status, i.status)::text from orders o join invoices i on i.id = o.invoice_id
   where o.booking_id = (select id from tee_bookings where starts_at = pg_temp.at('10:02'))) = '(cancelled,cancelled)',
  'afmelden annuleert bestelling en factuur');

-- Leads: een vriend introduceren
insert into leads (club_id, member_id, type, name, email)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'referral', 'Karin de Wit', 'karin@example.test');
select pg_temp.assert((select count(*) from leads) = 1, 'lid ziet alleen eigen leads');
do $$ begin
  begin
    insert into leads (club_id, member_id, type, name) values
      ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0002', 'referral', 'Namens een ander');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
reset role;

select pg_temp.assert((select sum(debit_cents) = sum(credit_cents) from journal_lines), 'grootboek in balans na bestellingen');
select pg_temp.assert(
  (select balance_cents from ledger_balances where code = '1300' and club_id = '00000000-0000-0000-0000-0000000c0001')
  = (select coalesce(sum(total_cents - paid_cents), 0) from invoices where status = 'open'),
  'debiteurensaldo sluit aan na bestellingen');

-- 10. Beschikbaarheid zichtbaar voor leden
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
select pg_temp.assert(
  (select remaining from product_availability('00000000-0000-0000-0000-0000000c0001', pg_temp.test_day(), pg_temp.at('10:02'))
   where product_id = (select id from products where name = 'Buggy')) = 8,
  'geannuleerde buggy telt niet mee: 8 beschikbaar');
reset role;

-- 11. Weekendrecht voor weekdagleden -----------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a003', false);
set role authenticated;
-- Pieter koopt een losse weekendronde en kan dan op zaterdag boeken
select place_order('00000000-0000-0000-0000-0000000e0003',
  jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Weekendronde'))));
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0003' and kind = 'weekend') = 1,
  'weekendronde geeft 1 tegoed');
select pg_temp.assert(
  book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('16:02', pg_temp.test_day() + 3),
    array['00000000-0000-0000-0000-0000000e0003'::uuid]) is not null,
  'met weekendronde mag weekdaglid op zaterdag');
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0003' and kind = 'weekend') = 0,
  'weekendronde is verbruikt');
-- Tweede weekendboeking lukt niet meer
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('08:02', pg_temp.test_day() + 4),
      array['00000000-0000-0000-0000-0000000e0003'::uuid]);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
-- Afmelden: de weekendronde komt terug
delete from tee_booking_players where member_id = '00000000-0000-0000-0000-0000000e0003'
  and booking_id = (select id from tee_bookings where starts_at = pg_temp.at('16:02', pg_temp.test_day() + 3));
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0003' and kind = 'weekend') = 1,
  'afmelden geeft de weekendronde terug');
reset role;

-- 12. Introductiekaart, introductielimiet en frequente gasten ---------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
select place_order('00000000-0000-0000-0000-0000000e0001',
  jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Introductiekaart (5 introducés)'))));
select book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('08:02'),
  array['00000000-0000-0000-0000-0000000e0001'::uuid], array['Gast Alfa', 'Gast Beta']);
select pg_temp.assert(
  redeem_intro('00000000-0000-0000-0000-0000000e0001', (select id from tee_bookings where starts_at = pg_temp.at('08:02')), 2) = 2,
  'twee gasten van de introductiekaart afgeboekt');
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0001' and kind = 'intro') = 3,
  'nog 3 introducés op de kaart');
select pg_temp.assert((select rounds from guest_intro_counts('00000000-0000-0000-0000-0000000c0001', array['gast  alfa'])) = 1,
  'introducé geteld (ook met andere schrijfwijze)');
select pg_temp.assert((select intro_limit from guest_intro_counts('00000000-0000-0000-0000-0000000c0001', array['x'])) = 5,
  'limiet van de club');
reset role;

-- Karel speelde al drie keer mee met Jan
insert into tee_bookings (club_id, course_id, starts_at)
select '00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000f0001', pg_temp.at('10:02', current_date - d)
from unnest(array[50, 57, 64]) d;
insert into tee_booking_players (booking_id, member_id)
select id, '00000000-0000-0000-0000-0000000e0001' from tee_bookings
where starts_at in (pg_temp.at('10:02', current_date - 50), pg_temp.at('10:02', current_date - 57), pg_temp.at('10:02', current_date - 64));
insert into tee_booking_players (booking_id, guest_name)
select id, 'Karel Frequent' from tee_bookings
where starts_at in (pg_temp.at('10:02', current_date - 50), pg_temp.at('10:02', current_date - 57), pg_temp.at('10:02', current_date - 64));
set role authenticated;
select pg_temp.assert(
  (select rounds from my_frequent_guests('00000000-0000-0000-0000-0000000e0001') where name = 'Karel Frequent') = 3,
  'frequente gast gevonden');
select pg_temp.assert(
  (select count(*) from my_frequent_guests('00000000-0000-0000-0000-0000000e0003')) = 0,
  'niet voor een ander lid op te vragen');

-- 13. Behouden in plaats van opzeggen ------------------------------------------------------
insert into membership_changes (club_id, member_id, kind, target_membership_type_id, effective_date, reason, from_cancel_flow)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'pause',
        '00000000-0000-0000-0000-0000000d0006', current_date, 'Knieblessure', true);
select pg_temp.assert((select count(*) from membership_changes) = 1, 'lid ziet eigen verzoek');
do $$ begin
  begin
    perform decide_membership_change((select id from membership_changes limit 1), true);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);
set role authenticated;
select decide_membership_change((select id from membership_changes limit 1), true);
reset role;
select pg_temp.assert(
  (select membership_type_id from members where id = '00000000-0000-0000-0000-0000000e0001') = '00000000-0000-0000-0000-0000000d0006',
  'goedgekeurd: Jan is rustend lid');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
do $$ begin
  begin
    perform book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('16:10'), array['00000000-0000-0000-0000-0000000e0001'::uuid]);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like '%staat op rust%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;

-- 14. Sponsors -----------------------------------------------------------------------------
select pg_temp.assert((select count(*) from sponsors) = 3, 'lid ziet actieve sponsors');
select sponsor_click((select id from sponsors where name = 'Duinzicht Makelaardij'));
reset role;
select pg_temp.assert((select clicks from sponsors where name = 'Duinzicht Makelaardij') = 1, 'klik geteld');
update members set membership_type_id = '00000000-0000-0000-0000-0000000d0001' where id = '00000000-0000-0000-0000-0000000e0001';

-- 15. Na code review -----------------------------------------------------------------------
-- Tegoed met gebruik kan niet meer geannuleerd worden (Jans introductiekaart: 2 introducés gebruikt)
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
do $$ begin
  begin
    perform cancel_order((select l.order_id from member_entitlements e join order_lines l on l.id = e.order_line_id
                          where e.member_id = '00000000-0000-0000-0000-0000000e0001' and e.kind = 'intro'));
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
    if sqlerrm not like '%al gebruikt%' then raise exception 'onverwachte fout: %', sqlerrm; end if;
  end;
end $$;
-- Afmelden geeft elk gebruikt introducé-tegoed terug (twee van één kaart)
delete from tee_booking_players where member_id = '00000000-0000-0000-0000-0000000e0001'
  and booking_id = (select id from tee_bookings where starts_at = pg_temp.at('08:02'));
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0001' and kind = 'intro') = 5,
  'afmelden geeft beide introducés terug');
-- Introducés tellen per jaar van de ronde
select pg_temp.assert((select rounds from guest_intro_counts('00000000-0000-0000-0000-0000000c0001', array['Karel Frequent'],
  make_date(extract(year from current_date)::int + 1, 1, 5))) = 0, 'volgend jaar begint de telling opnieuw');
-- Pauzeren zonder nieuwe vorm of met een vorm van buiten de club kan niet
do $$ begin
  begin
    insert into membership_changes (club_id, member_id, kind, effective_date)
    values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'pause', current_date);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
  begin
    insert into membership_changes (club_id, member_id, kind, target_membership_type_id, effective_date)
    values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'switch', gen_random_uuid(), current_date);
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
-- Omzetten per 1 januari: goedkeuren verandert nu nog niets
insert into membership_changes (club_id, member_id, kind, target_membership_type_id, effective_date)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000e0001', 'switch',
        '00000000-0000-0000-0000-0000000d0002', make_date(extract(year from current_date)::int + 1, 1, 1));
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);
set role authenticated;
select decide_membership_change((select id from membership_changes where kind = 'switch' and status = 'requested'
  and member_id = '00000000-0000-0000-0000-0000000e0001'), true);
reset role;
select pg_temp.assert((select membership_type_id from members where id = '00000000-0000-0000-0000-0000000e0001') = '00000000-0000-0000-0000-0000000d0001',
  'omzetten gaat pas in op de ingangsdatum');
update membership_changes set effective_date = current_date where kind = 'switch' and member_id = '00000000-0000-0000-0000-0000000e0001';
select pg_temp.assert(apply_due_membership_changes() = 1, 'nachtelijke taak voert de wijziging door');
select pg_temp.assert((select membership_type_id from members where id = '00000000-0000-0000-0000-0000000e0001') = '00000000-0000-0000-0000-0000000d0002',
  'op de ingangsdatum is Jan weekdaglid');
update members set membership_type_id = '00000000-0000-0000-0000-0000000d0001' where id = '00000000-0000-0000-0000-0000000e0001';
-- Hele starttijd verwijderd (bv. door de marshal): de weekendronde komt terug
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a003', false);
set role authenticated;
select book_tee_time('00000000-0000-0000-0000-0000000f0001', pg_temp.at('16:02', pg_temp.test_day() + 3),
  array['00000000-0000-0000-0000-0000000e0003'::uuid]);
reset role;
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0003' and kind = 'weekend') = 0,
  'weekendronde gebruikt');
delete from tee_bookings where starts_at = pg_temp.at('16:02', pg_temp.test_day() + 3);
select pg_temp.assert((select uses_left from member_entitlements where member_id = '00000000-0000-0000-0000-0000000e0003' and kind = 'weekend') = 1,
  'verwijderde starttijd geeft de weekendronde terug');

-- 16. Prijzen voor leden inclusief btw -------------------------------------------------------
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
select place_order('00000000-0000-0000-0000-0000000e0001',
  jsonb_build_array(jsonb_build_object('product_id', (select id from products where name = 'Greenfee introducé'), 'quantity', 2)));
reset role;
select pg_temp.assert((select total_cents from orders where member_id = '00000000-0000-0000-0000-0000000e0001'
  order by created_at desc limit 1) = 12000, 'twee greenfees van € 60,00 zijn € 120,00');
select pg_temp.assert((select vat_cents from invoices i join orders o on o.invoice_id = i.id
  where o.member_id = '00000000-0000-0000-0000-0000000e0001' order by o.created_at desc limit 1) = 991,
  'btw teruggerekend uit het bedrag incl. btw (9/109 van € 120,00)');
select pg_temp.assert((select i.subtotal_cents + i.vat_cents = i.total_cents from invoices i join orders o on o.invoice_id = i.id
  where o.member_id = '00000000-0000-0000-0000-0000000e0001' order by o.created_at desc limit 1), 'subtotaal + btw = totaal');

-- 17. Greenside HQ: alleen Greenside ziet het overzicht over alle clubs ------------------------
insert into hq_prospects (club_name, stage) values ('Testclub', 'lead');
select set_config('test.club_count', (select count(*)::text from clubs), false);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);  -- clubbeheerder
set role authenticated;
select pg_temp.assert((select count(*) from hq_club_overview()) = 0, 'clubbeheer ziet geen overzicht van andere clubs');
select pg_temp.assert((select count(*) from hq_prospects) = 0, 'clubbeheer ziet de verkooppijplijn niet');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);  -- lid
set role authenticated;
select pg_temp.assert((select count(*) from hq_weekly()) = 0, 'lid ziet geen HQ-cijfers');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a009', false);  -- Greenside
set role authenticated;
select pg_temp.assert((select count(*) from hq_club_overview()) = current_setting('test.club_count')::int, 'Greenside ziet alle clubs');
select pg_temp.assert((select count(*) from clubs) = 0, 'Greenside leest geen clubtabellen direct (alleen totalen)');
select pg_temp.assert((select members from hq_club_overview() where name = 'Golfclub De Duinen') = 5, 'ledental per club');
select pg_temp.assert((select count(*) from hq_weekly(12)) = 12, 'twaalf weken trend');
select pg_temp.assert((select count(*) from hq_prospects) = 1, 'Greenside ziet de pijplijn');
reset role;
delete from hq_prospects;

-- 18. Pilot: leden importeren, account koppelen, club aanmaken -------------------------------
-- Een lid mag niet importeren
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', false);
set role authenticated;
do $$ begin
  begin
    perform import_members('00000000-0000-0000-0000-0000000c0001', '[{"first_name":"X","last_name":"Y"}]');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);  -- beheerder De Duinen
set role authenticated;
-- Eén foute regel: niets geïmporteerd, en de melding noemt de regel
do $$ begin
  begin
    perform import_members('00000000-0000-0000-0000-0000000c0001', '[
      {"_line":"2","first_name":"Anna","last_name":"Import","membership_type":"A-lid (volledig)"},
      {"_line":"3","first_name":"Bert","last_name":"Import","date_of_birth":"31-02-1970"}]');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm not like 'Regel 3:%' then raise; end if;
  end;
end $$;
select pg_temp.assert((select count(*) from members where last_name = 'Import') = 0, 'bij een fout wordt niets geïmporteerd');

-- Onbekend lidmaatschap zonder toestemming om aan te maken
do $$ begin
  begin
    perform import_members('00000000-0000-0000-0000-0000000c0001', '[{"_line":"2","first_name":"Anna","last_name":"Import","membership_type":"Senior"}]');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm not like 'Regel 2: lidmaatschap "Senior" bestaat niet%' then raise; end if;
  end;
end $$;

-- Echte import: twee nieuwe leden (één met machtiging, één zonder lidnummer), één bestaand lid bijgewerkt
select set_config('test.import', import_members('00000000-0000-0000-0000-0000000c0001', '[
  {"_line":"2","member_number":"9001","first_name":"Anna","last_name":"Import","email":"anna.import@example.test",
   "membership_type":"a-lid (volledig)","gender":"female","date_of_birth":"1980-05-01","status":"active",
   "iban":"NL91 ABNA 0417 1643 00","mandate_reference":"IMP-9001","mandate_signed_on":"2020-01-01"},
  {"_line":"3","first_name":"Bert","last_name":"Import","membership_type":"Senior","handicap_index":"-1.5"},
  {"_line":"4","member_number":"1002","first_name":"Sanne","last_name":"Jansen","phone":"06-99999999"}]', true, true)::text, false);
reset role;
select pg_temp.assert((current_setting('test.import')::jsonb->>'inserted')::int = 2, 'twee nieuwe leden');
select pg_temp.assert((current_setting('test.import')::jsonb->>'updated')::int = 1, 'één lid bijgewerkt');
select pg_temp.assert((current_setting('test.import')::jsonb->>'mandates')::int = 1, 'één machtiging');
select pg_temp.assert(current_setting('test.import')::jsonb->'types_created' = '["Senior"]', 'lidmaatschap Senior aangemaakt');
select pg_temp.assert((select iban from members where member_number = '9001') = 'NL91ABNA0417164300', 'IBAN zonder spaties');
select pg_temp.assert((select member_number from members where first_name = 'Bert' and last_name = 'Import') = '9002',
  'regel zonder lidnummer krijgt het volgende vrije nummer');
select pg_temp.assert((select handicap_index from members where member_number = '9002') = -1.5, 'plushandicap als negatief getal');
select pg_temp.assert((select phone from members where member_number = '1002') = '06-99999999'
  and (select email from members where member_number = '1002') = 'sanne@example.test',
  'bijwerken vult aan en wist niets');
select pg_temp.assert((select account_holder from sepa_mandates where mandate_reference = 'IMP-9001') = 'A. Import', 'rekeninghouder afgeleid');

-- Inloggen met een code koppelt het account aan het lid met hetzelfde bevestigde e-mailadres
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-00000000a0a1', 'Anna.Import@example.test', now()),
  ('00000000-0000-0000-0000-00000000a0a2', 'nieuw@pilotclub.test', now());
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a0a1', false);
set role authenticated;
select pg_temp.assert(claim_my_accounts() = '{"members": 1, "staff": 0}', 'account gekoppeld aan het geïmporteerde lid');
select pg_temp.assert((select count(*) from members) = 1, 'na koppelen ziet Anna haar eigen gegevens');
select pg_temp.assert(claim_my_accounts() = '{"members": 0, "staff": 0}', 'nogmaals koppelen doet niets');
reset role;

-- Greenside maakt een club aan; anderen kunnen dat niet
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', false);
set role authenticated;
do $$ begin
  begin
    perform hq_create_club('{"name":"Stiekem","slug":"stiekem","manager_email":"x@y.test"}');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm = 'expected failure' then raise; end if;
  end;
end $$;
reset role;
insert into hq_prospects (club_name, stage) values ('Pilotclub De Heide', 'proefperiode');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a009', false);
set role authenticated;
select set_config('test.club', hq_create_club(jsonb_build_object(
  'name', 'Pilotclub De Heide', 'slug', 'pilotclub-de-heide', 'city', 'Ede', 'layout', '18+9', 'status', 'pilot',
  'fee_cents', 44900, 'manager_email', 'Nieuw@PilotClub.test',
  'prospect_id', (select id from hq_prospects where club_name = 'Pilotclub De Heide')))::text, false);
select pg_temp.assert((select manager_email from hq_club_setup(current_setting('test.club')::uuid)) = 'nieuw@pilotclub.test'
  and not (select manager_joined from hq_club_setup(current_setting('test.club')::uuid)), 'beheerder uitgenodigd, nog niet ingelogd');
select pg_temp.assert((select courses from hq_club_setup(current_setting('test.club')::uuid)) = 2, '18 holes en een par-3 baan');
do $$ begin
  begin
    perform hq_create_club('{"name":"Dubbel","slug":"pilotclub-de-heide","manager_email":"x@y.test"}');
    raise exception 'expected failure';
  exception when others then
    if sqlerrm not like 'Er is al een club%' then raise; end if;
  end;
end $$;
reset role;
select pg_temp.assert((select greenside_status = 'pilot' and greenside_pilot_until = current_date + 90 and greenside_fee_cents = 44900
  from clubs where slug = 'pilotclub-de-heide'), 'pilot van 90 dagen met licentiebedrag');
select pg_temp.assert((select count(*) from membership_types where club_id = current_setting('test.club')::uuid) = 6, 'zes lidmaatschappen');
select pg_temp.assert((select count(*) from ledger_accounts where club_id = current_setting('test.club')::uuid and code in ('1100', '1300', '8000', '8100')) = 4
  and exists (select 1 from finance_settings where club_id = current_setting('test.club')::uuid), 'rekeningschema en financiële instellingen aangemaakt');
select pg_temp.assert((select count(*) from course_holes h join courses c on c.id = h.course_id
  where c.club_id = current_setting('test.club')::uuid) = 27, '27 holes met par en stroke index');
select pg_temp.assert((select count(*) from products where club_id = current_setting('test.club')::uuid and not active) = 6,
  'aanbod klaargezet maar uit');
select pg_temp.assert((select stage = 'gewonnen' and club_id = current_setting('test.club')::uuid from hq_prospects
  where club_name = 'Pilotclub De Heide'), 'verkoopkans gewonnen en gekoppeld');

-- De beheerder logt in met een code en is meteen beheerder van de nieuwe club
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a0a2', false);
set role authenticated;
select pg_temp.assert(claim_my_accounts() = '{"members": 0, "staff": 1}', 'uitnodiging wordt een rol');
select pg_temp.assert(is_club_staff(current_setting('test.club')::uuid, array['admin']::staff_role[]), 'beheerder van de nieuwe club');
select pg_temp.assert((select count(*) from members where club_id = '00000000-0000-0000-0000-0000000c0001') = 0,
  'en ziet niets van andere clubs');
-- en kan zelf een collega uitnodigen
insert into club_staff_invites (club_id, email, role) values (current_setting('test.club')::uuid, 'penningmeester@pilotclub.test', 'finance');
reset role;
select pg_temp.assert((select accepted_at is not null from club_staff_invites where email = 'nieuw@pilotclub.test'), 'uitnodiging geaccepteerd');

-- Opruimen, zodat de demodata daarna op een schone stand laadt
delete from members where member_number in ('9001', '9002');
delete from membership_types where name = 'Senior';
update members set phone = '06-23456789' where member_number = '1002';
delete from clubs where slug = 'pilotclub-de-heide';
delete from hq_prospects;
delete from auth.users where id in ('00000000-0000-0000-0000-00000000a0a1', '00000000-0000-0000-0000-00000000a0a2');
