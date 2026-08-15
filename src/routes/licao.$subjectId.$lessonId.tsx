import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitChallengeScore } from "@/lib/challenges.functions";
import { explainMistake } from "@/lib/ai.functions";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mascot } from "@/components/Mascot";
import { MascotExpression } from "@/components/MascotExpression";
import { useMascotReaction } from "@/hooks/useMascotReaction";
import { LessonScene } from "@/components/LessonScene";
import { ChunkyButton } from "@/components/ChunkyButton";
import { SoundToggle } from "@/components/SoundToggle";
import { LessonCompleteScreen } from "@/components/LessonCompleteScreen";
import { ComboTracker, ComboPopup } from "@/components/ComboTracker";
import { getLesson, getSubject } from "@/lib/curriculum";
import { completeLesson, loadProfile, updateProfile, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { playCorrect, playWrong, playLevelUp, speak, stopSpeech, ttsAvailable } from "@/lib/audio";
import { checkAndUnlockAchievements, type Achievement } from "@/lib/achievements";
import { useVoiceMatch, isVoiceAvailable } from "@/lib/voice";
import { Check, Heart, Mic, Sparkles, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { RouteError } from "@/components/RouteError";


export const Route = createFileRoute("/licao/$subjectId/$lessonId")({
  validateSearch: (search: Record<string, unknown>) => ({
    challenge: typeof search.challenge === "string" ? search.challenge : undefined,
  }),
  head: ({ params }) => {
    const subject = getSubject(params.subjectId);
    const lesson = getLesson(params.subjectId, params.lessonId);
    const subjectName = subject?.name ?? "Matérias";
    const lessonTitle = lesson?.title ?? "Lição";
    const title = `${lessonTitle} (${subjectName}) — Lição interativa | Alegria`;
    const description = `Lição interativa de ${subjectName} para o 1.º ciclo: ${lessonTitle}. Perguntas adaptativas, voz e mascotes para aprender a brincar no Alegria.`;
    const url = `https://alegria.online/licao/${params.subjectId}/${params.lessonId}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "robots", content: "noindex" },
        { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
        { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LessonPage,
  errorComponent: RouteError,
});

function LessonPage() {
  const { subjectId, lessonId } = useParams({ from: "/licao/$subjectId/$lessonId" });
  const navigate = useNavigate();
  const fnSubmitChallenge = useServerFn(submitChallengeScore);
  const fnExplainMistake = useServerFn(explainMistake);
  const search = Route.useSearch();
  const challengeId = search.challenge ?? null;


  const subject = getSubject(subjectId);
  const lesson = getLesson(subjectId, lessonId);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [done, setDone] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [bonusXp, setBonusXp] = useState(0);
  const [firstTryRight, setFirstTryRight] = useState(0);
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const lastSpokenRef = useRef<string>("");
  const startTimeRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());
  const reaction = useMascotReaction({ childName: undefined, speak: false });


  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
    setHearts(p.hearts);
    startTimeRef.current = Date.now();
  }, [navigate]);

  const total = lesson?.questions.length ?? 0;
  const progress = useMemo(
    () => (total === 0 ? 0 : ((qIndex + (revealed ? 1 : 0)) / total) * 100),
    [qIndex, revealed, total],
  );

  const q = lesson?.questions[qIndex];

  useEffect(() => {
    if (!q || done || hearts === 0) return;
    const text = q.prompt;
    if (lastSpokenRef.current === text) return;
    lastSpokenRef.current = text;
    const t = setTimeout(() => speak(text), 350);
    return () => {
      clearTimeout(t);
      stopSpeech();
    };
  }, [q, done, hearts]);

  useEffect(() => () => stopSpeech(), []);

  const voiceEnabled = subject?.id === "portugues" && isVoiceAvailable();
  const voice = useVoiceMatch(q?.options ?? []);
  // Auto-select option when voice matches
  useEffect(() => {
    if (voice.matchedIndex !== null && !revealed) {
      setSelected(voice.matchedIndex);
    }
  }, [voice.matchedIndex, revealed]);

  if (!profile) return (
    <main id="main-content" className="flex min-h-[60dvh] items-center justify-center">
      <p className="animate-pulse font-display text-lg text-muted-foreground" role="status" aria-live="polite">A carregar…</p>
    </main>
  );
  if (!subject || !lesson || !q) {
    return (
      <main id="main-content" className="flex min-h-[100dvh] items-center justify-center p-6 text-center">
        <div>
          <p className="font-display text-2xl">Lição não encontrada</p>
          <Link to="/app" className="mt-4 inline-block text-primary underline">Voltar</Link>
        </div>
      </main>
    );
  }

  const isCorrect = revealed && selected === q.answerIndex;

  const onCheck = () => {
    if (selected === null) return;
    setRevealed(true);
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    if (selected === q.answerIndex) {
      setCorrect((c) => c + 1);
      playCorrect();
      const wasFirstTry = wrongAttempts === 0;
      if (wasFirstTry) setFirstTryRight((n) => n + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      // Bónus: combo (x5 XP por nível ≥3) + velocidade (≤8s = +5)
      let extra = 0;
      if (nextCombo >= 3) extra += (nextCombo - 2) * 5;
      if (wasFirstTry && elapsed <= 8) extra += 5;
      if (extra > 0) setBonusXp((b) => b + extra);
      reaction.react(nextCombo >= 3 ? "comboUp" : "correct");
      speak("Boa! Resposta certa!");
      confetti({
        particleCount: 60 + Math.min(60, nextCombo * 10),
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#ff8c42", "#5db1ff", "#7cd16e", "#ffd166"],
      });
      // Show combo popup for big combos
      if (nextCombo >= 3) {
        setShowComboPopup(true);
      }
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setCombo(0);
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      playWrong();
      reaction.react("wrong");
      speak(`Quase! A resposta certa é ${q.options[q.answerIndex]}.`);
      // Após 2 tentativas erradas, busca explicação personalizada da IA.
      if (attempts >= 2 && !aiHint && !aiLoading) {
        setAiLoading(true);
        fnExplainMistake({
          data: {
            question: q.prompt,
            childAnswer: q.options[selected],
            correctAnswer: q.options[q.answerIndex],
            subject: subject.id,
            grade: lesson.grade,
          },
        })
          .then((res) => setAiHint(`${res.explanation} ${res.hint}`.trim()))
          .catch(() => setAiHint(`A resposta certa é "${q.options[q.answerIndex]}". Tu consegues à próxima!`))
          .finally(() => setAiLoading(false));
      }
    }
  };

  const onNext = () => {
    if (qIndex + 1 >= total) {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const updated = completeLesson({
        lessonId: lesson.id,
        subjectId: subject.id,
        grade: lesson.grade,
        correct: finalCorrect,
        total,
        durationSeconds,
      });
      // Aplica bónus de combos/velocidade por cima do XP base.
      const withBonus = bonusXp > 0 ? updateProfile({ xp: updated.xp + bonusXp }) : updated;
      const xpDelta = withBonus.xp - profile.xp;
      const coinsDelta = withBonus.coins - profile.coins;
      setXpEarned(xpDelta);
      setCoinsEarned(coinsDelta);
      setProfile(withBonus);
      setDone(true);
      playLevelUp();
      reaction.react("outro");
      confetti({ particleCount: 200, spread: 110, origin: { y: 0.6 } });
      if (challengeId) {
        const score = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
        void fnSubmitChallenge({ data: { challengeId, score } }).catch((e) => console.error("submitChallengeScore", e));
      }
      void checkAndUnlockAchievements({ wasPerfect: finalCorrect === total }).then((unlocked) => {
        if (unlocked.length > 0) {
          setNewAchievements(unlocked);
          setProfile(loadProfile());
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 }, colors: ["#ffd166", "#ff8c42", "#5db1ff"] });
        }
      });
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      setWrongAttempts(0);
      setAiHint(null);
      questionStartRef.current = Date.now();
    }
  };



  if (done) {
    const finalCorrect = correct;
    const isPerfect = finalCorrect === total;
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    return (
      <LessonCompleteScreen
        mascotId={profile.mascot}
        lessonTitle={lesson.title}
        correct={finalCorrect}
        total={total}
        xpEarned={xpEarned}
        coinsEarned={coinsEarned}
        newAchievements={newAchievements}
        isPerfect={isPerfect}
        durationSeconds={durationSeconds}
        bonusXp={bonusXp}
        maxCombo={maxCombo}
        onContinue={() => navigate({ to: "/app" })}
        onRetry={() => window.location.reload()}
        nextLesson={null}
      />
    );
  }

  if (hearts === 0) {
    return (
      <main className="bg-paper flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <Mascot id={profile.mascot} size="lg" equippedItemId={profile.equippedItem} />
        <h1 className="mt-4 font-display text-4xl">Sem corações 💔</h1>
        <p className="mt-2 text-muted-foreground">Tenta de novo, tu consegues!</p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Link to="/app" className="flex-1"><ChunkyButton tone="ghost" className="w-full">Voltar</ChunkyButton></Link>
          <ChunkyButton onClick={() => window.location.reload()} className="flex-1">Tentar outra vez</ChunkyButton>
        </div>
      </main>
    );
  }

  return (
    <LessonScene subject={subject.id}>
    <main className="min-h-[100dvh] pb-32" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}>
      <header
        className="sticky top-0 z-20 bg-background/80 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/app" aria-label="Sair" className="rounded-full p-2 hover:bg-muted">
            <X className="h-6 w-6 text-muted-foreground" />
          </Link>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-success"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <ComboTracker combo={combo} variant="inline" />
          <div className="flex items-center gap-1 font-display text-destructive">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-semibold">{hearts}</span>
          </div>
          <SoundToggle />
        </div>
      </header>

      {/* Combo popup overlay */}
      <ComboPopup
        combo={combo}
        show={showComboPopup}
        onDone={() => setShowComboPopup(false)}
      />

      <div className="mx-auto max-w-2xl px-4 pt-6 sm:pt-8">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-5 flex items-end gap-3">
            <MascotExpression
              mascotId={profile.mascot}
              size="md"
              mood={reaction.mood}
              equippedItemId={profile.equippedItem}
            />
            <div className="card-chunky relative flex-1 rounded-3xl rounded-bl-none border border-border bg-card px-4 py-3 sm:px-5 sm:py-4">
              <p className="pr-8 font-display text-base leading-snug sm:text-lg">{q.prompt}</p>
              {ttsAvailable() && (
                <button
                  type="button"
                  onClick={() => speak(q.prompt)}
                  aria-label="Ouvir pergunta"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground active:scale-90"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {(aiLoading || aiHint) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2 rounded-2xl border-2 border-primary/40 bg-primary/10 px-3 py-2 text-sm"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="leading-snug">
                {aiLoading ? "A pensar numa explicação fácil…" : aiHint}
              </p>
            </motion.div>
          )}



          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {q.options.map((opt, i) => {
              const isSel = selected === i;
              const showCorrect = revealed && i === q.answerIndex;
              const showWrong = revealed && isSel && i !== q.answerIndex;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: revealed ? 1 : 0.97 }}
                  disabled={revealed}
                  onClick={() => {
                    setSelected(i);
                    speak(opt, { rate: 1 });
                  }}
                  className={cn(
                    "card-chunky flex min-h-[60px] items-center rounded-2xl border-2 border-border bg-card px-4 py-4 text-left font-display text-base transition-all sm:text-lg",
                    isSel && !revealed && "border-primary ring-4 ring-primary/25",
                    showCorrect && "border-success bg-success/15 text-success",
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
        </motion.div>
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-30 border-t-4",
              isCorrect ? "border-success bg-success/15" : "border-destructive bg-destructive/10",
            )}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {isCorrect ? <Check className="h-6 w-6" strokeWidth={3} /> : <X className="h-6 w-6" strokeWidth={3} />}
                </span>
                <div>
                  <p className={cn("font-display text-lg sm:text-xl", isCorrect ? "text-success" : "text-destructive")}>
                    {isCorrect ? "Excelente!" : "Quase!"}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      Resposta certa: <strong>{q.options[q.answerIndex]}</strong>
                    </p>
                  )}
                </div>
              </div>
              <ChunkyButton tone={isCorrect ? "success" : "danger"} onClick={onNext} className="w-full sm:w-auto">
                Continuar →
              </ChunkyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 sm:py-4">
            {voiceEnabled && (
              <button
                type="button"
                onClick={voice.listening ? voice.stop : voice.start}
                aria-label={voice.listening ? "A ouvir" : "Responder por voz"}
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 transition-all active:scale-95",
                  voice.listening
                    ? "animate-pulse border-destructive bg-destructive/15 text-destructive"
                    : "border-border bg-card text-primary hover:border-primary",
                )}
              >
                <Mic className="h-6 w-6" strokeWidth={2.5} />
              </button>
            )}
            {voiceEnabled && voice.error && (
              <p className="hidden text-xs text-muted-foreground sm:inline">{voice.error}</p>
            )}
            <ChunkyButton onClick={onCheck} disabled={selected === null} className="ml-auto w-full sm:w-auto">
              Verificar
            </ChunkyButton>
          </div>
        </div>
      )}
    </main>
    </LessonScene>
  );

}
