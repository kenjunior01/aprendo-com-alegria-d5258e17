import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { getLesson, getSubject } from "@/lib/curriculum";
import { completeLesson, loadProfile, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { Check, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/licao/$subjectId/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lição — Lusis" },
      { name: "description", content: "Lição interativa com perguntas divertidas." },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { subjectId, lessonId } = useParams({ from: "/licao/$subjectId/$lessonId" });
  const navigate = useNavigate();

  const subject = getSubject(subjectId);
  const lesson = getLesson(subjectId, lessonId);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
    setHearts(p.hearts);
  }, [navigate]);

  const total = lesson?.questions.length ?? 0;
  const progress = useMemo(
    () => (total === 0 ? 0 : ((qIndex + (revealed ? 1 : 0)) / total) * 100),
    [qIndex, revealed, total],
  );

  if (!profile) return null;
  if (!subject || !lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="font-display text-2xl">Lição não encontrada</p>
          <Link to="/app" className="mt-4 inline-block text-primary underline">Voltar</Link>
        </div>
      </main>
    );
  }

  const q = lesson.questions[qIndex];
  const isCorrect = revealed && selected === q.answerIndex;

  const onCheck = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === q.answerIndex) {
      setCorrect((c) => c + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ff8c42", "#5db1ff", "#7cd16e", "#ffd166"],
      });
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
  };

  const onNext = () => {
    if (qIndex + 1 >= total) {
      const earned = Math.round((correct + (isCorrect ? 1 : 0)) * 10);
      const updated = completeLesson(lesson.id, earned);
      setProfile(updated);
      setDone(true);
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  if (done) {
    const earned = Math.round((correct) * 10);
    const accuracy = Math.round((correct / total) * 100);
    return (
      <main className="bg-paper flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
        <Mascot id={profile.mascot} size="xl" bouncing />
        <h1 className="mt-4 font-display text-5xl text-primary">Boa! 🎉</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Lição completa: <strong>{lesson.title}</strong>
        </p>
        <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-3">
          <Stat label="Acertos" value={`${correct}/${total}`} />
          <Stat label="Precisão" value={`${accuracy}%`} />
          <Stat label="XP ganho" value={`+${earned}`} />
        </div>
        <p className="mt-6 max-w-md italic text-muted-foreground">
          💬 “{getMascot(profile.mascot).encourage}”
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/app">
            <ChunkyButton tone="success">Continuar a jornada</ChunkyButton>
          </Link>
        </div>
      </main>
    );
  }

  if (hearts === 0) {
    return (
      <main className="bg-paper flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Mascot id={profile.mascot} size="lg" />
        <h1 className="mt-4 font-display text-4xl">Sem corações 💔</h1>
        <p className="mt-2 text-muted-foreground">Tenta de novo, tu consegues!</p>
        <div className="mt-6 flex gap-3">
          <Link to="/app"><ChunkyButton tone="ghost">Voltar</ChunkyButton></Link>
          <ChunkyButton onClick={() => window.location.reload()}>Tentar outra vez</ChunkyButton>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      {/* progress header */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur">
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
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-8">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 flex items-end gap-3">
            <Mascot id={profile.mascot} size="md" />
            <div className="card-chunky relative max-w-md rounded-3xl rounded-bl-none border border-border bg-card px-5 py-4">
              <p className="font-display text-lg leading-snug">{q.prompt}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isSel = selected === i;
              const showCorrect = revealed && i === q.answerIndex;
              const showWrong = revealed && isSel && i !== q.answerIndex;
              return (
                <button
                  key={i}
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "card-chunky rounded-2xl border-2 border-border bg-card px-5 py-5 text-left font-display text-lg transition-transform hover:-translate-y-0.5 disabled:hover:translate-y-0",
                    isSel && !revealed && "border-primary ring-4 ring-primary/25",
                    showCorrect && "border-success bg-success/15 text-success",
                    showWrong && "border-destructive bg-destructive/10 text-destructive",
                  )}
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-sm">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* footer feedback */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-30 border-t-4",
              isCorrect
                ? "border-success bg-success/15"
                : "border-destructive bg-destructive/10",
            )}
          >
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-5">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {isCorrect ? <Check className="h-6 w-6" strokeWidth={3} /> : <X className="h-6 w-6" strokeWidth={3} />}
                </span>
                <div>
                  <p className={cn("font-display text-xl", isCorrect ? "text-success" : "text-destructive")}>
                    {isCorrect ? "Excelente!" : "Quase!"}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      Resposta certa: <strong>{q.options[q.answerIndex]}</strong>
                    </p>
                  )}
                </div>
              </div>
              <ChunkyButton tone={isCorrect ? "success" : "danger"} onClick={onNext}>
                Continuar →
              </ChunkyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl justify-end px-4 py-4">
            <ChunkyButton onClick={onCheck} disabled={selected === null}>
              Verificar
            </ChunkyButton>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-chunky rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
