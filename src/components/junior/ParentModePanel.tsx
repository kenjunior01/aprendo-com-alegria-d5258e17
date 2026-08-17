// Painel "Modo Pais" — instruções textuais + áudio (TTS pt-PT).
// Aparece como botão dentro do diálogo do mini-jogo.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Volume2, X, Lightbulb, MessageCircle, Sparkles, Home } from "lucide-react";
import { speak, stopSpeech } from "@/lib/audio";
import { getParentScript } from "@/lib/parentScripts";

export function ParentModePanel({ gameId, title }: { gameId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const script = getParentScript(gameId);

  const readAll = () => {
    const text = [
      `Modo pais para ${title}.`,
      `Objetivo: ${script.goal}`,
      `Como começar: ${script.setup}`,
      `Frases sugeridas: ${script.during.join(". ")}.`,
      `Para reforçar: ${script.praise.join(". ")}.`,
      `Em casa: ${script.extension}`,
    ].join(" ");
    speak(text, { rate: 0.95 });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-3 py-2 text-sm font-display"
        aria-label="Abrir modo pais"
      >
        <BookOpen className="h-4 w-4" /> Modo Pais
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-3 sm:items-center"
            onClick={() => { stopSpeech(); setOpen(false); }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[32rem] space-y-3 rounded-3xl border-2 border-border bg-card p-5 shadow-xl"
            >
              <header className="flex items-center justify-between">
                <p className="font-display text-lg">👨‍👩‍👧 Modo Pais — {title}</p>
                <button onClick={() => { stopSpeech(); setOpen(false); }} aria-label="Fechar"
                  className="rounded-full p-1 hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </header>

              <Section icon={<Lightbulb className="h-4 w-4" />} title="Objetivo" body={script.goal} />
              <Section icon={<Sparkles className="h-4 w-4" />} title="Como começar" body={script.setup} />
              <div>
                <p className="mb-1 inline-flex items-center gap-1 font-display text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" /> Frases sugeridas
                </p>
                <ul className="space-y-1 text-sm">
                  {script.during.map((s, i) => <li key={i} className="rounded-xl bg-muted/60 px-3 py-1.5">{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="mb-1 font-display text-sm text-muted-foreground">Reforço positivo</p>
                <p className="text-sm">{script.praise.join(" · ")}</p>
              </div>
              <Section icon={<Home className="h-4 w-4" />} title="Em casa" body={script.extension} />

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={readAll}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-display text-primary-foreground">
                  <Volume2 className="h-4 w-4" /> Ouvir tudo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <p className="mb-1 inline-flex items-center gap-1 font-display text-sm text-muted-foreground">{icon} {title}</p>
      <p className="text-sm">{body}</p>
    </div>
  );
}
