import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { loadProfile, updateProfile, type Profile } from "@/lib/storage";
import {
  TRACKS,
  generateQuestions,
  loadInfiniteProgress,
  recordResult,
  type GenQuestion,
  type TrackId,
} from "@/lib/infiniteChallenges";
import { ArrowLeft, Crown, Infinity as InfinityIcon, Lock, Sparkles, Star, Trophy } from "lucide-react";

export const Route = createFileRoute("/desafios/infinitos")({
  head: () => ({
    meta: [
      { title: "Desafios Infinitos — níveis para todas as idades | Kidoz" },
      { name: "description", content: "Centenas de níveis procedurais de matemática, língua, ciências e lógica. Aprende sem fim, do pré-escolar ao avançado." },
    ],
  }),
  component: InfinitePage,
});

type View = "tracks" | "levels" | "play" | "result";

function InfinitePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState(() => loadInfiniteProgress());
  const [view, setView] = useState<View>("tracks");
  const [trackId, setTrackId] = useState<TrackId | null>(null);
  const [level, setLevel] = useState<number>(1);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) { navigate({ to: "/comecar" }); return; }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;
  const isPremium = !!profile.isPremium;
  const age = profile.age || 7;

  const visibleTracks = useMemo(() => TRACKS.filter((t) => age >= t.ageMin - 2), [age]);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/desafios" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Desafios
        </Link>

        {view === "tracks" && (
          <>
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-chunky relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/30 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <InfinityIcon className="h-9 w-9 text-primary" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl">Desafios Infinitos</h1>
                  <p className="text-sm text-muted-foreground">Níveis procedurais que crescem contigo. {progress.totalXp} XP infinito acumulado.</p>
                </div>
              </div>
            </motion.section>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {visibleTracks.map((t) => {
                const locked = t.premium && !isPremium;
                const cur = progress.levels[t.id] ?? 1;
                return (
                  <motion.button
                    key={t.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (locked) { navigate({ to: "/premium" }); return; }
                      setTrackId(t.id); setLevel(cur); setView("levels");
                    }}
                    className={`card-chunky relative flex flex-col rounded-3xl border-2 p-4 text-left ${locked ? "border-border/60 bg-muted/40" : "border-border bg-card hover:border-primary/60"}`}
                  >
                    {locked && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-display text-primary">
                        <Lock className="h-3 w-3" /> Premium
                      </span>
                    )}
                    <div className="text-3xl">{t.emoji}</div>
                    <p className="mt-1 font-display text-base leading-tight">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.tagline}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-display text-primary">
                      <Sparkles className="h-3 w-3" /> Nível {cur}/∞
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {!isPremium && (
              <div className="card-chunky mt-6 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
                <div className="flex items-start gap-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <p className="font-display text-lg">Desbloqueia tudo com Premium</p>
                    <p className="text-sm text-muted-foreground">Acesso a álgebra, frações, geometria, gramática avançada, geografia, história e enigmas — milhares de níveis.</p>
                  </div>
                  <ChunkyButton onClick={() => navigate({ to: "/premium" })}>Ver Premium</ChunkyButton>
                </div>
              </div>
            )}
          </>
        )}

        {view === "levels" && trackId && (
          <LevelGrid trackId={trackId} unlocked={progress.levels[trackId] ?? 1} bestStars={progress.bestStars} onPick={(lv) => { setLevel(lv); setView("play"); }} onBack={() => setView("tracks")} />
        )}

        {view === "play" && trackId && (
          <PlayLevel
            trackId={trackId}
            level={level}
            onDone={(correct, total) => {
              const r = recordResult(trackId, level, correct, total);
              setProgress(r.progress);
              if (profile) {
                const updated = updateProfile({ xp: (profile.xp ?? 0) + r.xpGained, coins: (profile.coins ?? 0) + correct });
                setProfile(updated);
              }
              void scheduleInfiniteCloudPush();
              void submitInfiniteScoreFn({ data: {
                trackId, level, score: r.xpGained, stars: r.stars,
                age: profile?.age ?? null, region: profile?.region ?? null,
              }}).catch(() => {});
              setView("result");
            }}
            onBack={() => setView("levels")}
          />
        )}

        {view === "result" && trackId && (
          <ResultView
            trackId={trackId}
            level={level}
            stars={progress.bestStars[`${trackId}:${level}`] ?? 0}
            onNext={() => { setLevel(level + 1); setView("play"); }}
            onRetry={() => setView("play")}
            onBack={() => setView("levels")}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function LevelGrid({ trackId, unlocked, bestStars, onPick, onBack }: { trackId: TrackId; unlocked: number; bestStars: Partial<Record<string, number>>; onPick: (lv: number) => void; onBack: () => void; }) {
  const track = TRACKS.find((t) => t.id === trackId)!;
  const total = Math.max(unlocked + 12, 30);
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Pistas
        </button>
        <p className="font-display text-sm">{track.emoji} {track.name}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {Array.from({ length: total }, (_, i) => i + 1).map((lv) => {
          const isLocked = lv > unlocked;
          const stars = bestStars[`${trackId}:${lv}`] ?? 0;
          return (
            <button
              key={lv}
              disabled={isLocked}
              onClick={() => onPick(lv)}
              className={`relative aspect-square rounded-2xl border-2 font-display text-base transition ${isLocked ? "border-border/50 bg-muted/40 text-muted-foreground" : stars >= 2 ? "border-success bg-success/15 text-success" : "border-border bg-card hover:border-primary/60"}`}
            >
              {isLocked ? <Lock className="mx-auto h-4 w-4" /> : lv}
              {!isLocked && stars > 0 && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-card px-1 text-[9px]">{"★".repeat(stars)}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function PlayLevel({ trackId, level, onDone, onBack }: { trackId: TrackId; level: number; onDone: (correct: number, total: number) => void; onBack: () => void; }) {
  const track = TRACKS.find((t) => t.id === trackId)!;
  const questions = useMemo<GenQuestion[]>(() => generateQuestions(trackId, level, 8), [trackId, level]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[idx];

  const select = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answerIndex) setCorrect((c) => c + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) onDone(correct + (i === q.answerIndex ? 1 : 0), questions.length);
      else { setIdx(idx + 1); setPicked(null); }
    }, 700);
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Níveis
        </button>
        <p className="font-display text-sm">{track.emoji} Nível {level} · {idx + 1}/{questions.length}</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="card-chunky mt-4 rounded-3xl border-2 border-border bg-card p-5">
          <p className="font-display text-lg sm:text-xl">{q.prompt}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const isCorrect = picked !== null && i === q.answerIndex;
              const isWrong = picked === i && i !== q.answerIndex;
              return (
                <button
                  key={i}
                  onClick={() => select(i)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 px-4 py-3 text-left font-display text-base transition ${isCorrect ? "border-success bg-success/15 text-success" : isWrong ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-card hover:border-primary/60"}`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {q.hint && picked !== null && picked !== q.answerIndex && (
            <p className="mt-3 text-sm text-muted-foreground">💡 {q.hint}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function ResultView({ trackId, level, stars, onNext, onRetry, onBack }: { trackId: TrackId; level: number; stars: number; onNext: () => void; onRetry: () => void; onBack: () => void; }) {
  const track = TRACKS.find((t) => t.id === trackId)!;
  const advanced = stars >= 2;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-chunky mt-6 rounded-3xl border-2 border-border bg-gradient-to-br from-card to-secondary/30 p-6 text-center">
      <Trophy className="mx-auto h-12 w-12 text-primary" />
      <h2 className="mt-2 font-display text-2xl">Nível {level} terminado!</h2>
      <p className="text-sm text-muted-foreground">{track.emoji} {track.name}</p>
      <div className="my-3 flex justify-center gap-1">
        {[1, 2, 3].map((i) => (
          <Star key={i} className={`h-8 w-8 ${i <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{advanced ? "🚀 Próximo nível desbloqueado!" : "Tenta de novo para 2★ e desbloquear o próximo nível."}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <ChunkyButton tone="ghost" onClick={onBack}>Níveis</ChunkyButton>
        <ChunkyButton tone="ghost" onClick={onRetry}>Repetir</ChunkyButton>
        {advanced && <ChunkyButton onClick={onNext}><Sparkles className="mr-1 inline h-4 w-4" /> Próximo</ChunkyButton>}
      </div>
    </motion.div>
  );
}
