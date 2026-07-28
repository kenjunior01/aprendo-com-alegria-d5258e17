
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  entity text NOT NULL,
  entity_id text,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated insert audit"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON public.audit_log(entity, created_at DESC);

-- Trigger: profile trial changes
CREATE OR REPLACE FUNCTION public.audit_profile_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.trial_until IS DISTINCT FROM OLD.trial_until)
     OR (NEW.is_premium IS DISTINCT FROM OLD.is_premium) THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, before, after)
    VALUES (
      auth.uid(),
      'profile_trial',
      NEW.id::text,
      'update',
      jsonb_build_object('trial_until', OLD.trial_until, 'is_premium', OLD.is_premium),
      jsonb_build_object('trial_until', NEW.trial_until, 'is_premium', NEW.is_premium)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_profile_trial_trg ON public.profiles;
CREATE TRIGGER audit_profile_trial_trg
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_trial();

-- Trigger: shop_items
CREATE OR REPLACE FUNCTION public.audit_shop_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, after)
    VALUES (auth.uid(), 'shop_item', NEW.id, 'insert', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, before, after)
    VALUES (auth.uid(), 'shop_item', NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, before)
    VALUES (auth.uid(), 'shop_item', OLD.id, 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_shop_items_trg ON public.shop_items;
CREATE TRIGGER audit_shop_items_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.shop_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_shop_items();

-- Trigger: content_items
CREATE OR REPLACE FUNCTION public.audit_content_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, after)
    VALUES (auth.uid(), 'content_item', NEW.id::text, 'insert', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, before, after)
    VALUES (auth.uid(), 'content_item', NEW.id::text, 'update', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log(actor_id, entity, entity_id, action, before)
    VALUES (auth.uid(), 'content_item', OLD.id::text, 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_content_items_trg ON public.content_items;
CREATE TRIGGER audit_content_items_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_content_items();
