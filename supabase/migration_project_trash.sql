-- Add soft-delete (trash) support to projects table
alter table public.projects
  add column if not exists is_trashed boolean not null default false,
  add column if not exists trashed_at timestamptz;

-- Index for fast trash queries
create index if not exists idx_projects_is_trashed on public.projects(user_id, is_trashed);
