import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { loadProfile, type Profile } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { isPremiumActive } from "@/lib/premium";
import {
  ArrowLeft,
  Brain,
  Check,
  Crown,
  Gamepad2,
  Gift,
  Globe2,
  GraduationCap,
  Heart,
  Infinity as InfinityIcon,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { RouteError } from "@/components/RouteError";
import { KidLoader } from "@/components/KidLoader";

const TESTIMONIALS = [
  {
    name: "Sofia, mãe da Matilde (7)",
    text: "A Matilde pede para ‘fazer Kidoz’ antes do desenho animado. As mascotes tornaram a leitura divertida.",
    stars: 5,
  },
  {
    name: "João, pai do Tomás (9)",
    text: "O Tutor Mocha explica matemática melhor do que eu! E vejo o progresso semanal no painel de pais.",
    stars: 5,
  },
  {
    name: "Prof. Inês, 2.º ano",
    text: "Uso o Kidoz como reforço na sala. O alinhamento com o programa nacional faz toda a diferença.",
    stars: 5,
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Sem anúncios" },
  { icon: Heart, label: "Seguro p/ crianças" },
  { icon: Users, label: "+10.000 famílias" },
  { icon: Trophy, label: "Programa nacional" },
];

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Subscrição Kidoz Premium — desde 3,33€/mês" },
      {
        name: "description",
        content:
          "Acesso ilimitado a todas as disciplinas, Mocha IA, modo família e relatórios. Planos a partir de 3,33€/mês.",
      },
      { property: "og:title", content: "Kidoz Premium — desde 3,33€/mês" },
      {
        property: "og:description",
        content: "Acesso ilimitado a todas as disciplinas, Mocha IA, modo família e relatórios.",
      },
      { property: "og:url", content: "https://kidoz.online/premium" },
      {
        property: "og:image",
        content: "https://kidoz.online/og-image.jpg",
      },
      {
        name: "twitter:image",
        content: "https://kidoz.online/og-image.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/premium" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: PremiumPage,
  errorComponent: RouteError,
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
      "🌀 O MUNDO PREMIUM — 5 reinos × 3 níveis, criaturas e Bazar de Cristais",
      "🎯 Missões diárias do Portal com streak 🔥 e recompensas em ✦",
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
  {
    icon: InfinityIcon,
    title: "Desafios Infinitos",
    desc: "Milhares de níveis procedurais em 12 disciplinas. Aritmética, álgebra, geometria, gramática, vocabulário, geografia, história, lógica e mais — sem fim.",
  },
  {
    icon: Globe2,
    title: "O Mundo Premium",
    desc: "5 reinos que não existem em mais nenhum jogo — Vulcão dos Números, Galáxia do Saber, Laboratório Mágico, Castelo das Palavras e a Caverna do Dragão — agora com 3 níveis cada (Bronze→Ouro), estrelas para colecionar, missões diárias com streak 🔥 e o Bazar dos Cristais, onde gastas ✦ em power-ups e criaturas mágicas que reagem às tuas jogadas ao lado da tua mascote.",
  },
  {
    icon: GraduationCap,
    title: "Para todas as idades",
    desc: "Do Kidoz Júnior (2–5) ao avançado (10+). Conteúdo ajustado à idade, ano escolar e região (PT, BR, AO, MZ, CV).",
  },
  {
    icon: Brain,
    title: "Tutor Mocha IA",
    desc: "Explicações passo-a-passo, exemplos personalizados e respostas adaptadas ao nível da criança.",
  },
  {
    icon: Gamepad2,
    title: "Jogos exclusivos",
    desc: "Mini-jogos premium, modo família 1v1, desafios PvP com amigos e ranking semanal.",
  },
  {
    icon: Palette,
    title: "Personalização total",
    desc: "Mascotes dourados, fatos exclusivos, cenários animados, jardim e mundo personalizáveis.",
  },
  {
    icon: Globe2,
    title: "Realidade Aumentada",
    desc: "Vê os mascotes em 3D no teu quarto. Aprende explorando objetos reais à tua volta.",
  },
  {
    icon: Trophy,
    title: "Conquistas premium",
    desc: "Centenas de medalhas, certificados imprimíveis e desafios sazonais únicos.",
  },
  {
    icon: Users,
    title: "Modo família",
    desc: "Até 4 perfis de criança, painel de pais avançado, controlos de tempo de ecrã e relatórios detalhados.",
  },
  {
    icon: Zap,
    title: "Sem limites",
    desc: "Vidas infinitas, leitura por voz ilimitada, modo offline e zero anúncios.",
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O cancelamento é instantâneo no painel de perfil e mantém o acesso até ao fim do período pago.",
  },
  {
    q: "Quantas crianças posso registar?",
    a: "Até 4 perfis distintos por conta família, cada um com mascote e progresso próprios.",
  },
  {
    q: "Funciona offline?",
    a: "Sim. As lições e desafios infinitos funcionam offline depois da primeira sincronização.",
  },
  {
    q: "É seguro para crianças?",
    a: "Sem anúncios, sem dados partilhados com terceiros e modo pais com PIN para gerir tudo.",
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
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
  }, [navigate]);

  if (!profile) return <KidLoader />;

  const premiumNow = isActive || isPremiumActive(profile);

  const handleSubscribe = (priceId: string) => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setCheckoutPriceId(priceId);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <PaymentTestModeBanner />
      <TopBar profile={profile} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Link
          to="/perfil"
          className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Perfil
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
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
          {!isActive && isPremiumActive(profile) && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400/30 to-yellow-300/30 px-4 py-1.5 font-display text-sm text-amber-600">
              <Crown className="h-4 w-4" /> Premium ativo (prémio de convites!)
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

        {/* O MUNDO PREMIUM — showpiece */}
        <section className="card-chunky relative mt-8 overflow-hidden rounded-3xl border-2 border-violet-400/50 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/15 to-amber-400/20 p-6 text-center sm:p-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="mx-auto h-20 w-20 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#ec4899,#f59e0b,#10b981,#8b5cf6)] p-1 shadow-[0_0_45px_12px_rgba(139,92,246,0.4)]"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
              <span className="text-3xl">🌀</span>
            </div>
          </motion.div>
          <p className="mt-3 font-display text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">
            exclusivo premium
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl">O Mundo Premium 🌀</h2>
          <p className="mx-auto mt-2 max-w-[40rem] text-sm text-muted-foreground sm:text-base">
            Um mundo que não existe em mais nenhum jogo de aprendizagem: cinco reinos que juntam
            quiz, coleção, construção e aventura — com cristais, recordes e um dragão final.
          </p>
          <div className="mx-auto mt-4 grid max-w-[42rem] grid-cols-2 gap-2 text-left sm:grid-cols-5">
            {[
              { e: "🌋", n: "Vulcão dos Números", d: "A lava sobe a cada erro!" },
              { e: "🚀", n: "Galáxia do Saber", d: "Viaja de planeta em planeta" },
              { e: "🧪", n: "Laboratório Mágico", d: "Poções e descobertas" },
              { e: "🏰", n: "Castelo das Palavras", d: "Acende todas as janelas" },
              { e: "🐉", n: "Caverna do Dragão", d: "O chefe final de tudo" },
            ].map((r) => (
              <div key={r.n} className="rounded-2xl border border-border/70 bg-card/80 p-2.5">
                <p className="text-2xl">{r.e}</p>
                <p className="font-display text-xs leading-tight">{r.n}</p>
                <p className="text-[10px] leading-tight text-muted-foreground">{r.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
            {premiumNow ? (
              <Link to="/portal">
                <ChunkyButton className="min-h-[54px] text-base">
                  <Sparkles className="mr-1 inline h-5 w-5" /> Entrar no Mundo Premium
                </ChunkyButton>
              </Link>
            ) : (
              <>
                <Link to="/portal">
                  <ChunkyButton tone="secondary" className="min-h-[54px]">
                    <Sparkles className="mr-1 inline h-5 w-5" /> Visita guiada grátis
                  </ChunkyButton>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <ChunkyButton className="min-h-[54px]">
                    <Crown className="mr-1 inline h-5 w-5" /> Quero o Mundo completo
                  </ChunkyButton>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Sem pagar? Convita! */}
        <section className="card-chunky mt-5 flex flex-col items-center gap-3 rounded-3xl border-2 border-secondary/50 bg-gradient-to-br from-secondary/15 to-accent/10 p-5 text-center sm:flex-row sm:text-left">
          <Gift className="h-9 w-9 shrink-0 text-secondary-foreground" />
          <div className="flex-1">
            <p className="font-display text-lg">Sem pagar um cêntimo? Convita e ganha! 🎁</p>
            <p className="text-sm text-muted-foreground">
              Convida amigos pelo WhatsApp: eles ganham moedas de boas-vindas e tu ganhas prémios —
              com <b>3 convites</b> recebes <b>7 dias de Premium grátis</b> para abrir o Mundo!
            </p>
          </div>
          <Link to="/convites" className="shrink-0">
            <ChunkyButton tone="secondary">Convitar amigos</ChunkyButton>
          </Link>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-2xl">Tudo o que recebes</h2>
          <p className="text-sm text-muted-foreground">
            Mais de 100 funcionalidades premium para crescer sem fim.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -3 }}
                  className="card-chunky rounded-2xl border-2 border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
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
              <p className="mt-1 text-sm text-muted-foreground">
                Aritmética, álgebra, frações, geometria, gramática, vocabulário, geografia,
                história, ciências e lógica — milhares de níveis procedurais que se ajustam a ti.
              </p>
            </div>
            <Link to="/desafios/infinitos" className="self-stretch sm:self-center">
              <ChunkyButton className="w-full sm:w-auto">
                <Sparkles className="mr-1 inline h-4 w-4" /> Experimentar
              </ChunkyButton>
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            {["Pré-escolar 2–5", "Básico 6–9", "Avançado 10–13", "Adulto 14+"].map((b) => (
              <div
                key={b}
                className="rounded-xl border border-border/60 bg-card/70 p-2 text-center font-display"
              >
                {b}
              </div>
            ))}
          </div>
        </section>

        <h2 id="planos" className="mt-8 scroll-mt-20 font-display text-2xl">
          Escolhe o teu plano
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = isActive && subscription?.price_id === plan.priceId;
            return (
              <motion.div
                key={plan.priceId}
                whileHover={{ y: -4 }}
                className={`card-chunky relative flex flex-col rounded-3xl border-2 p-5 sm:p-6 ${
                  plan.highlight
                    ? "border-primary bg-card shadow-elegant"
                    : "border-border bg-card/80"
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

        {/* Trust strip */}
        <section aria-label="Confiança" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card/70 px-3 py-3 text-center"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-display text-sm">{t.label}</span>
              </div>
            );
          })}
        </section>

        {/* Para os pais — valor educativo */}
        <section className="card-chunky mt-10 rounded-3xl border-2 border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl">Aos olhos dos pais (e das escolas)</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            O Premium foi desenhado com pedagogos para que diversão tenha resultado real:
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {[
              {
                i: "📊",
                t: "Relatórios semanais",
                d: "Precisão, minutos e disciplinas mais trabalhadas — diretos no painel de pais.",
              },
              {
                i: "🎯",
                t: "Currículo nacional",
                d: "Alinhado com as Aprendizagens Essenciais (PT) e currículos de Angola, Moçambique, Cabo Verde e Brasil.",
              },
              {
                i: "⏱️",
                t: "Controlo de tempo",
                d: "Limites diários e hora de dormir configuráveis pelos pais, com PIN.",
              },
              {
                i: "🛡️",
                t: "Seguro por defeito",
                d: "Sem anúncios, sem chat aberto, dados protegidos e conformidade RGPD/COPPA.",
              },
              {
                i: "🧠",
                t: "Tutor que ensina a pensar",
                d: "O Mocha explica passo-a-passo em linguagem de criança — não dá só a resposta.",
              },
              {
                i: "🏫",
                t: "Para instituições",
                d: "Painel de turma, exportação CSV e preço por aluno a partir de 0,99€/mês.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 p-3"
              >
                <span className="text-2xl">{c.i}</span>
                <div>
                  <p className="font-display text-sm">{c.t}</p>
                  <p className="text-xs text-muted-foreground">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/escolas"
            className="mt-3 inline-block font-display text-sm text-primary underline underline-offset-2"
          >
            É professor ou representa uma escola? Ver plano Escolas →
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl">O que dizem famílias e professores</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <motion.figure
                key={t.name}
                whileHover={{ y: -3 }}
                className="card-chunky rounded-2xl border-2 border-border bg-card p-4"
              >
                <div className="mb-2 flex gap-0.5 text-xp">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground/90">“{t.text}”</blockquote>
                <figcaption className="mt-2 text-xs text-muted-foreground">{t.name}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* Demo highlights */}
        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="card-chunky rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/15 p-5">
            <Brain className="h-7 w-7 text-primary" />
            <p className="mt-2 font-display text-lg">Tutor Mocha IA</p>
            <p className="text-sm text-foreground/80">
              Explica passo-a-passo, gera exercícios novos e adapta-se ao nível da criança em
              segundos.
            </p>
            <Link
              to="/tutor"
              className="mt-3 inline-block text-sm font-display text-primary underline-offset-2 hover:underline"
            >
              Experimentar →
            </Link>
          </div>
          <div className="card-chunky rounded-3xl border-2 border-secondary/50 bg-gradient-to-br from-secondary/15 to-primary/10 p-5">
            <Globe2 className="h-7 w-7 text-pt-world" />
            <p className="mt-2 font-display text-lg">Realidade Aumentada</p>
            <p className="text-sm text-foreground/80">
              Vê os mascotes em 3D no quarto da criança a explicar ciência, geografia e história.
            </p>
            <Link
              to="/ra"
              className="mt-3 inline-block text-sm font-display text-primary underline-offset-2 hover:underline"
            >
              Ver demo →
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Perguntas frequentes</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FAQS.map((f) => (
              <div key={f.q} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                <p className="font-display text-base">{f.q}</p>
                <p className="mt-1 text-xs text-foreground/80">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="card-chunky mt-8 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-5 text-center">
          <Heart className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-2 font-display text-lg">Cresce sem limites com o Kidoz Premium</p>
          <p className="text-xs text-muted-foreground">
            Mais de 10 000 perguntas, jogos e desafios à tua espera.
          </p>
        </div>
      </main>

      <Dialog open={!!checkoutPriceId} onOpenChange={(o) => !o && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-[48rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizar subscrição</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Checkout seguro para finalizar a subscrição Premium.
            </DialogDescription>
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
