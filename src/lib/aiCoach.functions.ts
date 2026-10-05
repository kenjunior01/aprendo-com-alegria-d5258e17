// Relatórios de IA por criança — para a própria criança (mascote), pais e professores.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AiReport, ChildStats } from "./aiCoach.server";

export interface AiChildReport {
  name: string;
  mascot: string;
  grade: number;
  stats: ChildStats;
  report: AiReport;
}

const Input = z.object({
  childId: z.string().uuid().optional(),
  audience: z.enum(["child", "parent", "teacher"]),
  classId: z.string().uuid().optional(),
  days: z.number().int().min(7).max(180).optional(),
});

export const getAiChildReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data, context }): Promise<AiChildReport | null> => {
    const { supabase, userId } = context;
    const childId = data.audience === "child" ? userId : data.childId;
    if (!childId) return null;

    // Verificação de acesso
    if (data.audience === "parent") {
      const { data: link } = await supabase.from("parent_links").select("id")
        .eq("parent_id", userId).eq("child_id", childId).eq("status", "accepted").maybeSingle();
      if (!link) return null;
    } else if (data.audience === "teacher") {
      if (!data.classId) return null;
      const { data: cls } = await supabase.from("classes").select("id").eq("id", data.classId).eq("teacher_id", userId).maybeSingle();
      if (!cls) return null;
      const { data: mem } = await supabase.from("class_members").select("id").eq("class_id", data.classId).eq("student_id", childId).maybeSingle();
      if (!mem) return null;
    }

    const since = new Date(Date.now() - (data.days ?? 60) * 86400_000).toISOString();
    const [{ data: prof }, { data: sess }] = await Promise.all([
      supabase.from("profiles").select("name, age, grade, mascot, interests").eq("id", childId).maybeSingle(),
      supabase.from("practice_sessions")
        .select("subject_id, lesson_id, correct, total, duration_seconds, created_at")
        .eq("user_id", childId).gte("created_at", since)
        .order("created_at", { ascending: false }).limit(300),
    ]);
    if (!prof) return null;

    const { computeStats, generateAiReport } = await import("./aiCoach.server");
    const stats = computeStats(sess ?? []);
    const report = await generateAiReport({
      name: prof.name ?? "Criança",
      age: prof.age ?? null,
      grade: prof.grade ?? 1,
      mascot: prof.mascot ?? "fox",
      interests: (prof.interests as string[] | null) ?? [],
      stats,
      audience: data.audience,
    });
    return { name: prof.name ?? "Criança", mascot: prof.mascot ?? "fox", grade: prof.grade ?? 1, stats, report };
  });
