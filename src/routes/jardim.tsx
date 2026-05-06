import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { loadProfile, updateProfile, type Profile } from "@/lib/storage";
import { gardenState, progressToNext, LEVEL_NAMES } from "@/lib/garden";
import { loadMissions, claimMission, dailyMissionStats, type DailyMissionsState } from "@/lib/dailyMissions";
import { ArrowLeft, Sparkles, Lock, Gift, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/jardim")({
  head: () => ({
    meta: [
      { title: "O meu Jardim Mágico — Lusis" },
      { name: "description", content: "O teu jardim cresce a cada missão completada. Vê o que conseguiste desbloquear!" },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [missions, setMissions] = useState<DailyMissionsState | null>(null);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) { navigate({ to: "/comecar" }); return; }
    setProfile(p);
    setMissions(loadMissions());
  }, [navigate]);

  const handleClaim = (id: string) => {
    const m = claimMission(id);
    if (!m || !profile) return;
    const next = updateProfile({ coins: profile.coins + m.rewardCoins, xp: profile.xp + m.rewardXp });
    setProfile(next);
    setMissions(loadMissions());
    setJustClaimed(id);
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ["#7cd16e", "#ffd166", "#5db1ff"] });
    setTimeout(() => setJustClaimed(null), 2000);
  };

  if (!profile || !missions) return null;
  const garden = gardenState(profile);
  const nextProgress = garden.next ? progressToNext(profile, garden.next) : null;
  const stats = dailyMissionStats(missions);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-5">
        <Link to="/app" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Aventura
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/30 p-5"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌱</span>
            <div>
              <h1 className="font-display text-2xl">O meu Jardim Mágico</h1>
              <p className="text-sm text-muted-foreground">
                Nível {garden.level} · <strong>{LEVEL_NAMES[garden.level]}</strong> · {garden.totalUnlocked}/{garden.total} criaturas
              </p>
            </div>
          </div>
        </motion.section>

        {/* The garden scene */}
        <div
          className="card-chunky relative mt-5 overflow-hidden rounded-3xl border-2 border-border"
          style={{
            aspectRatio: "5 / 4",
            background: "linear-gradient(180deg, oklch(0.85 0.10 220) 0%, oklch(0.90 0.08 200) 35%, oklch(0.85 0.12 130) 60%, oklch(0.75 0.14 130) 100%)",
          }}
        >
          {/* sun */}
          <div className="absolute right-6 top-5 text-5xl drop-shadow-lg" style={{ filter: "drop-shadow(0 0 12px rgba(255,220,100,0.7))" }}>
            ☀️
          </div>

          {/* clouds */}
          <div className="absolute left-8 top-6 text-4xl opacity-80 animate-[float-slow_8s_ease-in-out_infinite]">☁️</div>
          <div className="absolute right-24 top-12 text-3xl opacity-70 animate-[float-slow_10s_ease-in-out_infinite]">☁️</div>

          {/* unlocked items */}
          {garden.unlocked.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: it.size ?? 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 14 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-help"
              style={{ top: `${it.pos.top}%`, left: `${it.pos.left}%`, fontSize: "2.5rem" }}
              title={`${it.name} — ${it.description}`}
            >
              <span className="block text-shadow-soft drop-shadow-md">{it.emoji}</span>
            </motion.div>
          ))}

          {/* hint of locked spots (as sparkles) */}
          {garden.locked.slice(0, 3).map((it) => (
            <div
              key={it.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 opacity-40"
              style={{ top: `${it.pos.top}%`, left: `${it.pos.left}%` }}
            >
              <Sparkles className="h-4 w-4 animate-pulse text-white/70" />
            </div>
          ))}

          {/* empty state */}
          {garden.unlocked.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
              <p className="rounded-2xl bg-white/70 px-4 py-3 font-display text-sm text-foreground">
                O teu jardim está à espera! Faz a tua primeira missão para plantar uma semente. 🌱
              </p>
            </div>
          )}
        </div>

        {/* Next unlock */}
        {garden.next && nextProgress && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-chunky mt-5 rounded-3xl border border-border bg-card p-4"
          >
            <p className="font-display text-sm text-muted-foreground">A seguir vais desbloquear:</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl opacity-60">
                <Lock className="absolute h-4 w-4" />
                <span className="opacity-30">{garden.next.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="font-display text-base">{garden.next.name}</p>
                <p className="text-xs text-muted-foreground">{garden.next.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${nextProgress.pct * 100}%` }} />
                  </div>
                  <span className="font-display text-xs text-muted-foreground">
                    {nextProgress.current}/{nextProgress.target} {nextProgress.label}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* List of unlocked + locked */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="card-chunky rounded-3xl border border-border bg-card p-4">
            <h3 className="font-display text-base">✨ Já tens ({garden.unlocked.length})</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {garden.unlocked.length === 0 && <p className="text-xs text-muted-foreground">Nada ainda — começa uma missão!</p>}
              {garden.unlocked.map((it) => (
                <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs">
                  <span className="text-base">{it.emoji}</span> {it.name}
                </span>
              ))}
            </div>
          </div>
          <div className="card-chunky rounded-3xl border border-border bg-card p-4">
            <h3 className="font-display text-base">🔒 Por descobrir ({garden.locked.length})</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {garden.locked.slice(0, 8).map((it) => (
                <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <span className="grayscale">{it.emoji}</span> ???
                </span>
              ))}
              {garden.locked.length > 8 && <span className="text-xs text-muted-foreground">+{garden.locked.length - 8}</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/app"><ChunkyButton tone="primary" className="w-full">Continuar aventura →</ChunkyButton></Link>
          <Link to="/tutor"><ChunkyButton tone="ghost" className="w-full">Falar com o Mocha 🦉</ChunkyButton></Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

const _cn = cn; void _cn;
