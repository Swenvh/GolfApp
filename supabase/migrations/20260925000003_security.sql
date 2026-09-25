-- =============================================================================
-- GolfApp — autorisatie (Row Level Security) en audit-log (AVG)
--
-- Rollen:
--   lid (app)        : ziet eigen gegevens, clubnieuws, banen, wedstrijden,
--                      ledenlijst (beperkt, opt-out) en eigen facturen.
--   secretariat      : ledenadministratie, starttijden, wedstrijden, nieuws.
--   finance          : alles financieel + leden inzien.
--   admin            : alles binnen de eigen club.
--   marshal          : starttijden en check-in.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helperfuncties (security definer om recursie in RLS te voorkomen)
-- -----------------------------------------------------------------------------
create function is_club_staff(p_club uuid, p_roles staff_role[] default null) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from club_staff
    where club_id = p_club and user_id = auth.uid()
      and (p_roles is null or role = any(p_roles) or role = 'admin')
  )
$$;

create function is_club_member(p_club uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from members
    where club_id = p_club and user_id = auth.uid() and status in ('active', 'suspended')
  ) or is_club_staff(p_club)
$$;

create function my_member_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from members where user_id = auth.uid()
$$;

-- Leden kunnen andere leden niet direct lezen; deze check omzeilt dat gericht.
create function member_in_club(p_member uuid, p_club uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where id = p_member and club_id = p_club and status = 'active')
$$;

-- -----------------------------------------------------------------------------
-- RLS aanzetten op alle tabellen
-- -----------------------------------------------------------------------------
alter table clubs                enable row level security;
alter table club_staff           enable row level security;
alter table membership_types     enable row level security;
alter table members              enable row level security;
alter table courses              enable row level security;
alter table course_tees          enable row level security;
alter table course_holes         enable row level security;
alter table tee_bookings         enable row level security;
alter table tee_booking_players  enable row level security;
alter table competitions         enable row level security;
alter table competition_entries  enable row level security;
alter table rounds               enable row level security;
alter table news_posts           enable row level security;
alter table ledger_accounts      enable row level security;
alter table finance_settings     enable row level security;
alter table journal_entries      enable row level security;
alter table journal_lines        enable row level security;
alter table invoice_counters     enable row level security;
alter table invoices             enable row level security;
alter table invoice_lines        enable row level security;
alter table payments             enable row level security;
alter table sepa_mandates        enable row level security;
alter table direct_debit_batches enable row level security;
alter table direct_debit_items   enable row level security;

-- Clubs ----------------------------------------------------------------------
create policy clubs_read on clubs for select using (is_club_member(id));
create policy clubs_admin_update on clubs for update using (is_club_staff(id, array['admin']::staff_role[]));

-- Staf -----------------------------------------------------------------------
create policy staff_read on club_staff for select using (user_id = auth.uid() or is_club_staff(club_id));
create policy staff_admin on club_staff for all
  using (is_club_staff(club_id, array['admin']::staff_role[]))
  with check (is_club_staff(club_id, array['admin']::staff_role[]));

-- Lidmaatschapsvormen ---------------------------------------------------------
create policy mt_read on membership_types for select using (is_club_member(club_id));
create policy mt_write on membership_types for all
  using (is_club_staff(club_id, array['finance']::staff_role[]))
  with check (is_club_staff(club_id, array['finance']::staff_role[]));

-- Leden ----------------------------------------------------------------------
create policy members_self_read on members for select using (user_id = auth.uid());
create policy members_staff_read on members for select using (is_club_staff(club_id));
create policy members_staff_write on members for all
  using (is_club_staff(club_id, array['secretariat']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat']::staff_role[]));

-- Leden mogen beperkte eigen gegevens wijzigen (contactgegevens, privacy)
create function member_self_update(
  p_member uuid, p_phone text, p_email text, p_street text, p_house_number text,
  p_postal_code text, p_city text, p_show_in_directory boolean
) returns members
language plpgsql security definer set search_path = public as $$
declare v members;
begin
  update members set
    phone = p_phone, email = p_email, street = p_street, house_number = p_house_number,
    postal_code = p_postal_code, city = p_city, show_in_directory = p_show_in_directory
  where id = p_member and user_id = auth.uid()
  returning * into v;
  if not found then raise exception 'Geen rechten' using errcode = '42501'; end if;
  return v;
end $$;

-- Ledenlijst voor leden: alleen naam, handicap en foto (en alleen bij opt-in)
create function club_directory(p_club uuid)
returns table (id uuid, first_name text, infix text, last_name text, handicap_index numeric, photo_url text)
language sql stable security definer set search_path = public as $$
  select m.id, m.first_name, m.infix, m.last_name, m.handicap_index, m.photo_url
  from members m
  where m.club_id = p_club and m.status = 'active' and m.show_in_directory
    and is_club_member(p_club)
  order by m.last_name, m.first_name
$$;

-- Banen ----------------------------------------------------------------------
create policy courses_read on courses for select using (is_club_member(club_id));
create policy courses_write on courses for all
  using (is_club_staff(club_id, array['admin']::staff_role[]))
  with check (is_club_staff(club_id, array['admin']::staff_role[]));

create policy tees_read on course_tees for select
  using (exists (select 1 from courses c where c.id = course_id and is_club_member(c.club_id)));
create policy tees_write on course_tees for all
  using (exists (select 1 from courses c where c.id = course_id and is_club_staff(c.club_id, array['admin']::staff_role[])));

create policy holes_read on course_holes for select
  using (exists (select 1 from courses c where c.id = course_id and is_club_member(c.club_id)));
create policy holes_write on course_holes for all
  using (exists (select 1 from courses c where c.id = course_id and is_club_staff(c.club_id, array['admin']::staff_role[])));

-- Starttijden ----------------------------------------------------------------
-- Leden zien de bezetting (wie speelt wanneer) van hun club
create policy bookings_read on tee_bookings for select using (is_club_member(club_id));
create policy bookings_member_insert on tee_bookings for insert
  with check (created_by = auth.uid() and is_club_member(club_id) and starts_at > now());
create policy bookings_member_delete on tee_bookings for delete
  using ((created_by = auth.uid() and starts_at > now()) or is_club_staff(club_id, array['secretariat','marshal']::staff_role[]));
create policy bookings_staff on tee_bookings for all
  using (is_club_staff(club_id, array['secretariat','marshal']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat','marshal']::staff_role[]));

create policy players_read on tee_booking_players for select
  using (exists (select 1 from tee_bookings b where b.id = booking_id and is_club_member(b.club_id)));
-- Leden mogen zichzelf, clubgenoten en gasten aan een (toekomstige) flight toevoegen
create policy players_insert on tee_booking_players for insert
  with check (exists (
    select 1 from tee_bookings b
    where b.id = booking_id and b.starts_at > now() and is_club_member(b.club_id)
      and (member_id is null or member_in_club(member_id, b.club_id))
  ));
create policy players_delete on tee_booking_players for delete
  using (member_id in (select my_member_ids()) or exists (
    select 1 from tee_bookings b where b.id = booking_id
      and (b.created_by = auth.uid() or is_club_staff(b.club_id, array['secretariat','marshal']::staff_role[]))
  ));
create policy players_staff_update on tee_booking_players for update
  using (exists (select 1 from tee_bookings b where b.id = booking_id
                 and is_club_staff(b.club_id, array['secretariat','marshal']::staff_role[])));

-- Wedstrijden ----------------------------------------------------------------
create policy comp_read on competitions for select
  using ((status <> 'draft' and is_club_member(club_id)) or is_club_staff(club_id));
create policy comp_write on competitions for all
  using (is_club_staff(club_id, array['secretariat']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat']::staff_role[]));

create policy entries_read on competition_entries for select
  using (exists (select 1 from competitions c where c.id = competition_id and is_club_member(c.club_id)));
create policy entries_self_insert on competition_entries for insert
  with check (member_id in (select my_member_ids()) and exists (
    select 1 from competitions c where c.id = competition_id and c.status = 'open'
      and (c.registration_deadline is null or c.registration_deadline > now())
  ));
create policy entries_self_delete on competition_entries for delete
  using (member_id in (select my_member_ids()) and exists (
    select 1 from competitions c where c.id = competition_id and c.status = 'open'
  ));
create policy entries_staff on competition_entries for all
  using (exists (select 1 from competitions c where c.id = competition_id and is_club_staff(c.club_id, array['secretariat']::staff_role[])));

-- Rondes / scorekaarten ---------------------------------------------------------
create policy rounds_self on rounds for select using (member_id in (select my_member_ids()));
create policy rounds_self_insert on rounds for insert
  with check (member_id in (select my_member_ids()) and is_club_member(club_id));
create policy rounds_staff on rounds for all
  using (is_club_staff(club_id, array['secretariat']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat']::staff_role[]));

-- Nieuws ---------------------------------------------------------------------
create policy news_read on news_posts for select
  using ((published_at is not null and published_at <= now() and is_club_member(club_id)) or is_club_staff(club_id));
create policy news_write on news_posts for all
  using (is_club_staff(club_id, array['secretariat']::staff_role[]))
  with check (is_club_staff(club_id, array['secretariat']::staff_role[]));

-- Financieel: alleen finance/admin, leden zien eigen facturen & betalingen ------
create policy la_read on ledger_accounts for select using (is_club_staff(club_id, array['finance']::staff_role[]));
create policy la_write on ledger_accounts for all
  using (is_club_staff(club_id, array['finance']::staff_role[]))
  with check (is_club_staff(club_id, array['finance']::staff_role[]));

create policy fs_all on finance_settings for all
  using (is_club_staff(club_id, array['finance']::staff_role[]))
  with check (is_club_staff(club_id, array['finance']::staff_role[]));

create policy je_read on journal_entries for select using (is_club_staff(club_id, array['finance']::staff_role[]));
create policy je_manual on journal_entries for insert
  with check (source_type = 'manual' and is_club_staff(club_id, array['finance']::staff_role[]));
create policy jl_read on journal_lines for select
  using (exists (select 1 from journal_entries e where e.id = entry_id and is_club_staff(e.club_id, array['finance']::staff_role[])));
create policy jl_manual on journal_lines for insert
  with check (exists (select 1 from journal_entries e where e.id = entry_id and e.source_type = 'manual'
                      and is_club_staff(e.club_id, array['finance']::staff_role[])));

create policy inv_self_read on invoices for select
  using (member_id in (select my_member_ids()) and status <> 'draft');
create policy inv_staff_read on invoices for select using (is_club_staff(club_id, array['finance']::staff_role[]));
create policy inv_staff_insert on invoices for insert
  with check (status = 'draft' and is_club_staff(club_id, array['finance']::staff_role[]));
create policy inv_staff_update_draft on invoices for update
  using (status = 'draft' and is_club_staff(club_id, array['finance']::staff_role[]))
  with check (status = 'draft');
create policy inv_staff_delete_draft on invoices for delete
  using (status = 'draft' and is_club_staff(club_id, array['finance']::staff_role[]));

create policy il_read on invoice_lines for select
  using (exists (select 1 from invoices i where i.id = invoice_id and (
    (i.member_id in (select my_member_ids()) and i.status <> 'draft')
    or is_club_staff(i.club_id, array['finance']::staff_role[]))));
create policy il_write on invoice_lines for all
  using (exists (select 1 from invoices i where i.id = invoice_id and i.status = 'draft'
                 and is_club_staff(i.club_id, array['finance']::staff_role[])))
  with check (exists (select 1 from invoices i where i.id = invoice_id and i.status = 'draft'
                 and is_club_staff(i.club_id, array['finance']::staff_role[])));

create policy pay_self_read on payments for select
  using (exists (select 1 from invoices i where i.id = invoice_id and i.member_id in (select my_member_ids())));
create policy pay_staff_read on payments for select using (is_club_staff(club_id, array['finance']::staff_role[]));
create policy pay_staff_insert on payments for insert
  with check (is_club_staff(club_id, array['finance']::staff_role[]) and created_by = auth.uid());

create policy mandates_self_read on sepa_mandates for select using (member_id in (select my_member_ids()));
create policy mandates_staff on sepa_mandates for all
  using (is_club_staff(club_id, array['finance']::staff_role[]))
  with check (is_club_staff(club_id, array['finance']::staff_role[]));

create policy ddb_staff on direct_debit_batches for all
  using (is_club_staff(club_id, array['finance']::staff_role[]))
  with check (is_club_staff(club_id, array['finance']::staff_role[]));
create policy ddi_staff on direct_debit_items for select
  using (exists (select 1 from direct_debit_batches b where b.id = batch_id and is_club_staff(b.club_id, array['finance']::staff_role[])));

-- -----------------------------------------------------------------------------
-- Audit-log: wie heeft welke persoons- of financiële gegevens gewijzigd (AVG)
-- -----------------------------------------------------------------------------
create table audit_log (
  id          bigint generated always as identity primary key,
  club_id     uuid,
  table_name  text not null,
  record_id   uuid,
  action      text not null,
  changed_by  uuid,
  changed_at  timestamptz not null default now(),
  old_data    jsonb,
  new_data    jsonb
);
create index audit_log_club_idx on audit_log (club_id, changed_at desc);
alter table audit_log enable row level security;
create policy audit_admin_read on audit_log for select using (is_club_staff(club_id, array['admin']::staff_role[]));

create function write_audit_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_row jsonb := to_jsonb(coalesce(new, old));
begin
  insert into audit_log (club_id, table_name, record_id, action, changed_by, old_data, new_data)
  values ((v_row->>'club_id')::uuid, tg_table_name, (v_row->>'id')::uuid, tg_op, auth.uid(),
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create trigger audit_members       after insert or update or delete on members       for each row execute function write_audit_log();
create trigger audit_invoices      after insert or update or delete on invoices      for each row execute function write_audit_log();
create trigger audit_payments      after insert or update or delete on payments      for each row execute function write_audit_log();
create trigger audit_sepa_mandates after insert or update or delete on sepa_mandates for each row execute function write_audit_log();
create trigger audit_club_staff    after insert or update or delete on club_staff    for each row execute function write_audit_log();

-- -----------------------------------------------------------------------------
-- Starttijdenlijst en deelnemerslijst voor leden (alleen weergavenaam)
-- -----------------------------------------------------------------------------
create function member_display_name(m members) returns text language sql immutable as $$
  select m.first_name || ' ' || coalesce(m.infix || ' ', '') || m.last_name
$$;

create function tee_sheet(p_course uuid, p_day date)
returns table (booking_id uuid, starts_at timestamptz, created_by uuid, player_id uuid,
               member_id uuid, player_name text, handicap_index numeric, checked_in boolean)
language sql stable security definer set search_path = public as $$
  select b.id, b.starts_at, b.created_by, p.id, p.member_id,
         coalesce(member_display_name(m), p.guest_name || ' (gast)'), m.handicap_index, p.checked_in
  from tee_bookings b
  join courses c on c.id = b.course_id
  left join tee_booking_players p on p.booking_id = b.id
  left join members m on m.id = p.member_id
  where b.course_id = p_course
    and b.starts_at >= p_day::timestamp at time zone 'Europe/Amsterdam'
    and b.starts_at <  (p_day + 1)::timestamp at time zone 'Europe/Amsterdam'
    and is_club_member(c.club_id)
  order by b.starts_at, p.id
$$;

create function competition_participants(p_competition uuid)
returns table (member_id uuid, name text, handicap_index numeric, registered_at timestamptz,
               gross_score int, net_score int, stableford_points int, "position" int)
language sql stable security definer set search_path = public as $$
  select m.id, member_display_name(m), m.handicap_index, e.registered_at,
         e.gross_score, e.net_score, e.stableford_points, e.position
  from competition_entries e
  join competitions c on c.id = e.competition_id
  join members m on m.id = e.member_id
  where e.competition_id = p_competition and is_club_member(c.club_id)
  order by e.position nulls last, e.registered_at
$$;
