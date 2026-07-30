import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { MASCOTS } from "@/lib/mascots";
import { loadProfile, pullProfileFromCloud } from "@/lib/storage";
import { useEffect, useState } from "react";
import { detectRegion, regionBadgeText, type RegionInfo } from "@/lib/region";
import { Flame, Heart, Zap, Trophy, BookOpen, Calculator, Globe, Star, Users, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alegria — Aprender a brincar | App educativa para crianças" },
      { name: "description", content: "App de aprendizagem infantil estilo Duolingo, para o 1.º ciclo em Portugal. Português, Matemática e Estudo do Meio com mascotes divertidas." },
      { property: "og:title", content: 'Alegria — Aprender a brincar | App educativa para crianças' },
      { property: "og:description", content: 'App de aprendizagem infantil estilo Duolingo, para o 1.º ciclo em Portugal. Português, Matemática e Estudo do Meio com mascotes divertidas.' },
      { property: "og:url", content: "https://alegria.online/" },
    ],
    links: [
      { rel: "canonical", href: "https://alegria.online/" },
    ],
  }),
  component: Landing,
});

// ─── Animation Variants ───
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

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
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <main className="bg-alegria-hero relative min-h-[100dvh] overflow-hidden">
      <FloatingDecor />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-12">

        {/* ─── Hero Section ─── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-4"
        >
          <AlegriaLogo priority className="h-20 w-auto sm:h-24 md:h-28" alt="Alegria — Aprender a brincar" />
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-2 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 font-display text-xs font-semibold text-primary shadow-sm sm:text-sm"
        >
          {region ? regionBadgeText(region) : "A detetar a tua região..."}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-7xl"
        >
          Aprender é <span className="text-gradient-brand">brincar</span>!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 max-w-xl text-base text-foreground/80 sm:mt-4 sm:text-lg md:text-xl"
        >
          Português, Matemática e Estudo do Meio com mascotes divertidas, lições curtas e muitas estrelinhas.
        </motion.p>

        {/* ─── Mascot Row ─── */}
        <div className="my-8 flex flex-wrap items-end justify-center gap-3 sm:my-10 sm:gap-5">
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
              <p className="text-[10px] text-muted-foreground">{m.personality}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── CTA Buttons ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row"
        >
          <Link to="/comecar" className="flex-1 sm:flex-none">
            <ChunkyButton tone="primary" className="w-full text-base sm:text-lg">
              Começar a aventura
            </ChunkyButton>
          </Link>
          <Link to="/auth" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">Já tenho conta</ChunkyButton>
          </Link>
          <Link to="/pais" className="flex-1 sm:flex-none">
            <ChunkyButton tone="secondary" className="w-full">Sou pai/mãe</ChunkyButton>
          </Link>
        </motion.div>

        {/* ─── Social Proof Strip ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 5.000+ famílias</span>
          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-xp" /> 4.9/5 avaliações</span>
          <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-success" /> 100% seguro</span>
        </motion.div>

        {/* ─── Subject Feature Cards ─── */}
        <div className="mt-14 grid w-full gap-4 sm:mt-16 sm:gap-5 md:grid-cols-3">
          <SubjectFeatureCard
            emoji="📚"
            title="Português"
            text="Vogais, sílabas, gramática e escrita — do 1.º ao 4.º ano"
            colorVar="--pt-portuguese"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <SubjectFeatureCard
            emoji="➕"
            title="Matemática"
            text="Contar, tabuada, frações e problemas — passo a passo"
            colorVar="--pt-math"
            icon={<Calculator className="h-5 w-5" />}
          />
          <SubjectFeatureCard
            emoji="🌍"
            title="Estudo do Meio"
            text="Portugal, ciências, história e ambiente — descobrir o mundo"
            colorVar="--pt-world"
            icon={<Globe className="h-5 w-5" />}
          />
        </div>

        {/* ─── How It Works ─── */}
        <HowItWorks />

        {/* ─── Gamification Preview ─── */}
        <GamificationPreview />

        {/* ─── Lesson Path Preview ─── */}
        <LessonPathPreview />

        {/* ─── Testimonials ─── */}
        <Testimonials />

        {/* ─── Bottom CTAs ─── */}
        <div className="mt-10 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link to="/junior" className="flex-1 sm:flex-none">
            <ChunkyButton tone="secondary" className="w-full">Alegria Júnior — 2 a 5 anos</ChunkyButton>
          </Link>
          <Link to="/escolas" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">Escolas — 0,99€/aluno</ChunkyButton>
          </Link>
          <Link to="/creches" className="flex-1 sm:flex-none">
            <ChunkyButton tone="ghost" className="w-full">Creches — planos B2B</ChunkyButton>
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Subject Feature Card — Premium ───
function SubjectFeatureCard({ emoji, title, text, colorVar, icon }: {
  emoji: string; title: string; text: string; colorVar: string; icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-premium group overflow-hidden rounded-3xl bg-card p-5 text-left transition-all hover:shadow-glow"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform group-hover:scale-110"
          style={{ backgroundColor: `color-mix(in oklab, var(${colorVar}) 18%, var(--card))` }}
        >
          {emoji}
        </div>
        <div className="flex items-center gap-2" style={{ color: `var(${colorVar})` }}>
          {icon}
          <h3 className="font-display text-lg">{title}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-display" style={{ color: `var(${colorVar})` }}>
        <Sparkles className="h-3.5 w-3.5" />
        <span>Alinhado com o programa nacional</span>
      </div>
    </motion.div>
  );
}

// ─── How It Works ───
function HowItWorks() {
  const steps = [
    { n: "1", emoji: "👶", title: "Escolhe o teu mascote", text: "Cria um perfil divertido em segundos. A tua mascote cresce contigo!" },
    { n: "2", emoji: "📚", title: "Lições curtinhas", text: "5 minutos por dia chega para evoluir. Cada lição é um mini-jogo." },
    { n: "3", emoji: "🏆", title: "Sobe de nível", text: "Ganha XP, moedas e mantém a streak! Compete com amigos na liga semanal." },
  ];
  return (
    <section className="mt-16 w-full sm:mt-20">
      <h2 className="mb-2 text-center font-display text-2xl sm:text-3xl">Como funciona</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">Aprender pouco e muitas vezes — como o Duolingo, mas para o programa português.</p>
      <ol className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card-premium relative overflow-hidden rounded-3xl bg-card p-6 text-left"
          >
            <span className="absolute -right-3 -top-3 text-8xl opacity-[0.06] font-display font-bold">{s.n}</span>
            <div className="text-3xl">{s.emoji}</div>
            <h3 className="mt-3 font-display text-lg sm:text-xl">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

// ─── Gamification Preview ───
function GamificationPreview() {
  const features = [
    { icon: <Flame className="h-5 w-5" />, label: "Streak", desc: "Dias seguidos", color: "text-streak" },
    { icon: <Heart className="h-5 w-5" />, label: "Corações", desc: "Vidas de jogo", color: "text-hearts" },
    { icon: <Zap className="h-5 w-5" />, label: "XP", desc: "Pontos de experiência", color: "text-xp" },
    { icon: <Trophy className="h-5 w-5" />, label: "Ligas", desc: "Competição semanal", color: "text-leagues-ouro" },
  ];
  return (
    <section className="mt-16 w-full sm:mt-20">
      <h2 className="mb-2 text-center font-display text-2xl sm:text-3xl">Aprender a brincar, evoluir a jogar</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">Mecânicas de jogo que mantêm a motivação — como o Duolingo, mas para crianças.</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card-premium flex flex-col items-center rounded-3xl bg-card p-5 text-center transition-all hover:shadow-glow"
          >
            <div className={cn("mb-2", f.color)}>{f.icon}</div>
            <p className="font-display text-sm font-bold">{f.label}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Lesson Path Preview ───
function LessonPathPreview() {
  const nodes = [
    { e: "🅰️", t: "Vogais", tone: "bg-primary text-primary-foreground" },
    { e: "🔢", t: "Contar", tone: "bg-secondary text-secondary-foreground" },
    { e: "📖", t: "Ler", tone: "bg-accent text-accent-foreground" },
    { e: "✖️", t: "Tabuada", tone: "bg-success text-success-foreground" },
    { e: "🌍", t: "Mundo", tone: "bg-xp text-foreground" },
  ];
  return (
    <section className="mt-16 w-full sm:mt-20">
      <h2 className="mb-2 text-center font-display text-2xl sm:text-3xl">O caminho da aprendizagem</h2>
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
            <div className="card-premium flex-1 rounded-2xl bg-card px-4 py-3">
              <p className="font-display text-base">{n.t}</p>
              <p className="text-xs text-muted-foreground">5 min · {(i + 1) * 10} XP</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ───
const TESTIMONIALS = [
  { name: "Sofia M.", role: "Mãe do Tomás (6)", text: "O meu filho pede para fazer 'mais uma' lição todos os dias. Aprende sem perceber!", emoji: "👩" },
  { name: "Prof. Ana", role: "1.º ciclo · Lisboa", text: "Uso na sala de aula. Os miúdos adoram e o currículo está mesmo alinhado com o programa nacional.", emoji: "👩‍🏫" },
  { name: "Ricardo P.", role: "Pai da Beatriz (8)", text: "O painel de pais ajuda-me a perceber onde ela tem mais dificuldade. Recomendo!", emoji: "👨" },
];

function Testimonials() {
  return (
    <section className="mt-16 w-full sm:mt-20">
      <h2 className="mb-2 text-center font-display text-2xl sm:text-3xl">O que dizem pais e professores</h2>
      <p className="mb-6 text-center text-sm text-muted-foreground">Famílias reais a aprender com a Alegria em Portugal e países PALOP.</p>
      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card-premium rounded-3xl bg-card p-5 text-left"
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

// ─── Floating Decorations ───
function FloatingDecor() {
  const items = ["⭐", "🎈", "✨", "🌈", "☁️", "🎨"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((e, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-50 sm:text-3xl sm:opacity-60"
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
