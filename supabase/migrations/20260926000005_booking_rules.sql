-- =============================================================================
-- Boekingsregels en opschoning
--  1. Een lid kan niet in twee flights staan waarvan de rondes overlappen.
--  2. Boeken gebeurt in één transactie (flight + spelers), zonder lege flights
--     achter te laten als een speler geweigerd wordt.
--  3. Clubkleur vervalt: de app heeft één vast merkthema (Greenside).
-- =============================================================================

-- Hoe lang een ronde op deze baan duurt; bepaalt wanneer twee boekingen overlappen
alter table courses add column round_minutes int not null default 240
  check (round_minutes between 30 and 360);

alter table clubs drop column primary_color;

-- -----------------------------------------------------------------------------
-- Controle bij elke speler die aan een flight wordt toegevoegd
-- -----------------------------------------------------------------------------
create or replace function enforce_flight_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_booking  record;
  v_count    int;
  v_conflict record;
begin
  -- Gelijktijdige boekingen voor dezelfde flight of hetzelfde lid netjes na elkaar afhandelen
  perform pg_advisory_xact_lock(hashtext('flight:' || new.booking_id::text));
  if new.member_id is not null then
    perform pg_advisory_xact_lock(hashtext('member:' || new.member_id::text));
  end if;

  select b.starts_at, c.max_players, c.round_minutes, c.club_id
    into v_booking
  from tee_bookings b join courses c on c.id = b.course_id
  where b.id = new.booking_id;

  -- 1. Flight vol?
  select count(*) into v_count from tee_booking_players
  where booking_id = new.booking_id and id is distinct from new.id;
  if v_count >= v_booking.max_players then
    raise exception 'Deze flight is vol (max % spelers)', v_booking.max_players using errcode = 'P0001';
  end if;

  -- 2. Speelt dit lid op dat moment al ergens anders?
  if new.member_id is not null then
    select b.starts_at, c.name as course_name, m.first_name, m.infix, m.last_name
      into v_conflict
    from tee_booking_players p
    join tee_bookings b on b.id = p.booking_id
    join courses c on c.id = b.course_id
    join members m on m.id = p.member_id
    where p.member_id = new.member_id
      and p.booking_id <> new.booking_id
      and b.club_id = v_booking.club_id
      -- Rondes overlappen als elk begint voordat de ander klaar is
      and b.starts_at < v_booking.starts_at + make_interval(mins => v_booking.round_minutes)
      and v_booking.starts_at < b.starts_at + make_interval(mins => c.round_minutes)
    limit 1;

    if found then
      raise exception '% staat al ingeschreven om % op de %',
        v_conflict.first_name || ' ' || coalesce(v_conflict.infix || ' ', '') || v_conflict.last_name,
        to_char(v_conflict.starts_at at time zone 'Europe/Amsterdam', 'HH24:MI'),
        v_conflict.course_name
        using errcode = 'P0001', hint = 'dubbele_boeking';
    end if;
  end if;

  return new;
end $$;

drop trigger tee_booking_players_size on tee_booking_players;
drop function enforce_flight_size();

create trigger tee_booking_players_rules
  before insert or update of booking_id, member_id on tee_booking_players
  for each row execute function enforce_flight_rules();

-- -----------------------------------------------------------------------------
-- Boeken in één transactie. Security invoker: de RLS-regels van het lid gelden.
-- Bestaat de flight al (iemand anders was eerder), dan sluiten de spelers aan.
-- -----------------------------------------------------------------------------
create function book_tee_time(
  p_course uuid, p_starts_at timestamptz, p_member_ids uuid[] default '{}', p_guest_names text[] default '{}'
) returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  v_club    uuid;
  v_booking uuid;
begin
  if coalesce(array_length(p_member_ids, 1), 0) + coalesce(array_length(p_guest_names, 1), 0) = 0 then
    raise exception 'Voeg minimaal één speler toe' using errcode = 'P0001';
  end if;

  select club_id into v_club from courses where id = p_course and active;
  if v_club is null then raise exception 'Baan niet gevonden' using errcode = 'P0001'; end if;

  insert into tee_bookings (club_id, course_id, starts_at, created_by)
  values (v_club, p_course, p_starts_at, auth.uid())
  on conflict (course_id, starts_at) do nothing
  returning id into v_booking;

  if v_booking is null then
    select id into v_booking from tee_bookings where course_id = p_course and starts_at = p_starts_at;
  end if;

  insert into tee_booking_players (booking_id, member_id)
  select v_booking, unnest(p_member_ids);

  insert into tee_booking_players (booking_id, guest_name)
  select v_booking, g from unnest(p_guest_names) g where trim(g) <> '';

  return v_booking;
end $$;
