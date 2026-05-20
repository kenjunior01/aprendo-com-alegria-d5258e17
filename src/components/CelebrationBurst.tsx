// Reusable burst overlay: particles + spring scale + optional sound.
// Use anywhere a child completes a milestone (lesson, infinite challenge, league).
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { playLevelUp } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

interface Props {
  show: boolean;
  emoji?: string;
  title?: string;
  subtitle?: string;
  onDone?: () => void;
  durationMs?: number;
}

const PARTICLES = ["🎉", "⭐", "✨", "🌈", "💫", "🎈", "🏆"];

export function CelebrationBurst({
  show,
  emoji = "🌟",
  title = "Boa!",
  subtitle,
  onDone,
  durationMs = 1800,
}: Props) {
  useEffect(() => {
    if (!show) return;
    haptic("celebrate");
    playLevelUp();
    const t = setTimeout(() => onDone?.(), durationMs);
    return () => clearTimeout(t);
  }, [show, onDone, durationMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center"
          aria-live="polite"
        >
          {/* radial flash */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute h-40 w-40 rounded-full bg-gradient-to-br from-primary/60 via-accent/60 to-secondary/60 blur-2xl"
          />

          {/* particles */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const dist = 220 + (i % 4) * 40;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.6, rotate: 0 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1.2, 1],
                  rotate: 360,
                }}
                transition={{ duration: 1.4 + (i % 3) * 0.2, ease: "easeOut" }}
                className="absolute text-3xl"
              >
                {PARTICLES[i % PARTICLES.length]}
              </motion.span>
            );
          })}

          {/* center card */}
          <motion.div
            initial={{ scale: 0.4, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="card-chunky relative rounded-3xl border-4 border-primary bg-card px-8 py-6 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8 }}
              className="text-6xl"
            >
              {emoji}
            </motion.div>
            <p className="mt-2 font-display text-2xl text-primary">{title}</p>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
