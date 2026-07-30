// XPCounter — Animated counting number that rolls up from 0 to the target value
// Uses requestAnimationFrame for smooth 60fps counting animation
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPCounterProps {
  target: number;
  /** Duration of the counting animation in ms (default 1200) */
  durationMs?: number;
  /** Delay before starting the count (default 300) */
  delayMs?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show the + prefix */
  showPlus?: boolean;
  /** Color class override */
  colorClass?: string;
  className?: string;
}

const sizeStyles = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
};

export function XPCounter({
  target,
  durationMs = 1200,
  delayMs = 300,
  size = "md",
  showPlus = true,
  colorClass = "text-xp",
  className,
}: XPCounterProps) {
  const [displayed, setDisplayed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) {
      setDisplayed(0);
      return;
    }

    const delayTimer = setTimeout(() => {
      const start = performance.now();
      startTimeRef.current = start;

      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        // Ease-out cubic for satisfying deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        setDisplayed(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delayMs);

    return () => {
      clearTimeout(delayTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, delayMs]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delayMs / 1000, type: "spring", stiffness: 200, damping: 15 }}
      className={cn("flex items-center gap-2", className)}
    >
      <Zap className={cn("fill-current", size === "lg" ? "h-10 w-10" : size === "md" ? "h-7 w-7" : "h-5 w-5", colorClass)} />
      <span
        className={cn(
          "font-display font-bold tabular-nums",
          sizeStyles[size],
          colorClass,
        )}
      >
        {showPlus && "+"}{displayed}
      </span>
      <span className={cn("font-display text-sm font-semibold", size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-xs", "text-muted-foreground")}>
        XP
      </span>
    </motion.div>
  );
}

// ─── CoinCounter — same pattern but for coins ───
interface CoinCounterProps {
  target: number;
  durationMs?: number;
  delayMs?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CoinCounter({
  target,
  durationMs = 1000,
  delayMs = 600,
  size = "md",
  className,
}: CoinCounterProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) {
      setDisplayed(0);
      return;
    }

    const delayTimer = setTimeout(() => {
      const start = performance.now();

      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delayMs);

    return () => {
      clearTimeout(delayTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, delayMs]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delayMs / 1000, type: "spring", stiffness: 200, damping: 15 }}
      className={cn("flex items-center gap-2", className)}
    >
      <span className={size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base"}>🪙</span>
      <span className={cn("font-display font-bold tabular-nums", size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg", "text-coins")}>
        +{displayed}
      </span>
    </motion.div>
  );
}
