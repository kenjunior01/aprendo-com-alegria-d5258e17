// Personalização por Região (PT/BR/AO/MZ/CV + EN fallback).
// Inclui currículo local, vocabulário, exemplos culturais e helpers
// para a IA injetar contexto regional nos exercícios.

export type RegionCode = "PT" | "BR" | "MZ" | "AO" | "CV" | "US" | "ZA" | "GB";

export type RegionInfo = {
  code: RegionCode;
  flag: string;
  country: string;
  curriculum: string;
  language: "pt" | "en";
};

export const REGIONS: Record<RegionCode, RegionInfo> = {
  PT: { code: "PT", flag: "🇵🇹", country: "Portugal", curriculum: "1.º ciclo", language: "pt" },
  BR: { code: "BR", flag: "🇧🇷", country: "Brasil", curriculum: "Ensino Fundamental I", language: "pt" },
  MZ: { code: "MZ", flag: "🇲🇿", country: "Moçambique", curriculum: "Ensino Primário", language: "pt" },
  AO: { code: "AO", flag: "🇦🇴", country: "Angola", curriculum: "Ensino Primário", language: "pt" },
  CV: { code: "CV", flag: "🇨🇻", country: "Cabo Verde", curriculum: "Ensino Básico", language: "pt" },
  US: { code: "US", flag: "🇺🇸", country: "the USA", curriculum: "Elementary School", language: "en" },
  ZA: { code: "ZA", flag: "🇿🇦", country: "South Africa", curriculum: "Foundation Phase", language: "en" },
  GB: { code: "GB", flag: "🇬🇧", country: "the UK", curriculum: "Key Stage 1-2", language: "en" },
};

// Lista compacta para seletores na UI (focada em PALOP + EN).
export const REGION_SELECT: RegionCode[] = ["PT", "BR", "AO", "MZ", "CV", "US"];

const TZ_TO_COUNTRY: Record<string, RegionCode> = {
  "Europe/Lisbon": "PT",
  "Atlantic/Azores": "PT",
  "Atlantic/Madeira": "PT",
  "America/Sao_Paulo": "BR",
  "America/Bahia": "BR",
  "America/Fortaleza": "BR",
  "America/Manaus": "BR",
  "America/Recife": "BR",
  "Africa/Maputo": "MZ",
  "Africa/Luanda": "AO",
  "Atlantic/Cape_Verde": "CV",
  "Africa/Johannesburg": "ZA",
  "Europe/London": "GB",
};

const DEFAULT: RegionInfo = REGIONS.PT;

export function detectRegion(): RegionInfo {
  if (typeof navigator === "undefined") return DEFAULT;
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const l of langs) {
    if (!l) continue;
    const m = l.match(/[-_]([A-Za-z]{2})/);
    if (m) {
      const cc = m[1].toUpperCase() as RegionCode;
      if (REGIONS[cc]) return REGIONS[cc];
    }
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cc = TZ_TO_COUNTRY[tz];
    if (cc && REGIONS[cc]) return REGIONS[cc];
    if (tz?.startsWith("America/") && langs.some((l) => l?.toLowerCase().startsWith("pt"))) {
      return REGIONS.BR;
    }
  } catch {
    /* noop */
  }
  if (langs.some((l) => l?.toLowerCase().startsWith("en"))) return REGIONS.US;
  return DEFAULT;
}

export function regionBadgeText(r: RegionInfo): string {
  if (r.language === "en") return `${r.flag} Made for ${r.curriculum} in ${r.country}`;
  return `${r.flag} Feito para o ${r.curriculum} em ${r.country}`;
}

// ============ Vocabulário PT-PT vs PT-BR / PALOP ============
// Mapeamento simples de termos. Usado para reescrever prompts e exemplos.
type VocabMap = Record<string, string>; // termo PT-PT -> termo local

const VOCAB_BR: VocabMap = {
  comboio: "trem",
  autocarro: "ônibus",
  pequeno: "pequeno",
  pequeno_almoco: "café da manhã",
  fato: "terno",
  ginásio: "academia",
  rapaz: "menino",
  rapariga: "menina",
  telemóvel: "celular",
  casa_de_banho: "banheiro",
  fixe: "legal",
  bilhete: "ingresso",
  ecrã: "tela",
};

const VOCAB_AO: VocabMap = {
  rapaz: "miúdo",
  pequeno_almoco: "matabicho",
};

const VOCAB_MZ: VocabMap = {
  pequeno_almoco: "matabicho",
  autocarro: "machimbombo",
  estudar: "estudar",
  escola: "escola",
  aprender: "aprender",
  moçambique: "Moçambique",
};

const MOZAMBIQUE_FACTS = [
  "Moçambique fica na costa oriental da África! 🌍",
  "A bandeira de Moçambique é a única com uma arma moderna (AK-47)! 🇲🇿",
  "O Arquipélago das Quirimbas tem ilhas maravilhosas! 🏝️",
  "O Monte Namuli é a segunda montanha mais alta de Moçambique! ⛰️",
  "A Marrabenta é um estilo de música e dança muito popular! 💃",
  "A Ilha de Moçambique foi a primeira capital do país! 🏛️",
  "O Rio Zambeze é o maior rio que atravessa Moçambique! 🌊",
];

export function getMozambiqueFact() {
  return MOZAMBIQUE_FACTS[Math.floor(Math.random() * MOZAMBIQUE_FACTS.length)];
}

const VOCAB_CV: VocabMap = {
  // Mantém PT-PT na escrita formal; cabo-verdiano oral fica de fora desta camada.
};

export function vocabularyFor(region: RegionCode): VocabMap {
  switch (region) {
    case "BR": return VOCAB_BR;
    case "AO": return VOCAB_AO;
    case "MZ": return VOCAB_MZ;
    case "CV": return VOCAB_CV;
    default: return {};
  }
}

// Reescreve uma frase aplicando o dicionário (case-insensitive, palavra inteira).
export function localize(text: string, region: RegionCode): string {
  const vocab = vocabularyFor(region);
  if (!Object.keys(vocab).length) return text;
  let out = text;
  for (const [from, to] of Object.entries(vocab)) {
    if (from.includes("_")) continue; // só substitui palavras simples
    const re = new RegExp(`\\b${from}\\b`, "gi");
    out = out.replace(re, (m) => (m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to));
  }
  return out;
}

// ============ Exemplos culturais (Estudo do Meio) ============
export interface CulturalExample {
  landmark: string; // "Torre de Belém"
  city: string; // "Lisboa"
  capital: string;
  currency: string;
  river: string;
  holidays: string[]; // feriados marcantes
}

const CULTURE: Record<RegionCode, CulturalExample> = {
  PT: { landmark: "Torre de Belém", city: "Lisboa", capital: "Lisboa", currency: "Euro (€)", river: "Tejo", holidays: ["Dia de Portugal", "Carnaval", "Páscoa", "Natal"] },
  BR: { landmark: "Cristo Redentor", city: "Rio de Janeiro", capital: "Brasília", currency: "Real (R$)", river: "Amazonas", holidays: ["Carnaval", "Festa Junina", "Independência (7 set.)", "Natal"] },
  AO: { landmark: "Fortaleza de São Miguel", city: "Luanda", capital: "Luanda", currency: "Kwanza (Kz)", river: "Kwanza", holidays: ["Dia da Independência (11 nov.)", "Carnaval", "Páscoa", "Natal"] },
  MZ: { landmark: "Ilha de Moçambique", city: "Maputo", capital: "Maputo", currency: "Metical (MT)", river: "Zambeze", holidays: ["Dia da Independência (25 jun.)", "Dia da Mulher Moçambicana", "Páscoa", "Natal"] },
  CV: { landmark: "Cidade Velha", city: "Praia", capital: "Praia", currency: "Escudo cabo-verdiano", river: "Ribeira de Paúl", holidays: ["Dia da Independência (5 jul.)", "Carnaval de Mindelo", "Páscoa", "Natal"] },
  US: { landmark: "Statue of Liberty", city: "New York", capital: "Washington D.C.", currency: "US Dollar ($)", river: "Mississippi", holidays: ["Thanksgiving", "Independence Day (July 4)", "Christmas"] },
  ZA: { landmark: "Table Mountain", city: "Cape Town", capital: "Pretoria", currency: "Rand (R)", river: "Orange", holidays: ["Heritage Day", "Freedom Day", "Christmas"] },
  GB: { landmark: "Big Ben", city: "London", capital: "London", currency: "Pound (£)", river: "Thames", holidays: ["Bonfire Night", "Christmas", "Easter"] },
};

export function culturalExample(region: RegionCode): CulturalExample {
  return CULTURE[region] ?? CULTURE.PT;
}

// Frase-snippet para injetar no prompt do tutor IA.
export function regionalContextPrompt(region: RegionCode, interests: string[]): string {
  const c = culturalExample(region);
  const r = REGIONS[region] ?? DEFAULT;
  const interestStr = interests.length ? `Interesses da criança: ${interests.join(", ")}. Usa estes temas como contexto nos exemplos (ex: se gosta de dinossauros, faz problemas com T-Rex).` : "";
  return `País: ${r.country} (${r.curriculum}). Usa exemplos locais (ex: ${c.landmark} em ${c.city}, moeda ${c.currency}, rio ${c.river}). Vocabulário ${region === "BR" ? "pt-BR" : "pt-PT"}. ${interestStr}`.trim();
}
