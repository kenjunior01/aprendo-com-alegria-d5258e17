// HeartRevive — "Corações que ensinam"
//
// Quando os corações chegam a 0 no meio de uma lição, em vez de um muro
// ("Sem corações 💔" — frustração para uma criança de 6 anos), a criança
// GANHA corações de volta praticando as perguntas que errou na própria
// lição. Prática de recuperação (retrieval practice): a técnica com melhor
// evidência científica para fixar memória — transformada em resgate.
//
// • Acertou → +1 coração (com tempo para ler a correção se errou).
// • Errou no resgate → sem castigo: vê a resposta certa + dica e segue.
// • Termina ao recuperar 2 corações ou após 2 voltas pela fila.
// • Se mesmo assim não ganhar nenhum (raro), a lição mostra o ecrã de
//   descanso — a criança volta mais tarde com os corações repostos.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { playCorrect, playWrong } from "@/lib/audio";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/curriculum";
import type { MascotId } from "@/lib/mascots";

interface Props {
  /** Perguntas que a criança errou nesta lição (já com correção vista). */
  questions: Question[];
  mascotId: MascotId;
  equippedItemId?: string | null;
  /** Chamado ao terminar com o total de corações recuperados (pode ser 0). */
  onDone: (gained: number) => void;
}

/** Corações a recuperar para voltar à lição. */
const TARGET = 2;
/** Máximo de voltas pela fila de erros antes de desistir (com 0 ganhos). */
const MAX_PASSES = 2;

const shuffle = (arr: Question[]): Question[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export function HeartRevive({ questions, mascotId, equippedItemId, onDone }: Props) {
  const [queue, setQueue] = useState<Question[]>(() => shuffle(questions));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [gained, setGained] = useState(0);
  const passesRef = useRef(1);

  const q = queue[idx % Math.max(1, queue.length)];

  useEffect(() => {
    if (questions.length === 0) onDone(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const pick = (i: number) => {
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answerIndex;
    const nextGained = gained + (ok ? 1 : 0);
    if (ok) {
      setGained(nextGained);
      playCorrect();
      haptic("success");
    } else {
      playWrong();
      haptic("error");
    }
    // Erro → tempo para LER a correção com calma; acerto → ritmo.
    window.setTimeout(
      () => {
        if (nextGained >= TARGET) {
          onDone(nextGained);
          return;
        }
        const nextIdx = idx + 1;
        if (nextIdx >= queue.length) {
          if (passesRef.current >= MAX_PASSES) {
            onDone(nextGained);
            return;
          }
          passesRef.current += 1;
          setQueue(shuffle(queue));
          setIdx(0);
        } else {
          setIdx(nextIdx);
        }
        setPicked(null);
      },
      ok ? 900 : 2200,
    );
  };

  if (!q) return null;

  return (
    <main className="bg-paper flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[32rem]"
      >
        <div className="mb-4 flex items-center justify-center gap-3">
          <Mascot id={mascotId} size="md" bouncing equippedItemId={equippedItemId} />
          <div className="text-left">
            <h1 className="font-display text-2xl leading-tight sm:text-3xl">Ganha corações! 💪</h1>
            <p className="text-sm text-muted-foreground">
              Responde certo às que fugiram e voltas à missão ainda mais forte.
            </p>
          </div>
        </div>

        {/* Corações a recuperar */}
        <div className="mb-4 flex items-center justify-center gap-1.5" aria-live="polite">
          {Array.from({ length: TARGET }).map((_, i) => (
            <motion.span
              key={i}
              animate={i < gained ? { scale: [1, 1.4, 1] } : undefined}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl border-2",
                i < gained
                  ? "border-hearts bg-hearts/15 text-hearts"
                  : "border-border bg-card text-muted-foreground/40",
              )}
            >
              <Heart className={cn("h-5 w-5", i < gained && "fill-current")} />
            </motion.span>
          ))}
        </div>

        <div className="card-chunky rounded-3xl border-2 border-border bg-card p-5 sm:p-6">
          <p className="mb-4 font-display text-lg leading-snug sm:text-xl">{q.prompt}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options?.map((opt, i) => {
              const isPicked = picked === i;
              const isRight = picked !== null && i === q.answerIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={picked !== null}
                  className={cn(
                    "rounded-2xl border-2 px-4 py-3 text-left font-display text-sm transition-all active:scale-[0.97] sm:text-base",
                    isRight && "border-success bg-success/15 text-success-foreground",
                    isPicked && !isRight && "border-destructive bg-destructive/15",
                    !isPicked && !isRight && "border-border bg-card hover:border-primary/40",
                    picked !== null && !isPicked && !isRight && "opacity-60",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Correção + dica do método (tempo para ler antes de avançar) */}
          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-muted/60 p-3 text-sm"
            >
              {picked === q.answerIndex ? (
                <p className="font-display text-success">Isso! +1 coração ❤️</p>
              ) : (
                <>
                  <p className="text-destructive">
                    Quase! A resposta certa:{" "}
                    <strong>
                      {q.answerIndex !== undefined ? q.options?.[q.answerIndex] : "—"}
                    </strong>
                  </p>
                  {q.hint && <p className="mt-1 text-muted-foreground">💡 {q.hint}</p>}
                </>
              )}
            </motion.div>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Sem pressa — cada acerto traz um coração de volta.
        </p>
      </motion.div>
    </main>
  );
}
