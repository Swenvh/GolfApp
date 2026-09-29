-- =============================================================================
-- Leden uitnodigen voor de app
--  Na het importeren stuurt de club leden een uitnodiging (edge function
--  invite-member). Het lid downloadt de app, vult het e-mailadres in dat de club
--  kent en logt in met de code die het dan krijgt.
-- =============================================================================

alter table members add column app_invited_at timestamptz;
comment on column members.app_invited_at is 'Wanneer het lid een uitnodiging voor de app per e-mail kreeg';

-- Waar leden de app van de club downloaden (zet Greenside zodra de app in de winkels staat)
alter table clubs
  add column app_ios_url text,
  add column app_android_url text,
  add constraint clubs_app_ios_url_https check (app_ios_url is null or app_ios_url ~ '^https://[^\s]+$'),
  add constraint clubs_app_android_url_https check (app_android_url is null or app_android_url ~ '^https://[^\s]+$');

-- De winkellinks horen bij de app die Greenside beheert, net als het contract
create or replace function protect_club_contract() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_platform_staff() and (
       new.slug is distinct from old.slug
    or new.is_review is distinct from old.is_review
    or new.app_ios_url is distinct from old.app_ios_url
    or new.app_android_url is distinct from old.app_android_url
    or new.greenside_status is distinct from old.greenside_status
    or new.greenside_since is distinct from old.greenside_since
    or new.greenside_pilot_until is distinct from old.greenside_pilot_until
    or new.greenside_fee_cents is distinct from old.greenside_fee_cents) then
    raise exception 'Het contract met Greenside kan alleen Greenside wijzigen' using errcode = '42501';
  end if;
  return new;
end $$;
revoke execute on function protect_club_contract() from public, anon, authenticated;

-- Stand van de uitnodigingen voor de club (alleen aantallen). Of een lid al eens
-- heeft ingelogd staat bij de inloggegevens, die de club zelf niet kan lezen.
create function club_app_status(p_club uuid)
returns table (members int, with_email int, without_email int, invited int, logged_in int, to_invite int)
language sql stable security definer set search_path = public as $$
  select
    count(*)::int,
    count(*) filter (where m.email is not null)::int,
    count(*) filter (where m.email is null)::int,
    count(*) filter (where m.app_invited_at is not null)::int,
    count(*) filter (where exists (select 1 from auth.users u where u.id = m.user_id and u.last_sign_in_at is not null))::int,
    count(*) filter (where m.email is not null and m.user_id is null and m.app_invited_at is null)::int
  from members m
  where m.club_id = p_club and m.status in ('active', 'suspended')
  -- Zonder rechten geen rij (en dus ook geen nullen)
  having is_club_staff(p_club, array['secretariat']::staff_role[])
$$;
revoke execute on function club_app_status(uuid) from public, anon;
grant execute on function club_app_status(uuid) to authenticated;

-- Greenside HQ: downloadlinks van de clubapp lezen en zetten
create function hq_app_links(p_club uuid) returns table (ios_url text, android_url text)
language sql stable security definer set search_path = public as $$
  select c.app_ios_url, c.app_android_url from clubs c where c.id = p_club and is_platform_staff()
$$;

create function hq_set_app_links(p_club uuid, p_ios text, p_android text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_platform_staff() then
    raise exception 'Alleen Greenside' using errcode = '42501';
  end if;
  if coalesce(p_ios, '') !~ '^(https://[^\s]+)?$' or coalesce(p_android, '') !~ '^(https://[^\s]+)?$' then
    raise exception 'Een downloadlink begint met https://' using errcode = 'P0001';
  end if;
  update clubs set app_ios_url = nullif(p_ios, ''), app_android_url = nullif(p_android, '') where id = p_club;
end $$;

revoke execute on function hq_app_links(uuid) from public, anon;
grant execute on function hq_app_links(uuid) to authenticated;
revoke execute on function hq_set_app_links(uuid, text, text) from public, anon;
grant execute on function hq_set_app_links(uuid, text, text) to authenticated;
