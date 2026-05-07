import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadProfile, type Profile } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { ArrowLeft, Check, Crown, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Subscrição Kidoz Premium — desde 3,33€/mês" },
      { name: "description", content: "Acesso ilimitado a todas as disciplinas, Mocha IA, modo família e relatórios. Planos a partir de 3,33€/mês." },
    ],
  }),
  component: PremiumPage,
});

interface Plan {
  priceId: string;
  badge?: string;
  name: string;
  price: string;
  priceLabel: string;
  highlight?: boolean;
  perks: string[];
  cta: string;
  oneTime?: boolean;
}

const PLANS: Plan[] = [
  {
    priceId: "familia_mensal",
    name: "Família Mensal",
    price: "4,99€",
    priceLabel: "/mês",
    perks: [
      "Acesso ilimitado a todas as disciplinas",
      "Tutor Mocha IA com explicações detalhadas",
      "Modo família — até 4 crianças",
      "Relatórios semanais para pais",
      "Sem anúncios",
    ],
    cta: "Começar mensal",
  },
  {
    priceId: "familia_anual",
    badge: "Poupa 33%",
    name: "Família Anual",
    price: "39,99€",
    priceLabel: "/ano (≈3,33€/mês)",
    highlight: true,
    perks: [
      "Tudo do plano mensal",
      "Poupança equivalente a 4 meses grátis",
      "Acesso prioritário a novos conteúdos",
      "Faturação anual única",
    ],
    cta: "Escolher anual",
  },
  {
    priceId: "vitalicio_lifetime",
    badge: "Lançamento",
    name: "Vitalício",
    price: "79,99€",
    priceLabel: "uma vez · oferta limitada",
    perks: [
      "Acesso vitalício a tudo no Kidoz",
      "Para os primeiros early-adopters",
      "Sem renovações nem cobranças futuras",
      "Inclui atualizações futuras",
    ],
    cta: "Ser vitalício",
    oneTime: true,
  },
];

function PremiumPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) { navigate({ to: "/comecar" }); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const handleSubscribe = (priceId: string) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    setCheckoutPriceId(priceId);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <PaymentTestModeBanner />
      <TopBar profile={profile} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Link to="/perfil" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Perfil
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/30 p-6 sm:p-8 text-center"
        >
          <Crown className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Kidoz Premium</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Mais aventura, mais aprendizagem, mais magia. Sem anúncios. Sem limites.
          </p>
          {isActive && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/20 px-4 py-1.5 font-display text-sm text-success">
              <Sparkles className="h-4 w-4" /> Premium ativo
            </div>
          )}
        </motion.section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = isActive && subscription?.price_id === plan.priceId;
            return (
              <motion.div
                key={plan.priceId}
                whileHover={{ y: -4 }}
                className={`card-chunky relative flex flex-col rounded-3xl border-2 p-5 sm:p-6 ${
                  plan.highlight ? "border-primary bg-card shadow-elegant" : "border-border bg-card/80"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 font-display text-[10px] uppercase tracking-wider text-primary-foreground">
                    {plan.badge}
                  </span>
                )}
                <p className="font-display text-xl">{plan.name}</p>
                <p className="mt-2">
                  <span className="font-display text-3xl">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">{plan.priceLabel}</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <ChunkyButton tone="ghost" disabled className="w-full opacity-70">
                      <Star className="mr-1 inline h-4 w-4" /> Plano atual
                    </ChunkyButton>
                  ) : (
                    <ChunkyButton onClick={() => handleSubscribe(plan.priceId)} className="w-full">
                      <Sparkles className="mr-1 inline h-4 w-4" /> {plan.cta}
                    </ChunkyButton>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          🔒 Pagamento seguro. IVA e impostos incluídos. Podes cancelar a qualquer momento.
        </p>
      </main>

      <Dialog open={!!checkoutPriceId} onOpenChange={(o) => !o && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar subscrição</DialogTitle>
          </DialogHeader>
          {checkoutPriceId && user && (
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={user.email ?? undefined}
              userId={user.id}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
