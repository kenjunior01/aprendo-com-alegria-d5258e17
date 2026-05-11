import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";

export interface SubscriptionRow {
  id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  environment: string;
  created_at: string;
}

function computeActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const future = end === null || end > Date.now();
  if (["active", "trialing"].includes(sub.status) && future) return true;
  if (sub.status === "canceled" && end && end > Date.now()) return true;
  // 7-day grace period for failed payments
  if (["past_due", "unpaid"].includes(sub.status) && end && end > Date.now() - 7 * 24 * 60 * 60 * 1000) return true;
  return false;
}

export function useSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [trialUntil, setTrialUntil] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refetch = useCallback(async () => {
    if (!user) { setSub(null); setTrialUntil(null); setIsAdmin(false); setLoading(false); return; }
    const env = getStripeEnvironment();
    const [subRes, profileRes, roleRes] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("environment", env).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("profiles").select("trial_until").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
    ]);
    setSub((subRes.data as unknown as SubscriptionRow) ?? null);
    setTrialUntil((profileRes.data as any)?.trial_until ?? null);
    setIsAdmin(!!roleRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
    if (!user) return;
    const channel = supabase
      .channel(`subscriptions:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  return { subscription: sub, isActive: computeActive(sub), loading, refetch };
}
