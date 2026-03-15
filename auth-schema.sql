-- ─────────────────────────────────────────────────────────────────
-- WA Lead CRM — Auth schema (simplified)
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────
-- AGENTS TABLE
-- Stores all agent accounts. Linked to Supabase auth.users.
-- You manually insert rows here for each agent.
-- ─────────────────────────────────────────────────────────────────

create table if not exists agents (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null,
  email        text        not null unique,
  role         text        not null default 'agent'
               check (role in ('agent', 'admin')),
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now()
);

alter table agents enable row level security;

create policy if not exists "Agents can read all agents"
  on agents for select
  using (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────────────────────
-- HOW TO ADD AN AGENT
--
-- Step 1: Create the user in Supabase auth
--   Go to: Dashboard → Authentication → Users → Add user
--   Enter their email and password. Tick "Auto Confirm User".
--   Copy the UUID from the users list.
--
-- Step 2: Insert a row into the agents table
--   Replace the values below and run it.
-- ─────────────────────────────────────────────────────────────────

insert into agents (id, display_name, email, role)
values (
  'paste-uuid-from-auth-users-here',
  'Your Name',
  'you@example.com',
  'agent'
)
on conflict do nothing;


-- ─────────────────────────────────────────────────────────────────
-- HOW TO DEACTIVATE AN AGENT (without deleting them)
-- ─────────────────────────────────────────────────────────────────

-- update agents set is_active = false where email = 'agent@example.com';


-- ─────────────────────────────────────────────────────────────────
-- VIEW: useful for checking all agents at a glance
-- ─────────────────────────────────────────────────────────────────

create or replace view agents_overview as
select
  a.id,
  a.display_name,
  a.email,
  a.role,
  a.is_active,
  a.created_at,
  u.last_sign_in_at
from agents a
join auth.users u on u.id = a.id
order by a.created_at;