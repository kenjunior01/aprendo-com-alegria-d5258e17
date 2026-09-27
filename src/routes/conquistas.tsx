import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { loadProfile, type Profile } from "@/lib/storage";
import { RouteError } from "@/components/RouteError";
import { KidLoader } from "@/components/KidLoader";
import {
  fetchAchievements,
  fetchUnlocked,
  getPerfectLessons,
  type Achievement,
} from "@/lib/achievements";
import { PORTAL_BADGES, loadPortalState, type PortalBadge } from "@/lib/premiumWorld";
import { loadPortalDaily } from "@/lib/portalDaily";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Crown,
  Flame,
  Zap,
  Star,
  Trophy,
  Coins,
  ShoppingBag,
  Target,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/conquistas")({
  head: () => ({
    meta: [
      { title: "Conquistas — Kidoz" },
      {
        name: "description",
        content: "Vê as tuas medalhas desbloqueadas e as próximas a conquistar.",
      },
      { property: "og:title", content: "As minhas conquistas — Kidoz" },
      {
        property: "og:description",
        content: "Vê as tuas medalhas desbloqueadas e as próximas a conquistar.",
      },
      { property: "og:url", content: "https://kidoz.online/conquistas" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/conquistas" }],
  }),
  component: AchievementsPage,
  errorComponent: RouteError,
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  crown: Crown,
  flame: Flame,
  zap: Zap,
  star: Star,
  trophy: Trophy,
  coins: Coins,
  "shopping-bag": ShoppingBag,
  target: Target,
};

const CATEGORY_LABEL: Record<string, string> = {
  progresso: "Progresso",
  consistencia: "Consistência",
  xp: "Experiência",
  economia: "Economia",
  precisao: "Precisão",
  geral: "Geral",
};

function progressFor(a: Achievement, p: Profile, perfectLessons: number): number {
  let current = 0;
  switch (a.requirement_type) {
    case "lessons_completed":
      current = p.completedLessons.length;
      break;
    case "streak":
      current = p.streak;
      break;
    case "xp":
      current = p.xp;
      break;
    case "coins_total":
      current = p.coins;
      break;
    case "items_owned":
      current = p.ownedItems.length;
      break;
    case "perfect_lessons":
      current = perfectLessons;
      break;
  }
  return Math.min(1, current / a.requirement_value);
}

function AchievementsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [portalStreak, setPortalStreak] = useState(0);
  const [portalState, setPortalState] = useState(() => loadPortalState());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const p = loadProfile();
      const [list, u] = await Promise.all([fetchAchievements(), fetchUnlocked()]);
      if (cancelled) return;
      setProfile(p);
      setAchievements(list);
      setUnlocked(new Set(u.map((x) => x.achievement_code)));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPortalState(loadPortalState());
    setPortalStreak(loadPortalDaily().streak);
  }, []);

  const perfectLessons = getPerfectLessons();
  const unlockedCount = unlocked.size;
  const total = achievements.length;

  const portalDone = PORTAL_BADGES.filter((b) => {
    const p = b.progress(portalState, portalStreak);
    return p.cur >= p.target;
  }).length;

  const grouped = achievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    (acc[a.category] = acc[a.category] ?? []).push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      {profile && <TopBar profile={profile} />}
      <main id="main-content" className="mx-auto max-w-[48rem] px-4 py-6 sm:py-8">
        <header className="mb-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-3 font-display text-3xl">Conquistas</h1>
          <p className="text-muted-foreground">
            {unlockedCount} de {total} medalhas desbloqueadas
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: total ? `${(unlockedCount / total) * 100}%` : "0%" }}
            />
          </div>
        </header>

        {loading && <KidLoader compact />}

        {!loading && unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-chunky mb-6 rounded-3xl border-2 border-border bg-card p-6 text-center"
          >
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="font-display text-xl">Sem conquistas ainda</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Começa a aprender para ganhar conquistas! 🏆 Cada missão que completas te dá medalhas
              e Abracadinhos.
            </p>
            <Link to="/app" className="mt-4 inline-block">
              <ChunkyButton tone="primary">Começar aventura</ChunkyButton>
            </Link>
          </motion.div>
        )}

        {!loading &&
          profile &&
          Object.entries(grouped).map(([cat, items]) => (
            <section key={cat} className="mb-6">
              <h2 className="mb-3 font-display text-lg sm:text-xl">{CATEGORY_LABEL[cat] ?? cat}</h2>
              <div role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((a) => {
                  const isUnlocked = unlocked.has(a.code);
                  const Icon = ICONS[a.icon] ?? Trophy;
                  const pct = progressFor(a, profile, perfectLessons);
                  return (
                    <div
                      key={a.code}
                      role="listitem"
                      className={`card-chunky rounded-2xl border-2 p-4 transition-transform ${
                        isUnlocked
                          ? "border-primary bg-card"
                          : "border-border bg-muted/40 opacity-90"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                            isUnlocked
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isUnlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-base">{a.title}</h3>
                          <p className="text-xs text-muted-foreground">{a.description}</p>
                          {!isUnlocked && (
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary/70"
                                style={{ width: `${pct * 100}%` }}
                              />
                            </div>
                          )}
                          <p className="mt-1 text-[11px] font-semibold text-secondary">
                            + {a.coin_reward} 🪙{a.xp_reward > 0 ? `  · + ${a.xp_reward} ⭐` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

        <section className="mb-6 mt-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg sm:text-xl">🌍 Conquistas do Mundo Premium</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
              {portalDone} de {PORTAL_BADGES.length}
            </span>
          </div>
          <div role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PORTAL_BADGES.map((b: PortalBadge) => {
              const p = b.progress(portalState, portalStreak);
              const isDone = p.cur >= p.target;
              const pct = p.target ? Math.min(1, p.cur / p.target) : 0;
              return (
                <div
                  key={b.id}
                  role="listitem"
                  className={`card-chunky rounded-2xl border-2 p-4 transition-transform ${
                    isDone ? "border-amber-400 bg-card" : "border-border bg-muted/40 opacity-90"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                        isDone ? "bg-amber-100" : "bg-muted grayscale"
                      }`}
                    >
                      {b.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-base">{b.title}</h3>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                      {!isDone && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                              style={{ width: `${pct * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {p.cur}/{p.target}
                          </span>
                        </div>
                      )}
                      {isDone && (
                        <p className="mt-1 text-[11px] font-bold text-amber-600">
                          ✓ Conquistada no Mundo Premium
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            As conquistas do Mundo vivem no Portal —{" "}
            <Link
              to="/portal"
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              visita o Portal Mágico
            </Link>{" "}
            para as desbloquear.
          </p>
        </section>

        <div className="mt-6">
          <Link to="/app">
            <ChunkyButton className="w-full">← Voltar à aventura</ChunkyButton>
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
