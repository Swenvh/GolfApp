-- =============================================================================
-- Online betalen (iDEAL via Mollie). Elke club gebruikt haar eigen Mollie-account.
-- Deze tabellen zijn alleen bereikbaar met de service role (edge functions).
-- =============================================================================

create table club_payment_settings (
  club_id         uuid primary key references clubs(id) on delete cascade,
  mollie_api_key  text not null,             -- live_... of test_...
  updated_at      timestamptz not null default now()
);
alter table club_payment_settings enable row level security;  -- geen policies: alleen service role

create table payment_intents (
  provider_payment_id text primary key,       -- Mollie tr_...
  club_id       uuid not null references clubs(id) on delete cascade,
  invoice_id    uuid not null references invoices(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  amount_cents  bigint not null,
  status        text not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table payment_intents enable row level security;
create policy intents_self_read on payment_intents for select using (member_id in (select my_member_ids()));
create policy intents_staff_read on payment_intents for select using (is_club_staff(club_id, array['finance']::staff_role[]));

-- Kan de club online betalingen ontvangen? (zonder de sleutel prijs te geven)
create function club_accepts_online_payments(p_club uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from club_payment_settings where club_id = p_club) and is_club_member(p_club)
$$;

-- Hulpfunctie voor de invite-member edge function (alleen service role)
create function auth_user_id_by_email(p_email text) returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1
$$;
revoke execute on function auth_user_id_by_email(text) from public, anon, authenticated;
