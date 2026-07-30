// LearningPath — Caminho de aprendizagem premium estilo Duolingo
// Winding path com curvas SVG, nós animados, decorações e conectores visuais
import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Lock, Star, CheckCircle2, Crown, Play, Sparkles,
  ChevronRight, Zap, Trophy, BookOpen, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { CHAPTERS, type Chapter, type Mission } from "@/lib/chapters";

// ─── Types ───
interface LearningPathProps {
  completedLessons: string[];
  grade: number;
  className?: string;
}

type NodeState = "done" | "active" | "available" | "locked";

// ─── Winding path position config ───
// Each node alternates left/right in a winding pattern
const PATH_POSITIONS = [
  { x: 0.22, label: "left" },
  { x: 0.78, label: "right" },
  { x: 0.18, label: "left-far" },
  { x: 0.72, label: "right-inner" },
  { x: 0.30, label: "left-inner" },
  { x: 0.82, label: "right-far" },
] as const;

// ─── Decorative elements that appear along the path ───
const PATH_DECORATIONS = [
  { emoji: "⭐", size: 14, opacity: 0.3 },
  { emoji: "🌸", size: 16, opacity: 0.25 },
  { emoji: "✨", size: 12, opacity: 0.35 },
  { emoji: "🦋", size: 15, opacity: 0.2 },
  { emoji: "🌿", size: 13, opacity: 0.3 },
  { emoji: "💫", size: 11, opacity: 0.25 },
  { emoji: "🍀", size: 14, opacity: 0.2 },
  { emoji: "🌈", size: 12, opacity: 0.15 },
];

// ─── Main Component ───
export function LearningPath({ completedLessons, grade, className }: LearningPathProps) {
  const completed = useMemo(() => new Set(completedLessons), [completedLessons]);
  const visibleChapters = CHAPTERS.filter((c) => c.grade <= Math.min(4, grade + 1));

  return (
    <div className={cn("relative", className)}>
      {visibleChapters.map((chapter, chapterIdx) => (
        <PathChapter
          key={chapter.id}
          chapter={chapter}
          chapterIdx={chapterIdx}
          completed={completed}
          isLast={chapterIdx === visibleChapters.length - 1}
        />
      ))}
    </div>
  );
}

// ─── Path Chapter — a chapter with its winding path of nodes ───
function PathChapter({
  chapter,
  chapterIdx,
  completed,
  isLast,
}: {
  chapter: Chapter;
  chapterIdx: number;
  completed: Set<string>;
  isLast: boolean;
}) {
  const missions = chapter.missions;
  const doneCount = missions.filter((m) => completed.has(m.lessonId)).length;
  const firstUnfinishedIdx = missions.findIndex((m) => !completed.has(m.lessonId));
  const activeIdx = firstUnfinishedIdx === -1 ? missions.length : firstUnfinishedIdx;
  const isComplete = doneCount === missions.length;
  const color = `var(${chapter.themeColorVar})`;

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : undefined}
      transition={{ duration: 0.6 }}
      aria-label={chapter.title}
      className="relative"
    >
      {/* ── Chapter Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="card-premium relative mb-6 overflow-hidden rounded-3xl"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 8%, var(--card))` }}
      >
        {/* Decorative gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse at 80% 20%, color-mix(in oklab, ${color} 15%, transparent), transparent 60%)`,
          }}
        />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-center gap-3">
            {/* Chapter emoji icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={isInView ? { scale: 1, rotate: 0 } : undefined}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 15 }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm"
              style={{ backgroundColor: `color-mix(in oklab, ${color} 20%, var(--card))` }}
            >
              {chapter.emoji}
            </motion.div>

            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Capítulo {chapter.number}
              </p>
              <h3 className="font-display text-xl leading-tight" style={{ color }}>
                {chapter.title}
              </h3>
              <p className="text-xs text-muted-foreground">{chapter.subtitle}</p>
            </div>

            {/* Completion badge */}
            {isComplete && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15"
              >
                <CheckCircle2 className="h-5 w-5 text-success" />
              </motion.div>
            )}
          </div>

          {/* Story text */}
          <p className="mt-2 text-xs text-muted-foreground italic">{chapter.story}</p>

          {/* Progress bar — premium with glow */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-0.5" aria-label={`${doneCount} de ${missions.length} estrelas`}>
              {missions.map((m, i) => (
                <motion.div
                  key={m.lessonId}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : undefined}
                  transition={{ delay: 0.3 + i * 0.05, type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-all",
                      i < doneCount ? "fill-current text-xp scale-110" : "text-muted-foreground/30",
                    )}
                  />
                </motion.div>
              ))}
            </div>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${(doneCount / missions.length) * 100}%` } : undefined}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className={cn("h-full rounded-full progress-glow", isComplete && "bg-success")}
                style={!isComplete ? { backgroundColor: color } : undefined}
              />
            </div>
            <span className="font-display text-xs font-bold tabular-nums">{doneCount}/{missions.length}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Winding Path ── */}
      <div className="relative mx-auto max-w-md">
        {/* SVG connecting path */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* The path will be drawn by the SVGPathRenderer below */}
        </svg>

        {/* Path background line */}
        <div
          className="absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: `color-mix(in oklab, ${color} 6%, var(--muted))` }}
        />

        {/* Mission nodes */}
        {missions.map((mission, idx) => {
          const isDone = completed.has(mission.lessonId);
          const isActive = idx === activeIdx;
          const isLocked = idx > activeIdx;
          const state: NodeState = isDone ? "done" : isActive ? "active" : isLocked ? "locked" : "available";
          const pos = PATH_POSITIONS[idx % PATH_POSITIONS.length];

          // Decorative element between nodes
          const deco = PATH_DECORATIONS[idx % PATH_DECORATIONS.length];

          return (
            <React.Fragment key={mission.lessonId}>
              {/* Decorative element */}
              {idx > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: deco.opacity, scale: 1 } : undefined}
                  transition={{ delay: 0.3 + idx * 0.08, type: "spring", stiffness: 200, damping: 15 }}
                  className="flex justify-center py-1"
                  style={{ fontSize: deco.size }}
                  aria-hidden="true"
                >
                  {deco.emoji}
                </motion.div>
              )}

              {/* Connecting curve segment */}
              <CurvedConnector
                fromX={idx === 0 ? 0.5 : PATH_POSITIONS[(idx - 1) % PATH_POSITIONS.length].x}
                toX={pos.x}
                color={color}
                isDone={isDone}
                isActive={isActive}
                index={idx}
                isInView={isInView}
              />

              {/* Node */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
                transition={{
                  delay: 0.2 + idx * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="relative flex py-2"
                style={{ justifyContent: pos.x < 0.5 ? "flex-start" : pos.x > 0.5 ? "flex-end" : "center" }}
              >
                <div
                  style={{
                    marginLeft: pos.x < 0.5 ? `${pos.x * 100}%` : undefined,
                    marginRight: pos.x > 0.5 ? `${(1 - pos.x) * 100}%` : undefined,
                  }}
                >
                  <PathNode
                    mission={mission}
                    chapter={chapter}
                    state={state}
                    color={color}
                  />
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}

        {/* Chapter trophy / completion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 0.3 + missions.length * 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="relative flex justify-center py-5"
        >
          <motion.div
            animate={isComplete ? { scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] } : undefined}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className={cn(
              "relative flex h-20 w-20 flex-col items-center justify-center rounded-3xl border-2",
              isComplete
                ? "border-xp/30 bg-gradient-to-br from-xp/20 via-xp/10 to-transparent shadow-glow"
                : "border-border bg-muted/50",
            )}
          >
            {isComplete ? (
              <>
                <Trophy className="h-8 w-8 text-xp" />
                <span className="mt-0.5 font-display text-[9px] font-bold text-xp">COMPLETO!</span>
              </>
            ) : (
              <>
                <Crown className="h-7 w-7 text-muted-foreground/50" />
                <span className="mt-0.5 font-display text-[8px] text-muted-foreground/50">?</span>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Chapter connector to next chapter */}
      {!isLast && (
        <div className="flex justify-center py-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : undefined}
            transition={{ delay: 0.5 + missions.length * 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="h-8 w-0.5 rounded-full bg-border" />
            <Sparkles className="h-4 w-4 text-muted-foreground/40" />
            <div className="h-8 w-0.5 rounded-full bg-border" />
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

// ─── Curved SVG Connector between nodes ───
function CurvedConnector({
  fromX,
  toX,
  color,
  isDone,
  isActive,
  index,
  isInView,
}: {
  fromX: number;
  toX: number;
  color: string;
  isDone: boolean;
  isActive: boolean;
  index: number;
  isInView: boolean;
}) {
  // Generate a smooth S-curve path between two x positions
  const svgWidth = 300;
  const fromPx = fromX * svgWidth;
  const toPx = toX * svgWidth;
  const midX = (fromPx + toPx) / 2;
  const controlOffset = Math.abs(toPx - fromPx) * 0.6;

  // SVG path: S-curve from (fromPx, 0) to (toPx, 100)
  const pathD = `M ${fromPx} 0 C ${fromPx + (toPx > fromPx ? controlOffset : -controlOffset)} 35, ${toPx + (toPx > fromPx ? -controlOffset : controlOffset)} 65, ${toPx} 100`;

  return (
    <div className="relative h-12 w-full overflow-hidden" aria-hidden="true">
      <svg
        viewBox={`0 0 ${svgWidth} 100`}
        className="h-full w-full"
        preserveAspectRatio="none"
      >
        {/* Background path */}
        <path
          d={pathD}
          fill="none"
          stroke={`color-mix(in oklab, ${color} 8%, var(--muted))`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Active/done path */}
        {(isDone || isActive) && (
          <motion.path
            d={pathD}
            fill="none"
            stroke={isDone ? "var(--success)" : color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={400}
            animate={isInView ? { strokeDashoffset: 0 } : undefined}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: "easeOut" }}
            opacity={isDone ? 0.6 : 0.8}
          />
        )}
      </svg>
    </div>
  );
}

// ─── Path Node — individual mission node ───
function PathNode({
  mission,
  chapter,
  state,
  color,
}: {
  mission: Mission;
  chapter: Chapter;
  state: NodeState;
  color: string;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-40px" });

  const node = (
    <motion.div
      ref={nodeRef}
      whileTap={state !== "locked" ? { scale: 0.9 } : undefined}
      whileHover={state !== "locked" ? { scale: 1.05, y: -2 } : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
        state === "done" && "border-2 border-success/20 bg-success/5",
        state === "active" && "border-2 border-transparent bg-card shadow-elegant",
        state === "available" && "border-2 border-border bg-card hover:border-primary/20",
        state === "locked" && "border-2 border-border/50 bg-muted/30 opacity-60",
      )}
      style={
        state === "active"
          ? {
              boxShadow: `0 4px 24px -4px color-mix(in oklab, ${color} 20%, transparent), 0 0 0 1px color-mix(in oklab, ${color} 10%, var(--card))`,
            }
          : undefined
      }
    >
      {/* Node circle — the main visual element */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={isInView ? { scale: 1, rotate: 0 } : undefined}
        transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
        className={cn(
          "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all",
          state === "done" && "bg-success/15 ring-2 ring-success/20",
          state === "active" && "shadow-lg",
          state === "available" && "bg-muted",
          state === "locked" && "bg-muted/50",
        )}
        style={
          state === "active"
            ? {
                backgroundColor: `color-mix(in oklab, ${color} 15%, var(--card))`,
                boxShadow: `0 0 0 3px color-mix(in oklab, ${color} 10%, var(--card)), 0 4px 12px -2px color-mix(in oklab, ${color} 20%, transparent)`,
              }
            : undefined
        }
      >
        {/* Active glow ring animation */}
        {state === "active" && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `2px solid ${color}` }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {state === "done" ? (
          <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2.5} />
        ) : state === "locked" ? (
          <Lock className="h-6 w-6 text-muted-foreground/50" />
        ) : (
          <span className="text-2xl">{mission.emoji}</span>
        )}
      </motion.div>

      {/* Node info */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "font-display text-sm font-bold leading-tight",
          state === "locked" && "text-muted-foreground/70",
          state === "active" && "text-foreground",
        )}>
          {mission.title}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {state === "done" && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success"
            >
              <CheckCircle2 className="h-3 w-3" /> Completo
            </motion.span>
          )}
          {state === "active" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              <Play className="h-2.5 w-2.5 fill-current" /> AGORA
            </motion.span>
          )}
          {state === "available" && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star className="h-3 w-3" /> Disponível
            </span>
          )}
          {state === "locked" && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
              <Lock className="h-2.5 w-2.5" /> Bloqueado
            </span>
          )}
        </div>
      </div>

      {/* XP reward indicator */}
      {state !== "locked" && (
        <div className={cn(
          "flex flex-col items-center gap-0.5",
          state === "done" && "opacity-50",
        )}>
          <Zap className={cn("h-3.5 w-3.5", state === "done" ? "text-muted-foreground" : "text-xp")} />
          <span className={cn("font-display text-[10px] font-bold", state === "done" ? "text-muted-foreground" : "text-xp")}>
            +10
          </span>
        </div>
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
      className="flex flex-col items-center gap-1.5 focus-ring rounded-2xl"
      aria-label={`Iniciar missão: ${mission.title}`}
    >
      {node}
    </Link>
  );
}
