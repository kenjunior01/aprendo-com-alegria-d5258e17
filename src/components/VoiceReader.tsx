// Reconhecimento de voz infantil via Web Speech API.
// Compara palavra-a-palavra e mostra quais foram bem lidas.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  expected: string;
  onResult?: (matched: boolean, transcript: string, accuracy: number) => void;
  className?: string;
}

function getRecognition(): any {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (s: string) => normalize(s).split(" ").filter(Boolean);

// Compara palavra-a-palavra, devolvendo um boolean por palavra esperada.
const wordMatch = (expected: string, said: string): boolean[] => {
  const exp = tokenize(expected);
  const spoken = new Set(tokenize(said));
  return exp.map((w) => spoken.has(w));
};

export function VoiceReader({ expected, onResult, className }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [matches, setMatches] = useState<boolean[] | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    rec.lang = "pt-PT";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    rec.onresult = (event: any) => {
      const alts: string[] = [];
      const result = event.results[0];
      for (let i = 0; i < result.length; i++) alts.push(result[i].transcript);
      // Pick the alt with the most word matches
      let best = alts[0] ?? "";
      let bestM = wordMatch(expected, best);
      for (let i = 1; i < alts.length; i++) {
        const m = wordMatch(expected, alts[i]);
        if (m.filter(Boolean).length > bestM.filter(Boolean).length) {
          best = alts[i];
          bestM = m;
        }
      }
      setTranscript(best);
      setMatches(bestM);
      const acc = bestM.length ? bestM.filter(Boolean).length / bestM.length : 0;
      onResult?.(acc >= 0.7, best, acc);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [expected, onResult]);

  const start = () => {
    if (!recRef.current || listening) return;
    setTranscript("");
    setMatches(null);
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };
  const stop = () => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  };

  if (!supported) {
    return (
      <div className={cn("rounded-2xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground", className)}>
        🎤 O teu navegador não suporta reconhecimento de voz. Tenta no Chrome ou Safari.
      </div>
    );
  }

  const expWords = expected.split(/(\s+)/);
  const expTokens = tokenize(expected);
  let tokenIdx = -1;
  const accuracy = matches ? Math.round((matches.filter(Boolean).length / matches.length) * 100) : null;
  const allOk = matches ? matches.every(Boolean) : false;

  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <p className="font-display text-base text-muted-foreground">📖 Lê em voz alta:</p>
      <p className="card-chunky rounded-3xl border border-border bg-card px-5 py-5 font-display text-2xl leading-relaxed sm:text-3xl">
        {expWords.map((tok, i) => {
          if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
          tokenIdx += 1;
          const idx = tokenIdx;
          const m = matches?.[idx];
          return (
            <motion.span
              key={i}
              animate={m === true ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className={cn(
                "inline-block transition-colors",
                m === true && "text-success font-bold",
                m === false && "text-destructive line-through decoration-2",
              )}
            >
              {tok}
            </motion.span>
          );
        })}
      </p>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={listening ? stop : start}
        className={cn(
          "btn-chunky inline-flex h-20 w-20 items-center justify-center rounded-full text-white",
          listening ? "bg-destructive animate-pulse" : "bg-primary",
        )}
        aria-label={listening ? "Parar" : "Começar a ler"}
      >
        {listening ? <MicOff className="h-9 w-9" /> : <Mic className="h-9 w-9" />}
      </motion.button>

      <p className="text-xs text-muted-foreground">
        {listening ? "🔴 A ouvir… lê devagarinho!" : `Toca no microfone e lê as ${expTokens.length} palavras`}
      </p>

      {matches && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "w-full rounded-2xl px-4 py-3 text-sm",
            allOk ? "bg-success/15 text-success" : accuracy! >= 70 ? "bg-secondary/30 text-foreground" : "bg-destructive/10 text-destructive",
          )}
        >
          <div className="flex items-center justify-center gap-2 font-display text-base">
            {allOk ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {allOk ? `Perfeito! 🎉 (${accuracy}%)` : `Fluência: ${accuracy}% — ${accuracy! >= 70 ? "quase!" : "tenta outra vez"}`}
          </div>
          {transcript && <p className="mt-1 italic text-foreground/70">Ouvi: “{transcript}”</p>}
        </motion.div>
      )}
    </div>
  );
}
