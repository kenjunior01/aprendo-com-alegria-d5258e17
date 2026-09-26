// LightningQuiz — Quiz Relâmpago reutilizável (5 perguntas rápidas).
// Usado na Sala de Aula (maçã) e na página /desafio (quiz partilhado via WhatsApp).
// Com seed determinística, gerador e amigo recebem EXATAMENTE as mesmas perguntas.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { getRandomTriviaBoost, pickSeededTrivia, type TriviaQuestion } from "@/lib/triviaBoost";
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
  /** Callback ao fechar — devolve moedas ganhas. */
  onClose: (earnedCoins: number) => void;
  /** Callback no fim do quiz (para atualizar perfil etc.). */
  onFinish?: (correct: number, total: number) => void;
  /** Se existir, mostra botão "Desafiar amigo" com a pontuação obtida. */
  onChallenge?: (correct: number) => void;
}

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
  const questions = useMemo<TriviaQuestion[]>(
    () => (seed !== undefined ? pickSeededTrivia(seed, count) : getRandomTriviaBoost(count)),
    [seed, count],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[idx];
  const done = idx >= questions.length;
  const finishedRef = useRef(false);

  useEffect(() => {
    if (done && !finishedRef.current) {
      finishedRef.current = true;
      onFinish?.(correct, count);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answerIndex) {
      setCorrect((c) => c + 1);
      playCorrect();
      haptic("success");
    } else {
      playWrong();
      haptic("error");
    }
    setTimeout(() => {
      setIdx((v) => v + 1);
      setPicked(null);
    }, 1100);
  };

  const beat = scoreToBeat !== undefined ? correct > scoreToBeat : null;
  const tie = scoreToBeat !== undefined && correct === scoreToBeat;
  const resultEmoji = beat ? "🏆" : tie ? "🤝" : correct >= 4 ? "🎉" : "🍎";

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
          {scoreToBeat !== undefined ? "⚡ Quiz Relâmpago · Desafio" : "🍎 Pergunta Relâmpago"}
          {coinsPerCorrect > 0 && scoreToBeat === undefined
            ? ` · +${coinsPerCorrect} moedas por acerto`
            : ""}
        </span>
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            onClose(correct * coinsPerCorrect);
          }}
          aria-label="Fechar quiz"
          className="rounded-full bg-muted p-1.5 text-muted-foreground transition hover:bg-muted/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!done && q ? (
        <>
          <div className="mt-1 flex gap-1">
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
          <motion.p
            key={idx}
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
          {q.hint && picked !== null && picked !== q.answerIndex && (
            <p className="mt-2 text-xs text-muted-foreground">💡 {q.hint}</p>
          )}
        </>
      ) : (
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
            <p className="mt-1 text-sm text-muted-foreground">
              +{correct * coinsPerCorrect} moedas ganhas 🪙
            </p>
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
                onClose(correct * coinsPerCorrect);
              }}
              className="rounded-2xl bg-primary px-5 py-2.5 font-display font-bold text-primary-foreground active:scale-95"
            >
              {onChallenge ? "Fechar" : "Ótimo!"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
