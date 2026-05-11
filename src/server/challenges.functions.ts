// Server functions for PvP challenges, AI-suggested daily challenges & rankings.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ChallengeRow {
  id: string;
  creator_id: string;
  opponent_id: string | null;
  kind: "pvp" | "ai_daily";
  subject_id: string;
  lesson_id: string;
  status: "open" | "completed" | "expired";
  creator_score: number | null;
  opponent_score: number | null;
  winner_id: string | null;
  coin_reward: number;
  xp_reward: number;
  expires_at: string;
  created_at: string;
}

// List challenges where the current user is involved (incoming + outgoing + AI).
export const listMyChallenges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("challenges" as any)
      .select("*")
      .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("listMyChallenges", error);
      return { challenges: [] as ChallengeRow[] };
    }
    return { challenges: (data ?? []) as unknown as ChallengeRow[] };
  });

// Create a PvP challenge by inviting a friend (must already be accepted friend).
export const createPvpChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      opponentId: z.string().uuid(),
      subjectId: z.string(),
      lessonId: z.string(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Verify friendship
    const { data: f } = await supabase
      .from("friendships" as any)
      .select("status")
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${data.opponentId}),and(requester_id.eq.${data.opponentId},addressee_id.eq.${userId})`,
      )
      .eq("status", "accepted")
      .maybeSingle();
    if (!f) {
      return { ok: false as const, error: "Precisas ser amigo dessa pessoa." };
    }
    const { data: ch, error } = await supabase
      .from("challenges" as any)
      .insert({
        creator_id: userId,
        opponent_id: data.opponentId,
        kind: "pvp",
        subject_id: data.subjectId,
        lesson_id: data.lessonId,
      })
      .select()
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, challenge: ch as unknown as ChallengeRow };
  });

// Submit score for a challenge participant.
export const submitChallengeScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ challengeId: z.string().uuid(), score: z.number().int().min(0) }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: ch } = await supabase
      .from("challenges" as any)
      .select("*")
      .eq("id", data.challengeId)
      .maybeSingle();
    if (!ch) return { ok: false as const, error: "Desafio não encontrado." };
    const c = ch as unknown as ChallengeRow;

    const patch: Partial<ChallengeRow> = {};
    if (c.creator_id === userId) patch.creator_score = data.score;
    else if (c.opponent_id === userId) patch.opponent_score = data.score;
    else return { ok: false as const, error: "Não fazes parte deste desafio." };

    const cs = patch.creator_score ?? c.creator_score;
    const os = patch.opponent_score ?? c.opponent_score;
    let winner: string | null = null;
    let status: ChallengeRow["status"] = c.status;
    if (c.kind === "ai_daily") {
      status = "completed";
      winner = (cs ?? 0) >= 70 ? c.creator_id : null;
    } else if (cs != null && os != null) {
      status = "completed";
      winner = cs === os ? null : (cs > os ? c.creator_id : c.opponent_id);
    }

    const { error } = await supabase
      .from("challenges" as any)
      .update({ ...patch, status, winner_id: winner })
      .eq("id", data.challengeId);
    if (error) return { ok: false as const, error: error.message };

    // Reward winner
    if (winner === userId && status === "completed") {
      const { data: prof } = await supabase
        .from("profiles")
        .select("coins, xp")
        .eq("id", userId)
        .maybeSingle();
      if (prof) {
        await supabase
          .from("profiles")
          .update({
            coins: (prof.coins ?? 0) + c.coin_reward,
            xp: (prof.xp ?? 0) + c.xp_reward,
          })
          .eq("id", userId);
      }
    }
    return { ok: true as const, status, winner };
  });

// Suggest a daily AI challenge factoring in age/grade, region (PT/BR/AO/MZ/CV)
// and weakest subject from recent practice. Persists one per day per user.
export const getOrCreateDailyAiChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // Existing today?
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data: existing } = await supabase
      .from("challenges" as any)
      .select("*")
      .eq("creator_id", userId)
      .eq("kind", "ai_daily")
      .gte("created_at", since.toISOString())
      .maybeSingle();
    if (existing) return { challenge: existing as unknown as ChallengeRow };

    // Profile context: grade, age, region, interests
    const { data: prof } = await supabase
      .from("profiles")
      .select("grade, age, region, interests")
      .eq("id", userId)
      .maybeSingle();
    const grade = (prof?.grade ?? 1) as number;
    const region = (prof?.region ?? "PT") as string;

    // Weakest subject from last 30 sessions of the same grade
    const { data: sess } = await supabase
      .from("practice_sessions")
      .select("subject_id, lesson_id, correct, total, grade")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    const stats: Record<string, { c: number; t: number; lessons: string[] }> = {};
    for (const s of sess ?? []) {
      if (s.grade && s.grade !== grade) continue;
      const k = s.subject_id;
      stats[k] = stats[k] ?? { c: 0, t: 0, lessons: [] };
      stats[k].c += s.correct;
      stats[k].t += s.total;
      if (!stats[k].lessons.includes(s.lesson_id)) stats[k].lessons.push(s.lesson_id);
    }

    // Default subject rotation by region focus (region-aware default seed)
    const defaultBySubject: Record<string, { subject: string; lesson: string }> = {
      PT: { subject: "estudo-do-meio", lesson: "em-portugal" },
      BR: { subject: "estudo-do-meio", lesson: "em-natureza" },
      AO: { subject: "portugues", lesson: "pt-vogais" },
      MZ: { subject: "portugues", lesson: "pt-vogais" },
      CV: { subject: "portugues", lesson: "pt-vogais" },
    };

    const ranked = Object.entries(stats).sort(
      (a, b) => a[1].c / (a[1].t || 1) - b[1].c / (b[1].t || 1),
    );
    const fallback = defaultBySubject[region] ?? defaultBySubject.PT;
    const subject = ranked[0]?.[0] ?? fallback.subject;
    // Pick most-recent unfinished lesson if available, else fallback
    const lesson = ranked[0]?.[1].lessons[0] ?? fallback.lesson;

    // Reward scales lightly with grade/age
    const coin_reward = 12 + grade * 3;
    const xp_reward = 20 + grade * 5;

    const { data: ch, error } = await supabase
      .from("challenges" as any)
      .insert({
        creator_id: userId,
        kind: "ai_daily",
        subject_id: subject,
        lesson_id: lesson,
        coin_reward,
        xp_reward,
      })
      .select()
      .single();
    if (error) {
      console.error("ai_daily insert", error);
      return { challenge: null };
    }
    return { challenge: ch as unknown as ChallengeRow };
  });

// Weekly ranking — top 20 users by XP gained in last 7 days.
export const getWeeklyRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date(Date.now() - 7 * 86400_000).toISOString();
    const { data, error } = await supabase
      .from("practice_sessions")
      .select("user_id, xp_earned")
      .gte("created_at", since);
    if (error || !data) return { ranking: [], me: null };

    const totals: Record<string, number> = {};
    for (const r of data) totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.xp_earned ?? 0);
    const ids = Object.keys(totals);
    if (ids.length === 0) return { ranking: [], me: null };

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, name, mascot")
      .in("id", ids);
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));

    const ranking = ids
      .map((id) => ({
        userId: id,
        name: profMap.get(id)?.name ?? "Amigo",
        mascot: profMap.get(id)?.mascot ?? "fox",
        xp: totals[id],
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 20);

    const meIdx = ranking.findIndex((r) => r.userId === userId);
    return { ranking, me: meIdx >= 0 ? { rank: meIdx + 1, xp: totals[userId] ?? 0 } : { rank: null, xp: totals[userId] ?? 0 } };
  });

// Friendship management
export const requestFriendship = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ addresseeId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if (data.addresseeId === userId) return { ok: false as const, error: "Não te podes adicionar a ti." };
    const { error } = await supabase
      .from("friendships" as any)
      .insert({ requester_id: userId, addressee_id: data.addresseeId });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const respondFriendship = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ friendshipId: z.string().uuid(), accept: z.boolean() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("friendships" as any)
      .update({ status: data.accept ? "accepted" : "blocked" })
      .eq("id", data.friendshipId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const listFriends = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: rels } = await supabase
      .from("friendships" as any)
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    const list = (rels ?? []) as unknown as Array<{
      id: string; requester_id: string; addressee_id: string; status: string;
    }>;
    const otherIds = list.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
    const { data: profs } = otherIds.length
      ? await supabase.from("profiles").select("id, name, mascot").in("id", otherIds)
      : { data: [] };
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      friends: list.map((r) => {
        const otherId = r.requester_id === userId ? r.addressee_id : r.requester_id;
        const incoming = r.addressee_id === userId && r.status === "pending";
        const p = profMap.get(otherId);
        return {
          friendshipId: r.id,
          userId: otherId,
          name: p?.name ?? "Amigo",
          mascot: p?.mascot ?? "fox",
          status: r.status,
          incoming,
        };
      }),
    };
  });
