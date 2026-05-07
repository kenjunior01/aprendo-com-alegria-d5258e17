import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, ExternalLink, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { ChunkyButton } from "@/components/ChunkyButton";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

const PLAN_LABELS: Record<string, string> = {
  familia_mensal: "Família Mensal",
  familia_anual: "Família Anual",
  vitalicio_lifetime: "Vitalício (Lançamento)",
};

export function PremiumStatusPanel() {
  const { subscription, isActive, loading } = useSubscription();
  const [busy, setBusy] = useState(false);

  const openPortal = async () => {
    setBusy(true);
    try {
      const url = await createPortalSession({
        data: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/perfil`,
        },
      });
      if (url) window.open(url, "_blank");
    } catch (e) {
      toast.error("Não foi possível abrir o portal de gestão.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  if (!isActive) {
    return (
      <section className="card-chunky rounded-3xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-accent/10 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Crown className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <h2 className="font-display text-xl">Desbloqueia o Kidoz Premium</h2>
            <p className="mt-1 text-sm text-muted-foreground">Acesso ilimitado, Mocha IA, modo família e relatórios. Desde 3,33€/mês.</p>
            <Link to="/premium" className="mt-3 inline-block">
              <ChunkyButton><Sparkles className="mr-1 inline h-4 w-4" /> Ver planos</ChunkyButton>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const planLabel = subscription ? (PLAN_LABELS[subscription.price_id] || subscription.price_id) : "Premium";
  const isLifetime = subscription?.price_id === "vitalicio_lifetime";
  const renewDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("pt-PT")
    : null;

  return (
    <section className="card-chunky rounded-3xl border-2 border-primary bg-gradient-to-br from-primary/10 via-secondary/15 to-accent/20 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Crown className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl">Premium ativo</h2>
            <span className="rounded-full bg-success/20 px-2 py-0.5 font-display text-[11px] uppercase text-success">
              {planLabel}
            </span>
          </div>
          {isLifetime ? (
            <p className="mt-1 text-sm text-muted-foreground">Acesso vitalício — sem renovações.</p>
          ) : renewDate && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription?.cancel_at_period_end ? "Termina a" : "Renova a"} {renewDate}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!isLifetime && (
              <ChunkyButton tone="secondary" onClick={openPortal} disabled={busy}>
                <ExternalLink className="mr-1 inline h-4 w-4" />
                {busy ? "A abrir…" : "Gerir / Cancelar"}
              </ChunkyButton>
            )}
            <Link to="/premium">
              <ChunkyButton tone="ghost">Ver planos</ChunkyButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
