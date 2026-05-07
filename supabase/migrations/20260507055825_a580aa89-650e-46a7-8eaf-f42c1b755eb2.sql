
-- Friendships
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  parent_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_friendships" ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "create_friendship_request" ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "update_own_friendships" ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  opponent_id uuid,
  kind text NOT NULL DEFAULT 'pvp' CHECK (kind IN ('pvp','ai_daily')),
  subject_id text NOT NULL,
  lesson_id text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','completed','expired')),
  creator_score integer,
  opponent_score integer,
  winner_id uuid,
  coin_reward integer NOT NULL DEFAULT 20,
  xp_reward integer NOT NULL DEFAULT 30,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_challenges" ON public.challenges FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() = opponent_id
    OR EXISTS (
      SELECT 1 FROM public.parent_links pl
      WHERE pl.parent_id = auth.uid()
        AND pl.status = 'accepted'
        AND (pl.child_id = challenges.creator_id OR pl.child_id = challenges.opponent_id)
    )
  );

CREATE POLICY "create_own_challenge" ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "update_own_challenge" ON public.challenges FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE TRIGGER challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_challenges_opponent ON public.challenges(opponent_id) WHERE opponent_id IS NOT NULL;
CREATE INDEX idx_challenges_creator ON public.challenges(creator_id);
