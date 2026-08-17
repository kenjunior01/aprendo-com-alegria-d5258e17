// LeagueLeaderboard — tabela classificativa da liga semanal — Premium Design
// Mostra posição, pontuação, e avatares estilo Duolingo
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Users, Zap, Share2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { getMascot, type MascotId } from "@/lib/mascots";
import { getLeague, type LeagueTier } from "@/components/DuolingoBar";
import type { Profile } from "@/lib/storage";
import { toast } from "sonner";

// Emoji map for mascot display in leaderboard
const MASCOT_EMOJIS: Record<string, string> = {
  fox: "🦊",
  owl: "🦉",
  bunny: "🐰",
  turtle: "🐢",
  panda: "🐼",
  lion: "🦁",
};

// ─── Types ───
interface LeaderboardEntry {
  rank: number;
  name: string;
  mascot: string;
  score: number;
  gamesPlayed: number;
  isMe: boolean;
  isBot: boolean;
}

interface LeagueInfo {
  id: string;
  name: string;
  ageGroup: string;
  inviteCode: string;
  endsOn: string;
}

// ─── Mock data for demo/offline ───
const MOCK_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, name: "Estrelinha", mascot: "owl", score: 245, gamesPlayed: 12, isMe: false, isBot: true },
  { rank: 2, name: "Tu", mascot: "fox", score: 180, gamesPlayed: 8, isMe: true, isBot: false },
  { rank: 3, name: "Trovão", mascot: "rabbit", score: 155, gamesPlayed: 9, isBot: true, isMe: false },
  { rank: 4, name: "Lua", mascot: "panda", score: 120, gamesPlayed: 7, isBot: true, isMe: false },
  { rank: 5, name: "Bolinha", mascot: "lion", score: 85, gamesPlayed: 5, isBot: true, isMe: false },
];

// ─── Component ───
interface LeagueLeaderboardProps {
  profile: Profile;
  className?: string;
}

export function LeagueLeaderboard({ profile, className }: LeagueLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_ENTRIES);
  const [league, setLeague] = useState<LeagueInfo | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const leagueInfo = getLeague(profile.xp);
  const myEntry = entries.find((e) => e.isMe);
  const myRank = myEntry?.rank ?? entries.length + 1;

  // Calculate days remaining
  const daysRemaining = league?.endsOn
    ? Math.max(0, Math.ceil((new Date(league.endsOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 7;

  const handleCopyCode = () => {
    if (league?.inviteCode) {
      navigator.clipboard.writeText(league.inviteCode);
      haptic("success");
      toast.success("Código copiado!");
    }
  };

  const rankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-leagues-ouro" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-leagues-prata" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-leagues-bronze" />;
    return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("card-premium overflow-hidden rounded-3xl", className)}
    >
      {/* Header */}
      <button
        onClick={() => { setExpanded(!expanded); haptic("tap"); }}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30"
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
          style={{ backgroundColor: `color-mix(in oklab, var(${leagueInfo.colorVar}) 14%, var(--card))` }}
        >
          <leagueInfo.icon className="h-6 w-6" style={{ color: `var(${leagueInfo.colorVar})` }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Liga Semanal
          </p>
          <h3 className="font-display text-base leading-tight">{leagueInfo.name}</h3>
          <p className="text-[10px] text-muted-foreground">
            {daysRemaining} dias restantes · Posição #{myRank}
          </p>
        </div>
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          expanded ? "bg-muted" : "bg-muted/50"
        )}>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Leaderboard */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 px-4 pb-4 pt-3">
              {/* Top 3 podium — premium */}
              <div className="mb-4 flex items-end justify-center gap-3 py-2">
                {/* 2nd place */}
                {entries[1] && (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">{MASCOT_EMOJIS[entries[1].mascot] || "🧸"}</span>
                    <div className="mt-1 rounded-xl bg-leagues-prata/10 px-3 py-1.5 text-center">
                      <Medal className="mx-auto h-4 w-4 text-leagues-prata" />
                      <p className="text-[10px] font-bold">{entries[1].name}</p>
                      <p className="text-[10px] text-muted-foreground">{entries[1].score} pts</p>
                    </div>
                  </div>
                )}
                {/* 1st place */}
                {entries[0] && (
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-3xl">{MASCOT_EMOJIS[entries[0].mascot] || "🧸"}</span>
                    </motion.div>
                    <div className="mt-1 rounded-xl bg-leagues-ouro/10 px-4 py-2 text-center shadow-glow">
                      <Crown className="mx-auto h-5 w-5 text-leagues-ouro" />
                      <p className="text-xs font-bold">{entries[0].name}</p>
                      <p className="text-[10px] text-muted-foreground">{entries[0].score} pts</p>
                    </div>
                  </div>
                )}
                {/* 3rd place */}
                {entries[2] && (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">{MASCOT_EMOJIS[entries[2].mascot] || "🧸"}</span>
                    <div className="mt-1 rounded-xl bg-leagues-bronze/10 px-3 py-1.5 text-center">
                      <Medal className="mx-auto h-4 w-4 text-leagues-bronze" />
                      <p className="text-[10px] font-bold">{entries[2].name}</p>
                      <p className="text-[10px] text-muted-foreground">{entries[2].score} pts</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full list */}
              <div className="space-y-1.5">
                {entries.map((entry) => (
                  <div
                    key={entry.rank}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 transition-all",
                      entry.isMe && "border-2 border-primary/20 bg-primary/5",
                      !entry.isMe && "bg-muted/30 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                      {rankBadge(entry.rank)}
                    </div>
                    <span className="text-lg">{MASCOT_EMOJIS[entry.mascot] || "🧸"}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm font-display", entry.isMe && "font-bold text-primary")}>
                        {entry.name}
                        {entry.isBot && <span className="ml-1 text-[10px] text-muted-foreground">🤖</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.gamesPlayed} jogos
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-xp" />
                      <span className="font-display text-sm font-bold tabular-nums">{entry.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Invite code */}
              {league?.inviteCode && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-xs text-muted-foreground">
                    Convida amigos: <strong>{league.inviteCode}</strong>
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="rounded-lg p-1 hover:bg-muted transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Motivation */}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {myRank <= 3
                  ? "Estás no pódio! Continua assim!"
                  : myRank <= 5
                  ? "Quase lá! Mais alguns jogos e chegas ao topo!"
                  : "Joga mais para subir na classificação!"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
