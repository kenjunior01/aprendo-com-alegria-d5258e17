// Haptic feedback util — usa @capacitor/haptics no APK (feedback nativo
// Android) e a Vibration API na web (mobile Chrome/Android).
// Em iOS Safari não vibra mas não falha.

import { isNative } from "./native";

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
    localStorage.setItem("alegria-haptics", v ? "1" : "0");
  }
}

export function loadHapticsPref() {
  if (typeof window === "undefined") return;
  const v = localStorage.getItem("alegria-haptics");
  if (v === "0") enabled = false;
}

export function haptic(pattern: Pattern = "tap") {
  if (!enabled) return;
  if (typeof navigator === "undefined") return;

  // APK: haptics nativo (import dinâmico — zero custo no bundle web)
  if (isNative()) {
    void import("@capacitor/haptics")
      .then(({ Haptics, ImpactStyle, NotificationType }) => {
        switch (pattern) {
          case "tap":
            void Haptics.impact({ style: ImpactStyle.Light });
            break;
          case "success":
            void Haptics.notification({ type: NotificationType.Success });
            break;
          case "error":
            void Haptics.notification({ type: NotificationType.Error });
            break;
          case "celebrate":
            void Haptics.vibrate({ duration: 280 });
            break;
        }
      })
      .catch(() => {
        /* fallback silencioso */
      });
    return;
  }

  // Web: Vibration API
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate === "function") {
    try {
      nav.vibrate(PATTERNS[pattern]);
    } catch {
      /* noop */
    }
  }
}
