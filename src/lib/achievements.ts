import { supabase } from "@/integrations/supabase/client";
import { loadProfile, updateProfile, type Profile } from "./storage";

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  coin_reward: number;
  xp_reward: number;
  sort_order: number;
}

export interface UnlockedAchievement {
  achievement_code: string;
  unlocked_at: string;
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Achievement[];
}

export async function fetchUnlocked(): Promise<UnlockedAchievement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // local fallback
    const raw = typeof window !== "undefined" ? localStorage.getItem("lusis-achievements") : null;
    return raw ? (JSON.parse(raw) as UnlockedAchievement[]) : [];
  }
  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_code, unlocked_at")
    .eq("user_id", user.id);
  return (data ?? []) as UnlockedAchievement[];
}

function meetsRequirement(a: Achievement, p: Profile, perfectLessons: number): boolean {
  switch (a.requirement_type) {
    case "lessons_completed":
      return p.completedLessons.length >= a.requirement_value;
    case "streak":
      return p.streak >= a.requirement_value;
    case "xp":
      return p.xp >= a.requirement_value;
    case "coins_total":
      return p.coins >= a.requirement_value;
    case "items_owned":
      return p.ownedItems.length >= a.requirement_value;
    case "perfect_lessons":
      return perfectLessons >= a.requirement_value;
    default:
      return false;
  }
}

const PERFECT_KEY = "lusis-perfect-lessons";
export function incrementPerfectLessons(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(localStorage.getItem(PERFECT_KEY) ?? "0") + 1;
  localStorage.setItem(PERFECT_KEY, String(n));
  return n;
}
export function getPerfectLessons(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(PERFECT_KEY) ?? "0");
}

/**
 * Verifica conquistas após uma lição. Devolve as recém-desbloqueadas.
 */
export async function checkAndUnlockAchievements(opts?: { wasPerfect?: boolean }): Promise<Achievement[]> {
  const profile = loadProfile();
  if (!profile) return [];

  const perfectLessons = opts?.wasPerfect ? incrementPerfectLessons() : getPerfectLessons();

  const [all, unlocked] = await Promise.all([fetchAchievements(), fetchUnlocked()]);
  const unlockedSet = new Set(unlocked.map((u) => u.achievement_code));

  const newly: Achievement[] = [];
  let coinBonus = 0;
  let xpBonus = 0;

  for (const a of all) {
    if (unlockedSet.has(a.code)) continue;
    if (meetsRequirement(a, profile, perfectLessons)) {
      newly.push(a);
      coinBonus += a.coin_reward;
      xpBonus += a.xp_reward;
    }
  }

  if (newly.length === 0) return [];

  // Persist locally always
  const local = await fetchUnlocked();
  const merged = [
    ...local,
    ...newly.map((a) => ({ achievement_code: a.code, unlocked_at: new Date().toISOString() })),
  ];
  if (typeof window !== "undefined") {
    localStorage.setItem("lusis-achievements", JSON.stringify(merged));
  }

  // Push to cloud if signed in
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_achievements").insert(
        newly.map((a) => ({ user_id: user.id, achievement_code: a.code })),
      );
    }
  } catch {
    // offline — ignora
  }

  // Apply rewards
  if (coinBonus > 0 || xpBonus > 0) {
    updateProfile({
      coins: profile.coins + coinBonus,
      xp: profile.xp + xpBonus,
    });
  }

  return newly;
}
