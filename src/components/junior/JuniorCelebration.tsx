import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import type { MascotId } from "@/lib/mascots";
import type { JuniorSticker } from "@/lib/juniorRewards";
import { juniorSpeak } from "@/lib/juniorRewards";
import { haptic } from "@/lib/haptics";

interface Props {
  open: boolean;
  sticker: JuniorSticker | null;
  mascot: MascotId;
  isNew: boolean;
  onClose: () => void;
}

export function JuniorCelebration({ open, sticker, mascot, isNew, onClose }: Props) {
  useEffect(() => {
    if (!open || !sticker) return;
    haptic("celebrate");
    juniorSpeak(`${sticker.cheer} Ganhaste o autocolante ${sticker.label}!`);
  }, [open, sticker]);

  if (!sticker) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-primary/40 via-accent/40 to-secondary/40 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Celebração"
        >
          {/* confetti */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
              animate={{ y: 600, x: (i % 2 === 0 ? 1 : -1) * (40 + i * 12), opacity: [0, 1, 1, 0], rotate: 360 }}
              transition={{ duration: 2.4 + (i % 4) * 0.4, repeat: Infinity, delay: i * 0.08 }}
              className="pointer-events-none absolute text-3xl"
              style={{ left: `${(i * 53) % 100}%`, top: 0 }}
            >
              {["🎉", "⭐", "🌈", "✨", "🎈"][i % 5]}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0.6, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="card-chunky relative z-10 w-full max-w-[24rem] rounded-3xl border-4 border-primary bg-card p-6 text-center"
          >
            <div className="flex justify-center">
              <Mascot id={mascot} size="xl" bouncing />
            </div>
            <p className="mt-2 font-display text-2xl">Boa! 🎉</p>
            <p className="mt-1 text-sm text-muted-foreground">"{sticker.cheer}"</p>

            <motion.div
              initial={{ rotate: -8, scale: 0.7 }}
              animate={{ rotate: [0, -6, 6, 0], scale: 1 }}
              transition={{ duration: 0.9 }}
              className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-primary bg-gradient-to-br from-primary/15 to-accent/25 text-7xl shadow-lg"
            >
              {sticker.emoji}
            </motion.div>
            <p className="mt-3 font-display text-lg">{sticker.label}</p>
            <p className="text-xs text-muted-foreground">
              {isNew ? "✨ Novo autocolante para a tua coleção!" : "Já tinhas este autocolante — bom trabalho!"}
            </p>

            <ChunkyButton tone="success" onClick={onClose} className="mt-5 w-full">
              Continuar a brincar 💖
            </ChunkyButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
