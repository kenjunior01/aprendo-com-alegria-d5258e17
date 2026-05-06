import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { CHAPTERS, chapterProgress, isChapterComplete, type Chapter } from "@/lib/chapters";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { AdaptiveTip } from "@/components/AdaptiveTip";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "A minha aventura — Lusis" },
      { name: "description", content: "Explora os capítulos da tua aventura: Português, Matemática e Estudo do Meio." },
    ],
  }),
  component: AppHome,
});

function AppHome() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return;
      }
      if (p.role === "parent") {
        navigate({ to: "/pais" });
        return;
      }
      setProfile(p);
    };
    init();
    return () => { cancelled = true; };
  }, [navigate]);

  if (!profile) return null;
  const mascot = getMascot(profile.mascot);

  // Show chapters up to user grade + next; sequential unlock based on previous chapter completion
  const visibleChapters = CHAPTERS.filter((c) => c.grade <= Math.min(4, profile.grade + 1));
  const completedSet = new Set(profile.completedLessons);

  const isUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const prev = visibleChapters[idx - 1];
    return isChapterComplete(prev, profile.completedLessons) || prev.grade < profile.grade;
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Hero greeting */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-accent/30 p-4 sm:mb-8 sm:p-6"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Mascot id={profile.mascot} size="md" bouncing equippedItemId={profile.equippedItem} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg sm:text-2xl">Olá, {profile.name}! ☀️</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {profile.streak > 0
                  ? `🔥 ${profile.streak} ${profile.streak === 1 ? "dia" : "dias"} seguidos! Continua!`
                  : mascot.encourage}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {profile.grade}.º ano · {completedSet.size} {completedSet.size === 1 ? "missão completa" : "missões completas"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Chapters as a vertical journey */}
        <div className="relative">
          {/* connector line */}
          <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-border via-border/50 to-transparent" />

          <div className="space-y-5 sm:space-y-7">
            {visibleChapters.map((chapter, idx) => {
              const unlocked = isUnlocked(idx);
              const progress = chapterProgress(chapter, profile.completedLessons);
              const complete = progress.pct === 1;

              return (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  unlocked={unlocked}
                  complete={complete}
                  progressDone={progress.done}
                  progressTotal={progress.total}
                  align={idx % 2 === 0 ? "left" : "right"}
                />
              );
            })}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          ✨ Mais capítulos serão desbloqueados à medida que avanças
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

function ChapterCard({
  chapter,
  unlocked,
  complete,
  progressDone,
  progressTotal,
  align,
}: {
  chapter: Chapter;
  unlocked: boolean;
  complete: boolean;
  progressDone: number;
  progressTotal: number;
  align: "left" | "right";
}) {
  const content = (
    <motion.div
      whileHover={unlocked ? { y: -3 } : undefined}
      whileTap={unlocked ? { scale: 0.98 } : undefined}
      className={cn(
        "card-chunky relative overflow-hidden rounded-3xl border-2 p-4 sm:p-5 transition-all",
        unlocked ? "border-border bg-card" : "border-border bg-muted/40",
        align === "right" && "sm:ml-12",
        align === "left" && "sm:mr-12",
      )}
    >
      {/* gradient stripe */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-2",
          `bg-gradient-to-r ${chapter.bgGradient}`,
        )}
      />

      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm sm:h-16 sm:w-16 sm:text-4xl",
            !unlocked && "grayscale opacity-60",
          )}
          style={{
            backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 22%, var(--card))`,
          }}
        >
          {chapter.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Capítulo {chapter.number}
            </span>
            {complete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-display text-[10px] font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" /> Completo
              </span>
            )}
            {!unlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-semibold text-muted-foreground">
                <Lock className="h-3 w-3" /> Bloqueado
              </span>
            )}
          </div>
          <h3
            className="mt-1 font-display text-lg leading-tight sm:text-xl"
            style={unlocked ? { color: `var(${chapter.themeColorVar})` } : undefined}
          >
            {chapter.title}
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">{chapter.subtitle}</p>
          <p className="mt-2 text-xs italic text-muted-foreground/90 line-clamp-2 sm:text-sm">
            “{chapter.story}”
          </p>

          {/* progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressTotal === 0 ? 0 : (progressDone / progressTotal) * 100}%`,
                  backgroundColor: `var(${chapter.themeColorVar})`,
                }}
              />
            </div>
            <span className="font-display text-xs text-muted-foreground">
              {progressDone}/{progressTotal}
            </span>
          </div>
        </div>

        {unlocked && !complete && (
          <Sparkles className="h-5 w-5 shrink-0 animate-pulse text-primary" />
        )}
      </div>
    </motion.div>
  );

  if (!unlocked) return <div aria-disabled>{content}</div>;
  return (
    <Link
      to="/capitulo/$chapterId"
      params={{ chapterId: chapter.id }}
      className="block"
      aria-label={`Capítulo ${chapter.number}: ${chapter.title}`}
    >
      {content}
    </Link>
  );
}
