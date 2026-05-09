// Kidoz Júnior — conteúdo + perfis por criança (2-5 anos)

import type { MascotId } from "./mascots";

export type JuniorAgeGroup = "2-3" | "3-4" | "4-5";

export interface JuniorGame {
  id: string;
  title: string;
  emoji: string;
  description: string;
  benefits: string[];
  age: JuniorAgeGroup;
  garden: "primeiros-passos" | "descobertas" | "preparacao";
}

export interface JuniorGarden {
  id: "primeiros-passos" | "descobertas" | "preparacao";
  name: string;
  age: JuniorAgeGroup;
  tagline: string;
  emoji: string;
  color: string;
}

export const GARDENS: JuniorGarden[] = [
  { id: "primeiros-passos", name: "Jardim dos Primeiros Passos", age: "2-3", tagline: "Cores, formas, sons e o meu corpo", emoji: "🌱", color: "bg-pt-world/20" },
  { id: "descobertas",      name: "Ilha das Descobertas",        age: "3-4", tagline: "Letras, números e puzzles",          emoji: "🏝️", color: "bg-secondary/30" },
  { id: "preparacao",       name: "Vale da Preparação Escolar",  age: "4-5", tagline: "Pré-leitura, pré-escrita e pequenos cientistas", emoji: "🎓", color: "bg-primary/20" },
];

export const GAMES: JuniorGame[] = [
  { id: "jardim-cores",      title: "Jardim das Cores e Formas", emoji: "🌸", description: "Arrasta flores e frutas para o canteiro da cor certa.", benefits: ["Cores", "Formas", "Coordenação olho-mão"], age: "2-3", garden: "primeiros-passos" },
  { id: "orquestra-animais", title: "Orquestra dos Animais",     emoji: "🐮", description: "Toca nos animais para ouvir os seus sons e nomes.",      benefits: ["Vocabulário", "Audição"],                age: "2-3", garden: "primeiros-passos" },
  { id: "rotinas-kido",      title: "Rotinas do Amigo Kido",     emoji: "🪥", description: "Ajuda o Kido nas suas rotinas: lavar dentes, comer, dormir.", benefits: ["Sequências", "Higiene"],             age: "3-4", garden: "descobertas" },
  { id: "livro-magico",      title: "Livro Mágico de Histórias", emoji: "📖", description: "Toca no cenário para que a história ganhe vida.",        benefits: ["Linguagem", "Imaginação"],               age: "4-5", garden: "preparacao" },
];

export const getGardenGames = (gardenId: JuniorGarden["id"]) =>
  GAMES.filter((g) => g.garden === gardenId);

// ============== Perfis por criança ==============

export interface JuniorChild {
  id: string;
  name: string;
  age: number;          // 2-5
  mascot: MascotId;
  createdAt: string;    // ISO
}

export interface JuniorProgress {
  playedGames: string[];
  totalSessions: number;
  lastPlayedAt: string | null;
  highlights: { gameId: string; at: string; note: string }[];
}

const CHILDREN_KEY = "kidoz-junior-children-v1";
const ACTIVE_KEY   = "kidoz-junior-active-v1";
const LEGACY_PROGRESS = "kidoz-junior-progress-v1";
const progressKey  = (childId: string) => `kidoz-junior-progress::${childId}`;

const emptyProgress = (): JuniorProgress => ({
  playedGames: [], totalSessions: 0, lastPlayedAt: null, highlights: [],
});

const isBrowser = () => typeof window !== "undefined";
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

// ----- children CRUD -----

export function listJuniorChildren(): JuniorChild[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CHILDREN_KEY);
    const list: JuniorChild[] = raw ? JSON.parse(raw) : [];
    // Migração: se existir progresso legado mas nenhuma criança, cria "default"
    if (list.length === 0 && localStorage.getItem(LEGACY_PROGRESS)) {
      const def: JuniorChild = { id: uid(), name: "A minha criança", age: 4, mascot: "fox", createdAt: new Date().toISOString() };
      localStorage.setItem(CHILDREN_KEY, JSON.stringify([def]));
      localStorage.setItem(progressKey(def.id), localStorage.getItem(LEGACY_PROGRESS) ?? JSON.stringify(emptyProgress()));
      localStorage.setItem(ACTIVE_KEY, def.id);
      localStorage.removeItem(LEGACY_PROGRESS);
      return [def];
    }
    return list;
  } catch { return []; }
}

export function addJuniorChild(input: { name: string; age: number; mascot: MascotId }): JuniorChild {
  const child: JuniorChild = {
    id: uid(),
    name: input.name.trim().slice(0, 40) || "Criança",
    age: Math.max(2, Math.min(5, Math.round(input.age))),
    mascot: input.mascot,
    createdAt: new Date().toISOString(),
  };
  const list = listJuniorChildren();
  const next = [...list, child];
  if (isBrowser()) {
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(next));
    localStorage.setItem(progressKey(child.id), JSON.stringify(emptyProgress()));
    localStorage.setItem(ACTIVE_KEY, child.id);
  }
  return child;
}

export function removeJuniorChild(childId: string) {
  if (!isBrowser()) return;
  const list = listJuniorChildren().filter((c) => c.id !== childId);
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(list));
  localStorage.removeItem(progressKey(childId));
  if (localStorage.getItem(ACTIVE_KEY) === childId) {
    if (list[0]) localStorage.setItem(ACTIVE_KEY, list[0].id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
}

export function getActiveJuniorChildId(): string | null {
  if (!isBrowser()) return null;
  const id = localStorage.getItem(ACTIVE_KEY);
  if (id && listJuniorChildren().some((c) => c.id === id)) return id;
  const first = listJuniorChildren()[0];
  if (first) { localStorage.setItem(ACTIVE_KEY, first.id); return first.id; }
  return null;
}

export function setActiveJuniorChild(childId: string) {
  if (isBrowser()) localStorage.setItem(ACTIVE_KEY, childId);
}

// ----- progress -----

export function loadJuniorProgress(childId?: string | null): JuniorProgress {
  if (!isBrowser()) return emptyProgress();
  const id = childId ?? getActiveJuniorChildId();
  if (!id) return emptyProgress();
  try {
    const raw = localStorage.getItem(progressKey(id));
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch { return emptyProgress(); }
}

export function recordJuniorPlay(gameId: string, note: string, childId?: string | null): JuniorProgress {
  const id = childId ?? getActiveJuniorChildId();
  if (!id) return emptyProgress();
  const p = loadJuniorProgress(id);
  const next: JuniorProgress = {
    playedGames: Array.from(new Set([...p.playedGames, gameId])),
    totalSessions: p.totalSessions + 1,
    lastPlayedAt: new Date().toISOString(),
    highlights: [{ gameId, at: new Date().toISOString(), note }, ...p.highlights].slice(0, 12),
  };
  if (isBrowser()) localStorage.setItem(progressKey(id), JSON.stringify(next));
  return next;
}
