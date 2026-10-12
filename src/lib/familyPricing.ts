// familyPricing.ts — A única fonte de verdade dos preços família (B2C).
//
// Lição dos concorrentes (docs/estrategia-diferenciacao.md):
//   · Smartick 55–99€/mês POR CRIANÇA (só matemática)
//   · Lingokids ≈13€/mês · ABCmouse ≈14€/mês (por criança)
// O Kidoz Família inclui ATÉ 4 CRIANÇAS no mesmo plano — por isso continua a
// ser imbatível em custo por criança (1,25€/criança no anual), sem parecer
// "barato = fraco" (preço baixo demais destrói perceção de valor em educação).
//
// ⚠️ Se mudares valores aqui, os textos de marketing em ParentPremiumCard,
// PremiumUpsell, PremiumStatusPanel, MerchPerks e index.tsx acompanham.
// O backend PayPal (paypal.functions.ts) e os preços no dashboard Stripe
// (lookup keys familia_mensal / familia_anual / vitalicio_lifetime) têm de
// refletir exatamente estes valores — nunca mostrar um preço e cobrar outro.

export const FAMILIA = {
  /** Plano mensal sem fidelização. */
  mensal: 7.99,
  /** Plano anual (faturação única). */
  anual: 59.99,
  /** Vitalício — pagamento único, preço de fundador. */
  vitalicio: 99.99,
} as const;

/** Equivalente mensal do anual (59,99 ÷ 12 ≈ 5,00). */
export const MENSAL_EQUIV_ANUAL = 5.0;

/** Poupança % do anual face a 12× mensal (95,88 → 59,99). */
export const POUPA_ANUAL_PCT = 37;

/** Formata EUR à portuguesa (vírgula decimal). */
export function eurFam(v: number): string {
  return v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}
