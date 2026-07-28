// Tracks per-day app usage minutes locally so parental time-limits can be enforced.
const KEY = "kidoz-usage-v1";

interface UsageMap { [date: string]: number } // minutes

const today = () => new Date().toISOString().slice(0, 10);

const load = (): UsageMap => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as UsageMap;
  } catch {
    return {};
  }
};

const save = (m: UsageMap) => {
  if (typeof window === "undefined") return;
  // Trim to last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const trimmed: UsageMap = {};
  for (const [k, v] of Object.entries(m)) if (k >= cutoffStr) trimmed[k] = v;
  localStorage.setItem(KEY, JSON.stringify(trimmed));
};

export const getTodayMinutes = (): number => Math.round(load()[today()] ?? 0);

export const addUsageSeconds = (seconds: number) => {
  if (seconds <= 0) return;
  const m = load();
  m[today()] = (m[today()] ?? 0) + seconds / 60;
  save(m);
};

export const isBedtime = (bedtimeHour: number | null | undefined): boolean => {
  if (bedtimeHour == null) return false;
  const h = new Date().getHours();
  // Block from bedtime through 6am
  if (bedtimeHour <= 6) return h >= bedtimeHour && h < 6;
  return h >= bedtimeHour || h < 6;
};

export const isOverLimit = (limitMin: number | null | undefined): boolean => {
  if (limitMin == null || limitMin <= 0) return false;
  return getTodayMinutes() >= limitMin;
};
