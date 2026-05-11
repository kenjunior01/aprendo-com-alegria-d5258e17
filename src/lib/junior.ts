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
  garden: GardenId;
}

export type GardenId = "primeiros-passos" | "descobertas" | "preparacao" | "floresta-sonhos" | "estrela-imaginacao";

export interface JuniorGarden {
  id: GardenId;
  name: string;
  age: JuniorAgeGroup;
  tagline: string;
  emoji: string;
  color: string;
  level: number;          // 1..5 — etapa de progresso
  unlockThreshold: number; // % do jardim anterior necessário (0-100)
}

export const GARDENS: JuniorGarden[] = [
  { id: "primeiros-passos",  name: "Jardim dos Primeiros Passos", age: "2-3", tagline: "Cores, formas, sons e o meu corpo",                emoji: "🌱", color: "bg-pt-world/20",  level: 1, unlockThreshold: 0 },
  { id: "descobertas",       name: "Ilha das Descobertas",        age: "3-4", tagline: "Letras, números e puzzles",                       emoji: "🏝️", color: "bg-secondary/30", level: 2, unlockThreshold: 60 },
  { id: "preparacao",        name: "Vale da Preparação Escolar",  age: "4-5", tagline: "Pré-leitura, pré-escrita e pequenos cientistas", emoji: "🎓", color: "bg-primary/20",   level: 3, unlockThreshold: 60 },
  { id: "floresta-sonhos",   name: "Floresta dos Sonhos",         age: "4-5", tagline: "Aventura, criatividade e arte",                  emoji: "🌳", color: "bg-accent/30",    level: 4, unlockThreshold: 60 },
  { id: "estrela-imaginacao",name: "Estrela da Imaginação",       age: "4-5", tagline: "Pequenos exploradores do mundo",                 emoji: "🌟", color: "bg-xp/20",        level: 5, unlockThreshold: 70 },
];

export const GAMES: JuniorGame[] = [
  // 🌱 Jardim dos Primeiros Passos (2-3)
  { id: "jardim-cores",      title: "Jardim das Cores e Formas", emoji: "🌸", description: "Arrasta flores e frutas para o canteiro da cor certa.", benefits: ["Cores", "Formas", "Coordenação"], age: "2-3", garden: "primeiros-passos" },
  { id: "orquestra-animais", title: "Orquestra dos Animais",     emoji: "🐮", description: "Toca nos animais para ouvir os seus sons e nomes.",      benefits: ["Vocabulário", "Audição"],         age: "2-3", garden: "primeiros-passos" },
  { id: "conta-patinhos",    title: "Conta os Patinhos",         emoji: "🦆", description: "Aprende a contar de 1 a 5 com patinhos no lago.",        benefits: ["Números", "Contagem"],            age: "2-3", garden: "primeiros-passos" },
  { id: "bolhas-sabao",      title: "Bolhas de Sabão",           emoji: "🫧", description: "Rebenta as bolhas e descobre as cores escondidas.",      benefits: ["Reflexos", "Cores"],              age: "2-3", garden: "primeiros-passos" },
  { id: "meu-corpo",         title: "O Meu Corpo",               emoji: "👶", description: "Aponta as partes do corpo do Kido.",                     benefits: ["Vocabulário", "Esquema corporal"], age: "2-3", garden: "primeiros-passos" },

  // 🏝️ Ilha das Descobertas (3-4)
  { id: "rotinas-kido",      title: "Rotinas do Amigo Kido",     emoji: "🪥", description: "Ajuda o Kido nas suas rotinas diárias.",                 benefits: ["Sequências", "Higiene"],          age: "3-4", garden: "descobertas" },
  { id: "memoria-animais",   title: "Memória dos Animais",       emoji: "🧠", description: "Encontra os pares de cartas com animais.",               benefits: ["Memória", "Concentração"],        age: "3-4", garden: "descobertas" },
  { id: "letra-aventura",    title: "Aventura das Letras",       emoji: "🔤", description: "Descobre a letra que falta em cada palavra.",            benefits: ["Alfabeto", "Pré-leitura"],        age: "3-4", garden: "descobertas" },
  { id: "formas-geo",        title: "Mestre das Formas",         emoji: "🔺", description: "Encaixa cada forma no sítio certo.",                     benefits: ["Geometria", "Lógica"],            age: "3-4", garden: "descobertas" },
  { id: "frutas-mercado",    title: "Mercado das Frutas",        emoji: "🥭", description: "Conta e ordena frutas africanas no mercado.",            benefits: ["Números", "Cultura PALOP"],       age: "3-4", garden: "descobertas" },

  // 🎓 Vale da Preparação Escolar (4-5)
  { id: "livro-magico",      title: "Livro Mágico de Histórias", emoji: "📖", description: "Escolhe o caminho da história e vê o que acontece.",     benefits: ["Linguagem", "Imaginação"],        age: "4-5", garden: "preparacao" },
  { id: "soletrar",          title: "Soletrar com o Kido",       emoji: "✏️", description: "Arrasta as letras para formar palavras simples.",        benefits: ["Pré-escrita", "Fonética"],        age: "4-5", garden: "preparacao" },
  { id: "matematica-magica", title: "Matemática Mágica",         emoji: "➕", description: "Resolve pequenas somas com objetos mágicos.",           benefits: ["Aritmética", "Lógica"],           age: "4-5", garden: "preparacao" },
  { id: "pequeno-cientista", title: "Pequeno Cientista",         emoji: "🧪", description: "Mistura cores e descobre o que acontece.",               benefits: ["Ciência", "Causa-efeito"],        age: "4-5", garden: "preparacao" },
  { id: "relogio-kido",      title: "Que Horas São?",            emoji: "⏰", description: "Aprende as horas certas e as rotinas do dia.",           benefits: ["Tempo", "Rotinas"],               age: "4-5", garden: "preparacao" },
  { id: "mapa-palop",        title: "Viagem pela Lusofonia",     emoji: "🌍", description: "Conhece bandeiras e palavras dos países PALOP.",         benefits: ["Geografia", "Cultura"],           age: "4-5", garden: "preparacao" },

  // 🌳 Floresta dos Sonhos (4-5)
  { id: "pinta-desenho",     title: "Pinta o Desenho",           emoji: "🎨", description: "Toca para pintar cada parte do desenho.",                 benefits: ["Criatividade", "Cores"],          age: "4-5", garden: "floresta-sonhos" },
  { id: "eco-som",           title: "Eco do Som",                emoji: "🎵", description: "Repete a sequência de sons dos animais.",                 benefits: ["Memória auditiva", "Sequências"], age: "4-5", garden: "floresta-sonhos" },
  { id: "jardim-magico",     title: "Jardim Mágico",             emoji: "🌷", description: "Planta sementes, rega e vê-as crescer.",                  benefits: ["Causa-efeito", "Paciência"],      age: "4-5", garden: "floresta-sonhos" },
  { id: "puzzle-kido",       title: "Quebra-Cabeças do Kido",    emoji: "🧩", description: "Reorganiza as peças para formar a imagem.",               benefits: ["Lógica espacial"],                age: "4-5", garden: "floresta-sonhos" },

  // 🌟 Estrela da Imaginação (4-5)
  { id: "caca-tesouro",      title: "Caça ao Tesouro",           emoji: "💎", description: "Procura o tesouro escondido na ilha.",                    benefits: ["Atenção", "Exploração"],          age: "4-5", garden: "estrela-imaginacao" },
  { id: "estacoes-ano",      title: "Estações do Ano",           emoji: "🍂", description: "Associa cada paisagem à sua estação.",                    benefits: ["Natureza", "Vocabulário"],        age: "4-5", garden: "estrela-imaginacao" },
  { id: "emocoes-kido",      title: "Como te sentes?",           emoji: "😊", description: "Identifica as emoções nas caras do Kido.",                benefits: ["Emoções", "Empatia"],             age: "4-5", garden: "estrela-imaginacao" },
  { id: "sombras",           title: "Associa a Sombra",          emoji: "🌑", description: "Encontra a sombra de cada animal.",                       benefits: ["Observação", "Memória visual"],   age: "3-4", garden: "descobertas" },
  { id: "padroes",           title: "Completa o Padrão",         emoji: "🔁", description: "Que figura vem a seguir na sequência?",                   benefits: ["Lógica", "Sequências"],           age: "4-5", garden: "preparacao" },
  { id: "labirinto",         title: "Labirinto do Ratinho",      emoji: "🐭", description: "Leva o ratinho até ao queijo sem bater nas paredes.",     benefits: ["Orientação", "Resolução"],        age: "4-5", garden: "floresta-sonhos" },
  { id: "trivia-jr",         title: "Sabichão Júnior",           emoji: "❓", description: "Mini-trivia divertida sobre tudo!",                       benefits: ["Conhecimento geral"],             age: "4-5", garden: "estrela-imaginacao" },

  // ---- Novos (1.º–4.º ano) — disponíveis no Vale & Estrela
  { id: "soma-rapida",       title: "Soma Rápida",               emoji: "⚡", description: "Quantas somas acertas em 1 minuto?",                       benefits: ["Cálculo mental", "Matemática"],   age: "4-5", garden: "preparacao" },
  { id: "tabuada",           title: "Tabuada Express",           emoji: "✖️", description: "Treina a tabuada do 2 ao 9.",                              benefits: ["Multiplicação"],                  age: "4-5", garden: "preparacao" },
  { id: "fracoes",           title: "Frações Visuais",           emoji: "🍕", description: "Identifica que fração da pizza está pintada.",            benefits: ["Frações", "Geometria"],           age: "4-5", garden: "preparacao" },
  { id: "silabas",           title: "Caça-Sílabas",              emoji: "🔡", description: "Completa a sílaba que falta na palavra.",                  benefits: ["Pré-leitura"],                    age: "3-4", garden: "descobertas" },
  { id: "forma-frase",       title: "Forma a Frase",             emoji: "✍️", description: "Ordena as palavras para formar uma frase.",                benefits: ["Sintaxe", "Leitura"],             age: "4-5", garden: "preparacao" },
  { id: "antonimos",         title: "Antónimos",                 emoji: "↔️", description: "Encontra o oposto da palavra.",                            benefits: ["Vocabulário"],                    age: "4-5", garden: "preparacao" },
  { id: "mapa-pt",           title: "Mapa de Portugal",          emoji: "🗺️", description: "Adivinha a região portuguesa pela pista.",                 benefits: ["Geografia"],                      age: "4-5", garden: "estrela-imaginacao" },
  { id: "ciclo-agua",        title: "Ciclo da Água",             emoji: "💧", description: "Ordena as fases do ciclo da água.",                        benefits: ["Ciências"],                       age: "4-5", garden: "estrela-imaginacao" },
  { id: "habitats",          title: "Animais & Habitats",        emoji: "🦁", description: "Onde vive cada animal?",                                    benefits: ["Ciências", "Natureza"],           age: "3-4", garden: "descobertas" },
  { id: "bandeiras",         title: "Bandeiras do Mundo",        emoji: "🚩", description: "Reconhece bandeiras de países.",                            benefits: ["Geografia", "Cidadania"],         age: "4-5", garden: "estrela-imaginacao" },
  { id: "spelling-en",       title: "Spelling EN",               emoji: "🔊", description: "Ouve a palavra em inglês e escreve-a.",                    benefits: ["Inglês", "Audição"],              age: "4-5", garden: "estrela-imaginacao" },
  { id: "colors-en",         title: "Cores & Números EN",        emoji: "🎨", description: "Aprende cores e números em inglês.",                        benefits: ["Inglês"],                         age: "3-4", garden: "descobertas" },
  { id: "simon",             title: "Memória Musical",           emoji: "🎹", description: "Repete a sequência (Simon Says).",                          benefits: ["Memória", "Música"],              age: "4-5", garden: "floresta-sonhos" },
  { id: "logica",            title: "Quebra-Cabeças Lógico",     emoji: "🧠", description: "Pequenos puzzles de lógica e padrões.",                     benefits: ["Lógica"],                         age: "4-5", garden: "preparacao" },
  { id: "trivia-online",     title: "Mega Trivia",               emoji: "🌐", description: "Perguntas dinâmicas (cache + offline).",                    benefits: ["Conhecimento geral"],             age: "4-5", garden: "estrela-imaginacao" },
];

export const getGardenGames = (gardenId: GardenId) =>
  GAMES.filter((g) => g.garden === gardenId);

// ----- Níveis / desbloqueio de jardins -----

export interface GardenStats {
  garden: JuniorGarden;
  total: number;
  played: number;
  pct: number;
  unlocked: boolean;
}

export function gardenProgressFor(progress: JuniorProgress): GardenStats[] {
  const stats: GardenStats[] = [];
  let prevPct = 100;
  for (const g of GARDENS) {
    const games = GAMES.filter((x) => x.garden === g.id);
    const played = games.filter((x) => progress.playedGames.includes(x.id)).length;
    const pct = games.length ? Math.round((played / games.length) * 100) : 0;
    const unlocked = prevPct >= g.unlockThreshold;
    stats.push({ garden: g, total: games.length, played, pct, unlocked });
    prevPct = pct;
  }
  return stats;
}

export function currentLevel(progress: JuniorProgress): number {
  const stats = gardenProgressFor(progress);
  let lvl = 1;
  for (const s of stats) if (s.unlocked && s.played > 0) lvl = s.garden.level;
  return lvl;
}

// ============== Perfis por criança ==============

export interface JuniorChild {
  id: string;
  name: string;
  age: number;          // 2-5
  mascot: MascotId;
  createdAt: string;    // ISO
}

export interface JuniorMedal {
  id: string;          // e.g. "first-game", "streak-3", "garden-1-complete"
  emoji: string;
  label: string;
  awardedAt: string;
}
export interface JuniorProgress {
  playedGames: string[];
  totalSessions: number;
  lastPlayedAt: string | null;
  highlights: { gameId: string; at: string; note: string }[];
  /** Total points earned across all sessions. */
  points: number;
  /** Current daily streak in days. */
  streak: number;
  /** Best streak ever reached. */
  bestStreak: number;
  /** Last calendar day (YYYY-MM-DD) the child played. */
  lastDay: string | null;
  /** Medals/badges unlocked. */
  medals: JuniorMedal[];
}

const CHILDREN_KEY = "kidoz-junior-children-v1";
const ACTIVE_KEY   = "kidoz-junior-active-v1";
const LEGACY_PROGRESS = "kidoz-junior-progress-v1";
const progressKey  = (childId: string) => `kidoz-junior-progress::${childId}`;

const emptyProgress = (): JuniorProgress => ({
  playedGames: [], totalSessions: 0, lastPlayedAt: null, highlights: [],
  points: 0, streak: 0, bestStreak: 0, lastDay: null, medals: [],
});

const ymd = (d = new Date()) => d.toISOString().slice(0, 10);
function addMedalsIfEarned(p: JuniorProgress): JuniorMedal[] {
  const have = new Set(p.medals.map((m) => m.id));
  const add: JuniorMedal[] = [];
  const push = (id: string, emoji: string, label: string) => {
    if (!have.has(id)) add.push({ id, emoji, label, awardedAt: new Date().toISOString() });
  };
  if (p.playedGames.length >= 1) push("first-game", "🎉", "Primeiro jogo!");
  if (p.playedGames.length >= 5) push("five-games", "🖐️", "5 jogos diferentes");
  if (p.playedGames.length >= 15) push("fifteen-games", "🏅", "15 jogos diferentes");
  if (p.totalSessions >= 10) push("ten-sessions", "🔁", "10 sessões");
  if (p.totalSessions >= 50) push("fifty-sessions", "🥇", "50 sessões");
  if (p.streak >= 3) push("streak-3", "🔥", "3 dias seguidos");
  if (p.streak >= 7) push("streak-7", "🔥🔥", "Semana completa");
  if (p.points >= 200) push("points-200", "💎", "200 pontos");
  if (p.points >= 1000) push("points-1000", "👑", "1000 pontos");
  return [...p.medals, ...add];
}

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
