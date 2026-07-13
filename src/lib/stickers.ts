
export type StickerCategory = "fauna" | "monumentos" | "cultura";

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: StickerCategory;
  description: string;
  rarity: "comum" | "raro" | "lendario";
}

export const STICKERS: Sticker[] = [
  // Fauna
  { id: "s-dugongo", name: "Dugongo", emoji: "🧜", category: "fauna", rarity: "lendario", description: "O raro habitante das águas de Inhambane." },
  { id: "s-leao", name: "Leão", emoji: "🦁", category: "fauna", rarity: "raro", description: "O rei da Gorongosa." },
  { id: "s-elefante", name: "Elefante", emoji: "🐘", category: "fauna", rarity: "comum", description: "Gigante gentil das nossas savanas." },
  { id: "s-rinoceronte", name: "Rinoceronte", emoji: "🦏", category: "fauna", rarity: "raro", description: "Poderoso e protegido." },

  // Monumentos
  { id: "s-ilha-mz", name: "Ilha de Moçambique", emoji: "🏛️", category: "monumentos", rarity: "lendario", description: "Património Mundial da Humanidade." },
  { id: "s-fortaleza", name: "Fortaleza de Maputo", emoji: "🏰", category: "monumentos", rarity: "comum", description: "História viva na capital." },
  { id: "s-ponte", name: "Ponte Maputo-Katembe", emoji: "🌉", category: "monumentos", rarity: "comum", description: "A maior ponte suspensa de África." },

  // Cultura
  { id: "s-marrabenta", name: "Marrabenta", emoji: "🎸", category: "cultura", rarity: "raro", description: "O ritmo que faz Moçambique dançar." },
  { id: "s-timbila", name: "Timbila", emoji: "🎹", category: "cultura", rarity: "lendario", description: "Som ancestral de Inhambane." },
  { id: "s-capulana", name: "Capulana", emoji: "🧣", category: "cultura", rarity: "comum", description: "O pano colorido da nossa alma." },
];

export function getRandomSticker(): Sticker {
  const roll = Math.random();
  let pool = STICKERS;

  if (roll > 0.95) pool = STICKERS.filter(s => s.rarity === "lendario");
  else if (roll > 0.75) pool = STICKERS.filter(s => s.rarity === "raro");
  else pool = STICKERS.filter(s => s.rarity === "comum");

  if (pool.length === 0) pool = STICKERS;
  return pool[Math.floor(Math.random() * pool.length)];
}
