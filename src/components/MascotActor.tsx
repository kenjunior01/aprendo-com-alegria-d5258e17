// MascotActor — renderizador de mascote de nova geração.
// Camadas: sombra no chão sincronizada + aura de brilho emocional + sprite 3D
// com cross-fade entre emoções + física squash & stretch por humor + tilt 3D
// que segue o ponteiro + partículas de transição. 100% transform/opacity
// (performance APK) e respeita prefers-reduced-motion.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { Mascot } from "@/components/Mascot";
import type { MascotEmotion, MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

export type ActorMood =
  | "neutral"
  | "happy"
  | "thinking"
  | "sad"
  | "celebrate"
  | "tired"
  | "listening"
  | "excited"
  | "worried";

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  mood?: ActorMood;
  /** Desativa tilt/física pesada (ex: dentro de listas). */
  calm?: boolean;
  equippedItemId?: string | null;
  growthScale?: number;
  className?: string;
  onTap?: () => void;
  ariaLabel?: string;
}

/* ── Humor → sprite emocional ── */
function moodToEmotion(mood: ActorMood): MascotEmotion {
  switch (mood) {
    case "celebrate":
    case "excited":
      return "celebrate";
    case "sad":
    case "worried":
      return "sad";
    case "tired":
      return "sleep";
    default:
      return "idle";
  }
}

/* ── Física squash & stretch por humor (keyframes suaves, só transform) ── */
const MOOD_PHYSICS: Record<ActorMood, { animate: TargetAndTransition; transition: Transition }> = {
  neutral: {
    animate: { y: [0, -3, 0], scaleY: [1, 1.015, 1], scaleX: [1, 0.99, 1] },
    transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    animate: { y: [0, -7, 2, 0], scaleY: [1, 1.06, 0.97, 1], scaleX: [1, 0.96, 1.03, 1] },
    transition: { duration: 0.9, repeat: Infinity, repeatDelay: 1.6 },
  },
  thinking: {
    animate: { rotate: [0, -3.5, 0, 2.5, 0], x: [0, -2.5, 0, 2, 0] },
    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
  },
  sad: {
    animate: {
      y: [0, 3.5, 0],
      scaleY: [1, 0.965, 1],
      scaleX: [1, 1.02, 1],
      rotate: [0, -1.6, 1.6, 0],
    },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  worried: {
    animate: {
      x: [0, -2.5, 2.5, -1.5, 0],
      rotate: [0, -1.5, 1.5, -1, 0],
      scaleX: [1, 0.985, 1],
      scaleY: [1, 1.01, 1],
    },
    transition: { duration: 1.6, repeat: Infinity },
  },
  celebrate: {
    animate: {
      y: [0, -18, -2, -22, 0],
      scaleY: [1, 1.08, 0.95, 1.1, 1],
      scaleX: [1, 0.96, 1.04, 0.95, 1],
      rotate: [0, -5, 5, -3, 0],
    },
    transition: { duration: 1.05, repeat: Infinity, repeatDelay: 0.35 },
  },
  excited: {
    animate: { y: [0, -11, 0, -7, 0], scaleY: [1, 1.05, 1, 1.03, 1] },
    transition: { duration: 0.85, repeat: Infinity, repeatDelay: 0.5 },
  },
  tired: {
    animate: { scaleY: [1, 1.035, 1], y: [0, 1.5, 0], opacity: [1, 0.88, 1] },
    transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
  },
  listening: {
    animate: { rotate: [0, -5, 0, 4, 0], x: [0, 3, 0, -2, 0] },
    transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ── Aura + partículas por humor ── */
const MOOD_AURA: Partial<Record<ActorMood, string>> = {
  celebrate: "rgba(250, 204, 21, 0.55)",
  excited: "rgba(251, 146, 60, 0.5)",
  happy: "rgba(250, 204, 21, 0.32)",
  sad: "rgba(96, 165, 250, 0.4)",
  worried: "rgba(129, 140, 248, 0.38)",
  tired: "rgba(129, 140, 248, 0.28)",
  listening: "rgba(45, 212, 191, 0.4)",
  thinking: "rgba(167, 139, 250, 0.3)",
};

const MOOD_PARTICLES: Partial<Record<ActorMood, string[]>> = {
  celebrate: ["✨", "🎉", "⭐"],
  excited: ["⭐", "💫"],
  happy: ["💛"],
  sad: ["💧"],
  worried: ["💧", "💭"],
  tired: ["💤"],
  listening: ["👂", "💬"],
  thinking: ["💭"],
};

const sizeMap = { sm: "h-16 w-16", md: "h-28 w-28", lg: "h-40 w-40", xl: "h-56 w-56" } as const;

interface Particle {
  id: number;
  emoji: string;
  x: number;
  drift: number;
}

export function MascotActor({
  mascotId,
  size = "md",
  mood = "neutral",
  calm = false,
  equippedItemId,
  growthScale = 1,
  className,
  onTap,
  ariaLabel,
}: Props) {
  const reduced = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevMood = useRef<ActorMood>(mood);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Tilt 3D que segue o ponteiro (desktop); molas para suavidade
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 180, damping: 16 });
  const springTiltY = useSpring(tiltY, { stiffness: 180, damping: 16 });

  const emotion = moodToEmotion(mood);
  const physics = useMemo(() => MOOD_PHYSICS[mood], [mood]);

  // Partículas quando o humor muda para algo expressivo
  useEffect(() => {
    if (prevMood.current === mood) return;
    prevMood.current = mood;
    const set = MOOD_PARTICLES[mood];
    if (!set || reduced) return;
    const burst = set.map((emoji, i) => ({
      id: Date.now() + i,
      emoji,
      x: 14 + i * 28 + Math.round(Math.random() * 16),
      drift: Math.random() > 0.5 ? 10 : -10,
    }));
    setParticles((p) => [...p.slice(-2), ...burst]);
    const t = setTimeout(() => setParticles((p) => p.slice(burst.length)), 1500);
    return () => clearTimeout(t);
  }, [mood, reduced]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || calm || e.pointerType !== "mouse") return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 16);
    tiltX.set(-py * 12);
  };
  const onPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const auraColor = MOOD_AURA[mood];

  return (
    <div
      ref={wrapRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("relative inline-flex flex-col items-center", className)}
      style={{ perspective: 600 }}
    >
      {/* Aura de brilho emocional */}
      <AnimatePresence>
        {auraColor && !reduced && (
          <motion.div
            key={mood}
            aria-hidden
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.18, 1] }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{
              opacity: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="pointer-events-none absolute inset-0 rounded-full blur-2xl"
            style={{ background: `radial-gradient(circle, ${auraColor} 0%, transparent 68%)` }}
          />
        )}
      </AnimatePresence>

      {/* Sombra no chão (encolhe quando o mascote salta) */}
      <motion.div
        aria-hidden
        className="absolute -bottom-1 h-[7%] w-[62%] rounded-[100%] bg-black/25 blur-[6px]"
        animate={
          mood === "celebrate" || mood === "excited"
            ? { scaleX: [1, 0.78, 0.95, 0.72, 1], opacity: [0.5, 0.3, 0.45, 0.28, 0.5] }
            : { scaleX: [1, 0.94, 1], opacity: [0.5, 0.4, 0.5] }
        }
        transition={
          mood === "celebrate" || mood === "excited"
            ? { duration: 1.05, repeat: Infinity, repeatDelay: 0.35 }
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* button só quando há onTap (evita <button> aninhado) */}
      {onTap ? (
        <motion.button
          type="button"
          onClick={onTap}
          whileTap={reduced ? undefined : { scale: 0.93 }}
          style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }}
          className="relative cursor-pointer"
          aria-label={ariaLabel}
        >
          <SpriteStack
            mascotId={mascotId}
            size={size}
            emotion={emotion}
            physics={physics}
            reduced={reduced}
            equippedItemId={equippedItemId}
            growthScale={growthScale}
          />
          <TransitionParticles particles={particles} />
        </motion.button>
      ) : (
        <motion.div
          style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          <SpriteStack
            mascotId={mascotId}
            size={size}
            emotion={emotion}
            physics={physics}
            reduced={reduced}
            equippedItemId={equippedItemId}
            growthScale={growthScale}
          />
          <TransitionParticles particles={particles} />
        </motion.div>
      )}

      {/* Zzz flutuante ao dormir */}
      {mood === "tired" && (
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { y: [-2, -14], opacity: [0, 1, 0], rotate: 12 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          className="pointer-events-none absolute -right-1 top-0 text-xl"
        >
          💤
        </motion.span>
      )}
    </div>
  );
}

/* ── Pilha de sprites com cross-fade entre emoções + física por humor ── */
function SpriteStack({
  mascotId,
  size,
  emotion,
  physics,
  reduced,
  equippedItemId,
  growthScale,
}: {
  mascotId: MascotId;
  size: "sm" | "md" | "lg" | "xl";
  emotion: MascotEmotion;
  physics: { animate: TargetAndTransition; transition: Transition };
  reduced: boolean | null;
  equippedItemId?: string | null;
  growthScale?: number;
}) {
  return (
    <motion.div
      animate={reduced ? undefined : physics.animate}
      transition={physics.transition}
      className={cn("relative", sizeMap[size])}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={emotion}
          initial={{ opacity: 0, scale: 0.82, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.12, y: -10, filter: "blur(3px)" }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="absolute inset-0"
        >
          <Mascot
            id={mascotId}
            size={size}
            emotion={emotion}
            equippedItemId={equippedItemId}
            growthScale={growthScale}
            className="h-full w-full"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Partículas de transição emocional ── */
function TransitionParticles({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0, y: 10, scale: 0.4 }}
          animate={{ opacity: 1, y: -40, scale: 1.15, x: p.drift, rotate: p.drift }}
          exit={{ opacity: 0, y: -58, scale: 0.5 }}
          transition={{ duration: 1.25, ease: "easeOut" }}
          className="pointer-events-none absolute top-0 text-lg drop-shadow"
          style={{ left: `${p.x}%` } as CSSProperties}
          aria-hidden
        >
          {p.emoji}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}
