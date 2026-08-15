
import { motion, AnimatePresence } from "framer-motion";
import { STICKERS, type StickerCategory } from "@/lib/stickers";
import { type Profile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { X, Book, Sparkles } from "lucide-react";
import { useState } from "react";

interface Props {
  profile: Profile;
  onClose: () => void;
}

export function StickerAlbum({ profile, onClose }: Props) {
  const [filter, setFilter] = useState<StickerCategory | "todos">("todos");
  const unlocked = new Set(profile.unlockedStickers);

  const CATEGORIES = [
    { id: "todos", label: "Todos", emoji: "📚" },
    { id: "fauna", label: "Fauna", emoji: "🦁" },
    { id: "monumentos", label: "Monumentos", emoji: "🏛️" },
    { id: "cultura", label: "Cultura", emoji: "🎸" },
  ];

  const filteredStickers = STICKERS.filter(s => filter === "todos" || s.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-4 z-[100] flex flex-col overflow-hidden rounded-[2.5rem] border-4 border-white bg-indigo-50 shadow-2xl md:inset-20"
    >
      <header className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Book className="h-8 w-8" />
          <div>
            <h2 className="font-display text-2xl font-black">Álbum de Moçambique</h2>
            <p className="text-xs text-indigo-100 uppercase font-bold tracking-widest">
              {unlocked.size} / {STICKERS.length} Colecionados
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full bg-white/20 p-2 hover:bg-white/30" aria-label="Fechar">
          <X className="h-6 w-6" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto p-4 bg-white/50 backdrop-blur-sm border-b border-indigo-100 shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id as any)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all shrink-0",
              filter === cat.id ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-white text-indigo-400 border border-indigo-100 hover:bg-indigo-50"
            )}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
        <div role="list" aria-live="polite" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredStickers.map(s => {
            const isUnlocked = unlocked.has(s.id);
            return (
              <motion.div
                key={s.id}
                whileHover={isUnlocked ? { y: -5, rotate: 2 } : {}}
                role="listitem"
                className={cn(
                  "relative aspect-[3/4] rounded-2xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all",
                  isUnlocked
                    ? "bg-white border-indigo-200 shadow-md"
                    : "bg-slate-200/50 border-dashed border-slate-300 opacity-40 grayscale"
                )}
              >
                <div className="text-5xl mb-3">{isUnlocked ? s.emoji : "❓"}</div>
                <p className="font-display text-xs font-bold text-indigo-900 uppercase tracking-tight line-clamp-1">
                  {isUnlocked ? s.name : "Bloqueado"}
                </p>
                {isUnlocked && s.rarity === "lendario" && (
                   <div className="absolute top-2 right-2">
                     <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                   </div>
                )}
                {isUnlocked && (
                  <p className="mt-2 text-[9px] text-indigo-400 font-medium leading-tight">
                    {s.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
