-- =============================================================================
-- Beveiligingsaudit
--  1. Clubs strikt gescheiden: een lid op een factuur, machtiging, bestelling,
--     verzoek, lead, ronde, tegoed of betaling hoort altijd bij dezelfde club.
--  2. Niemand buiten Greenside kan het contract van een club wijzigen
--     (status, proefperiode, licentiebedrag, webadres).
--  3. Handicart-gegevens (gezondheid, AVG bijzondere persoonsgegevens) alleen
--     via de eigen functies, niet rechtstreeks op te vragen.
--  4. Geen enkele bedrijfsfunctie aanroepbaar zonder in te loggen.
--  5. Sponsorlinks alleen https.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Lid en club horen bij elkaar
-- -----------------------------------------------------------------------------
create function ensure_member_same_club() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_member_club uuid;
begin
  if new.member_id is null then return new; end if;
  select club_id into v_member_club from members where id = new.member_id;
  if v_member_club is distinct from new.club_id then
    raise exception 'Dit lid hoort niet bij deze club' using errcode = '42501';
  end if;
  return new;
end $$;

create trigger invoices_same_club          before insert or update of member_id, club_id on invoices          for each row execute function ensure_member_same_club();
create trigger orders_same_club            before insert or update of member_id, club_id on orders            for each row execute function ensure_member_same_club();
create trigger sepa_mandates_same_club     before insert or update of member_id, club_id on sepa_mandates     for each row execute function ensure_member_same_club();
create trigger membership_changes_same_club before insert or update of member_id, club_id on membership_changes for each row execute function ensure_member_same_club();
create trigger leads_same_club             before insert or update of member_id, club_id on leads             for each row execute function ensure_member_same_club();
create trigger rounds_same_club            before insert or update of member_id, club_id on rounds            for each row execute function ensure_member_same_club();
create trigger member_entitlements_same_club before insert or update of member_id, club_id on member_entitlements for each row execute function ensure_member_same_club();
create trigger payment_intents_same_club   before insert or update of member_id, club_id on payment_intents   for each row execute function ensure_member_same_club();

-- Wedstrijdinschrijving: het lid hoort bij de club van de wedstrijd
create function ensure_entry_same_club() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from competitions c join members m on m.club_id = c.club_id
    where c.id = new.competition_id and m.id = new.member_id
  ) then
    raise exception 'Dit lid hoort niet bij de club van deze wedstrijd' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger competition_entries_same_club before insert or update of member_id, competition_id on competition_entries
  for each row execute function ensure_entry_same_club();

-- Zelf een ronde of inschrijving invoeren: alleen voor het eigen lidmaatschap bij díe club
drop policy rounds_self_insert on rounds;
create policy rounds_self_insert on rounds for insert
  with check (member_id in (select my_member_ids()) and member_in_club(member_id, club_id));

drop policy entries_self_insert on competition_entries;
create policy entries_self_insert on competition_entries for insert
  with check (
    member_id in (select my_member_ids())
    and exists (select 1 from competitions c
                where c.id = competition_entries.competition_id and c.status = 'open'
                  and (c.registration_deadline is null or c.registration_deadline > now())
                  and member_in_club(competition_entries.member_id, c.club_id)));

-- -----------------------------------------------------------------------------
-- 2. Het contract van een club is van Greenside
-- -----------------------------------------------------------------------------
create function protect_club_contract() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Ingelogde gebruikers die niet van Greenside zijn, mogen deze velden niet wijzigen.
  -- (Migraties, seeds en de service role hebben geen gebruiker en mogen het wel.)
  if auth.uid() is not null and not is_platform_staff() and (
       new.slug is distinct from old.slug
    or new.greenside_status is distinct from old.greenside_status
    or new.greenside_since is distinct from old.greenside_since
    or new.greenside_pilot_until is distinct from old.greenside_pilot_until
    or new.greenside_fee_cents is distinct from old.greenside_fee_cents) then
    raise exception 'Het contract met Greenside kan alleen Greenside wijzigen' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger clubs_protect_contract before update on clubs
  for each row execute function protect_club_contract();

-- -----------------------------------------------------------------------------
-- 3 en 4. Wie mag welke functie aanroepen
-- -----------------------------------------------------------------------------
-- Handicart-status van een willekeurig lid: alleen intern (bestellingen gebruiken het)
revoke execute on function has_valid_handicart(uuid, date) from public, anon, authenticated;

do $$
declare
  f record;
  -- Hulpfuncties die in toegangsregels (RLS) staan: blijven aanroepbaar, ze geven voor
  -- niet-ingelogde bezoekers gewoon 'nee'
  v_rls_helpers text[] := array['is_club_member', 'is_club_staff', 'is_platform_staff', 'my_member_ids', 'member_in_club'];
begin
  for f in
    select p.oid::regprocedure as sig, p.proname,
           coalesce(array_to_string(p.proacl, ','), '') as acl,
           p.prorettype = 'trigger'::regtype as is_trigger
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      -- functies van extensies (citext, pgcrypto) niet aanraken
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    continue when f.proname = any(v_rls_helpers);
    execute format('revoke execute on function %s from public, anon', f.sig);
    -- Functies die ingelogde gebruikers al mochten aanroepen, houden dat recht;
    -- interne functies (zonder dat recht) blijven dicht
    -- (lege acl = standaard = PUBLIC; '=X/' aan het begin van een regel = PUBLIC)
    if not f.is_trigger and (f.acl = '' or f.acl ~ '(^|,)authenticated=X/' or f.acl ~ '(^|,)=X/') then
      execute format('grant execute on function %s to authenticated', f.sig);
    end if;
  end loop;
end $$;

-- De interne functies die hierboven via PUBLIC openstonden, expliciet weer dicht
revoke execute on function has_valid_handicart(uuid, date) from authenticated;
revoke execute on function ensure_member_same_club() from authenticated;
revoke execute on function ensure_entry_same_club() from authenticated;
revoke execute on function protect_club_contract() from authenticated;

-- Nieuwe functies krijgen voortaan geen rechten voor iedereen
alter default privileges in schema public revoke execute on functions from public, anon;

-- -----------------------------------------------------------------------------
-- 5. Sponsorlinks: alleen https
-- -----------------------------------------------------------------------------
update sponsors set url = null where url is not null and url !~ '^https://';
alter table sponsors add constraint sponsors_url_https check (url is null or url ~ '^https://[^\s]+$');
