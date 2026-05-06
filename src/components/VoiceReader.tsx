// Reconhecimento de voz infantil via Web Speech API.
// Útil para crianças praticarem leitura em voz alta.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  expected: string;
  onResult?: (matched: boolean, transcript: string) => void;
  className?: string;
}

// Type shim for vendor-prefixed APIs
type SR = typeof globalThis extends { SpeechRecognition: infer T }
  ? T
  : typeof globalThis extends { webkitSpeechRecognition: infer T }
  ? T
  : null;

function getRecognition(): any {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new (Ctor as unknown as new () => any)();
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compare = (expected: string, said: string): boolean => {
  const a = normalize(expected);
  const b = normalize(said);
  if (!a || !b) return false;
  if (a === b) return true;
  // simple fuzzy: every word from expected appears in said
  const wordsA = a.split(" ");
  return wordsA.every((w) => b.includes(w));
};

export function VoiceReader({ expected, onResult, className }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [matched, setMatched] = useState<boolean | null>(null);
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
      const best = alts[0] ?? "";
      setTranscript(best);
      const ok = alts.some((a) => compare(expected, a));
      setMatched(ok);
      onResult?.(ok, best);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [expected, onResult]);

  const start = () => {
    if (!recRef.current || listening) return;
    setTranscript("");
    setMatched(null);
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

  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <p className="font-display text-lg sm:text-xl">📖 Lê em voz alta:</p>
      <p className="card-chunky rounded-3xl border border-border bg-card px-5 py-4 font-display text-xl sm:text-2xl">
        {expected}
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
        {listening ? "🔴 A ouvir… lê devagarinho!" : "Toca no microfone e lê em voz alta"}
      </p>

      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "w-full rounded-2xl px-4 py-3 text-sm",
            matched ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          <div className="flex items-center justify-center gap-2 font-display">
            {matched ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {matched ? "Boa leitura! 🎉" : "Quase! Tenta outra vez."}
          </div>
          <p className="mt-1 italic text-foreground/70">Ouvi: “{transcript}”</p>
        </motion.div>
      )}
    </div>
  );
}
