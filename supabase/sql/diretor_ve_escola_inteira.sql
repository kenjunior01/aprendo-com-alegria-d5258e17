-- ═══════════════════════════════════════════════════════════════════
-- Kidoz · O diretor vê e gere a escola inteira
-- Idempotente: pode correr quantas vezes quiser no SQL Editor do Lovable.
--
-- Antes: o dono da escola (diretor) só via as PRÓPRIAS turmas. As turmas
-- criadas por outros professores da escola eram invisíveis para ele — nem
-- membros, nem relatórios, nem painel. Isto alinha as policies de RLS com
-- o modelo pedagógico: o professor gere a SUA turma; o diretor gere a
-- ESCOLA (turmas de todos, membros, perfis e sessões de leitura).
-- ═══════════════════════════════════════════════════════════════════

-- 1) Helper central: professor da turma OU dono da escola da turma.
--    (já existia da migration school_premium_upgrade — recriado para o
--     ficheiro ser autónomo; CREATE OR REPLACE é idempotente)
CREATE OR REPLACE FUNCTION public.can_manage_class(p_class_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id
      AND (c.teacher_id = p_user_id
        OR c.school_id IN (SELECT s.id FROM public.schools s WHERE s.owner_teacher_id = p_user_id))
  );
$$;

-- 2) Membros: quem gere a turma (professor OU diretor) gere os membros.
--    Antes só o professor da turma podia remover/ver alunos.
DROP POLICY IF EXISTS "teacher_manage_members" ON public.class_members;
CREATE POLICY "teacher_manage_members" ON public.class_members
  FOR ALL TO authenticated
  USING (public.can_manage_class(class_id, auth.uid()))
  WITH CHECK (public.can_manage_class(class_id, auth.uid()));

-- 3) Leitura de alunos: "professor da turma" passa a incluir o diretor da
--    escola — as policies existentes (teachers_view_student_profiles em
--    profiles e teachers_view_student_sessions em practice_sessions usam
--    esta função, pelo que passam a ver automaticamente os alunos da escola
--    inteira, incluindo nas turmas de outros professores).
CREATE OR REPLACE FUNCTION public.is_classmate_teacher(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes c ON c.id = cm.class_id
    LEFT JOIN public.schools s ON s.id = c.school_id
    WHERE cm.student_id = _student_id
      AND (c.teacher_id = auth.uid() OR s.owner_teacher_id = auth.uid())
  );
$$;
