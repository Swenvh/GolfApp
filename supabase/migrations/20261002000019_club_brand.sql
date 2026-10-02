-- =============================================================================
-- Merk per club (branded app en clubbeheer in de clubkleuren)
--  De kleuren zelf staan in de code (packages/shared/src/brand.ts); de database
--  bewaart alleen welk merk een club heeft. Alleen Greenside kiest het merk.
-- =============================================================================

alter table clubs add column brand text check (brand is null or brand ~ '^[a-z0-9-]{1,40}$');
comment on column clubs.brand is 'Sleutel van het merk in packages/shared/src/brand.ts; leeg = Greenside';

-- Het merk hoort bij het contract met Greenside: de club zelf kan het niet wijzigen
create or replace function protect_club_contract() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_platform_staff() and (
       new.slug is distinct from old.slug
    or new.is_review is distinct from old.is_review
    or new.brand is distinct from old.brand
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

-- Greenside HQ: merk van een club zetten (leeg = Greenside)
create function hq_set_brand(p_club uuid, p_brand text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_platform_staff() then
    raise exception 'Alleen Greenside' using errcode = '42501';
  end if;
  if coalesce(p_brand, '') !~ '^([a-z0-9-]{1,40})?$' then
    raise exception 'Ongeldig merk' using errcode = 'P0001';
  end if;
  update clubs set brand = nullif(p_brand, '') where id = p_club;
  if not found then
    raise exception 'Club niet gevonden' using errcode = 'P0001';
  end if;
end $$;
revoke execute on function hq_set_brand(uuid, text) from public, anon;
grant execute on function hq_set_brand(uuid, text) to authenticated;

-- Greenside HQ leest de clubtabel niet direct; het merk via deze functie
create function hq_club_brand(p_club uuid) returns text
language sql stable security definer set search_path = public as $$
  select c.brand from clubs c where c.id = p_club and is_platform_staff()
$$;
revoke execute on function hq_club_brand(uuid) from public, anon;
grant execute on function hq_club_brand(uuid) to authenticated;
