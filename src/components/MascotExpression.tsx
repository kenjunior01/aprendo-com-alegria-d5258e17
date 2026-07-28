import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import type { MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

export type MascotMood = "neutral" | "happy" | "thinking" | "sad" | "celebrate" | "tired" | "listening";

interface Props {
  mascotId: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  mood?: MascotMood;
  equippedItemId?: string | null;
  className?: string;
  bubble?: string | null;
  growthScale?: number;
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
      case "listening": return { left: "M 8 8 Q 10 6 12 8", right: "M 22 8 Q 24 6 26 8", stroke: 3 };
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
      case "listening": return "M 14 24 Q 17 23 20 24";
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

export function MascotExpression({ mascotId, size = "md", mood = "neutral", equippedItemId, className, bubble, growthScale = 1 }: Props) {
  // Advanced physics-based animations (Squash & Stretch)
  const variants = {
    neutral: { scale: growthScale, y: 0, rotate: 0 },
    happy: {
      scale: [growthScale, growthScale * 1.1, growthScale * 0.95, growthScale],
      y: [0, -15, 5, 0],
      transition: { duration: 0.6, times: [0, 0.4, 0.7, 1] }
    },
    celebrate: {
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [growthScale, growthScale * 1.2, growthScale],
      y: [0, -25, 0],
      transition: { duration: 0.8, repeat: Infinity }
    },
    thinking: {
      rotate: [0, -2, 2, 0],
      x: [0, -2, 2, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    sad: {
      scale: [growthScale, growthScale * 0.92, growthScale],
      y: [0, 8, 0],
      filter: ["grayscale(0%)", "grayscale(50%)", "grayscale(0%)"],
      transition: { duration: 3, repeat: Infinity }
    },
    tired: {
      opacity: [1, 0.7, 1],
      scale: [growthScale, growthScale * 0.98],
      transition: { duration: 4, repeat: Infinity }
    },
    listening: {
      rotate: [0, -5, 0],
      x: [0, 5, 0],
      transition: { duration: 0.5, repeat: Infinity }
    }
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <motion.div
        animate={mood}
        variants={variants}
        className="relative perspective-1000"
      >
        {/* Glow Aura for high levels */}
        {growthScale > 1.1 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 z-0 rounded-full bg-primary/20 blur-3xl"
          />
        )}

        <Mascot id={mascotId} size={size} equippedItemId={equippedItemId} growthScale={growthScale} />

        <AnimatePresence mode="wait">
          {mood !== "neutral" && <FaceOverlay key={mood} mood={mood} />}
        </AnimatePresence>
      </motion.div>

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
