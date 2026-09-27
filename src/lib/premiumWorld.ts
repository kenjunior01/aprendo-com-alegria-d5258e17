// premiumWorld.ts — O Mundo Kidoz Premium (rota /portal).
// 5 reinos exclusivos com 3 níveis cada (Bronze/Prata/Ouro), estrelas,
// power-ups (escudo, dica, dobro) e criaturas mágicas colecionáveis.
// Tudo alimentado pelos bancos de questões existentes (generateQuestions),
// com seed variável para cada tentativa ter perguntas novas.
// Moeda local: Cristais ✦ — gastam-se no Bazar dos Cristais.

import { generateQuestions, type GenQuestion, type TrackId } from "./infiniteChallenges";
import { loadProfile, updateProfile, type Profile } from "./storage";
import { recordPortalEvent } from "./portalDaily";

export type RealmId = "vulcao" | "galaxia" | "lab" | "castelo" | "dragao";

export interface RealmDef {
  id: RealmId;
  name: string;
  short: string; // para títulos ("Lenda do Vulcão")
  emoji: string;
  tagline: string;
  desc: string;
  tracks: TrackId[];
  /** perguntas do nível Bronze; Prata = +2, Ouro = +4 */
  questions: number;
  /** classes de gradiente do cartão do reino */
  gradient: string;
  accent: string; // cor para HUD/barras
}

export const REALMS: RealmDef[] = [
  {
    id: "vulcao",
    name: "Vulcão dos Números",
    short: "Vulcão",
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
    short: "Galáxia",
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
    short: "Laboratório",
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
    short: "Castelo",
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
    short: "Dragão",
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

// ─── Níveis dos reinos ───
export interface RealmLevel {
  key: "bronze" | "prata" | "ouro";
  name: string;
  mult: number; // multiplicador de recompensas
  extra: number; // perguntas extra vs Bronze
  harder: number; // subida de dificuldade (níveis escolares)
}

export const REALM_LEVELS: RealmLevel[] = [
  { key: "bronze", name: "Bronze", mult: 1, extra: 0, harder: 0 },
  { key: "prata", name: "Prata", mult: 1.5, extra: 2, harder: 2 },
  { key: "ouro", name: "Ouro", mult: 2, extra: 4, harder: 4 },
];

export const realmQuestionCount = (realm: RealmDef, levelIdx: number): number =>
  realm.questions + (REALM_LEVELS[levelIdx]?.extra ?? 0);

// ─── Criaturas mágicas (colecionáveis do Bazar) ───
export type CreaturePerkKey =
  | "startShield"
  | "crystals"
  | "coins"
  | "xp"
  | "hintDiscount"
  | "freeHint";

export interface CreatureDef {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  price: number; // em cristais ✦
  perk: string; // descrição do bónus
  perkKey: CreaturePerkKey;
}

export const CREATURES: CreatureDef[] = [
  {
    id: "estrela",
    emoji: "✨",
    name: "Estrelinha",
    desc: "Uma amiga cintilante que adora acompanhar as tuas jogadas.",
    price: 90,
    perk: "Dicas custam 10 ✦ menos no Bazar",
    perkKey: "hintDiscount",
  },
  {
    id: "fenix",
    emoji: "🐣",
    name: "Fenixinho",
    desc: "Nasceu de uma fagulha do Vulcão e renasce a cada desafio.",
    price: 130,
    perk: "Começa cada jogo com 1 Escudo grátis",
    perkKey: "startShield",
  },
  {
    id: "unicornio",
    emoji: "🦄",
    name: "Unicórnio",
    desc: "Galinha dos ovos de ouro — onde passa, ficam moedas.",
    price: 180,
    perk: "+15% moedas em cada jogo",
    perkKey: "coins",
  },
  {
    id: "polvo",
    emoji: "🐙",
    name: "Polvo Sábio",
    desc: "Guarda segredos de todas as matérias nos seus 8 braços.",
    price: 180,
    perk: "+15% XP em cada jogo",
    perkKey: "xp",
  },
  {
    id: "dragaozinho",
    emoji: "🐲",
    name: "Dragãozinho",
    desc: "Filho do Guardião da Caverna — agora do teu lado!",
    price: 220,
    perk: "+15% cristais em cada jogo",
    perkKey: "crystals",
  },
  {
    id: "coruja",
    emoji: "🦉",
    name: "Coruja Dourada",
    desc: "Vê tudo do alto e sussurra a resposta certa ao teu ouvido.",
    price: 260,
    perk: "A 1.ª dica de cada jogo é grátis",
    perkKey: "freeHint",
  },
];

export const getCreature = (id: string | null | undefined): CreatureDef | undefined =>
  id ? CREATURES.find((c) => c.id === id) : undefined;

// ─── Power-ups do Bazar ───
export type SupplyKey = "shield" | "hint" | "double";

export const SUPPLIES: {
  key: SupplyKey;
  emoji: string;
  name: string;
  desc: string;
  price: number;
}[] = [
  {
    key: "shield",
    emoji: "🛡️",
    name: "Escudo",
    desc: "Absorve 1 erro por jogo — a lava não sobe, o combustível não se gasta.",
    price: 30,
  },
  {
    key: "hint",
    emoji: "💡",
    name: "Dica Mágica",
    desc: "Desaparece 2 opções erradas na pergunta onde a usares.",
    price: 20,
  },
  {
    key: "double",
    emoji: "✦×2",
    name: "Dobro de Cristais",
    desc: "Duplica os cristais que ganhares num jogo completo.",
    price: 45,
  },
];

export const hintPrice = (perk: CreaturePerkKey | null | undefined): number =>
  perk === "hintDiscount" ? 10 : 20;

// ─── Estado do Portal ───
const STATE_KEY = "kidoz-portal-v1";
const TOUR_KEY = "kidoz-portal-tour";

export interface PortalState {
  crystals: number;
  best: Partial<Record<RealmId, number>>; // legado: melhor pontuação no modo antigo
  /** estrelas por reino: [bronze, prata, ouro] — 0..3 em cada */
  stars: Partial<Record<RealmId, number[]>>;
  discoveries: string[]; // Diário do Laboratório (poções)
  dragonSlain: number; // vezes que o dragão foi derrotado
  keysGolden: number; // castelos 100% iluminados
  supplies: Record<SupplyKey, number>;
  creatures: string[]; // ids das criaturas compradas
  equippedCreature: string | null;
  titles: string[]; // títulos conquistados ("Lenda do Vulcão"…)
  activeTitle: string | null;
  lastPlayed: string | null;
}

const emptyState = (): PortalState => ({
  crystals: 0,
  best: {},
  stars: {},
  discoveries: [],
  dragonSlain: 0,
  keysGolden: 0,
  supplies: { shield: 0, hint: 0, double: 0 },
  creatures: [],
  equippedCreature: null,
  titles: [],
  activeTitle: null,
  lastPlayed: null,
});

export function loadPortalState(): PortalState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PortalState>;
    const merged: PortalState = {
      ...emptyState(),
      ...parsed,
      supplies: { ...emptyState().supplies, ...(parsed.supplies ?? {}) },
    };
    // Migração do modo antigo: quem dominou um reino ganha estrelas de Bronze.
    for (const r of REALMS) {
      const legacy = merged.best[r.id] ?? 0;
      if (legacy >= r.questions && !merged.stars[r.id]?.[0]) {
        merged.stars[r.id] = [2, merged.stars[r.id]?.[1] ?? 0, merged.stars[r.id]?.[2] ?? 0];
      }
    }
    return merged;
  } catch {
    return emptyState();
  }
}

export function savePortalState(s: PortalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

/** Total de estrelas ganhas (máx. 45 = 5 reinos × 3 níveis × 3 ★). */
export const totalStars = (s: PortalState): number =>
  REALMS.reduce((sum, r) => sum + (s.stars[r.id] ?? [0, 0, 0]).reduce((a, b) => a + b, 0), 0);

/** Nível desbloqueado? Bronze sempre; Prata precisa ★ Bronze; Ouro precisa ★ Prata. */
export function levelUnlocked(s: PortalState, realm: RealmDef, levelIdx: number): boolean {
  if (levelIdx <= 0) return true;
  const stars = s.stars[realm.id] ?? [0, 0, 0];
  return (stars[levelIdx - 1] ?? 0) >= 1;
}

// ─── Fim de jogo ───
export interface RealmFinish {
  crystals: number;
  coins: number;
  xp: number;
  perfect: boolean;
  starsEarned: number;
  nextUnlocked: boolean;
  newTitle: string | null;
  profile: Profile | null;
  state: PortalState;
}

/** Estrelas segundo a precisão: 3★ perfeito, 2★ ≥80%, 1★ ≥60%. */
export function starsFor(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.6) return 1;
  return 0;
}

/**
 * Registra o fim de um reino: dá cristais/coins/XP (com multiplicadores de
 * nível, dobro e criatura equipada), grava estrelas e confere títulos.
 */
export function finishRealm(
  realm: RealmDef,
  levelIdx: number,
  correct: number,
  extra?: {
    discovery?: string;
    goldenKey?: boolean;
    dragonSlain?: boolean;
    doubled?: boolean; // power-up ✦×2 usado neste jogo
  },
): RealmFinish {
  const total = realmQuestionCount(realm, levelIdx);
  const perfect = correct >= total;
  const starsEarned = starsFor(correct, total);
  const state = loadPortalState();
  const creature = getCreature(state.equippedCreature);
  const perk = creature?.perkKey;

  const level = REALM_LEVELS[levelIdx] ?? REALM_LEVELS[0];
  const baseCrystals = correct * 2 + (perfect ? 5 : 0);
  let crystals = Math.round(baseCrystals * level.mult * (perk === "crystals" ? 1.15 : 1));
  if (extra?.doubled) crystals *= 2;
  const coins = Math.round(
    (correct * 3 + (perfect ? 10 : 0)) * (1 + levelIdx * 0.5) * (perk === "coins" ? 1.15 : 1),
  );
  const xp = Math.round(
    (correct * 4 + (perfect ? 15 : 0)) * (1 + levelIdx * 0.5) * (perk === "xp" ? 1.15 : 1),
  );

  state.crystals += crystals;
  state.best[realm.id] = Math.max(state.best[realm.id] ?? 0, correct);
  const prevStars = state.stars[realm.id] ?? [0, 0, 0];
  const nextStars = [...prevStars];
  nextStars[levelIdx] = Math.max(nextStars[levelIdx] ?? 0, starsEarned);
  state.stars[realm.id] = nextStars;
  state.lastPlayed = new Date().toISOString();
  if (extra?.discovery && !state.discoveries.includes(extra.discovery)) {
    state.discoveries.push(extra.discovery);
  }
  if (extra?.goldenKey) state.keysGolden += 1;
  if (extra?.dragonSlain) state.dragonSlain += 1;

  // Título de Lenda: dominar os 3 níveis do reino (≥1★ em cada)
  let newTitle: string | null = null;
  const legendTitle = `Lenda do ${realm.short}`;
  if (nextStars.every((st) => st >= 1) && !state.titles.includes(legendTitle)) {
    state.titles.push(legendTitle);
    newTitle = legendTitle;
    state.activeTitle = legendTitle;
  }
  savePortalState(state);

  // Missões diárias do Portal: alimenta o progresso de hoje.
  recordPortalEvent({
    answersCorrect: correct,
    gameCompleted: true,
    stars: starsEarned,
    crystals,
    perfect,
  });

  const p = loadProfile();
  const profile = p ? updateProfile({ coins: p.coins + coins, xp: p.xp + xp }) : null;

  return {
    crystals,
    coins,
    xp,
    perfect,
    starsEarned,
    nextUnlocked: levelIdx < 2 && nextStars[levelIdx] >= 1,
    newTitle,
    profile,
    state,
  };
}

// ─── Bazar: compras ───
export type BuyResult =
  | { ok: true; state: PortalState }
  | { ok: false; reason: "nocredits" | "owned" | "unknown" };

export function buySupply(key: SupplyKey, price: number): BuyResult {
  const state = loadPortalState();
  if (state.crystals < price) return { ok: false, reason: "nocredits" };
  state.crystals -= price;
  state.supplies[key] = (state.supplies[key] ?? 0) + 1;
  savePortalState(state);
  return { ok: true, state };
}

export function buyCreature(creature: CreatureDef): BuyResult {
  const state = loadPortalState();
  if (state.creatures.includes(creature.id)) return { ok: false, reason: "owned" };
  if (state.crystals < creature.price) return { ok: false, reason: "nocredits" };
  state.crystals -= creature.price;
  state.creatures.push(creature.id);
  // Primeira criatura equipa-se automaticamente
  if (!state.equippedCreature) state.equippedCreature = creature.id;
  savePortalState(state);
  return { ok: true, state };
}

export function equipCreature(id: string | null): PortalState {
  const state = loadPortalState();
  state.equippedCreature = id;
  savePortalState(state);
  return state;
}

export function consumeSupply(key: SupplyKey): PortalState {
  const state = loadPortalState();
  state.supplies[key] = Math.max(0, (state.supplies[key] ?? 0) - 1);
  savePortalState(state);
  return state;
}

/** Adiciona cristais (ex.: recompensa de missões diárias do Portal). */
export function addCrystals(n: number): PortalState {
  const state = loadPortalState();
  state.crystals += n;
  savePortalState(state);
  return state;
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
export function realmQuestions(
  realm: RealmDef,
  grade: number,
  levelIdx = 0,
  seed = 0,
): GenQuestion[] {
  // Offset por reino + nível + seed da tentativa: perguntas diferentes entre
  // reinos, níveis e cada nova tentativa.
  const realmIndex = Math.max(
    0,
    REALMS.findIndex((r) => r.id === realm.id),
  );
  const lvl = REALM_LEVELS[levelIdx] ?? REALM_LEVELS[0];
  const level = Math.max(1, Math.min(14, grade + 1 + realmIndex + lvl.harder));
  const count = realmQuestionCount(realm, levelIdx);
  const per = Math.ceil(count / realm.tracks.length);
  const out: GenQuestion[] = [];
  for (const t of realm.tracks) {
    out.push(...generateQuestions(t, level, per, seed));
  }
  return out.slice(0, count);
}

export const realmTitleFor = (id: RealmId): string => getRealm(id)?.name ?? "Reino misterioso";

// ─── Conquistas do Mundo (locais, computadas do estado do Portal) ───
// Aparecem em /conquistas como secção própria — sem backend, como o resto
// do Portal. Cada badge tem progresso mensurável para a criança ver o caminho.
export interface PortalBadgeProgress {
  cur: number;
  target: number;
}
export interface PortalBadge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  progress: (s: PortalState, streak: number) => PortalBadgeProgress;
}

const starsIn = (s: PortalState, id: RealmId): number[] => s.stars[id] ?? [0, 0, 0];
const playedRealms = (s: PortalState): number =>
  REALMS.filter((r) => starsIn(s, r.id).some((st) => st > 0)).length;
const legends = (s: PortalState): number =>
  REALMS.filter((r) => starsIn(s, r.id).every((st) => st >= 1)).length;

export const PORTAL_BADGES: PortalBadge[] = [
  {
    id: "pb-first-spark",
    emoji: "🌋",
    title: "Primeira Faísca",
    desc: "Ganha a tua 1.ª estrela em qualquer reino.",
    progress: (s) => {
      const cur = totalStars(s);
      return { cur: Math.min(cur, 1), target: 1 };
    },
  },
  {
    id: "pb-explorer",
    emoji: "🗺️",
    title: "Explorador dos Reinos",
    desc: "Joga nos 5 reinos do Mundo Premium.",
    progress: (s) => ({ cur: playedRealms(s), target: 5 }),
  },
  {
    id: "pb-stars-15",
    emoji: "⭐",
    title: "Colecionador de Estrelas",
    desc: "Acumula 15 estrelas nos reinos.",
    progress: (s) => ({ cur: Math.min(totalStars(s), 15), target: 15 }),
  },
  {
    id: "pb-stars-45",
    emoji: "🌟",
    title: "Céu Completo",
    desc: "Conquista as 45 estrelas do Mundo (3★ × 3 níveis × 5 reinos).",
    progress: (s) => ({ cur: Math.min(totalStars(s), 45), target: 45 }),
  },
  {
    id: "pb-dragon",
    emoji: "🐉",
    title: "Caçador de Dragões",
    desc: "Derrota o Guardião da Caverna do Dragão.",
    progress: (s) => ({ cur: Math.min(s.dragonSlain, 1), target: 1 }),
  },
  {
    id: "pb-golden-key",
    emoji: "🔑",
    title: "Cavaleiro Dourado",
    desc: "Ilumina um castelo inteiro e recebe a Chave Dourada.",
    progress: (s) => ({ cur: Math.min(s.keysGolden, 1), target: 1 }),
  },
  {
    id: "pb-alchemist",
    emoji: "🧪",
    title: "Alquimista Curioso",
    desc: "Descobre 5 poções no Laboratório Mágico.",
    progress: (s) => ({ cur: Math.min(s.discoveries.length, 5), target: 5 }),
  },
  {
    id: "pb-creatures",
    emoji: "🐾",
    title: "Guardião das Criaturas",
    desc: "Adota 3 criaturas mágicas no Bazar dos Cristais.",
    progress: (s) => ({ cur: Math.min(s.creatures.length, 3), target: 3 }),
  },
  {
    id: "pb-legend",
    emoji: "👑",
    title: "Lenda Kidoz",
    desc: "Dominar os 3 níveis dos 5 reinos — o título supremo.",
    progress: (s) => ({ cur: legends(s), target: 5 }),
  },
  {
    id: "pb-streak",
    emoji: "🔥",
    title: "Missões em Chamas",
    desc: "Completa missões do Portal 7 dias seguidos.",
    progress: (_s, streak) => ({ cur: Math.min(streak, 7), target: 7 }),
  },
];

/** Estrelas/progresso atual para a badge (0..1). */
export function portalBadgePct(
  b: PortalBadge,
  s: PortalState,
  streak: number,
): PortalBadgeProgress {
  const p = b.progress(s, streak);
  return { cur: Math.min(p.cur, p.target), target: p.target };
}
