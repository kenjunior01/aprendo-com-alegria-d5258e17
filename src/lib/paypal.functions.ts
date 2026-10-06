import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Planos pagos via PayPal (pagamento único; o PayPal aceita conta PayPal e cartão/banco como convidado).
const PLANS: Record<string, { amount: string; days: number | null; name: string }> = {
  familia_mensal: { amount: "4.99", days: 31, name: "Kidoz Família Mensal" },
  familia_anual: { amount: "39.99", days: 366, name: "Kidoz Família Anual" },
  vitalicio_lifetime: { amount: "79.99", days: null, name: "Kidoz Vitalício" },
};

async function getToken(): Promise<{ token: string; base: string }> {
  const id = process.env["PAYPAL_CLIENT_ID"];
  const secret = process.env["PAYPAL_CLIENT_SECRET"];
  if (!id || !secret) throw new Error("PayPal não configurado");
  const auth = btoa(`${id}:${secret}`);
  for (const base of ["https://api-m.paypal.com", "https://api-m.sandbox.paypal.com"]) {
    const r = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    if (r.ok) return { token: (await r.json()).access_token, base };
  }
  throw new Error("Credenciais PayPal inválidas");
}

export const createPaypalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string; returnUrl: string; cancelUrl: string }) => {
    if (!PLANS[d.planId]) throw new Error("Plano inválido");
    return d;
  })
  .handler(async ({ data, context }) => {
    const plan = PLANS[data.planId];
    const { token, base } = await getToken();
    const r = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: data.planId,
          custom_id: `${context.userId}|${data.planId}`,
          description: plan.name,
          amount: { currency_code: "EUR", value: plan.amount },
        }],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "Kidoz",
              locale: "pt-PT",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW",
              return_url: data.returnUrl,
              cancel_url: data.cancelUrl,
            },
          },
        },
      }),
    });
    const j = await r.json();
    if (!r.ok) { console.error("PayPal create", j); throw new Error("Não foi possível iniciar o PayPal"); }
    const link = (j.links ?? []).find((l: any) => l.rel === "payer-action" || l.rel === "approve");
    return { url: link?.href as string };
  });

export const capturePaypalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string; environment: "sandbox" | "live" }) => {
    if (!/^[A-Z0-9]+$/.test(d.orderId)) throw new Error("Pedido inválido");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { token, base } = await getToken();
    const r = await fetch(`${base}/v2/checkout/orders/${data.orderId}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    let j = await r.json();
    if (!r.ok && j?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") {
      const g = await fetch(`${base}/v2/checkout/orders/${data.orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      j = await g.json();
    } else if (!r.ok) { console.error("PayPal capture", j); throw new Error("Pagamento PayPal não concluído"); }
    if (j.status !== "COMPLETED") throw new Error("Pagamento ainda não concluído");
    const unit = j.purchase_units?.[0];
    const [uid, planId] = String(unit?.custom_id ?? unit?.payments?.captures?.[0]?.custom_id ?? "").split("|");
    const plan = PLANS[planId];
    const captured = unit?.payments?.captures?.[0]?.amount;
    if (uid !== context.userId || !plan || captured?.value !== plan.amount || captured?.currency_code !== "EUR") {
      throw new Error("Pagamento não corresponde ao plano");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date();
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: uid,
      stripe_subscription_id: `paypal_${data.orderId}`,
      stripe_customer_id: `paypal_${j.payer?.payer_id ?? "guest"}`,
      product_id: planId,
      price_id: planId,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: plan.days ? new Date(now.getTime() + plan.days * 86400000).toISOString() : null,
      environment: data.environment,
      updated_at: now.toISOString(),
    }, { onConflict: "stripe_subscription_id" });
    await supabaseAdmin.from("profiles").update({ is_premium: true }).eq("id", uid);
    return { ok: true, planId };
  });
