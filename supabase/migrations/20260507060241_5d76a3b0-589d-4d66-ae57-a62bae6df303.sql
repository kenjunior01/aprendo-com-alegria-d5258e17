
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  owner_teacher_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  name text NOT NULL,
  grade integer NOT NULL DEFAULT 1,
  invite_code text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 6),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER, no recursion)
CREATE OR REPLACE FUNCTION public.is_class_teacher(_class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = _class_id AND teacher_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_school_owner(_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.schools WHERE id = _school_id AND owner_teacher_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_classmate_teacher(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes c ON c.id = cm.class_id
    WHERE cm.student_id = _student_id AND c.teacher_id = auth.uid()
  )
$$;

-- Schools policies
CREATE POLICY "owner_full_schools" ON public.schools FOR ALL
  USING (owner_teacher_id = auth.uid()) WITH CHECK (owner_teacher_id = auth.uid());

-- Classes policies
CREATE POLICY "teacher_manage_classes" ON public.classes FOR ALL
  USING (teacher_id = auth.uid() OR public.is_school_owner(school_id))
  WITH CHECK (teacher_id = auth.uid() OR public.is_school_owner(school_id));

CREATE POLICY "students_view_own_classes" ON public.classes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.class_members cm WHERE cm.class_id = classes.id AND cm.student_id = auth.uid()));

-- Class members policies
CREATE POLICY "teacher_manage_members" ON public.class_members FOR ALL
  USING (public.is_class_teacher(class_id))
  WITH CHECK (public.is_class_teacher(class_id));

CREATE POLICY "student_self_join" ON public.class_members FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "student_view_own_membership" ON public.class_members FOR SELECT
  USING (student_id = auth.uid());

-- Allow teachers to read profiles & sessions of their students
CREATE POLICY "teachers_view_student_profiles" ON public.profiles FOR SELECT
  USING (public.is_classmate_teacher(id));

CREATE POLICY "teachers_view_student_sessions" ON public.practice_sessions FOR SELECT
  USING (public.is_classmate_teacher(user_id));

CREATE TRIGGER schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
