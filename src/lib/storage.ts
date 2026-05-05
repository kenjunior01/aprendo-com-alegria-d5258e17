import type { MascotId } from "./mascots";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  name: string;
  age: number;
  mascot: MascotId;
  xp: number;
  streak: number;
  hearts: number;
  lastPlayed: string; // YYYY-MM-DD
  completedLessons: string[]; // lesson ids
  createdAt: string;
}

const KEY = "lusis-profile-v1";

export const defaultProfile = (): Profile => ({
  name: "",
  age: 7,
  mascot: "fox",
  xp: 0,
  streak: 0,
  hearts: 5,
  lastPlayed: "",
  completedLessons: [],
  createdAt: new Date().toISOString(),
});

export const loadProfile = (): Profile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...defaultProfile(), ...JSON.parse(raw) } as Profile;
  } catch {
    return null;
  }
};

export const saveProfile = (p: Profile) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  // fire-and-forget cloud sync
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
};

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const completeLesson = (lessonId: string, xpEarned: number): Profile => {
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
  const completed = current.completedLessons.includes(lessonId)
    ? current.completedLessons
    : [...current.completedLessons, lessonId];
  const next: Profile = {
    ...current,
    xp: current.xp + xpEarned,
    streak,
    lastPlayed: t,
    completedLessons: completed,
    hearts: Math.min(5, current.hearts + 1),
  };
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
      mascot: p.mascot,
      xp: p.xp,
      streak: p.streak,
      hearts: p.hearts,
      last_played: p.lastPlayed || null,
      completed_lessons: p.completedLessons,
    });
  } catch {
    // offline ou sem sessão — ignora
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
      mascot: (data.mascot as MascotId) ?? "fox",
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      hearts: data.hearts ?? 5,
      lastPlayed: data.last_played ?? "",
      completedLessons: data.completed_lessons ?? [],
      createdAt: data.created_at ?? new Date().toISOString(),
    };
    // Merge: prefer the version with mais XP / mais lições
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
  return {
    ...cloud,
    name: cloud.name || local.name,
    age: cloud.age || local.age,
    mascot: cloud.mascot || local.mascot,
    xp: Math.max(local.xp, cloud.xp),
    streak: Math.max(local.streak, cloud.streak),
    hearts: Math.max(local.hearts, cloud.hearts),
    lastPlayed: local.lastPlayed > cloud.lastPlayed ? local.lastPlayed : cloud.lastPlayed,
    completedLessons: completed,
  };
}

export async function pushFullProfile() {
  const p = loadProfile();
  if (p) await syncProfileToCloud(p);
}
