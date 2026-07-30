// Ligas semanais — escalões por idade, convites partilháveis, perfis por criança,
// bots com dificuldade equilibrada e estatísticas simples.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface LeagueRow {
  id: string;
  name: string;
  age_group: string;
  starts_on: string;
  ends_on: string;
  invite_code: string;
}
export interface LeagueMemberRow {
  id: string;
  league_id: string;
  user_id: string | null;
  bot_name: string | null;
  bot_mascot: string | null;
  bot_difficulty: string | null;
  child_id: string | null;
  child_name: string | null;
  child_age: number | null;
  score: number;
  games_played: number;
  last_played_at: string | null;
}

const BOT_NAMES = ["Alegria Bot", "Estrelinha", "Trovão", "Lua", "Bolinha", "Faísca", "Pipoca", "Zumbido", "Pintinho", "Nuvem"];
const BOT_MASCOTS = ["fox", "owl", "rabbit", "panda", "lion", "turtle"];
const BOT_DIFFICULTIES = ["easy", "easy", "medium", "medium", "hard"] as const;

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

// Mapeia idade (2..14) para um escalão jogável.
export function ageToGroup(age: number | null | undefined): string {
  if (!age || age < 0) return "mixed";
  if (age <= 3) return "2-3";
  if (age <= 5) return "4-5";
  if (age <= 7) return "6-7";
  if (age <= 10) return "8-10";
  return "11-14";
}

const childInputSchema = z.object({
  childId: z.string().min(1).max(64).optional(),
  childName: z.string().min(1).max(40).optional(),
  childAge: z.number().int().min(2).max(16).optional(),
});

// ---- helpers ---------------------------------------------------------------

function randCode() {
  return Array.from({ length: 6 }, () =>
    "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)],
  ).join("");
}

// Bot scoring model — challenging but never impossible.
// Anchor each bot to a fraction of the leader's score depending on difficulty,
// then let it gain a fraction of the player's earned points.
function botBump(opts: {
  diff: string | null;
  botScore: number;
  leaderScore: number;
  playerPoints: number;
}): number {
  const factor = opts.diff === "hard" ? 0.85 : opts.diff === "easy" ? 0.45 : 0.65;
  const target = Math.max(0, Math.floor(opts.leaderScore * factor));
  const gap = target - opts.botScore;
  // Catch-up if behind, slow down if ahead.
  const catchUp = gap > 0 ? Math.min(gap, Math.ceil(opts.playerPoints * 0.35)) : 0;
  const drift = Math.max(0, Math.floor(opts.playerPoints * (factor * 0.4)));
  const noise = Math.floor(Math.random() * Math.max(1, Math.floor(opts.playerPoints * 0.25)));
  // Cap so a bot never overtakes the player by a huge margin in one move.
  const cap = Math.max(2, Math.ceil(opts.playerPoints * 0.9));
  return Math.max(0, Math.min(cap, catchUp + drift + noise));
}

// ---- queries ---------------------------------------------------------------

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

// Junta-se à liga semanal — por código de convite (qualquer escalão) ou pelo
// escalão da criança (cria a liga semanal correspondente se não existir).
export const joinWeeklyLeague = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      ageGroup: z.string().min(1).max(20).optional(),
      inviteCode: z.string().min(4).max(10).optional(),
      ...childInputSchema.shape,
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    let league: LeagueRow | null = null;

    if (data.inviteCode) {
      const { data: byCode } = await supabase
        .from("leagues" as any)
        .select("*")
        .eq("invite_code", data.inviteCode.toUpperCase())
        .gte("ends_on", today)
        .maybeSingle();
      league = (byCode as unknown as LeagueRow) ?? null;
      if (!league) return { ok: false as const, error: "Código inválido ou expirado." };
    } else {
      const ageGroup = data.ageGroup ?? ageToGroup(data.childAge);
      const { data: existing } = await supabase
        .from("leagues" as any)
        .select("*")
        .eq("age_group", ageGroup)
        .gte("ends_on", today)
        .order("starts_on", { ascending: false })
        .limit(1);
      league = (existing?.[0] as unknown as LeagueRow) ?? null;

      if (!league) {
        const ends = new Date(); ends.setDate(ends.getDate() + 7);
        const { data: created, error } = await supabase
          .from("leagues" as any)
          .insert({
            name: `Liga ${ageGroup} — semana de ${today}`,
            age_group: ageGroup,
            starts_on: today,
            ends_on: ends.toISOString().slice(0, 10),
            invite_code: randCode(),
          })
          .select()
          .single();
        if (error) return { ok: false as const, error: error.message };
        league = created as unknown as LeagueRow;
      }
    }

    // Insere a participação (idempotente via UNIQUE league_id+user_id+child_id).
    await supabase.from("league_members" as any).insert({
      league_id: league.id,
      user_id: userId,
      child_id: data.childId ?? null,
      child_name: data.childName ?? null,
      child_age: data.childAge ?? null,
      score: 0,
    });

    // Garante pelo menos 5 participantes — preenche com bots calibrados.
    const { data: members } = await supabase
      .from("league_members" as any)
      .select("id")
      .eq("league_id", league.id);
    const needed = Math.max(0, 5 - (members?.length ?? 0));
    if (needed > 0) {
      const bots = Array.from({ length: needed }).map(() => ({
        league_id: league!.id,
        user_id: null,
        bot_name: pick(BOT_NAMES),
        bot_mascot: pick(BOT_MASCOTS),
        bot_difficulty: pick(BOT_DIFFICULTIES),
        // Score inicial moderado — challenge sem ser intransponível.
        score: 10 + Math.floor(Math.random() * 30),
      }));
      await supabase.from("league_members" as any).insert(bots);
    }

    return { ok: true as const, league };
  });

// Adiciona pontos à criança ativa (perfil) e ajusta bots com base na dificuldade.
export const addLeagueScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      leagueId: z.string().uuid(),
      points: z.number().int().min(1).max(500),
      childId: z.string().min(1).max(64).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Encontra a participação dessa criança (ou única do utilizador).
    let q = supabase.from("league_members" as any)
      .select("id, score, games_played")
      .eq("league_id", data.leagueId)
      .eq("user_id", userId);
    if (data.childId) q = q.eq("child_id", data.childId);
    const { data: row } = await q.maybeSingle();
    if (!row) return { ok: false as const, error: "Não estás nesta liga." };
    const me = row as unknown as { id: string; score: number; games_played: number };
    const newScore = (me.score ?? 0) + data.points;
    await supabase.from("league_members" as any)
      .update({
        score: newScore,
        games_played: (me.games_played ?? 0) + 1,
        last_played_at: new Date().toISOString(),
      })
      .eq("id", me.id);

    // Recalcula bots com dificuldade dinâmica face ao líder atual.
    const { data: all } = await supabase
      .from("league_members" as any)
      .select("id, score, user_id, bot_difficulty")
      .eq("league_id", data.leagueId);
    const list = (all ?? []) as unknown as Array<{ id: string; score: number; user_id: string | null; bot_difficulty: string | null }>;
    const leaderScore = list.reduce((m, r) => Math.max(m, r.score ?? 0), newScore);
    const bots = list.filter((r) => !r.user_id);
    for (const b of bots) {
      const bump = botBump({
        diff: b.bot_difficulty,
        botScore: b.score ?? 0,
        leaderScore,
        playerPoints: data.points,
      });
      if (bump > 0) {
        await supabase.from("league_members" as any)
          .update({ score: (b.score ?? 0) + bump })
          .eq("id", b.id);
      }
    }
    return { ok: true as const, newScore };
  });

// Tabela classificativa + estatísticas simples.
export const getLeagueLeaderboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    leagueId: z.string().uuid(),
    childId: z.string().min(1).max(64).optional(),
  }).parse)
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
      const isMine = m.user_id === userId;
      const isMyChild = isMine && data.childId ? m.child_id === data.childId : isMine;
      const isBot = !m.user_id;
      const prof = m.user_id ? profMap.get(m.user_id) : null;
      const name = isBot
        ? (m.bot_name ?? "Bot")
        : (m.child_name ?? prof?.name ?? "Amigo");
      return {
        rank: i + 1,
        memberId: m.id,
        userId: m.user_id,
        childId: m.child_id,
        name,
        mascot: isBot ? (m.bot_mascot ?? "fox") : (prof?.mascot ?? "fox"),
        score: m.score,
        gamesPlayed: m.games_played ?? 0,
        difficulty: m.bot_difficulty,
        isMe: isMyChild,
        isBot,
      };
    });

    // Estatísticas simples
    const realPlayers = leaderboard.filter((m) => !m.isBot);
    const totalGames = leaderboard.reduce((s, m) => s + m.gamesPlayed, 0);
    const avgScore = leaderboard.length
      ? Math.round(leaderboard.reduce((s, m) => s + m.score, 0) / leaderboard.length)
      : 0;
    const me = leaderboard.find((m) => m.isMe) ?? null;
    const leader = leaderboard[0] ?? null;
    const stats = {
      participants: leaderboard.length,
      realPlayers: realPlayers.length,
      bots: leaderboard.length - realPlayers.length,
      totalGames,
      avgScore,
      myRank: me?.rank ?? null,
      myScore: me?.score ?? 0,
      myGames: me?.gamesPlayed ?? 0,
      gapToLeader: me && leader ? Math.max(0, leader.score - me.score) : null,
    };
    return { leaderboard, stats };
  });
