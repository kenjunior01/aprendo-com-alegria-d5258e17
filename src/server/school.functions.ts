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
  bySubject: Record<string, { sessions: number; accuracy: number; minutes: number }>;
}

export const getClassDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      classId: z.string().uuid(),
      subjectId: z.string().optional(), // filter by subject when present
      days: z.number().int().min(1).max(180).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: members } = await supabase
      .from("class_members" as any)
      .select("student_id")
      .eq("class_id", data.classId);
    const studentIds = ((members ?? []) as unknown as Array<{ student_id: string }>).map((m) => m.student_id);
    if (studentIds.length === 0) return { students: [] as ClassStudentStats[], subjects: [] as string[] };

    const days = data.days ?? 30;
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    let sessQ = supabase
      .from("practice_sessions")
      .select("user_id, subject_id, correct, total, duration_seconds")
      .in("user_id", studentIds)
      .gte("created_at", since);
    if (data.subjectId) sessQ = sessQ.eq("subject_id", data.subjectId);

    const [{ data: profs }, { data: sess }] = await Promise.all([
      supabase.from("profiles").select("id, name, mascot, grade, xp, streak").in("id", studentIds),
      sessQ,
    ]);

    const agg: Record<string, {
      c: number; t: number; sec: number; n: number;
      sub: Record<string, { c: number; t: number; sec: number; n: number }>;
    }> = {};
    const subjectsSet = new Set<string>();
    for (const s of sess ?? []) {
      subjectsSet.add(s.subject_id);
      const k = s.user_id;
      agg[k] = agg[k] ?? { c: 0, t: 0, sec: 0, n: 0, sub: {} };
      agg[k].c += s.correct; agg[k].t += s.total; agg[k].sec += s.duration_seconds; agg[k].n += 1;
      const sb = agg[k].sub[s.subject_id] ?? { c: 0, t: 0, sec: 0, n: 0 };
      sb.c += s.correct; sb.t += s.total; sb.sec += s.duration_seconds; sb.n += 1;
      agg[k].sub[s.subject_id] = sb;
    }

    const students: ClassStudentStats[] = (profs ?? []).map((p) => {
      const a = agg[p.id] ?? { c: 0, t: 0, sec: 0, n: 0, sub: {} };
      const bySubject: ClassStudentStats["bySubject"] = {};
      for (const [sid, v] of Object.entries(a.sub)) {
        bySubject[sid] = {
          sessions: v.n,
          accuracy: v.t ? Math.round((v.c / v.t) * 100) : 0,
          minutes: Math.round(v.sec / 60),
        };
      }
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
        bySubject,
      };
    });
    students.sort((a, b) => b.xp - a.xp);
    return { students, subjects: Array.from(subjectsSet).sort() };
  });

export interface SubjectRankingEntry {
  studentId: string;
  name: string;
  mascot: string;
  xp: number;
  accuracy: number;
  minutes: number;
  sessions: number;
}
export const getSubjectRanking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      classId: z.string().uuid(),
      subjectId: z.string().optional(),
      days: z.number().int().min(1).max(180).optional(),
      focusStudentId: z.string().uuid().optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: members } = await supabase
      .from("class_members" as any).select("student_id").eq("class_id", data.classId);
    const ids = ((members ?? []) as unknown as Array<{ student_id: string }>).map((m) => m.student_id);
    if (ids.length === 0) return { top: [] as SubjectRankingEntry[], focus: null as null | (SubjectRankingEntry & { position: number }), total: 0 };

    const days = data.days ?? 30;
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    let sq = supabase.from("practice_sessions")
      .select("user_id, correct, total, duration_seconds, xp_earned")
      .in("user_id", ids).gte("created_at", since);
    if (data.subjectId) sq = sq.eq("subject_id", data.subjectId);
    const [{ data: profs }, { data: sess }] = await Promise.all([
      supabase.from("profiles").select("id, name, mascot").in("id", ids),
      sq,
    ]);
    const agg: Record<string, { c: number; t: number; sec: number; n: number; xp: number }> = {};
    for (const s of sess ?? []) {
      const a = agg[s.user_id] ?? { c: 0, t: 0, sec: 0, n: 0, xp: 0 };
      a.c += s.correct; a.t += s.total; a.sec += s.duration_seconds; a.n += 1; a.xp += s.xp_earned ?? 0;
      agg[s.user_id] = a;
    }
    const all: SubjectRankingEntry[] = (profs ?? []).map((p) => {
      const a = agg[p.id] ?? { c: 0, t: 0, sec: 0, n: 0, xp: 0 };
      return {
        studentId: p.id,
        name: p.name ?? "Aluno",
        mascot: p.mascot ?? "fox",
        xp: a.xp,
        accuracy: a.t ? Math.round((a.c / a.t) * 100) : 0,
        minutes: Math.round(a.sec / 60),
        sessions: a.n,
      };
    });
    all.sort((a, b) => b.xp - a.xp || b.accuracy - a.accuracy);
    const top = all.slice(0, 10);
    let focus: (SubjectRankingEntry & { position: number }) | null = null;
    if (data.focusStudentId) {
      const idx = all.findIndex((e) => e.studentId === data.focusStudentId);
      if (idx >= 0) focus = { ...all[idx], position: idx + 1 };
    }
    return { top, focus, total: all.length };
  });

export interface WeeklyPoint { week: string; minutes: number; accuracy: number; sessions: number; }
export const getClassTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      classId: z.string().uuid(),
      subjectId: z.string().optional(),
      days: z.number().int().min(7).max(180).optional(),
      studentId: z.string().uuid().optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    let userIds: string[] = [];
    if (data.studentId) {
      userIds = [data.studentId];
    } else {
      const { data: members } = await supabase
        .from("class_members" as any).select("student_id").eq("class_id", data.classId);
      userIds = ((members ?? []) as unknown as Array<{ student_id: string }>).map((m) => m.student_id);
    }
    if (userIds.length === 0) return { points: [] as WeeklyPoint[] };
    const days = data.days ?? 30;
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    let sq = supabase.from("practice_sessions")
      .select("created_at, correct, total, duration_seconds")
      .in("user_id", userIds).gte("created_at", since);
    if (data.subjectId) sq = sq.eq("subject_id", data.subjectId);
    const { data: sess } = await sq;
    const buckets: Record<string, { c: number; t: number; sec: number; n: number }> = {};
    for (const s of sess ?? []) {
      const d = new Date(s.created_at);
      const day = d.getUTCDay() || 7;
      const monday = new Date(d); monday.setUTCDate(d.getUTCDate() - (day - 1)); monday.setUTCHours(0,0,0,0);
      const key = monday.toISOString().slice(0, 10);
      const b = buckets[key] ?? { c: 0, t: 0, sec: 0, n: 0 };
      b.c += s.correct; b.t += s.total; b.sec += s.duration_seconds; b.n += 1;
      buckets[key] = b;
    }
    const points: WeeklyPoint[] = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, v]) => ({
        week,
        minutes: Math.round(v.sec / 60),
        accuracy: v.t ? Math.round((v.c / v.t) * 100) : 0,
        sessions: v.n,
      }));
    return { points };
  });

export const removeClassMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ classId: z.string().uuid(), studentId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("class_members" as any)
      .delete().eq("class_id", data.classId).eq("student_id", data.studentId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export interface StudentSessionRow {
  id: string;
  created_at: string;
  subject_id: string;
  lesson_id: string;
  correct: number;
  total: number;
  duration_seconds: number;
  xp_earned: number;
}
export interface StudentDetails {
  studentId: string;
  name: string;
  mascot: string;
  grade: number;
  xp: number;
  streak: number;
  totals: { sessions: number; accuracy: number; minutes: number; coins: number };
  bySubject: Record<string, { sessions: number; accuracy: number; minutes: number }>;
  recent: StudentSessionRow[];
}
export const getStudentDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      classId: z.string().uuid(),
      studentId: z.string().uuid(),
      subjectId: z.string().optional(),
      days: z.number().int().min(1).max(180).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const since = new Date(Date.now() - (data.days ?? 30) * 86400_000).toISOString();
    let sq = supabase.from("practice_sessions")
      .select("id, created_at, subject_id, lesson_id, correct, total, duration_seconds, xp_earned, coins_earned")
      .eq("user_id", data.studentId).gte("created_at", since)
      .order("created_at", { ascending: false });
    if (data.subjectId) sq = sq.eq("subject_id", data.subjectId);
    const [{ data: prof }, { data: sess }] = await Promise.all([
      supabase.from("profiles").select("id, name, mascot, grade, xp, streak").eq("id", data.studentId).maybeSingle(),
      sq,
    ]);
    if (!prof) return { details: null as StudentDetails | null };
    const all = sess ?? [];
    let c = 0, t = 0, sec = 0, coins = 0;
    const sub: Record<string, { c: number; t: number; sec: number; n: number }> = {};
    for (const s of all) {
      c += s.correct; t += s.total; sec += s.duration_seconds; coins += s.coins_earned ?? 0;
      const b = sub[s.subject_id] ?? { c: 0, t: 0, sec: 0, n: 0 };
      b.c += s.correct; b.t += s.total; b.sec += s.duration_seconds; b.n += 1;
      sub[s.subject_id] = b;
    }
    const bySubject: StudentDetails["bySubject"] = {};
    for (const [k, v] of Object.entries(sub)) {
      bySubject[k] = { sessions: v.n, accuracy: v.t ? Math.round((v.c / v.t) * 100) : 0, minutes: Math.round(v.sec / 60) };
    }
    const details: StudentDetails = {
      studentId: prof.id,
      name: prof.name ?? "Aluno",
      mascot: prof.mascot ?? "fox",
      grade: prof.grade ?? 1,
      xp: prof.xp ?? 0,
      streak: prof.streak ?? 0,
      totals: { sessions: all.length, accuracy: t ? Math.round((c / t) * 100) : 0, minutes: Math.round(sec / 60), coins },
      bySubject,
      recent: all.slice(0, 15).map((s) => ({
        id: s.id,
        created_at: s.created_at,
        subject_id: s.subject_id,
        lesson_id: s.lesson_id,
        correct: s.correct,
        total: s.total,
        duration_seconds: s.duration_seconds,
        xp_earned: s.xp_earned,
      })),
    };
    return { details };
  });

export interface TeacherAlert {
  studentId: string;
  name: string;
  mascot: string;
  kind: "accuracy_up" | "minutes_goal";
  detail: string;
}
export const getTeacherAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      classId: z.string().uuid(),
      subjectId: z.string().optional(),
      minutesGoal: z.number().int().min(5).max(600).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const goal = data.minutesGoal ?? 60;
    const { data: members } = await supabase
      .from("class_members" as any).select("student_id").eq("class_id", data.classId);
    const ids = ((members ?? []) as unknown as Array<{ student_id: string }>).map((m) => m.student_id);
    if (ids.length === 0) return { alerts: [] as TeacherAlert[] };

    const now = new Date();
    const day = now.getUTCDay() || 7;
    const thisMon = new Date(now); thisMon.setUTCDate(now.getUTCDate() - (day - 1)); thisMon.setUTCHours(0,0,0,0);
    const lastMon = new Date(thisMon); lastMon.setUTCDate(thisMon.getUTCDate() - 7);
    let sq = supabase.from("practice_sessions")
      .select("user_id, created_at, correct, total, duration_seconds")
      .in("user_id", ids).gte("created_at", lastMon.toISOString());
    if (data.subjectId) sq = sq.eq("subject_id", data.subjectId);
    const [{ data: profs }, { data: sess }] = await Promise.all([
      supabase.from("profiles").select("id, name, mascot").in("id", ids),
      sq,
    ]);
    const week: Record<string, { c: number; t: number; sec: number }> = {};
    const prev: Record<string, { c: number; t: number; sec: number }> = {};
    for (const s of sess ?? []) {
      const t = new Date(s.created_at).getTime();
      const bucket = t >= thisMon.getTime() ? week : prev;
      const b = bucket[s.user_id] ?? { c: 0, t: 0, sec: 0 };
      b.c += s.correct; b.t += s.total; b.sec += s.duration_seconds;
      bucket[s.user_id] = b;
    }
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
    const alerts: TeacherAlert[] = [];
    for (const id of ids) {
      const w = week[id]; const p = prev[id];
      const prof = profMap.get(id);
      if (!prof) continue;
      if (w && w.t >= 5) {
        const wAcc = Math.round((w.c / w.t) * 100);
        const pAcc = p && p.t >= 5 ? Math.round((p.c / p.t) * 100) : null;
        if (pAcc !== null && wAcc - pAcc >= 10) {
          alerts.push({ studentId: id, name: prof.name ?? "Aluno", mascot: prof.mascot ?? "fox", kind: "accuracy_up", detail: `Precisão subiu de ${pAcc}% para ${wAcc}%` });
        }
      }
      if (w) {
        const mins = Math.round(w.sec / 60);
        if (mins >= goal) {
          alerts.push({ studentId: id, name: prof.name ?? "Aluno", mascot: prof.mascot ?? "fox", kind: "minutes_goal", detail: `Atingiu ${mins} min esta semana (meta ${goal})` });
        }
      }
    }
    return { alerts };
  });


export const updateClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      classId: z.string().uuid(),
      name: z.string().min(1).max(60).optional(),
      grade: z.number().int().min(1).max(4).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const patch: Record<string, unknown> = {};
    if (data.name) patch.name = data.name;
    if (data.grade) patch.grade = data.grade;
    const { error } = await supabase.from("classes" as any).update(patch).eq("id", data.classId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const deleteClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ classId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("classes" as any).delete().eq("id", data.classId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

