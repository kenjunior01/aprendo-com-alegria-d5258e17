import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { useMemo, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Sparkles, Gamepad2, Zap, Flame, Star, Target, Clock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { playLevelUp, playCorrect, speak } from "@/lib/audio";
import { ARCADE_POOL, type GameEntry } from "@/lib/juniorGameRegistry";

export const Route = createFileRoute("/arcade")({
  head: () => ({
    meta: [
      { title: "Modo Arcade — Alegria" },
      { name: "description", content: "Modo Arcade Alegria: varios mini-jogos seguidos para todas as idades. Ganha pontos e bate o teu recorde!" },
      { property: "og:title", content: "Modo Arcade — Alegria" },
      { property: "og:description", content: "Modo Arcade Alegria: varios mini-jogos seguidos. Ganha pontos e bate o teu recorde." },
      { property: "og:url", content: "https://alegria.online/arcade" },
    ],
    links: [{ rel: "canonical", href: "https://alegria.online/arcade" }],
  }),
  component: ArcadePage,
});

const GameLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex items-center justify-center p-8"><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-4xl">🎮</motion.span></div>}>
    {children}
  </Suspense>
);

const HISCORE_KEY = "alegria-arcade-hiscore";

const GAME_TYPES = [
  { emoji: "🎯", label: "Toca no objecto", desc: "Formas, cores e sons" },
  { emoji: "🧩", label: "Encontra o par", desc: "Memoria visual" },
  { emoji: "🔢", label: "Conta e escolhe", desc: "Numeros e contagem" },
  { emoji: "🎵", label: "Segue o ritmo", desc: "Sequencias e padroes" },
  { emoji: "🅰️", label: "Identifica letras", desc: "Vogais e silabas" },
];

function pickRun(n: number): GameEntry[] {
  const shuffled = [...ARCADE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function ArcadePage() {
  const [run, setRun] = useState<GameEntry[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const hi = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(HISCORE_KEY) ?? "0");
  }, [finished]);

  const start = (n: number) => {
    setRun(pickRun(n));
    setIdx(0); setScore(0); setFinished(false);
    speak(`Modo Arcade! ${n} jogos seguidos. Vamos la!`, { rate: 0.95 });
  };
  const nextGame = () => {
    playCorrect();
    setScore((s) => s + 20);
    if (!run) return;
    if (idx + 1 >= run.length) {
      setFinished(true);
      playLevelUp();
      const total = score + 20;
      const prev = Number(localStorage.getItem(HISCORE_KEY) ?? "0");
      if (total > prev) localStorage.setItem(HISCORE_KEY, String(total));
      speak(`Fim! Fizeste ${total} pontos.`, { rate: 0.95 });
    } else {
      setIdx((i) => i + 1);
    }
  };

  const currentEntry = run?.[idx];
  const CurrentComp = currentEntry?.component;

  return (
    <div className="bg-sky-island min-h-[100dvh] pb-28">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/junior" className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Junior
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1 font-display text-xs">
          <Sparkles className="h-3 w-3 text-primary" /> Modo Arcade
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {!run && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Hero */}
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block text-5xl sm:text-6xl mb-2"
              >
                🕹️
              </motion.div>
              <h1 className="font-display text-4xl sm:text-5xl">Modo Arcade</h1>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Varios mini-jogos seguidos. Sem pausa, sem repeticao &mdash; cada sessao e unica! Quantos pontos consegues acumular?
              </p>
            </div>

            {/* Stats bar */}
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 font-display">
                <Trophy className="h-5 w-5 text-xp" />
                <span className="text-sm">Recorde: <strong className="text-xp">{hi}</strong> pts</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 font-display">
                <Gamepad2 className="h-5 w-5 text-primary" />
                <span className="text-sm"><strong>{ARCADE_POOL.length}</strong> jogos disponiveis</span>
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ChunkyButton tone="primary" onClick={() => start(3)} className="w-full flex flex-col items-center gap-1 py-4">
                  <Zap className="h-6 w-6" />
                  <span className="font-display text-base">Curto</span>
                  <span className="text-xs opacity-70">3 jogos · ~2 min</span>
                </ChunkyButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ChunkyButton tone="success" onClick={() => start(5)} className="w-full flex flex-col items-center gap-1 py-4">
                  <Star className="h-6 w-6" />
                  <span className="font-display text-base">Normal</span>
                  <span className="text-xs opacity-70">5 jogos · ~4 min</span>
                </ChunkyButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ChunkyButton tone="danger" onClick={() => start(8)} className="w-full flex flex-col items-center gap-1 py-4">
                  <Flame className="h-6 w-6" />
                  <span className="font-display text-base">Maratona</span>
                  <span className="text-xs opacity-70">8 jogos · ~7 min</span>
                </ChunkyButton>
              </motion.div>
            </div>

            {/* How it works */}
            <div className="mt-6 rounded-3xl bg-card/60 border border-border p-5 max-w-lg mx-auto">
              <h3 className="font-display text-lg text-center mb-3">Como funciona?</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary shrink-0" />
                  <span>Cada jogo e aleatorio &mdash; nunca repetes a mesma sequencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xp font-bold shrink-0">+20</span>
                  <span>Completa cada jogo e ganha 20 pontos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Joga rapido &mdash; cada sessao dura entre 2 e 7 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-xp shrink-0" />
                  <span>Bate o teu recorde pessoal e celebra com os mascotes!</span>
                </div>
              </div>
            </div>

            {/* Game type preview */}
            <div className="mt-6 max-w-lg mx-auto">
              <h3 className="font-display text-lg text-center mb-3">Tipos de jogos que vais encontrar</h3>
              <div className="grid grid-cols-5 gap-2">
                {GAME_TYPES.map((g) => (
                  <motion.div
                    key={g.emoji}
                    whileHover={{ scale: 1.1 }}
                    className="rounded-2xl bg-card border border-border p-2 text-center"
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <p className="text-xs font-display mt-1 leading-tight">{g.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-xs text-center text-muted-foreground">
              Para todas as idades. Os jogos sao seleccionados automaticamente do pool de {ARCADE_POOL.length} mini-jogos.
            </p>
          </motion.section>
        )}

        {run && !finished && currentEntry && CurrentComp && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm">Jogo {idx + 1}/{run.length}</span>
              <span className="rounded-full bg-card px-3 py-1 font-display text-sm">⭐ {score} pts</span>
            </div>
            <div className="rounded-3xl bg-card/80 p-4">
              <h2 className="text-center font-display text-2xl">{currentEntry.emoji} {currentEntry.title}</h2>
              <div className="mt-3">
                <GameLoader><CurrentComp /></GameLoader>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <ChunkyButton tone="success" onClick={nextGame}>
                {idx + 1 >= run.length ? "Terminar 🎉" : "Proximo ➡️"}
              </ChunkyButton>
            </div>
          </section>
        )}

        {finished && (
          <motion.section initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <h2 className="font-display text-4xl">🏆 {score} pontos!</h2>
            <p className="mt-2 text-muted-foreground">Recorde: {Math.max(score, hi)} pts</p>
            <div className="mt-6 flex justify-center gap-2">
              <ChunkyButton tone="primary" onClick={() => { setRun(null); setFinished(false); }}>Jogar de novo</ChunkyButton>
              <Link to="/junior"><ChunkyButton tone="ghost">Voltar ao Junior</ChunkyButton></Link>
            </div>
          </motion.section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
