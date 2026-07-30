// Alegria Júnior — autocolantes e celebrações por jogo
import { getActiveJuniorChildId } from "./junior";

export interface JuniorSticker {
  id: string;        // = gameId
  emoji: string;
  label: string;
  cheer: string;     // frase do mascote
}

export const STICKERS: Record<string, JuniorSticker> = {
  "jardim-cores":      { id: "jardim-cores",      emoji: "🌸", label: "Mestre das Cores",     cheer: "Que jardim colorido!" },
  "orquestra-animais": { id: "orquestra-animais", emoji: "🐮", label: "Maestro dos Animais",  cheer: "A tua orquestra é mágica!" },
  "conta-patinhos":    { id: "conta-patinhos",    emoji: "🦆", label: "Conta-Patinhos",       cheer: "1, 2, 3… brilhante!" },
  "bolhas-sabao":      { id: "bolhas-sabao",      emoji: "🫧", label: "Caça-Bolhas",          cheer: "Pop pop pop! Que reflexos!" },
  "meu-corpo":         { id: "meu-corpo",         emoji: "👶", label: "Sabichão do Corpo",    cheer: "Já conheces o teu corpo!" },
  "rotinas-kido":      { id: "rotinas-kido",      emoji: "🪥", label: "Herói das Rotinas",    cheer: "Que organização!" },
  "memoria-animais":   { id: "memoria-animais",   emoji: "🧠", label: "Memória de Elefante",  cheer: "Lembraste-te de tudo!" },
  "letra-aventura":    { id: "letra-aventura",    emoji: "🔤", label: "Caça-Letras",          cheer: "Já lês como um crescido!" },
  "formas-geo":        { id: "formas-geo",        emoji: "🔺", label: "Mestre das Formas",    cheer: "Encaixaste tudo!" },
  "frutas-mercado":    { id: "frutas-mercado",    emoji: "🥭", label: "Frutarista",           cheer: "Que mercado delicioso!" },
  "livro-magico":      { id: "livro-magico",      emoji: "📖", label: "Contador de Histórias", cheer: "Que história incrível!" },
  "soletrar":          { id: "soletrar",          emoji: "✏️", label: "Pequeno Escritor",     cheer: "Já formas palavras!" },
  "matematica-magica": { id: "matematica-magica", emoji: "➕", label: "Mago dos Números",     cheer: "Matemática mágica!" },
  "pequeno-cientista": { id: "pequeno-cientista", emoji: "🧪", label: "Cientista Curioso",    cheer: "Descobriste algo novo!" },
  "relogio-kido":      { id: "relogio-kido",      emoji: "⏰", label: "Senhor do Tempo",      cheer: "Tic-tac perfeito!" },
  "mapa-palop":        { id: "mapa-palop",        emoji: "🌍", label: "Pequeno Viajante",     cheer: "Conheces o mundo!" },
  "pinta-desenho":     { id: "pinta-desenho",     emoji: "🎨", label: "Artista do Alegria",     cheer: "Que obra de arte!" },
  "eco-som":           { id: "eco-som",           emoji: "🎵", label: "Ouvido Mágico",        cheer: "Música nos ouvidos!" },
  "jardim-magico":     { id: "jardim-magico",     emoji: "🌷", label: "Jardineiro Mágico",    cheer: "As tuas plantas brilham!" },
  "puzzle-kido":       { id: "puzzle-kido",       emoji: "🧩", label: "Mestre dos Puzzles",   cheer: "Encaixaste tudo certinho!" },
  "caca-tesouro":      { id: "caca-tesouro",      emoji: "💎", label: "Caçador de Tesouros",  cheer: "Achaste o tesouro!" },
  "estacoes-ano":      { id: "estacoes-ano",      emoji: "🍂", label: "Amigo da Natureza",    cheer: "As estações dançam contigo!" },
  "emocoes-kido":      { id: "emocoes-kido",      emoji: "😊", label: "Coração Sentido",      cheer: "Que coração grande!" },
};

const STICKER_KEY = (childId: string) => `alegria-junior-stickers::${childId}`;

const isBrowser = () => typeof window !== "undefined";

export function loadStickers(childId?: string | null): string[] {
  if (!isBrowser()) return [];
  const id = childId ?? getActiveJuniorChildId();
  if (!id) return [];
  try {
    const raw = localStorage.getItem(STICKER_KEY(id));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function grantSticker(gameId: string, childId?: string | null): { granted: boolean; sticker: JuniorSticker | null } {
  const sticker = STICKERS[gameId] ?? null;
  if (!sticker) return { granted: false, sticker: null };
  const id = childId ?? getActiveJuniorChildId();
  if (!id || !isBrowser()) return { granted: false, sticker };
  const list = loadStickers(id);
  if (list.includes(gameId)) return { granted: false, sticker };
  const next = [gameId, ...list];
  localStorage.setItem(STICKER_KEY(id), JSON.stringify(next));
  return { granted: true, sticker };
}

// Fala simples — TTS do browser, voz pt se possível
export function juniorSpeak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-PT";
    u.rate = 0.95;
    u.pitch = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}
