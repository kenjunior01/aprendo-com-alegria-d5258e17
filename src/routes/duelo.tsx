// /duelo — Duelo da Família: 1 contra 1 no mesmo dispositivo.
// Irmãos, primos, pais contra filhos — perguntas alternadas, placar ao vivo
// e pódio com confetti. Funciona offline (perguntas do banco local) e dá
// XP/moedas ao perfil local SEMPRE (participar já é treinar; vencer é bónus).
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Crown, Home, RefreshCw, Swords, Trophy } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MascotIcon } from "@/components/MascotIcon";
import { RouteError } from "@/components/RouteError";
import { MASCOTS } from "@/lib/mascots";
import { loadProfile } from "@/lib/storage";
import {
  awardDuelo,
  DUELO_GRADE_LABEL,
  DUELO_PER_PLAYER,
  dueloPoolSize,
  pickDueloQuestions,
  type DueloGrade,
  type DueloPlayer,
  type DueloQuestion,
} from "@/lib/duelo";
import { playCorrect, playLevelUp, playTap, playWrong, speak, stopSpeech } from "@/lib/audio";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/duelo")({
  head: () => ({
    meta: [
      { title: "Duelo da Família ⚔️ — 1 contra 1 | Kidoz" },
      {
        name: "description",
        content:
          "Duelo de perguntas no mesmo dispositivo: irmãos, primos e pais contra filhos. Placar ao vivo, pódio com confetti e recompensas para todos — no app educativo Kidoz.",
      },
      { property: "og:title", content: "Duelo da Família ⚔️ — 1 contra 1 | Kidoz" },
      {
        property: "og:description",
        content:
          "Duelo de perguntas no mesmo dispositivo: placar ao vivo, pódio com confetti e recompensas para todos.",
      },
      { property: "og:url", content: "https://kidoz.online/duelo" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/duelo" }],
  }),
  component: DueloPage,
  errorComponent: RouteError,
});

type Fase = "setup" | "pronto" | "jogo" | "fim";

/** Tempo de pausa após responder: leitura com calma no erro, ritmo no acerto. */
const MS_ACERTO = 1200;
const MS_ERRO = 2600;

const P1_THEME = {
  ring: "ring-primary",
  chip: "bg-primary/15 text-primary border-primary/40",
  bar: "bg-primary",
  label: "Jogador 1",
};
const P2_THEME = {
  ring: "ring-fuchsia-500",
  chip: "bg-fuchsia-500/15 text-fuchsia-600 border-fuchsia-500/40",
  bar: "bg-fuchsia-500",
  label: "Jogador 2",
};

function DueloPage() {
  const navigate = useNavigate();
  const profile = useMemo(() => loadProfile(), []);

  const [fase, setFase] = useState<Fase>("setup");
  const [grade, setGrade] = useState<DueloGrade>(
    profile?.grade && profile.grade >= 1 && profile.grade <= 4
      ? (String(profile.grade) as DueloGrade)
      : "misto",
  );

  // Jogadores
  const [p1, setP1] = useState<DueloPlayer>({
    name: profile?.name || "",
    mascotId: profile?.mascot || "fox",
    score: 0,
  });
  const [p2, setP2] = useState<DueloPlayer>({ name: "", mascotId: "owl", score: 0 });

  // Jogo
  const [questions, setQuestions] = useState<DueloQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [contagem, setContagem] = useState(3);
  const [resultado, setResultado] = useState<{
    p1: DueloPlayer;
    p2: DueloPlayer;
    xpEarned: number;
    coinsEarned: number;
    winner: "p1" | "p2" | "empate";
  } | null>(null);

  const startedAtRef = useRef<number>(0);
  const finishedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const p1Ref = useRef(p1);
  const p2Ref = useRef(p2);
  p1Ref.current = p1;
  p2Ref.current = p2;

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      stopSpeech();
    },
    [],
  );

  const q = questions[idx];
  const vez: 0 | 1 = q?.turn ?? 0;
  const players = [p1, p2];
  const active = players[vez];
  const activeTheme = vez === 0 ? P1_THEME : P2_THEME;
  const totalQuestions = questions.length;

  const start = () => {
    const n1 = p1.name.trim() || "Jogador 1";
    const n2 = p2.name.trim() || "Jogador 2";
    setP1((p) => ({ ...p, name: n1, score: 0 }));
    setP2((p) => ({ ...p, name: n2, score: 0 }));
    p1Ref.current = { ...p1, name: n1, score: 0 };
    p2Ref.current = { ...p2, name: n2, score: 0 };
    setQuestions(pickDueloQuestions(grade, DUELO_PER_PLAYER));
    setIdx(0);
    setPicked(null);
    setResultado(null);
    finishedRef.current = false;
    setFase("pronto");
    setContagem(3);
    playTap();
  };

  // Contagem decrescente "3, 2, 1…" antes da primeira pergunta
  useEffect(() => {
    if (fase !== "pronto") return;
    if (contagem <= 0) {
      setFase("jogo");
      startedAtRef.current = Date.now();
      return;
    }
    playCorrect();
    const t = window.setTimeout(() => setContagem((c) => c - 1), 800);
    return () => window.clearTimeout(t);
  }, [fase, contagem]);

  // Narra a vez de quem responde (com voz, para os mais pequenos)
  useEffect(() => {
    if (fase === "jogo" && q && !picked) {
      const m = MASCOTS.find((mm) => mm.id === active?.mascotId);
      speak(`Vez de ${m?.article ?? ""} ${active?.name}!`, { rate: 0.95 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, fase]);

  const answer = (i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    const certo = i === q.answerIndex;
    if (certo) {
      playCorrect();
      haptic("success");
      if (vez === 0) setP1((p) => ({ ...p, score: p.score + 1 }));
      else setP2((p) => ({ ...p, score: p.score + 1 }));
    } else {
      playWrong();
      haptic("error");
    }
    const ms = certo ? MS_ACERTO : MS_ERRO;
    timerRef.current = window.setTimeout(() => {
      setPicked(null);
      setIdx((v) => v + 1);
    }, ms);
  };

  // Fim do duelo → recompensas + confetti (uma única vez)
  useEffect(() => {
    if (fase !== "jogo" || finishedRef.current) return;
    if (questions.length === 0 || idx < questions.length) return;
    finishedRef.current = true;
    const minutes = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000));
    const res = awardDuelo({
      p1: p1Ref.current,
      p2: p2Ref.current,
      totalQuestions: questions.length,
      minutes,
      grade,
    });
    setResultado({
      p1: p1Ref.current,
      p2: p2Ref.current,
      xpEarned: res.xpEarned,
      coinsEarned: res.coinsEarned,
      winner: res.winner,
    });
    setFase("fim");
    playLevelUp();
    haptic("success");
    void confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
    const w = res.winner === "empate" ? null : res.winner === "p1" ? p1Ref.current : p2Ref.current;
    speak(
      res.winner === "empate" ? "Empate! Os dois são incríveis!" : `${w?.name} venceu! Parabéns!`,
      { rate: 0.95 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, fase, questions]);

  const share = () => {
    if (!resultado) return;
    const txt = `⚔️ Duelo da Família no Kidoz: ${resultado.p1.name} ${resultado.p1.score} × ${resultado.p2.score} ${resultado.p2.name}! Quem ganha a ti? kidoz.online`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
  };

  return (
    <div className="bg-sky-island min-h-[100dvh] pb-16">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          to="/app"
          className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1 font-display text-xs">
          <Swords className="h-3.5 w-3.5 text-primary" /> Duelo da Família
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4">
        {fase === "setup" && (
          <SetupPhase
            grade={grade}
            setGrade={setGrade}
            p1={p1}
            p2={p2}
            setP1={setP1}
            setP2={setP2}
            onStart={start}
            pool={dueloPoolSize(grade)}
          />
        )}

        {fase === "pronto" && (
          <section className="py-10 text-center" aria-live="polite">
            <motion.div
              key={contagem}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-8xl font-bold text-primary"
            >
              {contagem > 0 ? contagem : "Já!"}
            </motion.div>
            <p className="mt-4 font-display text-xl">
              {p1.name} <span className="text-muted-foreground">contra</span> {p2.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalQuestions} perguntas · {DUELO_PER_PLAYER} para cada · vale tudo menos desistir!
            </p>
          </section>
        )}

        {fase === "jogo" && q && (
          <section>
            {/* Placar ao vivo */}
            <ScoreBoard p1={p1} p2={p2} vez={vez} progresso={{ idx, total: totalQuestions }} />

            {/* Banner da vez */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`vez-${vez}`}
                initial={{ y: -14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 14, opacity: 0 }}
                className={cn(
                  "mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 font-display text-sm",
                  activeTheme.chip,
                )}
              >
                <MascotIcon id={active?.mascotId} size={22} />
                Vez de {active?.name}!
              </motion.div>
            </AnimatePresence>

            {/* Pergunta */}
            <motion.div
              key={`q-${idx}`}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card-chunky mt-4 rounded-3xl border-2 border-border bg-card p-5 sm:p-6"
            >
              <p className="text-center font-display text-lg leading-snug sm:text-xl">{q.prompt}</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const isRight = i === q.answerIndex;
                  const isPicked = picked === i;
                  const reveal = picked !== null;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => answer(i)}
                      disabled={picked !== null}
                      aria-label={`Opção ${i + 1}: ${opt}`}
                      className={cn(
                        "rounded-2xl border-2 px-4 py-3 text-left font-display text-base transition active:scale-[0.98]",
                        !reveal &&
                          "border-border bg-background hover:border-primary/50 hover:bg-primary/5",
                        reveal && isRight && "border-success bg-success/15 text-success",
                        reveal &&
                          isPicked &&
                          !isRight &&
                          "border-red-400 bg-red-400/10 text-red-500",
                        reveal && !isPicked && !isRight && "border-border/50 bg-card opacity-50",
                      )}
                    >
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Correção com tempo de leitura */}
              <AnimatePresence>
                {picked !== null && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-4 rounded-2xl px-4 py-3 text-center text-sm font-medium",
                      picked === q.answerIndex
                        ? "bg-success/10 text-success"
                        : "bg-amber-400/10 text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {picked === q.answerIndex
                      ? "✔ Certinho! +1 ponto!"
                      : `A resposta certa era: ${q.options[q.answerIndex]}`}
                    {q.hint && picked !== q.answerIndex ? ` — ${q.hint}` : ""}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <p className="mt-3 text-center text-xs text-muted-foreground" aria-live="polite">
              Pergunta {Math.min(idx + 1, totalQuestions)} de {totalQuestions}
            </p>
          </section>
        )}

        {fase === "fim" && resultado && (
          <PodiumPhase
            resultado={resultado}
            temPerfil={Boolean(profile)}
            onRevanche={start}
            onNovo={() => {
              setFase("setup");
              setResultado(null);
            }}
            onShare={share}
          />
        )}
      </main>
    </div>
  );
}

/** Placar ao vivo: barras animadas + destaque da vez. */
function ScoreBoard({
  p1,
  p2,
  vez,
  progresso,
}: {
  p1: DueloPlayer;
  p2: DueloPlayer;
  vez: 0 | 1;
  progresso: { idx: number; total: number };
}) {
  const max = Math.max(1, progresso.total / 2);
  const card = (p: DueloPlayer, ativo: boolean, theme: typeof P1_THEME) => (
    <div
      className={cn(
        "flex-1 rounded-2xl border-2 bg-card p-3 transition",
        ativo ? `ring-2 ${theme.ring} border-transparent shadow-lg` : "opacity-70",
      )}
      aria-current={ativo ? "true" : undefined}
    >
      <div className="flex items-center gap-2">
        <MascotIcon id={p.mascotId} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm leading-tight">{p.name}</p>
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wide",
              theme.bar.replace("bg-", "text-"),
            )}
          >
            {ativo ? "à vez!" : "espera"}
          </p>
        </div>
        <span className="font-display text-2xl font-bold">{p.score}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", theme.bar)}
          animate={{ width: `${Math.min(100, (p.score / max) * 100)}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        />
      </div>
    </div>
  );
  return (
    <div className="flex items-stretch gap-2">
      {card(p1, vez === 0, P1_THEME)}
      <div className="flex items-center font-display text-lg text-muted-foreground">×</div>
      {card(p2, vez === 1, P2_THEME)}
    </div>
  );
}

/** Fase de configuração: nomes, mascotes e ano escolar. */
function SetupPhase({
  grade,
  setGrade,
  p1,
  p2,
  setP1,
  setP2,
  onStart,
  pool,
}: {
  grade: DueloGrade;
  setGrade: (g: DueloGrade) => void;
  p1: DueloPlayer;
  p2: DueloPlayer;
  setP1: React.Dispatch<React.SetStateAction<DueloPlayer>>;
  setP2: React.Dispatch<React.SetStateAction<DueloPlayer>>;
  onStart: () => void;
  pool: number;
}) {
  const mascotPicker = (p: DueloPlayer, set: React.Dispatch<React.SetStateAction<DueloPlayer>>) => (
    <div className="flex justify-center gap-1.5">
      {MASCOTS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => set((prev) => ({ ...prev, mascotId: m.id }))}
          aria-label={`Escolher ${m.name} para ${p.name || "jogador"}`}
          aria-pressed={p.mascotId === m.id}
          className={cn(
            "rounded-2xl border-2 p-1.5 transition active:scale-95",
            p.mascotId === m.id
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border/60 bg-card opacity-70 hover:opacity-100",
          )}
        >
          <MascotIcon id={m.id} size={30} />
        </button>
      ))}
    </div>
  );

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl">⚔️ Duelo da Família</h1>
        <p className="mt-2 text-muted-foreground">
          {DUELO_PER_PLAYER} perguntas para cada · quem acerta mais vence!
        </p>
      </div>

      {/* Jogadores */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(
          [
            { p: p1, set: setP1, theme: P1_THEME, placeholder: "Nome do jogador 1" },
            { p: p2, set: setP2, theme: P2_THEME, placeholder: "Nome do jogador 2" },
          ] as const
        ).map(({ p, set, theme, placeholder }, pi) => (
          <div key={pi} className={cn("rounded-3xl border-2 bg-card p-4 text-center", theme.chip)}>
            <p className="font-display text-xs font-bold uppercase tracking-wide">{theme.label}</p>
            <div className="mt-2 flex justify-center">
              <MascotIcon id={p.mascotId} size={54} animated />
            </div>
            <input
              value={p.name}
              onChange={(e) => set((prev) => ({ ...prev, name: e.target.value.slice(0, 14) }))}
              placeholder={placeholder}
              aria-label={placeholder}
              maxLength={14}
              className="mt-3 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 text-center font-display text-base outline-none focus:border-primary"
            />
            <div className="mt-3">{mascotPicker(p, set)}</div>
          </div>
        ))}
      </div>

      {/* Ano escolar */}
      <div className="card-chunky mt-4 rounded-3xl border-2 border-border bg-card p-4">
        <p className="text-center font-display text-sm text-muted-foreground">
          Perguntas para que ano? (justo para os dois)
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {(Object.keys(DUELO_GRADE_LABEL) as DueloGrade[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(g)}
              aria-pressed={grade === g}
              className={cn(
                "rounded-full border-2 px-4 py-2 font-display text-sm transition active:scale-95",
                grade === g
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              {DUELO_GRADE_LABEL[g]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {pool} perguntas disponíveis nesta faixa · banco atualiza sempre
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <ChunkyButton tone="primary" onClick={onStart} className="w-full max-w-xs">
          <Swords className="mr-1 inline h-5 w-5" /> Começar o duelo!
        </ChunkyButton>
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Errou? Mostramos a resposta certa — porque aprender vale mais do que ganhar.
        </p>
      </div>
    </motion.section>
  );
}

/** Pódio final: vencedor, recompensas, revanche e partilha. */
function PodiumPhase({
  resultado,
  temPerfil,
  onRevanche,
  onNovo,
  onShare,
}: {
  resultado: {
    p1: DueloPlayer;
    p2: DueloPlayer;
    xpEarned: number;
    coinsEarned: number;
    winner: "p1" | "p2" | "empate";
  };
  temPerfil: boolean;
  onRevanche: () => void;
  onNovo: () => void;
  onShare: () => void;
}) {
  const { p1, p2, xpEarned, coinsEarned, winner } = resultado;
  const win = winner === "empate" ? null : winner === "p1" ? p1 : p2;
  const winMascot = MASCOTS.find((m) => m.id === win?.mascotId);

  return (
    <motion.section
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
    >
      <div className="card-chunky rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-400/15 via-card to-primary/10 p-6">
        {win ? (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="mx-auto w-fit rounded-full bg-amber-400/20 p-4"
            >
              <Trophy className="h-14 w-14 text-amber-500" />
            </motion.div>
            <h2 className="mt-3 font-display text-3xl">🎉 {win.name} venceu!</h2>
            <p className="mt-1 font-display text-sm text-muted-foreground">
              {winMascot?.article ?? ""} {winMascot?.name ?? ""} está muito orgulhoso!
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto w-fit rounded-full bg-primary/15 p-4">
              <Crown className="h-14 w-14 text-primary" />
            </div>
            <h2 className="mt-3 font-display text-3xl">🤝 Empate!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Os dois são campeões — ninguém quer decidir?
            </p>
          </>
        )}

        {/* Placar final */}
        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-4">
          <FinalScore p={p1} venceu={winner === "p1"} theme={P1_THEME} />
          <span className="font-display text-2xl text-muted-foreground">×</span>
          <FinalScore p={p2} venceu={winner === "p2"} theme={P2_THEME} />
        </div>

        {/* Recompensas do perfil local */}
        {temPerfil && (
          <p className="mt-5 rounded-2xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
            ⭐ O teu perfil ganhou {xpEarned} XP e {coinsEarned} abracadinhos! Participar já é
            treinar.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ChunkyButton tone="primary" onClick={onRevanche}>
          <RefreshCw className="mr-1 inline h-4 w-4" /> Revanche!
        </ChunkyButton>
        <ChunkyButton tone="success" onClick={onNovo}>
          Novos jogadores
        </ChunkyButton>
        <ChunkyButton tone="ghost" onClick={onShare}>
          Partilhar no WhatsApp
        </ChunkyButton>
        <Link to="/app">
          <ChunkyButton tone="ghost">
            <Home className="mr-1 inline h-4 w-4" /> Início
          </ChunkyButton>
        </Link>
      </div>
    </motion.section>
  );
}

function FinalScore({
  p,
  venceu,
  theme,
}: {
  p: DueloPlayer;
  venceu: boolean;
  theme: typeof P1_THEME;
}) {
  return (
    <div
      className={cn(
        "min-w-28 rounded-2xl border-2 bg-card p-3",
        venceu && `ring-2 ${theme.ring} border-transparent`,
      )}
    >
      <div className="flex justify-center">
        <MascotIcon id={p.mascotId} size={34} />
      </div>
      <p className="mt-1 truncate font-display text-sm">{p.name}</p>
      <p className="font-display text-2xl font-bold">{p.score}</p>
    </div>
  );
}
