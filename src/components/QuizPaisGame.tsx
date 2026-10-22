// QuizPaisGame — Quiz do Meu País: 3 níveis, 5 perguntas por rodada.
// Conteúdo 100% regional (autorado em quizPais.ts) com desbloqueio de níveis
// (4+ acertos abre o seguinte), estrelas, moedas e XP. Nunca pune: errar
// mostra a resposta certa com tempo de leitura (mesma regra do Duelo).
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Lock, MapPin, Play, Sparkles, Star } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import {
  QUIZ_PAIS_LEVELS,
  QUIZ_PAIS_MAX_LEVEL,
  QUIZ_PAIS_REGIONS,
  hasQuizPais,
  loadQuizPaisProgress,
  pickQuizPais,
  quizPaisCountry,
  quizPaisLevelFrame,
  quizPaisRewards,
  saveQuizPaisResult,
  type QuizPaisProgress,
  type QuizPaisQ,
} from "@/lib/quizPais";
import { detectRegion, gradeBadge, REGIONS, type RegionCode } from "@/lib/region";
import { loadProfile, updateProfile } from "@/lib/storage";
import { checkAndUnlockAchievements, type Achievement } from "@/lib/achievements";
import { haptic } from "@/lib/haptics";
import { playCorrect, playLevelUp, playWrong } from "@/lib/audio";
import { cn } from "@/lib/utils";

/** Tempo de leitura da correção: acerto corre, erro dá tempo de APRENDER. */
const MS_ACERTO = 850;
const MS_ERRO = 2600;

type Fase = "niveis" | "jogo" | "fim";

function starCount(correct: number): number {
  if (correct >= 5) return 3;
  if (correct >= 4) return 2;
  if (correct >= 2) return 1;
  return 0;
}

export function QuizPaisGame() {
  const perfil = useMemo(() => loadProfile(), []);
  const [region, setRegion] = useState<RegionCode | null>(() => {
    const r = perfil?.region ?? detectRegion().code;
    return hasQuizPais(r) ? r : null;
  });
  const [progress, setProgress] = useState<QuizPaisProgress>(() => loadQuizPaisProgress());

  const [fase, setFase] = useState<Fase>("niveis");
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [questions, setQuestions] = useState<QuizPaisQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [resultado, setResultado] = useState<{ unlockedNow: boolean; isRecord: boolean } | null>(
    null,
  );
  const [novasConquistas, setNovasConquistas] = useState<Achievement[]>([]);

  const jogar = (lv: 1 | 2 | 3) => {
    if (!region) return;
    haptic("tap");
    setLevel(lv);
    // Balanceamento por idade: a grade da criança escolhe se a rodada vem
    // mais leve (1.ª/2.ª) ou mais forte (4.ª/4.º) dentro do nível.
    setQuestions(pickQuizPais(region, lv, perfil?.grade));
    setIdx(0);
    setPicked(null);
    setCorrect(0);
    setResultado(null);
    setNovasConquistas([]);
    setFase("jogo");
  };

  const responder = (i: number) => {
    if (picked !== null) return;
    const q = questions[idx];
    if (!q) return;
    setPicked(i);
    if (i === q.answerIndex) {
      setCorrect((c) => c + 1);
      playCorrect();
      haptic("tap");
    } else {
      playWrong();
      haptic("error");
    }
    const acertos = correct + (i === q.answerIndex ? 1 : 0);
    window.setTimeout(
      () => {
        if (idx + 1 >= questions.length) {
          const { unlockedNow, isRecord } = region
            ? saveQuizPaisResult(region, level, acertos)
            : { unlockedNow: false, isRecord: false };
          setResultado({ unlockedNow, isRecord });
          setProgress(loadQuizPaisProgress());
          if (unlockedNow || acertos >= 5) {
            playLevelUp();
            void confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
          }
          // Recompensas: moedas + XP diretas no perfil (padrão do arcade),
          // escaladas pelo nível — Campeão paga mais que Fácil.
          // Lê o perfil NO clique — jogadas repetidas na mesma sessão nunca perdem moedas.
          const atual = loadProfile();
          const { moedas, xp } = quizPaisRewards(level, acertos);
          updateProfile({ coins: (atual?.coins ?? 0) + moedas, xp: (atual?.xp ?? 0) + xp });
          // Conquistas do Júnior: a rodada do País também desbloqueia medalhas
          // (sem wasPerfect — lições perfeitas continuam a ser só das lições).
          void checkAndUnlockAchievements().then((novas) => {
            if (novas.length > 0) {
              setNovasConquistas(novas);
              void confetti({
                particleCount: 120,
                spread: 90,
                origin: { y: 0.4 },
                colors: ["#ffd166", "#ff8c42", "#5db1ff"],
              });
            }
          });
          setFase("fim");
        } else {
          setIdx((n) => n + 1);
          setPicked(null);
        }
      },
      i === q.answerIndex ? MS_ACERTO : MS_ERRO,
    );
  };

  // ── Região sem pack: seletor honesto de países disponíveis ──
  if (!region) {
    return (
      <section className="card-chunky rounded-3xl border-2 border-border bg-card p-6 text-center">
        <MapPin className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-3 font-display text-xl font-bold">Quiz do Meu País</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          O quiz do teu país está a chegar! Por agora podes jogar sobre estes:
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {QUIZ_PAIS_REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                haptic("tap");
                setRegion(r);
              }}
              className="rounded-2xl border-2 border-border bg-background px-4 py-2 font-display text-sm transition hover:border-primary/60 active:scale-95"
            >
              {REGIONS[r].flag} {quizPaisCountry(r)}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const q = questions[idx];
  const flag = REGIONS[region].flag ?? "🌍";

  return (
    <section className="card-chunky rounded-3xl border-2 border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">
          {flag} Quiz de {quizPaisCountry(region)}
        </h3>
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            setRegion(null);
          }}
          className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-display text-muted-foreground transition hover:bg-muted/70"
        >
          trocar país
        </button>
      </div>

      <AnimatePresence mode="wait">
        {fase === "niveis" && (
          <motion.div
            key="niveis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <p className="text-center text-sm text-muted-foreground">
              Escolhe o teu nível — 4 acertos de 5 abrem o seguinte!
            </p>
            <div className="mt-3 grid gap-2">
              {QUIZ_PAIS_LEVELS.map(({ level: lv, nome, emoji, desc, grades }) => {
                const locked = lv > progress.unlocked;
                const best = progress.best[`${region}:${lv}`];
                const g = perfil?.grade ?? 0;
                const recomendado = g >= grades[0] && g <= grades[1];
                return (
                  <button
                    key={lv}
                    type="button"
                    disabled={locked}
                    onClick={() => jogar(lv)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition active:scale-[0.98]",
                      locked
                        ? "cursor-not-allowed border-border bg-muted/40 opacity-60"
                        : "border-border bg-background hover:border-primary/60",
                    )}
                  >
                    <span className="text-2xl">
                      {locked ? <Lock className="h-5 w-5" /> : emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold">
                        Nível {lv} · {nome}
                        {recomendado && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            Para ti ({gradeBadge(g, region)})
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {desc} · {quizPaisLevelFrame(lv, region)}
                      </span>
                    </span>
                    {best != null && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Recorde: {best}/5
                      </span>
                    )}
                    {!locked && <Play className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {fase === "jogo" && q && (
          <motion.div
            key={`jogo-${idx}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            className="mt-4"
          >
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    i < idx ? "bg-success" : i === idx ? "bg-amber-400" : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className="mt-3 font-display text-lg font-bold">{q.prompt}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => responder(i)}
                  disabled={picked !== null}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-2.5 text-left font-display text-sm font-semibold transition",
                    picked === null && "border-border bg-background hover:border-amber-300",
                    picked !== null &&
                      i === q.answerIndex &&
                      "border-success bg-success/15 text-success",
                    picked !== null &&
                      i === picked &&
                      i !== q.answerIndex &&
                      "border-destructive bg-destructive/10 text-destructive",
                    picked !== null &&
                      i !== q.answerIndex &&
                      i !== picked &&
                      "border-border opacity-50",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {picked !== null && picked !== q.answerIndex && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-2xl border border-success/40 bg-success/10 px-3 py-2 font-display text-sm font-bold text-success"
              >
                A resposta certa é: {q.options[q.answerIndex]}
              </motion.p>
            )}
          </motion.div>
        )}

        {fase === "fim" && (
          <motion.div
            key="fim"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4 text-center"
          >
            <div className="flex justify-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-8 w-8",
                    i < starCount(correct) ? "fill-amber-400 text-amber-400" : "text-muted",
                  )}
                />
              ))}
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{correct}/5 acertos!</p>
            <p className="mt-1 text-sm text-success">
              +{quizPaisRewards(level, correct).moedas} 🪙 · +{quizPaisRewards(level, correct).xp}{" "}
              ⭐
            </p>
            {resultado?.isRecord && (
              <p className="mt-2 font-display text-sm font-bold text-amber-600">
                🎉 Novo recorde do nível {level}!
              </p>
            )}
            {resultado?.unlockedNow && (
              <p className="mt-1 flex items-center justify-center gap-1 font-display text-sm font-bold text-primary">
                <Sparkles className="h-4 w-4" /> Nível {Math.min(level + 1, QUIZ_PAIS_MAX_LEVEL)}{" "}
                desbloqueado!
              </p>
            )}
            {novasConquistas.length > 0 && (
              <div className="mt-3 space-y-1">
                {novasConquistas.slice(0, 3).map((a) => (
                  <p key={a.code} className="font-display text-sm font-bold text-secondary">
                    🏅 Nova conquista: {a.title} (+{a.coin_reward} 🪙)
                  </p>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <ChunkyButton tone="primary" onClick={() => jogar(level)}>
                Jogar de novo
              </ChunkyButton>
              <ChunkyButton tone="ghost" onClick={() => setFase("niveis")}>
                Escolher nível
              </ChunkyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {fase === "niveis" && progress.unlocked >= QUIZ_PAIS_MAX_LEVEL && (
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          {QUIZ_PAIS_REGIONS.length} países disponíveis · desbloqueaste todos os níveis — és um
          campeão! 🏆
        </p>
      )}
    </section>
  );
}
