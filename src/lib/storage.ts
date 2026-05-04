import type { MascotId } from "./mascots";

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
