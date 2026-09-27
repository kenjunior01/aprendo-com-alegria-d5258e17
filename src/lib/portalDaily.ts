// portalDaily.ts — Missões Diárias do Portal + Streak 🔥
//
// Cria o hábito de voltar ao Mundo Kidoz Premium todos os dias:
// 3 missões escolhidas deterministicamente pela data (mesma para toda a
// criança naquele dia, sem backend), progresso registado pelos eventos do
// portal (jogar reinos, ganhar estrelas, visitar o Bazar…) e recompensas
// em Cristais ✦. Streak conta dias consecutivos com pelo menos 1 missão
// reclamada — queima se faltar um dia.
//
// Persistido em localStorage via localStore (migra kidoz-* automaticamente).

import { lsGet, lsSetJSON } from "./localStore";

const KEY = "kidoz-portal-daily-v1";

// ─── Definições ───
export type QuestMetric =
  | "games" // completar jogos de reino
  | "answers" // responder certo
  | "stars" // ganhar estrelas
  | "crystals" // ganhar cristais
  | "bazar" // comprar/usar algo no Bazar
  | "perfect"; // jogo perfeito (3★)

export interface PortalQuest {
  id: string;
  metric: QuestMetric;
  emoji: string;
  title: string;
  desc: string;
  target: number;
  reward: number; // cristais ✦
}

export const QUEST_POOL: PortalQuest[] = [
  {
    id: "q-2-games",
    metric: "games",
    emoji: "🎮",
    title: "Explorador dos Reinos",
    desc: "Completa 2 jogos em qualquer reino.",
    target: 2,
    reward: 15,
  },
  {
    id: "q-3-games",
    metric: "games",
    emoji: "🗺️",
    title: "Volta ao Mundo",
    desc: "Completa 3 jogos em qualquer reino.",
    target: 3,
    reward: 25,
  },
  {
    id: "q-12-answers",
    metric: "answers",
    emoji: "🧠",
    title: "Cérebro em Chamas",
    desc: "Acerta 12 respostas nos reinos.",
    target: 12,
    reward: 20,
  },
  {
    id: "q-20-answers",
    metric: "answers",
    emoji: "🔥",
    title: "Mente Incrível",
    desc: "Acerta 20 respostas nos reinos.",
    target: 20,
    reward: 35,
  },
  {
    id: "q-2-stars",
    metric: "stars",
    emoji: "⭐",
    title: "Caçador de Estrelas",
    desc: "Ganha 2 estrelas hoje.",
    target: 2,
    reward: 20,
  },
  {
    id: "q-4-stars",
    metric: "stars",
    emoji: "🌟",
    title: "Céu Cheio de Estrelas",
    desc: "Ganha 4 estrelas hoje.",
    target: 4,
    reward: 40,
  },
  {
    id: "q-bazar",
    metric: "bazar",
    emoji: "💎",
    title: "Visita ao Bazar",
    desc: "Compra 1 coisa no Bazar dos Cristais.",
    target: 1,
    reward: 10,
  },
  {
    id: "q-perfect",
    metric: "perfect",
    emoji: "🏆",
    title: "Jogo Perfeito",
    desc: "Termina 1 jogo sem errar (3★).",
    target: 1,
    reward: 30,
  },
  {
    id: "q-25-crystals",
    metric: "crystals",
    emoji: "✦",
    title: "Colheita de Cristais",
    desc: "Ganha 25 cristais jogando.",
    target: 25,
    reward: 15,
  },
];

export interface PortalDailyState {
  date: string; // YYYY-MM-DD
  questIds: string[];
  progress: Record<string, number>;
  claimed: string[];
  streak: number; // dias consecutivos com ≥1 missão reclamada
  lastClaimDate: string | null;
}

// ─── Utilitários de data (local, sem UTC — criança joga no fuso dela) ───
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86_400_000);
}

/** Seed determinística pela data — mesmas missões para o mesmo dia. */
function seedForDate(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Escolhe 3 missões distintas do pool para a data. */
export function questsForDate(key: string): PortalQuest[] {
  let seed = seedForDate(key);
  const idx = [...QUEST_POOL.keys()];
  // Fisher-Yates com PRNG multiplicativo (determinístico)
  for (let i = idx.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, 3).map((i) => QUEST_POOL[i]);
}

// ─── Estado ───
function emptyDaily(): PortalDailyState {
  return {
    date: todayKey(),
    questIds: [],
    progress: {},
    claimed: [],
    streak: 0,
    lastClaimDate: null,
  };
}

export function loadPortalDaily(): PortalDailyState {
  if (typeof window === "undefined") return emptyDaily();
  try {
    const raw = lsGet(KEY);
    if (!raw) return emptyDaily();
    const parsed = JSON.parse(raw) as Partial<PortalDailyState>;
    const state: PortalDailyState = { ...emptyDaily(), ...parsed };
    const today = todayKey();
    // Novo dia: roda as missões, mantém a streak (só queima se reclamou ontem e parou).
    if (state.date !== today) {
      state.date = today;
      state.questIds = [];
      state.progress = {};
      state.claimed = [];
    }
    if (state.lastClaimDate) {
      const gap = dayDiff(state.lastClaimDate, today);
      if (gap > 1) state.streak = 0; // faltou ≥2 dias → streak queimou
    }
    return state;
  } catch {
    return emptyDaily();
  }
}

function saveDaily(s: PortalDailyState) {
  if (typeof window === "undefined") return;
  lsSetJSON(KEY, s);
}

/** Missões de hoje (rodam na 1.ª leitura do dia). */
export function todayQuests(): { quests: PortalQuest[]; state: PortalDailyState } {
  const state = loadPortalDaily();
  if (!state.questIds.length) {
    state.questIds = questsForDate(state.date).map((q) => q.id);
    saveDaily(state);
  }
  const quests = state.questIds
    .map((id) => QUEST_POOL.find((q) => q.id === id))
    .filter((q): q is PortalQuest => !!q);
  return { quests, state };
}

// ─── Registo de eventos (chamado pelo portal) ───
export interface PortalGameEvent {
  answersCorrect?: number;
  gameCompleted?: boolean;
  stars?: number;
  crystals?: number;
  perfect?: boolean;
  bazarUsed?: boolean;
}

/** Registra um evento do Mundo e devolve o estado atualizado. */
export function recordPortalEvent(ev: PortalGameEvent): PortalDailyState {
  const state = loadPortalDaily();
  if (!state.questIds.length) {
    state.questIds = questsForDate(state.date).map((q) => q.id);
  }
  const bump = (metric: QuestMetric, n: number) => {
    for (const qid of state.questIds) {
      const q = QUEST_POOL.find((x) => x.id === qid);
      if (q && q.metric === metric) {
        state.progress[qid] = Math.min(q.target, (state.progress[qid] ?? 0) + n);
      }
    }
  };
  if (ev.answersCorrect) bump("answers", ev.answersCorrect);
  if (ev.gameCompleted) bump("games", 1);
  if (ev.stars) bump("stars", ev.stars);
  if (ev.crystals) bump("crystals", ev.crystals);
  if (ev.perfect) bump("perfect", 1);
  if (ev.bazarUsed) bump("bazar", 1);
  saveDaily(state);
  return state;
}

export interface ClaimResult {
  ok: boolean;
  reason?: "notdone" | "claimed";
  reward?: number;
  streak?: number;
  allDone?: boolean;
}

/** Reclama o prémio de uma missão concluída (em cristais ✦). */
export function claimPortalQuest(questId: string): ClaimResult {
  const state = loadPortalDaily();
  const q = QUEST_POOL.find((x) => x.id === questId);
  if (!q || !state.questIds.includes(questId)) return { ok: false, reason: "notdone" };
  if (state.claimed.includes(questId)) return { ok: false, reason: "claimed" };
  if ((state.progress[questId] ?? 0) < q.target) return { ok: false, reason: "notdone" };

  state.claimed.push(questId);
  const today = todayKey();
  if (state.lastClaimDate !== today) {
    const gap = state.lastClaimDate ? dayDiff(state.lastClaimDate, today) : 99;
    state.streak = gap === 1 ? state.streak + 1 : 1;
    state.lastClaimDate = today;
  }
  saveDaily(state);

  const quests = state.questIds
    .map((id) => QUEST_POOL.find((x) => x.id === id))
    .filter((x): x is PortalQuest => !!x);
  const allDone = quests.every((x) => state.claimed.includes(x.id));

  return { ok: true, reward: q.reward, streak: state.streak, allDone };
}
