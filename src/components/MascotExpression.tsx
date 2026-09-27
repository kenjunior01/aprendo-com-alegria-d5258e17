import { AnimatePresence, motion } from "framer-motion";
import { MascotActor, type ActorMood } from "@/components/MascotActor";
import type { MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

/** Humores suportados (sprites 3D + física por humor). */
export type MascotMood = ActorMood;

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  mood?: MascotMood;
  equippedItemId?: string | null;
  className?: string;
  bubble?: string | null;
  growthScale?: number;
}

/**
 * Mascote expressiva de nova geração: sprites 3D por emoção com cross-fade,
 * física squash & stretch, aura emocional, sombra no chão e partículas.
 * (Os olhos/boca já fazem parte do render 3D — sem overlay SVG.)
 */
export function MascotExpression({
  mascotId,
  size = "md",
  mood = "neutral",
  equippedItemId,
  className,
  bubble,
  growthScale = 1,
}: Props) {
  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <MascotActor
        mascotId={mascotId}
        size={size}
        mood={mood}
        equippedItemId={equippedItemId}
        growthScale={growthScale}
      />

      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.5, filter: "blur(10px)" }}
            className="glass-morphism mt-4 max-w-[260px] rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-center text-sm font-bold shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-md"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
