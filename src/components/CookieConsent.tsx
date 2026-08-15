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
      // Delay appearance slightly so it doesn't flash on every navigation
      const t = setTimeout(() => setVisible(true), 2500);
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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/95 p-3 shadow-lg backdrop-blur-sm sm:p-3.5"
      role="dialog"
      aria-modal="false"
      aria-label="Consentimento de cookies"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <Cookie className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="flex-1 text-xs text-foreground/80">
          Usamos cookies para melhorar a experiência.{" "}
          <a
            href="/privacidade"
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Saber mais
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <ChunkyButton
            tone="ghost"
            onClick={() => handleChoice("essential")}
            className="text-xs px-3 py-1.5"
          >
            Essenciais
          </ChunkyButton>
          <ChunkyButton
            onClick={() => handleChoice("all")}
            className="text-xs px-3 py-1.5"
          >
            Aceitar
          </ChunkyButton>
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
