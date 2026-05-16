import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { playLevelUp, playCorrect, speak } from "@/lib/audio";
import {
  GameTapCor, GameAnimaTap, GameNumTap13, GameGrandePequeno, GameFrutaTap,
  GameCorRoupa, GameAnimaGrande, GameEstrelasTap, GameCarroCor,
  GameComidaTap, GameFormaRedonda,
} from "@/components/junior/JuniorGamesV6";
import {
  GameInstrumentos, GameTempo, GameProfissoes, GameParteDia, GameContrarios,
  GameNum46, GameFormaSimples, GameFamilia, GameVeiculos, GameSonsNatu,
} from "@/components/junior/JuniorGamesV7";

export const Route = createFileRoute("/arcade")({
  head: () => ({
    meta: [
      { title: "Modo Arcade — Kidoz" },
      { name: "description", content: "Modo Arcade Kidoz: 5 mini-jogos seguidos para todas as idades. Ganha pontos e bate o teu recorde!" },
      { property: "og:title", content: "Modo Arcade — Kidoz" },
      { property: "og:description", content: "Modo Arcade Kidoz: 5 mini-jogos seguidos. Ganha pontos e bate o teu recorde." },
      { property: "og:url", content: "https://kidoz.online/arcade" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/arcade" }],
  }),
  component: ArcadePage,
});

type ArcadeEntry = { id: string; title: string; emoji: string; el: () => JSX.Element };

const POOL: ArcadeEntry[] = [
  { id: "tap-cor", title: "Toca na Cor", emoji: "🎨", el: GameTapCor },
  { id: "anima-tap", title: "Toca no Animal", emoji: "🐶", el: GameAnimaTap },
  { id: "num-tap-1-3", title: "Números 1·2·3", emoji: "🔢", el: GameNumTap13 },
  { id: "grande-pequeno-tap", title: "Grande/Pequeno", emoji: "🐘", el: GameGrandePequeno },
  { id: "fruta-tap", title: "Toca na Fruta", emoji: "🍎", el: GameFrutaTap },
  { id: "cor-roupa", title: "Cor da Roupa", emoji: "🧥", el: GameCorRoupa },
  { id: "anima-grande", title: "Animal Grande", emoji: "🦁", el: GameAnimaGrande },
  { id: "estrelas-tap", title: "Conta Estrelas", emoji: "⭐", el: GameEstrelasTap },
  { id: "carro-cor", title: "Carro da Cor", emoji: "🚗", el: GameCarroCor },
  { id: "comida-tap", title: "Toca na Comida", emoji: "🍞", el: GameComidaTap },
  { id: "forma-redonda", title: "Toca na Forma", emoji: "⚪", el: GameFormaRedonda },
  { id: "instrumentos", title: "Instrumento", emoji: "🎶", el: GameInstrumentos },
  { id: "tempo-meteo", title: "Que tempo faz?", emoji: "🌦️", el: GameTempo },
  { id: "profissoes", title: "Profissões", emoji: "🧑‍⚕️", el: GameProfissoes },
  { id: "parte-dia", title: "Parte do Dia", emoji: "🌅", el: GameParteDia },
  { id: "contrarios", title: "Quente/Frio", emoji: "🔥", el: GameContrarios },
  { id: "num-tap-4-6", title: "Números 4·5·6", emoji: "🔢", el: GameNum46 },
  { id: "forma-simples", title: "Forma+", emoji: "⭐", el: GameFormaSimples },
  { id: "familia", title: "Família", emoji: "👪", el: GameFamilia },
  { id: "veiculos-tap", title: "Veículos", emoji: "🚗", el: GameVeiculos },
  { id: "sons-natu", title: "Sons da Natureza", emoji: "🌳", el: GameSonsNatu },
];

const HISCORE_KEY = "kidoz-arcade-hiscore";

function pickRun(n: number): ArcadeEntry[] {
  const shuffled = [...POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function ArcadePage() {
  const [run, setRun] = useState<ArcadeEntry[] | null>(null);
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
    speak(`Modo Arcade! ${n} jogos seguidos. Vamos lá!`, { rate: 0.95 });
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

  const Current = run?.[idx]?.el;

  return (
    <div className="bg-sky-island min-h-[100dvh] pb-28">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/junior" className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Júnior
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1 font-display text-xs">
          <Sparkles className="h-3 w-3 text-primary" /> Modo Arcade
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {!run && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="font-display text-4xl sm:text-5xl">🕹️ Modo Arcade</h1>
            <p className="mt-2 text-muted-foreground">Vários mini-jogos seguidos. Quantos pontos consegues?</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 font-display text-sm">
              <Trophy className="h-4 w-4 text-xp" /> Recorde: {hi} pts
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ChunkyButton tone="primary" onClick={() => start(3)}>⚡ Curto · 3 jogos</ChunkyButton>
              <ChunkyButton tone="success" onClick={() => start(5)}>🌟 Normal · 5 jogos</ChunkyButton>
              <ChunkyButton tone="warning" onClick={() => start(8)}>🔥 Maratona · 8 jogos</ChunkyButton>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Para todas as idades. Quando terminares cada jogo, toca em <strong>Próximo</strong> para somar 20 pts.
            </p>
          </motion.section>
        )}

        {run && !finished && Current && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm">Jogo {idx + 1}/{run.length}</span>
              <span className="rounded-full bg-card px-3 py-1 font-display text-sm">⭐ {score} pts</span>
            </div>
            <div className="rounded-3xl bg-card/80 p-4">
              <h2 className="text-center font-display text-2xl">{run[idx].emoji} {run[idx].title}</h2>
              <div className="mt-3"><Current /></div>
            </div>
            <div className="mt-4 flex justify-end">
              <ChunkyButton tone="success" onClick={nextGame}>
                {idx + 1 >= run.length ? "Terminar 🎉" : "Próximo ➡️"}
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
              <Link to="/junior"><ChunkyButton tone="ghost">Voltar ao Júnior</ChunkyButton></Link>
            </div>
          </motion.section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
