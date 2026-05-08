// Kidoz Júnior — conteúdo para crianças 2-5 anos
// Estrutura em "Jardins Temáticos" com mini-jogos simples e adaptáveis.

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
  color: string; // bg-* class
}

export const GARDENS: JuniorGarden[] = [
  {
    id: "primeiros-passos",
    name: "Jardim dos Primeiros Passos",
    age: "2-3",
    tagline: "Cores, formas, sons e o meu corpo",
    emoji: "🌱",
    color: "bg-pt-world/20",
  },
  {
    id: "descobertas",
    name: "Ilha das Descobertas",
    age: "3-4",
    tagline: "Letras, números e puzzles",
    emoji: "🏝️",
    color: "bg-secondary/30",
  },
  {
    id: "preparacao",
    name: "Vale da Preparação Escolar",
    age: "4-5",
    tagline: "Pré-leitura, pré-escrita e pequenos cientistas",
    emoji: "🎓",
    color: "bg-primary/20",
  },
];

export const GAMES: JuniorGame[] = [
  {
    id: "jardim-cores",
    title: "Jardim das Cores e Formas",
    emoji: "🌸",
    description: "Arrasta flores e frutas para o canteiro da cor certa.",
    benefits: ["Cores", "Formas", "Coordenação olho-mão"],
    age: "2-3",
    garden: "primeiros-passos",
  },
  {
    id: "orquestra-animais",
    title: "Orquestra dos Animais",
    emoji: "🐮",
    description: "Toca nos animais para ouvir os seus sons e nomes.",
    benefits: ["Vocabulário", "Audição", "Associação som-imagem"],
    age: "2-3",
    garden: "primeiros-passos",
  },
  {
    id: "rotinas-kido",
    title: "Rotinas do Amigo Kido",
    emoji: "🪥",
    description: "Ajuda o Kido nas suas rotinas: lavar dentes, comer, dormir.",
    benefits: ["Sequências", "Higiene", "Emoções"],
    age: "3-4",
    garden: "descobertas",
  },
  {
    id: "livro-magico",
    title: "Livro Mágico de Histórias",
    emoji: "📖",
    description: "Toca no cenário para que a história ganhe vida.",
    benefits: ["Linguagem", "Imaginação", "Compreensão"],
    age: "4-5",
    garden: "preparacao",
  },
];

export const getGardenGames = (gardenId: JuniorGarden["id"]) =>
  GAMES.filter((g) => g.garden === gardenId);

// Local progress tracking (no DB needed for first iteration)
const STORAGE_KEY = "kidoz-junior-progress-v1";

export interface JuniorProgress {
  playedGames: string[];          // unique game IDs played
  totalSessions: number;
  lastPlayedAt: string | null;    // ISO
  highlights: { gameId: string; at: string; note: string }[];
}

const empty = (): JuniorProgress => ({
  playedGames: [],
  totalSessions: 0,
  lastPlayedAt: null,
  highlights: [],
});

export function loadJuniorProgress(): JuniorProgress {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch { return empty(); }
}

export function recordJuniorPlay(gameId: string, note: string): JuniorProgress {
  const p = loadJuniorProgress();
  const next: JuniorProgress = {
    playedGames: Array.from(new Set([...p.playedGames, gameId])),
    totalSessions: p.totalSessions + 1,
    lastPlayedAt: new Date().toISOString(),
    highlights: [{ gameId, at: new Date().toISOString(), note }, ...p.highlights].slice(0, 12),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}
