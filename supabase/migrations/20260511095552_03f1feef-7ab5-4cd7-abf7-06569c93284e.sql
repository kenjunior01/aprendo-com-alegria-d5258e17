
-- Custom content management
CREATE TABLE IF NOT EXISTS public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('lesson','level','exercise','challenge','text')),
  subject_id text,
  lesson_id text,
  title text NOT NULL,
  body jsonb NOT NULL DEFAULT '{}'::jsonb,
  grade integer,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active content"
  ON public.content_items FOR SELECT TO authenticated
  USING (active OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage content"
  ON public.content_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER content_items_updated
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Shop: add period & active for richer admin control
ALTER TABLE public.shop_items
  ADD COLUMN IF NOT EXISTS period text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- Promote target user to admin if account exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'juniorernesto696@gmail.com'
ON CONFLICT DO NOTHING;
