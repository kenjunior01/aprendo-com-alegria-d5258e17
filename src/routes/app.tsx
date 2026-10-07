import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { MascotVoiceTutor } from "@/components/MascotVoiceTutor";
import { CHAPTERS, type Chapter, type Mission } from "@/lib/chapters";
import type { Profile } from "@/lib/storage";
import { getMascot, prewarmMascotEmotions } from "@/lib/mascots";
import { isPremiumActive } from "@/lib/premium";
import { useFastProfile } from "@/hooks/useFastProfile";
import { AdaptiveTip } from "@/components/AdaptiveTip";
import { MissionOfTheDay } from "@/components/MissionOfTheDay";
import { SeasonalBanner } from "@/components/SeasonalBanner";
import { countDue } from "@/lib/reviewQueue";
import { Lock, Star, CheckCircle2, Crown, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { RouteError } from "@/components/RouteError";
import { KidLoader } from "@/components/KidLoader";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "A minha aventura — Kidoz" },
      {
        name: "description",
        content: "Caminho de aprendizagem visual: Português, Matemática e Estudo do Meio.",
      },
      { property: "og:title", content: "A minha aventura — Kidoz" },
      {
        property: "og:description",
        content:
          "Caminho de aprendizagem visual para Português, Matemática e Estudo do Meio do 1.º ciclo.",
      },
      { property: "og:url", content: "https://kidoz.online/app" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/app" }],
  }),
  component: AppHome,
  errorComponent: RouteError,
});

function AppHome() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  // Local-first: render imediato com o perfil em cache; cloud reconcilia em background.
  const { profile: fastProfile, loading } = useFastProfile();

  useEffect(() => {
    if (loading) return;
    if (!fastProfile || !fastProfile.name) {
      navigate({ to: "/comecar" });
      return;
    }
    if (fastProfile.role === "parent") {
      navigate({ to: "/pais" });
      return;
    }
    setProfile(fastProfile);
    // Sprites emocionais prontos antes de a criança entrar numa missão.
    prewarmMascotEmotions(fastProfile.mascot);
  }, [fastProfile, loading, navigate]);

  if (!profile) return <KidLoader mascotId={fastProfile?.mascot ?? null} />;
  const mascot = getMascot(profile.mascot);

  return (
    <div className="min-h-[100dvh] bg-background pb-28 md:pb-12">
      <TopBar profile={profile} />

      <main id="main-content" className="mx-auto max-w-[56rem] px-4 py-4 sm:py-6">
        <h1 className="sr-only">
          A minha aventura no Kidoz — caminho de aprendizagem de {profile.name}
        </h1>
        {/* Hero greeting */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative mb-5 overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-card to-accent/30 p-4 sm:p-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Mascot id={profile.mascot} size="md" bouncing equippedItemId={profile.equippedItem} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl sm:text-2xl">Olá, {profile.name}! ☀️</h2>
              <p className="text-sm text-muted-foreground">
                {profile.streak > 0
                  ? `🔥 ${profile.streak} ${profile.streak === 1 ? "dia seguido" : "dias seguidos"}!`
                  : mascot.encourage}
              </p>
            </div>
          </div>
        </motion.section>

        <SeasonalBanner region={profile.region ?? null} />

        {/* A ordem é deliberada — UMA coisa de cada vez:
            1. Missão do dia (o que fazer agora)
            2. Revisão Mágica (só quando há erros a rever)
            3. Caminho do capítulo ativo em cheio + restantes compactos
            4. Descobrir mais (tudo o resto, abaixo do aprendizado) */}
        <MissionOfTheDay completedLessons={profile.completedLessons} grade={profile.grade} />

        <RevisaoMagicCard />

        <FocusedPath profile={profile} />

        <DiscoverGrid profile={profile} />

        <AdaptiveTip />

        <p className="mt-10 text-center text-sm text-muted-foreground">
          ✨ Mais aventuras vão chegando à medida que avanças
        </p>
      </main>

      <BottomNav />
    </div>
  );
}

// Cartão "Revisão Mágica" — só aparece quando há erros de dias anteriores
// à espera de revisão (prática espaçada: o momento certo para a memória).
function RevisaoMagicCard() {
  const [due, setDue] = useState(0);
  useEffect(() => {
    setDue(countDue());
  }, []);
  if (due <= 0) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-4"
    >
      <Link
        to="/revisao"
        onClick={() => haptic("tap")}
        className="flex items-center gap-3"
        aria-label={`Revisão Mágica: ${due} perguntas para rever`}
      >
        <motion.span
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl"
        >
          🪄
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight">
            Revisão Mágica · {due} {due === 1 ? "pergunta" : "perguntas"}
          </p>
          <p className="text-sm text-muted-foreground">
            As que fugiram voltaram — treina e ganha +1 moeda cada!
          </p>
        </div>
        <span className="btn-chunky shrink-0 rounded-full bg-primary px-5 py-2.5 font-display text-sm text-primary-foreground shadow-md">
          Rever ✨
        </span>
      </Link>
    </motion.section>
  );
}

/**
 * Caminho focado: só o capítulo ativo (o primeiro com missões por fazer)
 * é renderizado em cheio — os restantes ficam em cartões compactos que
 * abrem a página do capítulo. Evita o scroll infinito de 12+ caminhos.
 */
function FocusedPath({ profile }: { profile: Profile }) {
  const visibleChapters = CHAPTERS.filter((c) => c.grade <= Math.min(4, profile.grade + 1));
  const completed = useMemo(() => new Set(profile.completedLessons), [profile.completedLessons]);
  const activeChapter = visibleChapters.find((ch) =>
    ch.missions.some((m) => !completed.has(m.lessonId)),
  );
  const others = visibleChapters.filter((ch) => ch.id !== activeChapter?.id);

  return (
    <div className="space-y-8">
      {activeChapter ? (
        <ChapterPath chapter={activeChapter} completedLessons={profile.completedLessons} />
      ) : (
        <div className="card-chunky rounded-3xl border-2 border-xp/40 bg-gradient-to-br from-xp/15 via-card to-accent/20 p-5 text-center">
          <p className="font-display text-xl">🏆 Completaste todas as missões!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora os mundos abaixo ou revê as tuas lições favoritas.
          </p>
        </div>
      )}

      {others.length > 0 && (
        <section aria-label="Mais capítulos">
          <h2 className="mb-3 font-display text-lg text-muted-foreground">Mais capítulos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {others.map((chapter) => (
              <CompactChapterCard
                key={chapter.id}
                chapter={chapter}
                completedLessons={profile.completedLessons}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CompactChapterCard({
  chapter,
  completedLessons,
}: {
  chapter: Chapter;
  completedLessons: string[];
}) {
  const done = chapter.missions.filter((m) => completedLessons.includes(m.lessonId)).length;
  const total = chapter.missions.length;
  const complete = done === total;
  return (
    <Link
      to="/capitulo/$chapterId"
      params={{ chapterId: chapter.id }}
      onClick={() => haptic("tap")}
      className="card-chunky flex items-center gap-3 rounded-3xl border-2 border-border p-3 transition-transform active:scale-[0.98]"
      style={{
        backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 10%, var(--card))`,
      }}
      aria-label={`Abrir capítulo ${chapter.title}: ${done} de ${total} missões completas`}
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{
          backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 22%, var(--card))`,
        }}
        aria-hidden
      >
        {chapter.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="truncate font-display text-base leading-tight"
          style={{ color: `var(${chapter.themeColorVar})` }}
        >
          {chapter.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{chapter.subtitle}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(done / total) * 100}%`,
                backgroundColor: `var(${chapter.themeColorVar})`,
              }}
            />
          </div>
          <span className="font-display text-[11px] tabular-nums text-muted-foreground">
            {done}/{total}
          </span>
        </div>
      </div>
      {complete ? (
        <Crown className="h-5 w-5 shrink-0 text-xp" aria-label="Capítulo completo" />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      )}
    </Link>
  );
}

/**
 * "Descobrir mais" — tudo o que existe na plataforma, numa grelha calma
 * abaixo do caminho de aprendizagem. Nada compete com a missão do dia.
 */
function DiscoverGrid({ profile }: { profile: Profile }) {
  const premium = isPremiumActive(profile);
  return (
    <section aria-label="Descobrir mais" className="mt-8">
      <h2 className="mb-3 font-display text-lg text-muted-foreground">Descobrir mais</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <DiscoverTile to="/amigo" emoji="🤖" title="O Meu Amigo" subtitle="Brinca e conversa" />
        <DiscoverTile
          to={premium ? "/portal" : "/convites"}
          emoji="🌀"
          title="Mundo Premium"
          subtitle={premium ? "5 reinos mágicos" : "Convita e ganha"}
        />
        <DiscoverTile
          to="/leitura"
          emoji="🎤"
          title="Ler em voz alta"
          subtitle="Praticar leitura"
        />
        <DiscoverTile to="/jardim" emoji="🌱" title="Jardim" subtitle="Missões que crescem" />
        <DiscoverTile to="/mundo" emoji="🏠" title="Meu Mundo" subtitle="Decorar o quarto" />
        <DiscoverTile to="/ra" emoji="🥽" title="Laboratório 3D" subtitle="Mascote em RA" />
      </div>
    </section>
  );
}

function DiscoverTile({
  to,
  emoji,
  title,
  subtitle,
}: {
  to: "/amigo" | "/portal" | "/convites" | "/leitura" | "/jardim" | "/mundo" | "/ra";
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="card-chunky flex min-h-[76px] flex-col justify-center gap-0.5 rounded-2xl border-2 border-border bg-card p-3 transition-transform active:scale-[0.97]"
    >
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <p className="truncate font-display text-sm leading-tight">{title}</p>
      <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
    </Link>
  );
}

function ChapterPath({
  chapter,
  completedLessons,
}: {
  chapter: Chapter;
  completedLessons: string[];
}) {
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
        style={{
          backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 14%, var(--card))`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm"
            style={{
              backgroundColor: `color-mix(in oklab, var(${chapter.themeColorVar}) 28%, var(--card))`,
            }}
          >
            {chapter.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Capítulo {chapter.number}
            </p>
            <h2
              className="font-display text-xl leading-tight"
              style={{ color: `var(${chapter.themeColorVar})` }}
            >
              {chapter.title}
            </h2>
            <p className="text-xs text-muted-foreground">{chapter.subtitle}</p>
          </div>
        </div>

        {/* Stars + colored progress bar (substitui 0/3) */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-0.5" aria-label={`${doneCount} de ${missions.length} estrelas`}>
            {missions.map((m, i) => (
              <Star
                key={m.lessonId}
                className={cn(
                  "h-4 w-4",
                  i < doneCount ? "fill-current text-xp" : "text-muted-foreground/40",
                )}
              />
            ))}
          </div>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(doneCount / missions.length) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: `var(${chapter.themeColorVar})` }}
            />
          </div>
          <span className="font-display text-xs font-bold tabular-nums">
            {doneCount}/{missions.length}
          </span>
        </div>
      </div>

      {/* Path of nodes */}
      <ol className="relative mx-auto max-w-[28rem]">
        {missions.map((mission, idx) => {
          const isDone = completed.has(mission.lessonId);
          const isActive = idx === activeIdx;
          const isLocked = idx > activeIdx;
          // Winding: alternate left / center / right
          const offset = ["-translate-x-12", "translate-x-0", "translate-x-12", "translate-x-0"][
            idx % 4
          ];
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
            aria-label={
              doneCount === missions.length ? "Capítulo completo" : "Troféu por desbloquear"
            }
          >
            <Crown
              className={cn(
                "h-7 w-7",
                doneCount === missions.length ? "text-xp" : "text-muted-foreground",
              )}
            />
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
          ? {
              backgroundColor: color,
              boxShadow: `0 6px 0 0 color-mix(in oklab, ${color} 60%, black)`,
            }
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
      <div
        className="flex flex-col items-center gap-1.5"
        aria-label={`${mission.title} (bloqueado)`}
      >
        {node}
        <p className="max-w-[140px] text-center font-display text-[11px] text-muted-foreground">
          {mission.title}
        </p>
      </div>
    );
  }

  return (
    <Link
      to="/licao/$subjectId/$lessonId"
      params={{ subjectId: mission.subjectId, lessonId: mission.lessonId }}
      search={{}}
      onClick={() => haptic(state === "active" ? "celebrate" : "tap")}
      className="flex flex-col items-center gap-1.5"
      aria-label={`Iniciar missão: ${mission.title}`}
    >
      {node}
      <p className="max-w-[160px] text-center font-display text-xs leading-tight">
        {mission.title}
      </p>
    </Link>
  );
}
