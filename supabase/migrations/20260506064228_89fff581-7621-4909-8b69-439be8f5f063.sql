
-- 1. Expand profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gems integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grade integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS owned_items text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipped_item text,
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'child' CHECK (role IN ('child','parent'));

-- 2. practice_sessions
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject_id text NOT NULL,
  lesson_id text NOT NULL,
  grade integer NOT NULL,
  correct integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  coins_earned integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_created ON public.practice_sessions(user_id, created_at DESC);
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_sessions" ON public.practice_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_sessions" ON public.practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. parent_links
CREATE TABLE IF NOT EXISTS public.parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  child_id uuid,
  invite_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON public.parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_child ON public.parent_links(child_id);
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_view_own_links" ON public.parent_links
  FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = child_id);
CREATE POLICY "parents_create_links" ON public.parent_links
  FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "parties_update_links" ON public.parent_links
  FOR UPDATE USING (auth.uid() = parent_id OR auth.uid() = child_id);

-- Allow a parent to read the linked child's profile and sessions
CREATE POLICY "parents_view_linked_child_profile" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links pl
      WHERE pl.parent_id = auth.uid()
        AND pl.child_id = profiles.id
        AND pl.status = 'accepted'
    )
  );

CREATE POLICY "parents_view_linked_child_sessions" ON public.practice_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_links pl
      WHERE pl.parent_id = auth.uid()
        AND pl.child_id = practice_sessions.user_id
        AND pl.status = 'accepted'
    )
  );

-- 4. shop_items (public catalog)
CREATE TABLE IF NOT EXISTS public.shop_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hat','outfit','scene','badge')),
  price integer NOT NULL DEFAULT 0,
  mascot text,
  emoji text NOT NULL DEFAULT '🎁',
  premium boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_view_shop" ON public.shop_items FOR SELECT USING (true);

-- Seed shop items
INSERT INTO public.shop_items (id, name, type, price, mascot, emoji, premium, sort_order) VALUES
  ('hat-crown', 'Coroa Real', 'hat', 100, NULL, '👑', false, 1),
  ('hat-party', 'Chapéu de Festa', 'hat', 50, NULL, '🎉', false, 2),
  ('hat-wizard', 'Chapéu de Mago', 'hat', 150, NULL, '🧙', false, 3),
  ('hat-graduation', 'Chapéu de Formatura', 'hat', 200, NULL, '🎓', false, 4),
  ('hat-pirate', 'Chapéu de Pirata', 'hat', 120, NULL, '🏴‍☠️', false, 5),
  ('outfit-superhero', 'Capa de Super-herói', 'outfit', 250, NULL, '🦸', false, 10),
  ('outfit-scientist', 'Bata de Cientista', 'outfit', 200, NULL, '🥼', false, 11),
  ('outfit-astronaut', 'Fato Astronauta', 'outfit', 400, NULL, '🚀', true, 12),
  ('scene-beach', 'Cenário Praia', 'scene', 150, NULL, '🏖️', false, 20),
  ('scene-space', 'Cenário Espaço', 'scene', 300, NULL, '🌌', false, 21),
  ('scene-forest', 'Cenário Floresta', 'scene', 150, NULL, '🌳', false, 22),
  ('scene-castle', 'Cenário Castelo', 'scene', 350, NULL, '🏰', true, 23),
  ('badge-star', 'Distintivo Estrela', 'badge', 80, NULL, '⭐', false, 30),
  ('badge-fire', 'Distintivo Fogo', 'badge', 80, NULL, '🔥', false, 31),
  ('badge-rainbow', 'Distintivo Arco-Íris', 'badge', 100, NULL, '🌈', false, 32)
ON CONFLICT (id) DO NOTHING;

-- 5. Update handle_new_user to set sensible defaults from metadata (role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Amigo'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'child')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger on profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
