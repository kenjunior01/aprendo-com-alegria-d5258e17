-- Escolas Premium — fase 2 do modo instituições:
-- 1) Corrige a constraint de role (nunca foi levantada: modo professor PARTIA em produção)
-- 2) teacher_lessons — lições criadas por professores (Premium), servidas às suas turmas
-- 3) school_leads — captura real de leads institucionais (antes só WhatsApp/mailto)
-- 4) Proteção de trial_until (anti-abuse: só a primeira ativação é permitida ao utilizador)

-- 1) ROLE: permitir 'teacher' (o becomeTeacher() escrevia 'teacher' e violava a CHECK)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('child', 'parent', 'teacher'));

-- 2) LIÇÕES DE PROFESSOR ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL DEFAULT 'portugues',
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 80),
  emoji TEXT NOT NULL DEFAULT '📗',
  grade INT NOT NULL DEFAULT 1 CHECK (grade BETWEEN 1 AND 4),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teacher_lessons_teacher ON public.teacher_lessons (teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_lessons_class ON public.teacher_lessons (class_id) WHERE active;

-- O professor dono da turma (dona da escola OU professor atribuído) gere as lições.
CREATE OR REPLACE FUNCTION public.can_manage_class(p_class_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id
      AND (c.teacher_id = p_user_id
        OR c.school_id IN (SELECT s.id FROM public.schools s WHERE s.owner_teacher_id = p_user_id))
  );
$$;

-- O aluno é membro da turma?
CREATE OR REPLACE FUNCTION public.is_class_student(p_class_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members m
    WHERE m.class_id = p_class_id AND m.student_id = p_user_id
  );
$$;

ALTER TABLE public.teacher_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_manage_own_lessons" ON public.teacher_lessons;
CREATE POLICY "teacher_manage_own_lessons" ON public.teacher_lessons
  FOR ALL TO authenticated
  USING (public.can_manage_class(class_id, auth.uid()))
  WITH CHECK (public.can_manage_class(class_id, auth.uid()) AND teacher_id = auth.uid());

DROP POLICY IF EXISTS "students_read_class_lessons" ON public.teacher_lessons;
CREATE POLICY "students_read_class_lessons" ON public.teacher_lessons
  FOR SELECT TO authenticated
  USING (active AND public.is_class_student(class_id, auth.uid()));

-- 3) LEADS INSTITUCIONAIS ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL CHECK (char_length(institution) BETWEEN 2 AND 120),
  tipo TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Portugal',
  students INT NOT NULL CHECK (students BETWEEN 1 AND 20000),
  contact_name TEXT,
  role_title TEXT,
  email TEXT,
  phone TEXT,
  tax_id TEXT,
  demo_slot TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'escolas_page',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'demo', 'won', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.school_leads ENABLE ROW LEVEL SECURITY;

-- Formulário público: qualquer visitante pode SUBMETER um lead (sem login).
-- Leitura apenas para admins/service role (gestão de vendas).
DROP POLICY IF EXISTS "anyone_can_submit_lead" ON public.school_leads;
CREATE POLICY "anyone_can_submit_lead" ON public.school_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- updated_at automático
CREATE OR REPLACE FUNCTION public.set_teacher_lessons_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS teacher_lessons_touch ON public.teacher_lessons;
CREATE TRIGGER teacher_lessons_touch
  BEFORE UPDATE ON public.teacher_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_teacher_lessons_updated_at();

-- 4) TRIAL GUARD — anti-abuse -----------------------------------------------
-- trial_until só pode ser definido uma vez pelo utilizador (primeira ativação).
-- Extensões/renovações exigem service_role ou admin (webhook Stripe, suporte).
CREATE OR REPLACE FUNCTION public.protect_trial_until()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.trial_until IS DISTINCT FROM OLD.trial_until THEN
    IF OLD.trial_until IS NULL
       OR coalesce(current_setting('request.jwt.claims', true)::json ->> 'role', '') = 'service_role'
       OR public.has_role(NEW.id, 'admin'::app_role) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'trial_until e gerido pelo servidor: o trial so pode ser ativado uma vez por conta';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_protect_trial ON public.profiles;
CREATE TRIGGER profiles_protect_trial
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_trial_until();
