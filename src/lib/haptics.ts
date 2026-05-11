// Haptic feedback util — usa Vibration API quando disponível
// (mobile Chrome / Android). Em iOS Safari não vibra mas não falha.

type Pattern = "tap" | "success" | "error" | "celebrate";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 10,
  success: [12, 40, 18],
  error: [40, 30, 40],
  celebrate: [10, 30, 10, 30, 60],
};

let enabled = true;

export function setHapticsEnabled(v: boolean) {
  enabled = v;
  if (typeof window !== "undefined") {
    localStorage.setItem("kidoz-haptics", v ? "1" : "0");
  }
}

export function loadHapticsPref() {
  if (typeof window === "undefined") return;
  const v = localStorage.getItem("kidoz-haptics");
  if (v === "0") enabled = false;
}

export function haptic(pattern: Pattern = "tap") {
  if (!enabled) return;
  if (typeof navigator === "undefined") return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate === "function") {
    try { nav.vibrate(PATTERNS[pattern]); } catch { /* noop */ }
  }
}
