-- Catalog of achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'geral',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  coin_reward INTEGER NOT NULL DEFAULT 10,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by authenticated users"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

-- User-unlocked achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_code TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_code)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocked achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocked achievements"
ON public.user_achievements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Parents linked to a child can view that child's achievements
CREATE POLICY "Linked parents can view child achievements"
ON public.user_achievements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parent_links pl
    WHERE pl.parent_id = auth.uid()
      AND pl.child_id = user_achievements.user_id
      AND pl.status = 'accepted'
  )
);

-- Seed initial achievements
INSERT INTO public.achievements (code, title, description, icon, category, requirement_type, requirement_value, coin_reward, xp_reward, sort_order) VALUES
  ('first_lesson', 'Primeiros Passos', 'Completa a tua primeira lição', 'sparkles', 'progresso', 'lessons_completed', 1, 20, 10, 1),
  ('lessons_5', 'Aprendiz', 'Completa 5 lições', 'book-open', 'progresso', 'lessons_completed', 5, 30, 20, 2),
  ('lessons_15', 'Estudioso', 'Completa 15 lições', 'graduation-cap', 'progresso', 'lessons_completed', 15, 60, 50, 3),
  ('lessons_30', 'Mestre do Saber', 'Completa 30 lições', 'crown', 'progresso', 'lessons_completed', 30, 120, 100, 4),
  ('streak_3', 'Em Chamas', 'Mantém uma sequência de 3 dias', 'flame', 'consistencia', 'streak', 3, 30, 15, 10),
  ('streak_7', 'Imparável', 'Mantém uma sequência de 7 dias', 'zap', 'consistencia', 'streak', 7, 70, 40, 11),
  ('streak_30', 'Lenda', 'Mantém uma sequência de 30 dias', 'star', 'consistencia', 'streak', 30, 300, 200, 12),
  ('xp_100', 'Cem Pontos', 'Alcança 100 XP', 'trophy', 'xp', 'xp', 100, 25, 0, 20),
  ('xp_500', 'Quinhentos Pontos', 'Alcança 500 XP', 'trophy', 'xp', 'xp', 500, 75, 0, 21),
  ('xp_1000', 'Mil Pontos', 'Alcança 1000 XP', 'trophy', 'xp', 'xp', 1000, 150, 0, 22),
  ('coins_100', 'Mealheiro', 'Junta 100 Abracadinhos', 'coins', 'economia', 'coins_total', 100, 20, 0, 30),
  ('first_purchase', 'Primeira Compra', 'Compra o teu primeiro item na loja', 'shopping-bag', 'economia', 'items_owned', 1, 15, 0, 31),
  ('perfect_lesson', 'Sem Erros!', 'Termina uma lição com 100% de acerto', 'target', 'precisao', 'perfect_lessons', 1, 25, 15, 40);
