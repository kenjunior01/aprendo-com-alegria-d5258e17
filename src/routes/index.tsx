import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { MascotIcon } from "@/components/MascotIcon";
import { ChunkyButton } from "@/components/ChunkyButton";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { MASCOTS } from "@/lib/mascots";
import { loadProfile, pullProfileFromCloud } from "@/lib/storage";
import { useEffect, useState, useRef } from "react";
import { detectRegion, regionBadgeText, type RegionInfo } from "@/lib/region";
import {
  Flame, Heart, Zap, Trophy, BookOpen, Calculator, Globe,
  Star, Users, Shield, Sparkles, ChevronRight, Play,
  ArrowRight, Award, Crown, CheckCircle2, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, type: "spring", stiffness: 260, damping: 15 },
  }),
};

function Landing() {
  const navigate = useNavigate();
  const [region, setRegion] = useState<RegionInfo | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

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

      {/* ─── Hero Section — Premium Parallax ─── */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-12"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
          className="mb-5"
        >
          <AlegriaLogo priority className="h-20 w-auto sm:h-24 md:h-28" alt="Alegria — Aprender a brincar" />
        </motion.div>

        {/* Region badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-3 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 font-display text-xs font-semibold text-primary shadow-sm backdrop-blur-sm ring-1 ring-border/50 sm:text-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {region ? regionBadgeText(region) : "A detetar a tua região..."}
        </motion.div>

        {/* Main headline — premium gradient text */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-7xl"
        >
          Aprender é{" "}
          <span className="text-gradient-brand relative">
            brincar
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-primary via-xp to-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              style={{ transformOrigin: "left" }}
            />
          </span>
          !
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 max-w-xl text-base text-foreground/80 sm:mt-5 sm:text-lg md:text-xl"
        >
          Português, Matemática e Estudo do Meio com mascotes divertidas, lições curtas e muitas estrelinhas.
        </motion.p>

        {/* ─── Mascot Showcase — Premium Row ─── */}
        <div className="my-8 sm:my-10">
          <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-5">
            {MASCOTS.map((m, i) => (
              <motion.div
                key={m.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="group relative text-center"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="cursor-pointer"
                >
                  {/* Mascot glow ring */}
                  <div className="relative">
                    <Mascot id={m.id} size="md" bouncing={i === 1} className="sm:hidden" />
                    <Mascot id={m.id} size="lg" bouncing={i === 1} className="hidden sm:inline-flex" />
                    <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </motion.div>
                <p className="mt-2 font-display text-sm font-bold">{m.name}</p>
                <p className="mx-auto max-w-[10rem] text-[10px] text-muted-foreground leading-tight">
                  {m.encourage}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── CTA Buttons — Premium ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Link to="/comecar" className="flex-1 sm:flex-none">
            <ChunkyButton tone="primary" className="w-full text-base sm:text-lg group">
              <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
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

        {/* ─── Social Proof Strip — Premium ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          <SocialProofItem icon={<Users className="h-4 w-4" />} value="5.000+" label="famílias" />
          <div className="h-4 w-px bg-border" />
          <SocialProofItem icon={<Star className="h-4 w-4 text-xp" />} value="4.9/5" label="avaliações" />
          <div className="h-4 w-px bg-border" />
          <SocialProofItem icon={<Shield className="h-4 w-4 text-success" />} value="100%" label="seguro" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-10 text-muted-foreground/40"
        >
          <ChevronRight className="h-6 w-6 rotate-90" />
        </motion.div>
      </motion.div>

      {/* ─── Subject Feature Cards — Premium ─── */}
      <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            O <span className="text-gradient-brand">programa português</span>, de forma divertida
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Alinhado com as metas curriculares do 1.º ciclo — do 1.º ao 4.º ano
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          <SubjectFeatureCard
            emoji="📚"
            title="Português"
            text="Vogais, sílabas, gramática e escrita — do 1.º ao 4.º ano. Cada lição tem áudio e feedback imediato."
            colorVar="--pt-portuguese"
            icon={<BookOpen className="h-5 w-5" />}
            lessons={10}
            index={0}
          />
          <SubjectFeatureCard
            emoji="➕"
            title="Matemática"
            text="Contar, tabuada, frações e problemas — passo a passo. Com desafios interativos e recompensas."
            colorVar="--pt-math"
            icon={<Calculator className="h-5 w-5" />}
            lessons={10}
            index={1}
          />
          <SubjectFeatureCard
            emoji="🌍"
            title="Estudo do Meio"
            text="Portugal, ciências, história e ambiente — descobrir o mundo. Inclui mapas e quizzes visuais."
            colorVar="--pt-world"
            icon={<Globe className="h-5 w-5" />}
            lessons={8}
            index={2}
          />
        </div>
      </section>

      {/* ─── How It Works — Premium ─── */}
      <HowItWorks />

      {/* ─── Gamification Preview — Premium ─── */}
      <GamificationPreview />

      {/* ─── Lesson Path Preview — Premium ─── */}
      <LessonPathPreview />

      {/* ─── Testimonials — Premium ─── */}
      <Testimonials />

      {/* ─── Bottom CTA — Premium ─── */}
      <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-premium relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 p-8 text-center sm:p-12"
        >
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-xp/8 blur-2xl" />

          <div className="relative">
            <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
              Pronto para <span className="text-gradient-brand">começar</span>?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Cria o teu perfil em segundos e começa a aventura. É grátis!
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link to="/comecar">
                <ChunkyButton tone="primary" className="w-full sm:w-auto text-base sm:text-lg group">
                  <Rocket className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  Começar agora — grátis
                </ChunkyButton>
              </Link>
              <Link to="/escolas">
                <ChunkyButton tone="ghost" className="w-full sm:w-auto">Escolas — 0,99€/aluno</ChunkyButton>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Sem anúncios</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-success" /> COPPA compliant</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-hearts" /> Feito com amor em Portugal</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer Links ─── */}
      <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/junior" className="hover:text-foreground transition-colors">Alegria Júnior — 2 a 5 anos</Link>
          <Link to="/creches" className="hover:text-foreground transition-colors">Creches — planos B2B</Link>
          <a href="https://alegria.online/privacidade" className="hover:text-foreground transition-colors">Privacidade</a>
          <a href="https://alegria.online/termos" className="hover:text-foreground transition-colors">Termos</a>
        </div>
      </div>
    </main>
  );
}

// ─── Social Proof Item ───
function SocialProofItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {icon}
      <span className="font-display font-bold text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

// ─── Subject Feature Card — Premium ───
function SubjectFeatureCard({ emoji, title, text, colorVar, icon, lessons, index }: {
  emoji: string; title: string; text: string; colorVar: string; icon: React.ReactNode; lessons: number; index: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      className="card-premium group relative overflow-hidden rounded-3xl bg-card p-5 text-left transition-all hover:shadow-glow sm:p-6"
    >
      {/* Decorative gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at 80% 20%, color-mix(in oklab, var(${colorVar}) 12%, transparent), transparent 60%)`,
        }}
      />

      <div className="relative flex items-center gap-3">
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
      <p className="relative mt-3 text-sm text-muted-foreground">{text}</p>
      <div className="relative mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-display" style={{ color: `var(${colorVar})` }}>
          <Sparkles className="h-3.5 w-3.5" />
          Alinhado com o programa nacional
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
          {lessons} lições
        </span>
      </div>
    </motion.div>
  );
}

// ─── How It Works — Premium ───
function HowItWorks() {
  const steps = [
    {
      n: "1", emoji: "👶", title: "Escolhe o teu mascote",
      text: "Cria um perfil divertido em segundos. A tua mascote cresce contigo! Cada um tem uma personalidade única.",
      color: "bg-primary/10",
    },
    {
      n: "2", emoji: "📚", title: "Lições curtinhas",
      text: "5 minutos por dia chega para evoluir. Cada lição é um mini-jogo com sons, animações e feedback imediato.",
      color: "bg-secondary/10",
    },
    {
      n: "3", emoji: "🏆", title: "Sobe de nível",
      text: "Ganha XP, moedas e mantém a streak! Compete com amigos na liga semanal e desbloqueia conquistas.",
      color: "bg-xp/10",
    },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">Como funciona</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Aprender pouco e muitas vezes — como o Duolingo, mas para o programa português
        </p>
      </motion.div>

      <ol className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="card-premium relative overflow-hidden rounded-3xl bg-card p-6 text-left sm:p-7"
          >
            {/* Step number watermark */}
            <span className="absolute -right-3 -top-3 text-8xl opacity-[0.06] font-display font-bold">{s.n}</span>

            {/* Step icon */}
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-3xl", s.color)}>
              {s.emoji}
            </div>

            <h3 className="mt-4 font-display text-lg font-bold sm:text-xl">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>

            {/* Connecting line to next step */}
            {i < 2 && (
              <div className="absolute -bottom-2 left-1/2 hidden h-4 w-px bg-border md:block" />
            )}
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

// ─── Gamification Preview — Premium ───
function GamificationPreview() {
  const features = [
    { icon: <Flame className="h-6 w-6" />, label: "Streak", desc: "Dias seguidos de aprendizagem", color: "text-streak", bg: "bg-streak/10" },
    { icon: <Heart className="h-6 w-6" />, label: "Corações", desc: "Vidas de jogo com refill", color: "text-hearts", bg: "bg-hearts/10" },
    { icon: <Zap className="h-6 w-6" />, label: "XP", desc: "Pontos de experiência", color: "text-xp", bg: "bg-xp/10" },
    { icon: <Trophy className="h-6 w-6" />, label: "Ligas", desc: "Competição semanal", color: "text-leagues-ouro", bg: "bg-leagues-ouro/10" },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
          Aprender a brincar, evoluir a <span className="text-gradient-brand">jogar</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Mecânicas de jogo que mantêm a motivação — como o Duolingo, mas para crianças
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card-premium flex flex-col items-center rounded-3xl bg-card p-5 text-center transition-all hover:shadow-glow sm:p-6"
          >
            <div className={cn("mb-3 flex h-14 w-14 items-center justify-center rounded-2xl", f.bg, f.color)}>
              {f.icon}
            </div>
            <p className="font-display text-sm font-bold">{f.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Lesson Path Preview — Premium ───
function LessonPathPreview() {
  const nodes = [
    { e: "🅰️", t: "Vogais", desc: "5 min · 10 XP", colorVar: "--pt-portuguese" },
    { e: "🔢", t: "Contar", desc: "5 min · 10 XP", colorVar: "--pt-math" },
    { e: "📖", t: "Ler", desc: "5 min · 15 XP", colorVar: "--pt-portuguese" },
    { e: "✖️", t: "Tabuada", desc: "5 min · 20 XP", colorVar: "--pt-math" },
    { e: "🌍", t: "Mundo", desc: "5 min · 15 XP", colorVar: "--pt-world" },
  ];

  return (
    <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
          O caminho da <span className="text-gradient-brand">aprendizagem</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Cada nó é uma mini-lição, com sons, animações e mascotes
        </p>
      </motion.div>

      <div className="relative mx-auto max-w-md">
        {/* Background path line */}
        <div className="absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 rounded-full bg-muted/50" />

        {nodes.map((n, i) => (
          <motion.div
            key={n.t}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "relative mb-4 flex items-center gap-3",
              i % 2 === 0 ? "ml-0 mr-auto" : "ml-auto mr-0",
            )}
            style={{ width: "min(85%, 22rem)" }}
          >
            {/* Node circle */}
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl shadow-md ring-2 ring-card transition-transform hover:scale-105"
              style={{ backgroundColor: `color-mix(in oklab, var(${n.colorVar}) 15%, var(--card))` }}
            >
              {n.e}
            </div>

            {/* Node card */}
            <div className="card-premium flex-1 rounded-2xl bg-card px-4 py-3">
              <p className="font-display text-base font-bold">{n.t}</p>
              <p className="text-xs text-muted-foreground">{n.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials — Premium ───
const TESTIMONIALS = [
  { name: "Sofia M.", role: "Mãe do Tomás (6)", text: "O meu filho pede para fazer 'mais uma' lição todos os dias. Aprende sem perceber!", emoji: "👩" },
  { name: "Prof. Ana", role: "1.º ciclo · Lisboa", text: "Uso na sala de aula. Os miúdos adoram e o currículo está mesmo alinhado com o programa nacional.", emoji: "👩‍🏫" },
  { name: "Ricardo P.", role: "Pai da Beatriz (8)", text: "O painel de pais ajuda-me a perceber onde ela tem mais dificuldade. Recomendo!", emoji: "👨" },
];

function Testimonials() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-8 text-center"
      >
        <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
          O que dizem pais e <span className="text-gradient-brand">professores</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Famílias reais a aprender com a Alegria em Portugal e países PALOP
        </p>
      </motion.div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card-premium rounded-3xl bg-card p-5 text-left sm:p-6"
          >
            <div className="mb-3 flex gap-0.5 text-xp text-sm">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-sm leading-relaxed">"{t.text}"</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-2xl">{t.emoji}</span>
              <div>
                <p className="font-display text-sm font-bold leading-tight">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
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
  const items = ["⭐", "🎈", "✨", "🌈", "☁️", "🎨", "🌟", "💫"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((e, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-40 sm:text-3xl sm:opacity-50"
          style={{
            left: `${(i * 13 + 5) % 95}%`,
            top: `${(i * 19 + 8) % 85}%`,
          }}
          animate={{
            y: [0, -15 - i * 2, 0],
            rotate: [0, 8, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}
