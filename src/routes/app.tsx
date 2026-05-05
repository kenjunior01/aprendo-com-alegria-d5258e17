import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { SUBJECTS, GRADE_LABEL, type GradeLevel } from "@/lib/curriculum";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "A minha jornada — Lusis" },
      { name: "description", content: "Mapa de lições do 1.º ciclo: Português, Matemática e Estudo do Meio." },
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
      // try cloud first (silently merges)
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return;
      }
      setProfile(p);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!profile) return null;
  const mascot = getMascot(profile.mascot);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
        {/* mascot greeting */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative mb-6 overflow-hidden rounded-3xl border border-border bg-card p-4 sm:mb-8 sm:p-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Mascot id={profile.mascot} size="md" bouncing />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg sm:text-xl">Olá, {profile.name}! ☀️</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {profile.streak > 0
                  ? `Já vais em ${profile.streak} ${profile.streak === 1 ? "dia" : "dias"} seguidos. Continua!`
                  : `${mascot.encourage}`}
              </p>
            </div>
            <Link
              to="/perfil"
              className="hidden rounded-2xl bg-accent px-4 py-2 font-display text-sm font-semibold sm:inline-block"
            >
              Perfil
            </Link>
          </div>
        </motion.section>

        {/* subjects */}
        <div className="space-y-8 sm:space-y-10">
          {SUBJECTS.map((subject) => (
            <SubjectSection key={subject.id} subject={subject} profile={profile} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function SubjectSection({ subject, profile }: { subject: (typeof SUBJECTS)[number]; profile: Profile }) {
  // group lessons by grade
  const grades = Array.from(new Set(subject.lessons.map((l) => l.grade))).sort() as GradeLevel[];

  return (
    <section>
      <div
        className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          backgroundColor: `color-mix(in oklab, var(${subject.colorVar}) 18%, var(--card))`,
        }}
      >
        <span className="text-2xl sm:text-3xl">{subject.emoji}</span>
        <div className="min-w-0">
          <h2
            className="font-display text-xl sm:text-2xl"
            style={{ color: `var(${subject.colorVar})` }}
          >
            {subject.name}
          </h2>
          <p className="truncate text-xs text-muted-foreground">{subject.tagline}</p>
        </div>
      </div>

      <div className="space-y-6">
        {grades.map((grade) => (
          <div key={grade}>
            <p className="mb-2 ml-2 inline-block rounded-full bg-muted px-3 py-1 font-display text-xs font-semibold text-muted-foreground">
              {GRADE_LABEL[grade]}
            </p>
            <LessonPath
              subject={subject}
              profile={profile}
              lessons={subject.lessons.filter((l) => l.grade === grade)}
              allLessons={subject.lessons}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function LessonPath({
  subject,
  profile,
  lessons,
  allLessons,
}: {
  subject: (typeof SUBJECTS)[number];
  profile: Profile;
  lessons: (typeof SUBJECTS)[number]["lessons"];
  allLessons: (typeof SUBJECTS)[number]["lessons"];
}) {
  return (
    <div className="relative flex flex-col items-center gap-5 py-2 sm:gap-6">
      {lessons.map((lesson, i) => {
        const done = profile.completedLessons.includes(lesson.id);
        const globalIndex = allLessons.findIndex((l) => l.id === lesson.id);
        const prevDone =
          globalIndex === 0 || profile.completedLessons.includes(allLessons[globalIndex - 1].id);
        const locked = !prevDone && !done;
        const offset = i % 2 === 0 ? "-translate-x-8 sm:-translate-x-12" : "translate-x-8 sm:translate-x-12";

        return (
          <Link
            key={lesson.id}
            to="/licao/$subjectId/$lessonId"
            params={{ subjectId: subject.id, lessonId: lesson.id }}
            disabled={locked}
            onClick={(e) => {
              if (locked) e.preventDefault();
            }}
            className={cn("group relative", offset)}
            aria-label={lesson.title}
          >
            <motion.div
              whileHover={{ scale: locked ? 1 : 1.05 }}
              whileTap={{ scale: locked ? 1 : 0.92 }}
              className={cn(
                "btn-chunky flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 text-center font-display sm:h-24 sm:w-24",
                done
                  ? "border-success/40 bg-success text-success-foreground"
                  : locked
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-white bg-card",
              )}
              style={
                !done && !locked
                  ? {
                      backgroundColor: `var(${subject.colorVar})`,
                      color: "white",
                    }
                  : undefined
              }
            >
              {done ? (
                <Check className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={3} />
              ) : locked ? (
                <Lock className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <>
                  <span className="text-2xl leading-none sm:text-3xl">{lesson.emoji}</span>
                  <Play className="mt-0.5 h-3 w-3" fill="currentColor" />
                </>
              )}
            </motion.div>
            <p className="mt-2 max-w-[7rem] text-center font-display text-xs font-semibold leading-tight sm:max-w-none sm:text-sm">
              {lesson.title}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
