// Energia da Mascote — deriva do progresso já persistido no Supabase
// (profiles.xp, profiles.streak, profiles.last_played, completed_lessons).
// Sem nova tabela: a "energia" é uma vista calculada do estado já guardado.

import type { Profile } from "./storage";

export type MascotMood = "exhausted" | "sleepy" | "calm" | "happy" | "bouncing" | "super";

export interface MascotEnergy {
  /** 0..100 */
  value: number;
  mood: MascotMood;
  emoji: string;
  label: string;
  /** Mensagem curta em pt-PT */
  hint: string;
}

const MOOD_TABLE: { min: number; mood: MascotMood; emoji: string; label: string; hint: string }[] = [
  { min: 90, mood: "super",     emoji: "⚡", label: "Super carregado!", hint: "Está cheio de energia — vamos a uma missão difícil!" },
  { min: 70, mood: "bouncing",  emoji: "🤸", label: "Saltitante",       hint: "Está pronto para mais aventuras contigo!" },
  { min: 45, mood: "happy",     emoji: "😊", label: "Feliz",            hint: "Mais uma liçãozinha vai deixá-lo ainda melhor." },
  { min: 25, mood: "calm",      emoji: "😌", label: "Calmo",            hint: "Está a precisar de uma lição rápida para se animar." },
  { min: 10, mood: "sleepy",    emoji: "😴", label: "Sonolento",        hint: "Está a bocejar… completa uma lição para o acordar!" },
  { min: 0,  mood: "exhausted", emoji: "🥱", label: "Cansadinho",       hint: "Voltaste! Vamos brincar para ele recuperar a energia." },
];

/** Calcula a energia 0..100 com base no perfil persistido. */
export function computeMascotEnergy(p: Pick<Profile, "xp" | "streak" | "lastPlayed" | "completedLessons">): MascotEnergy {
  const xp = p.xp ?? 0;
  const streak = p.streak ?? 0;
  const lessons = p.completedLessons?.length ?? 0;

  // Recência: 100 hoje, cai 20 por dia sem jogar
  const last = p.lastPlayed ? new Date(p.lastPlayed).getTime() : 0;
  const daysSince = last ? Math.max(0, (Date.now() - last) / 86_400_000) : 7;
  const recency = Math.max(0, 100 - daysSince * 20);

  // Componente de atividade: lições recentes e streak
  const activity = Math.min(100, lessons * 4 + streak * 8 + Math.min(40, xp / 25));

  const value = Math.round(recency * 0.55 + activity * 0.45);
  const v = Math.max(0, Math.min(100, value));
  const tier = MOOD_TABLE.find((t) => v >= t.min) ?? MOOD_TABLE[MOOD_TABLE.length - 1];

  return { value: v, ...tier };
}
