import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { submitChallengeScore } from "@/server/challenges.functions";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { SoundToggle } from "@/components/SoundToggle";
import { getLesson, getSubject } from "@/lib/curriculum";
import { completeLesson, loadProfile, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { playCorrect, playWrong, playLevelUp, speak, stopSpeech, ttsAvailable } from "@/lib/audio";
import { checkAndUnlockAchievements, type Achievement } from "@/lib/achievements";
import { useVoiceMatch, isVoiceAvailable } from "@/lib/voice";
import { Check, Coins, Heart, Mic, Trophy, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/licao/$subjectId/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lição — Kidoz" },
      { name: "description", content: "Lição interativa com perguntas divertidas." },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { subjectId, lessonId } = useParams({ from: "/licao/$subjectId/$lessonId" });
  const navigate = useNavigate();
  const fnSubmitChallenge = useServerFn(submitChallengeScore);
  const challengeId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("challenge") : null;

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
  const lastSpokenRef = useRef<string>("");
  const startTimeRef = useRef<number>(Date.now());

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

  if (!profile) return null;
  if (!subject || !lesson || !q) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center p-6 text-center">
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
    if (selected === q.answerIndex) {
      setCorrect((c) => c + 1);
      playCorrect();
      haptic("success");
      speak("Boa! Resposta certa!");
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#ff8c42", "#5db1ff", "#7cd16e", "#ffd166"],
      });
    } else {
      setHearts((h) => Math.max(0, h - 1));
      playWrong();
      haptic("error");
      speak(`Quase! A resposta certa é ${q.options[q.answerIndex]}.`);
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
      const xpDelta = updated.xp - profile.xp;
      const coinsDelta = updated.coins - profile.coins;
      setXpEarned(xpDelta);
      setCoinsEarned(coinsDelta);
      setProfile(updated);
      setDone(true);
      playLevelUp();
      haptic("celebrate");
      confetti({ particleCount: 200, spread: 110, origin: { y: 0.6 } });
      // Submete pontuação ao desafio (PvP ou IA) se aplicável
      if (challengeId) {
        const score = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
        void fnSubmitChallenge({ data: { challengeId, score } }).catch((e) => console.error("submitChallengeScore", e));
      }
      // Verifica conquistas em background
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
    }
  };

  if (done) {
    const finalCorrect = correct;
    const accuracy = Math.round((finalCorrect / total) * 100);
    return (
      <main className="bg-paper flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10 text-center">
        <Mascot id={profile.mascot} size="xl" bouncing equippedItemId={profile.equippedItem} />
        <h1 className="mt-4 font-display text-4xl text-primary sm:text-5xl">Boa! 🎉</h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Missão completa: <strong>{lesson.title}</strong>
        </p>
        <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Stat label="Acertos" value={`${finalCorrect}/${total}`} />
          <Stat label="Precisão" value={`${accuracy}%`} />
          <Stat label="XP" value={`+${xpEarned}`} />
          <Stat label="Abracadinhos" value={`+${coinsEarned}`} icon={<Coins className="h-4 w-4 text-xp" />} />
        </div>

        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 18 }}
            className="mt-6 w-full max-w-md rounded-3xl border-2 border-primary bg-gradient-to-br from-primary/15 to-secondary/15 p-4 text-left card-chunky"
          >
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg">
                {newAchievements.length === 1 ? "Nova conquista!" : `${newAchievements.length} novas conquistas!`}
              </h2>
            </div>
            <ul className="space-y-1.5">
              {newAchievements.map((a) => (
                <li key={a.code} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">🏅 {a.title}</span>
                  <span className="shrink-0 text-xs font-semibold text-secondary">+{a.coin_reward} 🪙</span>
                </li>
              ))}
            </ul>
            <Link to="/conquistas" className="mt-3 block text-center text-xs font-semibold text-primary underline">
              Ver todas as conquistas →
            </Link>
          </motion.div>
        )}

        <p className="mt-6 max-w-md text-sm italic text-muted-foreground sm:text-base">
          💬 “{getMascot(profile.mascot).encourage}”
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/loja" className="flex-1">
            <ChunkyButton tone="secondary" className="w-full">Visitar a loja 🛍️</ChunkyButton>
          </Link>
          <Link to="/app" className="flex-1">
            <ChunkyButton tone="success" className="w-full">Continuar aventura</ChunkyButton>
          </Link>
        </div>
      </main>
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
    <main className="min-h-[100dvh] bg-background pb-32" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}>
      <header
        className="sticky top-0 z-20 bg-background/95 backdrop-blur"
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
          <div className="flex items-center gap-1 font-display text-destructive">
            <Heart className="h-5 w-5 fill-current" />
            <span className="font-semibold">{hearts}</span>
          </div>
          <SoundToggle />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-6 sm:pt-8">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-5 flex items-end gap-3">
            <Mascot id={profile.mascot} size="md" equippedItemId={profile.equippedItem} />
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
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="card-chunky rounded-2xl border border-border bg-card p-3 sm:p-4">
      <p className="flex items-center justify-center gap-1 text-[10px] uppercase text-muted-foreground sm:text-xs">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-lg sm:text-2xl">{value}</p>
    </div>
  );
}
