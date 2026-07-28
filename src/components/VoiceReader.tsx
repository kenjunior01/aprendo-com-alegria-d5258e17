// Reconhecimento de voz infantil via Web Speech API.
// Modo karaoke: realça palavras a verde em tempo real à medida que a criança lê.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectRegion } from "@/lib/region";

interface Props {
  expected: string;
  onResult?: (matched: boolean, transcript: string, accuracy: number) => void;
  className?: string;
  /** Override locale (defaults to region-based: pt-PT / pt-BR / en-US…) */
  lang?: string;
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

function regionLang(): string {
  try {
    const r = detectRegion();
    if (r.language === "en") return "en-US";
    if (r.code === "BR") return "pt-BR";
    return "pt-PT";
  } catch {
    return "pt-PT";
  }
}

function phoneticHint(expected: string, said: string): string | null {
  const exp = normalize(expected);
  const heard = normalize(said);
  if (!heard) return "Tenta falar mais alto e devagar.";
  if (heard === exp) return null;
  const swaps: Array<[RegExp, string]> = [
    [/lh/g, "lh"], [/nh/g, "nh"], [/ç|c(?=[ei])/g, "s"], [/r{2,}/g, "rr forte"],
  ];
  for (const [re, sound] of swaps) {
    if (exp.match(re) && !heard.match(re)) {
      return `Atenção ao som "${sound}" — articula com calma.`;
    }
  }
  if (heard.length < exp.length * 0.6) return "Faltaram sílabas — lê cada parte da palavra.";
  if (heard.length > exp.length * 1.4) return "Disseste sons a mais — vai mais devagarinho.";
  if (exp.slice(-1) !== heard.slice(-1)) return "Cuidado com a vogal final.";
  return "Quase! Tenta repetir a palavra com clareza.";
}

// Constrói o array de matches palavra-a-palavra preservando ordem e
// permitindo "saltos" (a criança pode dizer palavras seguidas mas a
// transcrição interim cresce gradualmente).
function progressiveMatch(expected: string, said: string): boolean[] {
  const exp = tokenize(expected);
  const heard = tokenize(said);
  const result = new Array<boolean>(exp.length).fill(false);
  let h = 0;
  for (let e = 0; e < exp.length && h < heard.length; e++) {
    // permite procurar até 2 palavras à frente para resistir a ruído
    for (let off = 0; off <= 2 && h + off < heard.length; off++) {
      if (heard[h + off] === exp[e]) {
        result[e] = true;
        h = h + off + 1;
        break;
      }
    }
  }
  return result;
}

export function VoiceReader({ expected, onResult, className, lang }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [matches, setMatches] = useState<boolean[] | null>(null);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef<number>(0);
  const recRef = useRef<any>(null);
  const expectedRef = useRef(expected);
  expectedRef.current = expected;
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const locale = lang || regionLang();
  const expTokens = useMemo(() => tokenize(expected), [expected]);

  useEffect(() => {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    rec.lang = locale;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let full = "";
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        full += event.results[i][0].transcript + " ";
        if (event.results[i].isFinal) isFinal = true;
      }
      // accumulate with prior transcript by re-reading all results
      let all = "";
      for (let i = 0; i < event.results.length; i++) {
        all += event.results[i][0].transcript + " ";
      }
      setTranscript(all.trim());
      const m = progressiveMatch(expectedRef.current, all);
      setMatches(m);
      const allOk = m.every(Boolean);
      if (allOk || isFinal) {
        const acc = m.length ? m.filter(Boolean).length / m.length : 0;
        if (allOk) {
          setFinished(true);
          try { rec.stop(); } catch { /* ignore */ }
          onResultRef.current?.(true, all.trim(), 1);
        } else if (isFinal) {
          onResultRef.current?.(acc >= 0.7, all.trim(), acc);
        }
        // suppress unused variable warning
        void full;
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [locale]);

  // Reset state when expected phrase changes
  useEffect(() => {
    setTranscript("");
    setMatches(null);
    setFinished(false);
  }, [expected]);

  const start = () => {
    if (!recRef.current || listening) return;
    setTranscript("");
    setMatches(null);
    setFinished(false);
    startedAt.current = Date.now();
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
        🎤 O teu navegador não suporta reconhecimento de voz. Tenta no Chrome, Edge ou Safari.
      </div>
    );
  }

  const expWords = expected.split(/(\s+)/);
  let tokenIdx = -1;
  const matchedCount = matches ? matches.filter(Boolean).length : 0;
  const accuracy = matches ? Math.round((matchedCount / matches.length) * 100) : null;
  const allOk = matches ? matches.every(Boolean) : false;
  const elapsedSec = startedAt.current && (matches || finished) ? (Date.now() - startedAt.current) / 1000 : 0;
  const wpm = elapsedSec > 0 ? Math.round((matchedCount / elapsedSec) * 60) : 0;

  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <p className="font-display text-base text-muted-foreground">📖 Lê em voz alta:</p>

      {/* Barra de progresso */}
      {matches && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${(matchedCount / matches.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <p className="card-chunky rounded-3xl border border-border bg-card px-5 py-5 font-display text-2xl leading-relaxed sm:text-3xl">
        {expWords.map((tok, i) => {
          if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
          tokenIdx += 1;
          const idx = tokenIdx;
          const m = matches?.[idx];
          // próxima palavra a ler (a primeira false)
          const isNext = listening && matches && !m && matches.slice(0, idx).every(Boolean);
          return (
            <motion.span
              key={i}
              animate={
                m === true
                  ? { scale: [1, 1.2, 1], color: ["currentColor", "var(--success, #16a34a)", "currentColor"] }
                  : isNext
                    ? { scale: [1, 1.05, 1] }
                    : {}
              }
              transition={{ duration: m === true ? 0.5 : 1, repeat: isNext ? Infinity : 0 }}
              className={cn(
                "inline-block transition-colors",
                m === true && "text-success font-bold",
                isNext && "text-primary underline decoration-primary decoration-2 underline-offset-4",
                m === false && !isNext && finished && "text-destructive line-through decoration-2",
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
        {listening
          ? "🔴 A ouvir… lê devagarinho, palavra a palavra!"
          : `Toca no microfone e lê as ${expTokens.length} palavras (${locale})`}
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
            {allOk
              ? `Perfeito! 🎉 ${wpm > 0 ? `· ${wpm} palavras/min` : ""}`
              : `Fluência: ${accuracy}% — ${accuracy! >= 70 ? "quase!" : "tenta outra vez"}`}
          </div>
          {transcript && <p className="mt-1 italic text-foreground/70">Ouvi: "{transcript}"</p>}
          {finished && !allOk && matches && (
            <ul className="mt-2 space-y-1 text-left">
              {expTokens.map((word, i) => {
                if (matches[i]) return null;
                const hint = phoneticHint(word, transcript);
                return (
                  <li key={i} className="rounded-lg bg-card/60 px-2 py-1 text-xs">
                    🔊 <strong>{word}</strong> — {hint ?? "tenta de novo"}
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}
