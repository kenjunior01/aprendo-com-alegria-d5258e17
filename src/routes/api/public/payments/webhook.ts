import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// Sync the profiles.is_premium flag based on current subscription state.
// Active/trialing/past_due (within period) and canceled-but-still-in-period count as premium.
async function syncPremiumFlag(userId: string, env: StripeEnv) {
  const sb = getSupabase() as any;
  const { data } = await sb.rpc("has_active_subscription", { user_uuid: userId, check_env: env });
  const isPremium = data === true;
  await sb.from("profiles").update({ is_premium: isPremium, updated_at: new Date().toISOString() }).eq("id", userId);
}

async function handleSubscriptionCreated(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) { console.error("No userId in subscription metadata"); return; }

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await (getSupabase() as any).from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
  await syncPremiumFlag(userId, env);
}

async function handleSubscriptionUpdated(subscription: any, env: StripeEnv) {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.metadata?.lovable_external_id || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await (getSupabase() as any)
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
  const userId = subscription.metadata?.userId;
  if (userId) await syncPremiumFlag(userId, env);
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await (getSupabase() as any)
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
  const userId = subscription.metadata?.userId;
  if (userId) await syncPremiumFlag(userId, env);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // For one-time payments (lifetime), upsert a synthetic "subscription" row marking lifetime access.
  if (session.mode !== "payment") return;
  const userId = session.metadata?.userId;
  if (!userId) return;
  const priceId = session.metadata?.priceId || "vitalicio_lifetime";
  await (getSupabase() as any).from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: `lifetime_${session.id}`,
      stripe_customer_id: session.customer || "lifetime",
      product_id: "alegria_vitalicio",
      price_id: priceId,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
  await syncPremiumFlag(userId, env);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object, env); break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object, env); break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env); break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env); break;
    default:
      // Unhandled Stripe event type
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
