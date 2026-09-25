-- =============================================================================
-- GolfApp — financiële administratie
-- Facturen, betalingen, SEPA-incasso en een dubbel-boekhoudkundig grootboek.
-- Facturen en betalingen worden automatisch in het grootboek geboekt.
-- =============================================================================

create type ledger_account_type as enum ('asset', 'liability', 'equity', 'revenue', 'expense');
create type invoice_status as enum ('draft', 'open', 'paid', 'cancelled');
create type payment_method as enum ('sepa_direct_debit', 'ideal', 'bank_transfer', 'cash', 'pin', 'credit');
create type mandate_status as enum ('active', 'revoked');
create type debit_batch_status as enum ('draft', 'exported', 'processed');

-- -----------------------------------------------------------------------------
-- Grootboek
-- -----------------------------------------------------------------------------
create table ledger_accounts (
  id       uuid primary key default gen_random_uuid(),
  club_id  uuid not null references clubs(id) on delete cascade,
  code     text not null,
  name     text not null,
  type     ledger_account_type not null,
  active   boolean not null default true,
  unique (club_id, code)
);

create table finance_settings (
  club_id                 uuid primary key references clubs(id) on delete cascade,
  bank_account_id         uuid references ledger_accounts(id),
  payment_provider_account_id uuid references ledger_accounts(id),  -- tussenrekening Mollie/iDEAL
  debtors_account_id      uuid references ledger_accounts(id),
  vat_payable_account_id  uuid references ledger_accounts(id),
  default_revenue_account_id uuid references ledger_accounts(id),
  fiscal_year_start_month int not null default 1 check (fiscal_year_start_month between 1 and 12)
);

create table journal_entries (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  entry_date  date not null,
  description text not null,
  source_type text not null check (source_type in ('invoice', 'invoice_reversal', 'payment', 'manual')),
  source_id   uuid,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index journal_entries_club_idx on journal_entries (club_id, entry_date);

create table journal_lines (
  id                uuid primary key default gen_random_uuid(),
  entry_id          uuid not null references journal_entries(id) on delete cascade,
  ledger_account_id uuid not null references ledger_accounts(id),
  member_id         uuid references members(id) on delete set null,
  debit_cents       bigint not null default 0 check (debit_cents >= 0),
  credit_cents      bigint not null default 0 check (credit_cents >= 0),
  check (debit_cents = 0 or credit_cents = 0)
);
create index journal_lines_account_idx on journal_lines (ledger_account_id);

-- Een journaalpost moet in balans zijn. Deferred zodat alle regels eerst
-- ingevoegd kunnen worden binnen dezelfde transactie.
create function assert_entry_balanced() returns trigger language plpgsql as $$
declare
  v_entry uuid := coalesce(new.entry_id, old.entry_id);
  v_diff  bigint;
begin
  select coalesce(sum(debit_cents - credit_cents), 0) into v_diff
  from journal_lines where entry_id = v_entry;
  if v_diff <> 0 then
    raise exception 'Journaalpost % is niet in balans (verschil % cent)', v_entry, v_diff;
  end if;
  return null;
end $$;

create constraint trigger journal_lines_balanced
  after insert or update or delete on journal_lines
  deferrable initially deferred
  for each row execute function assert_entry_balanced();

-- -----------------------------------------------------------------------------
-- Facturen
-- -----------------------------------------------------------------------------
create table invoice_counters (
  club_id uuid not null references clubs(id) on delete cascade,
  year    int not null,
  last_no int not null default 0,
  primary key (club_id, year)
);

create table invoices (
  id                 uuid primary key default gen_random_uuid(),
  club_id            uuid not null references clubs(id) on delete cascade,
  member_id          uuid not null references members(id) on delete restrict,
  invoice_number     text,                        -- toegekend bij definitief maken
  description        text,
  issue_date         date not null default current_date,
  due_date           date not null default (current_date + 14),
  status             invoice_status not null default 'draft',
  collect_by_direct_debit boolean not null default false,
  subtotal_cents     bigint not null default 0,
  vat_cents          bigint not null default 0,
  total_cents        bigint not null default 0,
  paid_cents         bigint not null default 0,
  created_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  finalized_at       timestamptz,
  unique (club_id, invoice_number)
);
create index invoices_club_status_idx on invoices (club_id, status, due_date);
create index invoices_member_idx on invoices (member_id);

create table invoice_lines (
  id                uuid primary key default gen_random_uuid(),
  invoice_id        uuid not null references invoices(id) on delete cascade,
  position          int not null default 0,
  description       text not null,
  quantity          numeric(10,2) not null default 1,
  unit_price_cents  bigint not null,
  vat_rate          numeric(4,2) not null default 0 check (vat_rate in (0, 9, 21)),
  ledger_account_id uuid references ledger_accounts(id),
  line_total_cents  bigint generated always as (round(quantity * unit_price_cents)::bigint) stored,
  vat_cents         bigint generated always as (round(round(quantity * unit_price_cents) * vat_rate / 100)::bigint) stored
);

-- Totalen van de factuur bijwerken als regels wijzigen
create function recalc_invoice_totals() returns trigger language plpgsql as $$
declare
  v_invoice uuid := coalesce(new.invoice_id, old.invoice_id);
  v_status  invoice_status;
begin
  select status into v_status from invoices where id = v_invoice;
  if v_status is not null and v_status <> 'draft' then
    raise exception 'Alleen conceptfacturen kunnen worden gewijzigd';
  end if;

  update invoices i set
    subtotal_cents = t.subtotal,
    vat_cents      = t.vat,
    total_cents    = t.subtotal + t.vat
  from (
    select coalesce(sum(line_total_cents), 0) subtotal, coalesce(sum(vat_cents), 0) vat
    from invoice_lines where invoice_id = v_invoice
  ) t
  where i.id = v_invoice;
  return null;
end $$;

create trigger invoice_lines_totals
  after insert or update or delete on invoice_lines
  for each row execute function recalc_invoice_totals();

-- Factuur definitief maken: nummer toekennen en journaalpost maken
create function finalize_invoice(p_invoice uuid) returns invoices
language plpgsql security definer set search_path = public as $$
declare
  v_inv      invoices;
  v_settings finance_settings;
  v_year     int;
  v_no       int;
  v_entry    uuid;
begin
  select * into v_inv from invoices where id = p_invoice for update;
  if not found then raise exception 'Factuur niet gevonden'; end if;
  if not is_club_staff(v_inv.club_id, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v_inv.status <> 'draft' then raise exception 'Factuur is al definitief'; end if;
  if v_inv.total_cents = 0 and not exists (select 1 from invoice_lines where invoice_id = p_invoice) then
    raise exception 'Factuur heeft geen regels';
  end if;

  select * into v_settings from finance_settings where club_id = v_inv.club_id;

  v_year := extract(year from v_inv.issue_date);
  insert into invoice_counters (club_id, year, last_no) values (v_inv.club_id, v_year, 1)
  on conflict (club_id, year) do update set last_no = invoice_counters.last_no + 1
  returning last_no into v_no;

  update invoices set
    status = 'open',
    invoice_number = v_year || '-' || lpad(v_no::text, 5, '0'),
    finalized_at = now()
  where id = p_invoice
  returning * into v_inv;

  -- Journaalpost: Debiteuren (D) aan Omzet (C) + Af te dragen BTW (C)
  insert into journal_entries (club_id, entry_date, description, source_type, source_id, created_by)
  values (v_inv.club_id, v_inv.issue_date, 'Factuur ' || v_inv.invoice_number, 'invoice', v_inv.id, auth.uid())
  returning id into v_entry;

  if v_inv.total_cents < 0 then
    raise exception 'Totaalbedrag mag niet negatief zijn; gebruik cancel_invoice voor creditering';
  end if;
  insert into journal_lines (entry_id, ledger_account_id, member_id, debit_cents)
  values (v_entry, v_settings.debtors_account_id, v_inv.member_id, v_inv.total_cents);

  -- Omzet per grootboekrekening (negatieve regels, bv. kortingen, worden debet geboekt)
  insert into journal_lines (entry_id, ledger_account_id, debit_cents, credit_cents)
  select v_entry, t.account, greatest(-t.amount, 0), greatest(t.amount, 0)
  from (
    select coalesce(l.ledger_account_id, v_settings.default_revenue_account_id) account,
           sum(l.line_total_cents) amount
    from invoice_lines l where l.invoice_id = p_invoice
    group by 1
  ) t
  where t.amount <> 0;

  if v_inv.vat_cents <> 0 then
    insert into journal_lines (entry_id, ledger_account_id, debit_cents, credit_cents)
    values (v_entry, v_settings.vat_payable_account_id,
            greatest(-v_inv.vat_cents, 0), greatest(v_inv.vat_cents, 0));
  end if;

  return v_inv;
end $$;

-- Factuur crediteren/annuleren: tegenboeking van de oorspronkelijke post
create function cancel_invoice(p_invoice uuid, p_reason text default null) returns invoices
language plpgsql security definer set search_path = public as $$
declare
  v_inv   invoices;
  v_orig  uuid;
  v_entry uuid;
begin
  select * into v_inv from invoices where id = p_invoice for update;
  if not found then raise exception 'Factuur niet gevonden'; end if;
  if not is_club_staff(v_inv.club_id, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v_inv.status = 'cancelled' then return v_inv; end if;
  if v_inv.paid_cents > 0 then
    raise exception 'Factuur heeft betalingen; maak een creditfactuur of boek eerst een terugbetaling';
  end if;

  if v_inv.status = 'open' then
    select id into v_orig from journal_entries
    where source_type = 'invoice' and source_id = p_invoice;

    insert into journal_entries (club_id, entry_date, description, source_type, source_id, created_by)
    values (v_inv.club_id, current_date,
            'Creditering factuur ' || v_inv.invoice_number || coalesce(': ' || p_reason, ''),
            'invoice_reversal', p_invoice, auth.uid())
    returning id into v_entry;

    insert into journal_lines (entry_id, ledger_account_id, member_id, debit_cents, credit_cents)
    select v_entry, ledger_account_id, member_id, credit_cents, debit_cents
    from journal_lines where entry_id = v_orig;
  end if;

  update invoices set status = 'cancelled' where id = p_invoice returning * into v_inv;
  return v_inv;
end $$;

-- -----------------------------------------------------------------------------
-- Betalingen
-- -----------------------------------------------------------------------------
create table payments (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references clubs(id) on delete cascade,
  invoice_id    uuid not null references invoices(id) on delete restrict,
  amount_cents  bigint not null check (amount_cents <> 0),  -- negatief = storno/terugbetaling
  method        payment_method not null,
  paid_on       date not null default current_date,
  reference     text,
  provider_payment_id text unique,              -- bv. Mollie tr_xxx
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index payments_invoice_idx on payments (invoice_id);

-- Betaling boeken: Bank/Tussenrekening (D) aan Debiteuren (C) en factuurstatus bijwerken
create function post_payment() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_inv      invoices;
  v_settings finance_settings;
  v_cash     uuid;
  v_entry    uuid;
  v_amount   bigint := abs(new.amount_cents);
begin
  select * into v_inv from invoices where id = new.invoice_id for update;
  if v_inv.status not in ('open', 'paid') then
    raise exception 'Betalingen kunnen alleen op definitieve facturen worden geboekt';
  end if;
  if v_inv.club_id <> new.club_id then raise exception 'Club komt niet overeen'; end if;

  select * into v_settings from finance_settings where club_id = new.club_id;
  v_cash := case when new.method = 'ideal'
                 then coalesce(v_settings.payment_provider_account_id, v_settings.bank_account_id)
                 else v_settings.bank_account_id end;

  insert into journal_entries (club_id, entry_date, description, source_type, source_id, created_by)
  values (new.club_id, new.paid_on,
          case when new.amount_cents > 0 then 'Betaling ' else 'Storno ' end || v_inv.invoice_number,
          'payment', new.id, new.created_by)
  returning id into v_entry;

  if new.amount_cents > 0 then
    insert into journal_lines (entry_id, ledger_account_id, debit_cents) values (v_entry, v_cash, v_amount);
    insert into journal_lines (entry_id, ledger_account_id, member_id, credit_cents) values (v_entry, v_settings.debtors_account_id, v_inv.member_id, v_amount);
  else
    insert into journal_lines (entry_id, ledger_account_id, member_id, debit_cents) values (v_entry, v_settings.debtors_account_id, v_inv.member_id, v_amount);
    insert into journal_lines (entry_id, ledger_account_id, credit_cents) values (v_entry, v_cash, v_amount);
  end if;

  update invoices set
    paid_cents = paid_cents + new.amount_cents,
    status = case when paid_cents + new.amount_cents >= total_cents then 'paid' else 'open' end::invoice_status
  where id = new.invoice_id;

  return new;
end $$;

create trigger payments_post after insert on payments
  for each row execute function post_payment();

-- -----------------------------------------------------------------------------
-- SEPA-incasso
-- -----------------------------------------------------------------------------
create table sepa_mandates (
  id                uuid primary key default gen_random_uuid(),
  club_id           uuid not null references clubs(id) on delete cascade,
  member_id         uuid not null references members(id) on delete cascade,
  mandate_reference text not null,
  account_holder    text not null,
  iban              text not null,
  bic               text,
  signed_on         date not null,
  first_collected   boolean not null default false,   -- FRST vs RCUR
  status            mandate_status not null default 'active',
  created_at        timestamptz not null default now(),
  unique (club_id, mandate_reference)
);
create unique index sepa_mandates_one_active on sepa_mandates (member_id) where status = 'active';

create table direct_debit_batches (
  id              uuid primary key default gen_random_uuid(),
  club_id         uuid not null references clubs(id) on delete cascade,
  collection_date date not null,
  status          debit_batch_status not null default 'draft',
  message_id      text not null default replace(gen_random_uuid()::text, '-', ''),
  total_cents     bigint not null default 0,
  item_count      int not null default 0,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  exported_at     timestamptz
);

create table direct_debit_items (
  batch_id     uuid not null references direct_debit_batches(id) on delete cascade,
  invoice_id   uuid not null references invoices(id) on delete restrict,
  mandate_id   uuid not null references sepa_mandates(id),
  amount_cents bigint not null check (amount_cents > 0),
  sequence_type text not null check (sequence_type in ('FRST', 'RCUR')),
  primary key (batch_id, invoice_id)
);

-- Batch vullen met alle openstaande incassofacturen die een actief mandaat hebben
create function create_direct_debit_batch(p_club uuid, p_collection_date date)
returns direct_debit_batches
language plpgsql security definer set search_path = public as $$
declare
  v_batch direct_debit_batches;
begin
  if not is_club_staff(p_club, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;

  insert into direct_debit_batches (club_id, collection_date, created_by)
  values (p_club, p_collection_date, auth.uid())
  returning * into v_batch;

  insert into direct_debit_items (batch_id, invoice_id, mandate_id, amount_cents, sequence_type)
  select v_batch.id, i.id, m.id, i.total_cents - i.paid_cents,
         case when m.first_collected then 'RCUR' else 'FRST' end
  from invoices i
  join sepa_mandates m on m.member_id = i.member_id and m.status = 'active'
  where i.club_id = p_club
    and i.status = 'open'
    and i.collect_by_direct_debit
    and i.total_cents - i.paid_cents > 0
    and not exists (
      select 1 from direct_debit_items di
      join direct_debit_batches b on b.id = di.batch_id
      where di.invoice_id = i.id and b.status <> 'processed'
    );

  update direct_debit_batches b set
    total_cents = coalesce(t.total, 0),
    item_count  = coalesce(t.cnt, 0)
  from (select sum(amount_cents) total, count(*) cnt from direct_debit_items where batch_id = v_batch.id) t
  where b.id = v_batch.id
  returning b.* into v_batch;

  return v_batch;
end $$;

-- Batch verwerkt (na bankbevestiging): betalingen boeken en mandaten op RCUR zetten
create function process_direct_debit_batch(p_batch uuid) returns direct_debit_batches
language plpgsql security definer set search_path = public as $$
declare
  v_batch direct_debit_batches;
begin
  select * into v_batch from direct_debit_batches where id = p_batch for update;
  if not is_club_staff(v_batch.club_id, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v_batch.status = 'processed' then return v_batch; end if;

  insert into payments (club_id, invoice_id, amount_cents, method, paid_on, reference, created_by)
  select v_batch.club_id, di.invoice_id, di.amount_cents, 'sepa_direct_debit', v_batch.collection_date,
         'Incasso ' || v_batch.message_id, auth.uid()
  from direct_debit_items di where di.batch_id = p_batch;

  update sepa_mandates set first_collected = true
  where id in (select mandate_id from direct_debit_items where batch_id = p_batch);

  update direct_debit_batches set status = 'processed' where id = p_batch returning * into v_batch;
  return v_batch;
end $$;

-- -----------------------------------------------------------------------------
-- Contributie in bulk factureren
-- -----------------------------------------------------------------------------
create function generate_contribution_invoices(
  p_club uuid, p_year int, p_issue_date date default current_date, p_direct_debit boolean default true
) returns int
language plpgsql security definer set search_path = public as $$
declare
  v_count    int := 0;
  v_member   record;
  v_invoice  uuid;
  v_term     int;
  v_revenue  uuid;
begin
  if not is_club_staff(p_club, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  select payment_term_days into v_term from clubs where id = p_club;
  select id into v_revenue from ledger_accounts where club_id = p_club and code = '8000';

  for v_member in
    select m.id, mt.name, mt.annual_fee_cents, mt.vat_rate
    from members m join membership_types mt on mt.id = m.membership_type_id
    where m.club_id = p_club and m.status = 'active' and mt.annual_fee_cents > 0
      and not exists (
        select 1 from invoices i
        where i.member_id = m.id and i.status <> 'cancelled'
          and i.description = 'Contributie ' || p_year
      )
  loop
    insert into invoices (club_id, member_id, description, issue_date, due_date, collect_by_direct_debit, created_by)
    values (p_club, v_member.id, 'Contributie ' || p_year, p_issue_date, p_issue_date + v_term,
            p_direct_debit and exists (select 1 from sepa_mandates where member_id = v_member.id and status = 'active'),
            auth.uid())
    returning id into v_invoice;

    insert into invoice_lines (invoice_id, description, unit_price_cents, vat_rate, ledger_account_id)
    values (v_invoice, 'Contributie ' || p_year || ' — ' || v_member.name,
            v_member.annual_fee_cents, v_member.vat_rate, v_revenue);

    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

-- -----------------------------------------------------------------------------
-- Standaard rekeningschema bij nieuwe club
-- -----------------------------------------------------------------------------
create function seed_club_finance() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into ledger_accounts (club_id, code, name, type) values
    (new.id, '1000', 'Kas',                          'asset'),
    (new.id, '1100', 'Bank',                         'asset'),
    (new.id, '1150', 'Tussenrekening iDEAL/Mollie',  'asset'),
    (new.id, '1300', 'Debiteuren',                   'asset'),
    (new.id, '1600', 'Crediteuren',                  'liability'),
    (new.id, '1700', 'Af te dragen BTW',             'liability'),
    (new.id, '1800', 'Vooruitontvangen contributie', 'liability'),
    (new.id, '0900', 'Algemene reserve',             'equity'),
    (new.id, '8000', 'Contributies',                 'revenue'),
    (new.id, '8010', 'Entreegelden',                 'revenue'),
    (new.id, '8100', 'Greenfees',                    'revenue'),
    (new.id, '8200', 'Wedstrijdgelden',              'revenue'),
    (new.id, '8300', 'Lessen & clinics',             'revenue'),
    (new.id, '8400', 'Horeca',                       'revenue'),
    (new.id, '8900', 'Overige opbrengsten',          'revenue'),
    (new.id, '4000', 'Baanonderhoud',                'expense'),
    (new.id, '4100', 'Personeelskosten',             'expense'),
    (new.id, '4200', 'Huisvesting',                  'expense'),
    (new.id, '4300', 'NGF-afdrachten',               'expense'),
    (new.id, '4900', 'Algemene kosten',              'expense');

  insert into finance_settings (club_id, bank_account_id, payment_provider_account_id, debtors_account_id,
                                vat_payable_account_id, default_revenue_account_id)
  select new.id,
    (select id from ledger_accounts where club_id = new.id and code = '1100'),
    (select id from ledger_accounts where club_id = new.id and code = '1150'),
    (select id from ledger_accounts where club_id = new.id and code = '1300'),
    (select id from ledger_accounts where club_id = new.id and code = '1700'),
    (select id from ledger_accounts where club_id = new.id and code = '8900');
  return new;
end $$;

create trigger clubs_seed_finance after insert on clubs
  for each row execute function seed_club_finance();

-- -----------------------------------------------------------------------------
-- Rapportage-views (security_invoker: RLS van onderliggende tabellen geldt)
-- -----------------------------------------------------------------------------
create view ledger_balances with (security_invoker = true) as
select a.club_id, a.id as ledger_account_id, a.code, a.name, a.type,
       coalesce(sum(l.debit_cents), 0)  as debit_cents,
       coalesce(sum(l.credit_cents), 0) as credit_cents,
       coalesce(sum(l.debit_cents - l.credit_cents), 0) as balance_cents
from ledger_accounts a
left join journal_lines l on l.ledger_account_id = a.id
group by a.id;

create view member_balances with (security_invoker = true) as
select i.club_id, i.member_id,
       sum(i.total_cents - i.paid_cents) filter (where i.status = 'open') as outstanding_cents,
       sum(i.total_cents - i.paid_cents) filter (where i.status = 'open' and i.due_date < current_date) as overdue_cents,
       count(*) filter (where i.status = 'open') as open_invoices
from invoices i
group by i.club_id, i.member_id;
