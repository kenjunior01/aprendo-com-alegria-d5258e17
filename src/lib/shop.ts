// Catálogo de itens da loja (mirror do shop_items na BD).
// Usado para fallback offline e para tipagem.

export type ItemType = "hat" | "outfit" | "scene" | "badge";

export interface ShopItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  emoji: string;
  premium: boolean;
}

export const SHOP_FALLBACK: ShopItem[] = [
  { id: "hat-crown", name: "Coroa Real", type: "hat", price: 100, emoji: "👑", premium: false },
  { id: "hat-party", name: "Chapéu de Festa", type: "hat", price: 50, emoji: "🎉", premium: false },
  { id: "hat-wizard", name: "Chapéu de Mago", type: "hat", price: 150, emoji: "🧙", premium: false },
  { id: "hat-graduation", name: "Chapéu de Formatura", type: "hat", price: 200, emoji: "🎓", premium: false },
  { id: "hat-pirate", name: "Chapéu de Pirata", type: "hat", price: 120, emoji: "🏴‍☠️", premium: false },
  { id: "outfit-superhero", name: "Capa de Super-herói", type: "outfit", price: 250, emoji: "🦸", premium: false },
  { id: "outfit-scientist", name: "Bata de Cientista", type: "outfit", price: 200, emoji: "🥼", premium: false },
  { id: "outfit-astronaut", name: "Fato Astronauta", type: "outfit", price: 400, emoji: "🚀", premium: true },
  { id: "scene-beach", name: "Cenário Praia", type: "scene", price: 150, emoji: "🏖️", premium: false },
  { id: "scene-space", name: "Cenário Espaço", type: "scene", price: 300, emoji: "🌌", premium: false },
  { id: "scene-forest", name: "Cenário Floresta", type: "scene", price: 150, emoji: "🌳", premium: false },
  { id: "scene-castle", name: "Cenário Castelo", type: "scene", price: 350, emoji: "🏰", premium: true },
  { id: "badge-star", name: "Distintivo Estrela", type: "badge", price: 80, emoji: "⭐", premium: false },
  { id: "badge-fire", name: "Distintivo Fogo", type: "badge", price: 80, emoji: "🔥", premium: false },
  { id: "badge-rainbow", name: "Distintivo Arco-Íris", type: "badge", price: 100, emoji: "🌈", premium: false },
];

export const getItem = (id: string | null | undefined): ShopItem | undefined =>
  id ? SHOP_FALLBACK.find((i) => i.id === id) : undefined;

export const TYPE_LABEL: Record<ItemType, string> = {
  hat: "Chapéus",
  outfit: "Fatos",
  scene: "Cenários",
  badge: "Distintivos",
};
