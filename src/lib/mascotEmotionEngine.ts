/**
 * MascotEmotionEngine — Centralized emotion state machine for mascots.
 *
 * Tracks emotion history (last 10 reactions), derives the current dominant
 * mood from recent history, provides contextual phrases based on streak
 * patterns, detects "idle too long" and sends encouragement, and exports
 * helper functions for integration across the app.
 */

import type { MascotMood } from "@/components/MascotExpression";

/* ─── Types ─── */

export interface EmotionEvent {
  /** What happened: correct, wrong, idle, etc. */
  type: EmotionType;
  /** Timestamp (ms since epoch) */
  ts: number;
  /** Optional subject context (math, portugues, etc.) */
  subject?: string;
  /** Whether it was part of a streak */
  streakLen?: number;
}

export type EmotionType =
  | "correct"
  | "wrong"
  | "perfect"      // 100% accuracy in a lesson
  | "levelUp"
  | "combo"        // 3+ consecutive correct
  | "idle"
  | "encourage"
  | "celebrate"
  | "frustrated"   // 3+ consecutive wrong
  | "sad"
  | "tired";

export type DominantMood =
  | "enthusiastic"   // lots of correct / combo / celebrate
  | "supportive"     // some wrong but also correct — encouraging mode
  | "worried"        // lots of wrong / frustrated
  | "sleepy"         // lots of idle or tired
  | "neutral";

/* ─── Constants ─── */

const HISTORY_MAX = 10;
const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const FRUSTRATION_THRESHOLD = 3; // 3 consecutive wrong answers

/* ─── Mood Mapping ─── */

const MOOD_FOR_TYPE: Record<EmotionType, MascotMood> = {
  correct: "happy",
  wrong: "sad",
  perfect: "celebrate",
  levelUp: "celebrate",
  combo: "celebrate",
  idle: "thinking",
  encourage: "happy",
  celebrate: "celebrate",
  frustrated: "sad",
  sad: "sad",
  tired: "tired",
};

/* ─── Phrases by Mood ─── */

const PHRASES: Record<DominantMood, (name?: string) => string[]> = {
  enthusiastic: (n) => [
    `Estás a arrasar${n ? `, ${n}` : ""}! 🌟`,
    "Cada resposta é uma estrela brilhante!",
    "Que velocidade! Não paras de acertar!",
    "A mascote está super orgulhosa! ✨",
  ],
  supportive: (n) => [
    `Não desistes${n ? `, ${n}` : ""}! Cada erro ensina algo novo.`,
    "Quase! A próxima vai ser certa.",
    "Eu acredito em ti — tenta de novo!",
    "Respira fundo, tu consegues! 💪",
  ],
  worried: (n) => [
    `Vamos devagar${n ? `, ${n}` : ""} — não há problema em tentar várias vezes.`,
    "Precisas de ajuda? O Tutor está aqui para ti!",
    "Vamos praticar mais — passo a passo chegamos lá.",
    "Não te preocupes, aprender é um processo! 🌱",
  ],
  sleepy: (n) => [
    `Voltaste${n ? `, ${n}` : ""}! Que bom ver-te! Vamos brincar? 🎮`,
    "A mascote estava à tua espera — vamos fazer uma missão rápida?",
    "Um pequeno desafio para começar? Vamos lá!",
    "Estás aqui! Que maravilha — vamos aprender algo novo! ☀️",
  ],
  neutral: (n) => [
    `Olá${n ? `, ${n}` : ""}! Vamos continuar a aprender? 📚`,
    "A mascote está pronta para te acompanhar!",
    "Que aventura vamos ter hoje?",
    "Escolhe uma missão e vamos lá! 🚀",
  ],
};

/* ─── Engine ─── */

class EmotionEngine {
  private history: EmotionEvent[] = [];
  private childName?: string;

  constructor(childName?: string) {
    this.childName = childName;
  }

  setName(name: string) {
    this.childName = name;
  }

  /** Track a new reaction event */
  trackReaction(event: Omit<EmotionEvent, "ts">): EmotionEvent {
    const full: EmotionEvent = { ...event, ts: Date.now() };
    this.history.push(full);
    // Keep only last HISTORY_MAX
    if (this.history.length > HISTORY_MAX) {
      this.history = this.history.slice(-HISTORY_MAX);
    }
    return full;
  }

  /** Get last N events */
  getHistory(n?: number): EmotionEvent[] {
    return n ? this.history.slice(-n) : [...this.history];
  }

  /** Derive the current dominant mood from recent history */
  getDominantMood(): DominantMood {
    if (this.history.length === 0) return "neutral";

    const recent = this.history.slice(-5);
    const counts: Record<EmotionType, number> = {} as any;

    for (const e of recent) {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
    }

    // Check for frustration pattern
    const last3 = this.history.slice(-3);
    if (last3.length >= FRUSTRATION_THRESHOLD && last3.every((e) => e.type === "wrong")) {
      return "worried";
    }

    // Check for idle
    const idleCount = (counts.idle ?? 0) + (counts.tired ?? 0);
    if (idleCount >= 2) return "sleepy";

    // Check for enthusiasm
    const positive = (counts.correct ?? 0) + (counts.combo ?? 0) + (counts.celebrate ?? 0) + (counts.perfect ?? 0) + (counts.levelUp ?? 0);
    const negative = (counts.wrong ?? 0) + (counts.frustrated ?? 0) + (counts.sad ?? 0);

    if (positive >= 3) return "enthusiastic";
    if (negative >= 3) return "worried";
    if (positive > negative) return "enthusiastic";
    if (negative > positive) return "worried";
    if (positive > 0 && negative > 0) return "supportive";
    return "neutral";
  }

  /** Get an appropriate MascotMood for display based on dominant mood */
  getMascotMood(): MascotMood {
    const dominant = this.getDominantMood();
    const moodMap: Record<DominantMood, MascotMood> = {
      enthusiastic: "celebrate",
      supportive: "happy",
      worried: "thinking",
      sleepy: "tired",
      neutral: "neutral",
    };
    return moodMap[dominant];
  }

  /** Get a contextual phrase based on the dominant mood */
  getEmotionalPhrase(): string {
    const dominant = this.getDominantMood();
    const phrases = PHRASES[dominant](this.childName);
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /** Get contextual phrase for a specific event type */
  getPhraseForType(type: EmotionType): string {
    const mood = MOOD_FOR_TYPE[type];
    // Map to dominant mood style
    const dominant = this.getDominantMood();

    // Use type-specific phrase when it's a strong event
    if (type === "perfect" || type === "levelUp" || type === "combo") {
      const phrases = PHRASES.enthusiastic(this.childName);
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    if (type === "frustrated" || type === "idle") {
      const phrases = PHRASES[dominant === "worried" ? "worried" : "supportive"](this.childName);
      return phrases[Math.floor(Math.random() * phrases.length)];
    }

    // Otherwise use dominant mood phrase
    return this.getEmotionalPhrase();
  }

  /** Check if we should encourage the child (idle too long) */
  shouldEncourage(): boolean {
    if (this.history.length === 0) return false;

    const lastEvent = this.history[this.history.length - 1];
    const elapsed = Date.now() - lastEvent.ts;

    // Idle threshold
    if (elapsed > IDLE_THRESHOLD_MS) return true;

    // Frustration pattern — 3+ wrong in a row
    const last3 = this.history.slice(-3);
    if (last3.length >= FRUSTRATION_THRESHOLD && last3.every((e) => e.type === "wrong")) {
      return true;
    }

    return false;
  }

  /** Get encouragement message when idle or frustrated */
  getEncouragement(): string {
    const dominant = this.getDominantMood();
    if (dominant === "worried") {
      const phrases = PHRASES.supportive(this.childName);
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    if (dominant === "sleepy" || dominant === "neutral") {
      const phrases = PHRASES.sleepy(this.childName);
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    return this.getEmotionalPhrase();
  }

  /** Reset history (e.g., new session) */
  reset() {
    this.history = [];
  }

  /** Clear history but keep name */
  clearHistory() {
    this.history = [];
  }
}

/* ─── Singleton Instance ─── */

let engineInstance: EmotionEngine | null = null;

function getEngine(childName?: string): EmotionEngine {
  if (!engineInstance) {
    engineInstance = new EmotionEngine(childName);
  }
  if (childName) {
    engineInstance.setName(childName);
  }
  return engineInstance;
}

/* ─── Public API ─── */

/** Track a reaction event */
export function trackReaction(event: Omit<EmotionEvent, "ts">, childName?: string): EmotionEvent {
  return getEngine(childName).trackReaction(event);
}

/** Get the current dominant mood */
export function getDominantMood(childName?: string): DominantMood {
  return getEngine(childName).getDominantMood();
}

/** Get MascotMood for display */
export function getMascotMood(childName?: string): MascotMood {
  return getEngine(childName).getMascotMood();
}

/** Get an emotional phrase */
export function getEmotionalPhrase(childName?: string): string {
  return getEngine(childName).getEmotionalPhrase();
}

/** Get phrase for a specific event type */
export function getPhraseForType(type: EmotionType, childName?: string): string {
  return getEngine(childName).getPhraseForType(type);
}

/** Check if we should encourage */
export function shouldEncourage(childName?: string): boolean {
  return getEngine(childName).shouldEncourage();
}

/** Get encouragement message */
export function getEncouragement(childName?: string): string {
  return getEngine(childName).getEncouragement();
}

/** Get recent history */
export function getHistory(n?: number, childName?: string): EmotionEvent[] {
  return getEngine(childName).getHistory(n);
}

/** Reset engine */
export function resetEngine() {
  engineInstance?.reset();
}

/** Clear history only */
export function clearHistory(childName?: string) {
  getEngine(childName).clearHistory();
}

/* ─── React Hook ─── */

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * React hook for the MascotEmotionEngine.
 * Provides live mood state and reaction tracking within a component.
 */
export function useMascotEmotion(childName?: string) {
  const nameRef = useRef(childName);
  const [mood, setMood] = useState<MascotMood>("neutral");
  const [phrase, setPhrase] = useState<string | null>(null);
  const [dominant, setDominant] = useState<DominantMood>("neutral");

  useEffect(() => {
    nameRef.current = childName;
  }, [childName]);

  const react = useCallback(
    (type: EmotionType, subject?: string, streakLen?: number) => {
      const engine = getEngine(nameRef.current);
      engine.trackReaction({ type, subject, streakLen });

      const newMood = engine.getMascotMood();
      const newPhrase = engine.getPhraseForType(type);
      const newDominant = engine.getDominantMood();

      setMood(newMood);
      setPhrase(newPhrase);
      setDominant(newDominant);

      // Auto-clear phrase after 2.5 seconds
      setTimeout(() => setPhrase(null), 2500);
    },
    [],
  );

  const encourage = useCallback(() => {
    const engine = getEngine(nameRef.current);
    if (engine.shouldEncourage()) {
      const msg = engine.getEncouragement();
      engine.trackReaction({ type: "encourage" });
      setMood(engine.getMascotMood());
      setPhrase(msg);
      setDominant(engine.getDominantMood());
      setTimeout(() => setPhrase(null), 3000);
      return msg;
    }
    return null;
  }, []);

  return { mood, phrase, dominant, react, encourage };
}
