-- Neuron Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  avatar_url text,
  workspace text not null default 'Personal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, workspace)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    'Personal'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;
create policy "Users can CRUD own notes" on public.notes for all using (auth.uid() = user_id);

create index idx_notes_user_id on public.notes(user_id);
create index idx_notes_updated_at on public.notes(updated_at desc);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null default '',
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  project_id uuid,
  project_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users can CRUD own tasks" on public.tasks for all using (auth.uid() = user_id);

create index idx_tasks_user_id on public.tasks(user_id);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null default '',
  description text not null default '',
  color text not null default '#4F7DF3',
  due_date date,
  members integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Users can CRUD own projects" on public.projects for all using (auth.uid() = user_id);

-- Add foreign key from tasks to projects
alter table public.tasks add constraint fk_tasks_project
  foreign key (project_id) references public.projects(id) on delete set null;

-- Bookmarks
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  url text not null,
  title text not null default '',
  description text not null default '',
  image text,
  tags text[] not null default '{}',
  collection text,
  created_at timestamptz not null default now()
);

alter table public.bookmarks enable row level security;
create policy "Users can CRUD own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- Note Links (for knowledge graph)
create table if not exists public.note_links (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.notes(id) on delete cascade not null,
  target_id uuid references public.notes(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(source_id, target_id)
);

alter table public.note_links enable row level security;
create policy "Users can CRUD own note_links" on public.note_links for all using (auth.uid() = user_id);

-- Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid references auth.users on delete cascade not null,
  color text not null default '#4F7DF3',
  created_at timestamptz not null default now(),
  unique(name, user_id)
);

alter table public.tags enable row level security;
create policy "Users can CRUD own tags" on public.tags for all using (auth.uid() = user_id);

-- Note Tags (many-to-many)
create table if not exists public.note_tags (
  note_id uuid references public.notes(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (note_id, tag_id)
);

alter table public.note_tags enable row level security;
create policy "Users can CRUD own note_tags" on public.note_tags
  for all using (
    exists (select 1 from public.notes where notes.id = note_id and notes.user_id = auth.uid())
  );

-- Chat Messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
create policy "Users can CRUD own chat_messages" on public.chat_messages for all using (auth.uid() = user_id);

create index idx_chat_messages_user_id on public.chat_messages(user_id);

-- Enable realtime for all tables
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.bookmarks;
alter publication supabase_realtime add table public.note_links;
alter publication supabase_realtime add table public.chat_messages;

-- Updated_at trigger function
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_notes_updated_at before update on public.notes
  for each row execute function public.update_updated_at();
create trigger update_tasks_updated_at before update on public.tasks
  for each row execute function public.update_updated_at();
create trigger update_projects_updated_at before update on public.projects
  for each row execute function public.update_updated_at();
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
