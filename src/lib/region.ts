// Deteta a região do utilizador a partir do navigator.language e timezone,
// e mapeia para um currículo/etiqueta apropriada.

export type RegionInfo = {
  code: string; // ISO country code
  flag: string;
  country: string; // nome localizado
  curriculum: string; // ex: "1.º ciclo", "Ensino Fundamental I"
  language: "pt" | "en";
};

const REGIONS: Record<string, RegionInfo> = {
  PT: { code: "PT", flag: "🇵🇹", country: "Portugal", curriculum: "1.º ciclo", language: "pt" },
  BR: { code: "BR", flag: "🇧🇷", country: "Brasil", curriculum: "Ensino Fundamental I", language: "pt" },
  MZ: { code: "MZ", flag: "🇲🇿", country: "Moçambique", curriculum: "Ensino Primário", language: "pt" },
  AO: { code: "AO", flag: "🇦🇴", country: "Angola", curriculum: "Ensino Primário", language: "pt" },
  CV: { code: "CV", flag: "🇨🇻", country: "Cabo Verde", curriculum: "Ensino Básico", language: "pt" },
  US: { code: "US", flag: "🇺🇸", country: "the USA", curriculum: "Elementary School", language: "en" },
  ZA: { code: "ZA", flag: "🇿🇦", country: "South Africa", curriculum: "Foundation Phase", language: "en" },
  GB: { code: "GB", flag: "🇬🇧", country: "the UK", curriculum: "Key Stage 1-2", language: "en" },
};

const TZ_TO_COUNTRY: Record<string, string> = {
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

  // 1) Tenta extrair região do navigator.language (ex: pt-BR)
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const l of langs) {
    if (!l) continue;
    const m = l.match(/[-_]([A-Za-z]{2})/);
    if (m) {
      const cc = m[1].toUpperCase();
      if (REGIONS[cc]) return REGIONS[cc];
    }
  }

  // 2) Fallback: timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cc = TZ_TO_COUNTRY[tz];
    if (cc && REGIONS[cc]) return REGIONS[cc];
    // País começa por "America/" → assumir BR para falantes pt
    if (tz?.startsWith("America/") && langs.some((l) => l?.toLowerCase().startsWith("pt"))) {
      return REGIONS.BR;
    }
  } catch {
    /* noop */
  }

  // 3) Fallback final: pt → Portugal, en → US
  if (langs.some((l) => l?.toLowerCase().startsWith("en"))) return REGIONS.US;
  return DEFAULT;
}

export function regionBadgeText(r: RegionInfo): string {
  if (r.language === "en") return `${r.flag} Made for ${r.curriculum} in ${r.country}`;
  const prep = r.country === "Moçambique" || r.country === "Angola" || r.country === "Cabo Verde" ? "em" : "em";
  return `${r.flag} Feito para o ${r.curriculum} ${prep} ${r.country}`;
}
