// ComboTracker — Live combo counter during lessons
// Shows a glowing badge when combo >= 2, with shake/glow on streak increase
// Includes a "COMBO x5!" style animation for big combos
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboTrackerProps {
  /** Current combo count (0 = hidden, 1 = no combo, 2+ = combo active) */
  combo: number;
  /** Max combo for scaling reference (default 10) */
  maxCombo?: number;
  /** Position variant */
  variant?: "badge" | "floating" | "inline";
  className?: string;
}

export function ComboTracker({
  combo,
  maxCombo = 10,
  variant = "badge",
  className,
}: ComboTrackerProps) {
  if (combo < 2) return null;

  const intensity = Math.min(combo / maxCombo, 1);
  const isMegaCombo = combo >= 5;
  const isUltraCombo = combo >= 8;

  const glowColor = isUltraCombo
    ? "shadow-[0_0_20px_4px_rgba(255,69,0,0.5)]"
    : isMegaCombo
      ? "shadow-[0_0_16px_3px_rgba(255,140,66,0.4)]"
      : "shadow-[0_0_8px_2px_rgba(255,209,102,0.3)]";

  if (variant === "floating") {
    return (
      <AnimatePresence>
        <motion.div
          key={combo}
          initial={{ scale: 0.5, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn(
            "fixed right-4 top-20 z-50 flex items-center gap-1.5 rounded-2xl border-2 px-3 py-1.5 font-display font-bold",
            "border-streak bg-streak/15 text-streak",
            glowColor,
            className,
          )}
        >
          <Zap className="h-5 w-5 fill-current" />
          <span className="text-lg">x{combo}</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "inline") {
    return (
      <motion.div
        key={combo}
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.15, 1] }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 12 }}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-xs font-bold",
          "bg-streak/15 text-streak",
          glowColor,
          className,
        )}
      >
        <Zap className="h-3.5 w-3.5 fill-current" />
        Combo x{combo}
      </motion.div>
    );
  }

  // Badge variant (default)
  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{
          scale: [0.6, 1.2, 1],
          rotate: [-10, 5, 0],
        }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-sm font-bold",
          isUltraCombo
            ? "border-2 border-destructive bg-destructive/15 text-destructive"
            : isMegaCombo
              ? "border-2 border-streak bg-streak/15 text-streak"
              : "bg-xp/15 text-xp",
          glowColor,
          className,
        )}
      >
        <Zap className={cn("fill-current", isMegaCombo ? "h-5 w-5" : "h-4 w-4")} />
        <span>{isUltraCombo ? "ULTRA!" : isMegaCombo ? "MEGA!" : "Combo"}</span>
        <span className="tabular-nums">x{combo}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── ComboPopup — one-shot popup that appears when combo increases ───
interface ComboPopupProps {
  combo: number;
  show: boolean;
  onDone?: () => void;
}

export function ComboPopup({ combo, show, onDone }: ComboPopupProps) {
  if (!show || combo < 3) return null;

  const label = combo >= 8 ? "INCREDIBLE!" : combo >= 5 ? "AMAZING!" : combo >= 3 ? "COMBO!" : "";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 20 }}
          animate={{ opacity: 1, scale: [0.3, 1.3, 1], y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          onAnimationComplete={() => {
            setTimeout(() => onDone?.(), 800);
          }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: [0, -5, 5, -3, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-6xl"
            >
              ⚡
            </motion.div>
            <p className="mt-2 font-display text-3xl font-bold text-gradient-streak">
              {label}
            </p>
            <p className="font-display text-xl font-bold text-streak">x{combo}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
