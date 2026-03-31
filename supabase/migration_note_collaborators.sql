-- Note Collaborators: Real-time collaboration support
-- Run this in the Supabase SQL Editor

-- 1. Create note_collaborators table
create table if not exists public.note_collaborators (
  id uuid primary key default gen_random_uuid(),
  note_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'viewer' check (role in ('viewer', 'editor')),
  created_at timestamptz not null default now(),
  unique(note_id, user_id)
);

create index idx_note_collaborators_note on public.note_collaborators(note_id);
create index idx_note_collaborators_user on public.note_collaborators(user_id);

alter table public.note_collaborators enable row level security;

-- 2. RLS policies for note_collaborators
-- Only note owner can manage collaborators
create policy "Owner can view collaborators"
  on public.note_collaborators for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.notes where notes.id = note_id and notes.user_id = auth.uid()
    )
  );

create policy "Owner can add collaborators"
  on public.note_collaborators for insert
  with check (
    exists (
      select 1 from public.notes where notes.id = note_id and notes.user_id = auth.uid()
    )
    and user_id != auth.uid()  -- cannot share with yourself
  );

create policy "Owner can remove collaborators"
  on public.note_collaborators for delete
  using (
    exists (
      select 1 from public.notes where notes.id = note_id and notes.user_id = auth.uid()
    )
  );

-- 3. Update notes RLS: allow collaborators to SELECT and editors to UPDATE
-- First drop the old permissive "all" policy
drop policy if exists "Users can CRUD own notes" on public.notes;

-- Owner can do everything
create policy "Owner full access"
  on public.notes for all
  using (auth.uid() = user_id);

-- Collaborators can view shared notes
create policy "Collaborators can view shared notes"
  on public.notes for select
  using (
    exists (
      select 1 from public.note_collaborators
      where note_collaborators.note_id = notes.id
        and note_collaborators.user_id = auth.uid()
    )
  );

-- Editors can update shared notes
create policy "Editors can update shared notes"
  on public.notes for update
  using (
    exists (
      select 1 from public.note_collaborators
      where note_collaborators.note_id = notes.id
        and note_collaborators.user_id = auth.uid()
        and note_collaborators.role = 'editor'
    )
  );

-- 4. Allow profile lookup by email (for sharing)
create policy "Users can find profiles by email"
  on public.profiles for select
  using (true);

-- 5. Add note_collaborators to realtime
alter publication supabase_realtime add table public.note_collaborators;
