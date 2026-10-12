// schoolPricing.ts — A única fonte de verdade dos preços institucionais.
// Substitui o antigo PRECO_POR_ALUNO_EUR fixo por tiers transparentes:
// quanto maior a escola, menor o preço por aluno — desconto automático,
// sem negociação escondida nem letra miúda (lição dos concorrentes:
// Smartick 55-99€/mês assusta; transparência total converte diretores).
//
// ⚠️ Se mudares valores aqui, os PDFs (proposta/certificado) e a calculadora
// de /escolas atualizam automaticamente — nada mais a editar.

export interface SchoolTier {
  id: string;
  /** Número mínimo de alunos (inclusive) deste tier. */
  min: number;
  /** Número máximo de alunos (inclusive). */
  max: number;
  /** Preço por aluno/mês em EUR (IVA incluído). */
  pricePerStudent: number;
  name: string;
  emoji: string;
  note: string;
}

/** Tiers oficiais — ordenados por min. Manter coerente com a proposta comercial. */
export const SCHOOL_TIERS: readonly SchoolTier[] = [
  {
    id: "turma",
    min: 20,
    max: 49,
    pricePerStudent: 0.99,
    name: "Turma & Escola",
    emoji: "🎒",
    note: "Para escolas a arrancar — tudo incluído, sem fidelização.",
  },
  {
    id: "plus",
    min: 50,
    max: 199,
    pricePerStudent: 0.79,
    name: "Escola Plus",
    emoji: "🏫",
    note: "Escolas a crescer — -20% automático em todo o painel.",
  },
  {
    id: "grande",
    min: 200,
    max: 499,
    pricePerStudent: 0.59,
    name: "Escola Grande",
    emoji: "🏛️",
    note: "Grandes escolas — -40% automático. O favorito dos agrupamentos.",
  },
  {
    id: "rede",
    min: 500,
    max: 20000,
    pricePerStudent: 0.45,
    name: "Rede & Município",
    emoji: "🌍",
    note: "Redes, municípios e grupos escolares — -55% e gestão dedicada.",
  },
] as const;

/** Preço por aluno/mês para N alunos (devolve o tier certo). */
export function precoPorAluno(alunos: number): number {
  const n = Math.max(1, Math.floor(alunos));
  for (const t of SCHOOL_TIERS) {
    if (n >= t.min && n <= t.max) return t.pricePerStudent;
  }
  // Abaixo do mínimo (20) ou acima do topo — usar o preço base de entrada.
  return SCHOOL_TIERS[0].pricePerStudent;
}

/** O tier aplicável a N alunos (ou undefined se abaixo do mínimo institucional). */
export function tierDe(alunos: number): SchoolTier | undefined {
  const n = Math.max(1, Math.floor(alunos));
  return SCHOOL_TIERS.find((t) => n >= t.min && n <= t.max);
}

/** Mínimo institucional (coerente com a calculadora de /escolas). */
export const MIN_ALUNOS_ESCOLA = 20;

/** Total mensal EUR para N alunos com o desconto automático do tier. */
export function totalMensalEur(alunos: number): number {
  const v = Math.max(1, Math.floor(alunos)) * precoPorAluno(alunos);
  return Math.round(v * 100) / 100;
}

/** Total anual EUR (10 meses pagos por 12 gozados — 2 meses grátis). */
export function totalAnualEur(alunos: number): number {
  const v = totalMensalEur(alunos) * 10;
  return Math.round(v * 100) / 100;
}

/** Mensal equivalente do anual (total ÷ 12) — para comparação honesta. */
export function mensalEquivalenteAnualEur(alunos: number): number {
  const v = totalAnualEur(alunos) / 12;
  return Math.round(v * 100) / 100;
}

/** Formata EUR à portuguesa (vírgula decimal). */
export function eur(v: number): string {
  return v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

/** Desconto % do tier dado face ao preço base (0,99€). */
export function descontoTier(pricePerStudent: number): number {
  const base = SCHOOL_TIERS[0].pricePerStudent;
  return Math.round((1 - pricePerStudent / base) * 100);
}
