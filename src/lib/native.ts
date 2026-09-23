// Camada nativa (Capacitor) — só tem efeito no APK/Android.
// No browser puro é tudo no-op, sem custo de bundle (imports dinâmicos).
import { toast } from "sonner";

/** true quando a app corre dentro do Capacitor (APK). */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap?.isNativePlatform === "function" && cap.isNativePlatform();
}

let initialized = false;

/**
 * Inicializa a integração nativa: status bar conforme o tema,
 * botão back do Android, e esconder o splash screen.
 * Chamar uma vez no mount do root (useEffect — client-side).
 */
export async function initNative(): Promise<void> {
  if (!isNative() || initialized || typeof document === "undefined") return;
  initialized = true;

  // ---- Status bar acompanha o tema claro/escuro ----
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const apply = async () => {
      const dark = document.documentElement.classList.contains("dark");
      try {
        await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: dark ? "#16151d" : "#ffffff" });
      } catch {
        /* alguns Androids não suportam setBackgroundColor — ignorar */
      }
    };
    await apply();
    // Reage a mudanças de tema sem re-render
    new MutationObserver(() => void apply()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  } catch {
    /* plugin indisponível — seguir */
  }

  // ---- Botão back do Android → histórico do router (estilo Duolingo) ----
  try {
    const { App } = await import("@capacitor/app");
    await App.addListener("backButton", () => {
      if (history.length > 1) history.back();
      else void App.exitApp();
    });
  } catch {
    /* plugin indisponível — seguir */
  }

  // ---- Splash some quando a app está pronta (fade suave) ----
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    window.setTimeout(() => {
      void SplashScreen.hide({ fadeOutDuration: 350 }).catch(() => {});
    }, 500);
  } catch {
    /* plugin indisponível — seguir */
  }
}

let offlineWired = false;

/**
 * Guarda de ligação — avisa quando a internet cai/volta.
 * Útil no APK e também na web (crianças com ligação instável).
 */
export function initOfflineGuard(): void {
  if (offlineWired || typeof window === "undefined") return;
  offlineWired = true;
  window.addEventListener("offline", () => {
    toast.error("Sem ligação à internet", {
      description: "A Kidoz precisa de internet para sincronizar o teu progresso.",
    });
  });
  window.addEventListener("online", () => {
    toast.success("Ligação restabelecida! ⚡");
  });
}
