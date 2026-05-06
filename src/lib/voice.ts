// Hook simples: ouve uma vez via Web Speech API e tenta fazer match com uma das opções fornecidas.
import { useCallback, useRef, useState } from "react";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function isVoiceAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

function getRecognition(): any {
  if (!isVoiceAvailable()) return null;
  const w = window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return new Ctor();
}

export interface VoiceMatchState {
  listening: boolean;
  transcript: string;
  matchedIndex: number | null;
  error: string | null;
}

export function useVoiceMatch(options: string[]) {
  const [state, setState] = useState<VoiceMatchState>({
    listening: false,
    transcript: "",
    matchedIndex: null,
    error: null,
  });
  const recRef = useRef<any>(null);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setState((s) => ({ ...s, listening: false }));
  }, []);

  const start = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      setState((s) => ({ ...s, error: "Voz não disponível neste browser." }));
      return;
    }
    rec.lang = "pt-PT";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    setState({ listening: true, transcript: "", matchedIndex: null, error: null });

    rec.onresult = (e: any) => {
      const alts: string[] = [];
      const result = e.results[0];
      for (let i = 0; i < result.length; i++) alts.push(result[i].transcript);
      const said = alts[0] ?? "";
      const saidNorms = alts.map(normalize);

      let matched: number | null = null;
      const optsN = options.map(normalize);
      // exact / contains match
      for (const sn of saidNorms) {
        const idx = optsN.findIndex((o) => o === sn || sn.includes(o) || o.includes(sn));
        if (idx >= 0) { matched = idx; break; }
      }
      setState({ listening: false, transcript: said, matchedIndex: matched, error: matched === null ? "Não percebi. Tenta outra vez." : null });
    };

    rec.onerror = (e: any) => {
      setState({ listening: false, transcript: "", matchedIndex: null, error: e?.error === "not-allowed" ? "Permite o microfone para usar a voz." : "Não consegui ouvir." });
    };
    rec.onend = () => setState((s) => ({ ...s, listening: false }));

    recRef.current = rec;
    try { rec.start(); } catch {
      setState((s) => ({ ...s, listening: false, error: "Não foi possível iniciar a voz." }));
    }
  }, [options]);

  return { ...state, start, stop };
}
