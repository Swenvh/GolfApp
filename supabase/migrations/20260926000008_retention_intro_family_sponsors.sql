-- =============================================================================
-- Upsells stap 1
--  1. Behouden in plaats van opzeggen: pauzeren, omzetten of opzeggen als verzoek
--  2. Introducés: limiet per gast per jaar, introductiekaart (tegoed), doorzetten naar lid
--  3. Gezin toevoegen (lead)
--  4. Weekend-add-on voor weekdagleden (losse ronde of maandpas)
--  5. Sponsorplekken in de app
-- =============================================================================

alter type lead_type add value if not exists 'family';
alter type product_category add value if not exists 'playing_right';

-- Rustend lidmaatschap: wel lid, niet spelen
alter table membership_types add column can_play boolean not null default true;

-- Hoe vaak één gast per jaar tegen het introductietarief mag spelen (clubs: 3 tot 10)
alter table clubs add column guest_intro_limit int not null default 5 check (guest_intro_limit between 1 and 52);

-- -----------------------------------------------------------------------------
-- Tegoeden: introductiekaart (x introducés) en weekendrechten (ronde of pas)
-- -----------------------------------------------------------------------------
alter table products
  add column grants_kind text check (grants_kind in ('intro', 'weekend')),
  add column grants_uses int check (grants_uses > 0),      -- null = onbeperkt binnen de looptijd
  add column grants_days int not null default 365 check (grants_days > 0);

create table member_entitlements (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references clubs(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  kind          text not null check (kind in ('intro', 'weekend')),
  uses_left     int check (uses_left >= 0),                 -- null = onbeperkt
  valid_from    date not null,
  valid_until   date not null,
  order_line_id uuid references order_lines(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index member_entitlements_member_idx on member_entitlements (member_id, kind, valid_until);

create table entitlement_uses (
  id             uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references member_entitlements(id) on delete cascade,
  booking_id     uuid not null references tee_bookings(id) on delete cascade,
  member_id      uuid not null references members(id) on delete cascade,
  created_at     timestamptz not null default now()
);
create index entitlement_uses_booking_idx on entitlement_uses (booking_id, member_id);

-- Tegoed aanmaken zodra een product met tegoed besteld is
create function grant_entitlements() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_product products;
  v_order   orders;
begin
  if new.product_id is null then return new; end if;
  select * into v_product from products where id = new.product_id;
  if v_product.grants_kind is null then return new; end if;
  select * into v_order from orders where id = new.order_id;
  insert into member_entitlements (club_id, member_id, kind, uses_left, valid_from, valid_until, order_line_id)
  values (v_order.club_id, v_order.member_id, v_product.grants_kind,
          v_product.grants_uses * new.quantity, v_order.fulfil_on,
          v_order.fulfil_on + v_product.grants_days, new.id);
  return new;
end $$;

create trigger order_lines_grant_entitlements after insert on order_lines
  for each row execute function grant_entitlements();

-- Geannuleerde bestelling: ongebruikt tegoed vervalt
create function revoke_entitlements() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    delete from member_entitlements e
    using order_lines l
    where l.order_id = new.id and e.order_line_id = l.id
      and not exists (select 1 from entitlement_uses u where u.entitlement_id = e.id);
  end if;
  return new;
end $$;

create trigger orders_revoke_entitlements after update of status on orders
  for each row execute function revoke_entitlements();

/** Eén gebruik afboeken van een geldig tegoed; geeft false als er niets is. */
create function use_entitlement(p_member uuid, p_kind text, p_on date, p_booking uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from member_entitlements
  where member_id = p_member and kind = p_kind and p_on between valid_from and valid_until
    and (uses_left is null or uses_left > 0)
  order by (uses_left is null), valid_until   -- eerst beperkte tegoeden die het eerst verlopen
  limit 1 for update;
  if v_id is null then return false; end if;
  update member_entitlements set uses_left = uses_left - 1 where id = v_id and uses_left is not null;
  insert into entitlement_uses (entitlement_id, booking_id, member_id) values (v_id, p_booking, p_member);
  return true;
end $$;
revoke execute on function use_entitlement(uuid, text, date, uuid) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Lidmaatschapsregels bij boeken: rustend lid, weekdaglid met weekendrecht
-- -----------------------------------------------------------------------------
create or replace function enforce_membership_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_starts  timestamptz;
  v_day     date;
  v_weekend boolean;
  v_play    boolean;
  v_type    text;
  v_name    text;
begin
  if new.member_id is null then return new; end if;
  select starts_at into v_starts from tee_bookings where id = new.booking_id;
  v_day := (v_starts at time zone 'Europe/Amsterdam')::date;
  select mt.can_book_weekend, mt.can_play, mt.name, m.first_name into v_weekend, v_play, v_type, v_name
  from members m join membership_types mt on mt.id = m.membership_type_id
  where m.id = new.member_id;

  if v_play = false then
    raise exception 'Het lidmaatschap van % staat op rust', v_name using errcode = 'P0001', hint = 'rustend';
  end if;

  if v_weekend = false and extract(isodow from v_day) in (6, 7) then
    -- Weekendronde of weekendpas gekocht? Dan mag het, en boeken we één gebruik af.
    if not use_entitlement(new.member_id, 'weekend', v_day, new.booking_id) then
      raise exception 'Met een lidmaatschap "%" kan % niet in het weekend spelen', v_type, v_name
        using errcode = 'P0001', hint = 'upgrade_nodig';
    end if;
  end if;
  return new;
end $$;

-- Afmelden: gebruikte tegoeden (weekend, introductiekaart) komen terug
create function restore_entitlements_on_leave() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.member_id is null then return old; end if;
  update member_entitlements e set uses_left = e.uses_left + 1
  from entitlement_uses u
  where u.entitlement_id = e.id and u.booking_id = old.booking_id and u.member_id = old.member_id
    and e.uses_left is not null;
  delete from entitlement_uses where booking_id = old.booking_id and member_id = old.member_id;
  return old;
end $$;

create trigger tee_booking_players_restore_entitlements
  after delete on tee_booking_players
  for each row execute function restore_entitlements_on_leave();

-- -----------------------------------------------------------------------------
-- Introducés
-- -----------------------------------------------------------------------------
create function normalize_guest(p text) returns text language sql immutable as $$
  select lower(regexp_replace(trim(p), '\s+', ' ', 'g'))
$$;

/** Hoe vaak speelden deze gasten dit jaar als introducé bij de club (alle leden samen)? */
create function guest_intro_counts(p_club uuid, p_names text[])
returns table (name text, rounds int, intro_limit int)
language sql stable security definer set search_path = public as $$
  select n, (
    select count(*)::int from tee_booking_players p join tee_bookings b on b.id = p.booking_id
    where b.club_id = p_club and normalize_guest(p.guest_name) = normalize_guest(n)
      and extract(year from b.starts_at at time zone 'Europe/Amsterdam') = extract(year from now() at time zone 'Europe/Amsterdam')
  ), (select guest_intro_limit from clubs where id = p_club)
  from unnest(p_names) n
  where is_club_member(p_club)
$$;

/** Introductiekaart gebruiken voor gasten bij een boeking van het lid. Geeft het aantal afgeboekte gasten. */
create function redeem_intro(p_member uuid, p_booking uuid, p_count int) returns int
language plpgsql security definer set search_path = public as $$
declare
  v_day  date;
  v_done int := 0;
begin
  if p_member not in (select my_member_ids()) then raise exception 'Geen rechten' using errcode = '42501'; end if;
  if not exists (select 1 from tee_booking_players where booking_id = p_booking and member_id = p_member) then
    raise exception 'Je staat niet in deze flight' using errcode = 'P0001';
  end if;
  select (starts_at at time zone 'Europe/Amsterdam')::date into v_day from tee_bookings where id = p_booking;
  for i in 1..greatest(p_count, 0) loop
    exit when not use_entitlement(p_member, 'intro', v_day, p_booking);
    v_done := v_done + 1;
  end loop;
  return v_done;
end $$;

/** Gasten die vaak met dit lid meespelen: kandidaten om uit te nodigen als lid. */
create function my_frequent_guests(p_member uuid, p_min int default 3)
returns table (name text, rounds int, last_played timestamptz)
language sql stable security definer set search_path = public as $$
  select min(g.guest_name), count(*)::int, max(b.starts_at)
  from tee_booking_players me
  join tee_bookings b on b.id = me.booking_id
  join tee_booking_players g on g.booking_id = b.id and g.guest_name is not null
  where me.member_id = p_member and p_member in (select my_member_ids())
    and b.starts_at > now() - interval '12 months' and b.starts_at <= now()
    and not exists (
      select 1 from leads l where l.club_id = b.club_id and normalize_guest(l.name) = normalize_guest(g.guest_name)
    )
  group by normalize_guest(g.guest_name)
  having count(*) >= p_min
  order by count(*) desc
  limit 5
$$;

-- -----------------------------------------------------------------------------
-- Lidmaatschap wijzigen: pauzeren, omzetten, opzeggen (verzoek aan het secretariaat)
-- -----------------------------------------------------------------------------
create type membership_change_kind as enum ('pause', 'switch', 'cancel');
create type membership_change_status as enum ('requested', 'approved', 'rejected');

create table membership_changes (
  id                        uuid primary key default gen_random_uuid(),
  club_id                   uuid not null references clubs(id) on delete cascade,
  member_id                 uuid not null references members(id) on delete cascade,
  kind                      membership_change_kind not null,
  target_membership_type_id uuid references membership_types(id),
  effective_date            date not null,
  reason                    text,
  from_cancel_flow          boolean not null default false,   -- begon als opzegging: behouden lid
  status                    membership_change_status not null default 'requested',
  handled_by                uuid references auth.users(id) on delete set null,
  handled_at                timestamptz,
  created_at                timestamptz not null default now()
);
create index membership_changes_club_idx on membership_changes (club_id, status, created_at desc);

alter table membership_changes enable row level security;
create policy mc_self_read on membership_changes for select using (member_id in (select my_member_ids()));
create policy mc_self_insert on membership_changes for insert
  with check (member_id in (select my_member_ids()) and member_in_club(member_id, club_id) and status = 'requested');
create policy mc_self_delete on membership_changes for delete
  using (member_id in (select my_member_ids()) and status = 'requested');
create policy mc_staff on membership_changes for all
  using (is_club_staff(club_id, array['secretariat']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat']::staff_role[]));
create trigger audit_membership_changes after insert or update or delete on membership_changes
  for each row execute function write_audit_log();

/** Secretariaat keurt goed: lidmaatschap wordt aangepast. */
create function decide_membership_change(p_change uuid, p_approve boolean) returns membership_changes
language plpgsql security definer set search_path = public as $$
declare v membership_changes;
begin
  select * into v from membership_changes where id = p_change for update;
  if not found then raise exception 'Verzoek niet gevonden'; end if;
  if not is_club_staff(v.club_id, array['secretariat']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v.status <> 'requested' then return v; end if;

  if p_approve then
    if v.kind in ('pause', 'switch') then
      update members set membership_type_id = v.target_membership_type_id where id = v.member_id;
    else
      update members set end_date = v.effective_date where id = v.member_id;
    end if;
  end if;

  update membership_changes
  set status = case when p_approve then 'approved' else 'rejected' end::membership_change_status,
      handled_by = auth.uid(), handled_at = now()
  where id = p_change returning * into v;
  return v;
end $$;

-- -----------------------------------------------------------------------------
-- Sponsorplekken
-- -----------------------------------------------------------------------------
create table sponsors (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  name        text not null,
  tagline     text,
  url         text check (url is null or url ~ '^https?://'),
  placement   text not null check (placement in ('home', 'scorecard')),
  hole_number int check (hole_number between 1 and 18),
  fee_cents   bigint not null default 0,          -- afspraak per jaar, voor het overzicht van de club
  valid_until date,
  active      boolean not null default true,
  clicks      int not null default 0,
  created_at  timestamptz not null default now()
);
alter table sponsors enable row level security;
create policy sponsors_read on sponsors for select
  using ((active and (valid_until is null or valid_until >= current_date) and is_club_member(club_id)) or is_club_staff(club_id));
create policy sponsors_write on sponsors for all
  using (is_club_staff(club_id, array['admin','finance']::staff_role[]))
  with check (is_club_staff(club_id, array['admin','finance']::staff_role[]));

/** Tik op een sponsor tellen, zodat de club de sponsor kan laten zien wat het oplevert. */
create function sponsor_click(p_sponsor uuid) returns void
language sql security definer set search_path = public as $$
  update sponsors set clicks = clicks + 1 where id = p_sponsor and is_club_member(club_id)
$$;

-- Tegoeden: leden zien hun eigen tegoed, staf alles
alter table member_entitlements enable row level security;
alter table entitlement_uses    enable row level security;
create policy ent_self_read on member_entitlements for select using (member_id in (select my_member_ids()));
create policy ent_staff_read on member_entitlements for select using (is_club_staff(club_id));
create policy entu_self_read on entitlement_uses for select using (member_id in (select my_member_ids()));
create policy entu_staff_read on entitlement_uses for select
  using (exists (select 1 from member_entitlements e where e.id = entitlement_id and is_club_staff(e.club_id)));
