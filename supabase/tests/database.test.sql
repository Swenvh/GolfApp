-- Database-tests: boekhouding in balans, factuurflow, incasso en RLS-afscherming.
-- Draait na migraties + seed (zie run-local.sh). Faalt met een exception.

create or replace function pg_temp.assert(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'ASSERTION FAILED: %', msg; end if;
end $$;

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
        date_trunc('day', now()) + interval '2 days 10 hours', auth.uid());
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
  (select count(*) from tee_sheet('00000000-0000-0000-0000-0000000f0001', (now() + interval '2 days')::date)) = 4,
  'tee_sheet geeft 4 spelers');
select pg_temp.assert(
  (select bool_or(player_name = 'Sanne Jansen') from tee_sheet('00000000-0000-0000-0000-0000000f0001', (now() + interval '2 days')::date)),
  'naam medespeler zichtbaar');
select pg_temp.assert(
  (select count(*) from competition_participants((select id from competitions where name = 'Dinsdagmiddag Stableford'))) = 1,
  'deelnemerslijst zichtbaar');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000ffff', false);
set role authenticated;
select pg_temp.assert(
  (select count(*) from tee_sheet('00000000-0000-0000-0000-0000000f0001', (now() + interval '2 days')::date)) = 0,
  'niet-lid ziet geen starttijden');
select pg_temp.assert((select count(*) from clubs) = 0, 'niet-lid ziet geen club');
reset role;
