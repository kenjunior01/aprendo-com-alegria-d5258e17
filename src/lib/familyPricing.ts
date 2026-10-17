// familyPricing.ts — A única fonte de verdade dos preços família (B2C).
//
// Decisão (out/2026, revisão): MENSAL + ANUAL — o anual substitui o vitalício.
// 59,99€/ano ≈ 5,00€/mês (poupa 37% face ao mensal). Menos opções = decisão
// mais fácil; quem não quer subscrição recorrente paga o ano à frente.
//
// Lição dos concorrentes (docs/estrategia-diferenciacao.md):
//   · Smartick 55–99€/mês POR CRIANÇA (só matemática)
//   · Lingokids ≈13€/mês · ABCmouse ≈14€/mês (por criança)
// O Kidoz Família inclui ATÉ 4 CRIANÇAS no mesmo plano — no anual fica em
// ≈1,25€/criança/mês, imbatível em custo por criança.
//
// ⚠️ Se mudares valores aqui, os textos de marketing em ParentPremiumCard,
// PremiumUpsell, PremiumStatusPanel, MerchPerks e index.tsx acompanham.
// O backend PayPal (paypal.functions.ts) tem de refletir exatamente estes
// valores — nunca mostrar um preço e cobrar outro. O anual é cobrado como
// PayPal one-time (366 dias de acesso) — plug-and-play, sem configuração
// extra no Stripe nem no dashboard PayPal.

export const FAMILIA = {
  /** Plano mensal sem fidelização. */
  mensal: 7.99,
  /** Plano anual — pagamento único por ano; equivale a 5,00€/mês (poupa 37%). */
  anual: 59.99,
} as const;

/** Equivalente mensal do plano anual (para badges "≈ 5,00€/mês"). */
export const ANUAL_EQUIV_MENSAL = Number((FAMILIA.anual / 12).toFixed(2));

/** Formata EUR à portuguesa (vírgula decimal). */
export function eurFam(v: number): string {
  return v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}
