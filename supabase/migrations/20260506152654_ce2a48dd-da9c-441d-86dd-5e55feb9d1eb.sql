ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_pin text,
  ADD COLUMN IF NOT EXISTS daily_limit_min integer,
  ADD COLUMN IF NOT EXISTS bedtime_hour integer;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_parent_pin_format CHECK (parent_pin IS NULL OR parent_pin ~ '^[0-9]{4}$'),
  ADD CONSTRAINT profiles_daily_limit_range CHECK (daily_limit_min IS NULL OR (daily_limit_min >= 0 AND daily_limit_min <= 480)),
  ADD CONSTRAINT profiles_bedtime_range CHECK (bedtime_hour IS NULL OR (bedtime_hour >= 0 AND bedtime_hour <= 23));