-- Washpro Sourcing Radar, core schema.
-- All money is stored ex GST in NZD. The basis the source quoted is recorded
-- alongside so every conversion is auditable (see 7, Money).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- People and app level configuration
-- ---------------------------------------------------------------------------

create type user_role as enum ('admin', 'viewer');

create table app_users (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text not null unique,
  display_name     text,
  role             user_role not null default 'viewer',
  -- Alert routing. The Cloud API cannot post to a WhatsApp group, so every
  -- recipient is an individual thread with its own opt in (see 9.1).
  whatsapp_number  text,
  whatsapp_opt_in  boolean not null default false,
  email_alerts     boolean not null default true,
  web_push_opt_in  boolean not null default false,
  quiet_hours_start smallint not null default 21 check (quiet_hours_start between 0 and 23),
  quiet_hours_end   smallint not null default 6  check (quiet_hours_end   between 0 and 23),
  timezone         text not null default 'Pacific/Auckland',
  created_at       timestamptz not null default now()
);

-- Single row table of server controlled config. The extension reads its pacing
-- from here so it can be dialled back without a re release (see 6.3).
create table app_config (
  id                        boolean primary key default true check (id),
  home_region               text not null default 'Auckland',
  facebook_adapter_enabled  boolean not null default false,
  fb_min_seconds_between_searches integer not null default 90,
  fb_max_seconds_between_searches integer not null default 180,
  fb_max_searches_per_hour        integer not null default 20,
  alerts_per_recipient_per_hour   integer not null default 6,
  digest_threshold                integer not null default 5,
  updated_at                timestamptz not null default now()
);
insert into app_config (id) values (true) on conflict do nothing;

create table device_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references app_users (id) on delete cascade,
  label       text not null,
  token_hash  text not null unique,
  last_seen_at timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sources and the buying profile
-- ---------------------------------------------------------------------------

create table sources (
  slug                  text primary key,
  name                  text not null,
  -- Which adapter engine runs this row. Several NZ auction houses share one
  -- white label platform, so a new house is a row rather than new code (6.1).
  adapter_type          text not null check (adapter_type in
                          ('json_catalogue', 'html_listing', 'email_inbound', 'extension', 'manual_clip')),
  enabled               boolean not null default false,
  poll_interval_seconds integer not null default 1800,
  region_default        text,
  -- Buyer's premium is stored against the house, never hardcoded (see 6.1).
  buyers_premium_pct    numeric(5,2),
  buyers_premium_basis  text check (buyers_premium_basis in ('inc_gst', 'ex_gst')),
  -- Endpoint, field mapping and selectors live here, filled in from the
  -- discovery worksheet in docs/DISCOVERY.md. Empty until discovery is done.
  config                jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now()
);

create table watch_terms (
  id                uuid primary key default gen_random_uuid(),
  label             text not null,
  keywords          text[] not null default '{}',
  negative_keywords text[] not null default '{}',
  category          text,
  max_price_ex_gst  numeric(12,2),
  region            text,
  source_slugs      text[] not null default '{}',
  active            boolean not null default true,
  created_by        uuid references app_users (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index watch_terms_active_idx on watch_terms (active);

-- Exclusions that apply to every term. Searching "Hobart" returns domestic
-- mixers, and a feed full of those is abandoned in week one (see 5).
create table global_negative_keywords (
  keyword    text primary key,
  created_at timestamptz not null default now()
);

create table brands (
  name        text primary key,
  source_note text,
  active      boolean not null default true
);

create table categories (
  name   text primary key,
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------

create type price_basis as enum ('ex_gst', 'inc_gst', 'unknown');

create table listings (
  id                uuid primary key default gen_random_uuid(),
  source_slug       text not null references sources (slug),
  external_id       text,
  title             text not null,
  description       text,
  -- Null is a real value. Turners shows "Pricing coming soon" on items awaiting
  -- valuation, and those lots are still worth surfacing (see 6.1d).
  price_ex_gst      numeric(12,2),
  price_original    numeric(12,2),
  price_basis       price_basis not null default 'unknown',
  currency          text not null default 'NZD',
  url               text not null,
  image_urls        text[] not null default '{}',
  cached_image_path text,
  image_phash       text,
  seller_name       text,
  region            text,
  region_raw        text,
  out_of_region     boolean not null default false,
  lot_number        text,
  auction_name      text,
  viewing_details   text,
  listed_at         timestamptz,
  closes_at         timestamptz,
  sold_price_ex_gst numeric(12,2),
  sold_at           timestamptz,
  raw               jsonb not null default '{}'::jsonb,
  content_hash      text not null,
  first_seen_at     timestamptz not null default now(),
  last_seen_at      timestamptz not null default now()
);

-- Same listing seen twice from one source (see 8). external_id is preferred,
-- content_hash is the fallback when the source does not expose a stable id.
create unique index listings_source_external_idx
  on listings (source_slug, external_id) where external_id is not null;
create unique index listings_source_hash_idx
  on listings (source_slug, content_hash) where external_id is null;
create index listings_first_seen_idx on listings (first_seen_at desc);
create index listings_region_idx on listings (region);
create index listings_closes_at_idx on listings (closes_at);

create table listing_matches (
  listing_id       uuid not null references listings (id) on delete cascade,
  watch_term_id    uuid not null references watch_terms (id) on delete cascade,
  score            numeric(6,3) not null default 0,
  matched_keywords text[] not null default '{}',
  under_max_price  boolean not null default false,
  created_at       timestamptz not null default now(),
  primary key (listing_id, watch_term_id)
);
create index listing_matches_term_idx on listing_matches (watch_term_id, created_at desc);

create type listing_state as enum ('new', 'watching', 'dismissed', 'bought');

-- One state row per listing per user. Three people must not chase the same
-- machine, so who changed it and when are both recorded (see 4).
create table listing_states (
  listing_id uuid not null references listings (id) on delete cascade,
  user_id    uuid not null references app_users (id) on delete cascade,
  state      listing_state not null default 'new',
  note       text,
  updated_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

create table duplicate_candidates (
  listing_a  uuid not null references listings (id) on delete cascade,
  listing_b  uuid not null references listings (id) on delete cascade,
  similarity numeric(4,3) not null,
  reasons    text[] not null default '{}',
  resolved   boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (listing_a, listing_b),
  check (listing_a < listing_b)
);

-- ---------------------------------------------------------------------------
-- Ingestion health and alerting
-- ---------------------------------------------------------------------------

create type run_status as enum ('running', 'ok', 'error', 'not_configured', 'skipped');

create table ingestion_runs (
  id            uuid primary key default gen_random_uuid(),
  source_slug   text not null references sources (slug),
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  listings_seen integer not null default 0,
  listings_new  integer not null default 0,
  status        run_status not null default 'running',
  error         text,
  detail        jsonb not null default '{}'::jsonb
);
create index ingestion_runs_source_idx on ingestion_runs (source_slug, started_at desc);

-- Raw inbound payloads, kept so a failed parse can be replayed once the parser
-- is fixed rather than the listings being lost (see 6.2).
create table raw_payloads (
  id           uuid primary key default gen_random_uuid(),
  source_slug  text not null references sources (slug),
  kind         text not null,
  body         text not null,
  headers      jsonb not null default '{}'::jsonb,
  parsed_ok    boolean not null default false,
  parse_error  text,
  replayed_at  timestamptz,
  received_at  timestamptz not null default now()
);

create type alert_channel as enum ('whatsapp', 'email', 'web_push');
create type alert_kind as enum ('single', 'digest');

create table alerts (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid references listings (id) on delete set null,
  user_id      uuid not null references app_users (id) on delete cascade,
  channel      alert_channel not null,
  kind         alert_kind not null default 'single',
  listing_ids  uuid[] not null default '{}',
  template     text,
  sent_at      timestamptz,
  delivered    boolean not null default false,
  provider_id  text,
  error        text,
  created_at   timestamptz not null default now()
);
create index alerts_user_sent_idx on alerts (user_id, sent_at desc);

-- One row per listing per recipient, claimed before any send is attempted.
-- This is what makes "no alert fires twice for the same listing" true even if
-- two ingestion runs overlap (see 14).
create table alert_queue (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references listings (id) on delete cascade,
  user_id       uuid not null references app_users (id) on delete cascade,
  run_id        uuid references ingestion_runs (id) on delete set null,
  queued_at     timestamptz not null default now(),
  deliver_after timestamptz not null default now(),
  dispatched_at timestamptz,
  reason        text,
  unique (listing_id, user_id)
);
create index alert_queue_pending_idx on alert_queue (deliver_after) where dispatched_at is null;

create table source_health_alerts (
  id          uuid primary key default gen_random_uuid(),
  source_slug text not null references sources (slug),
  reason      text not null,
  detail      text,
  raised_at   timestamptz not null default now(),
  cleared_at  timestamptz
);
