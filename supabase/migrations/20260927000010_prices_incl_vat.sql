-- Prijzen voor leden inclusief btw.
--
-- Een lid betaalt de prijs die het ziet: 2 × € 60,00 is € 120,00. De btw wordt per regel uit het
-- bedrag incl. btw teruggerekend, in plaats van opgeteld bij het bedrag excl. btw (dat gaf € 120,01).
-- Handmatige facturen van de club (contributie e.d.) blijven exclusief btw werken.

alter table invoice_lines add column prices_include_vat boolean not null default false;

-- Gegenereerde kolommen opnieuw aanmaken met de nieuwe berekening (bestaande regels blijven gelijk)
alter table invoice_lines drop column line_total_cents, drop column vat_cents;
alter table invoice_lines
  add column line_total_cents bigint generated always as (
    case when prices_include_vat
      then round(quantity * unit_price_cents)::bigint
           - round(round(quantity * unit_price_cents) * vat_rate / (100 + vat_rate))::bigint
      else round(quantity * unit_price_cents)::bigint end
  ) stored,
  add column vat_cents bigint generated always as (
    case when prices_include_vat
      then round(round(quantity * unit_price_cents) * vat_rate / (100 + vat_rate))::bigint
      else round(round(quantity * unit_price_cents) * vat_rate / 100)::bigint end
  ) stored;

/** Consumentenprijs per stuk: prijs excl. btw plus afgeronde btw. Gelijk aan priceInclVat in de app. */
create function gross_price_cents(p_excl bigint, p_rate numeric) returns bigint
language sql immutable as $$ select p_excl + round(p_excl * p_rate / 100)::bigint $$;

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
      insert into invoice_lines (invoice_id, position, description, quantity, unit_price_cents, vat_rate, ledger_account_id, prices_include_vat)
      values (v_invoice, v_pos, v_product.name || ' (Handicart-tarief, pas ' || v_member.handicart_pass_number || ')',
              1, gross_price_cents(v_product.handicart_price_cents, v_product.vat_rate), v_product.vat_rate, v_ledger, true);
      v_qty := v_qty - 1;
    end if;

    if v_qty > 0 then
      v_pos := v_pos + 1;
      insert into order_lines (order_id, product_id, description, quantity, unit_price_cents, vat_rate)
      values (v_order.id, v_product.id, v_product.name, v_qty, v_product.price_cents, v_product.vat_rate);
      insert into invoice_lines (invoice_id, position, description, quantity, unit_price_cents, vat_rate, ledger_account_id, prices_include_vat)
      values (v_invoice, v_pos, v_product.name, v_qty, gross_price_cents(v_product.price_cents, v_product.vat_rate), v_product.vat_rate, v_ledger, true);
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

-- Omzet via de app: per stuk de prijs incl. btw, zoals het lid die betaalt
create or replace view app_revenue with (security_invoker = true) as
select o.club_id, o.fulfil_on, coalesce(p.category::text, 'event') as category,
       count(distinct o.id) as orders,
       sum(l.quantity) as items,
       sum(l.quantity * gross_price_cents(l.unit_price_cents, l.vat_rate))::bigint as revenue_incl_cents
from orders o
join order_lines l on l.order_id = o.id
left join products p on p.id = l.product_id
where o.status <> 'cancelled'
group by 1, 2, 3;
