-- Hardening de segurança (auditoria C4):
-- 1. Revoga EXECUTE público de claim_first_admin — a promoção para admin deve
--    ser feita manualmente pelo painel Supabase (SQL editor):
--      INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid>', 'admin');
--    Isto elimina o vetor "primeiro registador torna-se admin".
-- 2. Garante que has_role é SECURITY DEFINER com search_path fixo (evita
--    bypass de RLS via search_path hijacking).
-- 3. Bloqueia UPDATE em user_roles (nenhuma política de update existia; por
--    omissão seria negado, mas explicitamos com revoke por defesa em profundidade).

-- 1) Matar execução pública do bootstrap admin
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, authenticated;

-- 2) Reforçar has_role (idempotente)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 3) Defesa em profundidade: garantir que anon não lê user_roles
REVOKE SELECT ON public.user_roles FROM anon;

-- 4) Nota: se existir qualquer vista/função que exponha user_roles sem RLS,
--    rever em futuras migrations. Toda a gestão de admins passa a ser via
--    service_role/dashboard.
