// StarRating — Animated star rating (1-3 stars) based on lesson accuracy
// 0-49%: 1 star, 50-89%: 2 stars, 90-100%: 3 stars
// Each star animates in with a staggered pop + glow effect
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Accuracy percentage 0-100 */
  accuracy: number;
  /** Total number of stars (default 3) */
  total?: number;
  /** Size of each star */
  size?: "sm" | "md" | "lg";
  /** Show the accuracy label */
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { star: "h-6 w-6", gap: "gap-1", text: "text-xs" },
  md: { star: "h-10 w-10", gap: "gap-2", text: "text-sm" },
  lg: { star: "h-14 w-14", gap: "gap-3", text: "text-base" },
};

export function StarRating({
  accuracy,
  total = 3,
  size = "md",
  showLabel = true,
  className,
}: StarRatingProps) {
  const earned = accuracy >= 90 ? 3 : accuracy >= 50 ? 2 : accuracy > 0 ? 1 : 0;
  const s = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("flex items-center", s.gap)}>
        {Array.from({ length: total }).map((_, i) => {
          const isFilled = i < earned;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{
                scale: isFilled ? [0, 1.3, 1] : 1,
                rotate: isFilled ? [-30, 10, 0] : 0,
              }}
              transition={{
                delay: 0.4 + i * 0.2,
                duration: 0.5,
                type: "spring",
                stiffness: 260,
                damping: 15,
              }}
              className="relative"
            >
              <Star
                className={cn(
                  s.star,
                  "transition-all duration-300",
                  isFilled
                    ? "fill-current text-xp drop-shadow-[0_0_8px_rgba(255,209,102,0.5)]"
                    : "text-muted-foreground/30",
                )}
              />
              {/* Glow ring for filled stars */}
              {isFilled && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ delay: 0.6 + i * 0.2, duration: 0.6 }}
                  className="absolute inset-0 rounded-full bg-xp/30"
                />
              )}
            </motion.div>
          );
        })}
      </div>
      {showLabel && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + total * 0.2 }}
          className={cn("mt-1 font-display font-semibold", s.text, earned === 3 ? "text-xp" : earned === 2 ? "text-primary" : "text-muted-foreground")}
        >
          {earned === 3 ? "Perfeito!" : earned === 2 ? "Muito Bem!" : earned === 1 ? "Continua!" : ""}
        </motion.p>
      )}
    </div>
  );
}
