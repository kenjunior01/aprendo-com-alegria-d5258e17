import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  GARDENS, GAMES, getGardenGames, gardenProgressFor, currentLevel,
  loadJuniorProgress, getActiveJuniorChildId, listJuniorChildren,
  recordJuniorPlay,
  type JuniorGame, type JuniorProgress, type JuniorChild,
} from "@/lib/junior";
import { grantSticker, type JuniorSticker } from "@/lib/juniorRewards";
import { JuniorCelebration } from "@/components/junior/JuniorCelebration";
import { JuniorStickerBook } from "@/components/junior/JuniorStickerBook";
import { haptic } from "@/lib/haptics";
import { pullJuniorCloud, scheduleJuniorCloudPush } from "@/lib/juniorCloud";
import {
  GameJardimCores, GameOrquestraAnimais, GameRotinasKido, GameLivroMagico,
} from "@/components/junior/JuniorGames";
import {
  GameContaPatinhos, GameBolhas, GameMeuCorpo, GameMemoria, GameLetraAventura,
  GameFormas, GameMercado, GameSoletrar, GameMatematica, GameCientista,
  GameRelogio, GamePalop,
} from "@/components/junior/JuniorGamesExtra";
import {
  GamePinta, GameEco, GameJardimMagico, GamePuzzle, GameCacaTesouro, GameEstacoes, GameEmocoes,
} from "@/components/junior/JuniorGamesV2";
import {
  GameSombras, GamePadroes, GameLabirinto, GameTriviaJr,
} from "@/components/junior/JuniorGamesV3";
import {
  GameSomaRapida, GameTabuada, GameFracoes, GameSilabas, GameFormaFrase, GameAntonimos,
  GameMapaPT, GameCicloAgua, GameHabitats, GameBandeiras, GameSpellingEN, GameColorsEN,
  GameSimon, GameLogica, GameTriviaOnline,
} from "@/components/junior/JuniorGamesV4";
import {
  GameBaloes, GamePares, GameTransportes, GameTamanho, GameContaDedos,
  GameAlimentaBebe, GameOndeEsta, GameNumeros, GameFormasCor, GameImitaSom,
} from "@/components/junior/JuniorGamesV5";
import {
  GameTapCor, GameAnimaTap, GameNumTap13, GameGrandePequeno, GameFrutaTap,
  GameSomAnima, GameCorRoupa, GameAnimaGrande, GameTapPatPat, GameEstrelasTap,
  GameCarroCor, GameAnimaCasa, GameComidaTap, GameFormaRedonda, GameLuzTap,
} from "@/components/junior/JuniorGamesV6";
import {
  GameInstrumentos, GameTempo, GameProfissoes, GameParteDia, GameContrarios,
  GameNum46, GameFormaSimples, GameFamilia, GameVeiculos, GameSonsNatu,
} from "@/components/junior/JuniorGamesV7";
import { ParentModePanel } from "@/components/junior/ParentModePanel";
import { JuniorChildSwitcher } from "@/components/junior/JuniorChildSwitcher";
import { JuniorMascotStage } from "@/components/junior/JuniorMascotStage";
import { Mascot } from "@/components/Mascot";
import { Lock } from "lucide-react";
import { useContentSettings } from "@/hooks/useContentSettings";

export const Route = createFileRoute("/junior")({
  head: () => ({
    meta: [
      { title: "Kidoz Júnior — Jogos para crianças 2-5 anos" },
      { name: "description", content: "Jogos seguros e divertidos para crianças dos 2 aos 5 anos: cores, animais, rotinas e histórias mágicas." },
      { property: "og:title", content: 'Kidoz Júnior — Jogos para crianças 2-5 anos' },
      { property: "og:description", content: 'Jogos seguros e divertidos para crianças dos 2 aos 5 anos: cores, animais, rotinas e histórias mágicas.' },
      { property: "og:url", content: "https://kidoz.online/junior" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/junior" },
    ],
  }),
  component: JuniorPage,
});

function JuniorPage() {
  const [active, setActive] = useState<JuniorGame | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<JuniorChild | null>(null);
  const [progress, setProgress] = useState<JuniorProgress>({ playedGames: [], totalSessions: 0, lastPlayedAt: null, highlights: [], points: 0, streak: 0, bestStreak: 0, lastDay: null, medals: [] });
  const [celebrating, setCelebrating] = useState<{ sticker: JuniorSticker; isNew: boolean } | null>(null);
  const [stickerBump, setStickerBump] = useState(0);

  const [ageFilter, setAgeFilter] = useState<"all" | "2-3" | "3-4" | "4-5">("all");
  const { isSubjectEnabled, isGameEnabled } = useContentSettings();

  const refresh = (childId?: string | null) => {
    const id = childId ?? getActiveJuniorChildId();
    setActiveChildId(id);
    setActiveChild(listJuniorChildren().find((c) => c.id === id) ?? null);
    setProgress(loadJuniorProgress(id));
  };

  useEffect(() => {
    // Tenta puxar backup da cloud antes de mostrar o estado local
    let cancelled = false;
    (async () => {
      const updated = await pullJuniorCloud();
      if (cancelled) return;
      refresh();
      if (updated) setStickerBump((n) => n + 1);
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (!active) refresh(activeChildId); }, [active, activeChildId]);

  // Quando a criança ativa muda (ou tem-se um perfil), agenda push para garantir backup
  useEffect(() => { if (activeChildId) scheduleJuniorCloudPush(); }, [activeChildId]);

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
          <section className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <Stat label="Pontos" value={String(progress.points)} />
            <Stat label="Streak" value={`${progress.streak}🔥`} />
            <Stat label="Jogos" value={`${progress.playedGames.length}`} />
            <Stat label="Medalhas" value={String(progress.medals.length)} />
          </section>
        )}

        {activeChild && progress.medals.length > 0 && (
          <section className="mt-3 flex flex-wrap justify-center gap-2">
            {progress.medals.slice(-8).map((m) => (
              <span key={m.id} title={m.label} className="rounded-full bg-card px-3 py-1 font-display text-xs shadow-sm">
                {m.emoji} {m.label}
              </span>
            ))}
          </section>
        )}

        {activeChild && (
          <div className="mt-4 rounded-2xl bg-card/80 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Nível atual</p>
            <p className="font-display text-3xl">⭐ Nível {currentLevel(progress)} / {GARDENS.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Completa cada jardim para desbloquear o próximo!</p>
          </div>
        )}

        {activeChild && (
          <section className="mt-6">
            <JuniorMascotStage child={activeChild} progress={progress} />
          </section>
        )}

        <section className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-display text-muted-foreground">Idade:</span>
          {([
            { id: "all" as const, label: "Todas" },
            { id: "2-3" as const, label: "2-3" },
            { id: "3-4" as const, label: "3-4" },
            { id: "4-5" as const, label: "4-5" },
          ]).map((f) => (
            <button
              key={f.id}
              onClick={() => setAgeFilter(f.id)}
              className={`rounded-full px-4 py-1.5 font-display text-sm transition-colors ${
                ageFilter === f.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {f.label} {f.id !== "all" && "anos"}
            </button>
          ))}
        </section>

        <section className="mt-6 space-y-8">
          {gardenProgressFor(progress)
            .filter(({ garden: g }) => ageFilter === "all" || g.age === ageFilter)
            .filter(({ garden: g }) => isSubjectEnabled(g.id, activeChild?.age))
            .map(({ garden: g, pct, unlocked }) => {
              // jogos disponíveis (filtrados por settings + idade da criança)
              const visibleGames = getGardenGames(g.id).filter((gm) => isGameEnabled(gm.id, activeChild?.age));
              const visibleTotal = visibleGames.length;
              const visiblePlayed = visibleGames.filter((gm) => progress.playedGames.includes(gm.id)).length;
              const visiblePct = visibleTotal ? Math.round((visiblePlayed / visibleTotal) * 100) : pct;
              if (visibleTotal === 0) return null;
              return (
            <div key={g.id} className={`card-chunky relative rounded-3xl border-2 border-border ${g.color} p-5 sm:p-7 ${!unlocked ? "opacity-70" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{g.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-display text-2xl flex items-center gap-2">
                    {g.name}
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">Nv {g.level}</span>
                    {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </h2>
                  <p className="text-xs text-muted-foreground">{g.age} anos · {g.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg">{visiblePlayed}/{visibleTotal}</p>
                  <p className="text-[10px] text-muted-foreground">{visiblePct}%</p>
                </div>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${visiblePct}%` }}
                  className="h-full bg-gradient-to-r from-primary via-xp to-success" />
              </div>

              {!unlocked ? (
                <p className="mt-4 rounded-2xl bg-background/60 p-3 text-center text-sm">
                  🔒 Completa pelo menos {g.unlockThreshold}% do jardim anterior para desbloquear.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {visibleGames.map((game) => {
                    const done = progress.playedGames.includes(game.id);
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
                        {done && <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">⭐</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
              );
            })}
        </section>

        {activeChild && (
          <section className="mt-8">
            <JuniorStickerBook childId={activeChildId} refreshKey={stickerBump} />
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-center text-sm">
          És pai/mãe? Vê o progresso de cada criança em{" "}
          <Link to="/pais" className="font-display text-primary underline">Painel de Pais</Link>.
        </section>
      </main>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center justify-between gap-3 flex-wrap">
              <span>{active?.emoji} {active?.title}</span>
              {active && <ParentModePanel gameId={active.id} title={active.title} />}
            </DialogTitle>
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
            {active?.id === "pinta-desenho" && <GamePinta />}
            {active?.id === "eco-som" && <GameEco />}
            {active?.id === "jardim-magico" && <GameJardimMagico />}
            {active?.id === "puzzle-kido" && <GamePuzzle />}
            {active?.id === "caca-tesouro" && <GameCacaTesouro />}
            {active?.id === "estacoes-ano" && <GameEstacoes />}
            {active?.id === "emocoes-kido" && <GameEmocoes />}
            {active?.id === "sombras" && <GameSombras />}
            {active?.id === "padroes" && <GamePadroes />}
            {active?.id === "labirinto" && <GameLabirinto />}
            {active?.id === "trivia-jr" && <GameTriviaJr />}
            {active?.id === "soma-rapida" && <GameSomaRapida />}
            {active?.id === "tabuada" && <GameTabuada />}
            {active?.id === "fracoes" && <GameFracoes />}
            {active?.id === "silabas" && <GameSilabas />}
            {active?.id === "forma-frase" && <GameFormaFrase />}
            {active?.id === "antonimos" && <GameAntonimos />}
            {active?.id === "mapa-pt" && <GameMapaPT />}
            {active?.id === "ciclo-agua" && <GameCicloAgua />}
            {active?.id === "habitats" && <GameHabitats />}
            {active?.id === "bandeiras" && <GameBandeiras />}
            {active?.id === "spelling-en" && <GameSpellingEN />}
            {active?.id === "colors-en" && <GameColorsEN />}
            {active?.id === "simon" && <GameSimon />}
            {active?.id === "logica" && <GameLogica />}
            {active?.id === "trivia-online" && <GameTriviaOnline category="general" count={8} />}
            {active?.id === "baloes" && <GameBaloes />}
            {active?.id === "pares-jr" && <GamePares />}
            {active?.id === "transportes" && <GameTransportes />}
            {active?.id === "tamanho" && <GameTamanho />}
            {active?.id === "conta-dedos" && <GameContaDedos />}
            {active?.id === "alimenta-bebe" && <GameAlimentaBebe />}
            {active?.id === "onde-esta" && <GameOndeEsta />}
            {active?.id === "numeros-tap" && <GameNumeros />}
            {active?.id === "formas-cor" && <GameFormasCor />}
            {active?.id === "imita-som" && <GameImitaSom />}
            {active?.id === "tap-cor" && <GameTapCor />}
            {active?.id === "anima-tap" && <GameAnimaTap />}
            {active?.id === "num-tap-1-3" && <GameNumTap13 />}
            {active?.id === "grande-pequeno-tap" && <GameGrandePequeno />}
            {active?.id === "fruta-tap" && <GameFrutaTap />}
            {active?.id === "som-anima" && <GameSomAnima />}
            {active?.id === "cor-roupa" && <GameCorRoupa />}
            {active?.id === "anima-grande" && <GameAnimaGrande />}
            {active?.id === "tap-pat-pat" && <GameTapPatPat />}
            {active?.id === "estrelas-tap" && <GameEstrelasTap />}
            {active?.id === "carro-cor" && <GameCarroCor />}
            {active?.id === "anima-casa" && <GameAnimaCasa />}
            {active?.id === "comida-tap" && <GameComidaTap />}
            {active?.id === "forma-redonda" && <GameFormaRedonda />}
            {active?.id === "luz-tap" && <GameLuzTap />}
          </div>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <ChunkyButton tone="ghost" onClick={() => setActive(null)}>Sair</ChunkyButton>
            <ChunkyButton
              tone="success"
              onClick={() => {
                if (!active) return;
                haptic("celebrate");
                recordJuniorPlay(active.id, `Terminou ${active.title}`, activeChildId);
                const { granted, sticker } = grantSticker(active.id, activeChildId);
                if (sticker) setCelebrating({ sticker, isNew: granted });
                setStickerBump((n) => n + 1);
                scheduleJuniorCloudPush();
                setActive(null);
              }}
            >
              Terminei! 🎉
            </ChunkyButton>
          </div>
        </DialogContent>
      </Dialog>

      <JuniorCelebration
        open={!!celebrating}
        sticker={celebrating?.sticker ?? null}
        isNew={celebrating?.isNew ?? false}
        mascot={activeChild?.mascot ?? "fox"}
        onClose={() => setCelebrating(null)}
      />

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
