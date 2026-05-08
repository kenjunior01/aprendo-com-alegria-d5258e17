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
import { ArrowLeft, Check, Sparkles, Building2, GraduationCap, Crown } from "lucide-react";

export const Route = createFileRoute("/creches")({
  head: () => ({
    meta: [
      { title: "Kidoz para Creches e Jardins de Infância (2-5 anos)" },
      {
        name: "description",
        content:
          "Kidoz Júnior para creches e jardins de infância. Planos Básico, Premium e Institucional com gestão de turmas, portefólios digitais e Kidoz Pro.",
      },
      { property: "og:title", content: "Kidoz Creches — Kidoz Júnior + Kidoz Pro" },
      { property: "og:description", content: "Solução B2B para creches e jardins de infância. Planos a partir de 29€/mês." },
    ],
  }),
  component: CrechesPage,
});

interface Tier {
  id: string;
  priceId: string;
  name: string;
  price: string;
  audience: string;
  icon: typeof Building2;
  highlight?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "basico",
    priceId: "creche_basico_mensal",
    name: "Básico",
    price: "29€/mês",
    audience: "Pequenas creches (até 30 alunos)",
    icon: Building2,
    features: [
      "Acesso completo à Kidoz Júnior (2-5 anos)",
      "Gestão básica de turmas",
      "Relatórios simples de progresso",
      "Suporte por email",
    ],
  },
  {
    id: "premium",
    priceId: "creche_premium_mensal",
    name: "Premium",
    price: "79€/mês",
    audience: "Jardins de infância médios e grandes",
    icon: GraduationCap,
    highlight: true,
    features: [
      "Tudo do Básico",
      "Portefólios digitais (fotos, vídeos, observações)",
      "Comunicação direta com pais",
      "Planos de aula e biblioteca pedagógica",
      "Painel Kidoz Pro completo",
    ],
  },
  {
    id: "institucional",
    priceId: "creche_institucional_mensal",
    name: "Institucional",
    price: "199€/mês",
    audience: "Redes de escolas e franchising",
    icon: Crown,
    features: [
      "Tudo do Premium",
      "Suporte dedicado (gestor de conta)",
      "Formação para educadores incluída",
      "Personalização visual (logo, cores)",
      "Multi-escola e relatórios consolidados",
    ],
  },
];

function CrechesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);

  useEffect(() => { setProfile(loadProfile()); }, []);

  const subscribe = (tier: Tier) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    setCheckoutTier(tier);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <PaymentTestModeBanner />
      {profile && <TopBar profile={profile} />}

      <main className="mx-auto max-w-6xl px-5 py-6 sm:py-10">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-secondary/40 via-accent/30 to-primary/20 p-6 sm:p-10 text-center"
        >
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Kidoz para Creches</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Kidoz Júnior (2-5 anos) integrado no teu jardim de infância, com painel Kidoz Pro
            para educadores e portal seguro de comunicação com as famílias.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-card px-3 py-1 font-display">🌱 Jardim dos Primeiros Passos</span>
            <span className="rounded-full bg-card px-3 py-1 font-display">🏝️ Ilha das Descobertas</span>
            <span className="rounded-full bg-card px-3 py-1 font-display">🎓 Vale da Preparação Escolar</span>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className={`card-chunky relative flex flex-col rounded-3xl border-2 bg-card p-6 ${
                  t.highlight ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 font-display text-xs text-primary-foreground">
                    Mais escolhido
                  </span>
                )}
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-display text-2xl">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.audience}</p>
                <p className="mt-3 font-display text-3xl text-primary">{t.price}</p>

                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <ChunkyButton
                  onClick={() => subscribe(t)}
                  tone={t.highlight ? "primary" : "secondary"}
                  className="mt-5 min-h-[56px] w-full"
                >
                  Subscrever {t.name}
                </ChunkyButton>
              </div>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm">
          Precisas de uma proposta personalizada para uma rede de jardins?{" "}
          <a href="mailto:creches@kidoz.online" className="font-display text-primary underline">
            creches@kidoz.online
          </a>
        </section>

        <section className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Procuras o plano para escolas do 1.º ciclo?{" "}
            <Link to="/escolas" className="font-display text-primary underline">
              Ver Plano Escolas (0,99€/aluno)
            </Link>
          </p>
        </section>
      </main>

      <Dialog open={!!checkoutTier} onOpenChange={(o) => !o && setCheckoutTier(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscrição Kidoz Creches — {checkoutTier?.name}</DialogTitle>
          </DialogHeader>
          {user && checkoutTier && (
            <StripeEmbeddedCheckout
              priceId={checkoutTier.priceId}
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
