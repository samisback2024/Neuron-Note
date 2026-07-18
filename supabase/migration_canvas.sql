-- Visual Workspace: canvas nodes (Phase 1 — infinite canvas + basic node system)
-- Run this in the Supabase SQL Editor

create table if not exists public.canvas_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type text not null default 'sticky' check (type in ('sticky', 'text', 'shape')),
  position_x double precision not null default 0,
  position_y double precision not null default 0,
  width double precision,
  height double precision,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_canvas_nodes_user on public.canvas_nodes(user_id);

alter table public.canvas_nodes enable row level security;
create policy "Users can CRUD own canvas_nodes" on public.canvas_nodes for all using (auth.uid() = user_id);

alter publication supabase_realtime add table public.canvas_nodes;
