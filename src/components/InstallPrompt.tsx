import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Download, X } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";

/** Rotas onde o banner bloquearia ações críticas (onboarding, auth, chat do tutor). */
const BLOCKED_PREFIXES = ["/comecar", "/auth", "/tutor", "/licao", "/checkout"];

/** Atraso antes de mostrar o banner — deixa o utilizador explorar primeiro. */
const SHOW_DELAY_MS = 15000;

/**
 * PWA install prompt — shows a subtle banner when the app is installable
 * but not yet installed. Dismissed state persists in localStorage.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [delayed, setDelayed] = useState(false);
  const location = useLocation();

  const onBlockedRoute = BLOCKED_PREFIXES.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
  );

  useEffect(() => {
    // Check if already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as Record<string, unknown>).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Check if previously dismissed (persistente — não voltar a incomodar)
    try {
      if (localStorage.getItem("kidoz_install_dismissed")) {
        setDismissed(true);
        return;
      }
    } catch {
      /* localStorage indisponível */
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Delay antes de mostrar — evita cobrir conteúdo nos primeiros segundos
    const timer = window.setTimeout(() => setDelayed(true), SHOW_DELAY_MS);

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("kidoz_install_dismissed", "1");
    } catch {
      /* noop */
    }
  };

  // Não mostrar se: standalone, sem prompt, dispensado, em rota crítica,
  // ou antes do atraso inicial (evita cobrir onboarding/autenticação)
  if (isStandalone || !deferredPrompt || dismissed || !delayed || onBlockedRoute) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-30 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-[20rem]"
      role="dialog"
      aria-label="Instalar aplicação"
    >
      <div className="card-chunky rounded-2xl border-2 border-primary/30 bg-card p-4 shadow-lg">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar"
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold">Instalar a Kidoz</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Acede mais rápido e usa mesmo sem internet.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <ChunkyButton onClick={handleInstall} className="flex-1 text-sm">
            Instalar
          </ChunkyButton>
          <ChunkyButton tone="ghost" onClick={handleDismiss} className="text-sm">
            Agora não
          </ChunkyButton>
        </div>
      </div>
    </div>
  );
}

// TypeScript type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
