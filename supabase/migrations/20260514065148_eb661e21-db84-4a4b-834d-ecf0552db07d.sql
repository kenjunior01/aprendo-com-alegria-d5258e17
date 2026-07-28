
-- Leagues: invite code
ALTER TABLE public.leagues
  ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- Backfill any existing rows with a code
UPDATE public.leagues
SET invite_code = upper(substr(md5(random()::text || id::text), 1, 6))
WHERE invite_code IS NULL;

ALTER TABLE public.leagues
  ALTER COLUMN invite_code SET NOT NULL,
  ALTER COLUMN invite_code SET DEFAULT upper(substr(md5(random()::text), 1, 6));

CREATE UNIQUE INDEX IF NOT EXISTS leagues_invite_code_uidx
  ON public.leagues(invite_code);

-- League members: child profile + stats + bot difficulty
ALTER TABLE public.league_members
  ADD COLUMN IF NOT EXISTS child_id TEXT,
  ADD COLUMN IF NOT EXISTS child_name TEXT,
  ADD COLUMN IF NOT EXISTS child_age INTEGER,
  ADD COLUMN IF NOT EXISTS bot_difficulty TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS games_played INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_played_at TIMESTAMPTZ;

-- Replace single (league_id,user_id) uniqueness with (league_id,user_id,child_id)
ALTER TABLE public.league_members
  DROP CONSTRAINT IF EXISTS league_members_league_id_user_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS league_members_unique_child_idx
  ON public.league_members(league_id, COALESCE(user_id::text,''), COALESCE(child_id,''));
