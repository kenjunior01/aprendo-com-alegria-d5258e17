// MascotBubble — Animated mascot with speech bubble
// Used in lessons, onboarding, and the learning path for encouragement
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotIcon } from "@/components/MascotIcon";
import { getMascot, type MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

interface MascotBubbleProps {
  id: MascotId;
  message: string;
  position?: "left" | "right" | "center";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  onDismiss?: () => void;
  autoHideMs?: number;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 40, bubble: "text-xs max-w-[160px]", padding: "p-2 px-3" },
  md: { icon: 56, bubble: "text-sm max-w-[220px]", padding: "p-3 px-4" },
  lg: { icon: 72, bubble: "text-base max-w-[280px]", padding: "p-4 px-5" },
};

export function MascotBubble({
  id,
  message,
  position = "left",
  size = "md",
  animated = true,
  onDismiss,
  autoHideMs,
  className,
}: MascotBubbleProps) {
  const [visible, setVisible] = useState(true);
  const mascot = getMascot(id);
  const config = sizeConfig[size];

  useEffect(() => {
    if (autoHideMs) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [autoHideMs, onDismiss]);

  const isLeft = position === "left";
  const isCenter = position === "center";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={cn(
            "flex items-end gap-2",
            isLeft && "flex-row",
            !isLeft && !isCenter && "flex-row-reverse",
            isCenter && "flex-col items-center",
            className,
          )}
        >
          {/* Mascot */}
          <motion.div
            animate={animated ? { y: [0, -4, 0] } : undefined}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0"
          >
            <MascotIcon id={id} size={config.icon} animated={false} />
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "relative rounded-2xl border border-border bg-card shadow-soft",
              config.padding,
              config.bubble,
              "font-display leading-snug",
            )}
            onClick={() => { setVisible(false); onDismiss?.(); }}
            role="alert"
          >
            {/* Bubble tail */}
            <div
              className={cn(
                "absolute bottom-3 h-3 w-3 rotate-45 border-b border-r border-border bg-card",
                isLeft && "-left-1.5",
                !isLeft && !isCenter && "-right-1.5",
                isCenter && "-bottom-1.5 left-1/2 -translate-x-1/2 rotate-[135deg]",
              )}
            />

            <p className="relative text-foreground/90">{message}</p>

            {/* Mascot name tag */}
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {mascot.name}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Predefined encouragement messages per mascot ───
const ENCOURAGEMENT_MESSAGES = {
  fox: [
    "À velocidade da luz! Continua assim!",
    "Fizeste isto num piscar de olhos!",
    "Estás a ser mais rápido que eu!",
    "Mais um desafio e vais ultrapassar-me!",
  ],
  owl: [
    "Sábio é quem nunca desiste!",
    "Cada erro é uma oportunidade de aprender.",
    "Com calma e paciência, tudo se alcança.",
    "O conhecimento é a maior das riquezas!",
  ],
  bunny: [
    "Mais um saltinho e estás lá!",
    "Vamos ler em voz alta juntos?",
    "As palavras são mágicas, sabias?",
    "Cada letra é uma nova descoberta!",
  ],
  turtle: [
    "Boa! Passinho a passinho.",
    "Devagar e sempre, chegamos longe.",
    "Cada passo conta na jornada.",
    "O importante é aprender bem, não ir depressa.",
  ],
};

// ─── Random encouragement for a given mascot ───
export function getRandomEncouragement(id: MascotId): string {
  const messages = ENCOURAGEMENT_MESSAGES[id];
  return messages[Math.floor(Math.random() * messages.length)];
}
