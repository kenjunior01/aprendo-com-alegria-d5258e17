import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { MascotBubble, getRandomEncouragement } from "@/components/MascotBubble";
import { ChunkyButton } from "@/components/ChunkyButton";
import { getChapter, chapterProgress } from "@/lib/chapters";
import { loadProfile, type Profile } from "@/lib/storage";
import { ArrowLeft, Check, Lock, Play, Star, CheckCircle2, Zap, Trophy, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/capitulo/$chapterId")({
  head: ({ params }) => {
    const chapter = getChapter(params.chapterId);
    const chapterTitle = chapter?.title ?? "Capítulo";
    const subtitle = chapter?.subtitle ?? "Missões interativas para crianças do 1.º ciclo";
    const title = `Capítulo: ${chapterTitle} — Aventura | Alegria`;
    const description = `Capítulo "${chapterTitle}" no Alegria: ${subtitle}. Missões curtas, voz e recompensas para aprender a brincar.`;
    const url = `https://alegria.online/capitulo/${params.chapterId}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ChapterPage,
});

// ─── Winding path positions for the chapter detail page ───
const NODE_POSITIONS = [
  { x: 0.22, label: "left" },
  { x: 0.78, label: "right" },
  { x: 0.15, label: "left-far" },
  { x: 0.85, label: "right-far" },
  { x: 0.30, label: "left-inner" },
  { x: 0.70, label: "right-inner" },
] as const;

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
  const color = `var(${chapter.themeColorVar})`;

  return (
    <div className="min-h-[100dvh] bg-alegria-app pb-24 md:pb-12">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
        <Link to="/app" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Aventura
        </Link>

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium relative overflow-hidden rounded-3xl"
        >
          {/* Gradient background */}
          <div
            className={cn("absolute inset-0 bg-gradient-to-br opacity-90", chapter.bgGradient)}
          />
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: color }}
          />

          <div className="relative p-5 sm:p-7">
            <div className="absolute -right-4 -top-4 text-7xl opacity-20 sm:text-9xl">{chapter.emoji}</div>
            <p className="font-display text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Capítulo {chapter.number} · {chapter.subtitle}
            </p>
            <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
              {chapter.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/85 sm:text-base">
              {chapter.story}
            </p>

            {/* Progress bar with glow */}
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-3 max-w-[180px] flex-1 overflow-hidden rounded-full bg-foreground/10">
                <motion.div
                  className="h-full rounded-full progress-glow"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.pct * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <span className="font-display text-sm font-semibold tabular-nums">
                {progress.done}/{progress.total}
              </span>
            </div>
          </div>
        </motion.section>

        {/* ── Mascot encouragement ── */}
        <div className="mt-4">
          <MascotBubble
            id={profile.mascot}
            message={getRandomEncouragement(profile.mascot)}
            position="left"
            size="sm"
            autoHideMs={8000}
          />
        </div>

        {/* ── Mission path — winding Duolingo-style ── */}
        <section className="mt-6">
          <h2 className="mb-4 font-display text-lg sm:text-xl">As tuas missões</h2>

          <div className="relative mx-auto max-w-sm">
            {/* Background path line */}
            <div
              className="absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: `color-mix(in oklab, ${color} 6%, var(--muted))` }}
            />

            {chapter.missions.map((mission, i) => {
              const done = profile.completedLessons.includes(mission.lessonId);
              const prev = i === 0 ? null : chapter.missions[i - 1];
              const prevDone = !prev || profile.completedLessons.includes(prev.lessonId);
              const locked = !prevDone && !done;
              const isActive = !done && !locked;
              const pos = NODE_POSITIONS[i % NODE_POSITIONS.length];

              return (
                <React.Fragment key={mission.lessonId}>
                  {/* Curved connector */}
                  {i > 0 && (
                    <CurvedConnector
                      fromX={NODE_POSITIONS[(i - 1) % NODE_POSITIONS.length].x}
                      toX={pos.x}
                      color={color}
                      isDone={done}
                      isActive={isActive}
                      index={i}
                    />
                  )}

                  {/* Mission node */}
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.1 + i * 0.12,
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
                      <Link
                        to="/licao/$subjectId/$lessonId"
                        params={{ subjectId: mission.subjectId, lessonId: mission.lessonId }}
                        disabled={locked}
                        onClick={(e) => { if (locked) e.preventDefault(); else haptic(isActive ? "celebrate" : "tap"); }}
                        className="group focus-ring rounded-2xl"
                        aria-label={locked ? `${mission.title} (bloqueado)` : `Iniciar: ${mission.title}`}
                      >
                        <motion.div
                          whileHover={!locked ? { scale: 1.05, y: -2 } : undefined}
                          whileTap={!locked ? { scale: 0.92 } : undefined}
                          className={cn(
                            "relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                            done && "border-2 border-success/20 bg-success/5",
                            isActive && "border-2 border-transparent bg-card shadow-elegant",
                            locked && "border-2 border-border/50 bg-muted/30 opacity-60",
                          )}
                          style={
                            isActive
                              ? { boxShadow: `0 4px 24px -4px color-mix(in oklab, ${color} 20%, transparent)` }
                              : undefined
                          }
                        >
                          {/* Node circle */}
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.15 + i * 0.05 }}
                            className={cn(
                              "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all",
                              done && "bg-success/15 ring-2 ring-success/20",
                              isActive && "shadow-lg",
                              locked && "bg-muted/50",
                            )}
                            style={
                              isActive
                                ? {
                                    backgroundColor: `color-mix(in oklab, ${color} 15%, var(--card))`,
                                    boxShadow: `0 0 0 3px color-mix(in oklab, ${color} 10%, var(--card)), 0 4px 12px -2px color-mix(in oklab, ${color} 20%, transparent)`,
                                  }
                                : undefined
                            }
                          >
                            {/* Active glow ring */}
                            {isActive && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl"
                                style={{ border: `2px solid ${color}` }}
                                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              />
                            )}
                            {done ? (
                              <Check className="h-7 w-7 text-success" strokeWidth={3} />
                            ) : locked ? (
                              <Lock className="h-6 w-6 text-muted-foreground/50" />
                            ) : (
                              <span className="text-2xl">{mission.emoji}</span>
                            )}
                          </motion.div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "font-display text-sm font-bold leading-tight",
                              locked && "text-muted-foreground/70",
                            )}>
                              {mission.title}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              {done && (
                                <span className="flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                                  <CheckCircle2 className="h-3 w-3" /> Completo
                                </span>
                              )}
                              {isActive && (
                                <span className="flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                                  <Play className="h-2.5 w-2.5 fill-current" /> AGORA
                                </span>
                              )}
                              {locked && (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
                                  <Lock className="h-2.5 w-2.5" /> Bloqueado
                                </span>
                              )}
                            </div>
                          </div>

                          {/* XP */}
                          {!locked && (
                            <div className={cn("flex flex-col items-center gap-0.5", done && "opacity-50")}>
                              <Zap className={cn("h-3.5 w-3.5", done ? "text-muted-foreground" : "text-xp")} />
                              <span className={cn("font-display text-[10px] font-bold", done ? "text-muted-foreground" : "text-xp")}>+10</span>
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}

            {/* End reward / completion */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + chapter.missions.length * 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className="relative flex justify-center py-5"
            >
              {progress.pct === 1 ? (
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-xp/30 bg-gradient-to-br from-xp/20 via-xp/10 to-transparent shadow-glow">
                    <Trophy className="h-8 w-8 text-xp" />
                  </div>
                  <div className="rounded-2xl bg-success/15 px-4 py-3 text-center">
                    <p className="font-display text-success">Capítulo completo!</p>
                    <p className="text-xs text-muted-foreground">Continuas a aventura no próximo capítulo.</p>
                    <Link to="/app" className="mt-2 inline-block">
                      <ChunkyButton tone="success">Próximo capítulo →</ChunkyButton>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-border bg-muted/50">
                  <Crown className="h-7 w-7 text-muted-foreground/50" />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mascot id={profile.mascot} size="sm" equippedItemId={profile.equippedItem} />
          <p className="italic">"{chapter.story.split(".")[0]}."</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// ─── Curved SVG Connector ───
function CurvedConnector({
  fromX,
  toX,
  color,
  isDone,
  isActive,
  index,
}: {
  fromX: number;
  toX: number;
  color: string;
  isDone: boolean;
  isActive: boolean;
  index: number;
}) {
  const svgWidth = 300;
  const fromPx = fromX * svgWidth;
  const toPx = toX * svgWidth;
  const controlOffset = Math.abs(toPx - fromPx) * 0.6;

  const pathD = `M ${fromPx} 0 C ${fromPx + (toPx > fromPx ? controlOffset : -controlOffset)} 35, ${toPx + (toPx > fromPx ? -controlOffset : controlOffset)} 65, ${toPx} 100`;

  return (
    <div className="relative h-12 w-full overflow-hidden" aria-hidden="true">
      <svg viewBox={`0 0 ${svgWidth} 100`} className="h-full w-full" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke={`color-mix(in oklab, ${color} 8%, var(--muted))`} strokeWidth="3" strokeLinecap="round" />
        {(isDone || isActive) && (
          <motion.path
            d={pathD}
            fill="none"
            stroke={isDone ? "var(--success)" : color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={400}
            animate={{ strokeDashoffset: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.6, ease: "easeOut" }}
            opacity={isDone ? 0.6 : 0.8}
          />
        )}
      </svg>
    </div>
  );
}
