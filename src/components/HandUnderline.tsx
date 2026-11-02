import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type HandUnderlineProps = {
  /** Cor do traço via classe de texto (ex.: "text-xp") — o SVG usa currentColor. */
  className?: string;
  /** Estilos extra para o SVG (ex.: cor de tema dinâmica via CSS var). */
  style?: React.CSSProperties;
  /** Atraso antes de a "caneta" começar a riscar (segundos). */
  delay?: number;
  /** Duração do traçado (segundos). */
  duration?: number;
  /** Espessura do traço no viewBox. */
  strokeWidth?: number;
  /** Traçado personalizado; por omissão usa o gesto do herói da landing. */
  d?: string;
  /** viewBoxWidth do SVG (manter coerente com o d). */
  viewBoxWidth?: number;
};

/**
 * Signature move da marca: sublinhado desenhado à mão (path draw).
 * O gesto de "riscar a caneta" dá vida a palavras e títulos de milestone —
 * o mesmo gesto do herói da landing, agora reutilizável em toda a app.
 *
 * Regras do design-motion-principles respeitadas:
 * - só em momentos raros/celebratórios (a Frequency Gate afasta-o de jogos);
 * - desacelera ao chegar (cubic-bezier 0.22,1,0.36,1 — ease-out-soft);
 * - prefers-reduced-motion: o traço aparece já desenhado, sem animação.
 */
export function HandUnderline({
  className,
  style,
  delay = 0,
  duration = 0.6,
  strokeWidth = 8,
  d = "M6 15 C 55 7, 120 5, 214 11",
  viewBoxWidth = 220,
}: HandUnderlineProps) {
  const reduced = useReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${viewBoxWidth} 24`}
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute -bottom-1 left-0 h-[0.3em] w-full sm:-bottom-1.5",
        className,
      )}
      style={style}
      fill="none"
    >
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { delay, duration, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
