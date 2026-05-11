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
import { ArrowLeft, Brain, Check, Crown, Gamepad2, Globe2, GraduationCap, Heart, Infinity as InfinityIcon, Palette, Sparkles, Star, Trophy, Users, Zap } from "lucide-react";

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
      "Tudo grátis incluído",
      "♾️ Desafios Infinitos (todos os níveis)",
      "🤖 Tutor Mocha IA com explicações detalhadas",
      "🥽 Realidade Aumentada com mascotes",
      "👨‍👩‍👧 Modo família — até 4 crianças",
      "📊 Relatórios semanais aos pais",
      "Sem anúncios, sem limites de leitura por voz",
    ],
    cta: "Começar mensal",
  },
  {
    priceId: "familia_anual",
    badge: "Mais popular · Poupa 33%",
    name: "Família Anual",
    price: "39,99€",
    priceLabel: "/ano (≈3,33€/mês)",
    highlight: true,
    perks: [
      "Tudo do plano mensal",
      "💰 Equivalente a 4 meses grátis",
      "🎁 Itens exclusivos de loja todos os meses",
      "🚀 Acesso prioritário a novos conteúdos",
      "📜 Certificados imprimíveis das conquistas",
      "Faturação anual única",
    ],
    cta: "Escolher anual",
  },
  {
    priceId: "vitalicio_lifetime",
    badge: "Lançamento · Edição limitada",
    name: "Vitalício",
    price: "79,99€",
    priceLabel: "uma vez · oferta limitada",
    perks: [
      "👑 Acesso vitalício a tudo no Kidoz",
      "Para os primeiros early-adopters",
      "Sem renovações nem cobranças futuras",
      "Inclui todas as atualizações futuras",
      "🏷️ Mascote dourada exclusiva 'Founder'",
      "Suporte prioritário",
    ],
    cta: "Ser vitalício",
    oneTime: true,
  },
];

interface Feature {
  icon: typeof Crown;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { icon: InfinityIcon, title: "Desafios Infinitos", desc: "Milhares de níveis procedurais em 12 disciplinas. Aritmética, álgebra, geometria, gramática, vocabulário, geografia, história, lógica e mais — sem fim." },
  { icon: GraduationCap, title: "Para todas as idades", desc: "Do Kidoz Júnior (2–5) ao avançado (10+). Conteúdo ajustado à idade, ano escolar e região (PT, BR, AO, MZ, CV)." },
  { icon: Brain, title: "Tutor Mocha IA", desc: "Explicações passo-a-passo, exemplos personalizados e respostas adaptadas ao nível da criança." },
  { icon: Gamepad2, title: "Jogos exclusivos", desc: "Mini-jogos premium, modo família 1v1, desafios PvP com amigos e ranking semanal." },
  { icon: Palette, title: "Personalização total", desc: "Mascotes dourados, fatos exclusivos, cenários animados, jardim e mundo personalizáveis." },
  { icon: Globe2, title: "Realidade Aumentada", desc: "Vê os mascotes em 3D no teu quarto. Aprende explorando objetos reais à tua volta." },
  { icon: Trophy, title: "Conquistas premium", desc: "Centenas de medalhas, certificados imprimíveis e desafios sazonais únicos." },
  { icon: Users, title: "Modo família", desc: "Até 4 perfis de criança, painel de pais avançado, controlos de tempo de ecrã e relatórios detalhados." },
  { icon: Zap, title: "Sem limites", desc: "Vidas infinitas, leitura por voz ilimitada, modo offline e zero anúncios." },
];

const FAQS: Array<{ q: string; a: string }> = [
  { q: "Posso cancelar quando quiser?", a: "Sim. O cancelamento é instantâneo no painel de perfil e mantém o acesso até ao fim do período pago." },
  { q: "Quantas crianças posso registar?", a: "Até 4 perfis distintos por conta família, cada um com mascote e progresso próprios." },
  { q: "Funciona offline?", a: "Sim. As lições e desafios infinitos funcionam offline depois da primeira sincronização." },
  { q: "É seguro para crianças?", a: "Sem anúncios, sem dados partilhados com terceiros e modo pais com PIN para gerir tudo." },
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
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs">
            {[
              { n: "12", l: "disciplinas" },
              { n: "∞", l: "níveis" },
              { n: "2–99", l: "anos" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border-2 border-border/60 bg-card/70 p-2">
                <p className="font-display text-2xl text-primary">{s.n}</p>
                <p className="text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="mt-8">
          <h2 className="font-display text-2xl">Tudo o que recebes</h2>
          <p className="text-sm text-muted-foreground">Mais de 100 funcionalidades premium para crescer sem fim.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} whileHover={{ y: -3 }} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                    <p className="font-display text-base">{f.title}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="card-chunky mt-8 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/20 p-5 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <InfinityIcon className="h-10 w-10 text-primary" />
            <div className="flex-1">
              <p className="font-display text-2xl">Desafios Infinitos</p>
              <p className="mt-1 text-sm text-muted-foreground">Aritmética, álgebra, frações, geometria, gramática, vocabulário, geografia, história, ciências e lógica — milhares de níveis procedurais que se ajustam a ti.</p>
            </div>
            <Link to="/desafios/infinitos" className="self-stretch sm:self-center">
              <ChunkyButton className="w-full sm:w-auto"><Sparkles className="mr-1 inline h-4 w-4" /> Experimentar</ChunkyButton>
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            {["Pré-escolar 2–5", "Básico 6–9", "Avançado 10–13", "Adulto 14+"].map((b) => (
              <div key={b} className="rounded-xl border border-border/60 bg-card/70 p-2 text-center font-display">{b}</div>
            ))}
          </div>
        </section>

        <h2 className="mt-8 font-display text-2xl">Escolhe o teu plano</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
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

        <section className="mt-10">
          <h2 className="font-display text-2xl">Perguntas frequentes</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FAQS.map((f) => (
              <div key={f.q} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                <p className="font-display text-base">{f.q}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="card-chunky mt-8 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-5 text-center">
          <Heart className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-2 font-display text-lg">Cresce sem limites com o Kidoz Premium</p>
          <p className="text-xs text-muted-foreground">Mais de 10 000 perguntas, jogos e desafios à tua espera.</p>
        </div>
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
