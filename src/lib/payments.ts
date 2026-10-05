// Central de métodos de pagamento — o único sítio onde os dados reais de
// faturação precisam de ser trocados quando a cobrança arrancar em produção.
//
// ⚠️ ANTES DE ATIVAR COBRANÇAS REAIS:
//   1. Substituir `paypalMeUser` pelo username real do paypal.me da conta
//      PayPal Business do Kidoz (paypal.me/<username>).
//   2. Substituir `emailFaturacao` se o endereço oficial for outro.
//   3. IBAN/MB WAY NÃO são mostrados no site — pedidos por email/WhatsApp,
//      o que evita dados bancários desatualizados ou falsos em público.
//
// Estratégia sem backend: o checkout Stripe (cartão) ativa a subscrição
// automaticamente; PayPal e transferência são confirmados manualmente no
// mesmo dia útil — por isso a UI diz sempre a verdade sobre os prazos.

/** Países suportados na secção de pagamento (mesmo conjunto da calculadora). */
export type PaisPagId = "pt" | "mz" | "ao" | "cv" | "br";

export const PAYMENTS = {
  /** Username do paypal.me da conta PayPal Business (⚠️ trocar pelo real). */
  paypalMeUser: "kidozonline",
  /** Email de faturação/apoio a instituições. */
  emailFaturacao: "escolas@kidoz.online",
  /** Beneficiário que aparece na proposta e nos comprovativos. */
  beneficiario: "Kidoz Online",
} as const;

/** Preço por aluno/mês em EUR (deve refletir PRICE_PER_STUDENT de /escolas). */
export const PRECO_POR_ALUNO_EUR = 0.99;

/**
 * Plano anual: 10 meses pagos por 12 gozados (2 meses grátis).
 * Honestidade em primeiro lugar: o anual é pago numa única tranche via
 * PayPal/transferência/fatura — o checkout de cartão continua mensal.
 */
export const MESES_PAGOS_ANUAL = 10;

/** Total anual por aluno (0,99€ × 10 = 9,90€). Arredondado a cêntimos. */
export function totalAnualEur(alunos: number): number {
  const v = Math.max(1, Math.floor(alunos)) * PRECO_POR_ALUNO_EUR * MESES_PAGOS_ANUAL;
  return Math.round(v * 100) / 100;
}

/** Equivalente mensal do plano anual (total ÷ 12) — para o banner honesto. */
export function mensalEquivalenteAnualEur(alunos: number): number {
  const v = totalAnualEur(alunos) / 12;
  return Math.round(v * 100) / 100;
}

/**
 * Link paypal.me com o valor pré-preenchido em EUR.
 * Robusto: clampa o valor a [1, 100 000]€, arredonda a 2 casas e valida o
 * username ( PayPal.me só aceita letras, números, hífen e underscore ).
 */
export function paypalMeLink(valorEur: number): string {
  const seguro = Math.min(100000, Math.max(1, Math.round(valorEur * 100) / 100));
  const user = PAYMENTS.paypalMeUser.replace(/[^A-Za-z0-9_-]/g, "") || "kidozonline";
  return `https://paypal.me/${user}/${seguro.toFixed(2)}EUR`;
}

/**
 * Referência de pagamento estável por instituição (para transferência
 * bancária): KIDZ-XXXXX. A mesma escola gera sempre a mesma referência,
 * para o comprovativo ser fácil de conciliar.
 */
export function referenciaPagamento(escola: string): string {
  const base = escola
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  // djb2 simples e estável — suficiente para uma referência legível
  let h = 5381;
  for (let i = 0; i < base.length; i++) {
    h = ((h << 5) + h + base.charCodeAt(i)) >>> 0;
  }
  const suf = h.toString(36).toUpperCase().padStart(5, "0").slice(-5);
  return `KIDZ-${suf}`;
}

// Equivalente local do total mensal (câmbio de referência; cobrança em EUR).
// Mesmas taxas usadas na calculadora e na proposta — fontes únicas: 69 / 1000 / 110 / 6.
export const FX_PAG: Record<string, { nome: string; taxa: number; fmt: (v: number) => string }> = {
  mz: { nome: "meticais", taxa: 69, fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} MT` },
  ao: { nome: "kwanzas", taxa: 1000, fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} Kz` },
  cv: { nome: "escudos", taxa: 110, fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} Esc` },
  br: { nome: "reais", taxa: 6, fmt: (v) => `R$ ${v.toFixed(2).replace(".", ",")}` },
};

/** Normaliza o país vindo do localStorage/props — nunca rebenta com lixo. */
export function paisSeguro(pais: string | undefined): PaisPagId {
  return pais && (pais === "pt" || pais in FX_PAG) ? (pais as PaisPagId) : "pt";
}
