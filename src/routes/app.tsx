import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { Mascot } from "@/components/Mascot";
import { SUBJECTS } from "@/lib/curriculum";
import { loadProfile, type Profile } from "@/lib/storage";
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
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;
  const mascot = getMascot(profile.mascot);

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* mascot greeting */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-4">
            <Mascot id={profile.mascot} size="md" bouncing />
            <div className="flex-1">
              <p className="font-display text-xl">Bom dia, {profile.name}! ☀️</p>
              <p className="text-sm text-muted-foreground">
                {profile.streak > 0
                  ? `Já vais em ${profile.streak} ${profile.streak === 1 ? "dia" : "dias"} seguidos. Continua!`
                  : `${mascot.encourage}`}
              </p>
            </div>
            <Link to="/perfil" className="rounded-2xl bg-accent px-4 py-2 font-display text-sm font-semibold">
              Perfil
            </Link>
          </div>
        </motion.section>

        {/* subjects */}
        <div className="space-y-10">
          {SUBJECTS.map((subject) => (
            <section key={subject.id}>
              <div
                className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: `color-mix(in oklab, var(${subject.colorVar}) 18%, var(--card))`,
                }}
              >
                <span className="text-3xl">{subject.emoji}</span>
                <div>
                  <h2
                    className="font-display text-2xl"
                    style={{ color: `var(${subject.colorVar})` }}
                  >
                    {subject.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">{subject.tagline}</p>
                </div>
              </div>

              <LessonPath subject={subject} profile={profile} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function LessonPath({
  subject,
  profile,
}: {
  subject: (typeof SUBJECTS)[number];
  profile: Profile;
}) {
  return (
    <div className="relative flex flex-col items-center gap-6 py-2">
      {subject.lessons.map((lesson, i) => {
        const done = profile.completedLessons.includes(lesson.id);
        const prevDone = i === 0 || profile.completedLessons.includes(subject.lessons[i - 1].id);
        const locked = !prevDone && !done;
        const offset = i % 2 === 0 ? "-translate-x-12" : "translate-x-12";

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
              whileTap={{ scale: locked ? 1 : 0.95 }}
              className={cn(
                "btn-chunky flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 text-center font-display",
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
                <Check className="h-8 w-8" strokeWidth={3} />
              ) : locked ? (
                <Lock className="h-7 w-7" />
              ) : (
                <>
                  <span className="text-3xl leading-none">{lesson.emoji}</span>
                  <Play className="mt-0.5 h-3 w-3" fill="currentColor" />
                </>
              )}
            </motion.div>
            <p className="mt-2 text-center font-display text-sm font-semibold">{lesson.title}</p>
          </Link>
        );
      })}
    </div>
  );
}
