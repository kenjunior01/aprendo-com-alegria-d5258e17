// RouteFx — efeitos cinematográficos globais de navegação:
// 1) NavigationProgress — barra de progresso no topo durante navegações (estilo YouTube)
// 2) RouteEnter — animação de entrada do conteúdo em cada troca de rota
// Ambas respeitam prefers-reduced-motion e usam apenas transform/opacity (APK-friendly).
import { useLocation, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function RouteFx() {
  return (
    <>
      <NavigationProgress />
      <RouteEnter />
    </>
  );
}

/** Barra fina no topo enquanto o router prepara a próxima página. */
function NavigationProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
          transition={{ duration: 0.12 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[80]"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
          aria-hidden="true"
        >
          <div className="nav-progress-bar h-[3px] w-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Re-anima o <main id="main-content"> da página em cada troca de rota. */
function RouteEnter() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Páginas com KidLoader não têm #main-content de imediato — tentar por alguns frames
    let raf = 0;
    let tries = 0;
    const tryApply = () => {
      const el = document.getElementById("main-content");
      if (el) {
        el.classList.remove("route-enter");
        // Força reflow para reiniciar a animação CSS
        void el.offsetWidth;
        el.classList.add("route-enter");
        return;
      }
      if (++tries < 12) raf = requestAnimationFrame(tryApply);
    };
    raf = requestAnimationFrame(tryApply);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
  return null;
}
