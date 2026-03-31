-- Note Collaborators: Real-time collaboration support
-- Run this in the Supabase SQL Editor

-- 1. Create helper function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_note_owner(p_note_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.notes 
    WHERE id = p_note_id AND user_id = auth.uid()
  );
$$;

-- 2. Create note_collaborators table
CREATE TABLE IF NOT EXISTS public.note_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(note_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_note_collaborators_note ON public.note_collaborators(note_id);
CREATE INDEX IF NOT EXISTS idx_note_collaborators_user ON public.note_collaborators(user_id);

ALTER TABLE public.note_collaborators ENABLE ROW LEVEL SECURITY;

-- 3. Update notes RLS policies
DROP POLICY IF EXISTS "Users can CRUD own notes" ON public.notes;
DROP POLICY IF EXISTS "Owner full access" ON public.notes;
DROP POLICY IF EXISTS "Collaborators can view shared notes" ON public.notes;
DROP POLICY IF EXISTS "Editors can update shared notes" ON public.notes;

CREATE POLICY "Owner full access"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared notes"
  ON public.notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.note_collaborators
      WHERE note_collaborators.note_id = id
        AND note_collaborators.user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can update shared notes"
  ON public.notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.note_collaborators
      WHERE note_collaborators.note_id = id
        AND note_collaborators.user_id = auth.uid()
        AND note_collaborators.role = 'editor'
    )
  );

-- 4. note_collaborators RLS (uses is_note_owner to avoid recursion)
DROP POLICY IF EXISTS "Owner can view collaborators" ON public.note_collaborators;
DROP POLICY IF EXISTS "Owner can add collaborators" ON public.note_collaborators;
DROP POLICY IF EXISTS "Owner can remove collaborators" ON public.note_collaborators;

CREATE POLICY "Owner can view collaborators"
  ON public.note_collaborators FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_note_owner(note_id)
  );

CREATE POLICY "Owner can add collaborators"
  ON public.note_collaborators FOR INSERT
  WITH CHECK (
    is_note_owner(note_id)
    AND user_id != auth.uid()
  );

CREATE POLICY "Owner can remove collaborators"
  ON public.note_collaborators FOR DELETE
  USING (
    is_note_owner(note_id)
  );

-- 5. Allow profile lookup by email (for sharing)
DROP POLICY IF EXISTS "Users can find profiles by email" ON public.profiles;
CREATE POLICY "Users can find profiles by email"
  ON public.profiles FOR SELECT
  USING (true);

-- 6. Add to realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.note_collaborators;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
