-- Verbeteringen na code review: tegoeden, lidmaatschapswijzigingen per ingangsdatum,
-- introducé-telling per jaar van de ronde en een expliciet greenfeetarief voor introducés.

-- -----------------------------------------------------------------------------
-- Tegoeden teruggeven per gebruik
-- -----------------------------------------------------------------------------
-- Elk verwijderd gebruik geeft precies één keer tegoed terug. Dat werkt ook als een hele
-- starttijd wordt verwijderd (cascade) en als er meerdere introducés van één kaart zijn afgeboekt.
create function restore_entitlement_use() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update member_entitlements set uses_left = uses_left + 1
  where id = old.entitlement_id and uses_left is not null;
  return old;
end $$;

create trigger entitlement_uses_restore after delete on entitlement_uses
  for each row execute function restore_entitlement_use();

create or replace function restore_entitlements_on_leave() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.member_id is null then return old; end if;
  delete from entitlement_uses where booking_id = old.booking_id and member_id = old.member_id;
  return old;
end $$;

-- Speler verplaatst naar een andere starttijd: het weekendgebruik van de oude starttijd komt terug
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
  if tg_op = 'UPDATE' then
    if new.booking_id is not distinct from old.booking_id and new.member_id is not distinct from old.member_id then
      return new;
    end if;
    delete from entitlement_uses u using member_entitlements e
    where u.entitlement_id = e.id and e.kind = 'weekend'
      and u.booking_id = old.booking_id and u.member_id = old.member_id;
  end if;
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
    if not use_entitlement(new.member_id, 'weekend', v_day, new.booking_id) then
      raise exception 'Met een lidmaatschap "%" kan % niet in het weekend spelen', v_type, v_name
        using errcode = 'P0001', hint = 'upgrade_nodig';
    end if;
  end if;
  return new;
end $$;

-- Annuleren van een bestelling met tegoed: alleen zolang er niets van gebruikt is
create or replace function revoke_entitlements() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    if exists (
      select 1 from member_entitlements e join order_lines l on l.id = e.order_line_id
      join entitlement_uses u on u.entitlement_id = e.id
      where l.order_id = new.id
    ) then
      raise exception 'Dit tegoed is al gebruikt en kan niet meer geannuleerd worden'
        using errcode = 'P0001', hint = 'tegoed_gebruikt';
    end if;
    delete from member_entitlements e using order_lines l
    where l.order_id = new.id and e.order_line_id = l.id;
  end if;
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- Lidmaatschapswijzigingen gaan in op de ingangsdatum
-- -----------------------------------------------------------------------------
alter table membership_changes add column applied_at timestamptz;
update membership_changes set applied_at = handled_at where status = 'approved' and effective_date <= current_date;

-- Pauzeren en omzetten hebben een nieuwe vorm nodig, opzeggen niet
alter table membership_changes add constraint membership_changes_target_check
  check ((kind = 'cancel') = (target_membership_type_id is null));

-- De nieuwe vorm moet van dezelfde club zijn
create function check_membership_change_target() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.target_membership_type_id is not null and not exists (
    select 1 from membership_types t where t.id = new.target_membership_type_id and t.club_id = new.club_id
  ) then
    raise exception 'Onbekend lidmaatschap voor deze club' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger membership_changes_target before insert or update of target_membership_type_id, club_id
  on membership_changes for each row execute function check_membership_change_target();

create function apply_membership_change_internal(v membership_changes) returns void
language plpgsql security definer set search_path = public as $$
begin
  if v.kind in ('pause', 'switch') then
    update members set membership_type_id = v.target_membership_type_id where id = v.member_id;
  else
    update members set end_date = v.effective_date where id = v.member_id;
  end if;
  update membership_changes set applied_at = now() where id = v.id;
end $$;
revoke execute on function apply_membership_change_internal(membership_changes) from public, anon, authenticated;

create or replace function decide_membership_change(p_change uuid, p_approve boolean) returns membership_changes
language plpgsql security definer set search_path = public as $$
declare v membership_changes;
begin
  select * into v from membership_changes where id = p_change for update;
  if not found then raise exception 'Verzoek niet gevonden'; end if;
  if not is_club_staff(v.club_id, array['secretariat']::staff_role[]) then
    raise exception 'Geen rechten' using errcode = '42501';
  end if;
  if v.status <> 'requested' then return v; end if;

  update membership_changes
  set status = case when p_approve then 'approved' else 'rejected' end::membership_change_status,
      handled_by = auth.uid(), handled_at = now()
  where id = p_change returning * into v;

  -- Opzeggen zet alleen de einddatum en mag dus direct; pauzeren en omzetten pas op de ingangsdatum
  if p_approve and (v.kind = 'cancel' or v.effective_date <= (now() at time zone 'Europe/Amsterdam')::date) then
    perform apply_membership_change_internal(v);
    select * into v from membership_changes where id = p_change;
  end if;
  return v;
end $$;

/** Goedgekeurde wijzigingen doorvoeren waarvan de ingangsdatum is bereikt. Draait elke nacht. */
create function apply_due_membership_changes() returns int
language plpgsql security definer set search_path = public as $$
declare
  v membership_changes;
  n int := 0;
begin
  for v in
    select * from membership_changes
    where status = 'approved' and applied_at is null
      and effective_date <= (now() at time zone 'Europe/Amsterdam')::date
    order by effective_date, created_at
    for update skip locked
  loop
    perform apply_membership_change_internal(v);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function apply_due_membership_changes() from public, anon, authenticated;

-- Nachtelijke taak (Supabase heeft pg_cron; zonder pg_cron slaan we dit over)
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('greenside-membership-changes', '5 0 * * *', 'select public.apply_due_membership_changes()');
  end if;
exception when others then
  raise notice 'pg_cron niet beschikbaar: %', sqlerrm;
end $$;

-- -----------------------------------------------------------------------------
-- Introducés: tellen per jaar van de ronde
-- -----------------------------------------------------------------------------
drop function guest_intro_counts(uuid, text[]);
/** Hoe vaak speelden deze gasten in het jaar van p_day als introducé bij de club (alle leden samen)? */
create function guest_intro_counts(p_club uuid, p_names text[], p_day date default null)
returns table (name text, rounds int, intro_limit int)
language sql stable security definer set search_path = public as $$
  select n, (
    select count(*)::int from tee_booking_players p join tee_bookings b on b.id = p.booking_id
    where b.club_id = p_club and normalize_guest(p.guest_name) = normalize_guest(n)
      and extract(year from b.starts_at at time zone 'Europe/Amsterdam')
          = extract(year from coalesce(p_day, (now() at time zone 'Europe/Amsterdam')::date))
  ), (select guest_intro_limit from clubs where id = p_club)
  from unnest(p_names) n
  where is_club_member(p_club)
$$;

-- -----------------------------------------------------------------------------
-- Greenfee voor introducés: welk product is het introductietarief, welk de gewone greenfee
-- -----------------------------------------------------------------------------
alter table products add column guest_rate text check (guest_rate in ('intro', 'regular'));
create unique index products_guest_rate_idx on products (club_id, guest_rate) where guest_rate is not null and active;
