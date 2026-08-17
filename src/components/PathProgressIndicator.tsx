// PathProgressIndicator — Floating progress indicator for the learning path
// Shows overall progress with animated mascot, XP bar, and next-up preview
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Star, ChevronRight, Trophy, Flame } from "lucide-react";
import { MascotIcon } from "@/components/MascotIcon";
import { cn } from "@/lib/utils";
import type { MascotId } from "@/lib/mascots";

interface PathProgressIndicatorProps {
  mascotId: MascotId;
  completedCount: number;
  totalCount: number;
  xp: number;
  streak: number;
  level: number;
  nextUp?: string;
  className?: string;
}

export function PathProgressIndicator({
  mascotId,
  completedCount,
  totalCount,
  xp,
  streak,
  level,
  nextUp,
  className,
}: PathProgressIndicatorProps) {
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Level colors based on progress
  const levelColor = useMemo(() => {
    if (pct >= 80) return "text-success";
    if (pct >= 50) return "text-xp";
    if (pct >= 25) return "text-primary";
    return "text-muted-foreground";
  }, [pct]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className={cn(
        "card-premium relative overflow-hidden rounded-3xl bg-card p-4",
        className,
      )}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative flex items-center gap-3">
        {/* Mascot avatar */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative shrink-0"
        >
          <MascotIcon id={mascotId} size={48} />
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
            {level}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-bold">O Meu Progresso</h3>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-streak/10 px-1.5 py-0.5 text-[10px] font-bold text-streak">
                <Flame className="h-3 w-3" /> {streak}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className={cn(
                  "h-full rounded-full progress-glow",
                  pct >= 80 ? "bg-success" : "bg-primary",
                )}
              />
            </div>
            <span className={cn("font-display text-xs font-bold tabular-nums", levelColor)}>
              {completedCount}/{totalCount}
            </span>
          </div>

          {/* Next up */}
          {nextUp && (
            <div className="mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3 text-xp" />
              <span className="truncate text-[11px] text-muted-foreground">
                Próximo: <span className="font-bold text-foreground">{nextUp}</span>
              </span>
            </div>
          )}
        </div>

        {/* XP counter */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-0.5 rounded-full bg-xp/10 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-current text-xp" />
            <span className="font-display text-xs font-bold text-xp">{xp}</span>
          </div>
          <span className="text-[9px] text-muted-foreground">XP</span>
        </div>
      </div>
    </motion.div>
  );
}
