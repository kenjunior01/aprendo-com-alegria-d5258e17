-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 2. Trial column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_until timestamptz;

-- 3. Update has_active_subscription to honor trial + admin
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live'::text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(user_uuid, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_uuid AND trial_until IS NOT NULL AND trial_until > now()
    )
    OR EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = user_uuid
        AND environment = check_env
        AND (
          (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'canceled' AND current_period_end > now())
          OR (status IN ('past_due', 'unpaid') AND current_period_end > (now() - interval '7 days'))
        )
    );
$$;

-- 4. Admin RLS policies on existing tables (read + manage)
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all sessions" ON public.practice_sessions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all infinite scores" ON public.infinite_scores
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all infinite progress" ON public.infinite_progress
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all junior cloud" ON public.junior_cloud
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all challenges" ON public.challenges
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage challenges" ON public.challenges
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all parent links" ON public.parent_links
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all friendships" ON public.friendships
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all schools" ON public.schools
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage schools" ON public.schools
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all classes" ON public.classes
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage classes" ON public.classes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view class members" ON public.class_members
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view user achievements" ON public.user_achievements
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage shop items" ON public.shop_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage achievements" ON public.achievements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));