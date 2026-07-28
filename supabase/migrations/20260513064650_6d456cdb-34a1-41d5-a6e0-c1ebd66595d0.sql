
-- Ligas semanais
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL DEFAULT 'mixed',
  starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ends_on   DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.league_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID,                 -- null => bot
  bot_name TEXT,                -- when user_id null
  bot_mascot TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads leagues" ON public.leagues
  FOR SELECT USING (true);
CREATE POLICY "admins manage leagues" ON public.leagues
  FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "auth create leagues" ON public.leagues
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "anyone reads members" ON public.league_members
  FOR SELECT USING (true);
CREATE POLICY "users join league" ON public.league_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "users update own score" ON public.league_members
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins manage members" ON public.league_members
  FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

CREATE INDEX IF NOT EXISTS leagues_active_idx ON public.leagues(ends_on);
CREATE INDEX IF NOT EXISTS league_members_league_idx ON public.league_members(league_id, score DESC);
