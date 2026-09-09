import { useState, useEffect } from "react";
import { ChunkyButton } from "./ChunkyButton";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "kidoz_cookie_consent";

type ConsentChoice = "all" | "essential" | null;

function getStoredConsent(): ConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    return (localStorage.getItem(STORAGE_KEY) as ConsentChoice) ?? null;
  } catch {
    return null;
  }
}

/**
 * RGPD/COPPA-compliant cookie consent banner.
 * Persists choice in localStorage; only re-appears if no choice stored.
 * "Apenas essenciais" disables non-essential analytics/storage.
 * "Aceitar todos" enables full functionality.
 */
export function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setChoice(stored);
      applyConsent(stored);
    } else {
      // Delay appearance so it doesn't block the hero on first load
      const t = setTimeout(() => setVisible(true), 4500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleChoice = (c: ConsentChoice) => {
    if (!c) return;
    setChoice(c);
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* localStorage unavailable */
    }
    applyConsent(c);
  };

  return visible ? (
    <div
      className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-4 sm:max-w-[26rem]"
      role="dialog"
      aria-modal="false"
      aria-label="Consentimento de cookies"
    >
      <div className="card-chunky rounded-2xl border border-border bg-card/95 p-3.5 backdrop-blur-md sm:backdrop-blur-lg">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-2">
            <Cookie className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Usamos cookies para melhorar a experiência.{" "}
              <a
                href="/privacidade"
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Saber mais
              </a>
            </p>
          </div>
          <div className="flex shrink-0 justify-end gap-2">
            <ChunkyButton
              tone="ghost"
              onClick={() => handleChoice("essential")}
              className="text-xs px-3 py-1.5"
            >
              Essenciais
            </ChunkyButton>
            <ChunkyButton onClick={() => handleChoice("all")} className="text-xs px-3 py-1.5">
              Aceitar
            </ChunkyButton>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

/**
 * Applies consent choice: when "essential" only, we disable
 * non-essential analytics by setting a global flag.
 */
function applyConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;

  // Expose consent state for analytics scripts to check
  (window as unknown as Record<string, unknown>).__KIDOZ_CONSENT__ = choice;

  if (choice === "essential") {
    (window as unknown as Record<string, unknown>).__KIDOZ_ANALYTICS_DISABLED__ = true;
  } else {
    (window as unknown as Record<string, unknown>).__KIDOZ_ANALYTICS_DISABLED__ = false;
  }
}
