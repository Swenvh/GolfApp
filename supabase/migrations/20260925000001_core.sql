-- =============================================================================
-- GolfApp — kernschema
-- Multi-tenant: elke rij hangt aan een club (club_id). Toegang via RLS.
-- Bedragen altijd in centen (bigint) om afrondingsfouten te voorkomen.
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type staff_role as enum ('admin', 'finance', 'secretariat', 'marshal');
create type member_status as enum ('prospect', 'active', 'suspended', 'resigned');
create type gender as enum ('male', 'female', 'other');

-- -----------------------------------------------------------------------------
-- Clubs
-- -----------------------------------------------------------------------------
create table clubs (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name             text not null,
  ngf_club_code    text,                     -- NGF/GSN verenigingscode
  email            citext,
  phone            text,
  website          text,
  street           text,
  house_number     text,
  postal_code      text,
  city             text,
  kvk_number       text,
  vat_number       text,                     -- BTW-id
  iban             text,
  bic              text,
  sepa_creditor_id text,                     -- Incassant-ID (NLxxZZZ...)
  primary_color    text not null default '#1B5E20',
  logo_url         text,
  payment_term_days int not null default 14,
  created_at       timestamptz not null default now()
);

-- Beheerders/medewerkers van een club (webomgeving)
create table club_staff (
  club_id    uuid not null references clubs(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       staff_role not null,
  created_at timestamptz not null default now(),
  primary key (club_id, user_id, role)
);

-- -----------------------------------------------------------------------------
-- Lidmaatschappen & leden
-- -----------------------------------------------------------------------------
create table membership_types (
  id                 uuid primary key default gen_random_uuid(),
  club_id            uuid not null references clubs(id) on delete cascade,
  name               text not null,          -- bv. "A-lid", "Jeugd", "Weekdaglid"
  description        text,
  annual_fee_cents   bigint not null default 0 check (annual_fee_cents >= 0),
  entrance_fee_cents bigint not null default 0 check (entrance_fee_cents >= 0),
  vat_rate           numeric(4,2) not null default 0,  -- sportverenigingen vaak vrijgesteld
  min_age            int,
  max_age            int,
  can_book_weekend   boolean not null default true,
  active             boolean not null default true,
  unique (club_id, name)
);

create table members (
  id                 uuid primary key default gen_random_uuid(),
  club_id            uuid not null references clubs(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete set null,  -- gekoppeld app-account
  member_number      text not null,
  ngf_number         text,                   -- NGF-/GSN-nummer
  first_name         text not null,
  infix              text,                   -- tussenvoegsel
  last_name          text not null,
  gender             gender,
  date_of_birth      date,
  email              citext,
  phone              text,
  street             text,
  house_number       text,
  postal_code        text,
  city               text,
  country            text not null default 'NL',
  membership_type_id uuid references membership_types(id) on delete set null,
  status             member_status not null default 'active',
  join_date          date not null default current_date,
  end_date           date,
  handicap_index     numeric(3,1) check (handicap_index between -10 and 54),
  handicap_updated_at timestamptz,
  iban               text,
  notes              text,                   -- alleen zichtbaar voor staf
  photo_url          text,
  show_in_directory  boolean not null default true,  -- AVG: opt-out ledenlijst
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (club_id, member_number),
  unique (club_id, user_id)
);
create index members_club_status_idx on members (club_id, status);
create index members_user_idx on members (user_id);
create index members_name_idx on members (club_id, last_name, first_name);

-- -----------------------------------------------------------------------------
-- Banen, tees & holes
-- -----------------------------------------------------------------------------
create table courses (
  id                uuid primary key default gen_random_uuid(),
  club_id           uuid not null references clubs(id) on delete cascade,
  name              text not null,
  holes             int not null default 18 check (holes in (9, 18)),
  first_tee_time    time not null default '07:30',
  last_tee_time     time not null default '17:30',
  interval_minutes  int not null default 10 check (interval_minutes between 5 and 30),
  max_players       int not null default 4 check (max_players between 1 and 4),
  booking_days_ahead int not null default 7,
  active            boolean not null default true
);

create table course_tees (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  name          text not null,               -- "Geel", "Rood", ...
  gender        gender not null,
  course_rating numeric(4,1) not null,
  slope_rating  int not null check (slope_rating between 55 and 155),
  par           int not null
);

create table course_holes (
  course_id     uuid not null references courses(id) on delete cascade,
  number        int not null check (number between 1 and 18),
  par           int not null check (par between 3 and 6),
  stroke_index  int not null check (stroke_index between 1 and 18),
  primary key (course_id, number)
);

-- -----------------------------------------------------------------------------
-- Starttijden
-- -----------------------------------------------------------------------------
create table tee_bookings (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  starts_at   timestamptz not null,
  created_by  uuid references auth.users(id) on delete set null,
  notes       text,
  created_at  timestamptz not null default now(),
  unique (course_id, starts_at)
);
create index tee_bookings_day_idx on tee_bookings (club_id, starts_at);

create table tee_booking_players (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references tee_bookings(id) on delete cascade,
  member_id   uuid references members(id) on delete cascade,
  guest_name  text,
  checked_in  boolean not null default false,
  check (member_id is not null or guest_name is not null),
  unique (booking_id, member_id)
);

-- Maximaal aantal spelers per flight afdwingen
create function enforce_flight_size() returns trigger
language plpgsql as $$
declare
  v_max int;
  v_count int;
begin
  select c.max_players into v_max
  from tee_bookings b join courses c on c.id = b.course_id
  where b.id = new.booking_id;

  select count(*) into v_count from tee_booking_players where booking_id = new.booking_id;
  if v_count >= v_max then
    raise exception 'Deze flight is vol (max % spelers)', v_max using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger tee_booking_players_size
  before insert on tee_booking_players
  for each row execute function enforce_flight_size();

-- -----------------------------------------------------------------------------
-- Wedstrijden & scores
-- -----------------------------------------------------------------------------
create type competition_format as enum ('stableford', 'strokeplay', 'matchplay', 'greensome', 'foursome', 'texas_scramble');
create type competition_status as enum ('draft', 'open', 'closed', 'finished');

create table competitions (
  id                    uuid primary key default gen_random_uuid(),
  club_id               uuid not null references clubs(id) on delete cascade,
  course_id             uuid references courses(id) on delete set null,
  name                  text not null,
  description           text,
  starts_at             timestamptz not null,
  registration_deadline timestamptz,
  format                competition_format not null default 'stableford',
  max_participants      int,
  entry_fee_cents       bigint not null default 0,
  max_handicap          numeric(3,1),
  qualifying            boolean not null default true,
  status                competition_status not null default 'draft',
  created_at            timestamptz not null default now()
);
create index competitions_club_idx on competitions (club_id, starts_at);

create table competition_entries (
  competition_id  uuid not null references competitions(id) on delete cascade,
  member_id       uuid not null references members(id) on delete cascade,
  registered_at   timestamptz not null default now(),
  playing_handicap int,
  gross_score     int,
  net_score       int,
  stableford_points int,
  position        int,
  primary key (competition_id, member_id)
);

create function int_array_sum(int[]) returns int
language sql immutable parallel safe as $$
  select coalesce(sum(v), 0)::int from unnest($1) v
$$;

create table rounds (
  id               uuid primary key default gen_random_uuid(),
  club_id          uuid not null references clubs(id) on delete cascade,
  member_id        uuid not null references members(id) on delete cascade,
  course_tee_id    uuid references course_tees(id) on delete set null,
  competition_id   uuid references competitions(id) on delete set null,
  played_on        date not null default current_date,
  hole_scores      int[] not null,           -- bruto slagen per hole
  course_handicap  int,
  gross_score      int generated always as (int_array_sum(hole_scores)) stored,
  stableford_points int,
  score_differential numeric(4,1),           -- WHS, berekend in de app
  qualifying       boolean not null default false,
  marker_member_id uuid references members(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index rounds_member_idx on rounds (member_id, played_on desc);

-- -----------------------------------------------------------------------------
-- Nieuws
-- -----------------------------------------------------------------------------
create table news_posts (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references clubs(id) on delete cascade,
  title        text not null,
  body         text not null,
  image_url    text,
  pinned       boolean not null default false,
  published_at timestamptz,
  author_id    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index news_posts_club_idx on news_posts (club_id, published_at desc);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
create function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger members_touch before update on members
  for each row execute function touch_updated_at();
