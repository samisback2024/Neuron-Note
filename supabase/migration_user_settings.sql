-- Migration: Add user_settings table for persisting user preferences server-side
-- This enables settings sync across devices when a user is authenticated.
-- The client-side settings store uses localStorage as the primary store for
-- immediate responsiveness, with this table as the authoritative sync target.

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode text NOT NULL DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  accent_color text NOT NULL DEFAULT 'blue' CHECK (accent_color IN ('blue', 'violet', 'green', 'rose', 'amber', 'teal')),
  density text NOT NULL DEFAULT 'comfortable' CHECK (density IN ('comfortable', 'compact')),
  reduced_motion boolean NOT NULL DEFAULT false,
  high_contrast boolean NOT NULL DEFAULT false,
  font_scale real NOT NULL DEFAULT 1.0,
  notification_email boolean NOT NULL DEFAULT true,
  notification_desktop boolean NOT NULL DEFAULT false,
  notification_daily_summary boolean NOT NULL DEFAULT true,
  notification_product_updates boolean NOT NULL DEFAULT true,
  notification_security_alerts boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE OR REPLACE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable realtime for cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
