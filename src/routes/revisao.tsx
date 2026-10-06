// /revisao — Revisão Mágica: prática espaçada dos erros de dias anteriores.
// A técnica com melhor evidência científica para fixar memória: rever o que
// falhou no dia seguinte. +1 moeda por acerto; acertou → sai da fila,
// voltou a errar → fica para amanhã.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, Lightbulb, Sparkles, Volume2, X } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { KidLoader } from "@/components/KidLoader";
import { MascotExpression } from "@/components/MascotExpression";
import { RouteError } from "@/components/RouteError";
import { loadProfile, updateProfile, type Profile } from "@/lib/storage";
import { dueItems, markReviewed, type ReviewItem } from "@/lib/reviewQueue";
import { playCorrect, playLevelUp, playWrong, speak, stopSpeech } from "@/lib/audio";
import { getMascot } from "@/lib/mascots";
import { useMascotReaction } from "@/hooks/useMascotReaction";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/revisao")({
  head: () => ({
    meta: [
      { title: "Revisão Mágica ✨ — Treina os teus erros | Kidoz" },
      {
        name: "description",
        content:
          "A Revisão Mágica do Kidoz traz de volta as perguntas que escaparam, no momento certo para a memória — e paga moedas por cada acerto.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RevisaoPage,
  errorComponent: RouteError,
});

function RevisaoPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [finished, setFinished] = useState<{ correct: number; total: number } | null>(null);
  const spokenRef = useRef<string>("");
  const reaction = useMascotReaction({ childName: undefined, speak: false });

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
    // Captura a fila uma vez — o que acertar sai, mas a sessão não muda a meio.
    setItems(dueItems());
  }, [navigate]);

  const item = items && items.length > 0 ? items[idx] : undefined;
  const total = items?.length ?? 0;
  const progress = total === 0 ? 0 : ((idx + (revealed ? 1 : 0)) / total) * 100;

  // Lê a pergunta em voz alta (uma vez por pergunta).
  useEffect(() => {
    if (!item || revealed || finished) return;
    if (spokenRef.current === item.prompt) return;
    spokenRef.current = item.prompt;
    const t = setTimeout(() => speak(item.prompt), 350);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, [item, revealed, finished]);

  useEffect(() => () => stopSpeech(), []);

  const onCheck = () => {
    if (!item || selected === null || revealed) return;
    setRevealed(true);
    const right = selected === item.answerIndex;
    if (right) {
      setCorrect((c) => c + 1);
      playCorrect();
      reaction.react("correct");
      speak("Boa! Já sabes!");
      haptic("success");
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.7 },
        colors: ["#ff8c42", "#5db1ff", "#7cd16e", "#ffd166"],
      });
      markReviewed(item.id, true);
    } else {
      playWrong();
      reaction.react("wrong");
      setHint(item.hint ?? item.explanation ?? null);
      speak(`Quase! A resposta certa é ${item.options[item.answerIndex]}.`);
      haptic("tap");
      markReviewed(item.id, false);
    }
  };

  const onNext = () => {
    if (!items || !profile) return;
    if (idx + 1 >= items.length) {
      if (correct > 0) {
        const updated = updateProfile({ coins: profile.coins + correct });
        setProfile(updated);
      }
      setFinished({ correct, total });
      playLevelUp();
      reaction.react("outro");
      confetti({ particleCount: 170, spread: 100, origin: { y: 0.6 } });
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setHint(null);
    }
  };

  if (!profile || items === null) return <KidLoader />;

  // ── Fila vazia: nada para rever ──
  if (total === 0) {
    const mascot = getMascot(profile.mascot);
    return (
      <main
        id="main-content"
        className="bg-sky-island flex min-h-[100dvh] flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <img
          src={mascot.image}
          alt=""
          aria-hidden
          className="animate-bounce-soft h-24 w-24 rounded-3xl"
        />
        <h1 className="font-display text-3xl">Estás em dia! 🎉</h1>
        <p className="max-w-sm text-muted-foreground">
          Não há perguntas à espera de revisão. Erra numa lição e volta amanhã — a Revisão Mágica
          traz-as de volta no momento certo para a memória.
        </p>
        <ChunkyButton
          onClick={() => navigate({ to: "/app" })}
          className="mt-2"
          aria-label="Voltar à aventura"
        >
          Voltar à aventura
        </ChunkyButton>
      </main>
    );
  }

  // ── Fim da sessão ──
  if (finished) {
    const isPerfect = finished.correct === finished.total;
    return (
      <main
        id="main-content"
        className="bg-paper flex min-h-[100dvh] flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 12 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-success/15 text-6xl"
        >
          🪄
        </motion.div>
        <h1 className="font-display text-4xl text-gradient-brand">
          {isPerfect ? "Erros eliminados! 🌟" : "Revisão concluída! 💪"}
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Acertaste em <strong className="text-foreground">{finished.correct}</strong> de{" "}
          <strong className="text-foreground">{finished.total}</strong> perguntas
          {finished.correct > 0 && (
            <>
              {" "}
              e ganhaste{" "}
              <strong className="text-foreground">
                +{finished.correct} {finished.correct === 1 ? "moeda" : "moedas"}
              </strong>{" "}
              🪙
            </>
          )}
          . {!isPerfect && "As que fugiram voltam amanhã — vais conseguir!"}
        </p>
        <ChunkyButton
          onClick={() => navigate({ to: "/app" })}
          className="mt-2"
          aria-label="Continuar aventura"
        >
          Continuar aventura →
        </ChunkyButton>
      </main>
    );
  }

  // ── Sessão de revisão ──
  const isCorrect = revealed && selected === item?.answerIndex;
  const showHint = revealed && !isCorrect && hint;

  return (
    <main
      id="main-content"
      className="bg-paper flex min-h-[100dvh] flex-col pb-36"
      style={{ paddingBottom: "calc(9rem + env(safe-area-inset-bottom))" }}
    >
      <header
        className="sticky top-0 z-20 bg-background/80 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-[48rem] items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/app" })}
            aria-label="Sair"
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <span className="inline-flex items-center gap-1 font-display text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {idx + 1}/{total}
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[48rem] flex-1 flex-col justify-center px-4 pt-4">
        <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🪄 Revisão Mágica · {item?.lessonTitle}
          </div>
          <div className="mb-5 flex items-end gap-3">
            <MascotExpression
              mascotId={profile.mascot}
              size="md"
              mood={reaction.mood}
              equippedItemId={profile.equippedItem}
            />
            <div className="card-chunky relative flex-1 rounded-3xl rounded-bl-none border border-border bg-card px-4 py-3 sm:px-5 sm:py-4">
              <p className="pr-8 font-display text-base leading-snug sm:text-lg">{item?.prompt}</p>
              {item && (
                <button
                  type="button"
                  onClick={() => speak(item.prompt)}
                  aria-label="Ouvir pergunta"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground active:scale-90"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {showHint && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border-2 border-primary/40 bg-primary/10 px-3 py-2 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="leading-snug">{hint}</p>
            </div>
          )}

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {(item?.options ?? []).map((opt, i) => {
              const isSel = selected === i;
              const showCorrect = revealed && item && i === item.answerIndex;
              const showWrong = revealed && isSel && item && i !== item.answerIndex;
              return (
                <motion.button
                  key={`${idx}-${i}`}
                  whileTap={{ scale: revealed ? 1 : 0.96 }}
                  disabled={revealed}
                  onClick={() => {
                    setSelected(i);
                    speak(opt, { rate: 1 });
                    haptic("tap");
                  }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={
                    showWrong
                      ? { opacity: 1, y: 0, x: [0, -9, 9, -6, 6, 0] }
                      : { opacity: 1, y: 0, x: 0 }
                  }
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "card-chunky flex min-h-[60px] items-center rounded-2xl border-2 border-border bg-card px-4 py-4 text-left font-display text-base sm:text-lg",
                    isSel && !revealed && "border-primary ring-4 ring-primary/25",
                    showCorrect &&
                      "border-success bg-success/15 text-success shadow-[0_0_18px_2px_rgba(124,209,110,0.4)]",
                    showWrong && "border-destructive bg-destructive/10 text-destructive",
                  )}
                >
                  <span className="mr-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </motion.button>
              );
            })}
          </div>

          {revealed && item?.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-accent/40 bg-accent/15 px-3 py-2.5 text-sm"
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
              <p className="leading-snug">
                <span className="font-display font-bold">Sabias? </span>
                {item.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-[48rem] items-center gap-2 px-4 py-3 sm:py-4">
          {revealed ? (
            <div className="flex w-full items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isCorrect
                    ? "bg-success text-success-foreground"
                    : "bg-destructive text-destructive-foreground",
                )}
              >
                {isCorrect ? (
                  <Check className="h-6 w-6" strokeWidth={3} />
                ) : (
                  <X className="h-6 w-6" strokeWidth={3} />
                )}
              </span>
              <p className="font-display text-base">
                {isCorrect ? (
                  <span className="text-success">+1 moeda 🪙</span>
                ) : (
                  <span className="text-destructive">
                    Resposta certa: <strong>{item ? item.options[item.answerIndex] : ""}</strong>
                  </span>
                )}
              </p>
              <ChunkyButton
                tone={isCorrect ? "success" : "danger"}
                onClick={onNext}
                className="ml-auto"
              >
                Continuar →
              </ChunkyButton>
            </div>
          ) : (
            <ChunkyButton
              onClick={onCheck}
              disabled={selected === null}
              className={cn("ml-auto w-full sm:w-auto", selected !== null && "cta-glow")}
            >
              Verificar
            </ChunkyButton>
          )}
        </div>
      </div>
    </main>
  );
}
