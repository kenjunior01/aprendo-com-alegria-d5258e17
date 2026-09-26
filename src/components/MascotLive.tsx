// MascotLive — mascote VIVA estilo "My Talking Tom": gestos, sentimentos e
// comportamentos quasi-humanos (piscar, olhar em volta, respirar, acenar,
// bocejar e adormecer à noite, reagir a toques com balão de fala).
// 100% DOM/CSS + framer-motion (só transform/opacity — performance APK).
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { FaceOverlay, type MascotMood } from "@/components/MascotExpression";
import { getMascot, type MascotId } from "@/lib/mascots";
import { haptic } from "@/lib/haptics";
import { playCorrect, playNote } from "@/lib/audio";
import { cn } from "@/lib/utils";

export type MascotGesture =
  | "idle"
  | "wave"
  | "jump"
  | "nod"
  | "shake"
  | "cheer"
  | "giggle"
  | "sleep"
  | "think"
  | "dance"
  | "love"
  | "surprise"
  | "yawn";

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  /** Humor base (afeta olhos/boca). Se não for passado, deriva dos gestos/idle. */
  mood?: MascotMood;
  /** Noite → boceja e adormece (acorda com toque). */
  isNight?: boolean;
  /** Frases aleatórias ao toque. */
  phrases?: string[];
  className?: string;
  /** Chamado a cada reação visível (ex: haptics já são internos). */
  onTap?: () => void;
}

const GESTURE_VARIANTS: Record<
  Exclude<MascotGesture, "idle">,
  {
    animate: TargetAndTransition;
    transition?: Transition;
  }
> = {
  wave: {
    animate: { rotate: [0, -8, 8, -8, 0], y: [0, -4, 0] },
    transition: { duration: 0.9 },
  },
  jump: {
    animate: { y: [0, -26, 0, -14, 0], scaleY: [1, 1.08, 0.94, 1.04, 1] },
    transition: { duration: 0.7, type: "spring" as const, bounce: 0.45 },
  },
  nod: {
    animate: { y: [0, 7, 0, 7, 0] },
    transition: { duration: 0.8 },
  },
  shake: {
    animate: { x: [0, -9, 9, -7, 7, 0], rotate: [0, -3, 3, -2, 2, 0] },
    transition: { duration: 0.8 },
  },
  cheer: {
    animate: {
      y: [0, -20, 0, -22, 0],
      rotate: [0, -12, 12, -8, 0],
      scale: [1, 1.12, 1, 1.14, 1],
    },
    transition: { duration: 1.1, repeat: 1 },
  },
  giggle: {
    animate: { scale: [1, 1.08, 0.98, 1.05, 1], x: [0, 3, -3, 2, 0] },
    transition: { duration: 0.6, repeat: 2 },
  },
  sleep: {
    animate: { scale: [1, 1.035, 1, 1.02, 1], y: [0, 2, 0] },
    transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" as const },
  },
  think: {
    animate: { rotate: [0, -4, 0], x: [0, -3, 0] },
    transition: { duration: 1.6, repeat: Infinity },
  },
  dance: {
    animate: {
      rotate: [0, -10, 10, -10, 10, 0],
      y: [0, -6, -2, -6, -2, 0],
      scaleX: [1, 1.05, 0.97, 1.05, 0.97, 1],
    },
    transition: { duration: 1.5, repeat: 1 },
  },
  love: {
    animate: { scale: [1, 1.12, 1.06, 1.1, 1], rotate: [0, 4, -4, 3, 0] },
    transition: { duration: 1.2 },
  },
  surprise: {
    animate: { scaleY: [1, 1.16, 0.96, 1.04, 1], y: [0, -8, 0, -3, 0] },
    transition: { duration: 0.8 },
  },
  yawn: {
    animate: { scaleY: [1, 1.14, 1.1, 1], scaleX: [1, 0.94, 0.96, 1], rotate: [0, -3, 0] },
    transition: { duration: 1.8 },
  },
};

const GESTURE_EMOJI: Partial<Record<MascotGesture, string[]>> = {
  wave: ["👋", "👋"],
  jump: ["⭐"],
  cheer: ["🎉", "✨", "🎊"],
  giggle: ["😆", "💛"],
  sleep: ["💤", "💤", "💤"],
  think: ["💭"],
  shake: ["❓"],
  nod: ["👍"],
  dance: ["🎶", "💫", "🎵"],
  love: ["💛", "💖", "💕"],
  surprise: ["❗", "😮"],
  yawn: ["🥱"],
};

/** Frases de saudação conforme a hora — comportamento humano diurno. */
function timeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia! ☀️";
  if (h >= 12 && h < 18) return "Boa tarde! 😊";
  if (h >= 18 && h < 21) return "Boa noite! 🌆";
  return "Ainda acordado? 🌙";
}

export function MascotLive({
  mascotId,
  size = "md",
  mood,
  isNight = false,
  phrases,
  className,
  onTap,
}: Props) {
  const m = getMascot(mascotId);
  const [gesture, setGesture] = useState<MascotGesture>("idle");
  const [lookDir, setLookDir] = useState<0 | -1 | 1>(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [sparks, setSparks] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const tapCount = useRef(0);
  const behaviorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Humor derivado: gestos fortes definem humor; senão o passado; senão neutro
  const derivedMood: MascotMood = useMemo(() => {
    if (mood) return mood;
    switch (gesture) {
      case "cheer":
      case "dance":
        return "celebrate";
      case "giggle":
      case "love":
        return "happy";
      case "sleep":
      case "yawn":
        return "tired";
      case "think":
        return "thinking";
      case "shake":
        return "sad";
      case "surprise":
        return "excited";
      default:
        return "neutral";
    }
  }, [gesture, mood]);

  const pickPhrases = useMemo(
    () =>
      phrases?.length
        ? phrases
        : [
            timeGreeting(),
            m.greeting,
            m.encourage,
            "Gostas da sala? 😊",
            "Vamos aprender juntos!",
            "Toca no quadro! ✏️",
            "Sabias? O globo conta factos! 🌍",
          ],
    [phrases, m],
  );

  const isSleeping = gesture === "sleep";

  // ── Comportamentos idle quasi-humanos (loop aleatório 3.5–8 s) ──
  useEffect(() => {
    if (isSleeping) return;
    let alive = true;
    const schedule = (ms: number) => {
      behaviorTimer.current = setTimeout(() => {
        if (!alive) return;
        const roll = Math.random();
        if (roll < 0.22) {
          // olhar para os lados (humano curioso)
          const dir = (Math.random() > 0.5 ? 1 : -1) as 1 | -1;
          setLookDir(dir);
          setTimeout(() => alive && setLookDir(0), 900);
        } else if (roll < 0.42) {
          setGesture("idle");
          // micro-hop
          setGesture("jump");
          setTimeout(() => alive && setGesture("idle"), 800);
        } else if (roll < 0.58) {
          // nota musical flutuante (hum)
          setSparks((s) => [
            ...s.slice(-3),
            { id: Date.now(), emoji: "♪", x: Math.round(20 + Math.random() * 60) },
          ]);
          playNote(520 + Math.random() * 300, 0.28, 0.1);
          setTimeout(() => alive && setGesture("idle"), 300);
        } else if (roll < 0.72) {
          // acena de vez em quando
          setGesture("wave");
          setTimeout(() => alive && setGesture("idle"), 1100);
        } else if (roll < 0.82) {
          // alongamento de manhã (humano preguiçoso)
          setGesture("surprise");
          setTimeout(() => alive && setGesture("idle"), 900);
        } else if (roll < 0.92) {
          // pensa profundamente (comportamento estudioso)
          setGesture("think");
          setTimeout(() => alive && setGesture("idle"), 2200);
        } else {
          // dança espontânea — é a alegria de aprender!
          setGesture("dance");
          setTimeout(() => alive && setGesture("idle"), 2600);
        }
        schedule(3500 + Math.random() * 4500);
      }, ms);
    };
    schedule(2800 + Math.random() * 3000);
    return () => {
      alive = false;
      if (behaviorTimer.current) clearTimeout(behaviorTimer.current);
    };
  }, [isSleeping]); // reinicia quando adormece/acorda

  // ── Noite → boceja (1.2 s) e adormece (2.5 s depois de entrar) ──
  useEffect(() => {
    if (!isNight) return;
    const t1 = setTimeout(() => {
      setGesture((g) => (g === "idle" ? "yawn" : g));
    }, 1200);
    const t2 = setTimeout(() => {
      setGesture((g) => (g === "idle" || g === "yawn" ? "sleep" : g));
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isNight]);

  // Limpa sparks
  useEffect(() => {
    if (!sparks.length) return;
    const t = setTimeout(() => setSparks((s) => s.slice(1)), 1400);
    return () => clearTimeout(t);
  }, [sparks]);

  const react = (g: MascotGesture, message?: string) => {
    setGesture(g);
    setSparks((s) => [
      ...s.slice(-3),
      ...(GESTURE_EMOJI[g] ?? []).map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        x: 10 + i * 30 + Math.round(Math.random() * 20),
      })),
    ]);
    if (message) setBubble(message);
    const dur =
      g === "sleep" ? 800 : g === "cheer" || g === "dance" ? 2600 : g === "think" ? 2400 : 1500;
    setTimeout(() => {
      setGesture((cur) => (cur === g ? "idle" : cur));
    }, dur);
  };

  const onTapMascot = () => {
    haptic("tap");
    onTap?.();
    tapCount.current += 1;
    if (gesture === "sleep") {
      // acordar surpreendido!
      setGesture("idle");
      haptic("success");
      react("giggle", "Ahhh… já estou acordado! 🥱");
      return;
    }
    const cycle = tapCount.current % 6;
    if (cycle === 0) react("giggle", pickPhrases[Math.floor(Math.random() * pickPhrases.length)]);
    else if (cycle === 1) react("jump");
    else if (cycle === 2)
      react("wave", pickPhrases[Math.floor(Math.random() * pickPhrases.length)]);
    else if (cycle === 3) {
      react("cheer");
      playCorrect();
    } else if (cycle === 4) react("dance", "La la la! 🎵");
    else react("love", "Tu és o melhor! 💖");
  };

  const variant = gesture !== "idle" ? GESTURE_VARIANTS[gesture] : null;

  return (
    <div className={cn("relative inline-flex select-none flex-col items-center", className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={onTapMascot}
        animate={variant?.animate ?? (lookDir ? { x: [0, lookDir * 5, 0] } : { y: [0, -3, 0] })}
        transition={
          variant?.transition ??
          (lookDir ? { duration: 0.9 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }) // respiração
        }
        className="relative cursor-pointer"
        aria-label={`${m.name} (toca para brincar)`}
      >
        <Mascot id={mascotId} size={size} />
        {/* Olhos/boca vivos + piscar herdado do FaceOverlay */}
        <AnimatePresence mode="wait">
          {(derivedMood !== "neutral" || gesture === "sleep") && (
            <FaceOverlay
              key={`${derivedMood}-${gesture}`}
              mood={gesture === "sleep" ? "tired" : derivedMood}
              blink={gesture !== "sleep"}
            />
          )}
        </AnimatePresence>
        {/* Zzz quando dorme */}
        {gesture === "sleep" && (
          <span
            className="scene-zzz pointer-events-none absolute -right-1 top-0 text-xl"
            aria-hidden
          >
            💤
          </span>
        )}
        {/* Partículas de reação */}
        <AnimatePresence>
          {sparks.map((s) => (
            <motion.span
              key={s.id}
              initial={{ opacity: 0, y: 6, scale: 0.5 }}
              animate={{ opacity: 1, y: -34, scale: 1.1, rotate: s.id % 2 ? 8 : -8 }}
              exit={{ opacity: 0, y: -48, scale: 0.6 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="pointer-events-none absolute top-0 text-lg"
              style={{ left: `${s.x}%` } as CSSProperties}
              aria-hidden
            >
              {s.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Balão de fala */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            onAnimationComplete={() => {
              setTimeout(() => setBubble(null), 2400);
            }}
            className="glass-morphism pointer-events-none absolute -top-11 whitespace-nowrap rounded-2xl border border-white/50 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg"
          >
            {bubble}
            <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/50 bg-white/85" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
