// teacherContent.functions.ts — O "professor-autor": professores e educadores
// criam e enviam os seus próprios exercícios para as suas turmas (Premium).
//
// Pilar de diferenciação: nenhum concorrente (Smartick, Lingokids, IXL)
// deixa o professor escrever o conteúdo que a criança joga. Aqui o professor
// cria lições MCQ/verdadeiro-falso/ordenar na web ou carrega um CSV —
// e os alunos da turma veem-nas em casa, no telemóvel, offline incluído.
//
// Segurança: tudo atrás de requireSupabaseAuth + RLS (can_manage_class) +
// verificação de Premium no servidor (has_active_subscription — honra trial).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripeEnvironment } from "@/lib/stripe";
/* eslint-disable @typescript-eslint/no-explicit-any */
// "as any" necessário: teacher_lessons/school_leads ainda não estão nos tipos
// gerados do Supabase (padrão já usado no repo para tabelas novas).

// ---------------------------------------------------------------------------
// Tipos — espelham Question/Lesson de curriculum.ts (mantidos sincronizados)
// ---------------------------------------------------------------------------

export interface TeacherQuestion {
  prompt: string;
  options?: string[];
  answerIndex?: number;
  hint?: string;
  kind?: "mcq" | "truefalse" | "order" | "count";
  sequence?: string[];
  explanation?: string;
}

export interface TeacherLessonRow {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  emoji: string;
  grade: number;
  questions: TeacherQuestion[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherLessonCard {
  id: string;
  class_id: string;
  subject_id: string;
  title: string;
  emoji: string;
  grade: number;
  questionCount: number;
  updated_at: string;
}

export const TEACHER_SUBJECTS = [
  { id: "portugues", name: "Português", emoji: "📖" },
  { id: "matematica", name: "Matemática", emoji: "🔢" },
  { id: "estudo-do-meio", name: "Estudo do Meio", emoji: "🌍" },
  { id: "ingles", name: "Inglês", emoji: "🇬🇧" },
  { id: "ciencias", name: "Ciências", emoji: "🔬" },
  { id: "cidadania", name: "Cidadania", emoji: "🤝" },
] as const;

export const MAX_TEACHER_LESSONS = 60;
export const MAX_QUESTIONS_PER_LESSON = 30;
export const TRIAL_ESCOLA_DIAS = 15;
export const TRIAL_FAMILIA_DIAS = 7;

// ---------------------------------------------------------------------------
// Validação de questões (zod) — o mesmo formato que a criança joga
// ---------------------------------------------------------------------------

const questionSchema = z
  .object({
    prompt: z.string().min(3).max(400),
    kind: z.enum(["mcq", "truefalse", "order", "count"]).optional(),
    options: z.array(z.string().min(1).max(200)).max(6).optional(),
    answerIndex: z.number().int().min(0).max(5).optional(),
    sequence: z.array(z.string().min(1).max(200)).max(8).optional(),
    hint: z.string().max(240).optional(),
    explanation: z.string().max(600).optional(),
  })
  .superRefine((q, ctx) => {
    const kind = q.kind ?? "mcq";
    if (kind === "order") {
      if (!q.sequence || q.sequence.length < 2) {
        ctx.addIssue({ code: "custom", message: "Ordenar precisa de 2+ itens em sequência." });
      }
      return;
    }
    if (!q.options || q.options.length < 2) {
      ctx.addIssue({ code: "custom", message: "Questão precisa de 2+ opções." });
      return;
    }
    if (q.answerIndex === undefined || q.answerIndex >= q.options.length) {
      ctx.addIssue({ code: "custom", message: "Resposta correta inválida." });
    }
  });

const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  classId: z.string().uuid(),
  subjectId: z.string().min(2).max(40),
  title: z.string().min(2).max(80),
  emoji: z.string().min(1).max(8).default("📗"),
  grade: z.number().int().min(1).max(4),
  questions: z.array(questionSchema).min(1).max(MAX_QUESTIONS_PER_LESSON),
});

export type SaveLessonInput = z.infer<typeof lessonSchema>;

/** Premium no servidor: Stripe ativo (sandbox/live coerente), trial_until válido ou admin. */
async function hasTeacherPremium(
  supabase: ReturnType<typeof Object> & any,
  userId: string,
): Promise<boolean> {
  const checkEnv = getStripeEnvironment();
  const { data } = await supabase.rpc("has_active_subscription", {
    user_uuid: userId,
    ...(checkEnv ? { check_env: checkEnv } : {}),
  });
  return data === true;
}

// ---------------------------------------------------------------------------
// CRUD de lições do professor
// ---------------------------------------------------------------------------

export const listTeacherLessons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // Lições das turmas que eu gereio (professor atribuído ou dono da escola)
    const { data: myClasses } = await supabase.from("classes").select("id");
    const classIds = ((myClasses ?? []) as unknown as Array<{ id: string }>).map((c) => c.id);
    if (classIds.length === 0) return { lessons: [] as TeacherLessonRow[], premium: false };

    const [{ data: rows }, premium] = await Promise.all([
      supabase
        .from("teacher_lessons" as any)
        .select("*")
        .in("class_id", classIds)
        .order("updated_at", { ascending: false }),
      hasTeacherPremium(supabase, userId),
    ]);
    return {
      lessons: (rows ?? []) as unknown as TeacherLessonRow[],
      premium,
    };
  });

export const saveTeacherLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => lessonSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Premium (ou trial) obrigatório — verificado no SERVIDOR, não só na UI
    if (!(await hasTeacherPremium(supabase, userId))) {
      return {
        ok: false as const,
        error: "premium",
        message:
          "Criar e enviar conteúdos é uma funcionalidade Premium. Ativa os 15 dias grátis ou subscreve.",
      };
    }

    // Registo de propriedade: a coluna teacher_id é SEMPRE o utilizador atual
    const payload = {
      teacher_id: userId,
      class_id: data.classId,
      subject_id: data.subjectId,
      title: data.title.trim(),
      emoji: data.emoji || "📗",
      grade: data.grade,
      questions: data.questions,
    };

    if (data.id) {
      // update — RLS garante que só toca em lições das suas turmas
      const { error } = await supabase
        .from("teacher_lessons" as any)
        .update(payload)
        .eq("id", data.id);
      if (error) return { ok: false as const, error: "db", message: error.message };
      return { ok: true as const, id: data.id };
    }

    // Limite de capacidade por professor (evita abuso de armazenamento)
    const { count } = await supabase
      .from("teacher_lessons" as any)
      .select("id", { count: "exact", head: true })
      .eq("teacher_id", userId);
    if ((count ?? 0) >= MAX_TEACHER_LESSONS) {
      return {
        ok: false as const,
        error: "limit",
        message: `Limite de ${MAX_TEACHER_LESSONS} lições autorais atingido. Apaga uma para criar outra.`,
      };
    }

    const { data: row, error } = await supabase
      .from("teacher_lessons" as any)
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false as const, error: "db", message: error.message };
    return { ok: true as const, id: (row as unknown as { id: string }).id };
  });

export const deleteTeacherLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Só o autor apaga (mais restritivo que o manage da escola)
    const { error } = await supabase
      .from("teacher_lessons" as any)
      .delete()
      .eq("id", data.id)
      .eq("teacher_id", userId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

// ---------------------------------------------------------------------------
// Vista do aluno: lições da(s) minha(s) turma(s)
// ---------------------------------------------------------------------------

export const listStudentTeacherLessons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: memberships } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("student_id", userId);
    const classIds = ((memberships ?? []) as unknown as Array<{ class_id: string }>).map(
      (m) => m.class_id,
    );
    if (classIds.length === 0)
      return { lessons: [] as (TeacherLessonCard & { className: string })[] };

    const { data: rows } = await supabase
      .from("teacher_lessons" as any)
      .select("id, class_id, subject_id, title, emoji, grade, questions, updated_at")
      .in("class_id", classIds)
      .eq("active", true)
      .order("updated_at", { ascending: false })
      .limit(40);

    const { data: classes } = await supabase.from("classes").select("id, name").in("id", classIds);
    const className = new Map(
      ((classes ?? []) as unknown as Array<{ id: string; name: string }>).map((c) => [
        c.id,
        c.name,
      ]),
    );

    const lessons = ((rows ?? []) as unknown as TeacherLessonRow[]).map((r) => ({
      id: r.id,
      class_id: r.class_id,
      subject_id: r.subject_id,
      title: r.title,
      emoji: r.emoji,
      grade: r.grade,
      questionCount: Array.isArray(r.questions) ? r.questions.length : 0,
      updated_at: r.updated_at,
      className: className.get(r.class_id) ?? "Turma",
    }));
    return { lessons };
  });

export const getStudentTeacherLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ lessonId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("teacher_lessons" as any)
      .select("*")
      .eq("id", data.lessonId)
      .eq("active", true)
      .maybeSingle();
    if (!row) return { lesson: null as TeacherLessonRow | null };
    const lesson = row as unknown as TeacherLessonRow;
    // RLS já protege, mas verificação explícita de membership para server fn
    const { data: member } = await supabase
      .from("class_members")
      .select("student_id")
      .eq("class_id", lesson.class_id)
      .eq("student_id", userId)
      .maybeSingle();
    if (!member) return { lesson: null as TeacherLessonRow | null };
    return { lesson };
  });

// ---------------------------------------------------------------------------
// Trials — 15 dias institucional / 7 dias família (uma vez por conta)
// ---------------------------------------------------------------------------

async function trialInfo(supabase: any, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("trial_until, role")
    .eq("id", userId)
    .maybeSingle();
  const row = (data ?? null) as { trial_until: string | null; role: string } | null;
  const until = row?.trial_until ? new Date(row.trial_until) : null;
  const active = !!until && until.getTime() > Date.now();
  const daysLeft = active ? Math.ceil((until!.getTime() - Date.now()) / 86_400_000) : 0;
  return { used: !!row?.trial_until, active, daysLeft, role: row?.role ?? "child" };
}

export const getTrialStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    return await trialInfo(supabase, userId);
  });

/** Trial institucional: 15 dias de Premium para o professor/direção. */
export const startSchoolTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ institution: z.string().min(2).max(120).optional() }).optional())
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const info = await trialInfo(supabase, userId);
    if (info.active) {
      return { ok: true as const, daysLeft: info.daysLeft, message: "Trial já ativo" };
    }
    if (info.used) {
      return {
        ok: false as const,
        error: "used",
        message: "O trial gratuito só pode ser ativado uma vez por conta.",
      };
    }

    // Anti-abuse leve: exigir pelo menos uma turma criada (prova de contexto real)
    const { count } = await supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("teacher_id", userId);
    const { count: schoolCount } = await supabase
      .from("schools")
      .select("id", { count: "exact", head: true })
      .eq("owner_teacher_id", userId);
    if ((count ?? 0) === 0 && (schoolCount ?? 0) === 0) {
      return {
        ok: false as const,
        error: "no_school",
        message:
          "Cria primeiro a tua escola e uma turma no painel — depois ativas os 15 dias grátis em 1 clique.",
      };
    }

    const until = new Date(Date.now() + TRIAL_ESCOLA_DIAS * 86_400_000).toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({ trial_until: until, role: "teacher" })
      .eq("id", userId);
    if (error) return { ok: false as const, error: "db", message: error.message };
    return {
      ok: true as const,
      daysLeft: TRIAL_ESCOLA_DIAS,
      message: `15 dias de Premium Escola ativados — até ${until.slice(0, 10)}. Sem cartão, sem compromisso.`,
    };
  });

/** Trial família: 7 dias de Premium para explorar o Mundo, tutor IA e relatórios. */
export const startPremiumTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const info = await trialInfo(supabase, userId);
    if (info.active) {
      return { ok: true as const, daysLeft: info.daysLeft, message: "Trial já ativo" };
    }
    if (info.used) {
      return {
        ok: false as const,
        error: "used",
        message: "O trial gratuito já foi usado nesta conta.",
      };
    }
    // Nunca houve subscrição paga nesta conta
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) > 0) {
      return {
        ok: false as const,
        error: "subscriber",
        message: "Esta conta já tem histórico de subscrição — os 7 dias grátis são para novos.",
      };
    }
    const until = new Date(Date.now() + TRIAL_FAMILIA_DIAS * 86_400_000).toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({ trial_until: until })
      .eq("id", userId);
    if (error) return { ok: false as const, error: "db", message: error.message };
    return {
      ok: true as const,
      daysLeft: TRIAL_FAMILIA_DIAS,
      message: `7 dias de Premium grátis ativados — sem cartão, sem letra miúda.`,
    };
  });

// ---------------------------------------------------------------------------
// Leads institucionais — a proposta formal fica guardada (antes só WhatsApp)
// ---------------------------------------------------------------------------

const leadSchema = z.object({
  institution: z.string().min(2).max(120),
  tipo: z.string().min(2).max(60),
  country: z.string().min(2).max(40).default("Portugal"),
  students: z.number().int().min(1).max(20000),
  contactName: z.string().max(80).optional(),
  roleTitle: z.string().max(60).optional(),
  email: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  taxId: z.string().max(30).optional(),
  demoSlot: z.string().max(40).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().max(40).default("escolas_page"),
});

export const submitSchoolLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot server-side: campos que nunca deviam ter conteúdo
    if (data.message && data.message.includes("http://spam")) {
      return { ok: true as const };
    }
    const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return { ok: false as const, error: "env" };
    }
    // Anon client — a policy "anyone_can_submit_lead" permite INSERT público
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
    const { error } = await admin.from("school_leads" as any).insert({
      institution: data.institution.trim(),
      tipo: data.tipo,
      country: data.country,
      students: data.students,
      contact_name: data.contactName || null,
      role_title: data.roleTitle || null,
      email: data.email || null,
      phone: data.phone || null,
      tax_id: data.taxId || null,
      demo_slot: data.demoSlot || null,
      message: data.message || null,
      source: data.source,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
