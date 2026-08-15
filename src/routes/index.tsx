import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { MASCOTS } from "@/lib/mascots";
import { loadProfile, pullProfileFromCloud } from "@/lib/storage";
import { useEffect, useState } from "react";
import { detectRegion, regionBadgeText, type RegionInfo } from "@/lib/region";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kidoz — Aprender a brincar | App educativa para crianças" },
      { name: "description", content: "App de aprendizagem infantil estilo Duolingo, para o 1.º ciclo em Portugal. Português, Matemática e Estudo do Meio com mascotes divertidas." },
      { property: "og:title", content: 'Kidoz — Aprender a brincar | App educativa para crianças' },
      { property: "og:description", content: 'App de aprendizagem infantil estilo Duolingo, para o 1.º ciclo em Portugal. Português, Matemática e Estudo do Meio com mascotes divertidas.' },
      { property: "og:url", content: "https://kidoz.online/" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/" },
    ],
  }),
  component: Landing,
  errorComponent: RouteError,
});

function Landing() {
  const navigate = useNavigate();
  const [region, setRegion] = useState<RegionInfo | null>(null);

  useEffect(() => {
    setRegion(detectRegion());
    let cancelled = false;
    const check = async () => {
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      if (p && p.name) {
        navigate({ to: "/app" });
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main id="main-content" className="bg-sky-island relative min-h-[100dvh] overflow-hidden">
      {/* floating shapes */}
      <FloatingDecor />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-3"
        >
          <AlegriaLogo priority className="h-20 w-auto sm:h-24 md:h-28" alt="Kidoz — Aprender a brincar" />
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-2 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 font-display text-xs font-semibold text-primary shadow-sm sm:text-sm"
        >
          {region ? regionBadgeText(region) : "🌍 A detetar a tua região…"}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-7xl"
        >
          Aprender é <span className="text-primary">brincar</span>!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 max-w-xl text-base text-foreground/80 sm:mt-4 sm:text-lg md:text-xl"
        >
          Português, Matemática e Estudo do Meio com mascotes divertidas, lições curtas e muitas estrelinhas. ✨
        </motion.p>

        {/* mascot row */}
        <div className="my-8 flex flex-wrap items-end justify-center gap-2 sm:my-10 sm:gap-4">
          {MASCOTS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
              className="text-center"
            >
              <Mascot id={m.id} size="md" bouncing={i === 1} className="sm:hidden" />
              <Mascot id={m.id} size="lg" bouncing={i === 1} className="hidden sm:inline-flex" />
              <p className="mt-1 font-display text-xs font-semibold sm:text-sm">{m.name}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row"
        >
          <Link to="/comecar" className="flex-1 sm:flex-none">
            <ChunkyButton tone="primary" className="w-full text-base sm:text-lg">
              Começar a aventura 🚀
            </ChunkyButton>
          </Link>
          <Link to="/auth" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">Já tenho conta</ChunkyButton>
          </Link>
          <Link to="/pais" className="flex-1 sm:flex-none">
            <ChunkyButton tone="secondary" className="w-full">👨‍👩‍👧 Sou pai/mãe</ChunkyButton>
          </Link>
        </motion.div>

        <div className="mt-12 grid w-full gap-3 sm:mt-16 sm:gap-4 md:grid-cols-3">
          <FeatureCard emoji="📚" title="Português" text="Vogais, sílabas, gramática, plurais" />
          <FeatureCard emoji="➕" title="Matemática" text="Tabuada, divisões, frações" />
          <FeatureCard emoji="🌍" title="Estudo do Meio" text="Portugal, história, ambiente" />
        </div>

        {/* Como funciona — estilo Duolingo ABC */}
        <HowItWorks />

        {/* Mini caminho de lições, mobile-first */}
        <LessonPathPreview />

        {/* Prova social */}
        <Testimonials />

        <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link to="/junior" className="flex-1 sm:flex-none">
            <ChunkyButton tone="secondary" className="w-full">🌱 Kidoz Júnior — 2 a 5 anos</ChunkyButton>
          </Link>
          <Link to="/escolas" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">🏫 Escolas — 0,99€/aluno</ChunkyButton>
          </Link>
          <Link to="/creches" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">🏡 Creches — planos B2B</ChunkyButton>
          </Link>
        </div>

        <footer className="mt-16 w-full border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <nav aria-label="Links legais" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/privacidade" className="hover:text-primary hover:underline">Privacidade</Link>
            <Link to="/termos" className="hover:text-primary hover:underline">Termos</Link>
            <Link to="/ajuda" className="hover:text-primary hover:underline">Ajuda</Link>
          </nav>
          <p className="mt-2">&copy; {new Date().getFullYear()} Kidoz — Aprender a brincar</p>
        </footer>
      </div>
    </main>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", emoji: "👶", title: "Escolhe o teu mascote", text: "Cria um perfil divertido em segundos." },
    { n: "2", emoji: "📚", title: "Lições curtinhas", text: "5 minutos por dia chega para evoluir." },
    { n: "3", emoji: "🏆", title: "Sobe de nível", text: "Ganha estrelas, medalhas e mantém a streak 🔥" },
  ];
  return (
    <section className="mt-12 w-full sm:mt-16">
      <h2 className="mb-1 text-center font-display text-2xl sm:text-3xl">Como funciona</h2>
      <p className="mb-5 text-center text-sm text-muted-foreground">Aprender pouco e muitas vezes — como o Duolingo, mas para o programa português.</p>
      <ol className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-chunky relative overflow-hidden rounded-3xl border border-border bg-card p-5 text-left"
          >
            <span className="absolute -right-3 -top-3 text-7xl opacity-10">{s.n}</span>
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
      <h2 className="mb-1 text-center font-display text-2xl sm:text-3xl">O caminho da aprendizagem</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">Cada nó é uma mini-lição, com sons, animações e mascotes.</p>
      <div className="relative mx-auto max-w-md">
        {nodes.map((n, i) => (
          <motion.div
            key={n.t}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`relative mb-4 flex items-center gap-3 ${i % 2 === 0 ? "ml-0 mr-auto" : "ml-auto mr-0"}`}
            style={{ width: "min(85%, 22rem)" }}
          >
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full text-3xl shadow-md ring-4 ring-card ${n.tone}`}>
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
      <div className="text-2xl sm:text-3xl">{emoji}</div>
      <h2 className="mt-2 font-display text-lg sm:text-xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Sofia M.", role: "Mãe do Tomás (6)", text: "O meu filho pede para fazer 'mais uma' lição todos os dias. Aprende sem perceber!", emoji: "👩" },
  { name: "Prof. Ana", role: "1.º ciclo · Lisboa", text: "Uso na sala de aula. Os miúdos adoram e o currículo está mesmo alinhado com o programa nacional.", emoji: "👩‍🏫" },
  { name: "Ricardo P.", role: "Pai da Beatriz (8)", text: "O painel de pais ajuda-me a perceber onde ela tem mais dificuldade. Recomendo!", emoji: "👨" },
];

function Testimonials() {
  return (
    <section className="mt-12 w-full sm:mt-16">
      <h2 className="mb-1 font-display text-2xl sm:text-3xl">O que dizem pais e professores</h2>
      <p className="mb-5 text-sm text-muted-foreground">Famílias reais a aprender com a Kidoz em Portugal e países PALOP.</p>
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
            <blockquote className="text-sm leading-snug">“{t.text}”</blockquote>
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

function FloatingDecor() {
  const items = ["⭐", "🎈", "✨", "🌈", "☁️", "🎨"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((e, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-60 sm:text-3xl sm:opacity-70"
          style={{
            left: `${(i * 17 + 8) % 95}%`,
            top: `${(i * 23 + 10) % 80}%`,
          }}
          animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}
