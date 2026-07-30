// DuolingoBar — barra de gamificação estilo Duolingo — Premium Design
// XP levels, leagues, hearts refill timer, streak fire, coins
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Heart, Coins, Trophy, Star, Zap, Crown, Shield, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/storage";

// ─── XP Level System ───
export const XP_LEVELS = [
  { level: 1,  name: "Iniciante",     minXP: 0,    icon: "🌱" },
  { level: 2,  name: "Explorador",     minXP: 100,  icon: "🧭" },
  { level: 3,  name: "Aprendiz",       minXP: 300,  icon: "📖" },
  { level: 4,  name: "Descobridor",    minXP: 600,  icon: "🔍" },
  { level: 5,  name: "Construtor",     minXP: 1000, icon: "🏗️" },
  { level: 6,  name: "Cientista",      minXP: 1600, icon: "🔬" },
  { level: 7,  name: "Mestre",         minXP: 2500, icon: "🎓" },
  { level: 8,  name: "Sábio",          minXP: 3800, icon: "🦉" },
  { level: 9,  name: "Lenda",          minXP: 5500, icon: "⚡" },
  { level: 10, name: "Supremo",        minXP: 8000, icon: "👑" },
] as const;

export function getXPLevel(xp: number) {
  let lvl = XP_LEVELS[0];
  for (const l of XP_LEVELS) {
    if (xp >= l.minXP) lvl = l;
    else break;
  }
  return lvl;
}

export function getNextXPLevel(xp: number) {
  const current = getXPLevel(xp);
  const idx = XP_LEVELS.indexOf(current);
  return idx < XP_LEVELS.length - 1 ? XP_LEVELS[idx + 1] : null;
}

export function getXPProgress(xp: number) {
  const current = getXPLevel(xp);
  const next = getNextXPLevel(xp);
  if (!next) return 1;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(1, progress / range);
}

// ─── League Badges ───
export const LEAGUES = [
  { tier: "bronze",  name: "Liga Bronze",  minXP: 0,    colorVar: "--leagues-bronze",  icon: Shield },
  { tier: "prata",   name: "Liga Prata",   minXP: 300,  colorVar: "--leagues-prata",   icon: Medal },
  { tier: "ouro",    name: "Liga Ouro",    minXP: 1000, colorVar: "--leagues-ouro",    icon: Award },
  { tier: "diamante", name: "Liga Diamante", minXP: 2500, colorVar: "--leagues-diamante", icon: Crown },
  { tier: "lenda",   name: "Liga Lenda",   minXP: 5500, colorVar: "--leagues-lenda",   icon: Trophy },
] as const;

export type LeagueTier = (typeof LEAGUES)[number]["tier"];

export function getLeague(xp: number) {
  let league = LEAGUES[0];
  for (const l of LEAGUES) {
    if (xp >= l.minXP) league = l;
    else break;
  }
  return league;
}

// ─── Hearts Refill Timer ───
const HEART_REFILL_MS = 30 * 60 * 1000; // 30 min per heart
const MAX_HEARTS = 5;

export function getHeartsRefillInfo(hearts: number, lastPlayed: string) {
  if (hearts >= MAX_HEARTS) return { nextRefillMs: 0, heartsToMax: 0 };
  const now = Date.now();
  const last = lastPlayed ? new Date(lastPlayed).getTime() : now;
  const elapsed = now - last;
  const heartsToMax = MAX_HEARTS - hearts;
  const nextRefillMs = Math.max(0, HEART_REFILL_MS - (elapsed % HEART_REFILL_MS));
  return { nextRefillMs, heartsToMax };
}

function formatTime(ms: number): string {
  if (ms <= 0) return "";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// ─── DuolingoBar Component — Premium Design ───
interface DuolingoBarProps {
  profile: Profile;
  compact?: boolean;
  className?: string;
}

export function DuolingoBar({ profile, compact = false, className }: DuolingoBarProps) {
  const [now, setNow] = useState(Date.now());
  const xpLevel = getXPLevel(profile.xp);
  const nextLevel = getNextXPLevel(profile.xp);
  const xpProgress = getXPProgress(profile.xp);
  const league = getLeague(profile.xp);
  const LeagueIcon = league.icon;

  // Tick every second for hearts timer
  useEffect(() => {
    if (profile.hearts >= MAX_HEARTS) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [profile.hearts, profile.lastPlayed]);

  // Calculate current hearts based on time elapsed
  const currentHearts = useMemo(() => {
    if (profile.hearts >= MAX_HEARTS) return MAX_HEARTS;
    const last = profile.lastPlayed ? new Date(profile.lastPlayed).getTime() : now;
    const elapsed = now - last;
    const refilled = Math.floor(elapsed / HEART_REFILL_MS);
    return Math.min(MAX_HEARTS, profile.hearts + refilled);
  }, [profile.hearts, profile.lastPlayed, now]);

  const nextRefillMs = useMemo(() => {
    if (currentHearts >= MAX_HEARTS) return 0;
    const last = profile.lastPlayed ? new Date(profile.lastPlayed).getTime() : now;
    const elapsed = now - last;
    return Math.max(0, HEART_REFILL_MS - (elapsed % HEART_REFILL_MS));
  }, [currentHearts, profile.lastPlayed, now]);

  // ─── Compact Mode ───
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2.5 rounded-full bg-card/80 px-3 py-1.5 shadow-sm backdrop-blur-sm", className)}>
        <div className="flex items-center gap-1" title={league.name}>
          <LeagueIcon className="h-3.5 w-3.5" style={{ color: `var(${league.colorVar})` }} />
          <span className="text-[10px] font-bold">{xpLevel.icon}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-xp" />
          <span className="text-[10px] font-bold tabular-nums">{profile.xp}</span>
        </div>
        {profile.streak > 0 && (
          <div className="flex items-center gap-0.5">
            <Flame className={cn("h-3 w-3", profile.streak >= 7 ? "text-streak" : "text-muted-foreground")} />
            <span className="text-[10px] font-bold tabular-nums">{profile.streak}</span>
          </div>
        )}
        <div className="flex items-center gap-0.5">
          <Heart className={cn("h-3 w-3", currentHearts > 0 ? "text-hearts fill-hearts" : "text-muted-foreground")} />
          <span className="text-[10px] font-bold tabular-nums">{currentHearts}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Coins className="h-3 w-3 text-coins" />
          <span className="text-[10px] font-bold tabular-nums">{profile.coins}</span>
        </div>
      </div>
    );
  }

  // ─── Full Mode — Premium Design ───
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-3 backdrop-blur-sm",
      "shadow-[0_2px_12px_-4px_color-mix(in_oklab,var(--color-primary)_12%,transparent)]",
      className
    )}>
      {/* Decorative gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex items-center gap-3">
        {/* League badge — premium */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: `color-mix(in oklab, var(${league.colorVar}) 14%, var(--card))` }}
          title={league.name}
        >
          <LeagueIcon className="h-5 w-5" style={{ color: `var(${league.colorVar})` }} />
        </div>

        {/* XP Progress — premium with shimmer */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold">
              {xpLevel.icon} Nível {xpLevel.level} — {xpLevel.name}
            </span>
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              {profile.xp} XP
            </span>
          </div>
          <div className="relative mt-1.5 h-3.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-xp via-yellow-400 to-amber-400 progress-glow"
            />
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          </div>
          {nextLevel && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Faltam <span className="font-bold text-xp">{nextLevel.minXP - profile.xp}</span> XP para {nextLevel.icon} {nextLevel.name}
            </p>
          )}
        </div>

        {/* Streak — animated fire */}
        <div className="flex flex-col items-center gap-0.5">
          <motion.div
            animate={profile.streak >= 7 ? { scale: [1, 1.15, 1] } : undefined}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className={cn("h-6 w-6", profile.streak >= 7 ? "text-streak" : profile.streak > 0 ? "text-streak" : "text-muted-foreground")} />
          </motion.div>
          <span className="font-display text-[10px] font-bold tabular-nums">{profile.streak}d</span>
        </div>

        {/* Hearts — premium with glow */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex -space-x-0.5">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <Heart
                key={i}
                className={cn(
                  "h-4 w-4 transition-all",
                  i < currentHearts ? "text-hearts fill-hearts" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          {currentHearts < MAX_HEARTS && nextRefillMs > 0 && (
            <span className="text-[9px] tabular-nums text-muted-foreground">
              +1 em {formatTime(nextRefillMs)}
            </span>
          )}
        </div>

        {/* Coins — premium */}
        <div className="flex flex-col items-center gap-0.5">
          <Coins className="h-5 w-5 text-coins" />
          <span className="font-display text-[10px] font-bold tabular-nums">{profile.coins}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Streak Celebration Overlay — Premium ───
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function StreakCelebration({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const milestone = STREAK_MILESTONES.includes(streak) ? streak : null;
  if (!milestone) return null;

  const messages: Record<number, string> = {
    3: "Três dias seguidos! A tua constância é incrível!",
    7: "Uma semana completa! És um campeão!",
    14: "Duas semanas! A tua mascote está orgulhosa!",
    30: "Um mês inteiro! És uma lenda viva!",
    60: "Dois meses! Ninguém te para!",
    100: "Cem dias! És oficialmente uma Lenda Suprema!",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: "spring", damping: 15 }}
        className="card-premium mx-4 max-w-sm rounded-3xl bg-card p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.8, repeat: 2 }}
          className="mb-4 text-6xl"
        >
          🔥
        </motion.div>
        <h2 className="mb-2 font-display text-2xl font-bold text-gradient-streak">
          {milestone} Dias Seguidos!
        </h2>
        <p className="mb-6 text-muted-foreground">{messages[milestone]}</p>
        <button
          onClick={onDismiss}
          className="btn-chunky rounded-full bg-primary px-8 py-3 font-display text-white shadow-lg"
        >
          Continuar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Heart Refill Notification — Premium ───
export function HeartRefillNotification({ hearts, onDismiss }: { hearts: number; onDismiss: () => void }) {
  if (hearts > 1) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed left-4 right-4 top-4 z-40 mx-auto max-w-sm rounded-2xl border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-800 dark:bg-red-950/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm font-bold">Corações baixos!</p>
          <p className="text-xs text-muted-foreground">
            {hearts === 0
              ? "Sem corações! Espera um pouco ou pratica para ganhar mais."
              : "Só tens 1 coração. Tenta não errar!"}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
