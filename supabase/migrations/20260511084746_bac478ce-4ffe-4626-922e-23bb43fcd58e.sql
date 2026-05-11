
-- Infinite challenges progress snapshot per user (mirrors junior_cloud pattern)
CREATE TABLE IF NOT EXISTS public.infinite_progress (
  user_id uuid PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.infinite_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own infinite progress"
  ON public.infinite_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Linked parents view child infinite progress"
  ON public.infinite_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    WHERE pl.parent_id = auth.uid()
      AND pl.child_id = infinite_progress.user_id
      AND pl.status = 'accepted'
  ));

CREATE TRIGGER trg_infinite_progress_updated
  BEFORE UPDATE ON public.infinite_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-attempt scores fueling weekly ranking + seasonal tournaments
CREATE TABLE IF NOT EXISTS public.infinite_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track_id text NOT NULL,
  level int NOT NULL DEFAULT 1,
  score int NOT NULL DEFAULT 0,
  stars int NOT NULL DEFAULT 0,
  age int,
  age_group text,
  region text,
  week_start date NOT NULL DEFAULT (date_trunc('week', now())::date),
  season text NOT NULL DEFAULT to_char(now(), 'YYYY-"Q"Q'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_infinite_scores_week ON public.infinite_scores (week_start, score DESC);
CREATE INDEX IF NOT EXISTS idx_infinite_scores_season ON public.infinite_scores (season, score DESC);
CREATE INDEX IF NOT EXISTS idx_infinite_scores_user ON public.infinite_scores (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_infinite_scores_region_age ON public.infinite_scores (region, age_group, week_start);

ALTER TABLE public.infinite_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read scores for ranking"
  ON public.infinite_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users insert own scores"
  ON public.infinite_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
