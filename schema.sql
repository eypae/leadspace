-- ─────────────────────────────────────────────────────────────────
-- WhatsApp Lead CRM — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────

-- Segments (e.g. Offices, Condominiums, Bungalows)
create table if not exists segments (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text,                    -- hex colour for UI badges, e.g. '#378ADD'
  description text,
  created_at  timestamptz not null default now()
);

-- Clients (one row per lead / contact)
create table if not exists clients (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null unique,    -- E.164 format, e.g. '+6591234567'
  wa_id           text,                    -- WhatsApp ID (phone digits without +)
  followup_date   date,                    -- reminder date shown beside client name
  followup_note   text,                    -- reason / context for the follow-up
  last_message_at timestamptz,             -- updated on every inbound/outbound msg
  created_at      timestamptz not null default now()
);

-- Many-to-many: a client can be in multiple segments
create table if not exists client_segments (
  client_id  uuid not null references clients(id) on delete cascade,
  segment_id uuid not null references segments(id) on delete cascade,
  primary key (client_id, segment_id)
);

-- Every WhatsApp message, inbound and outbound
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id) on delete cascade,
  direction  text not null check (direction in ('in', 'out')),
  body       text not null,
  wa_msg_id  text,                          -- Meta's message ID (for status updates)
  status     text not null default 'sent'
             check (status in ('sent', 'delivered', 'read', 'failed')),
  created_at timestamptz not null default now()
);

-- Broadcast history log
create table if not exists broadcasts (
  id            uuid primary key default gen_random_uuid(),
  segment_id    uuid references segments(id) on delete set null,
  template_name text not null,
  body          text not null,              -- message body (for your records)
  sent_count    int  not null default 0,
  sent_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────
-- Indexes (speeds up common queries)
-- ─────────────────────────────────────────────────────────────────
create index if not exists idx_clients_wa_id         on clients(wa_id);
create index if not exists idx_clients_followup_date on clients(followup_date);
create index if not exists idx_messages_client_id    on messages(client_id);
create index if not exists idx_messages_wa_msg_id    on messages(wa_msg_id);

-- ─────────────────────────────────────────────────────────────────
-- Enable Realtime (for push notifications in the dashboard)
-- ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table clients;

-- ─────────────────────────────────────────────────────────────────
-- Seed data — starter segments (edit as you like)
-- ─────────────────────────────────────────────────────────────────
insert into segments (name, color, description) values
  ('Offices',      '#378ADD', 'Clients looking for office spaces'),
  ('Condominiums', '#1D9E75', 'Clients interested in condominiums'),
  ('Bungalows',    '#D85A30', 'Clients looking for landed / bungalow properties'),
  ('HDB',          '#7F77DD', 'Clients looking for HDB resale flats')
on conflict do nothing;