-- Greenside HQ: het overzicht voor Greenside zelf, over alle clubs heen.
-- Alleen medewerkers van Greenside (platform_staff) zien dit; clubs zien elkaars gegevens nooit.

-- -----------------------------------------------------------------------------
-- Klantrelatie per club
-- -----------------------------------------------------------------------------
alter table clubs
  add column greenside_status text not null default 'actief' check (greenside_status in ('pilot', 'actief', 'opgezegd')),
  add column greenside_since date not null default current_date,
  add column greenside_pilot_until date;

-- -----------------------------------------------------------------------------
-- Medewerkers van Greenside
-- -----------------------------------------------------------------------------
create table platform_staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text,
  created_at timestamptz not null default now()
);
alter table platform_staff enable row level security;
create policy platform_staff_self on platform_staff for select using (user_id = auth.uid());

create function is_platform_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from platform_staff where user_id = auth.uid())
$$;

-- -----------------------------------------------------------------------------
-- Verkoop: clubs waarmee we in gesprek zijn
-- -----------------------------------------------------------------------------
create table hq_prospects (
  id                  uuid primary key default gen_random_uuid(),
  club_name           text not null,
  city                text,
  members_estimate    int check (members_estimate >= 0),
  stage               text not null default 'lead' check (stage in ('lead', 'demo', 'proefperiode', 'gewonnen', 'verloren')),
  monthly_value_cents bigint not null default 0 check (monthly_value_cents >= 0),
  contact_name        text,
  contact_email       text,
  next_step           text,
  next_date           date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index hq_prospects_stage_idx on hq_prospects (stage, next_date);
alter table hq_prospects enable row level security;
create policy hq_prospects_staff on hq_prospects for all using (is_platform_staff()) with check (is_platform_staff());
create trigger hq_prospects_touch before update on hq_prospects for each row execute function touch_updated_at();

-- -----------------------------------------------------------------------------
-- Overzicht per klant (laatste 30 dagen)
-- -----------------------------------------------------------------------------
create function hq_club_overview()
returns table (
  club_id uuid, name text, city text, status text, since date, pilot_until date, fee_cents bigint,
  members int, active_30d int, flights_30d int, app_revenue_30d_cents bigint, orders_30d int,
  last_activity timestamptz, bank_ready boolean, payments_ready boolean, open_leads int, retained int
)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, c.city, c.greenside_status, c.greenside_since, c.greenside_pilot_until, c.greenside_fee_cents,
    (select count(*)::int from members m where m.club_id = c.id and m.status = 'active'),
    -- Leden die de app echt gebruiken: in 30 dagen geboekt of besteld
    (select count(distinct x.member_id)::int from (
       select p.member_id from tee_booking_players p join tee_bookings b on b.id = p.booking_id
       where b.club_id = c.id and p.member_id is not null and b.starts_at > now() - interval '30 days' and b.starts_at <= now()
       union
       select o.member_id from orders o where o.club_id = c.id and o.created_at > now() - interval '30 days'
     ) x),
    (select count(*)::int from tee_bookings b where b.club_id = c.id and b.starts_at > now() - interval '30 days' and b.starts_at <= now()),
    (select coalesce(sum(r.revenue_incl_cents), 0)::bigint from app_revenue r
     where r.club_id = c.id and r.fulfil_on > current_date - 30 and r.fulfil_on <= current_date),
    (select count(*)::int from orders o where o.club_id = c.id and o.status <> 'cancelled' and o.created_at > now() - interval '30 days'),
    greatest(
      (select max(b.starts_at) from tee_bookings b where b.club_id = c.id and b.starts_at <= now()),
      (select max(o.created_at) from orders o where o.club_id = c.id)),
    c.iban is not null and c.sepa_creditor_id is not null,
    exists (select 1 from club_payment_settings s where s.club_id = c.id),
    (select count(*)::int from leads l where l.club_id = c.id and l.status = 'new'),
    (select count(*)::int from membership_changes mc
     where mc.club_id = c.id and mc.from_cancel_flow and mc.kind <> 'cancel' and mc.status <> 'rejected')
  from clubs c
  where is_platform_staff()
  order by c.name
$$;

-- Per week, alle klanten samen: omzet die leden via de app regelden en aantal flights
create function hq_weekly(p_weeks int default 12)
returns table (week_start date, app_revenue_cents bigint, flights int)
language sql stable security definer set search_path = public as $$
  select w::date,
    (select coalesce(sum(r.revenue_incl_cents), 0)::bigint from app_revenue r
     where r.fulfil_on >= w::date and r.fulfil_on < w::date + 7),
    (select count(*)::int from tee_bookings b
     where (b.starts_at at time zone 'Europe/Amsterdam')::date >= w::date
       and (b.starts_at at time zone 'Europe/Amsterdam')::date < w::date + 7)
  from generate_series(date_trunc('week', current_date) - make_interval(weeks => p_weeks - 1), date_trunc('week', current_date), interval '1 week') w
  where is_platform_staff()
  order by 1
$$;

revoke execute on function hq_club_overview() from anon;
revoke execute on function hq_weekly(int) from anon;
