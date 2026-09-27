// MascotLive — mascote VIVA estilo "My Talking Tom": sentimentos, gestos e
// comportamentos quasi-humanos (respirar, olhar em volta, saltar, dançar,
// bocejar e adormecer à noite, reagir a toques com balão de fala).
// Visual a cargo do MascotActor (sprites 3D + física + tilt + partículas);
// este componente é o "cérebro" comportamental.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MascotActor, type ActorMood } from "@/components/MascotActor";
import { getMascot, type MascotId } from "@/lib/mascots";
import { haptic } from "@/lib/haptics";
import { playCorrect, playNote } from "@/lib/audio";
import { cn } from "@/lib/utils";

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  /** Humor base controlado externamente (opcional). */
  mood?: ActorMood;
  /** Noite → boceja e adormece (acorda com toque). */
  isNight?: boolean;
  /** Frases aleatórias ao toque. */
  phrases?: string[];
  className?: string;
  /** Chamado a cada reação visível. */
  onTap?: () => void;
}

/** Frases de saudação conforme a hora — comportamento humano diurno. */
function timeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia! ☀️";
  if (h >= 12 && h < 18) return "Boa tarde! 😊";
  if (h >= 18 && h < 21) return "Boa noite! 🌆";
  return "Ainda acordado? 🌙";
}

/** Comportamentos idle quasi-humanos: humor temporário + duração. */
const IDLE_BEHAVIORS: { mood: ActorMood; dur: number; weight: number }[] = [
  { mood: "excited", dur: 800, weight: 0.16 }, // micro-salto curioso
  { mood: "listening", dur: 1100, weight: 0.14 }, // "acena" (balanço lateral)
  { mood: "thinking", dur: 2200, weight: 0.16 }, // pensa profundamente
  { mood: "celebrate", dur: 2600, weight: 0.1 }, // dança espontânea!
  { mood: "happy", dur: 1400, weight: 0.14 }, // sorriso com saltinho
  { mood: "worried", dur: 1200, weight: 0.08 }, // espanta uma mosca
  { mood: "excited", dur: 900, weight: 0.1 }, // alongamento
  { mood: "happy", dur: 1000, weight: 0.12 }, // cantarola
];

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
  const [behaviorMood, setBehaviorMood] = useState<ActorMood>("neutral");
  const [bubble, setBubble] = useState<string | null>(null);
  const tapCount = useRef(0);
  const behaviorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleeping = useRef(false);

  // Humor efetivo: controlo externo > comportamento > neutro
  const effectiveMood: ActorMood = isNight && sleeping.current ? "tired" : (mood ?? behaviorMood);

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

  const say = (msg: string) => {
    setBubble(null);
    requestAnimationFrame(() => setBubble(msg));
  };

  // ── Loop de comportamentos idle (aleatório 3.5–8 s) ──
  useEffect(() => {
    if (isNight) return; // à noite o motor de behavior não corre (dorme)
    let alive = true;
    const schedule = (ms: number) => {
      behaviorTimer.current = setTimeout(() => {
        if (!alive) return;
        const roll = Math.random();
        let acc = 0;
        const pick = IDLE_BEHAVIORS.find((b) => (acc += b.weight) >= roll) ?? IDLE_BEHAVIORS[0];
        setBehaviorMood(pick.mood);
        if (pick.mood === "happy" && Math.random() > 0.5) {
          // cantarola uma nota
          playNote(520 + Math.random() * 300, 0.28, 0.1);
        }
        setTimeout(() => alive && setBehaviorMood("neutral"), pick.dur);
        schedule(3500 + Math.random() * 4500);
      }, ms);
    };
    schedule(2800 + Math.random() * 3000);
    return () => {
      alive = false;
      if (behaviorTimer.current) clearTimeout(behaviorTimer.current);
    };
  }, [isNight]);

  // ── Noite → boceja (1.2 s) e adormece (2.5 s) ──
  useEffect(() => {
    sleeping.current = false;
    if (!isNight) return;
    const t1 = setTimeout(() => setBehaviorMood("tired"), 1200);
    const t2 = setTimeout(() => {
      sleeping.current = true;
      setBehaviorMood("tired");
    }, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isNight]);

  // Limpa balão
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 2600);
    return () => clearTimeout(t);
  }, [bubble]);

  const onTapMascot = () => {
    haptic("tap");
    onTap?.();
    tapCount.current += 1;
    if (sleeping.current) {
      // acordar surpreendido!
      sleeping.current = false;
      haptic("success");
      setBehaviorMood("happy");
      say("Ahhh… já estou acordado! 🥱");
      setTimeout(() => setBehaviorMood("neutral"), 1500);
      return;
    }
    const cycle = tapCount.current % 6;
    const phrase = () => pickPhrases[Math.floor(Math.random() * pickPhrases.length)];
    const target: ActorMood[] = [
      "happy",
      "excited",
      "listening",
      "celebrate",
      "celebrate",
      "happy",
    ];
    const next = target[cycle];
    setBehaviorMood(next);
    if (cycle === 0) say(phrase());
    if (cycle === 2) say(phrase());
    if (cycle === 3) playCorrect();
    if (cycle === 4) say("La la la! 🎵");
    if (cycle === 5) say("Tu és o melhor! 💖");
    setTimeout(() => setBehaviorMood((cur) => (cur === next ? "neutral" : cur)), 1800);
  };

  return (
    <div className={cn("relative inline-flex select-none flex-col items-center", className)}>
      <MascotActor
        mascotId={mascotId}
        size={size}
        mood={effectiveMood}
        onTap={onTapMascot}
        ariaLabel={`${m.name} (toca para brincar)`}
      />

      {/* Balão de fala */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="glass-morphism pointer-events-none absolute -top-11 z-10 whitespace-nowrap rounded-2xl border border-white/50 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg"
          >
            {bubble}
            <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/50 bg-white/85" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
