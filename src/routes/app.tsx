import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { CHAPTERS, type Chapter, type Mission } from "@/lib/chapters";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { AdaptiveTip } from "@/components/AdaptiveTip";
import { MissionOfTheDay } from "@/components/MissionOfTheDay";
import { Lock, Star, CheckCircle2, Crown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "A minha aventura — Kidoz" },
      { name: "description", content: "Caminho de aprendizagem visual: Português, Matemática e Estudo do Meio." },
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

  const visibleChapters = CHAPTERS.filter((c) => c.grade <= Math.min(4, profile.grade + 1));

  return (
    <div className="min-h-[100dvh] bg-background pb-28 md:pb-12">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
        {/* Hero greeting */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative mb-5 overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-card to-accent/30 p-4 sm:p-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Mascot id={profile.mascot} size="md" bouncing equippedItemId={profile.equippedItem} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl sm:text-2xl">Olá, {profile.name}! ☀️</p>
              <p className="text-sm text-muted-foreground">
                {profile.streak > 0
                  ? `🔥 ${profile.streak} ${profile.streak === 1 ? "dia seguido" : "dias seguidos"}!`
                  : mascot.encourage}
              </p>
            </div>
          </div>
        </motion.section>

        <MissionOfTheDay completedLessons={profile.completedLessons} grade={profile.grade} />

        <AdaptiveTip />

        {/* Quick links */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          <QuickLink to="/mundo" emoji="🏠" title="Meu Mundo" subtitle="Decorar" tone="primary" />
          <QuickLink to="/leitura" emoji="🎤" title="Ler" subtitle="Em voz alta" tone="primary" />
          <QuickLink to="/jardim" emoji="🌱" title="Jardim" subtitle="Que cresce" tone="success" />
        </div>

        {/* Chapter paths — Duolingo-style winding journey */}
        <div className="space-y-8">
          {visibleChapters.map((chapter) => (
            <ChapterPath key={chapter.id} chapter={chapter} completedLessons={profile.completedLessons} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          ✨ Mais aventuras vão chegando à medida que avanças
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

function QuickLink({ to, emoji, title, subtitle, tone }: { to: "/leitura" | "/jardim" | "/mundo"; emoji: string; title: string; subtitle: string; tone: "primary" | "success" }) {
  const ring = tone === "primary" ? "from-primary/20" : "from-success/20";
  return (
    <Link
      to={to}
      className={cn(
        "card-chunky group flex min-h-[88px] items-center gap-3 rounded-3xl border-2 border-border bg-gradient-to-br to-card p-3 transition-transform active:scale-[0.97]",
        ring,
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <div className="min-w-0">
        <p className="truncate font-display text-base leading-tight">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}

function ChapterPath({ chapter, completedLessons }: { chapter: Chapter; completedLessons: string[] }) {
  const completed = useMemo(() => new Set(completedLessons), [completedLessons]);
  const missions = chapter.missions;
  const doneCount = missions.filter((m) => completed.has(m.lessonId)).length;
  // First mission whose previous chain is complete is the active one.
  const firstUnfinishedIdx = missions.findIndex((m) => !completed.has(m.lessonId));
  const activeIdx = firstUnfinishedIdx === -1 ? missions.length : firstUnfinishedIdx;

  return (
    <section aria-label={chapter.title}>
      {/* Chapter banner */}
      <div
        className="card-chunky mb-4 overflow-hidden rounded-3xl border-2 border-border p-4 sm:p-5"
        style={{ backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 14%, var(--card))` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm"
            style={{ backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 28%, var(--card))` }}
          >
            {chapter.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Capítulo {chapter.number}
            </p>
            <h3 className="font-display text-xl leading-tight" style={{ color: `var(${chapter.themeColorVar})` }}>
              {chapter.title}
            </h3>
            <p className="text-xs text-muted-foreground">{chapter.subtitle}</p>
          </div>
          <span className="rounded-full bg-card px-2.5 py-1 font-display text-xs font-bold">
            {doneCount}/{missions.length}
          </span>
        </div>
      </div>

      {/* Path of nodes */}
      <ol className="relative mx-auto max-w-sm">
        {missions.map((mission, idx) => {
          const isDone = completed.has(mission.lessonId);
          const isActive = idx === activeIdx;
          const isLocked = idx > activeIdx;
          // Winding: alternate left / center / right
          const offset = ["-translate-x-12", "translate-x-0", "translate-x-12", "translate-x-0"][idx % 4];
          return (
            <li key={mission.lessonId} className="relative flex justify-center py-3">
              <div className={cn("transition-transform", offset)}>
                <PathNode
                  mission={mission}
                  chapter={chapter}
                  state={isDone ? "done" : isActive ? "active" : isLocked ? "locked" : "available"}
                />
              </div>
            </li>
          );
        })}

        {/* End trophy */}
        <li className="relative flex justify-center pt-2">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-border",
              doneCount === missions.length ? "bg-xp/30" : "bg-muted",
            )}
            aria-label={doneCount === missions.length ? "Capítulo completo" : "Troféu por desbloquear"}
          >
            <Crown className={cn("h-7 w-7", doneCount === missions.length ? "text-xp" : "text-muted-foreground")} />
          </div>
        </li>
      </ol>
    </section>
  );
}

function PathNode({
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
        "relative flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border-[3px] text-3xl select-none",
        state === "done" && "border-success bg-success/15 text-success-foreground",
        state === "active" && "border-card text-card animate-bounce-soft",
        state === "available" && "border-border bg-card",
        state === "locked" && "border-border bg-muted text-muted-foreground opacity-70",
      )}
      style={
        state === "active"
          ? { backgroundColor: color, boxShadow: `0 6px 0 0 color-mix(in oklab, ${color} 60%, black)` }
          : state === "available"
            ? { boxShadow: `0 5px 0 0 color-mix(in oklab, ${color} 25%, var(--border))` }
            : undefined
      }
    >
      <span aria-hidden>{mission.emoji}</span>
      {state === "done" && (
        <CheckCircle2 className="absolute -right-1 -top-1 h-7 w-7 rounded-full bg-card text-success" />
      )}
      {state === "active" && (
        <span className="absolute -bottom-2 rounded-full border-2 border-card bg-foreground px-2 py-0.5 text-[10px] font-display font-bold text-background">
          <Play className="inline h-3 w-3" /> AGORA
        </span>
      )}
      {state === "locked" && (
        <Lock className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-card p-1 text-muted-foreground" />
      )}
      {state === "available" && (
        <Star className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-card p-1 text-xp" />
      )}
    </motion.div>
  );

  if (state === "locked") {
    return (
      <div className="flex flex-col items-center gap-1.5" aria-label={`${mission.title} (bloqueado)`}>
        {node}
        <p className="max-w-[120px] text-center font-display text-[11px] text-muted-foreground line-clamp-2">
          {mission.title}
        </p>
      </div>
    );
  }

  return (
    <Link
      to="/licao/$subjectId/$lessonId"
      params={{ subjectId: mission.subjectId, lessonId: mission.lessonId }}
      className="flex flex-col items-center gap-1.5"
      aria-label={`Iniciar missão: ${mission.title}`}
    >
      {node}
      <p className="max-w-[140px] text-center font-display text-xs leading-tight line-clamp-2">
        {mission.title}
      </p>
    </Link>
  );
}
