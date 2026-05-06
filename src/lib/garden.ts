// Jardim Mágico — mundo persistente que evolui com o XP, missões e conquistas.
// Cada elemento desbloqueado fica visualmente presente no jardim.

import type { Profile } from "./storage";

export interface GardenItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  unlockType: "xp" | "lessons" | "streak" | "coins";
  threshold: number;
  /** Posição (top%, left%) onde aparece no jardim */
  pos: { top: number; left: number };
  /** Tamanho relativo (1 = base) */
  size?: number;
}

export const GARDEN_ITEMS: GardenItem[] = [
  // Nível 1 — sementes (XP baixo)
  { id: "grass-1", emoji: "🌱", name: "Primeira Semente", description: "Começaste a tua aventura!", unlockType: "lessons", threshold: 1, pos: { top: 78, left: 20 }, size: 0.9 },
  { id: "grass-2", emoji: "🌿", name: "Erva Fresca", description: "Continua a regar com saber.", unlockType: "lessons", threshold: 2, pos: { top: 82, left: 70 }, size: 0.9 },
  { id: "flower-1", emoji: "🌼", name: "Margarida", description: "A primeira flor desabrochou!", unlockType: "xp", threshold: 50, pos: { top: 70, left: 35 } },
  { id: "flower-2", emoji: "🌷", name: "Tulipa Rosa", description: "Mais cor para o teu jardim.", unlockType: "xp", threshold: 120, pos: { top: 73, left: 55 } },

  // Nível 2 — vida (XP médio)
  { id: "tree-1", emoji: "🌳", name: "Carvalhinho", description: "A primeira árvore!", unlockType: "xp", threshold: 200, pos: { top: 50, left: 12 }, size: 1.4 },
  { id: "butterfly", emoji: "🦋", name: "Borboleta Azul", description: "Visitas alegres.", unlockType: "lessons", threshold: 5, pos: { top: 40, left: 45 } },
  { id: "flower-3", emoji: "🌻", name: "Girassol", description: "Olha sempre para o sol.", unlockType: "xp", threshold: 350, pos: { top: 65, left: 80 }, size: 1.2 },
  { id: "rabbit", emoji: "🐰", name: "Coelhinho", description: "Um amigo veio brincar.", unlockType: "streak", threshold: 3, pos: { top: 75, left: 45 } },

  // Nível 3 — magia (XP alto)
  { id: "tree-2", emoji: "🌲", name: "Pinheiro Mágico", description: "Sombra e mistério.", unlockType: "xp", threshold: 500, pos: { top: 45, left: 80 }, size: 1.5 },
  { id: "rainbow", emoji: "🌈", name: "Arco-íris", description: "Aprenderes traz cores ao mundo.", unlockType: "lessons", threshold: 10, pos: { top: 12, left: 30 }, size: 1.8 },
  { id: "fox", emoji: "🦊", name: "Raposa Curiosa", description: "Veio ver o teu progresso!", unlockType: "streak", threshold: 7, pos: { top: 60, left: 60 } },
  { id: "mushroom", emoji: "🍄", name: "Cogumelo Encantado", description: "Magia dos bosques.", unlockType: "coins", threshold: 100, pos: { top: 80, left: 8 }, size: 0.9 },

  // Nível 4 — lendário
  { id: "castle", emoji: "🏰", name: "Castelo do Saber", description: "O teu reino do conhecimento!", unlockType: "xp", threshold: 800, pos: { top: 30, left: 50 }, size: 2 },
  { id: "unicorn", emoji: "🦄", name: "Unicórnio", description: "Reservado aos verdadeiros mestres.", unlockType: "xp", threshold: 1500, pos: { top: 55, left: 35 }, size: 1.4 },
  { id: "dragon", emoji: "🐉", name: "Dragão Amigo", description: "Lendário! Voa contigo.", unlockType: "lessons", threshold: 25, pos: { top: 18, left: 70 }, size: 1.6 },
];

export interface GardenState {
  unlocked: GardenItem[];
  locked: GardenItem[];
  next: GardenItem | null;
  level: number;
  totalUnlocked: number;
  total: number;
}

export function gardenState(profile: Profile): GardenState {
  const unlocked: GardenItem[] = [];
  const locked: GardenItem[] = [];
  for (const it of GARDEN_ITEMS) {
    const value = it.unlockType === "xp" ? profile.xp
      : it.unlockType === "lessons" ? profile.completedLessons.length
      : it.unlockType === "streak" ? profile.streak
      : profile.coins;
    if (value >= it.threshold) unlocked.push(it);
    else locked.push(it);
  }
  // próximo desbloqueio: o mais perto de ser atingido
  const distance = (it: GardenItem) => {
    const value = it.unlockType === "xp" ? profile.xp
      : it.unlockType === "lessons" ? profile.completedLessons.length
      : it.unlockType === "streak" ? profile.streak
      : profile.coins;
    return it.threshold - value;
  };
  const next = locked.length ? [...locked].sort((a, b) => distance(a) - distance(b))[0] : null;
  const total = GARDEN_ITEMS.length;
  const level = unlocked.length < 3 ? 1 : unlocked.length < 7 ? 2 : unlocked.length < 12 ? 3 : 4;
  return { unlocked, locked, next, level, totalUnlocked: unlocked.length, total };
}

export const LEVEL_NAMES = ["", "Brotinho", "Jardim Animado", "Bosque Mágico", "Reino Lendário"];

export function progressToNext(profile: Profile, item: GardenItem): { current: number; target: number; pct: number; label: string } {
  const value = item.unlockType === "xp" ? profile.xp
    : item.unlockType === "lessons" ? profile.completedLessons.length
    : item.unlockType === "streak" ? profile.streak
    : profile.coins;
  const label = item.unlockType === "xp" ? "XP"
    : item.unlockType === "lessons" ? "missões"
    : item.unlockType === "streak" ? "dias seguidos"
    : "moedas";
  return { current: value, target: item.threshold, pct: Math.min(1, value / item.threshold), label };
}
