// LightningQuiz — Quiz Relâmpago reutilizável (5 perguntas rápidas).
// Usado na Sala de Aula (maçã) e na página /desafio (quiz partilhado via WhatsApp).
// Com seed determinística, gerador e amigo recebem EXATAMENTE as mesmas perguntas.
//
// Aprendizagem em primeiro lugar:
// • Erro → a resposta certa fica destacada + dica do método, com tempo para LER
//   antes de avançar (2,4s vs 0,9s no acerto).
// • No fim, "Treinar os erros" repete só as falhadas (prática de recuperação,
//   a técnica com melhor evidência para fixar memória).
// • Dicas pedagógicas automáticas para aritmética (hintFor) — ensinam o método.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, MessageCircle, X } from "lucide-react";
import { getRandomTriviaBoost, pickSeededTrivia, type TriviaQuestion } from "@/lib/triviaBoost";
import { hintForPergunta } from "@/lib/hintFor";
import { addMistake } from "@/lib/reviewQueue";
import { loadProfile } from "@/lib/storage";
import { detectRegion, localizeQuestion } from "@/lib/region";
import { haptic } from "@/lib/haptics";
import { playCorrect, playWrong } from "@/lib/audio";
import { cn } from "@/lib/utils";

interface Props {
  /** Seed determinística — se ausente, gera perguntas aleatórias. */
  seed?: number;
  /** Número de perguntas (default 5). */
  count?: number;
  /** Pontuação do desafiante a bater (se veio de /desafio). */
  scoreToBeat?: number;
  /** Nome do desafiante. */
  challengerName?: string;
  /** Moedas por acerto (0 desativa a recompensa). */
  coinsPerCorrect?: number;
  /** Callback ao fechar — devolve moedas ganhas (inclui ronda de revisão). */
  onClose: (earnedCoins: number) => void;
  /** Callback no fim do quiz (para atualizar perfil etc.). */
  onFinish?: (correct: number, total: number) => void;
  /** Se existir, mostra botão "Desafiar amigo" com a pontuação obtida. */
  onChallenge?: (correct: number) => void;
}

type Fase = "jogo" | "fim" | "revisao" | "fimRevisao";

/** Tempo para ler a correção com calma (erro) vs ritmo no acerto. */
const MS_ACERTO = 900;
const MS_ERRO = 2400;

export function LightningQuiz({
  seed,
  count = 5,
  scoreToBeat,
  challengerName,
  coinsPerCorrect = 2,
  onClose,
  onFinish,
  onChallenge,
}: Props) {
  const questions = useMemo<TriviaQuestion[]>(() => {
    const raw = seed !== undefined ? pickSeededTrivia(seed, count) : getRandomTriviaBoost(count);
    // O teu país no jogo: vocabulário local (BR/AO/MZ); answerIndex intacto.
    const region = loadProfile()?.region ?? detectRegion().code;
    return raw.map((qq) => localizeQuestion(qq, region));
  }, [seed, count]);
  const [fase, setFase] = useState<Fase>("jogo");
  const [lista, setLista] = useState<TriviaQuestion[]>(questions);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<TriviaQuestion[]>([]);
  const [acertosRevisao, setAcertosRevisao] = useState(0);
  const [moedasRevisao, setMoedasRevisao] = useState(0);
  const q = lista[idx];
  const done = fase === "jogo" ? idx >= questions.length : idx >= lista.length;
  const finishedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      // limpeza: nenhum timeout a avançar depois de desmontar
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (fase === "jogo" && done && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.(correct, count);
      setFase("fim");
    }
  }, [fase, done]); // eslint-disable-line react-hooks/exhaustive-deps

  const moedasBase = correct * coinsPerCorrect;
  const fechar = () => onClose(moedasBase + moedasRevisao);

  const comecarRevisao = () => {
    if (missed.length === 0) return;
    haptic("tap");
    // baralhar para não repetir a ordem memorizada
    const baralhadas = [...missed].sort(() => Math.random() - 0.5);
    setLista(baralhadas);
    setIdx(0);
    setPicked(null);
    setAcertosRevisao(0);
    setFase("revisao");
  };

  const pick = (i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    const emRevisao = fase === "revisao";
    if (i === q.answerIndex) {
      if (emRevisao) {
        setAcertosRevisao((c) => c + 1);
        setMoedasRevisao((m) => m + 1);
      } else {
        setCorrect((c) => c + 1);
      }
      playCorrect();
      haptic("success");
      timerRef.current = window.setTimeout(() => avancar(emRevisao), MS_ACERTO);
    } else {
      if (!emRevisao) {
        setMissed((m) => (m.includes(q) ? m : [...m, q]));
        // Um só sistema de revisão: erros do quiz entram na Revisão Mágica
        // (voltam amanhã, até acertar — prática espaçada sem esforço extra).
        addMistake({
          subjectId: "geral",
          subjectName: "Quiz Relâmpago",
          lessonId: "quiz-relampago",
          lessonTitle: "Quiz Relâmpago",
          question: {
            prompt: q.prompt,
            options: q.options,
            answerIndex: q.answerIndex,
            hint: q.hint,
          },
        });
      }
      playWrong();
      haptic("error");
      timerRef.current = window.setTimeout(() => avancar(emRevisao), MS_ERRO);
    }
  };

  const avancar = (emRevisao: boolean) => {
    if (emRevisao && idx + 1 >= lista.length) {
      setFase("fimRevisao");
      setIdx((v) => v + 1);
      setPicked(null);
      return;
    }
    setIdx((v) => v + 1);
    setPicked(null);
  };

  const beat = scoreToBeat !== undefined ? correct > scoreToBeat : null;
  const tie = scoreToBeat !== undefined && correct === scoreToBeat;
  const resultEmoji = beat ? "🏆" : tie ? "🤝" : correct >= 4 ? "🎉" : "🍎";
  const dica = q ? (q.hint ?? hintForPergunta(q.prompt)) : undefined;
  const emJogo = fase === "jogo" || fase === "revisao";

  return (
    <motion.div
      initial={{ scale: 0.85, y: 24 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 12 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="w-full max-w-md rounded-3xl border-4 border-amber-200 bg-card p-5 shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold text-amber-600">
          {fase === "revisao" || fase === "fimRevisao"
            ? "🎓 Treinar os erros"
            : scoreToBeat !== undefined
              ? "⚡ Quiz Relâmpago · Desafio"
              : "🍎 Pergunta Relâmpago"}
          {coinsPerCorrect > 0 && scoreToBeat === undefined && fase === "jogo"
            ? ` · +${coinsPerCorrect} moedas por acerto`
            : ""}
        </span>
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            fechar();
          }}
          aria-label="Fechar quiz"
          className="rounded-full bg-muted p-1.5 text-muted-foreground transition hover:bg-muted/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {emJogo && q ? (
        <>
          <div className="mt-1 flex gap-1">
            {lista.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i < idx ? "bg-success" : i === idx ? "bg-amber-400" : "bg-muted",
                )}
              />
            ))}
          </div>
          <motion.p
            key={`${fase}-${idx}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="mt-3 font-display text-lg font-bold"
          >
            {q.prompt}
          </motion.p>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={picked !== null}
                whileTap={picked === null ? { scale: 0.98 } : undefined}
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
              </motion.button>
            ))}
          </div>
          {picked !== null && picked !== q.answerIndex && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 rounded-2xl border border-success/40 bg-success/10 px-3 py-2"
            >
              <p className="font-display text-sm font-bold text-success">
                A resposta certa é: {q.options[q.answerIndex]}
              </p>
              {dica && <p className="mt-0.5 text-xs text-muted-foreground">💡 {dica}</p>}
            </motion.div>
          )}
        </>
      ) : fase === "fim" ? (
        <div className="py-4 text-center">
          <motion.p
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 12 }}
            className="font-display text-5xl"
          >
            {resultEmoji}
          </motion.p>
          <p className="mt-2 font-display text-2xl font-bold">
            {correct}/{count} acertos!
          </p>

          {/* Comparação com o desafiante */}
          {scoreToBeat !== undefined && challengerName && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-display font-bold">
              <div className="rounded-2xl bg-muted px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {challengerName}
                </p>
                <p>
                  {scoreToBeat}/{count}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-2xl px-3 py-2",
                  beat === true && "bg-success/20 text-success",
                  beat === false && !tie && "bg-destructive/10 text-destructive",
                  tie && "bg-amber-100 text-amber-700",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Tu</p>
                <p>
                  {correct}/{count}
                </p>
              </div>
            </div>
          )}
          {scoreToBeat !== undefined && (
            <p className="mt-2 text-sm font-semibold">
              {beat === true && "🎉 Ganhaste ao desafio!"}
              {tie && "🤝 Empate — joga de novo!"}
              {beat === false && "💪 Quase! Tenta a revanche."}
            </p>
          )}

          {coinsPerCorrect > 0 && scoreToBeat === undefined && (
            <p className="mt-1 text-sm text-muted-foreground">+{moedasBase} moedas ganhas 🪙</p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {onChallenge && (
              <button
                type="button"
                onClick={() => {
                  haptic("tap");
                  onChallenge(correct);
                }}
                className="flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-2.5 font-display font-bold text-white shadow-md active:scale-95"
              >
                <MessageCircle className="h-4 w-4" /> Desafiar amigo
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                haptic("tap");
                fechar();
              }}
              className="rounded-2xl bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground active:scale-95"
            >
              {onChallenge ? "Fechar" : "Ótimo!"}
            </button>
          </div>

          {/* Prática de recuperação: repetir só o que falhou */}
          {scoreToBeat === undefined && missed.length > 0 && (
            <button
              type="button"
              onClick={comecarRevisao}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-2.5 font-display font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <GraduationCap className="h-4 w-4" />
              Treinar os {missed.length} {missed.length === 1 ? "erro" : "erros"} · +1 🪙 cada
            </button>
          )}
        </div>
      ) : fase === "revisao" ? null : (
        // fimRevisao
        <div className="py-6 text-center">
          <motion.p
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 12 }}
            className="font-display text-5xl"
          >
            {acertosRevisao === missed.length && missed.length > 0 ? "🌟" : "🎓"}
          </motion.p>
          <p className="mt-2 font-display text-2xl font-bold">
            {acertosRevisao}/{missed.length} na revisão!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {acertosRevisao === missed.length
              ? "Agora já sabes todas — assim se aprende!"
              : "Quase! As que faltam ficam para a próxima — tu consegues."}
          </p>
          {moedasRevisao > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">+{moedasRevisao} 🪙 na revisão</p>
          )}
          <button
            type="button"
            onClick={() => {
              haptic("tap");
              fechar();
            }}
            className="mt-4 rounded-2xl bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground active:scale-95"
          >
            Continuar
          </button>
        </div>
      )}
    </motion.div>
  );
}
