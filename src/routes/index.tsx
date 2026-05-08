import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { KidozLogo } from "@/components/KidozLogo";
import { MASCOTS } from "@/lib/mascots";
import { loadProfile, pullProfileFromCloud } from "@/lib/storage";
import { useEffect, useState } from "react";
import { detectRegion, regionBadgeText, type RegionInfo } from "@/lib/region";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kidoz — Aprender a brincar | App educativa para crianças" },
      { name: "description", content: "App de aprendizagem infantil estilo Duolingo, para o 1.º ciclo em Portugal. Português, Matemática e Estudo do Meio com mascotes divertidas." },
      { property: "og:title", content: "Kidoz — Aprender a brincar" },
      { property: "og:description", content: "App educativa para crianças do 1.º ciclo, com mascotes e desafios divertidos." },
    ],
  }),
  component: Landing,
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
    <main className="bg-sky-island relative min-h-[100dvh] overflow-hidden">
      {/* floating shapes */}
      <FloatingDecor />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-3"
        >
          <KidozLogo priority className="h-20 w-auto sm:h-24 md:h-28" alt="Kidoz — Aprender a brincar" />
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
          className="mt-3 max-w-xl text-base text-muted-foreground sm:mt-4 sm:text-lg md:text-xl"
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
      </div>
    </main>
  );
}

function FeatureCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-4 text-left sm:p-5">
      <div className="text-2xl sm:text-3xl">{emoji}</div>
      <h3 className="mt-2 font-display text-lg sm:text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
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
