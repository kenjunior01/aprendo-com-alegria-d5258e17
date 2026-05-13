// Ligas semanais — competições por idade, com bots automáticos quando faltam jogadores reais.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface LeagueRow {
  id: string;
  name: string;
  age_group: string;
  starts_on: string;
  ends_on: string;
}
export interface LeagueMemberRow {
  id: string;
  league_id: string;
  user_id: string | null;
  bot_name: string | null;
  bot_mascot: string | null;
  score: number;
}

const BOT_NAMES = ["Kido Bot", "Estrelinha", "Trovão", "Lua", "Bolinha", "Faísca", "Pipoca", "Zumbido"];
const BOT_MASCOTS = ["fox", "owl", "rabbit", "panda", "lion", "turtle"];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

// List leagues that are still active (ends_on >= today).
export const listActiveLeagues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("leagues" as any)
      .select("*")
      .gte("ends_on", today)
      .order("ends_on", { ascending: true })
      .limit(20);
    return { leagues: (data ?? []) as unknown as LeagueRow[] };
  });

// Join (or create-and-join) the weekly league for the user's age group.
export const joinWeeklyLeague = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ageGroup: z.string().min(1).max(20) }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    // Find current league for that age group
    const { data: existing } = await supabase
      .from("leagues" as any)
      .select("*")
      .eq("age_group", data.ageGroup)
      .gte("ends_on", today)
      .order("starts_on", { ascending: false })
      .limit(1);
    let league = (existing?.[0] as unknown as LeagueRow) ?? null;

    if (!league) {
      const ends = new Date(); ends.setDate(ends.getDate() + 7);
      const { data: created, error } = await supabase
        .from("leagues" as any)
        .insert({
          name: `Liga ${data.ageGroup} — semana ${new Date().toISOString().slice(0,10)}`,
          age_group: data.ageGroup,
          starts_on: today,
          ends_on: ends.toISOString().slice(0, 10),
        })
        .select()
        .single();
      if (error) return { ok: false as const, error: error.message };
      league = created as unknown as LeagueRow;
    }

    // Insert membership (idempotent via UNIQUE league_id+user_id)
    await supabase.from("league_members" as any).insert({
      league_id: league.id, user_id: userId, score: 0,
    });

    // Ensure at least 5 members; fill with bots if needed
    const { data: members } = await supabase
      .from("league_members" as any)
      .select("id, user_id")
      .eq("league_id", league.id);
    const needed = Math.max(0, 5 - (members?.length ?? 0));
    if (needed > 0) {
      const bots = Array.from({ length: needed }).map(() => ({
        league_id: league.id,
        user_id: null,
        bot_name: pick(BOT_NAMES),
        bot_mascot: pick(BOT_MASCOTS),
        score: Math.floor(Math.random() * 60),
      }));
      await supabase.from("league_members" as any).insert(bots);
    }

    return { ok: true as const, league };
  });

// Add points to current user's row in a league.
export const addLeagueScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ leagueId: z.string().uuid(), points: z.number().int().min(1).max(500) }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("league_members" as any)
      .select("id, score")
      .eq("league_id", data.leagueId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!row) return { ok: false as const, error: "Não estás nesta liga." };
    const r = row as unknown as { id: string; score: number };
    await supabase.from("league_members" as any)
      .update({ score: (r.score ?? 0) + data.points })
      .eq("id", r.id);

    // Bots gain a small random bump too — keeps competition lively.
    const { data: bots } = await supabase
      .from("league_members" as any)
      .select("id, score")
      .eq("league_id", data.leagueId)
      .is("user_id", null);
    for (const b of ((bots ?? []) as unknown as Array<{ id: string; score: number }>)) {
      const bump = Math.floor(Math.random() * Math.max(1, Math.floor(data.points * 0.6)));
      if (bump > 0) {
        await supabase.from("league_members" as any)
          .update({ score: (b.score ?? 0) + bump })
          .eq("id", b.id);
      }
    }
    return { ok: true as const };
  });

// Get leaderboard (members + profile names).
export const getLeagueLeaderboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ leagueId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: members } = await supabase
      .from("league_members" as any)
      .select("*")
      .eq("league_id", data.leagueId)
      .order("score", { ascending: false })
      .limit(50);
    const list = (members ?? []) as unknown as LeagueMemberRow[];

    const userIds = list.map((m) => m.user_id).filter((x): x is string => !!x);
    let profMap = new Map<string, { name: string; mascot: string }>();
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, mascot")
        .in("id", userIds);
      profMap = new Map((profs ?? []).map((p) => [p.id, { name: p.name ?? "Amigo", mascot: p.mascot ?? "fox" }]));
    }

    const leaderboard = list.map((m, i) => {
      const isMe = m.user_id === userId;
      const isBot = !m.user_id;
      const prof = m.user_id ? profMap.get(m.user_id) : null;
      return {
        rank: i + 1,
        memberId: m.id,
        userId: m.user_id,
        name: isBot ? (m.bot_name ?? "Bot") : (prof?.name ?? "Amigo"),
        mascot: isBot ? (m.bot_mascot ?? "fox") : (prof?.mascot ?? "fox"),
        score: m.score,
        isMe, isBot,
      };
    });
    return { leaderboard };
  });
