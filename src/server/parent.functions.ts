// Server function: dados resumidos para o painel de pais
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ParentDashboardData {
  child: { id: string; name: string; mascot: string; grade: number; xp: number; coins: number; streak: number };
  totals: { sessions: number; correct: number; total: number; minutes: number };
  bySubject: { subject_id: string; correct: number; total: number }[];
  byDay: { date: string; minutes: number; correct: number }[];
}

export const getChildDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { childId: string }) => d)
  .handler(async ({ data, context }): Promise<ParentDashboardData | null> => {
    const { supabase, userId } = context;

    // Verify link
    const { data: link } = await supabase
      .from("parent_links")
      .select("id")
      .eq("parent_id", userId)
      .eq("child_id", data.childId)
      .eq("status", "accepted")
      .maybeSingle();
    if (!link) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, mascot, grade, xp, coins, streak")
      .eq("id", data.childId)
      .maybeSingle();
    if (!profile) return null;

    const since = new Date();
    since.setDate(since.getDate() - 14);
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("subject_id, correct, total, duration_seconds, created_at")
      .eq("user_id", data.childId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    const list = sessions ?? [];
    const totals = list.reduce(
      (acc, s) => ({
        sessions: acc.sessions + 1,
        correct: acc.correct + (s.correct ?? 0),
        total: acc.total + (s.total ?? 0),
        minutes: acc.minutes + Math.round((s.duration_seconds ?? 0) / 60),
      }),
      { sessions: 0, correct: 0, total: 0, minutes: 0 },
    );

    const bySubjectMap: Record<string, { correct: number; total: number }> = {};
    for (const s of list) {
      const k = s.subject_id;
      bySubjectMap[k] = bySubjectMap[k] ?? { correct: 0, total: 0 };
      bySubjectMap[k].correct += s.correct ?? 0;
      bySubjectMap[k].total += s.total ?? 0;
    }
    const bySubject = Object.entries(bySubjectMap).map(([subject_id, v]) => ({ subject_id, ...v }));

    const byDayMap: Record<string, { minutes: number; correct: number }> = {};
    for (const s of list) {
      const d = (s.created_at as string).slice(0, 10);
      byDayMap[d] = byDayMap[d] ?? { minutes: 0, correct: 0 };
      byDayMap[d].minutes += Math.round((s.duration_seconds ?? 0) / 60);
      byDayMap[d].correct += s.correct ?? 0;
    }
    const byDay = Object.entries(byDayMap).map(([date, v]) => ({ date, ...v }));

    return {
      child: profile as ParentDashboardData["child"],
      totals,
      bySubject,
      byDay,
    };
  });

export const createParentInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("parent_links")
      .insert({ parent_id: userId, invite_code: code, status: "pending" })
      .select()
      .single();
    if (error) throw error;
    return { invite_code: data.invite_code };
  });

export const acceptParentInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const code = data.code.trim().toUpperCase();
    const { data: link } = await supabase
      .from("parent_links")
      .select("id, parent_id, status")
      .eq("invite_code", code)
      .maybeSingle();
    if (!link) return { ok: false, reason: "not_found" as const };
    if (link.status === "accepted") return { ok: false, reason: "already_used" as const };
    const { error } = await supabase
      .from("parent_links")
      .update({ child_id: userId, status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", link.id);
    if (error) return { ok: false, reason: "error" as const };
    return { ok: true as const };
  });

export const getMyChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: links } = await supabase
      .from("parent_links")
      .select("id, child_id, status, invite_code, created_at")
      .eq("parent_id", userId)
      .order("created_at", { ascending: false });
    if (!links || links.length === 0) return { children: [], pending: [] };

    const childIds = links.filter((l) => l.child_id).map((l) => l.child_id) as string[];
    const { data: profiles } = childIds.length
      ? await supabase.from("profiles").select("id, name, mascot, grade, xp, streak").in("id", childIds)
      : { data: [] as Array<{ id: string; name: string; mascot: string; grade: number; xp: number; streak: number }> };

    return {
      children: profiles ?? [],
      pending: links.filter((l) => l.status === "pending"),
    };
  });
