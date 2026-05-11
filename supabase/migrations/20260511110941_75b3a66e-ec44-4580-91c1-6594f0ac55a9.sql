-- Trivia cache (server-side, admin manages)
CREATE TABLE IF NOT EXISTS public.trivia_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'easy',
  lang text NOT NULL DEFAULT 'pt-PT',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category, difficulty, lang)
);

ALTER TABLE public.trivia_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read trivia cache"
  ON public.trivia_cache FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage trivia cache"
  ON public.trivia_cache FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages trivia cache"
  ON public.trivia_cache FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_trivia_cache_lookup
  ON public.trivia_cache (category, difficulty, lang);

-- Content settings (key/value, admin-only writes; everyone reads)
CREATE TABLE IF NOT EXISTS public.content_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.content_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads content settings"
  ON public.content_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage content settings"
  ON public.content_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER content_settings_updated_at
  BEFORE UPDATE ON public.content_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();