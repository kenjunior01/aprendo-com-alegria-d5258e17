// LearningTree — Árvore de aprendizagem visual estilo Duolingo
// Mostra o caminho de aprendizagem como uma árvore orgânica com ramos
// Cada ramo é um capítulo, cada nó é uma missão
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Lock, Star, CheckCircle2, Crown, Play, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { CHAPTERS, type Chapter, type Mission } from "@/lib/chapters";

interface LearningTreeProps {
  completedLessons: string[];
  grade: number;
  className?: string;
}

export function LearningTree({ completedLessons, grade, className }: LearningTreeProps) {
  const completed = useMemo(() => new Set(completedLessons), [completedLessons]);
  const visibleChapters = CHAPTERS.filter((c) => c.grade <= Math.min(4, grade + 1));

  return (
    <div className={cn("space-y-6", className)}>
      {visibleChapters.map((chapter, chapterIdx) => (
        <TreeBranch
          key={chapter.id}
          chapter={chapter}
          chapterIdx={chapterIdx}
          completed={completed}
        />
      ))}
    </div>
  );
}

// ─── Tree Branch — um capítulo com os seus nós ───
function TreeBranch({
  chapter,
  chapterIdx,
  completed,
}: {
  chapter: Chapter;
  chapterIdx: number;
  completed: Set<string>;
}) {
  const missions = chapter.missions;
  const doneCount = missions.filter((m) => completed.has(m.lessonId)).length;
  const firstUnfinishedIdx = missions.findIndex((m) => !completed.has(m.lessonId));
  const activeIdx = firstUnfinishedIdx === -1 ? missions.length : firstUnfinishedIdx;
  const isComplete = doneCount === missions.length;
  const color = `var(${chapter.themeColorVar})`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: chapterIdx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      aria-label={chapter.title}
    >
      {/* Chapter header — premium card */}
      <div
        className="card-premium mb-4 overflow-hidden rounded-3xl p-4 sm:p-5"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 8%, var(--card))` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm"
            style={{ backgroundColor: `color-mix(in oklab, ${color} 20%, var(--card))` }}
          >
            {chapter.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Capítulo {chapter.number}
            </p>
            <h3 className="font-display text-xl leading-tight" style={{ color }}>
              {chapter.title}
            </h3>
            <p className="text-xs text-muted-foreground">{chapter.subtitle}</p>
          </div>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15"
            >
              <CheckCircle2 className="h-5 w-5 text-success" />
            </motion.div>
          )}
        </div>

        {/* Story */}
        <p className="mt-2 text-xs text-muted-foreground italic">{chapter.story}</p>

        {/* Progress bar with glow */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-0.5" aria-label={`${doneCount} de ${missions.length} estrelas`}>
            {missions.map((m, i) => (
              <Star
                key={m.lessonId}
                className={cn("h-4 w-4 transition-all", i < doneCount ? "fill-current text-xp scale-110" : "text-muted-foreground/30")}
              />
            ))}
          </div>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(doneCount / missions.length) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className={cn("h-full rounded-full progress-glow", isComplete && "bg-success")}
              style={!isComplete ? { backgroundColor: color } : undefined}
            />
          </div>
          <span className="font-display text-xs font-bold tabular-nums">{doneCount}/{missions.length}</span>
        </div>
      </div>

      {/* Tree path — winding nodes with connecting lines */}
      <div className="relative mx-auto max-w-sm">
        {/* Vertical connecting line */}
        <div
          className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-muted/50"
          style={{ backgroundColor: `color-mix(in oklab, ${color} 8%, var(--muted))` }}
        />

        {missions.map((mission, idx) => {
          const isDone = completed.has(mission.lessonId);
          const isActive = idx === activeIdx;
          const isLocked = idx > activeIdx;
          // Winding path: alternate positions
          const positions = [
            "ml-[10%] sm:ml-[15%]",
            "ml-auto mr-[10%] sm:mr-[15%]",
            "ml-[5%] sm:ml-[10%]",
            "ml-auto mr-[15%] sm:mr-[20%]",
          ];
          const posClass = positions[idx % 4];

          return (
            <motion.div
              key={mission.lessonId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: chapterIdx * 0.1 + idx * 0.06 }}
              className={cn("relative py-3", posClass)}
              style={{ width: "min(80%, 18rem)" }}
            >
              <TreeNode
                mission={mission}
                chapter={chapter}
                state={isDone ? "done" : isActive ? "active" : isLocked ? "locked" : "available"}
              />
            </motion.div>
          );
        })}

        {/* Chapter trophy */}
        <div className="relative flex justify-center py-4">
          <motion.div
            animate={isComplete ? { scale: [1, 1.1, 1] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-border",
              isComplete ? "bg-xp/20 shadow-glow" : "bg-muted",
            )}
          >
            <Crown className={cn("h-7 w-7", isComplete ? "text-xp" : "text-muted-foreground")} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Tree Node — um nó individual na árvore ───
function TreeNode({
  mission,
  chapter,
  state,
}: {
  mission: Mission;
  chapter: Chapter;
  state: "done" | "active" | "available" | "locked";
}) {
  const color = `var(${chapter.themeColorVar})`;

  const node = (
    <motion.div
      whileTap={state !== "locked" ? { scale: 0.92 } : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all",
        state === "done" && "border-success/30 bg-success/5",
        state === "active" && "border-transparent bg-card shadow-glow",
        state === "available" && "border-border bg-card hover:border-primary/30 hover:shadow-sm",
        state === "locked" && "border-border bg-muted/50 opacity-60",
      )}
      style={
        state === "active"
          ? { boxShadow: `0 4px 20px -4px color-mix(in oklab, ${color} 25%, transparent)` }
          : undefined
      }
    >
      {/* Node circle */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all",
          state === "done" && "bg-success/15",
          state === "active" && "shadow-sm",
          state === "available" && "bg-muted",
          state === "locked" && "bg-muted",
        )}
        style={
          state === "active"
            ? { backgroundColor: `color-mix(in oklab, ${color} 15%, var(--card))` }
            : undefined
        }
      >
        {mission.emoji}
      </div>

      {/* Node info */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "font-display text-sm font-bold leading-tight",
          state === "locked" && "text-muted-foreground",
        )}>
          {mission.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          {state === "done" && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-success">
              <CheckCircle2 className="h-3 w-3" /> Completo
            </span>
          )}
          {state === "active" && (
            <span className="flex items-center gap-0.5 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
              <Play className="h-2.5 w-2.5" /> AGORA
            </span>
          )}
          {state === "available" && (
            <span className="text-[10px] text-muted-foreground">Disponível</span>
          )}
          {state === "locked" && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> Bloqueado
            </span>
          )}
        </div>
      </div>

      {/* XP indicator */}
      {state !== "locked" && (
        <span className="text-[10px] font-bold text-xp">+10 XP</span>
      )}
    </motion.div>
  );

  if (state === "locked") {
    return (
      <div className="flex flex-col items-center gap-1.5" aria-label={`${mission.title} (bloqueado)`}>
        {node}
      </div>
    );
  }

  return (
    <Link
      to="/licao/$subjectId/$lessonId"
      params={{ subjectId: mission.subjectId, lessonId: mission.lessonId }}
      onClick={() => haptic(state === "active" ? "celebrate" : "tap")}
      className="flex flex-col items-center gap-1.5"
      aria-label={`Iniciar missão: ${mission.title}`}
    >
      {node}
    </Link>
  );
}
