import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import type { MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

export type MascotMood = "neutral" | "happy" | "thinking" | "sad" | "celebrate" | "tired";

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  mood?: MascotMood;
  equippedItemId?: string | null;
  className?: string;
  bubble?: string | null;
}

// Overlay SVG simples de olhos/boca por cima da mascote, com micro-animações.
function FaceOverlay({ mood }: { mood: MascotMood }) {
  // pares de olhos
  const eyes = (() => {
    switch (mood) {
      case "happy": return { left: "M 6 10 Q 10 4 14 10", right: "M 20 10 Q 24 4 28 10", stroke: 3 };
      case "celebrate": return { left: "M 5 8 L 9 12 M 9 8 L 5 12", right: "M 19 8 L 23 12 M 23 8 L 19 12", stroke: 2.5 };
      case "thinking": return { left: "M 5 9 L 11 9", right: "M 19 9 L 25 9", stroke: 2.5 };
      case "sad": return { left: "M 6 8 Q 10 12 14 8", right: "M 20 8 Q 24 12 28 8", stroke: 2.5 };
      case "tired": return { left: "M 5 9 Q 9 11 13 9", right: "M 19 9 Q 23 11 27 9", stroke: 2.5 };
      default: return { left: "M 9 9 L 9 11", right: "M 23 9 L 23 11", stroke: 3.5 };
    }
  })();

  const mouth = (() => {
    switch (mood) {
      case "happy":
      case "celebrate": return "M 10 22 Q 17 30 24 22";
      case "thinking": return "M 12 24 Q 17 22 22 24";
      case "sad": return "M 10 26 Q 17 20 24 26";
      case "tired": return "M 12 24 L 22 24";
      default: return "M 12 23 Q 17 26 22 23";
    }
  })();

  return (
    <svg
      viewBox="0 0 34 32"
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[36%] h-[36%] w-[58%] -translate-x-1/2"
    >
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.88, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <path d={eyes.left} stroke="#1b1b1b" strokeWidth={eyes.stroke} strokeLinecap="round" fill="none" />
        <path d={eyes.right} stroke="#1b1b1b" strokeWidth={eyes.stroke} strokeLinecap="round" fill="none" />
        <path d={mouth} stroke="#1b1b1b" strokeWidth={2.5} strokeLinecap="round" fill="none" />
        {mood === "celebrate" && (
          <>
            <text x="0" y="6" fontSize="9">✨</text>
            <text x="26" y="6" fontSize="9">✨</text>
          </>
        )}
        {mood === "sad" && <text x="3" y="20" fontSize="8">💧</text>}
        {mood === "tired" && <text x="24" y="6" fontSize="9">💤</text>}
        {mood === "thinking" && <text x="26" y="4" fontSize="9">💭</text>}
      </motion.g>
    </svg>
  );
}

export function MascotExpression({ mascotId, size = "md", mood = "neutral", equippedItemId, className, bubble }: Props) {
  const wiggle = mood === "celebrate" ? { rotate: [0, -6, 6, -4, 4, 0] } : mood === "happy" ? { y: [0, -4, 0] } : undefined;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <motion.div
        animate={wiggle}
        transition={wiggle ? { duration: 1.1, ease: "easeInOut" } : undefined}
        className="relative"
      >
        <Mascot id={mascotId} size={size} equippedItemId={equippedItemId} />
        <AnimatePresence mode="wait">
          {mood !== "neutral" && <FaceOverlay key={mood} mood={mood} />}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="mt-2 max-w-[220px] rounded-2xl border-2 border-border bg-card px-3 py-2 text-center text-sm font-medium shadow-md"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
