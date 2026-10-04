// TurmaAoVivoDemo — simulação interativa do «Modo Turma ao vivo» na landing
// /escolas. Mostra a dinâmica futura: o professor projeta o desafio no ecrã
// da sala, os alunos respondem nos tablets e a classificação atualiza ao
// segundo. Zero backend — sequência pré-roteirizada com dados fictícios.
// Honestidade: o modo real está em desenvolvimento; escolas fundadoras votam
// no roteiro e ajudam a moldá-lo.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChunkyButton } from "@/components/ChunkyButton";
import { Play, RotateCcw, Trophy, Tv, Smartphone, Check, Sparkles, Wifi } from "lucide-react";

type Phase = "idle" | "joining" | "question" | "reveal" | "board" | "podium";

interface Question {
  text: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  { text: "Quanto é 7 + 8?", options: ["13", "14", "15", "16"], correct: 2 },
  { text: "Quanto é 5 × 4?", options: ["16", "20", "24", "25"], correct: 1 },
];

const QUESTION_SECONDS = 10;
const SHAPES = ["▲", "◆", "●", "■"];
const OPTION_COLORS = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"];
const PIN = "48 21";

interface AnswerPlan {
  at: number; // segundo (contagem decrescente) em que responde
  correct: boolean;
}

interface LiveStudent {
  name: string;
  emoji: string;
  q1: AnswerPlan;
  q2: AnswerPlan;
}

// Mesma turma do painel de demonstração (TeacherPanelPreview) — 2.º A
const LIVE_STUDENTS: LiveStudent[] = [
  {
    name: "Alice M.",
    emoji: "🦉",
    q1: { at: 3.0, correct: true },
    q2: { at: 2.8, correct: true },
  },
  {
    name: "Tomás R.",
    emoji: "🦊",
    q1: { at: 4.2, correct: true },
    q2: { at: 5.0, correct: true },
  },
  {
    name: "Beatriz C.",
    emoji: "🐼",
    q1: { at: 5.1, correct: false },
    q2: { at: 4.4, correct: true },
  },
  {
    name: "Duarte F.",
    emoji: "🐢",
    q1: { at: 6.3, correct: true },
    q2: { at: 6.8, correct: true },
  },
  {
    name: "Elisa P.",
    emoji: "🦁",
    q1: { at: 7.2, correct: false },
    q2: { at: 5.9, correct: true },
  },
  {
    name: "Francisco G.",
    emoji: "🐙",
    q1: { at: 8.4, correct: false },
    q2: { at: 7.1, correct: true },
  },
  {
    name: "Gabriela S.",
    emoji: "🐨",
    q1: { at: 9.0, correct: false },
    q2: { at: 8.2, correct: false },
  },
];

const ALICE = LIVE_STUDENTS[0];
const POINTS_CORRECT = 100;
const POINTS_PLAY = 10; // XP de participação — ninguém sai com zero

function planFor(s: LiveStudent, round: number): AnswerPlan {
  return round === 0 ? s.q1 : s.q2;
}

function scoreOf(s: LiveStudent, throughRound: number): number {
  let pts = 0;
  if (throughRound >= 0) pts += s.q1.correct ? POINTS_CORRECT : POINTS_PLAY;
  if (throughRound >= 1) pts += s.q2.correct ? POINTS_CORRECT : POINTS_PLAY;
  return pts;
}

function ranked(throughRound: number): LiveStudent[] {
  return [...LIVE_STUDENTS].sort(
    (a, b) => scoreOf(b, throughRound) - scoreOf(a, throughRound) || a.q1.at - b.q1.at,
  );
}

export function TurmaAoVivoDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [joined, setJoined] = useState(0);
  const [answers, setAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [aliceChoice, setAliceChoice] = useState<number | null>(null);

  // Orquestração da sequência — todos os timers são limpos no cleanup
  useEffect(() => {
    const timers: number[] = [];
    let interval: number | undefined;

    if (phase === "joining") {
      setJoined(0);
      LIVE_STUDENTS.forEach((_, i) => {
        timers.push(window.setTimeout(() => setJoined(i + 1), 360 * (i + 1)));
      });
      timers.push(window.setTimeout(() => setPhase("question"), 360 * LIVE_STUDENTS.length + 900));
    }

    if (phase === "question") {
      setTimeLeft(QUESTION_SECONDS);
      setAnswers(0);
      setAliceChoice(null);
      const alicePlan = planFor(ALICE, round);
      LIVE_STUDENTS.forEach((st) => {
        timers.push(
          window.setTimeout(
            () => setAnswers((a) => Math.min(a + 1, LIVE_STUDENTS.length)),
            (QUESTION_SECONDS - planFor(st, round).at) * 1000,
          ),
        );
      });
      timers.push(
        window.setTimeout(
          () => setAliceChoice(QUESTIONS[round].correct),
          (QUESTION_SECONDS - alicePlan.at) * 1000,
        ),
      );
      const started = Date.now();
      interval = window.setInterval(() => {
        setTimeLeft(Math.max(0, QUESTION_SECONDS - (Date.now() - started) / 1000));
      }, 120);
      timers.push(
        window.setTimeout(
          () => {
            if (interval !== undefined) window.clearInterval(interval);
            setPhase("reveal");
          },
          QUESTION_SECONDS * 1000 + 150,
        ),
      );
    }

    if (phase === "reveal") {
      timers.push(window.setTimeout(() => setPhase(round === 0 ? "board" : "podium"), 2800));
    }

    if (phase === "board") {
      timers.push(
        window.setTimeout(() => {
          setRound(1);
          setPhase("question");
        }, 3600),
      );
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [phase, round]);

  const restart = () => {
    setPhase("idle");
    setRound(0);
    setJoined(0);
    setAnswers(0);
    setAliceChoice(null);
    setTimeLeft(QUESTION_SECONDS);
  };

  const q = QUESTIONS[round];
  const boardRound = round; // após a rodada atual
  const ranking = ranked(boardRound);
  const maxPts = Math.max(...ranking.map((s) => scoreOf(s, boardRound)));
  const aliceScore = scoreOf(ALICE, round);
  const aliceRank = ranked(round).findIndex((s) => s.name === ALICE.name) + 1;

  const timePct = Math.max(0, (timeLeft / QUESTION_SECONDS) * 100);

  return (
    <section className="mt-8">
      <div className="text-center">
        <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
          Modo Turma ao vivo · em breve
        </p>
        <h2 className="mt-1 font-display text-2xl">
          A sala inteira num só ecrã — vê já a dinâmica
        </h2>
        <p className="mx-auto mt-1 max-w-[42rem] text-sm text-muted-foreground">
          O professor projeta o desafio no ecrã da sala, os alunos respondem nos tablets e a
          classificação atualiza-se ao segundo. Demonstração interativa — o modo chega em breve ao
          plano Escolas.
        </p>
      </div>

      <div className="card-chunky mt-4 overflow-hidden rounded-3xl border-2 border-border bg-card">
        {/* chrome da janela */}
        <div className="flex items-center gap-2 border-b-2 border-border bg-muted/70 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-success/60" />
          <span className="ml-2 hidden rounded-lg bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground sm:inline">
            kidoz.online/sala — Turma 2.º A · ao vivo
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-primary">
            Demonstração · em breve
          </span>
          {phase !== "idle" && (
            <button
              type="button"
              onClick={restart}
              aria-label="Reiniciar demonstração"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-background text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_18rem]">
          {/* ══════════ ECRÃ DA SALA (projetor) ══════════ */}
          <div className="overflow-hidden rounded-2xl bg-[#22234a] p-4 text-white sm:p-6">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-white/60" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                Ecrã da sala
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-bold">
                <span className="hidden sm:inline">código</span>
                {PIN}
              </span>
            </div>

            <div className="flex min-h-[350px] flex-col sm:min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* IDLE */}
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/80">
                      <Sparkles className="h-3.5 w-3.5" />
                      Turma 2.º A · 7 alunos prontos
                    </div>
                    <p className="mt-4 font-display text-3xl sm:text-4xl">Desafio ao vivo</p>
                    <p className="mt-2 max-w-sm text-sm text-white/70">
                      Matemática · 2.º ano · 2 rodadas. Os alunos entram com o código nos tablets e
                      a turma joga em conjunto.
                    </p>
                    <ChunkyButton
                      onClick={() => setPhase("joining")}
                      className="mt-6 min-h-[52px] px-8"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Reproduzir demonstração
                      </span>
                    </ChunkyButton>
                    <p className="mt-3 text-[11px] text-white/50">
                      ~30 segundos · sem som · dados fictícios
                    </p>
                  </motion.div>
                )}

                {/* JOINING */}
                {phase === "joining" && (
                  <motion.div
                    key="joining"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col py-6"
                  >
                    <p className="text-center font-display text-2xl">Entrar em kidoz.online</p>
                    <p className="mt-1 text-center text-sm text-white/60">
                      Escreve o código da turma:{" "}
                      <span className="font-mono font-bold text-white">{PIN}</span>
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {LIVE_STUDENTS.slice(0, joined).map((s) => (
                        <motion.span
                          key={s.name}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 18 }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold"
                        >
                          <span aria-hidden>{s.emoji}</span>
                          {s.name}
                        </motion.span>
                      ))}
                    </div>
                    <p
                      className="mt-auto pt-6 text-center font-display text-lg text-white/80"
                      aria-live="polite"
                    >
                      {joined} de {LIVE_STUDENTS.length} na sala
                    </p>
                  </motion.div>
                )}

                {/* QUESTION + REVEAL */}
                {(phase === "question" || phase === "reveal") && (
                  <motion.div
                    key={`q-${round}-${phase}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col py-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Rodada {round + 1} de 2
                      </span>
                      <span
                        className="rounded-full bg-white/10 px-3 py-1 font-mono text-sm font-bold"
                        aria-live="polite"
                      >
                        ⏱ {Math.ceil(timeLeft)}s
                      </span>
                    </div>
                    <p className="mt-4 text-center font-display text-2xl sm:text-3xl">{q.text}</p>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.correct;
                        const revealed = phase === "reveal";
                        const alicePicked = aliceChoice === i;
                        return (
                          <div
                            key={opt}
                            className={`relative flex min-h-[56px] items-center justify-center gap-2 rounded-2xl font-display text-xl transition-all duration-300 sm:text-2xl ${
                              OPTION_COLORS[i]
                            } ${
                              revealed && isCorrect ? "scale-[1.03] ring-4 ring-white" : ""
                            } ${revealed && !isCorrect ? "opacity-35 saturate-50" : ""} ${
                              alicePicked && !revealed ? "ring-4 ring-white/70" : ""
                            }`}
                          >
                            <span className="text-sm opacity-80" aria-hidden>
                              {SHAPES[i]}
                            </span>
                            {opt}
                            {revealed && isCorrect && (
                              <Check
                                className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-white p-0.5 text-emerald-600"
                                aria-hidden
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* tempo + respostas */}
                    <div className="mt-auto pt-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/15">
                          <div
                            className={`h-full rounded-full transition-[width] duration-150 ease-linear ${
                              timeLeft > 3 ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${timePct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white/80">
                          {answers}/{LIVE_STUDENTS.length} responderam
                        </span>
                      </div>
                      {phase === "reveal" && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 text-center font-display text-lg text-emerald-300"
                        >
                          Resposta certa: {q.options[q.correct]} · +{POINTS_CORRECT} pontos!
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* BOARD */}
                {phase === "board" && (
                  <motion.div
                    key="board"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col py-5"
                  >
                    <p className="text-center font-display text-2xl">
                      Classificação após a rodada {round + 1}
                    </p>
                    <div className="mt-4 space-y-1.5">
                      {ranking.map((s, i) => {
                        const pts = scoreOf(s, boardRound);
                        return (
                          <div
                            key={s.name}
                            className="flex items-center gap-2 rounded-xl bg-white/8 px-2.5 py-1.5"
                          >
                            <span className="w-5 text-right font-mono text-xs text-white/60">
                              {i + 1}
                            </span>
                            <span aria-hidden>{s.emoji}</span>
                            <span className="w-24 shrink-0 truncate text-xs font-bold sm:w-28 sm:text-sm">
                              {s.name}
                            </span>
                            <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(pts / maxPts) * 100}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  i === 0
                                    ? "bg-amber-400"
                                    : i === 1
                                      ? "bg-slate-300"
                                      : i === 2
                                        ? "bg-orange-300"
                                        : "bg-sky-400/80"
                                }`}
                              />
                            </div>
                            <span className="w-10 text-right font-mono text-xs font-bold">
                              {pts}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-auto pt-4 text-center text-xs text-white/60">
                      A seguir: rodada {round + 2} — a classificação muda ao segundo!
                    </p>
                  </motion.div>
                )}

                {/* PODIUM */}
                {phase === "podium" && (
                  <motion.div
                    key="podium"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-1 flex-col py-5"
                  >
                    <p className="text-center font-display text-2xl">Pódio da turma 🎉</p>
                    <div className="mt-5 flex items-end justify-center gap-2 sm:gap-4">
                      {[1, 0, 2].map((pos) => {
                        const s = ranked(1)[pos];
                        const h = pos === 0 ? "h-24" : pos === 1 ? "h-16" : "h-12";
                        const medal = pos === 0 ? "🥇" : pos === 1 ? "🥈" : "🥉";
                        return (
                          <motion.div
                            key={s.name}
                            initial={{ y: 24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: pos * 0.15, type: "spring", stiffness: 200 }}
                            className="flex w-20 flex-col items-center sm:w-28"
                          >
                            <span className="text-2xl" aria-hidden>
                              {s.emoji}
                            </span>
                            <span className="mt-0.5 truncate text-xs font-bold">{s.name}</span>
                            <span className="text-[11px] text-white/70">{scoreOf(s, 1)} pts</span>
                            <div
                              className={`mt-1.5 flex w-full ${h} items-start justify-center rounded-t-xl bg-gradient-to-t from-white/25 to-white/15 pt-1.5 font-display text-xl`}
                            >
                              {medal}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <p className="mt-5 text-center text-xs text-white/60">
                      Na versão real, todos ganham XP por participar — e o professor vê quem precisa
                      de apoio.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ══════════ TABLET DO ALUNO ══════════ */}
          <div className="mx-auto w-full max-w-[19rem]">
            <div className="rounded-[2rem] border-4 border-border bg-card p-2 shadow-lg">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span className="mx-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Smartphone className="h-3 w-3" />
                  Tablet da Alice
                </span>
              </div>
              <div className="flex min-h-[380px] flex-col rounded-3xl bg-background p-3">
                {phase === "idle" && (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <span className="text-4xl" aria-hidden>
                      🦉
                    </span>
                    <p className="mt-2 text-sm font-bold">Alice M.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      À espera que o professor comece o desafio…
                    </p>
                  </div>
                )}

                {phase === "joining" && (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      kidoz.online
                    </p>
                    <div className="mt-2 w-full rounded-xl border-2 border-primary/40 bg-card px-3 py-2.5 text-center font-mono text-lg font-bold tracking-[0.3em] text-primary">
                      4821
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                      <span aria-hidden>🦉</span> A entrar…
                    </div>
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      Sem contas nem passwords — só o código da turma.
                    </p>
                  </div>
                )}

                {(phase === "question" || phase === "reveal") && (
                  <div className="flex flex-1 flex-col">
                    <p className="text-center font-display text-base">{q.text}</p>
                    <div className="mt-3 grid grid-cols-1 gap-1.5">
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.correct;
                        const revealed = phase === "reveal";
                        const picked = aliceChoice === i;
                        return (
                          <div
                            key={opt}
                            className={`flex min-h-[38px] items-center justify-center gap-2 rounded-xl font-display text-base transition-all duration-300 ${
                              OPTION_COLORS[i]
                            } text-white ${picked && !revealed ? "ring-4 ring-primary/60" : ""} ${
                              revealed
                                ? isCorrect
                                  ? "ring-4 ring-success"
                                  : "opacity-30 saturate-50"
                                : ""
                            }`}
                          >
                            <span className="text-xs opacity-80" aria-hidden>
                              {SHAPES[i]}
                            </span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                    {phase === "question" && (
                      <p className="mt-auto pt-3 text-center text-xs text-muted-foreground">
                        {aliceChoice === null ? "A pensar na resposta…" : "Resposta enviada ✓"}
                      </p>
                    )}
                    {phase === "reveal" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-auto rounded-xl bg-success/15 p-2.5 text-center"
                      >
                        <p className="font-display text-sm text-success">
                          Certo! +{POINTS_CORRECT} ⭐
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Bónus por rapidez incluído
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {phase === "board" && (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Depois da rodada {round + 1}
                    </p>
                    <p className="mt-2 font-display text-3xl text-primary">{aliceRank}.º lugar</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {aliceScore} pontos · continue assim! 🦉
                    </p>
                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(aliceScore / Math.max(...ranking.map((s) => scoreOf(s, boardRound)))) * 100}%`,
                        }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                )}

                {phase === "podium" && (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Trophy className="h-10 w-10 text-amber-500" />
                    </motion.div>
                    <p className="mt-2 font-display text-xl">1.º lugar!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      200 pontos · 2 de 2 certas ⭐
                    </p>
                    <p className="mt-3 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                      XP guardado no progresso da turma
                    </p>
                  </div>
                )}
              </div>
              <p className="py-1.5 text-center text-[10px] text-muted-foreground">
                <Wifi className="mr-1 inline h-3 w-3" />
                Funciona com Wi‑Fi da escola instável
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <a href="#fundador">
          <ChunkyButton className="min-h-[52px] px-8">
            Quero o modo ao vivo na minha escola →
          </ChunkyButton>
        </a>
        <p className="mx-auto mt-2 max-w-[36rem] text-[11px] text-muted-foreground">
          Demonstração pré-roteirizada com dados fictícios. O modo ao vivo está em desenvolvimento —
          as Escolas Fundadoras votam no roteiro e ajudam a moldá-lo.
        </p>
      </div>
    </section>
  );
}
