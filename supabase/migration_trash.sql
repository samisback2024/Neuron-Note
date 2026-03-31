-- Trash / Recently Deleted system for notes
-- Run this in the Supabase SQL Editor

-- 1. Add trash columns to notes table
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS is_trashed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trashed_at timestamptz;

-- 2. Index for efficient trash queries
CREATE INDEX IF NOT EXISTS idx_notes_trashed
  ON public.notes(user_id, is_trashed, trashed_at);

-- 3. Auto-cleanup function: permanently delete notes trashed 30+ days ago
CREATE OR REPLACE FUNCTION public.cleanup_trashed_notes()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.notes
  WHERE is_trashed = true
    AND trashed_at < now() - interval '30 days';
$$;

-- 4. Schedule cleanup via pg_cron (runs daily at 3 AM UTC)
-- Note: pg_cron must be enabled in Supabase Dashboard > Database > Extensions
SELECT cron.schedule(
  'cleanup-trashed-notes',
  '0 3 * * *',
  $$SELECT public.cleanup_trashed_notes()$$
);
