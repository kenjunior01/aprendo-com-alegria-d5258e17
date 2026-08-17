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
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/jardim")({
  head: () => ({
    meta: [
      { title: "O meu Jardim Mágico — Kidoz" },
      { name: "description", content: "O teu jardim cresce a cada missão completada. Vê o que conseguiste desbloquear!" },
      { property: "og:title", content: 'O meu Jardim Mágico — Kidoz' },
      { property: "og:description", content: 'O teu jardim cresce a cada missão completada.' },
      { property: "og:url", content: "https://kidoz.online/jardim" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/jardim" },
    ],
  }),
  component: GardenPage,
  errorComponent: RouteError,
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

  if (!profile || !missions) return (
    <main id="main-content" className="flex min-h-[60dvh] items-center justify-center">
      <p className="animate-pulse font-display text-lg text-muted-foreground" role="status" aria-live="polite">A carregar…</p>
    </main>
  );
  const garden = gardenState(profile);
  const nextProgress = garden.next ? progressToNext(profile, garden.next) : null;
  const stats = dailyMissionStats(missions);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main id="main-content" className="mx-auto max-w-[48rem] px-4 py-5">
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

        {/* Missões Diárias */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-chunky mt-5 rounded-3xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg">Missões de hoje</h2>
            </div>
            <span className="font-display text-xs text-muted-foreground">
              {stats.completed}/{stats.total} concluídas
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-success via-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${stats.pct * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <div role="list" className="mt-4 grid gap-2 sm:grid-cols-2">
            <AnimatePresence>
              {missions.missions.map((m) => {
                const prog = missions.progress[m.id] ?? 0;
                const done = prog >= m.target;
                const claimed = missions.claimed.includes(m.id);
                const pct = Math.min(1, prog / m.target);
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="listitem"
                    className={cn(
                      "rounded-2xl border-2 p-3 transition-colors",
                      claimed ? "border-success/40 bg-success/5"
                        : done ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{m.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm leading-tight">{m.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{m.description}</p>
                      </div>
                      {claimed && <CheckCircle2 className="h-4 w-4 text-success" />}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                        <div
                          className={cn("h-full rounded-full transition-all", done ? "bg-success" : "bg-primary")}
                          style={{ width: `${pct * 100}%` }}
                        />
                      </div>
                      <span className="font-display text-[10px] text-muted-foreground">{prog}/{m.target}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-display text-[11px] text-muted-foreground">
                        🪙 {m.rewardCoins} · ⭐ {m.rewardXp} XP
                      </span>
                      {claimed ? (
                        <span className="font-display text-[10px] text-success">Recolhido ✓</span>
                      ) : done ? (
                        <button
                          onClick={() => handleClaim(m.id)}
                          className="btn-chunky rounded-full bg-primary px-3 py-1 font-display text-[11px] text-primary-foreground"
                        >
                          Recolher
                        </button>
                      ) : (
                        <Link to={subjectLink(m.subject)} className="font-display text-[11px] text-primary underline">
                          Começar →
                        </Link>
                      )}
                    </div>
                    {justClaimed === m.id && (
                      <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-center font-display text-[10px] text-success">
                        +{m.rewardCoins} 🪙 +{m.rewardXp} ⭐
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            🌅 Novas missões todos os dias — completa-as para o teu jardim crescer mais depressa.
          </p>
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

function subjectLink(subject: string): "/app" | "/leitura" {
  if (subject === "leitura") return "/leitura";
  return "/app";
}
