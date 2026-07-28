// Server functions for Desafios Infinitos: submit scores + weekly/seasonal rankings.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function ageGroupOf(age: number | null | undefined): string {
  const a = age ?? 0;
  if (a <= 5) return "2-5";
  if (a <= 9) return "6-9";
  if (a <= 13) return "10-13";
  return "14+";
}

export const submitInfiniteScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    trackId: z.string().min(1).max(40),
    level: z.number().int().min(1).max(9999),
    score: z.number().int().min(0).max(100000),
    stars: z.number().int().min(0).max(3),
    age: z.number().int().min(0).max(120).nullable().optional(),
    region: z.string().min(1).max(8).nullable().optional(),
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const ageGroup = ageGroupOf(data.age ?? null);
    const { error } = await (supabase.from("infinite_scores" as never) as any).insert({
      user_id: userId,
      track_id: data.trackId,
      level: data.level,
      score: data.score,
      stars: data.stars,
      age: data.age ?? null,
      age_group: ageGroup,
      region: data.region ?? null,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export interface RankingRow {
  user_id: string;
  display_name: string;
  mascot: string | null;
  region: string | null;
  age_group: string | null;
  total: number;
}

async function aggregateRanking(
  supabase: any,
  filter: { since: string; ageGroup?: string | null; region?: string | null },
): Promise<RankingRow[]> {
  let q = supabase
    .from("infinite_scores" as never)
    .select("user_id, score, age_group, region")
    .gte("created_at", filter.since)
    .limit(2000);
  if (filter.ageGroup) q = q.eq("age_group", filter.ageGroup);
  if (filter.region) q = q.eq("region", filter.region);
  const { data, error } = await q;
  if (error || !Array.isArray(data)) return [];
  const totals = new Map<string, { total: number; ageGroup: string | null; region: string | null }>();
  for (const row of data as Array<{ user_id: string; score: number; age_group: string | null; region: string | null }>) {
    const cur = totals.get(row.user_id) ?? { total: 0, ageGroup: row.age_group, region: row.region };
    cur.total += row.score ?? 0;
    totals.set(row.user_id, cur);
  }
  const sorted = Array.from(totals.entries())
    .map(([uid, v]) => ({ user_id: uid, total: v.total, age_group: v.ageGroup, region: v.region }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 50);
  if (sorted.length === 0) return [];
  const ids = sorted.map((r) => r.user_id);
  const { data: profs } = await supabase
    .from("profiles" as never)
    .select("id, name, mascot")
    .in("id", ids);
  const profMap = new Map<string, { name: string; mascot: string | null }>();
  for (const p of (profs ?? []) as Array<{ id: string; name: string | null; mascot: string | null }>) {
    profMap.set(p.id, { name: p.name ?? "Aprendiz", mascot: p.mascot });
  }
  return sorted.map((r) => ({
    user_id: r.user_id,
    display_name: profMap.get(r.user_id)?.name ?? "Aprendiz",
    mascot: profMap.get(r.user_id)?.mascot ?? null,
    region: r.region,
    age_group: r.age_group,
    total: r.total,
  }));
}

export const getInfiniteWeeklyRanking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    ageGroup: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const since = new Date();
    const day = since.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1);
    since.setUTCDate(since.getUTCDate() - diff);
    since.setUTCHours(0, 0, 0, 0);
    const ranking = await aggregateRanking(supabase, {
      since: since.toISOString(),
      ageGroup: data.ageGroup ?? null,
      region: data.region ?? null,
    });
    const meIdx = ranking.findIndex((r) => r.user_id === userId);
    return { ranking, mePosition: meIdx >= 0 ? meIdx + 1 : null, weekStart: since.toISOString() };
  });

function currentSeason(): { id: string; name: string; emoji: string; endsAt: string } {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  // Northern hemisphere seasons (PT)
  let id = "primavera", name = "Primavera Mágica", emoji = "🌸", endMonth = 5;
  if (month >= 6 && month <= 8) { id = "verao"; name = "Verão Aventureiro"; emoji = "☀️"; endMonth = 8; }
  else if (month >= 9 && month <= 11) { id = "outono"; name = "Outono Sábio"; emoji = "🍂"; endMonth = 11; }
  else if (month === 12 || month <= 2) { id = "inverno"; name = "Inverno Estelar"; emoji = "❄️"; endMonth = 2; }
  const endYear = (id === "inverno" && month === 12) ? year + 1 : year;
  const endsAt = new Date(Date.UTC(endYear, endMonth, 0, 23, 59, 59)).toISOString();
  return { id: `${year}-${id}`, name, emoji, endsAt };
}

export const getInfiniteSeasonalTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    ageGroup: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const season = currentSeason();
    // Season window: ~3 months back from now is more than enough for the active season
    const since = new Date();
    since.setUTCDate(1);
    since.setUTCMonth(since.getUTCMonth() - 2);
    since.setUTCHours(0, 0, 0, 0);
    const ranking = await aggregateRanking(supabase, {
      since: since.toISOString(),
      ageGroup: data.ageGroup ?? null,
      region: data.region ?? null,
    });
    const meIdx = ranking.findIndex((r) => r.user_id === userId);
    return { season, ranking, mePosition: meIdx >= 0 ? meIdx + 1 : null };
  });
