import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotExpression, type MascotMood } from "./MascotExpression";
import type { MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

/* ─── Dance Style Definitions ─── */

type DanceStyle = "wiggle" | "spin" | "bounce-dance" | "disco";

const DANCE_ANIMATIONS: Record<DanceStyle, motion.Variant> = {
  wiggle: {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
    y: [0, -8, 0, -6, 0, -4, 0],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
    },
  },
  spin: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
  "bounce-dance": {
    y: [0, -30, 0, -20, 0, -10, 0],
    scale: [1, 1.15, 0.95, 1.1, 0.98, 1.05, 1],
    transition: {
      duration: 1.6,
      ease: "easeInOut",
    },
  },
  disco: {
    rotate: [0, -20, 20, -20, 20, 0],
    x: [0, -12, 12, -12, 12, 0],
    y: [0, -20, 0, -20, 0, -15, 0],
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
};

const DANCE_DURATIONS: Record<DanceStyle, number> = {
  wiggle: 3,
  spin: 3.2,
  "bounce-dance": 4,
  disco: 5,
};

const DANCE_LABELS: Record<DanceStyle, string> = {
  wiggle: "Vai e volta! 🔄",
  spin: "A rodar! 🌀",
  "bounce-dance": "A saltar! 🤸",
  disco: "Disco time! 💃",
};

const DANCE_MOODS: Record<DanceStyle, MascotMood> = {
  wiggle: "happy",
  spin: "celebrate",
  "bounce-dance": "happy",
  disco: "celebrate",
};

/* ─── Confetti Particles ─── */

const CONFETTI_COLORS = ["#ff8c42", "#6c5ce7", "#00cec9", "#fdcb6e", "#e17055", "#81ecec"];
const CONFETTI_EMOJIS = ["✨", "⭐", "💫", "🎵", "🎶", "🎉"];

function DanceParticles({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const dist = 100 + (i % 3) * 50;
            const delay = (i % 4) * 0.15;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0.8],
                }}
                transition={{
                  duration: 1.8,
                  delay,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="absolute text-xl select-none"
                style={{ left: "50%", top: "50%" }}
                aria-hidden="true"
              >
                {CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length]}
              </motion.span>
            );
          })}
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── MascotDance Component ─── */

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  equippedItemId?: string | null;
  className?: string;
  /** Trigger a dance — changes value to start a new dance */
  trigger?: number;
  /** Override dance style; if omitted, random selection */
  style?: DanceStyle;
  /** Callback when dance finishes */
  onDanceEnd?: () => void;
  growthScale?: number;
}

export function MascotDance({
  mascotId,
  size = "lg",
  equippedItemId,
  className,
  trigger = 0,
  style,
  onDanceEnd,
  growthScale = 1,
}: Props) {
  const [dancing, setDancing] = useState(false);
  const [danceStyle, setDanceStyle] = useState<DanceStyle>("wiggle");
  const [danceMood, setDanceMood] = useState<MascotMood>("neutral");
  const [danceLabel, setDanceLabel] = useState<string | null>(null);

  const pickRandomStyle = useCallback((): DanceStyle => {
    const styles: DanceStyle[] = ["wiggle", "spin", "bounce-dance", "disco"];
    return styles[Math.floor(Math.random() * styles.length)];
  }, []);

  useEffect(() => {
    if (trigger === 0) return;

    const chosenStyle = style ?? pickRandomStyle();
    setDanceStyle(chosenStyle);
    setDanceMood(DANCE_MOODS[chosenStyle]);
    setDanceLabel(DANCE_LABELS[chosenStyle]);
    setDancing(true);

    const durationMs = DANCE_DURATIONS[chosenStyle] * 1000;
    const timer = setTimeout(() => {
      setDancing(false);
      setDanceMood("neutral");
      setDanceLabel(null);
      onDanceEnd?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [trigger, style, pickRandomStyle, onDanceEnd]);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {/* Particles behind the mascot */}
      <DanceParticles active={dancing} />

      {/* Dancing mascot */}
      <motion.div
        animate={dancing ? DANCE_ANIMATIONS[danceStyle] : { rotate: 0, y: 0, x: 0, scale: growthScale }}
        transition={
          dancing
            ? DANCE_ANIMATIONS[danceStyle].transition
            : { type: "spring", stiffness: 260, damping: 18 }
        }
      >
        <MascotExpression
          mascotId={mascotId}
          size={size}
          mood={danceMood}
          equippedItemId={equippedItemId}
          growthScale={growthScale}
          bubble={dancing ? danceLabel : null}
        />
      </motion.div>

      {/* Dance progress indicator */}
      <AnimatePresence>
        {dancing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 flex items-center gap-1"
          >
            <span className="text-xs font-display text-primary" aria-hidden="true">
              🎶 Dançando...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Convenience: useDanceTrigger hook ─── */

import { useRef } from "react";

/**
 * Hook to trigger mascot dances on demand. Call `startDance()` to kick off a
 * random dance, optionally specifying a style. The hook returns a `trigger`
 * counter that changes each time you call `startDance()`.
 */
export function useDanceTrigger() {
  const counter = useRef(0);
  const [trigger, setTrigger] = useState(0);
  const [activeStyle, setActiveStyle] = useState<DanceStyle | undefined>(undefined);

  const startDance = useCallback((style?: DanceStyle) => {
    counter.current += 1;
    setTrigger(counter.current);
    setActiveStyle(style);
  }, []);

  const stopDance = useCallback(() => {
    setTrigger(0);
    setActiveStyle(undefined);
  }, []);

  return { trigger, style: activeStyle, startDance, stopDance };
}
