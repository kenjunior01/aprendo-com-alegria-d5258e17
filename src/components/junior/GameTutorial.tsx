// Tutorial reutilizável para mini-jogos do Júnior.
// Mostra passos com emoji + texto e narra cada passo (TTS pt-PT).
// Guarda no localStorage que já foi visto para não repetir sempre.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, ChevronRight } from "lucide-react";
import { speak, stopSpeech } from "@/lib/audio";

export interface TutorialStep {
  emoji: string;
  text: string;
}

interface Props {
  gameId: string;
  title: string;
  steps: TutorialStep[];
  onStart: () => void;
  /** Mostrar mesmo que já tenha sido visto. */
  forceShow?: boolean;
  /** Texto extra para os pais. */
  parentNote?: string;
}

const KEY = (id: string) => `alegria-tutorial-seen::${id}`;

export function useShouldShowTutorial(gameId: string) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setShow(localStorage.getItem(KEY(gameId)) !== "1");
  }, [gameId]);
  const markSeen = () => {
    if (typeof window !== "undefined") localStorage.setItem(KEY(gameId), "1");
    setShow(false);
  };
  const reset = () => {
    if (typeof window !== "undefined") localStorage.removeItem(KEY(gameId));
    setShow(true);
  };
  return { show, markSeen, reset };
}

export function GameTutorial({ gameId, title, steps, onStart, forceShow, parentNote }: Props) {
  const { show, markSeen } = useShouldShowTutorial(gameId);
  const [idx, setIdx] = useState(0);
  const visible = forceShow || show;
  const current = steps[idx];

  useEffect(() => {
    if (!visible || !current) return;
    speak(current.text, { rate: 0.92 });
    return () => stopSpeech();
  }, [visible, current, idx]);

  if (!visible || !current) return null;

  const next = () => {
    if (idx < steps.length - 1) setIdx(idx + 1);
    else {
      markSeen();
      onStart();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-background/95 p-4 backdrop-blur-sm"
      >
        <div className="card-chunky w-full max-w-md rounded-3xl border-2 border-border bg-card p-5 text-center shadow-xl">
          <p className="font-display text-lg text-muted-foreground">Como jogar — {title}</p>
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="my-5"
          >
            <div className="text-8xl">{current.emoji}</div>
            <p className="mt-3 px-2 font-display text-xl leading-snug">{current.text}</p>
          </motion.div>

          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === idx ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => speak(current.text, { rate: 0.9 })}
              className="touch-target-kid inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 font-display"
              aria-label="Ouvir outra vez"
            >
              <Volume2 className="h-5 w-5" /> Ouvir
            </button>
            <button
              type="button"
              onClick={next}
              className="touch-target-kid inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-display text-primary-foreground"
            >
              {idx < steps.length - 1 ? (
                <>Seguinte <ChevronRight className="h-5 w-5" /></>
              ) : (
                <>Vamos jogar! <Play className="h-5 w-5" /></>
              )}
            </button>
          </div>

          {parentNote && (
            <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-left text-[11px] text-muted-foreground">
              👨‍👩‍👧 <strong>Para os pais:</strong> {parentNote}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
