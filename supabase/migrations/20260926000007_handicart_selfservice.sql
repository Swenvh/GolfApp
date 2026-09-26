-- =============================================================================
-- Upsells zonder extra werk voor personeel + Stichting Handicart
--
--  * Leden registreren hun Handicart-pas in de app; bij het boeken krijgen ze
--    automatisch het Handicart-tarief voor een buggy (in plaats van te bellen).
--  * Buggy's worden per tijdvak geteld (een buggy kan 's ochtends én 's middags
--    rijden), kluisjes en stalling per seizoen, de rest per dag.
--  * Nieuwe categorie: stalling & kluisjes (seizoenshuur, geen werk per ronde).
-- =============================================================================

-- 1. Handicart-pas bij het lid ------------------------------------------------------
create type handicart_pass_type as enum ('permanent', 'temporary');

alter table members
  add column handicart_pass_number text check (handicart_pass_number ~ '^[A-Za-z0-9-]{3,20}$'),
  add column handicart_pass_type   handicart_pass_type,
  add column handicart_valid_until date;

create function has_valid_handicart(p_member uuid, p_on date) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from members
    where id = p_member and handicart_pass_number is not null
      and (handicart_valid_until is null or handicart_valid_until >= p_on)
  )
$$;

/** Lid legt zijn eigen Handicart-pas vast (of verwijdert hem met p_number = null). */
create function member_set_handicart(
  p_member uuid, p_number text, p_type handicart_pass_type default 'permanent', p_valid_until date default null
) returns members
language plpgsql security definer set search_path = public as $$
declare v members;
begin
  if p_number is not null and p_type = 'temporary' and p_valid_until is null then
    raise exception 'Vul de einddatum van je tijdelijke pas in' using errcode = 'P0001';
  end if;
  update members set
    handicart_pass_number = nullif(upper(trim(p_number)), ''),
    handicart_pass_type   = case when nullif(trim(p_number), '') is null then null else p_type end,
    handicart_valid_until = case when nullif(trim(p_number), '') is null then null else p_valid_until end
  where id = p_member and user_id = auth.uid()
  returning * into v;
  if not found then raise exception 'Geen rechten' using errcode = '42501'; end if;
  return v;
end $$;

-- 2. Producten: Handicart-tarief, capaciteit per tijdvak/dag/seizoen, uitleg ------
alter type product_category add value if not exists 'storage';

alter table products rename column daily_capacity to capacity;
alter table products
  add column capacity_scope text not null default 'day' check (capacity_scope in ('slot', 'day', 'season')),
  add column handicart_price_cents bigint check (handicart_price_cents >= 0),  -- tarief voor Handicart-pashouders
  add column pickup_note text;                                                 -- bv. "Sleutel en laadkabel bij de receptie"

alter table order_lines add column handicart boolean not null default false;

-- Tekstvergelijking, zodat de nieuwe enumwaarde in dezelfde migratie bruikbaar is
create or replace function category_ledger_code(p product_category) returns text language sql immutable as $$
  select case p::text
    when 'greenfee' then '8100' when 'event' then '8200' when 'lesson' then '8300'
    when 'food' then '8400' when 'rental' then '8500' when 'range' then '8500'
    when 'proshop' then '8600' when 'storage' then '8700' end
$$;

insert into ledger_accounts (club_id, code, name, type)
select id, '8700', 'Stalling & kluisjes', 'revenue' from clubs
on conflict (club_id, code) do nothing;

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
    (new.id, '8500', 'Verhuur buggy''s & trolleys',  'revenue'),
    (new.id, '8600', 'Proshop',                      'revenue'),
    (new.id, '8700', 'Stalling & kluisjes',          'revenue'),
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

-- 3. Hoeveel is er al vergeven? --------------------------------------------------
-- slot:   bestellingen bij starttijden waarvan de ronde overlapt (buggy's)
-- day:    alles op dezelfde dag (lessen, wedstrijddiner)
-- season: alles in hetzelfde kalenderjaar (kluisjes, stalling)
create function product_units_taken(p_product uuid, p_day date, p_starts_at timestamptz default null)
returns int
language plpgsql stable security definer set search_path = public as $$
declare
  v_scope  text;
  v_club   uuid;
  v_round  int;
  v_taken  int;
begin
  select capacity_scope, club_id into v_scope, v_club from products where id = p_product;

  if v_scope = 'season' then
    select coalesce(sum(l.quantity), 0) into v_taken
    from order_lines l join orders o on o.id = l.order_id
    where l.product_id = p_product and o.status <> 'cancelled'
      and extract(year from o.fulfil_on) = extract(year from p_day);

  elsif v_scope = 'slot' and p_starts_at is not null then
    select coalesce(max(round_minutes), 240) into v_round from courses where club_id = v_club;
    select coalesce(sum(l.quantity), 0) into v_taken
    from order_lines l
    join orders o on o.id = l.order_id
    join tee_bookings b on b.id = o.booking_id
    join courses c on c.id = b.course_id
    where l.product_id = p_product and o.status <> 'cancelled'
      and b.starts_at < p_starts_at + make_interval(mins => v_round)
      and p_starts_at < b.starts_at + make_interval(mins => c.round_minutes);

  else
    select coalesce(sum(l.quantity), 0) into v_taken
    from order_lines l join orders o on o.id = l.order_id
    where l.product_id = p_product and o.status <> 'cancelled' and o.fulfil_on = p_day;
  end if;

  return v_taken;
end $$;
revoke execute on function product_units_taken(uuid, date, timestamptz) from public, anon, authenticated;

drop function product_availability(uuid, date);
create function product_availability(p_club uuid, p_day date, p_starts_at timestamptz default null)
returns table (product_id uuid, remaining int)
language sql stable security definer set search_path = public as $$
  select p.id, greatest(p.capacity - product_units_taken(p.id, p_day, p_starts_at), 0)::int
  from products p
  where p.club_id = p_club and p.capacity is not null and p.active and is_club_member(p_club)
$$;

-- 4. Bestellen: Handicart-tarief en de nieuwe capaciteitsregels -------------------
create or replace function create_order_internal(
  p_member uuid, p_lines jsonb, p_booking uuid default null, p_competition uuid default null,
  p_fulfil_on date default null, p_note text default null, p_issue_date date default current_date
) returns orders
language plpgsql security definer set search_path = public as $$
declare
  v_member    members;
  v_club      clubs;
  v_invoice   uuid;
  v_order     orders;
  v_line      jsonb;
  v_product   products;
  v_qty       int;
  v_taken     int;
  v_comp      competitions;
  v_fulfil    date := p_fulfil_on;
  v_starts    timestamptz;
  v_names     text[] := '{}';
  v_pos       int := 0;
  v_handicart boolean;
  v_ledger    uuid;
begin
  select * into v_member from members where id = p_member;
  if not found then raise exception 'Lid niet gevonden'; end if;
  select * into v_club from clubs where id = v_member.club_id;

  if p_booking is not null then
    select starts_at into v_starts from tee_bookings where id = p_booking;
    v_fulfil := coalesce(v_fulfil, (v_starts at time zone 'Europe/Amsterdam')::date);
  end if;
  if v_fulfil is null and p_competition is not null then
    select (starts_at at time zone 'Europe/Amsterdam')::date into v_fulfil from competitions where id = p_competition;
  end if;
  v_fulfil := coalesce(v_fulfil, (now() at time zone 'Europe/Amsterdam')::date);
  v_handicart := has_valid_handicart(v_member.id, v_fulfil);

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

    if v_product.capacity_scope = 'slot' and p_booking is null then
      raise exception '% reserveer je bij een starttijd', v_product.name using errcode = 'P0001';
    end if;

    if v_product.capacity is not null then
      perform pg_advisory_xact_lock(hashtext('product:' || v_product.id::text));
      v_taken := product_units_taken(v_product.id, v_fulfil, v_starts);
      if v_taken + v_qty > v_product.capacity then
        raise exception 'Nog maar % × % beschikbaar %', greatest(v_product.capacity - v_taken, 0), v_product.name,
          case v_product.capacity_scope when 'slot' then 'rond deze starttijd' when 'season' then 'dit seizoen' else 'op deze dag' end
          using errcode = 'P0001', hint = 'uitverkocht';
      end if;
    end if;

    v_ledger := coalesce(v_product.ledger_account_id,
      (select id from ledger_accounts where club_id = v_club.id and code = category_ledger_code(v_product.category)));

    -- Handicart-pashouders: één buggy tegen het Handicart-tarief, eventuele extra's tegen het gewone tarief
    if v_handicart and v_product.handicart_price_cents is not null then
      v_pos := v_pos + 1;
      insert into order_lines (order_id, product_id, description, quantity, unit_price_cents, vat_rate, handicart)
      values (v_order.id, v_product.id, v_product.name || ' (Handicart)', 1, v_product.handicart_price_cents, v_product.vat_rate, true);
      insert into invoice_lines (invoice_id, position, description, quantity, unit_price_cents, vat_rate, ledger_account_id)
      values (v_invoice, v_pos, v_product.name || ' (Handicart-tarief, pas ' || v_member.handicart_pass_number || ')',
              1, v_product.handicart_price_cents, v_product.vat_rate, v_ledger);
      v_qty := v_qty - 1;
    end if;

    if v_qty > 0 then
      v_pos := v_pos + 1;
      insert into order_lines (order_id, product_id, description, quantity, unit_price_cents, vat_rate)
      values (v_order.id, v_product.id, v_product.name, v_qty, v_product.price_cents, v_product.vat_rate);
      insert into invoice_lines (invoice_id, position, description, quantity, unit_price_cents, vat_rate, ledger_account_id)
      values (v_invoice, v_pos, v_product.name, v_qty, v_product.price_cents, v_product.vat_rate, v_ledger);
    end if;
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
