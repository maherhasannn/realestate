-- ============================================================
-- Signal CRM — Supabase Migration (Firebase Auth edition)
-- Run this in the Supabase SQL Editor
--
-- Auth is handled by Firebase. Supabase is used for database only.
-- user_id columns store the Firebase UID (text).
-- RLS is disabled — data isolation is enforced by app-level
-- filtering on user_id in every query.
-- ============================================================

-- 1. Profiles (created by the app after Firebase signup)
create table if not exists profiles (
  id text primary key,              -- Firebase UID
  full_name text,
  email text,
  brokerage text,
  role text default 'Agent',
  plan text default 'Pro',
  created_at timestamptz default now()
);


-- 2. Sellers
create table if not exists sellers (
  id bigint generated always as identity primary key,
  user_id text not null,            -- Firebase UID
  address text not null,
  city text,
  score int default 0,
  est bigint default 0,
  trigger_reason text,
  days int default 0,
  in_outreach boolean default false,
  agent text,
  beds int,
  baths int,
  sqft int,
  year_built int,
  lot text,
  owner_since int,
  mortgage_balance text,
  last_sale text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create index if not exists sellers_user_id_idx on sellers(user_id);


-- 3. Campaigns
create table if not exists campaigns (
  id bigint generated always as identity primary key,
  user_id text not null,            -- Firebase UID
  name text not null,
  channel text,
  status text default 'draft' check (status in ('active', 'paused', 'draft')),
  sent int default 0,
  responses int default 0,
  rate numeric(5,1) default 0,
  agent text,
  created_at timestamptz default now()
);

create index if not exists campaigns_user_id_idx on campaigns(user_id);


-- 4. Campaign ↔ Seller junction
create table if not exists campaign_sellers (
  id bigint generated always as identity primary key,
  campaign_id bigint references campaigns on delete cascade not null,
  seller_id bigint references sellers on delete cascade not null,
  unique (campaign_id, seller_id)
);


-- 5. Team Members
create table if not exists team_members (
  id bigint generated always as identity primary key,
  user_id text not null,            -- Firebase UID
  name text not null,
  email text,
  role text default 'Agent',
  status text default 'active' check (status in ('active', 'inactive', 'invited')),
  created_at timestamptz default now()
);

create index if not exists team_members_user_id_idx on team_members(user_id);


-- 6. Integrations
create table if not exists integrations (
  id bigint generated always as identity primary key,
  user_id text not null,            -- Firebase UID
  name text not null,
  description text,
  connected boolean default false,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists integrations_user_id_idx on integrations(user_id);


-- 7. Activity Log
create table if not exists activity_log (
  id bigint generated always as identity primary key,
  user_id text not null,            -- Firebase UID
  seller_id bigint references sellers on delete set null,
  campaign_id bigint references campaigns on delete set null,
  event text not null,
  event_type text,
  occurred_at timestamptz default now()
);

create index if not exists activity_log_user_id_idx on activity_log(user_id);


-- 8. Analytics Snapshots
create table if not exists analytics_snapshots (
  id bigint generated always as identity primary key,
  user_id text not null,            -- Firebase UID
  week_label text,
  projected_listings int default 0,
  identified int default 0,
  contacted int default 0,
  responded int default 0,
  listed int default 0,
  snapshot_date date default current_date
);

create index if not exists analytics_snapshots_user_id_idx on analytics_snapshots(user_id);
