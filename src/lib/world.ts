// Mundo Persistente — quarto virtual da criança
// Itens compráveis com Abracadinhos (coins) e dispostos numa grelha 8x6.

import { supabase } from "@/integrations/supabase/client";

export type WorldCategory = "movel" | "planta" | "decoracao" | "fundo" | "tapete";

export interface WorldItem {
  id: string;
  name: string;
  emoji: string;
  category: WorldCategory;
  price: number;
  size: { w: number; h: number }; // ocupação na grelha
}

export interface PlacedItem {
  itemId: string;
  x: number; // coluna 0..GRID_W-1
  y: number; // linha 0..GRID_H-1
  flip?: boolean;
}

export interface WorldState {
  placed: PlacedItem[];
  background?: string; // itemId de fundo
  rug?: string; // itemId de tapete
}

export const GRID_W = 8;
export const GRID_H = 6;

export const WORLD_CATALOG: WorldItem[] = [
  // Móveis
  { id: "cama", name: "Cama fofa", emoji: "🛏️", category: "movel", price: 60, size: { w: 2, h: 1 } },
  { id: "sofa", name: "Sofá", emoji: "🛋️", category: "movel", price: 80, size: { w: 2, h: 1 } },
  { id: "secretaria", name: "Secretária", emoji: "🪑", category: "movel", price: 40, size: { w: 1, h: 1 } },
  { id: "estante", name: "Estante de livros", emoji: "📚", category: "movel", price: 70, size: { w: 1, h: 1 } },
  { id: "mesa", name: "Mesa", emoji: "🍽️", category: "movel", price: 50, size: { w: 1, h: 1 } },
  { id: "tv", name: "Televisão", emoji: "📺", category: "movel", price: 90, size: { w: 1, h: 1 } },
  // Plantas
  { id: "planta1", name: "Cato", emoji: "🌵", category: "planta", price: 20, size: { w: 1, h: 1 } },
  { id: "planta2", name: "Vaso", emoji: "🪴", category: "planta", price: 25, size: { w: 1, h: 1 } },
  { id: "arvore", name: "Árvore", emoji: "🌳", category: "planta", price: 60, size: { w: 1, h: 1 } },
  { id: "flor", name: "Flor", emoji: "🌸", category: "planta", price: 15, size: { w: 1, h: 1 } },
  // Decoração
  { id: "candeeiro", name: "Candeeiro", emoji: "💡", category: "decoracao", price: 30, size: { w: 1, h: 1 } },
  { id: "quadro", name: "Quadro", emoji: "🖼️", category: "decoracao", price: 35, size: { w: 1, h: 1 } },
  { id: "relogio", name: "Relógio", emoji: "🕰️", category: "decoracao", price: 45, size: { w: 1, h: 1 } },
  { id: "bola", name: "Bola", emoji: "⚽", category: "decoracao", price: 20, size: { w: 1, h: 1 } },
  { id: "robot", name: "Robô", emoji: "🤖", category: "decoracao", price: 70, size: { w: 1, h: 1 } },
  { id: "balao", name: "Balão", emoji: "🎈", category: "decoracao", price: 10, size: { w: 1, h: 1 } },
  { id: "presente", name: "Presente", emoji: "🎁", category: "decoracao", price: 25, size: { w: 1, h: 1 } },
  // Fundos (não ocupam grelha)
  { id: "bg-day", name: "Fundo Dia", emoji: "☀️", category: "fundo", price: 0, size: { w: 0, h: 0 } },
  { id: "bg-night", name: "Fundo Noite", emoji: "🌙", category: "fundo", price: 100, size: { w: 0, h: 0 } },
  { id: "bg-space", name: "Fundo Espaço", emoji: "🚀", category: "fundo", price: 200, size: { w: 0, h: 0 } },
  { id: "bg-forest", name: "Fundo Floresta", emoji: "🌲", category: "fundo", price: 150, size: { w: 0, h: 0 } },
  // Tapetes
  { id: "rug-red", name: "Tapete Vermelho", emoji: "🟥", category: "tapete", price: 50, size: { w: 0, h: 0 } },
  { id: "rug-blue", name: "Tapete Azul", emoji: "🟦", category: "tapete", price: 50, size: { w: 0, h: 0 } },
  { id: "rug-green", name: "Tapete Verde", emoji: "🟩", category: "tapete", price: 50, size: { w: 0, h: 0 } },
];

export const defaultWorldState = (): WorldState => ({
  placed: [],
  background: "bg-day",
});

export function getWorldItem(id: string): WorldItem | undefined {
  return WORLD_CATALOG.find((i) => i.id === id);
}

export function backgroundClass(bgId?: string): string {
  switch (bgId) {
    case "bg-night":
      return "bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900";
    case "bg-space":
      return "bg-gradient-to-b from-black via-indigo-950 to-purple-950";
    case "bg-forest":
      return "bg-gradient-to-b from-emerald-700 via-emerald-500 to-emerald-300";
    case "bg-day":
    default:
      return "bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100";
  }
}

export function rugColor(rugId?: string): string {
  switch (rugId) {
    case "rug-red":
      return "bg-red-400/60";
    case "rug-blue":
      return "bg-blue-400/60";
    case "rug-green":
      return "bg-green-400/60";
    default:
      return "";
  }
}

// Verifica se uma posição cabe na grelha sem sobrepor outros itens.
export function canPlace(state: WorldState, item: WorldItem, x: number, y: number, ignoreIndex = -1): boolean {
  if (x < 0 || y < 0 || x + item.size.w > GRID_W || y + item.size.h > GRID_H) return false;
  for (let i = 0; i < state.placed.length; i++) {
    if (i === ignoreIndex) continue;
    const p = state.placed[i];
    const it = getWorldItem(p.itemId);
    if (!it) continue;
    const overlap =
      x < p.x + it.size.w && x + item.size.w > p.x && y < p.y + it.size.h && y + item.size.h > p.y;
    if (overlap) return false;
  }
  return true;
}

// ============ Cloud sync (world_state column on profiles) ============

export async function pullWorldState(): Promise<WorldState | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("world_state")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data) return null;
    const ws = (data as { world_state?: WorldState }).world_state;
    if (!ws || !Array.isArray(ws.placed)) return defaultWorldState();
    return { ...defaultWorldState(), ...ws };
  } catch {
    return null;
  }
}

export async function pushWorldState(state: WorldState): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ world_state: state as unknown as Record<string, unknown> })
      .eq("id", user.id);
  } catch {
    /* ignore offline */
  }
}

const LOCAL_KEY = "kidoz-world-v1";

export function loadLocalWorld(): WorldState {
  if (typeof window === "undefined") return defaultWorldState();
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultWorldState();
    return { ...defaultWorldState(), ...JSON.parse(raw) };
  } catch {
    return defaultWorldState();
  }
}

export function saveLocalWorld(state: WorldState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  void pushWorldState(state);
}
