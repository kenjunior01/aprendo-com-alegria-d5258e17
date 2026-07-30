import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: {
    priceId: string;
    quantity?: number;
    customerEmail?: string;
    userId?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    return data;
  })
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);

    const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: data.quantity || 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      // IVA automático por país do comprador (+0,5%/transação)
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      // Necessário para automatic_tax funcionar com Checkout
      customer_update: data.customerEmail ? undefined : { address: "auto", name: "auto" },
      ...(data.customerEmail && { customer_email: data.customerEmail }),
      ...(data.userId && {
        metadata: { userId: data.userId },
        ...(isRecurring && { subscription_data: { metadata: { userId: data.userId } } }),
      }),
    } as any);

    return session.client_secret;
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subError || !sub?.stripe_customer_id) throw new Error("No subscription found");

    const stripe = createStripeClient(data.environment);
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id as string,
      ...(data.returnUrl && { return_url: data.returnUrl }),
    });
    return portal.url;
  });

export type PurchaseRecord = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  receiptUrl: string | null;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  kind: "invoice" | "charge";
};

export const listUserInvoices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PurchaseRecord[]> => {
    const { supabase, userId } = context;

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("environment", data.environment);

    const customers = Array.from(
      new Set((subs ?? []).map((s: any) => s.stripe_customer_id).filter((c: string) => c && c !== "lifetime"))
    );
    if (!customers.length) return [];

    const stripe = createStripeClient(data.environment);
    const records: PurchaseRecord[] = [];

    for (const customer of customers) {
      const [invoices, charges] = await Promise.all([
        stripe.invoices.list({ customer: customer as string, limit: 50 }),
        stripe.charges.list({ customer: customer as string, limit: 50 }),
      ]);

      for (const inv of invoices.data) {
        records.push({
          id: inv.id ?? `inv_${inv.number}`,
          date: new Date((inv.created ?? 0) * 1000).toISOString(),
          description: inv.lines?.data?.[0]?.description || inv.description || "Subscrição Alegria",
          amount: (inv.amount_paid ?? inv.amount_due ?? 0) / 100,
          currency: (inv.currency || "eur").toUpperCase(),
          status: inv.status || "unknown",
          receiptUrl: null,
          invoiceUrl: inv.hosted_invoice_url || null,
          invoicePdf: inv.invoice_pdf || null,
          kind: "invoice",
        });
      }

      // Charges sem invoice (pagamentos one-time, p.ex. vitalício)
      for (const ch of charges.data) {
        if ((ch as any).invoice) continue; // já contabilizado acima
        records.push({
          id: ch.id,
          date: new Date(ch.created * 1000).toISOString(),
          description: ch.description || "Pagamento Alegria",
          amount: (ch.amount_captured ?? ch.amount) / 100,
          currency: (ch.currency || "eur").toUpperCase(),
          status: ch.status,
          receiptUrl: ch.receipt_url || null,
          invoiceUrl: null,
          invoicePdf: null,
          kind: "charge",
        });
      }
    }

    records.sort((a, b) => (a.date < b.date ? 1 : -1));
    return records;
  });

// Aplica tax_code nos produtos para que automatic_tax funcione corretamente.
// Correr 1x via /pais (botão admin) ou invoke-server-function. Idempotente.
export const setupProductTaxCodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    // txcd_10103001 = Software as a Service (SaaS) — adequado para subscrição educativa digital
    const TAX_CODE = "txcd_10103001";

    const products = await stripe.products.list({ limit: 100 });
    const updated: string[] = [];
    for (const p of products.data) {
      if ((p as any).tax_code === TAX_CODE) continue;
      await stripe.products.update(p.id, { tax_code: TAX_CODE });
      updated.push(p.name);
    }
    return { updated, total: products.data.length };
  });
