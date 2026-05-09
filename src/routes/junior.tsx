import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  GARDENS, GAMES, getGardenGames,
  loadJuniorProgress, getActiveJuniorChildId, listJuniorChildren,
  type JuniorGame, type JuniorProgress, type JuniorChild,
} from "@/lib/junior";
import {
  GameJardimCores, GameOrquestraAnimais, GameRotinasKido, GameLivroMagico,
} from "@/components/junior/JuniorGames";
import {
  GameContaPatinhos, GameBolhas, GameMeuCorpo, GameMemoria, GameLetraAventura,
  GameFormas, GameMercado, GameSoletrar, GameMatematica, GameCientista,
  GameRelogio, GamePalop,
} from "@/components/junior/JuniorGamesExtra";
import { JuniorChildSwitcher } from "@/components/junior/JuniorChildSwitcher";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/junior")({
  head: () => ({
    meta: [
      { title: "Kidoz Júnior — Jogos para crianças 2-5 anos" },
      { name: "description", content: "Jogos seguros e divertidos para crianças dos 2 aos 5 anos: cores, animais, rotinas e histórias mágicas." },
      { property: "og:title", content: "Kidoz Júnior — 2 a 5 anos" },
      { property: "og:description", content: "Três jardins temáticos com jogos sensoriais, sons de animais e preparação escolar." },
    ],
  }),
  component: JuniorPage,
});

function JuniorPage() {
  const [active, setActive] = useState<JuniorGame | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<JuniorChild | null>(null);
  const [progress, setProgress] = useState<JuniorProgress>({ playedGames: [], totalSessions: 0, lastPlayedAt: null, highlights: [] });

  const refresh = (childId?: string | null) => {
    const id = childId ?? getActiveJuniorChildId();
    setActiveChildId(id);
    setActiveChild(listJuniorChildren().find((c) => c.id === id) ?? null);
    setProgress(loadJuniorProgress(id));
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (!active) refresh(activeChildId); }, [active, activeChildId]);

  const greet = activeChild ? `Olá, ${activeChild.name}! 🌟` : "Os meus Jardins Mágicos 🌷";

  return (
    <div className="bg-sky-island min-h-[100dvh] pb-28">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1 font-display text-xs">
          <Sparkles className="h-3 w-3 text-primary" /> Kidoz Júnior · 2-5 anos
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          {activeChild && (
            <div className="mb-2 flex justify-center"><Mascot id={activeChild.mascot} size="md" /></div>
          )}
          <h1 className="font-display text-4xl sm:text-5xl">{greet}</h1>
          <p className="mt-2 text-base text-muted-foreground">Escolhe um jardim e vamos brincar!</p>
        </motion.section>

        <div className="mt-6">
          <JuniorChildSwitcher onChange={(id) => refresh(id)} />
        </div>

        {activeChild && (
          <section className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="Jogos" value={`${progress.playedGames.length}/${GAMES.length}`} />
            <Stat label="Sessões" value={String(progress.totalSessions)} />
            <Stat label="Última" value={progress.lastPlayedAt ? new Date(progress.lastPlayedAt).toLocaleDateString("pt-PT") : "—"} />
          </section>
        )}

        <section className="mt-8 space-y-8">
          {GARDENS.map((g) => (
            <div key={g.id} className={`card-chunky rounded-3xl border-2 border-border ${g.color} p-5 sm:p-7`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{g.emoji}</span>
                <div>
                  <h2 className="font-display text-2xl">{g.name}</h2>
                  <p className="text-xs text-muted-foreground">{g.age} anos · {g.tagline}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {getGardenGames(g.id).map((game) => {
                  const played = progress.playedGames.includes(game.id);
                  return (
                    <button
                      key={game.id}
                      onClick={() => activeChildId ? setActive(game) : alert("Cria primeiro um perfil de criança ✨")}
                      className="touch-target-kid card-chunky group flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-transform hover:-translate-y-0.5"
                    >
                      <span className="text-4xl">{game.emoji}</span>
                      <span className="flex-1">
                        <span className="block font-display text-lg">{game.title}</span>
                        <span className="block text-xs text-muted-foreground">{game.description}</span>
                      </span>
                      {played && <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">⭐</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-center text-sm">
          És pai/mãe? Vê o progresso de cada criança em{" "}
          <Link to="/pais" className="font-display text-primary underline">Painel de Pais</Link>.
        </section>
      </main>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{active?.emoji} {active?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {active?.id === "jardim-cores" && <GameJardimCores />}
            {active?.id === "orquestra-animais" && <GameOrquestraAnimais />}
            {active?.id === "rotinas-kido" && <GameRotinasKido />}
            {active?.id === "livro-magico" && <GameLivroMagico />}
            {active?.id === "conta-patinhos" && <GameContaPatinhos />}
            {active?.id === "bolhas-sabao" && <GameBolhas />}
            {active?.id === "meu-corpo" && <GameMeuCorpo />}
            {active?.id === "memoria-animais" && <GameMemoria />}
            {active?.id === "letra-aventura" && <GameLetraAventura />}
            {active?.id === "formas-geo" && <GameFormas />}
            {active?.id === "frutas-mercado" && <GameMercado />}
            {active?.id === "soletrar" && <GameSoletrar />}
            {active?.id === "matematica-magica" && <GameMatematica />}
            {active?.id === "pequeno-cientista" && <GameCientista />}
            {active?.id === "relogio-kido" && <GameRelogio />}
            {active?.id === "mapa-palop" && <GamePalop />}
          </div>
          <div className="mt-2 flex justify-end">
            <ChunkyButton tone="ghost" onClick={() => setActive(null)}>Fechar</ChunkyButton>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card/80 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}

void GAMES;
