-- Add push_token column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Example Edge Function Trigger (Conceptual)
-- This is where you would logic out the "Mascot is hungry" check
-- and send a push via FCM.
