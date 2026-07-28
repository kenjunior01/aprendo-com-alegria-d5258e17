
import { motion, AnimatePresence } from "framer-motion";
import { type Sticker } from "@/lib/stickers";
import { Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { playLevelUp, playCorrect } from "@/lib/audio";

interface Props {
  sticker: Sticker;
  onClose: () => void;
}

export function StickerPackOpening({ sticker, onClose }: Props) {
  const [phase, setSetPhase] = useState<"opening" | "reveal">("opening");

  useEffect(() => {
    // Stage 1: The magical shake
    const timer = setTimeout(() => {
      setSetPhase("reveal");
      playLevelUp();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const rarityColors = {
    comum: "from-blue-400 to-indigo-500",
    raro: "from-purple-500 to-pink-600",
    lendario: "from-yellow-400 via-orange-500 to-red-600",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
      <AnimatePresence mode="wait">
        {phase === "opening" ? (
          <motion.div
            key="pack"
            initial={{ scale: 0, rotate: -20 }}
            animate={{
              scale: 1,
              rotate: 0,
              y: [0, -20, 0],
              rotateZ: [0, -5, 5, -5, 5, 0]
            }}
            transition={{
              y: { duration: 0.5, repeat: Infinity },
              rotateZ: { duration: 0.2, repeat: Infinity, delay: 0.5 }
            }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
            className="relative h-64 w-48 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-800 shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center"
          >
            <Sparkles className="h-16 w-16 text-yellow-300 animate-pulse" />
            <p className="mt-4 font-display text-white font-black text-xl tracking-widest uppercase">Cromo!</p>
            <div className="absolute inset-0 bg-white/10 rounded-[2rem] animate-ping opacity-20" />
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            {/* The Sticker Card */}
            <motion.div
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
              className={cn(
                "relative h-80 w-60 rounded-[2.5rem] p-1 shadow-[0_0_50px_rgba(255,255,255,0.3)] bg-gradient-to-br",
                rarityColors[sticker.rarity]
              )}
            >
              <div className="h-full w-full bg-white rounded-[2.3rem] overflow-hidden flex flex-col items-center justify-center p-6 text-center border-4 border-white/50">
                 <span className="text-8xl mb-4 drop-shadow-xl">{sticker.emoji}</span>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{sticker.category}</p>
                 <h3 className="font-display text-2xl font-black text-slate-800 leading-tight mb-2">{sticker.name}</h3>
                 <Badge className={cn(
                   "uppercase font-black px-3 py-1 mb-4",
                   sticker.rarity === "lendario" ? "bg-yellow-400 text-amber-950" : "bg-indigo-100 text-indigo-600"
                 )}>
                   {sticker.rarity}
                 </Badge>
                 <p className="text-xs text-slate-500 italic leading-snug">"{sticker.description}"</p>
              </div>

              {/* Magical Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 300],
                    y: [0, (Math.random() - 0.5) * 300],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  className="absolute left-1/2 top-1/2 h-4 w-4 text-yellow-300"
                >
                  <Star className="fill-current" />
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={() => { haptic("tap"); onClose(); }}
              className="mt-12 btn-chunky px-12 py-4 bg-white text-indigo-900 text-xl rounded-2xl"
            >
              Uau! Guardar no Álbum
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { haptic } from "@/lib/haptics";
