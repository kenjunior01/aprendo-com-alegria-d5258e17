// familyPricing.ts — A única fonte de verdade dos preços família (B2C).
//
// Decisão (out/2026): SÓ COBRANÇA MENSAL — sem planos anuais. Menos opções
// = decisão mais fácil para os pais; o Vitalício (pagamento único) continua
// como alternativa para quem odeia subscrições.
//
// Lição dos concorrentes (docs/estrategia-diferenciacao.md):
//   · Smartick 55–99€/mês POR CRIANÇA (só matemática)
//   · Lingokids ≈13€/mês · ABCmouse ≈14€/mês (por criança)
// O Kidoz Família inclui ATÉ 4 CRIANÇAS no mesmo plano — por isso continua a
// ser imbatível em custo por criança (≈2,00€/criança/mês), sem parecer
// "barato = fraco" (preço baixo demais destrói perceção de valor em educação).
//
// ⚠️ Se mudares valores aqui, os textos de marketing em ParentPremiumCard,
// PremiumUpsell, PremiumStatusPanel, MerchPerks e index.tsx acompanham.
// O backend PayPal (paypal.functions.ts) e os preços no dashboard Stripe
// (lookup keys familia_mensal / vitalicio_lifetime) têm de refletir exatamente
// estes valores — nunca mostrar um preço e cobrar outro.

export const FAMILIA = {
  /** Plano mensal sem fidelização — o único plano recorrente. */
  mensal: 7.99,
  /** Vitalício — pagamento único, preço de fundador. */
  vitalicio: 99.99,
} as const;

/** Formata EUR à portuguesa (vírgula decimal). */
export function eurFam(v: number): string {
  return v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}
