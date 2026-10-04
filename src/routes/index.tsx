import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { MASCOTS } from "@/lib/mascots";
import { localProfile, refreshProfile } from "@/lib/profileFast";
import { useEffect, useState } from "react";
import { detectRegion, regionBadgeText, REGIONS, type RegionInfo } from "@/lib/region";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kidoz — Aprender a brincar | App educativa para crianças" },
      {
        name: "description",
        content:
          "App de aprendizagem infantil estilo Duolingo para o 1.º ciclo: Portugal, Moçambique, Angola, Cabo Verde e Brasil. Português, Matemática e Estudo do Meio com mascotes divertidas — e funciona offline.",
      },
      { property: "og:title", content: "Kidoz — Aprender a brincar | App educativa para crianças" },
      {
        property: "og:description",
        content:
          "App de aprendizagem infantil estilo Duolingo para o 1.º ciclo em 5 países lusófonos. Português, Matemática e Estudo do Meio com mascotes divertidas — e funciona offline.",
      },
      { property: "og:url", content: "https://kidoz.online/" },
      {
        property: "og:image",
        content: "https://kidoz.online/og-image.jpg",
      },
      {
        name: "twitter:image",
        content: "https://kidoz.online/og-image.jpg",
      },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "A Kidoz é gratuita?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Podes criar o perfil e experimentar lições gratuitamente. Para acesso completo existem planos para famílias, escolas (0,99€/aluno) e creches.",
              },
            },
            {
              "@type": "Question",
              name: "É seguro para o meu filho?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. Sem anúncios, sem chat entre estranhos, com consentimento parental, tutor IA com regras de proteção infantil (COPPA/RGPD) e painel de pais.",
              },
            },
            {
              "@type": "Question",
              name: "Que idades e anos abrange?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Do 1.º ao 4.º ano (1.º ciclo, 6-10 anos), com modo Júnior adaptado para crianças dos 2 aos 5 anos.",
              },
            },
            {
              "@type": "Question",
              name: "Funciona sem internet?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sim! A Kidoz é uma app instalável (PWA) — depois de instalada, as lições continuam disponíveis offline.",
              },
            },
            {
              "@type": "Question",
              name: "Está alinhado com o programa escolar?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "O conteúdo segue o programa nacional português de Português, Matemática e Estudo do Meio, com adaptações para PALOP (Moçambique, Angola, Cabo Verde).",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
  errorComponent: RouteError,
});

const stagger: { container: Variants; item: Variants } = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  },
};

// Seletor de país da home — adapta badge, currículo e Estudo do Meio.
// Guardado em localStorage (partilhado com /escolas: calculadora multi-moeda).
const PAISES_HOME = [
  { code: "PT", flag: "🇵🇹", nome: "Portugal" },
  { code: "MZ", flag: "🇲🇿", nome: "Moçambique" },
  { code: "AO", flag: "🇦🇴", nome: "Angola" },
  { code: "CV", flag: "🇨🇻", nome: "Cabo Verde" },
  { code: "BR", flag: "🇧🇷", nome: "Brasil" },
] as const;

type PaisHomeCode = (typeof PAISES_HOME)[number]["code"];
const PAIS_KEY = "kidoz-pais";
const PAIS_CODIGOS = new Set<string>(PAISES_HOME.map((p) => p.code));

function paisInicial(): PaisHomeCode {
  try {
    const saved = localStorage.getItem(PAIS_KEY);
    if (saved && PAIS_CODIGOS.has(saved)) return saved as PaisHomeCode;
  } catch {
    /* noop */
  }
  const det = detectRegion();
  return PAIS_CODIGOS.has(det.code) ? (det.code as PaisHomeCode) : "PT";
}

function Landing() {
  const navigate = useNavigate();
  const [region, setRegion] = useState<RegionInfo | null>(null);

  useEffect(() => {
    setRegion(REGIONS[paisInicial()]);
    // Local-first: com perfil em cache o redirect é imediato (sem esperar pela rede).
    const local = localProfile();
    if (local) {
      navigate({ to: "/app" });
      return;
    }
    let cancelled = false;
    void refreshProfile().then((cloud) => {
      if (!cancelled && cloud && cloud.name) {
        navigate({ to: "/app" });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const escolherPais = (code: PaisHomeCode) => {
    setRegion(REGIONS[code]);
    try {
      localStorage.setItem(PAIS_KEY, code);
    } catch {
      /* noop */
    }
  };

  return (
    <main id="main-content" className="bg-sky-island relative min-h-[100dvh] overflow-hidden">
      <FloatingDecor />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col items-center justify-center px-5 py-8 text-center sm:px-6 sm:py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="mb-4"
        >
          <AlegriaLogo
            priority
            className="h-20 w-auto sm:h-24 md:h-28"
            alt="Kidoz — Aprender a brincar"
          />
        </motion.div>

        {/* Region badge */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-3 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 font-display text-xs font-semibold text-primary shadow-sm sm:text-sm"
        >
          {region ? regionBadgeText(region) : "🇵🇹 Feito para o 1.º ciclo em Portugal"}
        </motion.div>

        {/* País: muda o currículo, os exemplos e a moeda em toda a página */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          role="group"
          aria-label="Escolhe o teu país"
          className="mb-4 flex flex-wrap items-center justify-center gap-1.5"
        >
          {PAISES_HOME.map((p) => {
            const ativo = region?.code === p.code;
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => escolherPais(p.code)}
                aria-pressed={ativo}
                className={`rounded-full border px-2.5 py-1 font-display text-[11px] transition-colors sm:text-xs ${
                  ativo
                    ? "border-primary bg-primary/15 font-semibold text-primary"
                    : "border-border bg-card/80 text-muted-foreground hover:bg-card"
                }`}
              >
                <span aria-hidden="true">{p.flag}</span>
                <span className="ml-1">{p.nome}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Hero heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-7xl"
        >
          Aprender é <span className="text-primary">brincar</span>!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-3 max-w-[36rem] text-base text-foreground/80 sm:mt-4 sm:text-lg md:text-xl"
        >
          Português, Matemática e Estudo do Meio com mascotes divertidas, lições curtas e muitas
          estrelinhas. ✨
        </motion.p>

        {/* Mascot row */}
        <div className="my-8 flex flex-wrap items-end justify-center gap-2 sm:my-10 sm:gap-4">
          {MASCOTS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
              className="text-center"
            >
              <Mascot id={m.id} size="md" bouncing={i === 1} className="sm:hidden" />
              <Mascot id={m.id} size="lg" bouncing={i === 1} className="hidden sm:inline-flex" />
              <p className="mt-1 font-display text-xs font-semibold sm:text-sm">{m.name}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex w-full max-w-[24rem] flex-col items-stretch gap-3 sm:max-w-none sm:flex-row"
        >
          <Link to="/comecar" className="flex-1 sm:flex-none">
            <ChunkyButton tone="primary" className="w-full text-base sm:text-lg">
              Começar a aventura 🚀
            </ChunkyButton>
          </Link>
          <Link to="/auth" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">
              Já tenho conta
            </ChunkyButton>
          </Link>
          <Link to="/pais" className="flex-1 sm:flex-none">
            <ChunkyButton tone="secondary" className="w-full">
              👨‍👩‍👧 Sou pai/mãe
            </ChunkyButton>
          </Link>
        </motion.div>

        {/* Trust strip — segurança e confiança para os pais, logo sob os CTAs */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-foreground/70 sm:text-xs"
          aria-label="Garantias de confiança"
        >
          {[
            "🔒 Seguro para crianças",
            "🚫 Sem anúncios",
            region ? `${region.flag} Programa de ${region.country}` : "🇵🇹 Programa nacional",
            "👪 Painel de pais",
          ].map((t) => (
            <li
              key={t}
              className="rounded-full border border-border bg-card/80 px-3 py-1.5 backdrop-blur"
            >
              {t}
            </li>
          ))}
        </motion.ul>

        {/* Subject cards */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="mt-12 grid w-full gap-3 sm:mt-16 sm:gap-4 md:grid-cols-3"
        >
          <motion.div variants={stagger.item}>
            <FeatureCard emoji="📚" title="Português" text="Vogais, sílabas, gramática, plurais" />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FeatureCard emoji="➕" title="Matemática" text="Tabuada, divisões, frações" />
          </motion.div>
          <motion.div variants={stagger.item}>
            <FeatureCard
              emoji="🌍"
              title="Estudo do Meio"
              text={`${region?.country ?? "Portugal"}, história, ambiente`}
            />
          </motion.div>
        </motion.div>

        {/* Stats — números reais da plataforma */}
        <StatsStrip />

        {/* How it works */}
        <HowItWorks />

        {/* Learning path */}
        <LessonPathPreview />

        {/* Testimonials */}
        <Testimonials />

        {/* Premium — âncora de preço no topo do funil */}
        <PremiumStrip />

        {/* Escolas — segunda fonte de receita, teaser B2B */}
        <SchoolsTeaser />

        {/* FAQ — respostas rápidas para pais e professores (SEO) */}
        <FaqSection />

        {/* Bottom CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex w-full max-w-[28rem] flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Link to="/junior" className="flex-1 sm:flex-none">
            <ChunkyButton tone="secondary" className="w-full">
              🌱 Júnior — 2 a 5 anos
            </ChunkyButton>
          </Link>
          <Link to="/escolas" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">
              🏫 Escolas — 0,99€/aluno
            </ChunkyButton>
          </Link>
          <Link to="/creches" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">
              🏡 Creches — planos B2B
            </ChunkyButton>
          </Link>
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 w-full border-t border-border pt-5 pb-6 text-center text-xs text-muted-foreground sm:mt-16">
          <nav aria-label="Links legais" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link
              to="/privacidade"
              className="hover:text-primary hover:underline min-h-[44px] inline-flex items-center"
            >
              Privacidade
            </Link>
            <Link
              to="/termos"
              className="hover:text-primary hover:underline min-h-[44px] inline-flex items-center"
            >
              Termos
            </Link>
            <Link
              to="/ajuda"
              className="hover:text-primary hover:underline min-h-[44px] inline-flex items-center"
            >
              Ajuda
            </Link>
          </nav>
          <p className="mt-2">&copy; {new Date().getFullYear()} Kidoz — Aprender a brincar</p>
        </footer>
      </div>
    </main>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "1",
      emoji: "👶",
      title: "Escolhe o teu mascote",
      text: "Cria um perfil divertido em segundos.",
    },
    {
      n: "2",
      emoji: "📚",
      title: "Lições curtinhas",
      text: "5 minutos por dia chega para evoluir.",
    },
    {
      n: "3",
      emoji: "🏆",
      title: "Sobe de nível",
      text: "Ganha estrelas, medalhas e mantém a streak 🔥",
    },
  ];
  return (
    <section className="mt-12 w-full sm:mt-16">
      <h2 className="mb-2 text-center font-display text-2xl sm:text-3xl">Como funciona</h2>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Aprender pouco e muitas vezes — como o Duolingo, mas para o programa português.
      </p>
      <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-chunky relative overflow-hidden rounded-3xl border border-border bg-card p-5 text-left"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[5.5rem] font-black leading-none opacity-[0.07]"
            >
              {s.n}
            </span>
            <div className="text-3xl">{s.emoji}</div>
            <h3 className="mt-2 font-display text-lg sm:text-xl">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function LessonPathPreview() {
  const nodes = [
    { e: "🅰️", t: "Vogais", tone: "bg-primary text-primary-foreground" },
    { e: "🔢", t: "Contar", tone: "bg-secondary text-secondary-foreground" },
    { e: "📖", t: "Ler", tone: "bg-accent text-accent-foreground" },
    { e: "✖️", t: "Tabuada", tone: "bg-success text-success-foreground" },
    { e: "🌍", t: "Mundo", tone: "bg-xp text-foreground" },
  ];
  return (
    <section className="mt-12 w-full sm:mt-16">
      <h2 className="mb-2 text-center font-display text-2xl sm:text-3xl">
        O caminho da aprendizagem
      </h2>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Cada nó é uma mini-lição, com sons, animações e mascotes.
      </p>
      <div className="relative mx-auto max-w-[28rem]">
        {nodes.map((n, i) => (
          <motion.div
            key={n.t}
            initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`relative mb-4 flex items-center gap-3 ${i % 2 === 0 ? "ml-0 mr-auto" : "ml-auto mr-0"}`}
            style={{ width: "min(85%, 22rem)" }}
          >
            <div
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl shadow-md ring-4 ring-card ${n.tone}`}
            >
              {n.e}
            </div>
            <div className="card-chunky flex-1 rounded-2xl border border-border bg-card px-4 py-3">
              <p className="font-display text-base">{n.t}</p>
              <p className="text-xs text-muted-foreground">5 min · {(i + 1) * 10} XP</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-4 text-left sm:p-5">
      <div
        aria-hidden
        className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-2xl sm:text-3xl"
      >
        {emoji}
      </div>
      <h2 className="mt-3 font-display text-lg sm:text-xl">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Sofia M.",
    role: "Mãe do Tomás (6)",
    text: "O meu filho pede para fazer 'mais uma' lição todos os dias. Aprende sem perceber!",
    emoji: "👩",
  },
  {
    name: "Prof. Ana",
    role: "1.º ciclo · Lisboa",
    text: "Uso na sala de aula. Os miúdos adoram e o currículo está mesmo alinhado com o programa nacional.",
    emoji: "👩‍🏫",
  },
  {
    name: "Ricardo P.",
    role: "Pai da Beatriz (8)",
    text: "O painel de pais ajuda-me a perceber onde ela tem mais dificuldade. Recomendo!",
    emoji: "👨",
  },
];

function Testimonials() {
  return (
    <section className="mt-12 w-full sm:mt-16">
      <h2 className="mb-2 font-display text-2xl sm:text-3xl">O que dizem pais e professores</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Pais e professores que usam a Kidoz em Portugal e países PALOP.
      </p>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-chunky rounded-3xl border border-border bg-card p-4 text-left sm:p-5"
          >
            <div className="mb-2 flex gap-0.5 text-xp text-sm">★★★★★</div>
            <blockquote className="text-sm leading-snug">"{t.text}"</blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className="font-display font-bold leading-tight">{t.name}</p>
                <p className="text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { n: "30+", label: "lições" },
    { n: "300+", label: "exercícios" },
    { n: "∞", label: "desafios gerados" },
    { n: "5 min", label: "por dia chega" },
  ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      aria-label="Números da Kidoz"
      className="card-chunky mt-12 grid w-full grid-cols-2 gap-2 rounded-3xl border border-border bg-card/90 p-4 backdrop-blur sm:mt-16 sm:grid-cols-4 sm:p-5"
    >
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <p className="font-display text-2xl font-bold text-primary sm:text-3xl">{s.n}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
        </div>
      ))}
    </motion.section>
  );
}

const FAQS = [
  {
    q: "A Kidoz é gratuita?",
    a: "Podes criar o perfil e experimentar lições gratuitamente. Para acesso completo existem planos para famílias, escolas (0,99€/aluno) e creches.",
  },
  {
    q: "É seguro para o meu filho?",
    a: "Sim. Sem anúncios, sem chat entre estranhos, com consentimento parental, tutor IA com regras de proteção infantil (COPPA/RGPD) e painel de pais.",
  },
  {
    q: "Que idades e anos abrange?",
    a: "Do 1.º ao 4.º ano (1.º ciclo, 6-10 anos), com modo Júnior adaptado para crianças dos 2 aos 5 anos.",
  },
  {
    q: "Funciona sem internet?",
    a: "Sim! A Kidoz é uma app instalável (PWA) — depois de instalada, as lições continuam disponíveis offline.",
  },
  {
    q: "Está alinhado com o programa escolar?",
    a: "O conteúdo segue o programa nacional português de Português, Matemática e Estudo do Meio, com adaptações para PALOP (Moçambique, Angola, Cabo Verde).",
  },
];

function FaqSection() {
  return (
    <section className="mt-12 w-full sm:mt-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-2 text-center font-display text-2xl sm:text-3xl">
        Perguntas frequentes
      </h2>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Tudo o que pais e professores costumam perguntar.
      </p>
      <div className="mx-auto flex max-w-[36rem] flex-col gap-2">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="card-chunky group rounded-2xl border border-border bg-card px-4 py-3 text-left"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
              {f.q}
              <span
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
              >
                ＋
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function PremiumStrip() {
  const perks = [
    { e: "🌀", t: "Mundo Premium — 5 reinos com dragão final" },
    { e: "🤖", t: "Tutor Mocha IA que explica passo-a-passo" },
    { e: "♾️", t: "Desafios Infinitos em todas as idades" },
    { e: "🎁", t: "Itens exclusivos da loja todos os meses" },
  ];
  return (
    <section
      aria-labelledby="premium-heading"
      className="card-chunky relative mt-12 w-full overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/15 via-secondary/15 to-primary/15 p-5 sm:mt-16 sm:p-8"
    >
      <p className="text-center font-display text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">
        kidoz premium
      </p>
      <h2 id="premium-heading" className="mt-1 text-center font-display text-2xl sm:text-3xl">
        Desbloqueia o mundo completo 👑
      </h2>
      <p className="mx-auto mt-2 max-w-[36rem] text-center text-sm text-muted-foreground sm:text-base">
        Menos de 1 hora de explicações particulares por mês — e a aventura de aprender nunca acaba.
        Sem fidelização, cancela quando quiseres.
      </p>
      <ul className="mx-auto mt-4 grid max-w-[40rem] gap-2 sm:grid-cols-2">
        {perks.map((p) => (
          <li
            key={p.e}
            className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 text-left text-xs sm:text-sm"
          >
            <span className="text-lg" aria-hidden>
              {p.e}
            </span>
            <span>{p.t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/premium" className="w-full sm:w-auto">
          <ChunkyButton tone="primary" className="min-h-[54px] w-full text-base">
            Ver planos desde 3,33€/mês
          </ChunkyButton>
        </Link>
        <Link to="/escolas" className="w-full sm:w-auto">
          <ChunkyButton tone="ghost" className="min-h-[54px] w-full text-base">
            🏫 Para escolas — 0,99€/aluno
          </ChunkyButton>
        </Link>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        💳 Pagamento seguro · 🔒 Sem anúncios · 👪 Até 4 crianças
      </p>
    </section>
  );
}

function SchoolsTeaser() {
  const cards = [
    {
      e: "📊",
      t: "Painel do professor",
      d: "Precisão, minutos e evolução de cada aluno — e um relatório de turma em PDF, pronto para conselhos de turma.",
    },
    {
      e: "🎬",
      t: "Modo Turma ao vivo",
      d: "A turma inteira joga no projetor com um código PIN. Vê a demonstração sem registo na página de escolas.",
    },
    {
      e: "🖨️",
      t: "Fichas para imprimir",
      d: "Matemática e Português com a moeda e as palavras do teu país (capulana, candongueiro…) — grátis, sem registo.",
    },
  ];
  return (
    <section aria-labelledby="escolas-heading" className="mt-12 w-full sm:mt-16">
      <div className="text-center">
        <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
          Para escolas e instituições
        </p>
        <h2 id="escolas-heading" className="mt-1 font-display text-2xl sm:text-3xl">
          A escola inteira a aprender — mesmo sem internet
        </h2>
        <p className="mx-auto mt-2 max-w-[40rem] text-sm text-muted-foreground sm:text-base">
          Em 5 países: Portugal, Moçambique, Angola, Cabo Verde e Brasil. Cada aluno custa menos de
          5 cêntimos por dia útil — e os Fundadores travam 50% de desconto no 1.º ano.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.t}
            className="card-chunky rounded-3xl border border-border bg-card p-4 text-left sm:p-5"
          >
            <div
              aria-hidden
              className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/40 text-2xl"
            >
              {c.e}
            </div>
            <h3 className="mt-3 font-display text-lg">{c.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>
      <div className="card-chunky mt-4 flex flex-col items-center gap-3 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="font-display text-2xl text-primary">
            0,99€ <span className="text-sm font-normal text-muted-foreground">/ aluno · mês</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Mínimo 20 alunos · funciona em tablets partilhados · faturação com NIF
          </p>
        </div>
        <Link to="/escolas" className="w-full sm:w-auto">
          <ChunkyButton tone="primary" className="min-h-[52px] w-full text-base sm:w-auto">
            Ver o plano para escolas →
          </ChunkyButton>
        </Link>
      </div>
    </section>
  );
}

function FloatingDecor() {
  const items = ["⭐", "🎈", "✨", "🌈", "☁️", "🎨"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((e, i) => (
        <motion.span
          key={i}
          className="absolute text-xl opacity-40 sm:text-2xl sm:opacity-50"
          style={{
            left: `${(i * 17 + 8) % 95}%`,
            top: `${(i * 23 + 10) % 80}%`,
          }}
          animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}
