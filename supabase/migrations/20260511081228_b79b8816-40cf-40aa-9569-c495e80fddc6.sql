-- Tabela para backup do estado completo do Kidoz Júnior por conta
CREATE TABLE public.junior_cloud (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.junior_cloud ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own junior cloud"
  ON public.junior_cloud
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Linked parents view child junior cloud"
  ON public.junior_cloud
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    WHERE pl.parent_id = auth.uid()
      AND pl.child_id = junior_cloud.user_id
      AND pl.status = 'accepted'
  ));

CREATE TRIGGER set_junior_cloud_updated_at
  BEFORE UPDATE ON public.junior_cloud
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();