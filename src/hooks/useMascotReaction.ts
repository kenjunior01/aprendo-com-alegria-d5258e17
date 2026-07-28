import { useCallback, useEffect, useRef, useState } from "react";
import type { MascotMood } from "@/components/MascotExpression";
import { haptic } from "@/lib/haptics";
import { isMuted } from "@/lib/audio";

export type ReactionEvent =
  | "correct"
  | "wrong"
  | "levelUp"
  | "streakSave"
  | "comboUp"
  | "idleLong"
  | "intro"
  | "outro";

interface Options {
  childName?: string;
  /** voz em pt-PT via SpeechSynthesis (opcional) */
  speak?: boolean;
}

const PHRASES: Record<ReactionEvent, (name?: string) => string[]> = {
  correct: (n) => [
    `Boa${n ? `, ${n}` : ""}!`,
    "Estás a arrasar!",
    "Mais uma certa!",
    "Que cabeça brilhante!",
  ],
  wrong: (n) => [
    "Quase! Tenta outra vez.",
    `Não faz mal${n ? `, ${n}` : ""}. Eu acredito em ti!`,
    "Respira fundo e tenta de novo.",
  ],
  levelUp: (n) => [
    `Subiste de nível${n ? `, ${n}` : ""}! 🎉`,
    "Mais um nível desbloqueado!",
  ],
  streakSave: () => ["Salvaste a tua sequência! 🔥"],
  comboUp: () => ["Combo a aumentar! ⚡", "Em chamas! 🔥"],
  idleLong: (n) => [`Ainda aí${n ? `, ${n}` : ""}? Vamos continuar!`],
  intro: (n) => [`Vamos lá${n ? `, ${n}` : ""}! Eu estou contigo.`],
  outro: () => ["Que aventura! Mal posso esperar pela próxima."],
};

const MOOD_FOR: Record<ReactionEvent, MascotMood> = {
  correct: "happy",
  wrong: "sad",
  levelUp: "celebrate",
  streakSave: "celebrate",
  comboUp: "celebrate",
  idleLong: "thinking",
  intro: "happy",
  outro: "celebrate",
};

export function useMascotReaction({ childName, speak = false }: Options = {}) {
  const [mood, setMood] = useState<MascotMood>("neutral");
  const [bubble, setBubble] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const react = useCallback(
    (event: ReactionEvent, customMessage?: string) => {
      clear();
      const m = MOOD_FOR[event];
      const phrases = PHRASES[event](childName);
      const text = customMessage ?? phrases[Math.floor(Math.random() * phrases.length)];
      setMood(m);
      setBubble(text);

      // Haptic
      if (event === "correct" || event === "levelUp" || event === "comboUp" || event === "streakSave" || event === "outro") {
        haptic("success");
      } else if (event === "wrong") {
        haptic("error");
      } else {
        haptic("tap");
      }

      // Voz
      if (speak && !isMuted() && typeof window !== "undefined" && window.speechSynthesis) {
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "pt-PT";
          u.pitch = event === "wrong" ? 0.95 : 1.3;
          u.rate = 1.0;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch {
          /* noop */
        }
      }

      // Voltar ao neutro após algum tempo
      timerRef.current = setTimeout(() => {
        setBubble(null);
        setMood("neutral");
      }, event === "levelUp" || event === "outro" ? 3600 : 2400);
    },
    [childName, speak],
  );

  useEffect(() => () => clear(), []);

  return { mood, bubble, react, setBubble, setMood } as const;
}
