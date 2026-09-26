-- =============================================================================
-- Starttijden per 8 minuten + upsells in de ledenapp
--
--  * Starttijden liggen op een vast raster (standaard elke 8 minuten).
--  * Weekdagleden kunnen niet in het weekend boeken (en krijgen een upgrade-aanbod).
--  * Aanbod (producten) dat leden in de app bestellen: verhuur, range, greenfee
--    voor introducés, lessen, horeca, proshop en wedstrijddiners.
--  * Elke bestelling wordt direct een definitieve factuur en loopt zo automatisch
--    mee in incasso, iDEAL en het grootboek.
--  * Leads: upgrade-aanvragen, introducties van vrienden en lesaanvragen.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Starttijden per 8 minuten, alleen op het raster van de baan
-- -----------------------------------------------------------------------------
alter table courses alter column interval_minutes set default 8;

create function enforce_tee_slot() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  c        courses;
  v_local  time;
  v_offset int;
begin
  select * into c from courses where id = new.course_id;
  v_local := (new.starts_at at time zone 'Europe/Amsterdam')::time;
  v_offset := extract(epoch from (v_local - c.first_tee_time))::int;
  if v_local < c.first_tee_time or v_local > c.last_tee_time
     or v_offset % (c.interval_minutes * 60) <> 0 then
    raise exception 'Geen geldige starttijd: op de % start je elke % minuten tussen % en %',
      c.name, c.interval_minutes, to_char(c.first_tee_time, 'HH24:MI'), to_char(c.last_tee_time, 'HH24:MI')
      using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger tee_bookings_slot
  before insert or update of starts_at, course_id on tee_bookings
  for each row execute function enforce_tee_slot();

-- -----------------------------------------------------------------------------
-- 2. Weekdagleden: niet in het weekend
-- -----------------------------------------------------------------------------
create function enforce_membership_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_starts  timestamptz;
  v_weekend boolean;
  v_type    text;
  v_name    text;
begin
  if new.member_id is null then return new; end if;
  select starts_at into v_starts from tee_bookings where id = new.booking_id;
  select mt.can_book_weekend, mt.name, m.first_name into v_weekend, v_type, v_name
  from members m join membership_types mt on mt.id = m.membership_type_id
  where m.id = new.member_id;
  if v_weekend = false and extract(isodow from v_starts at time zone 'Europe/Amsterdam') in (6, 7) then
    raise exception 'Met een lidmaatschap "%" kan % niet in het weekend spelen', v_type, v_name
      using errcode = 'P0001', hint = 'upgrade_nodig';
  end if;
  return new;
end $$;

create trigger tee_booking_players_membership
  before insert or update of booking_id, member_id on tee_booking_players
  for each row execute function enforce_membership_rules();

-- -----------------------------------------------------------------------------
-- 3. Grootboekrekeningen voor de nieuwe omzetsoorten
-- -----------------------------------------------------------------------------
create or replace function seed_club_finance() returns trigger
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
    (new.id, '8500', 'Verhuur & driving range',      'revenue'),
    (new.id, '8600', 'Proshop',                      'revenue'),
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

insert into ledger_accounts (club_id, code, name, type)
select c.id, a.code, a.name, 'revenue'
from clubs c, (values ('8500', 'Verhuur & driving range'), ('8600', 'Proshop')) as a(code, name)
on conflict (club_id, code) do nothing;

-- Wat de club voor Greenside betaalt; gebruikt om te tonen hoe snel de app zichzelf terugverdient
alter table clubs add column greenside_fee_cents bigint not null default 0 check (greenside_fee_cents >= 0);

-- -----------------------------------------------------------------------------
-- 4. Aanbod en bestellingen
-- -----------------------------------------------------------------------------
create type product_category as enum ('rental', 'range', 'greenfee', 'lesson', 'food', 'proshop', 'event');
create type order_status as enum ('placed', 'fulfilled', 'cancelled');

create table products (
  id                uuid primary key default gen_random_uuid(),
  club_id           uuid not null references clubs(id) on delete cascade,
  category          product_category not null,
  name              text not null,
  description       text,
  price_cents       bigint not null check (price_cents >= 0),
  vat_rate          numeric(4,2) not null default 21 check (vat_rate in (0, 9, 21)),
  ledger_account_id uuid references ledger_accounts(id),
  daily_capacity    int check (daily_capacity > 0),   -- bv. aantal e-buggy's
  icon              text,                            -- Ionicons-naam voor de app
  sort              int not null default 0,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);
create index products_club_idx on products (club_id, active, category);

create table orders (
  id             uuid primary key default gen_random_uuid(),
  club_id        uuid not null references clubs(id) on delete cascade,
  member_id      uuid not null references members(id) on delete restrict,
  booking_id     uuid references tee_bookings(id) on delete set null,
  competition_id uuid references competitions(id) on delete set null,
  status         order_status not null default 'placed',
  fulfil_on      date not null,                     -- dag waarop het klaar moet staan
  total_cents    bigint not null default 0,
  invoice_id     uuid references invoices(id),
  note           text,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  fulfilled_at   timestamptz
);
create index orders_club_day_idx on orders (club_id, fulfil_on);
create index orders_member_idx on orders (member_id);
create index orders_booking_idx on orders (booking_id);

create table order_lines (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  product_id       uuid references products(id),
  description      text not null,
  quantity         int not null check (quantity between 1 and 20),
  unit_price_cents bigint not null,
  vat_rate         numeric(4,2) not null
);
create index order_lines_product_idx on order_lines (product_id);

-- -----------------------------------------------------------------------------
-- 5. Factuur definitief maken / crediteren zonder stafcontrole (intern gebruik)
-- -----------------------------------------------------------------------------
create function finalize_invoice_internal(p_invoice uuid) returns invoices
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
  if v_inv.status <> 'draft' then raise exception 'Factuur is al definitief'; end if;
  if not exists (select 1 from invoice_lines where invoice_id = p_invoice) then
    raise exception 'Factuur heeft geen regels';
  end if;
  if v_inv.total_cents < 0 then
    raise exception 'Totaalbedrag mag niet negatief zijn; gebruik cancel_invoice voor creditering';
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

  insert into journal_entries (club_id, entry_date, description, source_type, source_id, created_by)
  values (v_inv.club_id, v_inv.issue_date, 'Factuur ' || v_inv.invoice_number, 'invoice', v_inv.id, auth.uid())
  returning id into v_entry;

  insert into journal_lines (entry_id, ledger_account_id, member_id, debit_cents)
  values (v_entry, v_settings.debtors_account_id, v_inv.member_id, v_inv.total_cents);

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

create or replace function finalize_invoice(p_invoice uuid) returns invoices
language plpgsql security definer set search_path = public as $$
declare v_club uuid;
begin
  select club_id into v_club from invoices where id = p_invoice;
  if v_club is null then raise exception 'Factuur niet gevonden'; end if;
  if not is_club_staff(v_club, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  return finalize_invoice_internal(p_invoice);
end $$;

create function cancel_invoice_internal(p_invoice uuid, p_reason text default null) returns invoices
language plpgsql security definer set search_path = public as $$
declare
  v_inv   invoices;
  v_orig  uuid;
  v_entry uuid;
begin
  select * into v_inv from invoices where id = p_invoice for update;
  if not found then raise exception 'Factuur niet gevonden'; end if;
  if v_inv.status = 'cancelled' then return v_inv; end if;
  if v_inv.paid_cents > 0 then
    raise exception 'Factuur heeft betalingen; maak een creditfactuur of boek eerst een terugbetaling';
  end if;

  if v_inv.status = 'open' then
    select id into v_orig from journal_entries where source_type = 'invoice' and source_id = p_invoice;
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

create or replace function cancel_invoice(p_invoice uuid, p_reason text default null) returns invoices
language plpgsql security definer set search_path = public as $$
declare v_club uuid;
begin
  select club_id into v_club from invoices where id = p_invoice;
  if v_club is null then raise exception 'Factuur niet gevonden'; end if;
  if not is_club_staff(v_club, array['admin','finance']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  return cancel_invoice_internal(p_invoice, p_reason);
end $$;

revoke execute on function finalize_invoice_internal(uuid) from public, anon, authenticated;
revoke execute on function cancel_invoice_internal(uuid, text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Bestelling plaatsen: bestelling + definitieve factuur in één transactie
-- -----------------------------------------------------------------------------
create function category_ledger_code(p product_category) returns text language sql immutable as $$
  select case p
    when 'greenfee' then '8100' when 'event' then '8200' when 'lesson' then '8300'
    when 'food' then '8400' when 'rental' then '8500' when 'range' then '8500'
    when 'proshop' then '8600' end
$$;

create function create_order_internal(
  p_member uuid, p_lines jsonb, p_booking uuid default null, p_competition uuid default null,
  p_fulfil_on date default null, p_note text default null, p_issue_date date default current_date
) returns orders
language plpgsql security definer set search_path = public as $$
declare
  v_member   members;
  v_club     clubs;
  v_invoice  uuid;
  v_order    orders;
  v_line     jsonb;
  v_product  products;
  v_qty      int;
  v_used     int;
  v_comp     competitions;
  v_fulfil   date := p_fulfil_on;
  v_names    text[] := '{}';
  v_pos      int := 0;
begin
  select * into v_member from members where id = p_member;
  if not found then raise exception 'Lid niet gevonden'; end if;
  select * into v_club from clubs where id = v_member.club_id;

  if v_fulfil is null and p_booking is not null then
    select (starts_at at time zone 'Europe/Amsterdam')::date into v_fulfil from tee_bookings where id = p_booking;
  end if;
  if v_fulfil is null and p_competition is not null then
    select (starts_at at time zone 'Europe/Amsterdam')::date into v_fulfil from competitions where id = p_competition;
  end if;
  v_fulfil := coalesce(v_fulfil, (now() at time zone 'Europe/Amsterdam')::date);

  insert into invoices (club_id, member_id, description, issue_date, due_date, collect_by_direct_debit, created_by)
  values (v_club.id, v_member.id, 'Bestelling via de app', p_issue_date, p_issue_date + v_club.payment_term_days,
          exists (select 1 from sepa_mandates where member_id = v_member.id and status = 'active'), auth.uid())
  returning id into v_invoice;

  insert into orders (club_id, member_id, booking_id, competition_id, fulfil_on, invoice_id, note, created_by)
  values (v_club.id, v_member.id, p_booking, p_competition, v_fulfil, v_invoice, p_note, auth.uid())
  returning * into v_order;

  -- Inschrijfgeld van een wedstrijd
  if p_competition is not null then
    select * into v_comp from competitions where id = p_competition and club_id = v_club.id;
    if not found then raise exception 'Wedstrijd niet gevonden'; end if;
    if v_comp.entry_fee_cents > 0 then
      v_pos := v_pos + 1;
      insert into order_lines (order_id, description, quantity, unit_price_cents, vat_rate)
      values (v_order.id, 'Inschrijfgeld ' || v_comp.name, 1, v_comp.entry_fee_cents, 0);
      insert into invoice_lines (invoice_id, position, description, quantity, unit_price_cents, vat_rate, ledger_account_id)
      values (v_invoice, v_pos, 'Inschrijfgeld ' || v_comp.name, 1, v_comp.entry_fee_cents, 0,
              (select id from ledger_accounts where club_id = v_club.id and code = '8200'));
      v_names := v_names || v_comp.name;
    end if;
  end if;

  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) loop
    v_qty := coalesce((v_line->>'quantity')::int, 1);
    if v_qty < 1 or v_qty > 20 then raise exception 'Ongeldig aantal' using errcode = 'P0001'; end if;

    select * into v_product from products
    where id = (v_line->>'product_id')::uuid and club_id = v_club.id and active;
    if not found then raise exception 'Dit aanbod is niet (meer) beschikbaar' using errcode = 'P0001'; end if;

    -- Beperkte voorraad per dag (bv. e-buggy's)
    if v_product.daily_capacity is not null then
      perform pg_advisory_xact_lock(hashtext('product:' || v_product.id::text || ':' || v_fulfil::text));
      select coalesce(sum(l.quantity), 0) into v_used
      from order_lines l join orders o on o.id = l.order_id
      where l.product_id = v_product.id and o.fulfil_on = v_fulfil and o.status <> 'cancelled';
      if v_used + v_qty > v_product.daily_capacity then
        raise exception 'Nog maar % × % beschikbaar op deze dag', greatest(v_product.daily_capacity - v_used, 0), v_product.name
          using errcode = 'P0001', hint = 'uitverkocht';
      end if;
    end if;

    v_pos := v_pos + 1;
    insert into order_lines (order_id, product_id, description, quantity, unit_price_cents, vat_rate)
    values (v_order.id, v_product.id, v_product.name, v_qty, v_product.price_cents, v_product.vat_rate);
    insert into invoice_lines (invoice_id, position, description, quantity, unit_price_cents, vat_rate, ledger_account_id)
    values (v_invoice, v_pos, v_product.name, v_qty, v_product.price_cents, v_product.vat_rate,
            coalesce(v_product.ledger_account_id,
                     (select id from ledger_accounts where club_id = v_club.id and code = category_ledger_code(v_product.category))));
    v_names := v_names || v_product.name;
  end loop;

  if v_pos = 0 then raise exception 'Bestelling is leeg' using errcode = 'P0001'; end if;

  update invoices set description = left(array_to_string(v_names, ', '), 140) where id = v_invoice;
  perform finalize_invoice_internal(v_invoice);

  update orders set total_cents = (select total_cents from invoices where id = v_invoice)
  where id = v_order.id returning * into v_order;
  return v_order;
end $$;
revoke execute on function create_order_internal(uuid, jsonb, uuid, uuid, date, text, date) from public, anon, authenticated;

/** Voor leden in de app. p_lines: [{"product_id": "...", "quantity": 1}] */
create function place_order(
  p_member uuid, p_lines jsonb, p_booking uuid default null, p_competition uuid default null, p_note text default null
) returns orders
language plpgsql security definer set search_path = public as $$
begin
  if p_member not in (select my_member_ids()) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if p_booking is not null and not exists (
    select 1 from tee_booking_players where booking_id = p_booking and member_id = p_member
  ) then
    raise exception 'Je staat niet in deze flight' using errcode = 'P0001';
  end if;
  if p_competition is not null and not exists (
    select 1 from competition_entries where competition_id = p_competition and member_id = p_member
  ) then
    raise exception 'Je bent niet ingeschreven voor deze wedstrijd' using errcode = 'P0001';
  end if;
  return create_order_internal(p_member, p_lines, p_booking, p_competition, null, p_note);
end $$;

/** Annuleren door het lid (voor de dag zelf, zolang er niet betaald is) of door de club. */
create function cancel_order(p_order uuid) returns orders
language plpgsql security definer set search_path = public as $$
declare
  v_order orders;
  v_inv   invoices;
begin
  select * into v_order from orders where id = p_order for update;
  if not found then raise exception 'Bestelling niet gevonden'; end if;
  if not (v_order.member_id in (select my_member_ids())
          or is_club_staff(v_order.club_id, array['secretariat','finance','marshal']::staff_role[])) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v_order.status <> 'placed' then return v_order; end if;
  if v_order.fulfil_on < (now() at time zone 'Europe/Amsterdam')::date
     and not is_club_staff(v_order.club_id) then
    raise exception 'Deze bestelling ligt in het verleden' using errcode = 'P0001';
  end if;

  select * into v_inv from invoices where id = v_order.invoice_id;
  if v_inv.paid_cents > 0 then
    raise exception 'Deze bestelling is al betaald; de club regelt de terugbetaling' using errcode = 'P0001';
  end if;
  perform cancel_invoice_internal(v_order.invoice_id, 'Bestelling geannuleerd');
  update orders set status = 'cancelled' where id = p_order returning * into v_order;
  return v_order;
end $$;

-- Afmelden voor een starttijd annuleert automatisch de bestellingen die daarbij horen
create function cancel_orders_on_leave() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if old.member_id is null then return old; end if;
  for v_id in
    select o.id from orders o join invoices i on i.id = o.invoice_id
    where o.booking_id = old.booking_id and o.member_id = old.member_id
      and o.status = 'placed' and i.paid_cents = 0
  loop
    perform cancel_invoice_internal((select invoice_id from orders where id = v_id), 'Afgemeld voor starttijd');
    update orders set status = 'cancelled' where id = v_id;
  end loop;
  return old;
end $$;

create trigger tee_booking_players_cancel_orders
  after delete on tee_booking_players
  for each row execute function cancel_orders_on_leave();

-- -----------------------------------------------------------------------------
-- 7. Leads: upgrades, introducties en lesaanvragen
-- -----------------------------------------------------------------------------
create type lead_type as enum ('upgrade', 'referral', 'lesson');
create type lead_status as enum ('new', 'contacted', 'won', 'lost');

create table leads (
  id                 uuid primary key default gen_random_uuid(),
  club_id            uuid not null references clubs(id) on delete cascade,
  member_id          uuid references members(id) on delete set null,   -- wie het aanvroeg
  type               lead_type not null,
  name               text,
  email              citext,
  phone              text,
  note               text,
  membership_type_id uuid references membership_types(id) on delete set null,  -- bij upgrade
  value_cents        bigint,                                                   -- verwachte jaarwaarde
  status             lead_status not null default 'new',
  created_at         timestamptz not null default now()
);
create index leads_club_idx on leads (club_id, status, created_at desc);

-- -----------------------------------------------------------------------------
-- 8. Rechten
-- -----------------------------------------------------------------------------
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_lines enable row level security;
alter table leads       enable row level security;

create policy products_read on products for select using (is_club_member(club_id));
create policy products_write on products for all
  using (is_club_staff(club_id, array['finance']::staff_role[]))
  with check (is_club_staff(club_id, array['finance']::staff_role[]));

create policy orders_self_read on orders for select using (member_id in (select my_member_ids()));
create policy orders_staff_read on orders for select
  using (is_club_staff(club_id, array['secretariat','finance','marshal']::staff_role[]));
create policy orders_staff_update on orders for update
  using (is_club_staff(club_id, array['secretariat','finance','marshal']::staff_role[]));

create policy order_lines_read on order_lines for select
  using (exists (select 1 from orders o where o.id = order_id and (
    o.member_id in (select my_member_ids())
    or is_club_staff(o.club_id, array['secretariat','finance','marshal']::staff_role[]))));

create policy leads_self_insert on leads for insert
  with check (member_id in (select my_member_ids()) and member_in_club(member_id, club_id) and status = 'new');
create policy leads_self_read on leads for select using (member_id in (select my_member_ids()));
create policy leads_staff on leads for all
  using (is_club_staff(club_id, array['secretariat']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat']::staff_role[]));

create trigger audit_orders after insert or update or delete on orders for each row execute function write_audit_log();

-- Omzet via de app per dag en categorie (voor het dashboard van de club)
create view app_revenue with (security_invoker = true) as
select o.club_id, o.fulfil_on, coalesce(p.category::text, 'event') as category,
       count(distinct o.id) as orders,
       sum(l.quantity) as items,
       sum(round(l.quantity * l.unit_price_cents * (1 + l.vat_rate / 100)))::bigint as revenue_incl_cents
from orders o
join order_lines l on l.order_id = o.id
left join products p on p.id = l.product_id
where o.status <> 'cancelled'
group by 1, 2, 3;

-- Beschikbaarheid per product op een dag (zonder dat leden elkaars bestellingen zien)
create function product_availability(p_club uuid, p_day date)
returns table (product_id uuid, remaining int)
language sql stable security definer set search_path = public as $$
  select p.id,
         greatest(p.daily_capacity - coalesce((
           select sum(l.quantity) from order_lines l join orders o on o.id = l.order_id
           where l.product_id = p.id and o.fulfil_on = p_day and o.status <> 'cancelled'), 0), 0)::int
  from products p
  where p.club_id = p_club and p.daily_capacity is not null and p.active and is_club_member(p_club)
$$;
