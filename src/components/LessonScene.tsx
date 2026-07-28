import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type SubjectKey = "portugues" | "matematica" | "estudo-do-meio" | string;

interface SceneConfig {
  name: string;
  emoji: string;
  /** Tailwind gradient classes (uses semantic tokens / oklch). */
  gradient: string;
  /** Conjunto de partículas/decoração temática */
  particles: string[];
}

const SCENES: Record<string, SceneConfig> = {
  portugues: {
    name: "Biblioteca Encantada",
    emoji: "📚",
    gradient: "from-[oklch(0.96_0.04_50)] via-[oklch(0.93_0.08_35)] to-[oklch(0.88_0.1_25)]",
    particles: ["📖", "✒️", "📜", "📕", "🪶"],
  },
  matematica: {
    name: "Planeta dos Números",
    emoji: "🪐",
    gradient: "from-[oklch(0.95_0.04_240)] via-[oklch(0.9_0.08_260)] to-[oklch(0.82_0.12_280)]",
    particles: ["1", "2", "3", "5", "8", "✨", "+", "×", "−"],
  },
  "estudo-do-meio": {
    name: "Museu Vivo",
    emoji: "🌿",
    gradient: "from-[oklch(0.95_0.05_140)] via-[oklch(0.9_0.09_160)] to-[oklch(0.84_0.12_170)]",
    particles: ["🍃", "🌸", "🐞", "🦋", "🌳", "☀️"],
  },
};

function isNight() {
  if (typeof Date === "undefined") return false;
  const h = new Date().getHours();
  return h < 7 || h >= 20;
}

interface Props {
  subject: SubjectKey;
  /** Suaviza a saturação à noite. */
  dim?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LessonScene({ subject, dim, children, className }: Props) {
  const cfg = SCENES[subject] ?? SCENES.portugues;
  const night = dim ?? isNight();

  const floating = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      char: cfg.particles[i % cfg.particles.length],
      left: `${(i * 73) % 100}%`,
      delay: (i % 7) * 0.6,
      duration: 7 + ((i * 1.7) % 6),
      size: 14 + ((i * 5) % 18),
    }));
  }, [cfg.particles]);

  return (
    <div
      className={cn(
        "relative isolate min-h-[100dvh]",
        `bg-gradient-to-br ${cfg.gradient}`,
        night && "brightness-90 saturate-75",
        className,
      )}
    >
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 60%)",
        }}
      />

      {/* floating particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {floating.map((p, i) => (
          <motion.span
            key={i}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "-15%", opacity: [0, 0.7, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
            className="absolute font-display font-bold text-foreground/40"
            style={{ left: p.left, fontSize: p.size }}
          >
            {p.char}
          </motion.span>
        ))}
      </div>

      {/* scene label */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 hidden rounded-full border border-border/40 bg-card/70 px-3 py-1 text-[11px] font-display backdrop-blur sm:inline-flex">
        <span className="mr-1">{cfg.emoji}</span>
        {cfg.name}
        {night && <span className="ml-2 text-muted-foreground">🌙</span>}
      </div>

      <div className="relative z-0">{children}</div>
    </div>
  );
}
