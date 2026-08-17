// ConfettiCelebration — Full-screen confetti celebration system
// Multiple patterns: lesson-complete, chapter-complete, streak-milestone, achievement-unlock
// Uses canvas-confetti for performant particle effects + Framer Motion for UI overlay
import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ─── Confetti Color Palettes ───
const PALETTES = {
  alegria: ["#ff8c42", "#5db1ff", "#7cd16e", "#ffd166", "#ff6b9d", "#a78bfa"],
  gold: ["#ffd166", "#ffb347", "#ff8c42", "#ffe066", "#fff3b0"],
  streak: ["#ff8c42", "#ff6b3d", "#ffd166", "#ff4500", "#ffaa00"],
  achievement: ["#a78bfa", "#8b5cf6", "#c4b5fd", "#ffd166", "#5db1ff"],
  chapter: ["#7cd16e", "#34d399", "#6ee7b7", "#ffd166", "#5db1ff"],
  perfect: ["#ffd166", "#ff6b9d", "#a78bfa", "#5db1ff", "#7cd16e", "#ff8c42"],
};

export type CelebrationType = "lesson-complete" | "chapter-complete" | "streak-milestone" | "achievement-unlock" | "perfect-lesson";

interface ConfettiCelebrationProps {
  show: boolean;
  type?: CelebrationType;
  /** Duration in ms before auto-cleanup (default 3000) */
  durationMs?: number;
  /** Called when the celebration is done */
  onDone?: () => void;
}

// ─── Confetti Pattern Functions ───

function fireLessonComplete() {
  const colors = PALETTES.alegria;
  // Center burst
  confetti({
    particleCount: 80,
    spread: 80,
    origin: { y: 0.65 },
    colors,
    ticks: 120,
    gravity: 0.8,
    scalar: 1.1,
  });
  // Delayed left/right side bursts
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
      ticks: 100,
    });
  }, 200);
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
      ticks: 100,
    });
  }, 350);
}

function fireChapterComplete() {
  const colors = PALETTES.chapter;
  // Grand cascade from top
  confetti({
    particleCount: 150,
    spread: 120,
    origin: { y: 0.1 },
    colors,
    startVelocity: 35,
    ticks: 150,
    gravity: 0.6,
    scalar: 1.2,
  });
  // Side canons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 45,
      spread: 50,
      origin: { x: 0, y: 0.5 },
      colors: PALETTES.gold,
      startVelocity: 45,
    });
  }, 300);
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 135,
      spread: 50,
      origin: { x: 1, y: 0.5 },
      colors: PALETTES.gold,
      startVelocity: 45,
    });
  }, 500);
  // Final burst
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: PALETTES.alegria,
      startVelocity: 30,
    });
  }, 800);
}

function fireStreakMilestone() {
  const colors = PALETTES.streak;
  // Fire-like upward burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.8 },
    colors,
    startVelocity: 45,
    gravity: 0.9,
    ticks: 130,
    scalar: 1.3,
    shapes: ["circle"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: PALETTES.gold,
      startVelocity: 35,
      shapes: ["circle"],
    });
  }, 400);
}

function fireAchievementUnlock() {
  const colors = PALETTES.achievement;
  // Star burst from center
  confetti({
    particleCount: 60,
    spread: 360,
    origin: { x: 0.5, y: 0.5 },
    colors,
    startVelocity: 25,
    ticks: 100,
    shapes: ["star"],
    scalar: 1.4,
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      colors: PALETTES.gold,
      startVelocity: 20,
      ticks: 80,
      shapes: ["star"],
      scalar: 1.2,
    });
  }, 300);
}

function firePerfectLesson() {
  const colors = PALETTES.perfect;
  // Epic multi-stage celebration
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.5 },
    colors,
    startVelocity: 40,
    ticks: 150,
    scalar: 1.2,
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      startVelocity: 50,
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      startVelocity: 50,
    });
  }, 300);
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.2 },
      colors: PALETTES.gold,
      startVelocity: 30,
      shapes: ["star"],
      scalar: 1.5,
    });
  }, 700);
}

// ─── Pattern dispatcher ───
const PATTERN_MAP: Record<CelebrationType, () => void> = {
  "lesson-complete": fireLessonComplete,
  "chapter-complete": fireChapterComplete,
  "streak-milestone": fireStreakMilestone,
  "achievement-unlock": fireAchievementUnlock,
  "perfect-lesson": firePerfectLesson,
};

// ─── Quick fire helper for imperative use ───
export function fireConfetti(type: CelebrationType = "lesson-complete") {
  PATTERN_MAP[type]();
}

// ─── Component ───
export function ConfettiCelebration({
  show,
  type = "lesson-complete",
  durationMs = 3000,
  onDone,
}: ConfettiCelebrationProps) {
  const firedRef = useRef(false);

  const fire = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    PATTERN_MAP[type]();
  }, [type]);

  useEffect(() => {
    if (!show) {
      firedRef.current = false;
      return;
    }
    fire();
    const timer = setTimeout(() => onDone?.(), durationMs);
    return () => clearTimeout(timer);
  }, [show, fire, durationMs, onDone]);

  return null; // canvas-confetti renders to its own canvas, no DOM needed
}

// ─── Floating XP/Coins particles overlay ───
interface FloatingRewardProps {
  show: boolean;
  xp?: number;
  coins?: number;
  onDone?: () => void;
}

export function FloatingReward({ show, xp = 0, coins = 0, onDone }: FloatingRewardProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDone?.(), 2500);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[75] flex items-center justify-center">
          {/* XP floating up */}
          {xp > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -60, scale: 1.2 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 font-display text-4xl font-bold text-xp drop-shadow-lg"
            >
              +{xp} XP ✨
            </motion.div>
          )}

          {/* Coins floating up (delayed) */}
          {coins > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1.1 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
              className="absolute left-1/2 top-[58%] -translate-x-1/2 font-display text-2xl font-bold text-coins drop-shadow-lg"
            >
              +{coins} 🪙
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
