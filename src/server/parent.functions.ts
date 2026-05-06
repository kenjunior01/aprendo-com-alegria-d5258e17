// Server function: dados resumidos para o painel de pais
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ParentDashboardData {
  child: { id: string; name: string; mascot: string; grade: number; xp: number; coins: number; streak: number };
  totals: { sessions: number; correct: number; total: number; minutes: number };
  bySubject: { subject_id: string; correct: number; total: number; minutes: number }[];
  byDay: { date: string; minutes: number; correct: number; total: number }[];
  byWeekday: { weekday: number; minutes: number }[];
  insights: { type: "good" | "warn" | "info"; text: string }[];
  recommendation: { title: string; message: string; focusSubject: string };
  achievements: { code: string; unlocked_at: string }[];
}

const SUBJECT_NAMES: Record<string, string> = {
  portugues: "Português",
  matematica: "Matemática",
  "estudo-do-meio": "Estudo do Meio",
};

export const getChildDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { childId: string }) => d)
  .handler(async ({ data, context }): Promise<ParentDashboardData | null> => {
    const { supabase, userId } = context;

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

    const { data: ach } = await supabase
      .from("user_achievements")
      .select("achievement_code, unlocked_at")
      .eq("user_id", data.childId)
      .order("unlocked_at", { ascending: false })
      .limit(10);

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

    const bySubjectMap: Record<string, { correct: number; total: number; minutes: number }> = {};
    for (const s of list) {
      const k = s.subject_id;
      bySubjectMap[k] = bySubjectMap[k] ?? { correct: 0, total: 0, minutes: 0 };
      bySubjectMap[k].correct += s.correct ?? 0;
      bySubjectMap[k].total += s.total ?? 0;
      bySubjectMap[k].minutes += Math.round((s.duration_seconds ?? 0) / 60);
    }
    const bySubject = Object.entries(bySubjectMap).map(([subject_id, v]) => ({ subject_id, ...v }));

    // Fill last 14 days even if zero
    const byDayMap: Record<string, { minutes: number; correct: number; total: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDayMap[d.toISOString().slice(0, 10)] = { minutes: 0, correct: 0, total: 0 };
    }
    for (const s of list) {
      const d = (s.created_at as string).slice(0, 10);
      if (!byDayMap[d]) byDayMap[d] = { minutes: 0, correct: 0, total: 0 };
      byDayMap[d].minutes += Math.round((s.duration_seconds ?? 0) / 60);
      byDayMap[d].correct += s.correct ?? 0;
      byDayMap[d].total += s.total ?? 0;
    }
    const byDay = Object.entries(byDayMap).map(([date, v]) => ({ date, ...v }));

    // By weekday (0=Dom..6=Sab)
    const byWeekdayMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const s of list) {
      const w = new Date(s.created_at as string).getDay();
      byWeekdayMap[w] += Math.round((s.duration_seconds ?? 0) / 60);
    }
    const byWeekday = Object.entries(byWeekdayMap).map(([w, m]) => ({ weekday: Number(w), minutes: m }));

    // Insights
    const accuracy = totals.total ? totals.correct / totals.total : 0;
    const activeDays = byDay.filter((d) => d.minutes > 0).length;
    const insights: ParentDashboardData["insights"] = [];

    if (totals.sessions === 0) {
      insights.push({ type: "info", text: "Sem atividade nos últimos 14 dias. Convida o teu filho a abrir o Lusis hoje." });
    } else {
      if (accuracy >= 0.85) insights.push({ type: "good", text: `Excelente precisão de ${Math.round(accuracy * 100)}% — pronto para o próximo nível.` });
      else if (accuracy < 0.6) insights.push({ type: "warn", text: `Precisão de ${Math.round(accuracy * 100)}%. Pode beneficiar de revisão dos básicos.` });

      if (activeDays >= 10) insights.push({ type: "good", text: `Praticou em ${activeDays} dos últimos 14 dias — ótima rotina!` });
      else if (activeDays <= 3) insights.push({ type: "warn", text: `Apenas ${activeDays} dia(s) de prática. 10 minutos diários fazem diferença.` });

      if (bySubject.length >= 2) {
        const sorted = [...bySubject].sort((a, b) => (a.correct / Math.max(1, a.total)) - (b.correct / Math.max(1, b.total)));
        const weakest = sorted[0];
        const strongest = sorted[sorted.length - 1];
        if (weakest.total >= 3 && strongest.total >= 3) {
          insights.push({
            type: "info",
            text: `Mais forte em ${SUBJECT_NAMES[strongest.subject_id] ?? strongest.subject_id}; pode reforçar ${SUBJECT_NAMES[weakest.subject_id] ?? weakest.subject_id}.`,
          });
        }
      }
    }

    // AI recommendation (best-effort, falls back to a heuristic)
    const recommendation = await getRecommendationForChild(list, bySubject);

    return {
      child: profile as ParentDashboardData["child"],
      totals,
      bySubject,
      byDay,
      byWeekday,
      insights,
      recommendation,
      achievements: (ach ?? []).map((a) => ({ code: a.achievement_code, unlocked_at: a.unlocked_at })),
    };
  });

async function getRecommendationForChild(
  sessions: Array<{ subject_id: string; correct: number; total: number }>,
  bySubject: Array<{ subject_id: string; correct: number; total: number }>,
) {
  const apiKey = process.env.LOVABLE_API_KEY;
  const fallback = () => {
    const sorted = [...bySubject].sort((a, b) => (a.correct / Math.max(1, a.total)) - (b.correct / Math.max(1, b.total)));
    const weak = sorted[0];
    return {
      title: weak ? `Reforçar ${SUBJECT_NAMES[weak.subject_id] ?? weak.subject_id}` : "Continuar a prática",
      message: weak ? "Sugerimos 2-3 missões nesta área esta semana." : "Continuem com a rotina diária — está a correr bem!",
      focusSubject: weak?.subject_id ?? "geral",
    };
  };
  if (!apiKey || sessions.length === 0) return fallback();
  try {
    const summary = bySubject.map((s) => `${s.subject_id}: ${Math.round((s.correct / Math.max(1, s.total)) * 100)}% (${s.total} respostas)`).join(", ");
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "És um conselheiro educacional para pais portugueses. Sê breve, prático e em pt-PT." },
          { role: "user", content: `Performance recente do filho: ${summary}. Recomenda foco para esta semana.` },
        ],
        tools: [{ type: "function", function: {
          name: "advise",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Título curto, máx 6 palavras, pt-PT" },
              message: { type: "string", description: "Conselho prático 1-2 frases para o pai/mãe, pt-PT" },
              focusSubject: { type: "string", enum: ["portugues", "matematica", "estudo-do-meio", "geral"] },
            },
            required: ["title", "message", "focusSubject"],
            additionalProperties: false,
          },
        }}],
        tool_choice: { type: "function", function: { name: "advise" } },
      }),
    });
    if (!resp.ok) return fallback();
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (args) return JSON.parse(args);
  } catch { /* noop */ }
  return fallback();
}

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
