import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { loadProfile, type Profile } from "@/lib/storage";
import { PLANS, startTrialPremium, cancelPremium, isPremium } from "@/lib/premium";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Família Premium — Lusis" },
      { name: "description", content: "Desbloqueia Realidade Aumentada, tutor IA, relatórios semanais e itens exclusivos." },
    ],
  }),
  component: PremiumPage,
});

function PremiumPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;
  const premium = isPremium(profile);

  const activate = () => {
    setProfile(startTrialPremium());
    setActivated(true);
    setTimeout(() => setActivated(false), 3000);
  };
  const cancel = () => {
    if (confirm("Cancelar a assinatura premium? (esta é uma demonstração)")) {
      setProfile(cancelPremium());
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Link to="/perfil" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Perfil
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/30 p-6 sm:p-8 text-center"
        >
          <Crown className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Lusis Família Premium</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Mais aventura, mais aprendizagem, mais magia. Sem anúncios. Sem limites.
          </p>
          {premium && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/20 px-4 py-1.5 font-display text-sm text-success">
              <Sparkles className="h-4 w-4" /> Premium ativo
            </div>
          )}
        </motion.section>

        {activated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl bg-success/15 px-4 py-3 text-center font-display text-success"
          >
            🎉 Bem-vindo ao Premium! Demonstração ativa — sem cobrança real.
          </motion.div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent =
              (plan.id === "free" && !premium) || (plan.id === "family" && premium);
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`card-chunky relative flex flex-col rounded-3xl border-2 p-5 sm:p-6 ${
                  plan.highlight
                    ? "border-primary bg-card shadow-elegant"
                    : "border-border bg-card/80"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 font-display text-[10px] uppercase tracking-wider text-primary-foreground">
                    Mais popular
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
                  {plan.id === "family" ? (
                    premium ? (
                      <ChunkyButton tone="ghost" onClick={cancel} className="w-full">Cancelar Premium</ChunkyButton>
                    ) : (
                      <ChunkyButton onClick={activate} className="w-full">
                        <Sparkles className="mr-1 inline h-4 w-4" /> {plan.cta}
                      </ChunkyButton>
                    )
                  ) : plan.id === "school" ? (
                    <a href="mailto:escolas@lusis.app" className="block">
                      <ChunkyButton tone="secondary" className="w-full">{plan.cta}</ChunkyButton>
                    </a>
                  ) : (
                    <ChunkyButton tone="ghost" disabled className="w-full opacity-70">
                      {isCurrent ? "Plano atual" : plan.cta}
                    </ChunkyButton>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          🔒 Demonstração — pagamentos ainda não estão ativos. Sem cobranças reais.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
