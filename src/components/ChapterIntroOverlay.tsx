import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import type { MascotId } from "@/lib/mascots";
import type { ChapterStory } from "@/lib/chapterStories";
import { Sparkles, X } from "lucide-react";

interface Props {
  open: boolean;
  variant: "intro" | "outro";
  story: ChapterStory;
  mascotId: MascotId;
  childName?: string;
  onClose: () => void;
}

export function ChapterIntroOverlay({ open, variant, story, mascotId, childName, onClose }: Props) {
  const title = variant === "intro" ? story.introTitle : story.outroTitle;
  const body = variant === "intro" ? story.introBody : story.outroBody;
  const cta = variant === "intro" ? "Começar aventura!" : "Continuar →";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chapter-intro-title"
        >
          <motion.div
            initial={{ y: 40, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="card-chunky relative w-full max-w-[28rem] overflow-hidden rounded-3xl border-2 border-border bg-card p-5 sm:p-6"
          >
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <Mascot id={mascotId} size="lg" bouncing />
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/40 px-3 py-0.5 text-[10px] font-display font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3" />
                {variant === "intro" ? "Nova aventura" : "Capítulo concluído"}
              </span>
              <h2 id="chapter-intro-title" className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {childName ? `${childName}, ` : ""}
                {body}
              </p>

              {variant === "outro" && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 180 }}
                  className="mt-4 rounded-2xl border-2 border-xp/40 bg-xp/15 px-4 py-3 font-display text-base"
                >
                  {story.reward}
                </motion.div>
              )}

              <ChunkyButton onClick={onClose} className="mt-5 w-full">
                {cta}
              </ChunkyButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
