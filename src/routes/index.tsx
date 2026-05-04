import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS } from "@/lib/mascots";
import { loadProfile } from "@/lib/storage";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lusis — Aprender a brincar | App educativa para crianças" },
      { name: "description", content: "App de aprendizagem infantil estilo Duolingo, para o 1.º ciclo em Portugal. Português, Matemática e Estudo do Meio com mascotes divertidas." },
      { property: "og:title", content: "Lusis — Aprender a brincar" },
      { property: "og:description", content: "App educativa para crianças do 1.º ciclo, com mascotes e desafios divertidos." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const p = loadProfile();
    if (p && p.name) {
      navigate({ to: "/app" });
    }
  }, [navigate]);

  return (
    <main className="bg-paper relative min-h-screen overflow-hidden">
      {/* floating shapes */}
      <FloatingDecor />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-2 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 font-display text-sm font-semibold text-primary shadow-sm"
        >
          🇵🇹 Feito para o 1.º ciclo em Portugal
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl font-bold leading-tight md:text-7xl"
        >
          Aprender é <span className="text-primary">brincar</span>!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl text-lg text-muted-foreground md:text-xl"
        >
          Português, Matemática e Estudo do Meio com mascotes divertidas, lições curtas e muitas estrelinhas. ✨
        </motion.p>

        {/* mascot row */}
        <div className="my-10 flex flex-wrap items-end justify-center gap-4">
          {MASCOTS.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
              className="text-center"
            >
              <Mascot id={m.id} size="lg" bouncing={i === 1} />
              <p className="mt-1 font-display text-sm font-semibold">{m.name}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link to="/comecar">
            <ChunkyButton tone="primary" className="text-lg">
              Começar a aventura 🚀
            </ChunkyButton>
          </Link>
          <Link to="/app">
            <ChunkyButton tone="ghost">Já joguei antes</ChunkyButton>
          </Link>
        </motion.div>

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          <FeatureCard emoji="📚" title="Português" text="Vogais, sílabas, rimas e plurais" />
          <FeatureCard emoji="➕" title="Matemática" text="Contar, somar, subtrair e tabuada" />
          <FeatureCard emoji="🌍" title="Estudo do Meio" text="Portugal, corpo humano, natureza" />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-5 text-left">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-2 font-display text-xl">{title}</h3>
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
          className="absolute text-3xl opacity-70"
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
