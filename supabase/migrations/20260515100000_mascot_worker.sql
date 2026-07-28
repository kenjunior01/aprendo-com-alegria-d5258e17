-- Function to decay mascot needs over time
-- This can be called by a cron job every hour
CREATE OR REPLACE FUNCTION public.decay_mascot_needs()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles
  SET
    hunger = GREATEST(0, hunger - 5),
    energy = GREATEST(0, energy - 2),
    fun = GREATEST(0, fun - 8)
  WHERE last_played >= (now() - interval '3 days'); -- Only active users in the last 3 days
END;
$$;

-- Enable the pg_cron extension if available (Supabase standard)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule decay every hour
SELECT cron.schedule('mascot-decay-hourly', '0 * * * *', 'SELECT public.decay_mascot_needs()');

-- Schedule notification check every 2 hours at minute 30
-- Replace <FUNCTION_URL> and <SERVICE_KEY> with actual values or use a wrapper
-- Usually better to call the Edge Function via a simple HTTP request from cron
-- SELECT cron.schedule('mascot-notification-check', '30 */2 * * *', $$
--   SELECT net.http_post(
--     url := 'https://<PROJECT_REF>.functions.supabase.co/notify-hungry-mascot',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
--   )
-- $$);
