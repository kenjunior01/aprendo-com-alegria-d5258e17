// Server functions for institutional panel: schools, classes & student aggregation.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SchoolRow {
  id: string;
  name: string;
  invite_code: string;
  owner_teacher_id: string;
  created_at: string;
}
export interface ClassRow {
  id: string;
  school_id: string;
  teacher_id: string;
  name: string;
  grade: number;
  invite_code: string;
  created_at: string;
}

export const becomeTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update({ role: "teacher" }).eq("id", userId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const listMySchools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("schools" as any)
      .select("*")
      .eq("owner_teacher_id", userId)
      .order("created_at", { ascending: false });
    if (error) return { schools: [] as SchoolRow[] };
    return { schools: (data ?? []) as unknown as SchoolRow[] };
  });

export const createSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(2).max(80) }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Ensure user is teacher
    await supabase.from("profiles").update({ role: "teacher" }).eq("id", userId);
    const { data: row, error } = await supabase
      .from("schools" as any)
      .insert({ name: data.name, owner_teacher_id: userId })
      .select()
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, school: row as unknown as SchoolRow };
  });

export const listClasses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ schoolId: z.string().uuid().optional() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    let q = supabase.from("classes" as any).select("*").eq("teacher_id", userId);
    if (data.schoolId) q = q.eq("school_id", data.schoolId);
    const { data: rows } = await q.order("created_at", { ascending: false });
    return { classes: (rows ?? []) as unknown as ClassRow[] };
  });

export const createClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      schoolId: z.string().uuid(),
      name: z.string().min(1).max(60),
      grade: z.number().int().min(1).max(4),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("classes" as any)
      .insert({ school_id: data.schoolId, teacher_id: userId, name: data.name, grade: data.grade })
      .select()
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, class: row as unknown as ClassRow };
  });

export const joinClassByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ code: z.string().min(4).max(12) }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: cls } = await supabase
      .from("classes" as any)
      .select("id, name")
      .eq("invite_code", data.code.trim().toLowerCase())
      .maybeSingle();
    if (!cls) return { ok: false as const, error: "Código inválido." };
    const c = cls as unknown as { id: string; name: string };
    const { error } = await supabase
      .from("class_members" as any)
      .insert({ class_id: c.id, student_id: userId });
    if (error && !error.message.includes("duplicate")) return { ok: false as const, error: error.message };
    return { ok: true as const, className: c.name };
  });

export interface ClassStudentStats {
  studentId: string;
  name: string;
  mascot: string;
  grade: number;
  xp: number;
  streak: number;
  sessions: number;
  accuracy: number;
  minutes: number;
}

export const getClassDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ classId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: members } = await supabase
      .from("class_members" as any)
      .select("student_id")
      .eq("class_id", data.classId);
    const studentIds = ((members ?? []) as unknown as Array<{ student_id: string }>).map((m) => m.student_id);
    if (studentIds.length === 0) return { students: [] as ClassStudentStats[] };

    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [{ data: profs }, { data: sess }] = await Promise.all([
      supabase.from("profiles").select("id, name, mascot, grade, xp, streak").in("id", studentIds),
      supabase
        .from("practice_sessions")
        .select("user_id, correct, total, duration_seconds")
        .in("user_id", studentIds)
        .gte("created_at", since),
    ]);

    const agg: Record<string, { c: number; t: number; sec: number; n: number }> = {};
    for (const s of sess ?? []) {
      const k = s.user_id;
      agg[k] = agg[k] ?? { c: 0, t: 0, sec: 0, n: 0 };
      agg[k].c += s.correct;
      agg[k].t += s.total;
      agg[k].sec += s.duration_seconds;
      agg[k].n += 1;
    }

    const students: ClassStudentStats[] = (profs ?? []).map((p) => {
      const a = agg[p.id] ?? { c: 0, t: 0, sec: 0, n: 0 };
      return {
        studentId: p.id,
        name: p.name ?? "Aluno",
        mascot: p.mascot ?? "fox",
        grade: p.grade ?? 1,
        xp: p.xp ?? 0,
        streak: p.streak ?? 0,
        sessions: a.n,
        accuracy: a.t ? Math.round((a.c / a.t) * 100) : 0,
        minutes: Math.round(a.sec / 60),
      };
    });
    students.sort((a, b) => b.xp - a.xp);
    return { students };
  });
