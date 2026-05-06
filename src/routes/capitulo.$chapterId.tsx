import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { getChapter, chapterProgress } from "@/lib/chapters";
import { loadProfile, type Profile } from "@/lib/storage";
import { ArrowLeft, Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/capitulo/$chapterId")({
  head: () => ({
    meta: [
      { title: "Capítulo — Lusis" },
      { name: "description", content: "Aventura por capítulos: missões interativas para crianças do 1.º ciclo." },
    ],
  }),
  component: ChapterPage,
});

function ChapterPage() {
  const { chapterId } = useParams({ from: "/capitulo/$chapterId" });
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;
  if (!chapter) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center p-6 text-center">
        <div>
          <p className="font-display text-2xl">Capítulo não encontrado</p>
          <Link to="/app" className="mt-4 inline-block text-primary underline">Voltar à aventura</Link>
        </div>
      </main>
    );
  }

  const progress = chapterProgress(chapter, profile.completedLessons);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
        <Link to="/app" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Aventura
        </Link>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "card-chunky relative overflow-hidden rounded-3xl border border-border p-5 sm:p-7",
            `bg-gradient-to-br ${chapter.bgGradient}`,
          )}
        >
          <div className="absolute -right-6 -top-6 text-7xl opacity-30 sm:text-9xl">{chapter.emoji}</div>
          <p className="font-display text-xs font-semibold uppercase tracking-wide text-foreground/70">
            Capítulo {chapter.number} · {chapter.subtitle}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/85 sm:text-base">
            {chapter.story}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 max-w-[180px] flex-1 overflow-hidden rounded-full bg-foreground/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: `var(${chapter.themeColorVar})` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress.pct * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <span className="font-display text-sm font-semibold">
              {progress.done}/{progress.total}
            </span>
          </div>
        </motion.section>

        {/* Mission path */}
        <section className="mt-6">
          <h2 className="mb-4 font-display text-lg sm:text-xl">As tuas missões</h2>
          <div className="relative flex flex-col items-center gap-5 sm:gap-7">
            {chapter.missions.map((mission, i) => {
              const done = profile.completedLessons.includes(mission.lessonId);
              const prev = i === 0 ? null : chapter.missions[i - 1];
              const prevDone = !prev || profile.completedLessons.includes(prev.lessonId);
              const locked = !prevDone && !done;
              const offset = i % 2 === 0 ? "-translate-x-10 sm:-translate-x-16" : "translate-x-10 sm:translate-x-16";

              return (
                <Link
                  key={mission.lessonId}
                  to="/licao/$subjectId/$lessonId"
                  params={{ subjectId: mission.subjectId, lessonId: mission.lessonId }}
                  disabled={locked}
                  onClick={(e) => { if (locked) e.preventDefault(); }}
                  className={cn("group relative", offset)}
                  aria-label={mission.title}
                >
                  <motion.div
                    whileHover={{ scale: locked ? 1 : 1.06 }}
                    whileTap={{ scale: locked ? 1 : 0.92 }}
                    className={cn(
                      "btn-chunky flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 text-center font-display sm:h-28 sm:w-28",
                      done
                        ? "border-success/40 bg-success text-success-foreground"
                        : locked
                        ? "border-border bg-muted text-muted-foreground"
                        : "border-white",
                    )}
                    style={
                      !done && !locked
                        ? { backgroundColor: `var(${chapter.themeColorVar})`, color: "white" }
                        : undefined
                    }
                  >
                    {done ? (
                      <Check className="h-8 w-8" strokeWidth={3} />
                    ) : locked ? (
                      <Lock className="h-7 w-7" />
                    ) : (
                      <>
                        <span className="text-3xl leading-none sm:text-4xl">{mission.emoji}</span>
                        <Play className="mt-0.5 h-3 w-3" fill="currentColor" />
                      </>
                    )}
                  </motion.div>
                  <p className="mt-2 max-w-[8rem] text-center font-display text-xs font-semibold leading-tight sm:max-w-[9rem] sm:text-sm">
                    {mission.title}
                  </p>
                </Link>
              );
            })}

            {/* End reward */}
            {progress.pct === 1 && (
              <div className="mt-3 rounded-2xl bg-success/15 px-4 py-3 text-center">
                <p className="font-display text-success">🎉 Capítulo completo!</p>
                <p className="text-xs text-muted-foreground">Continuas a aventura no próximo capítulo.</p>
                <Link to="/app" className="mt-2 inline-block">
                  <ChunkyButton tone="success">Próximo capítulo →</ChunkyButton>
                </Link>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mascot id={profile.mascot} size="sm" equippedItemId={profile.equippedItem} />
          <p className="italic">“{getChapter(chapterId)?.story.split(".")[0]}.”</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
