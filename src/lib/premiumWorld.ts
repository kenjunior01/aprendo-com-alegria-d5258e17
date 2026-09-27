// premiumWorld.ts — O Mundo Kidoz Premium (rota /portal).
// 5 reinos exclusivos que combinam mecânicas (quiz + coleção + progressão visual),
// todos alimentados pelos bancos de questões existentes (generateQuestions).
// Moeda local: Cristais ✦ (convertidos também em moedas/XP do perfil).

import { generateQuestions, type GenQuestion, type TrackId } from "./infiniteChallenges";
import { loadProfile, updateProfile, type Profile } from "./storage";

export type RealmId = "vulcao" | "galaxia" | "lab" | "castelo" | "dragao";

export interface RealmDef {
  id: RealmId;
  name: string;
  emoji: string;
  tagline: string;
  desc: string;
  tracks: TrackId[];
  questions: number;
  /** classes de gradiente do cartão do reino */
  gradient: string;
  accent: string; // cor para HUD/barras
}

export const REALMS: RealmDef[] = [
  {
    id: "vulcao",
    name: "Vulcão dos Números",
    emoji: "🌋",
    tagline: "A lava sobe! Responde para arrefecer",
    desc: "Matemática em erupção: cada acerto arrefce a lava, cada erro faz-na subir. Apanha cristais de obsidiana antes da erupção!",
    tracks: ["math-arithmetic", "math-tables"],
    questions: 8,
    gradient: "from-red-500/25 via-orange-400/20 to-amber-300/25",
    accent: "#ef4444",
  },
  {
    id: "galaxia",
    name: "Galáxia do Saber",
    emoji: "🚀",
    tagline: "Viaja de planeta em planeta",
    desc: "O teu foguetão voa entre planetas de Ciência, Geografia e História. Combustível = respostas certas. Quantos mundos visitas?",
    tracks: ["science-nature", "world-geography", "world-history"],
    questions: 6,
    gradient: "from-indigo-500/25 via-violet-500/20 to-fuchsia-400/25",
    accent: "#8b5cf6",
  },
  {
    id: "lab",
    name: "Laboratório Mágico",
    emoji: "🧪",
    tagline: "Mistura poções, descobre o mundo",
    desc: "Cada poção esconde um mistério da natureza. Acerta na mistura, enche o frasco e preenche o teu Diário de Descobertas!",
    tracks: ["science-nature"],
    questions: 6,
    gradient: "from-emerald-500/25 via-teal-400/20 to-cyan-300/25",
    accent: "#10b981",
  },
  {
    id: "castelo",
    name: "Castelo das Palavras",
    emoji: "🏰",
    tagline: "Acende uma janela a cada acerto",
    desc: "O castelo está às escuras! Gramática e ortografia acendem as janelas, uma a uma. Acende-as todas e ganha a Chave Dourada.",
    tracks: ["lang-grammar", "lang-spelling"],
    questions: 8,
    gradient: "from-sky-500/25 via-blue-400/20 to-indigo-300/25",
    accent: "#3b82f6",
  },
  {
    id: "dragao",
    name: "Caverna do Dragão",
    emoji: "🐉",
    tagline: "O desafio final de todas as matérias",
    desc: "Um dragão guarda o Tesouro Mestre. Perguntas de TUDO: matemática, português, ciência e mundo. Derrota-o e torna-te Lenda Kidoz!",
    tracks: ["math-arithmetic", "lang-grammar", "science-nature", "world-geography"],
    questions: 10,
    gradient: "from-amber-500/25 via-rose-400/20 to-red-300/25",
    accent: "#f59e0b",
  },
];

export const getRealm = (id: string): RealmDef | undefined => REALMS.find((r) => r.id === id);

// ─── Estado do Portal ───
const STATE_KEY = "kidoz-portal-v1";
const TOUR_KEY = "kidoz-portal-tour";

export interface PortalState {
  crystals: number;
  best: Partial<Record<RealmId, number>>; // melhor pontuação (acertos)
  discoveries: string[]; // Diário do Laboratório
  dragonSlain: number; // vezes que o dragão foi derrotado
  keysGolden: number; // castelos 100% iluminados
  lastPlayed: string | null;
}

const emptyState = (): PortalState => ({
  crystals: 0,
  best: {},
  discoveries: [],
  dragonSlain: 0,
  keysGolden: 0,
  lastPlayed: null,
});

export function loadPortalState(): PortalState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

export function savePortalState(s: PortalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

export interface RealmFinish {
  crystals: number;
  coins: number;
  xp: number;
  perfect: boolean;
  profile: Profile | null;
  state: PortalState;
}

/** Registra o fim de um reino: dá cristais + recompensas ao perfil. */
export function finishRealm(
  realm: RealmDef,
  correct: number,
  extra?: { discovery?: string; goldenKey?: boolean; dragonSlain?: boolean },
): RealmFinish {
  const perfect = correct >= realm.questions;
  const crystals = correct * 2 + (perfect ? 5 : 0);
  const coins = correct * 3 + (perfect ? 10 : 0);
  const xp = correct * 4 + (perfect ? 15 : 0);

  const state = loadPortalState();
  state.crystals += crystals;
  state.best[realm.id] = Math.max(state.best[realm.id] ?? 0, correct);
  state.lastPlayed = new Date().toISOString();
  if (extra?.discovery && !state.discoveries.includes(extra.discovery)) {
    state.discoveries.push(extra.discovery);
  }
  if (extra?.goldenKey) state.keysGolden += 1;
  if (extra?.dragonSlain) state.dragonSlain += 1;
  savePortalState(state);

  const p = loadProfile();
  const profile = p ? updateProfile({ coins: p.coins + coins, xp: p.xp + xp }) : null;

  return { crystals, coins, xp, perfect, profile, state };
}

// ─── Tour grátis (não-premium): 1 visita guiada por semana ───
export function tourAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = localStorage.getItem(TOUR_KEY);
    if (!last) return true;
    return Date.now() - new Date(last).getTime() > 7 * 86_400_000;
  } catch {
    return false;
  }
}

export function markTourUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_KEY, new Date().toISOString());
}

// ─── Perguntas ───
export function realmQuestions(realm: RealmDef, grade: number): GenQuestion[] {
  // Offset por reino: muda a seed e sobe ligeiramente a dificuldade
  // (garante perguntas diferentes entre reinos no mesmo nível escolar).
  const realmIndex = Math.max(
    0,
    REALMS.findIndex((r) => r.id === realm.id),
  );
  const level = Math.max(1, Math.min(14, grade + 1 + realmIndex));
  const per = Math.ceil(realm.questions / realm.tracks.length);
  const out: GenQuestion[] = [];
  for (const t of realm.tracks) {
    out.push(...generateQuestions(t, level, per));
  }
  return out.slice(0, realm.questions);
}

export const realmTitleFor = (id: RealmId): string => getRealm(id)?.name ?? "Reino misterioso";
