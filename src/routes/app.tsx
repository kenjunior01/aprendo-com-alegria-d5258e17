import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { DuolingoBar, StreakCelebration, HeartRefillNotification } from "@/components/DuolingoBar";
import { CHAPTERS, type Chapter, type Mission } from "@/lib/chapters";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { AdaptiveTip } from "@/components/AdaptiveTip";
import { MissionOfTheDay } from "@/components/MissionOfTheDay";
import { SeasonalBanner } from "@/components/SeasonalBanner";
import { DailyChallengeCard } from "@/components/DailyChallengeCard";
import { LeagueLeaderboard } from "@/components/LeagueLeaderboard";
import { Lock, Star, CheckCircle2, Crown, Play, Sparkles, ChevronRight, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "A minha aventura — Alegria" },
      { name: "description", content: "Caminho de aprendizagem visual: Português, Matemática e Estudo do Meio." },
      { property: "og:title", content: 'A minha aventura — Alegria' },
      { property: "og:description", content: 'Caminho de aprendizagem visual para Português, Matemática e Estudo do Meio do 1.º ciclo.' },
      { property: "og:url", content: "https://alegria.online/app" },
    ],
    links: [
      { rel: "canonical", href: "https://alegria.online/app" },
    ],
  }),
  component: AppHome,
});

// ─── Animation Variants ───
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
  },
};

function AppHome() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showHeartWarning, setShowHeartWarning] = useState(false);

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
      // Check streak milestones
      const milestones = [3, 7, 14, 30, 60, 100];
      if (milestones.includes(p.streak)) {
        setShowStreakCelebration(true);
      }
      // Show heart warning if low
      if (p.hearts <= 1) {
        setShowHeartWarning(true);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [navigate]);

  if (!profile) return null;
  const mascot = getMascot(profile.mascot);

  const visibleChapters = CHAPTERS.filter((c) => c.grade <= Math.min(4, profile.grade + 1));

  return (
    <div className="min-h-[100dvh] bg-alegria-app pb-28 md:pb-12">
      <TopBar profile={profile} />
      <DuolingoBar profile={profile} />

      <main className="mx-auto max-w-2xl px-4 py-4 sm:py-6 scrollbar-thin">
        <h1 className="sr-only">A minha aventura no Alegria — caminho de aprendizagem de {profile.name}</h1>

        {/* ── 1. Hero greeting — premium, branded, warm ── */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="card-premium relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/20 p-5 sm:p-6"
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-secondary/8 blur-2xl" />

          <div className="relative flex items-center gap-4 sm:gap-5">
            <motion.div variants={scaleIn} className="relative">
              <Mascot id={profile.mascot} size="md" bouncing equippedItemId={profile.equippedItem} />
              {/* Streak badge on mascot */}
              {profile.streak > 0 && (
                <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-streak px-2 py-0.5 shadow-lg">
                  <Flame className="h-3 w-3 text-white" />
                  <span className="font-display text-[10px] font-bold text-white">{profile.streak}</span>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="min-w-0 flex-1">
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-primary/70">
                {mascot.encourage}
              </p>
              <h2 className="mt-0.5 truncate font-display text-2xl font-bold sm:text-3xl">
                Olá, {profile.name}! ☀️
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.streak > 0
                  ? `${profile.streak} ${profile.streak === 1 ? "dia seguido" : "dias seguidos"} de aprendizagem!`
                  : "Vamos começar a tua aventura?"
                }
              </p>
            </motion.div>
          </div>

          {/* Quick stats row */}
          <motion.div
            variants={fadeUp}
            className="mt-4 flex items-center gap-2 overflow-x-auto rounded-2xl bg-muted/50 p-2 scrollbar-thin"
          >
            <MiniStat icon={<Zap className="h-3.5 w-3.5" />} label="XP" value={profile.xp} color="text-xp" />
            <div className="h-4 w-px bg-border" />
            <MiniStat icon={<Flame className="h-3.5 w-3.5" />} label="Streak" value={profile.streak} color="text-streak" />
            <div className="h-4 w-px bg-border" />
            <span className="flex items-center gap-1 whitespace-nowrap rounded-lg bg-xp/10 px-2 py-1 font-display text-xs font-bold text-xp">
              <Star className="h-3 w-3 fill-current" />
              {profile.completedLessons.length} lições
            </span>
          </motion.div>
        </motion.section>

        {/* ── 2. Ação principal: Desafio Diário + Missão do Dia ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 space-y-4"
        >
          <DailyChallengeCard profile={profile} />
          <MissionOfTheDay completedLessons={profile.completedLessons} grade={profile.grade} />
        </motion.div>

        {/* ── 3. Quick links — acções rápidas com design premium ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 grid grid-cols-4 gap-2 sm:gap-3"
        >
          <QuickLink to="/amigo" emoji="🐾" title="Mascote" subtitle="Brincar" colorVar="--primary" />
          <QuickLink to="/mundo" emoji="🏠" title="Meu Mundo" subtitle="Decorar" colorVar="--secondary" />
          <QuickLink to="/leitura" emoji="🎤" title="Ler" subtitle="Em voz alta" colorVar="--pt-portuguese" />
          <QuickLink to="/jardim" emoji="🌱" title="Jardim" subtitle="Que cresce" colorVar="--success" />
        </motion.div>

        {/* ── 4. Caminho de aprendizagem — o coração visual ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold">O Meu Caminho</h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-display font-semibold text-muted-foreground">
              {profile.completedLessons.length} completas
            </span>
          </div>
          <div className="space-y-8">
            {visibleChapters.map((chapter) => (
              <ChapterPath key={chapter.id} chapter={chapter} completedLessons={profile.completedLessons} />
            ))}
          </div>
        </motion.section>

        {/* ── 5. Elementos secundários ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-4"
        >
          <SeasonalBanner region={profile.region ?? null} />
          <AdaptiveTip />
          <LeagueLeaderboard profile={profile} />
        </motion.div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Mais aventuras vão chegando à medida que avanças
        </p>
      </main>

      <BottomNav />

      <AnimatePresence>
        {showStreakCelebration && profile && (
          <StreakCelebration streak={profile.streak} onDismiss={() => setShowStreakCelebration(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeartWarning && profile && (
          <HeartRefillNotification hearts={profile.hearts} onDismiss={() => setShowHeartWarning(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mini Stat ───
function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <span className={cn("flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 font-display text-xs font-bold", color)}>
      {icon}
      {value}
      <span className="text-[10px] font-normal text-muted-foreground">{label}</span>
    </span>
  );
}

// ─── Quick Link — premium redesign ───
function QuickLink({ to, emoji, title, subtitle, colorVar }: {
  to: "/leitura" | "/jardim" | "/mundo" | "/amigo";
  emoji: string;
  title: string;
  subtitle: string;
  colorVar: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-1.5 rounded-3xl border border-border bg-card p-3 text-center transition-all active:scale-95 hover:shadow-glow"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: `color-mix(in oklab, var(${colorVar}) 14%, var(--card))` }}
      >
        {emoji}
      </div>
      <p className="font-display text-xs font-bold leading-tight">{title}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
    </Link>
  );
}

// ─── Chapter Path — premium redesign ───
function ChapterPath({ chapter, completedLessons }: { chapter: Chapter; completedLessons: string[] }) {
  const completed = useMemo(() => new Set(completedLessons), [completedLessons]);
  const missions = chapter.missions;
  const doneCount = missions.filter((m) => completed.has(m.lessonId)).length;
  const firstUnfinishedIdx = missions.findIndex((m) => !completed.has(m.lessonId));
  const activeIdx = firstUnfinishedIdx === -1 ? missions.length : firstUnfinishedIdx;
  const isComplete = doneCount === missions.length;

  return (
    <section aria-label={chapter.title}>
      {/* Chapter banner — premium card */}
      <div
        className="card-premium mb-4 overflow-hidden rounded-3xl p-4 sm:p-5"
        style={{ backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 8%, var(--card))` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm"
            style={{ backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 20%, var(--card))` }}
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
          {isComplete && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          )}
        </div>

        {/* Progress bar — premium with glow */}
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
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={cn("h-full rounded-full progress-glow", isComplete && "bg-success")}
              style={!isComplete ? { backgroundColor: `var(${chapter.themeColorVar})` } : undefined}
            />
          </div>
          <span className="font-display text-xs font-bold tabular-nums">{doneCount}/{missions.length}</span>
        </div>
      </div>

      {/* Path of nodes — winding path */}
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

        {/* End trophy — premium glow */}
        <li className="relative flex justify-center pt-2">
          <motion.div
            animate={isComplete ? { scale: [1, 1.1, 1] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-border",
              isComplete ? "bg-xp/20 shadow-glow" : "bg-muted",
            )}
            aria-label={isComplete ? "Capítulo completo" : "Troféu por desbloquear"}
          >
            <Crown className={cn("h-7 w-7", isComplete ? "text-xp" : "text-muted-foreground")} />
          </motion.div>
        </li>
      </ol>
    </section>
  );
}

// ─── Path Node — premium redesign ───
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
        "relative flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border-[3px] text-3xl select-none transition-all",
        state === "done" && "border-success bg-success/15 text-success-foreground",
        state === "active" && "border-card text-card-foreground animate-glow-pulse",
        state === "available" && "border-border bg-card",
        state === "locked" && "border-border bg-muted text-muted-foreground opacity-70",
      )}
      style={
        state === "active"
          ? { backgroundColor: color, boxShadow: `0 6px 0 0 color-mix(in oklab, ${color} 60%, black), 0 0 20px 4px color-mix(in oklab, ${color} 25%, transparent)` }
          : state === "available"
            ? { boxShadow: `0 5px 0 0 color-mix(in oklab, ${color} 25%, var(--border))` }
            : undefined
      }
    >
      <span aria-hidden>{mission.emoji}</span>
      {state === "done" && (
        <CheckCircle2 className="absolute -right-1 -top-1 h-7 w-7 rounded-full bg-card text-success shadow-sm" />
      )}
      {state === "active" && (
        <span className="absolute -bottom-2 rounded-full border-2 border-card bg-foreground px-2.5 py-0.5 text-[10px] font-display font-bold text-background shadow-sm">
          <Play className="inline h-3 w-3" /> AGORA
        </span>
      )}
      {state === "locked" && (
        <Lock className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-card p-1 text-muted-foreground shadow-sm" />
      )}
      {state === "available" && (
        <Star className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-card p-1 text-xp shadow-sm" />
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
      onClick={() => haptic(state === "active" ? "celebrate" : "tap")}
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
