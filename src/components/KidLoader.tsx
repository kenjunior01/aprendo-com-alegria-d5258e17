import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

/** Dicas rodadas durante a espera — viram aprendizagem em momento mágico. */
const TIPS = [
  "🧭 A Mocha sabe tudo sobre os descobrimentos portugueses!",
  "⚡ A Faísca resolve contas num piscar de olhos!",
  "🐰 A Pipoca salta de alegria quando acertas!",
  "🐢 O Tito diz: devagar e sempre, chegamos longe!",
  "🎩 Ganha moedas e veste a tua mascote com itens mágicos!",
  "🔥 Cada dia seguido faz o teu streak crescer mais!",
];

interface KidLoaderProps {
  /** Id da mascote a mostrar. Por omissão usa a Mocha (a coruja, cara da marca). */
  mascotId?: MascotId | null;
  label?: string;
  /** Versão compacta, para usar dentro de páginas que já têm cabeçalho. */
  compact?: boolean;
  /** Mostra dicas educativas rodadas (default: true). */
  tips?: boolean;
  className?: string;
}

/**
 * Loader "mais que espetacular" da Kidoz: céu com elementos flutuantes,
 * mascote a saltitar num anel brilhante, barra de progresso viva e dicas
 * que ensinam qualquer coisa enquanto a aventura prepara.
 * Reduced-motion respeitado via MotionConfig no root.
 */
export function KidLoader({
  mascotId,
  label = "A preparar a tua aventura…",
  compact = false,
  tips = true,
  className,
}: KidLoaderProps) {
  const mascot = MASCOTS.find((m) => m.id === mascotId) ?? MASCOTS[1];
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    if (!tips || compact) return;
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [tips, compact]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 overflow-hidden p-6",
        compact ? "py-8" : "min-h-[60dvh]",
        className,
      )}
    >
      {/* Fundo mágico — elementos flutuantes só em versão completa */}
      {!compact && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {["☁️", "⭐", "✨", "🎈", "☁️", "⭐"].map((e, i) => (
            <span
              key={i}
              className="absolute animate-bounce-soft text-2xl opacity-25 sm:text-3xl"
              style={{
                left: `${8 + i * 16}%`,
                top: `${12 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + (i % 3) * 0.7}s`,
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Mascote em anel brilhante */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary/25 blur-2xl"
          aria-hidden
        />
        <img
          src={mascot.image}
          alt=""
          aria-hidden
          width={200}
          height={200}
          className={cn(
            "animate-bounce-soft rounded-full",
            compact ? "h-14 w-14" : "h-24 w-24 sm:h-28 sm:w-28",
          )}
        />
        {/* Faíscas orbitantes */}
        {!compact && (
          <>
            <span
              aria-hidden
              className="absolute -left-1 top-2 animate-bounce-soft text-lg"
              style={{ animationDelay: "0.3s" }}
            >
              ✨
            </span>
            <span
              aria-hidden
              className="absolute -right-2 bottom-3 animate-bounce-soft text-lg"
              style={{ animationDelay: "0.9s" }}
            >
              ⭐
            </span>
          </>
        )}
      </div>

      {/* Barra de progresso viva (indeterminada com brilho) */}
      <div
        className="relative h-3 w-48 overflow-hidden rounded-full bg-muted sm:w-56"
        role="progressbar"
        aria-label={label}
      >
        <motion.div
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/70"
        />
      </div>

      <p className="font-display text-sm font-semibold text-foreground/80 sm:text-base">{label}</p>

      {/* Dica rodante (só versão completa) */}
      {!compact && tips && (
        <div className="mt-1 h-10 max-w-[20rem] text-center sm:max-w-[24rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border/60 bg-card/80 px-4 py-2 text-xs text-muted-foreground shadow-sm sm:text-sm"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Pontos — mantidos para a versão compacta */}
      {compact && (
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-pulse rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 180}ms`, animationDuration: "1.1s" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
