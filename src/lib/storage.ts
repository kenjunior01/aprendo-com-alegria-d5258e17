import type { MascotId } from "./mascots";
import type { RegionCode } from "./region";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  name: string;
  age: number;
  grade: number; // 1..4 (ano escolar)
  mascot: MascotId;
  xp: number;
  coins: number; // Abracadinhos
  gems: number;
  streak: number;
  hearts: number;
  lastPlayed: string; // YYYY-MM-DD
  completedLessons: string[];
  ownedItems: string[];
  equippedItem: string | null;
  isPremium: boolean;
  role: "child" | "parent";
  createdAt: string;
  // Parental controls (configured from /pais)
  parentPin?: string | null;
  dailyLimitMin?: number | null;
  bedtimeHour?: number | null;
  region?: RegionCode | null;
  interests?: string[];
  // Mascot Needs (Talking Tom style)
  hunger: number; // 0..100
  energy: number; // 0..100
  fun: number; // 0..100
  knowledge: number; // 0..100
  pushToken?: string | null;
  lastDailyGift?: string | null; // YYYY-MM-DD
}

const KEY = "lusis-profile-v2";

export const defaultProfile = (): Profile => ({
  name: "",
  age: 7,
  grade: 1,
  mascot: "fox",
  xp: 0,
  coins: 0,
  gems: 0,
  streak: 0,
  hearts: 5,
  lastPlayed: "",
  completedLessons: [],
  ownedItems: [],
  equippedItem: null,
  isPremium: false,
  role: "child",
  createdAt: new Date().toISOString(),
  parentPin: null,
  dailyLimitMin: null,
  bedtimeHour: null,
  region: null,
  interests: [],
  hunger: 80,
  energy: 100,
  fun: 90,
  knowledge: 50,
  lastDailyGift: null,
});

export const loadProfile = (): Profile | null => {
  if (typeof window === "undefined") return null;
  try {
    // Migrate from v1 if needed
    const v1 = localStorage.getItem("lusis-profile-v1");
    const raw = localStorage.getItem(KEY) ?? v1;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...defaultProfile(), ...parsed } as Profile;
  } catch {
    return null;
  }
};

export const saveProfile = (p: Profile) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  void syncProfileToCloud(p);
};

export const updateProfile = (patch: Partial<Profile>): Profile => {
  const current = loadProfile() ?? defaultProfile();
  const next = { ...current, ...patch };
  saveProfile(next);
  return next;
};

export const resetProfile = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem("lusis-profile-v1");
};

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export interface LessonResult {
  lessonId: string;
  subjectId: string;
  grade: number;
  correct: number;
  total: number;
  durationSeconds: number;
}

export const completeLesson = (result: LessonResult): Profile => {
  const current = loadProfile() ?? defaultProfile();
  const t = today();
  let streak = current.streak;
  if (current.lastPlayed === t) {
    // mesmo dia, mantém
  } else if (current.lastPlayed === yesterday()) {
    streak += 1;
  } else {
    streak = 1;
  }
  const accuracy = result.total > 0 ? result.correct / result.total : 0;
  const xpEarned = Math.round(result.correct * 10 + (accuracy === 1 ? 20 : 0));
  const coinsEarned = Math.round(result.correct * 3 + (accuracy === 1 ? 10 : 0));

  const completed = current.completedLessons.includes(result.lessonId)
    ? current.completedLessons
    : [...current.completedLessons, result.lessonId];

  const next: Profile = {
    ...current,
    xp: current.xp + xpEarned,
    coins: current.coins + coinsEarned,
    streak,
    lastPlayed: t,
    completedLessons: completed,
    hearts: Math.min(5, current.hearts + 1),
  };
  saveProfile(next);
  void recordSession(result, xpEarned, coinsEarned);
  // Atualiza missões diárias (lição feita + acertos + minutos)
  if (typeof window !== "undefined") {
    void import("./dailyMissions").then(({ applyProgress }) => {
      applyProgress({
        subject: result.subjectId,
        lessonsDelta: 1,
        correctDelta: result.correct,
        minutesDelta: Math.max(1, Math.round(result.durationSeconds / 60)),
      });
    });
  }
  return next;
};

// Buy a shop item
export const buyItem = (itemId: string, price: number): { ok: boolean; profile: Profile; reason?: string } => {
  const current = loadProfile() ?? defaultProfile();
  if (current.ownedItems.includes(itemId)) {
    return { ok: false, profile: current, reason: "already_owned" };
  }
  if (current.coins < price) {
    return { ok: false, profile: current, reason: "not_enough_coins" };
  }
  const next: Profile = {
    ...current,
    coins: current.coins - price,
    ownedItems: [...current.ownedItems, itemId],
    equippedItem: itemId,
  };
  saveProfile(next);
  return { ok: true, profile: next };
};

export const equipItem = (itemId: string | null): Profile => {
  const current = loadProfile() ?? defaultProfile();
  if (itemId && !current.ownedItems.includes(itemId)) return current;
  const next = { ...current, equippedItem: itemId };
  saveProfile(next);
  return next;
};

// ============ Cloud sync ============

async function syncProfileToCloud(p: Profile) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      name: p.name,
      age: p.age,
      grade: p.grade,
      mascot: p.mascot,
      xp: p.xp,
      coins: p.coins,
      gems: p.gems,
      streak: p.streak,
      hearts: p.hearts,
      last_played: p.lastPlayed || null,
      completed_lessons: p.completedLessons,
      owned_items: p.ownedItems,
      equipped_item: p.equippedItem,
      is_premium: p.isPremium,
      role: p.role,
      parent_pin: p.parentPin ?? null,
      daily_limit_min: p.dailyLimitMin ?? null,
      bedtime_hour: p.bedtimeHour ?? null,
      region: p.region ?? null,
      interests: p.interests ?? [],
      hunger: p.hunger,
      energy: p.energy,
      fun: p.fun,
      knowledge: p.knowledge,
      push_token: p.pushToken ?? null,
      last_daily_gift: p.lastDailyGift ?? null,
    });
  } catch {
    // offline ou sem sessão — ignora
  }
}

async function recordSession(r: LessonResult, xp: number, coins: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("practice_sessions").insert({
      user_id: user.id,
      subject_id: r.subjectId,
      lesson_id: r.lessonId,
      grade: r.grade,
      correct: r.correct,
      total: r.total,
      duration_seconds: r.durationSeconds,
      xp_earned: xp,
      coins_earned: coins,
    });
  } catch {
    // ignore
  }
}

export async function pullProfileFromCloud(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data) return null;
    const cloudProfile: Profile = {
      name: data.name ?? "",
      age: data.age ?? 7,
      grade: data.grade ?? 1,
      mascot: (data.mascot as MascotId) ?? "fox",
      xp: data.xp ?? 0,
      coins: data.coins ?? 0,
      gems: data.gems ?? 0,
      streak: data.streak ?? 0,
      hearts: data.hearts ?? 5,
      lastPlayed: data.last_played ?? "",
      completedLessons: data.completed_lessons ?? [],
      ownedItems: data.owned_items ?? [],
      equippedItem: data.equipped_item ?? null,
      isPremium: data.is_premium ?? false,
      role: (data.role as "child" | "parent") ?? "child",
      createdAt: data.created_at ?? new Date().toISOString(),
      parentPin: (data as { parent_pin?: string | null }).parent_pin ?? null,
      dailyLimitMin: (data as { daily_limit_min?: number | null }).daily_limit_min ?? null,
      bedtimeHour: (data as { bedtime_hour?: number | null }).bedtime_hour ?? null,
      region: ((data as { region?: RegionCode | null }).region ?? null),
      interests: ((data as { interests?: string[] }).interests ?? []),
      hunger: data.hunger ?? 80,
      energy: data.energy ?? 100,
      fun: data.fun ?? 90,
      knowledge: data.knowledge ?? 50,
      pushToken: (data as any).push_token ?? null,
      lastDailyGift: (data as any).last_daily_gift ?? null,
    };
    const local = loadProfile();
    const merged = mergeProfiles(local, cloudProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return null;
  }
}

function mergeProfiles(local: Profile | null, cloud: Profile): Profile {
  if (!local || !local.name) return cloud;
  const completed = Array.from(new Set([...local.completedLessons, ...cloud.completedLessons]));
  const owned = Array.from(new Set([...local.ownedItems, ...cloud.ownedItems]));
  return {
    ...cloud,
    name: cloud.name || local.name,
    age: cloud.age || local.age,
    grade: Math.max(local.grade, cloud.grade),
    mascot: cloud.mascot || local.mascot,
    xp: Math.max(local.xp, cloud.xp),
    coins: Math.max(local.coins, cloud.coins),
    gems: Math.max(local.gems, cloud.gems),
    streak: Math.max(local.streak, cloud.streak),
    hearts: Math.max(local.hearts, cloud.hearts),
    lastPlayed: local.lastPlayed > cloud.lastPlayed ? local.lastPlayed : cloud.lastPlayed,
    completedLessons: completed,
    ownedItems: owned,
    equippedItem: cloud.equippedItem ?? local.equippedItem,
    isPremium: cloud.isPremium || local.isPremium,
    role: cloud.role || local.role,
    // Parental controls: cloud is source of truth (set by parent on any device)
    parentPin: cloud.parentPin ?? local.parentPin ?? null,
    dailyLimitMin: cloud.dailyLimitMin ?? local.dailyLimitMin ?? null,
    bedtimeHour: cloud.bedtimeHour ?? local.bedtimeHour ?? null,
    region: cloud.region ?? local.region ?? null,
    interests: (cloud.interests?.length ? cloud.interests : local.interests) ?? [],
    hunger: cloud.hunger,
    energy: cloud.energy,
    fun: cloud.fun,
    knowledge: cloud.knowledge,
    pushToken: cloud.pushToken ?? local.pushToken ?? null,
  };
}

export async function pushFullProfile() {
  const p = loadProfile();
  if (p) await syncProfileToCloud(p);
}
