// LessonCompleteScreen — Premium celebration screen for lesson completion
// Replaces the basic "done" screen with a rich, animated, Duolingo-style celebration
// Features: star rating, XP counter, coin counter, mascot celebration, stats reveal,
// achievement showcase, and progression CTA
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { MascotIcon } from "@/components/MascotIcon";
import { StarRating } from "@/components/StarRating";
import { XPCounter, CoinCounter } from "@/components/XPCounter";
import { ChunkyButton } from "@/components/ChunkyButton";
import { ConfettiCelebration, fireConfetti, FloatingReward } from "@/components/ConfettiCelebration";
import { getMascot, type MascotId } from "@/lib/mascots";
import { type Achievement } from "@/lib/achievements";
import { Check, Coins, Heart, Trophy, Sparkles, ArrowRight, RotateCcw, Star, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCompleteScreenProps {
  /** The mascot ID for the child's profile */
  mascotId: MascotId;
  /** The lesson title */
  lessonTitle: string;
  /** Number of correct answers */
  correct: number;
  /** Total number of questions */
  total: number;
  /** XP earned in this lesson */
  xpEarned: number;
  /** Coins earned in this lesson */
  coinsEarned: number;
  /** New achievements unlocked */
  newAchievements: Achievement[];
  /** Whether this was a perfect lesson (all correct) */
  isPerfect: boolean;
  /** Duration in seconds */
  durationSeconds: number;
  /** Combo bonus XP earned */
  bonusXp?: number;
  /** Max combo achieved */
  maxCombo?: number;
  /** Called when user wants to continue */
  onContinue?: () => void;
  /** Called when user wants to retry */
  onRetry?: () => void;
  /** Next lesson link params */
  nextLesson?: { subjectId: string; lessonId: string } | null;
  /** Chapter name for context */
  chapterName?: string;
}

export function LessonCompleteScreen({
  mascotId,
  lessonTitle,
  correct,
  total,
  xpEarned,
  coinsEarned,
  newAchievements,
  isPerfect,
  durationSeconds,
  bonusXp = 0,
  maxCombo = 0,
  onContinue,
  onRetry,
  nextLesson,
  chapterName,
}: LessonCompleteScreenProps) {
  const mascot = getMascot(mascotId);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showFloatingReward, setShowFloatingReward] = useState(true);

  // Staggered reveal: stats after 1s, achievements after 2s
  useEffect(() => {
    const statsTimer = setTimeout(() => setShowStats(true), 1000);
    const achTimer = setTimeout(() => setShowAchievements(true), 2000);
    return () => {
      clearTimeout(statsTimer);
      clearTimeout(achTimer);
    };
  }, []);

  // Fire extra confetti for perfect lessons
  useEffect(() => {
    if (isPerfect) {
      const timer = setTimeout(() => fireConfetti("perfect-lesson"), 600);
      return () => clearTimeout(timer);
    }
  }, [isPerfect]);

  // Celebration message based on accuracy
  const celebrationMessage = useMemo(() => {
    if (isPerfect) return "Lição perfeita! 🌟";
    if (accuracy >= 80) return "Excelente trabalho! 🎉";
    if (accuracy >= 60) return "Muito bem! 👏";
    if (accuracy >= 40) return "Bom esforço! 💪";
    return "Continua a tentar! 🌱";
  }, [accuracy, isPerfect]);

  // Mascot celebration phrase
  const mascotPhrase = useMemo(() => {
    if (isPerfect) return mascot.encourage;
    if (accuracy >= 80) return "Estás a ficar incrível!";
    if (accuracy >= 50) return "Cada vez melhor!";
    return "Tu consegues! Tenta de novo!";
  }, [accuracy, isPerfect, mascot]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <main className="bg-paper relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-5 py-8">
      {/* Confetti */}
      <ConfettiCelebration
        show={showConfetti}
        type={isPerfect ? "perfect-lesson" : "lesson-complete"}
        durationMs={3000}
        onDone={() => setShowConfetti(false)}
      />

      {/* Floating XP/Coins */}
      <FloatingReward
        show={showFloatingReward}
        xp={xpEarned}
        coins={coinsEarned}
        onDone={() => setShowFloatingReward(false)}
      />

      {/* Background decorative glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-xp/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* ── 1. Mascot celebration ── */}
        <motion.div
          initial={{ scale: 0, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="relative"
        >
          {/* Mascot glow ring */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-primary/10 blur-xl"
          />
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <MascotIcon id={mascotId} size={96} animated />
          </motion.div>
          {/* Celebration badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 12 }}
            className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-success shadow-lg"
          >
            <Check className="h-6 w-6 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* ── 2. Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center"
        >
          <h1 className="font-display text-4xl font-bold text-gradient-brand sm:text-5xl">
            {celebrationMessage}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Missão completa: <strong className="text-foreground">{lessonTitle}</strong>
          </p>
          {chapterName && (
            <p className="mt-0.5 text-xs text-muted-foreground/70">{chapterName}</p>
          )}
        </motion.div>

        {/* ── 3. Star Rating ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5"
        >
          <StarRating accuracy={accuracy} size="lg" />
        </motion.div>

        {/* ── 4. XP + Coins counters ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-6"
        >
          <XPCounter target={xpEarned} size="lg" delayMs={500} />
          <CoinCounter target={coinsEarned} size="md" delayMs={800} />
        </motion.div>

        {/* Bonus XP indicator */}
        {bonusXp > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-2 flex items-center gap-1.5 rounded-full bg-streak/10 px-3 py-1 font-display text-sm font-bold text-streak"
          >
            <Sparkles className="h-4 w-4" />
            Bónus Combo: +{bonusXp} XP
          </motion.div>
        )}

        {/* ── 5. Stats Grid (staggered reveal) ── */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="mt-6 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4"
            >
              <StatCard
                icon={<Target className="h-4 w-4" />}
                label="Acertos"
                value={`${correct}/${total}`}
                color="text-success"
                delay={0}
              />
              <StatCard
                icon={<Star className="h-4 w-4" />}
                label="Precisão"
                value={`${accuracy}%`}
                color="text-xp"
                delay={0.08}
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Tempo"
                value={formatDuration(durationSeconds)}
                color="text-secondary"
                delay={0.16}
              />
              {maxCombo >= 3 && (
                <StatCard
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Max Combo"
                  value={`x${maxCombo}`}
                  color="text-streak"
                  delay={0.24}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 6. Mascot phrase ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-soft"
        >
          <MascotIcon id={mascotId} size={36} />
          <div>
            <p className="font-display text-sm font-medium text-foreground/90 italic">
              "{mascotPhrase}"
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              {mascot.name}
            </p>
          </div>
        </motion.div>

        {/* ── 7. Achievement showcase ── */}
        <AnimatePresence>
          {showAchievements && newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="mt-5 w-full overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-secondary/10 card-chunky"
            >
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-bold">
                    {newAchievements.length === 1 ? "Nova conquista!" : `${newAchievements.length} novas conquistas!`}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {newAchievements.map((a, i) => (
                    <motion.li
                      key={a.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center justify-between gap-3 rounded-xl bg-card/80 p-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🏅</span>
                        <div>
                          <p className="font-display text-sm font-semibold">{a.title}</p>
                          {a.description && (
                            <p className="text-xs text-muted-foreground">{a.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-xp/15 px-2 py-0.5 text-xs font-bold text-xp">
                        +{a.coin_reward} 🪙
                      </span>
                    </motion.li>
                  ))}
                </ul>
                <Link
                  to="/conquistas"
                  className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Ver todas as conquistas <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 8. Action buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          className="mt-8 flex w-full flex-col gap-3"
        >
          {/* Primary CTA: Continue or Next Lesson */}
          {nextLesson ? (
            <Link
              to="/licao/$subjectId/$lessonId"
              params={{ subjectId: nextLesson.subjectId, lessonId: nextLesson.lessonId }}
              className="block"
            >
              <ChunkyButton tone="success" className="w-full text-lg">
                Próxima lição <ArrowRight className="ml-2 inline h-5 w-5" />
              </ChunkyButton>
            </Link>
          ) : (
            <ChunkyButton tone="success" onClick={onContinue} className="w-full text-lg">
              Continuar aventura <ArrowRight className="ml-2 inline h-5 w-5" />
            </ChunkyButton>
          )}

          {/* Secondary actions */}
          <div className="flex gap-3">
            <Link to="/loja" className="flex-1">
              <ChunkyButton tone="secondary" className="w-full">
                Loja 🛍️
              </ChunkyButton>
            </Link>
            <ChunkyButton tone="ghost" onClick={onRetry} className="flex-1">
              <RotateCcw className="mr-1.5 inline h-4 w-4" />
              Repetir
            </ChunkyButton>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// ─── Stat Card — premium mini stat ───
function StatCard({
  icon,
  label,
  value,
  color,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 18 }}
      className="card-chunky rounded-2xl border border-border bg-card p-3 text-center"
    >
      <div className={cn("flex items-center justify-center gap-1", color)}>
        {icon}
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
      </div>
      <p className={cn("mt-1 font-display text-xl font-bold tabular-nums", color)}>{value}</p>
    </motion.div>
  );
}
