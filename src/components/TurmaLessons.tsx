// TurmaLessons — "Lições da turma": o que o professor enviou para esta criança.
// Só aparece quando há sessão iniciada E lições ativas da(s) turma(s) da
// criança — caso contrário o componente desaparece (zero poluição visual).
// Cada lição joga no motor normal (/licao/turma/$id): corações, combos, XP.

import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, LoaderCircle, Play } from "lucide-react";
import { listStudentTeacherLessons, type TeacherLessonCard } from "@/lib/teacherContent.functions";
import { useAuth } from "@/hooks/useAuth";

export function TurmaLessons() {
  const { user } = useAuth();
  const fnList = useServerFn(listStudentTeacherLessons);
  const [lessons, setLessons] = useState<(TeacherLessonCard & { className: string })[] | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    if (!user) {
      setLessons(null);
      return;
    }
    fnList()
      .then((r) => {
        if (alive) setLessons(r.lessons);
      })
      .catch(() => {
        if (alive) setLessons([]);
      });
    return () => {
      alive = false;
    };
  }, [user, fnList]);

  if (!user || !lessons || lessons.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5"
      aria-labelledby="turma-lessons-title"
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h2 id="turma-lessons-title" className="font-display text-lg">
          Lições da turma
        </h2>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
          {lessons.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.id}
            to="/licao/$subjectId/$lessonId"
            params={{ subjectId: "turma", lessonId: l.id }}
            className="card-chunky group flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card to-primary/10 p-3 transition-transform active:scale-[0.98]"
          >
            <span className="text-2xl" aria-hidden="true">
              {l.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm">{l.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {l.className} · {l.grade}º ano · {l.questionCount} exercícios
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform group-hover:scale-105">
              <Play className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
