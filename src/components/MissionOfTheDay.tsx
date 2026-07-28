import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { CHAPTERS } from "@/lib/chapters";
import { cn } from "@/lib/utils";

interface Props {
  completedLessons: string[];
  grade: number;
}

/** Highlight card for "Missão do Dia" — picks the next unfinished mission for the child's grade. */
export function MissionOfTheDay({ completedLessons, grade }: Props) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPulse(true), 600); return () => clearTimeout(t); }, []);

  const set = new Set(completedLessons);
  const visible = CHAPTERS.filter((c) => c.grade <= Math.min(4, grade + 1));
  // Today's seed picks a chapter
  const day = new Date().getDate();
  const ordered = [...visible].sort((a, b) => ((a.number + day) % 7) - ((b.number + day) % 7));
  const chapter = ordered.find((c) => c.missions.some((m) => !set.has(m.lessonId))) ?? visible[0];
  if (!chapter) return null;
  const mission = chapter.missions.find((m) => !set.has(m.lessonId)) ?? chapter.missions[0];
  const color = `var(${chapter.themeColorVar})`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky relative mb-5 overflow-hidden rounded-3xl border-2 p-4 sm:p-5"
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, color-mix(in oklab, ${color} 18%, var(--card)), var(--card))`,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-card px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          ⭐ Missão do dia
        </span>
        <Sparkles className={cn("h-4 w-4 transition-transform", pulse && "scale-110")} style={{ color }} />
      </div>
      <h3 className="font-display text-2xl leading-tight sm:text-3xl">{mission.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{chapter.title} · {chapter.subtitle}</p>

      <Link
        to="/licao/$subjectId/$lessonId"
        params={{ subjectId: mission.subjectId, lessonId: mission.lessonId }}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 font-display text-base font-bold text-white shadow-md transition-transform active:scale-95"
        style={{ backgroundColor: color, boxShadow: `0 5px 0 0 color-mix(in oklab, ${color} 60%, black)` }}
      >
        {mission.emoji} Começar agora <ChevronRight className="h-4 w-4" />
      </Link>
    </motion.section>
  );
}
