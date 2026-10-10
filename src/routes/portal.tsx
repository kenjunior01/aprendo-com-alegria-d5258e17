import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { Mascot } from "@/components/Mascot";
import { loadProfile, type Profile } from "@/lib/storage";
import { localProfile, refreshProfile } from "@/lib/profileFast";
import { getMascot } from "@/lib/mascots";
import { haptic } from "@/lib/haptics";
import { playPortal, playLevelUp } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { isPremiumActive, premiumDaysLeft } from "@/lib/premium";
import {
  REALMS,
  REALM_LEVELS,
  CREATURES,
  loadPortalState,
  tourAvailable,
  levelUnlocked,
  totalStars,
  buySupply,
  buyCreature,
  consumeSupply,
  equipCreature,
  getCreature,
  addCrystals,
  type PortalState,
  type RealmDef,
  type SupplyKey,
  type CreatureDef,
} from "@/lib/premiumWorld";
import { claimPortalQuest, todayQuests, type PortalQuest } from "@/lib/portalDaily";
import { RealmGame } from "@/components/portal/RealmGames";
import { CrystalBazaar } from "@/components/portal/CrystalBazaar";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Crown, Sparkles, Lock, ArrowLeft, Gift } from "lucide-react";
import { RouteError } from "@/components/RouteError";
import { KidLoader } from "@/components/KidLoader";
import { toast } from "sonner";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Mundo Premium — Portal Mágico Kidoz" },
      {
        name: "description",
        content:
          "O Mundo Kidoz Premium: 5 reinos mágicos — Vulcão dos Números, Galáxia do Saber, Laboratório Mágico, Castelo das Palavras e a Caverna do Dragão.",
      },
      { property: "og:title", content: "Mundo Premium — Portal Mágico Kidoz" },
      {
        property: "og:description",
        content: "5 reinos mágicos exclusivos que juntam quizzes, coleções e aventura.",
      },
      { property: "og:url", content: "https://kidoz.online/portal" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/portal" }],
  }),
  component: PortalPage,
  errorComponent: RouteError,
});

function PortalPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState<PortalState>(() => loadPortalState());
  const [daily, setDaily] = useState(() => todayQuests());
  const [activeRealm, setActiveRealm] = useState<RealmDef | null>(null);
  const [activeLevel, setActiveLevel] = useState(0);
  const [gameSeed, setGameSeed] = useState(0);
  const [demoRealm, setDemoRealm] = useState<RealmDef | null>(null);
  const [bazaarOpen, setBazaarOpen] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const apply = (p: Profile | null) => {
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return false;
      }
      setProfile(p);
      if (!localStorage.getItem("kidoz-portal-seen")) {
        setFirstVisit(true);
        playPortal();
        localStorage.setItem("kidoz-portal-seen", "1");
        setTimeout(() => setFirstVisit(false), 4200);
      }
      return true;
    };
    // Local-first: render imediato; cloud reconcilia em background.
    const local = localProfile();
    if (local) {
      apply(local);
      void refreshProfile().then((cloud) => {
        if (!cancelled && cloud && cloud.name) apply(cloud);
      });
    } else {
      void refreshProfile().then((cloud) => {
        if (cancelled) return;
        apply(cloud ?? loadProfile());
      });
    }
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const premium = useMemo(() => isPremiumActive(profile), [profile]);
  const canTour = useMemo(() => tourAvailable(), []);
  const dailyAllClaimed =
    daily.quests.length > 0 && daily.quests.every((q) => daily.state.claimed.includes(q.id));

  if (!profile) return <KidLoader />;
  const mascot = getMascot(profile.mascot);
  const daysLeft = premiumDaysLeft(profile);
  // Premium ganho por convites (não compra) a acabar → loop de renovação por convites.
  const inviteExpiring = !profile.isPremium && premium && daysLeft > 0 && daysLeft <= 5;

  const play = (realm: RealmDef, levelIdx = 0, demo = false) => {
    haptic(demo ? "tap" : "celebrate");
    playPortal();
    if (demo) setDemoRealm(realm);
    else {
      setActiveRealm(realm);
      setActiveLevel(levelIdx);
      setGameSeed(Math.floor(Math.random() * 100_000));
      setGameKey((k) => k + 1);
    }
  };

  const exitGame = () => {
    setActiveRealm(null);
    setDemoRealm(null);
    setState(loadPortalState());
    setProfile(loadProfile());
    setDaily(todayQuests()); // refresca o progresso das missões de hoje
  };

  const doClaim = (quest: PortalQuest) => {
    const r = claimPortalQuest(quest.id);
    if (r.ok) {
      haptic("celebrate");
      playLevelUp();
      if (r.reward) setState(addCrystals(r.reward));
      setDaily(todayQuests());
      toast.success(`+${r.reward} ✦ — missão cumprida!`);
      if (r.allDone) {
        setTimeout(
          () => toast.success("🔥 Todas as missões de hoje concluídas!", { duration: 4000 }),
          900,
        );
      }
    } else if (r.reason === "claimed") {
      toast.info("Já reclamaste esta missão hoje!");
    } else {
      toast.info("Termina a missão primeiro — joga um reino! ✦");
    }
  };

  const nextLevel = () => {
    if (!activeRealm) return;
    play(activeRealm, Math.min(2, activeLevel + 1));
  };

  const useSupply = (kind: SupplyKey) => {
    setState(consumeSupply(kind));
  };

  const doBuySupply = (key: SupplyKey, price: number) => {
    const r = buySupply(key, price);
    if (r.ok) {
      setState(r.state);
      setDaily(todayQuests()); // missão "Visita ao Bazar" atualiza já
    } else toast.error("Não tens cristais suficientes — joga um reino! ✦");
  };

  const doBuyCreature = (c: CreatureDef) => {
    const r = buyCreature(c);
    if (r.ok) {
      setState(r.state);
      setDaily(todayQuests());
      toast.success(`${c.emoji} ${c.name} juntou-se à tua aventura!`);
    } else if (r.reason === "nocredits") {
      toast.error("Não tens cristais suficientes — joga um reino! ✦");
    }
  };

  const doEquip = (id: string | null) => {
    setState(equipCreature(id));
  };

  // ── Jogo ativo (full-screen overlay) ──
  if (activeRealm) {
    return (
      <RealmGame
        key={gameKey}
        realm={activeRealm}
        grade={profile?.grade ?? 1}
        levelIdx={activeLevel}
        seed={gameSeed}
        supplies={state.supplies}
        perks={{
          startShield: getCreature(state.equippedCreature)?.perkKey === "startShield",
          freeHint: getCreature(state.equippedCreature)?.perkKey === "freeHint",
        }}
        mascotId={profile.mascot}
        creatureEmoji={getCreature(state.equippedCreature)?.emoji ?? null}
        onUseSupply={useSupply}
        onExit={exitGame}
        onNextLevel={nextLevel}
      />
    );
  }
  if (demoRealm) {
    return (
      <RealmGame
        key="demo"
        realm={demoRealm}
        grade={profile?.grade ?? 1}
        levelIdx={0}
        seed={0}
        demo
        mascotId={profile.mascot}
        creatureEmoji={getCreature(state.equippedCreature)?.emoji ?? null}
        onExit={exitGame}
      />
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0b1030] pb-24 md:pb-12">
      {/* Céu estrelado de fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 rounded-full bg-white"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 67) % 100}%`,
              width: i % 7 === 0 ? 3 : 1.5,
              height: i % 7 === 0 ? 3 : 1.5,
            }}
            animate={{ opacity: [0.1, 0.9, 0.1] }}
            transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute left-[8%] top-[12%] text-3xl opacity-40"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute right-[10%] top-[22%] text-3xl opacity-30"
        >
          ☁️
        </motion.div>
      </div>

      <div className="relative z-10">
        <TopBar profile={profile} />

        {/* Primeira visita: entrada espectacular pelo portal */}
        <AnimatePresence>
          {firstVisit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1030]"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto mb-4 h-40 w-40 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#ec4899,#f59e0b,#10b981,#8b5cf6)] p-1.5 shadow-[0_0_80px_20px_rgba(139,92,246,0.55)]"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b1030]">
                    <span className="text-6xl">🌀</span>
                  </div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="font-display text-3xl text-white"
                >
                  O Portal está a abrir…
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                  className="mt-1 font-display text-sm text-violet-300"
                >
                  Bem-vindo ao Mundo Kidoz Premium ✨
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main id="main-content" className="mx-auto max-w-[52rem] px-4 py-5 sm:py-7">
          <Link
            to="/perfil"
            className="mb-3 inline-flex items-center gap-1 text-sm font-display text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Perfil
          </Link>

          {/* Cabeçalho mágico */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/5 p-5 text-center backdrop-blur-xl sm:p-7"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto h-24 w-24 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#ec4899,#f59e0b,#10b981,#8b5cf6)] p-1 shadow-[0_0_50px_10px_rgba(139,92,246,0.45)]"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b1030]">
                <span className="text-4xl">🌀</span>
              </div>
            </motion.div>
            <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">
              Mundo Kidoz Premium
            </h1>
            <p className="mx-auto mt-1 max-w-[36rem] text-sm text-violet-200/90">
              Um mundo que não existe em mais nenhum jogo: 5 reinos onde quizzes viram erupções,
              viagens espaciais, poções, castelos iluminados e batalhas contra o dragão.
            </p>

            {/* Estado premium */}
            {premium ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400/30 to-yellow-300/30 px-4 py-1.5 font-display text-sm text-amber-200">
                  <Crown className="h-4 w-4" /> Premium ativo
                  {daysLeft > 0 && profile.premiumUntil && !profile.isPremium
                    ? ` · ${daysLeft} dia${daysLeft === 1 ? "" : "s"} restantes`
                    : ""}
                </span>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Link to="/premium">
                  <ChunkyButton>
                    <Crown className="mr-1 inline h-4 w-4" /> Abrir o Mundo completo
                  </ChunkyButton>
                </Link>
                <Link to="/convites">
                  <ChunkyButton tone="secondary">
                    <Gift className="mr-1 inline h-4 w-4" /> Ou ganha 7 dias grátis
                  </ChunkyButton>
                </Link>
              </div>
            )}

            {/* Título ativo */}
            {state.activeTitle && (
              <p className="mt-1 font-display text-sm text-violet-300">
                🏅 <b>{state.activeTitle}</b>
              </p>
            )}

            {/* Contadores do Passaporte */}
            <div className="mt-5 grid grid-cols-5 gap-1.5 text-center sm:gap-2">
              {[
                { n: `✦ ${state.crystals}`, l: "cristais" },
                { n: `⭐ ${totalStars(state)}`, l: "estrelas" },
                {
                  n: String(
                    REALMS.filter((r) => {
                      const st = state.stars[r.id] ?? [];
                      return st.length === 3 && st.every((s) => s >= 1);
                    }).length,
                  ),
                  l: "reinos 100%",
                },
                { n: `🐉 ${state.dragonSlain}`, l: "dragões" },
                { n: `🐾 ${state.creatures.length}/${CREATURES.length}`, l: "criaturas" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/15 bg-white/5 p-2">
                  <p className="font-display text-sm text-amber-200 sm:text-lg">{s.n}</p>
                  <p className="text-[9px] text-white/60 sm:text-[10px]">{s.l}</p>
                </div>
              ))}
            </div>

            {/* Bazar dos Cristais */}
            <div className="mt-4 flex justify-center">
              <ChunkyButton
                tone="secondary"
                onClick={() => {
                  haptic("tap");
                  setBazaarOpen(true);
                }}
                className="min-h-[48px] px-5"
              >
                💎 Bazar dos Cristais
                <span className="ml-1 rounded-full bg-black/30 px-2 py-0.5 text-xs text-amber-200">
                  {state.crystals} ✦
                </span>
              </ChunkyButton>
            </div>
          </motion.section>

          {/* Mascote guia + criatura companheira */}
          <section className="mt-4 flex items-center gap-3 rounded-3xl border border-white/15 bg-white/5 p-3 backdrop-blur">
            <Mascot id={profile.mascot} size="md" bouncing equippedItemId={profile.equippedItem} />
            {getCreature(state.equippedCreature) && (
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0, y: [0, -5, 0] }}
                transition={{
                  scale: { type: "spring", stiffness: 260, damping: 14 },
                  y: { duration: 2, repeat: Infinity },
                }}
                title={getCreature(state.equippedCreature)!.name}
                className="text-3xl drop-shadow-lg"
              >
                {getCreature(state.equippedCreature)!.emoji}
              </motion.span>
            )}
            <p className="text-sm text-white/85">
              {premium
                ? dailyAllClaimed
                  ? "Missões de hoje concluídas — és incrível! Volta amanhã por mais! 🔥"
                  : "As Missões do Portal esperam por ti. Escolhe um reino! ✦"
                : "Toca numa ilha para experimentares a Visita Guiada grátis! 👇"}
            </p>
          </section>

          {/* Renovação por convites: Premium de convite a acabar */}
          {inviteExpiring && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-3xl border border-amber-300/40 bg-gradient-to-r from-amber-500/25 via-orange-400/20 to-rose-400/25 p-4 backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-base text-white">
                    ⏳ O teu Premium acaba em {daysLeft} dia{daysLeft === 1 ? "" : "s"}!
                  </h2>
                  <p className="mt-0.5 text-xs text-white/75">
                    Convida mais amigos pelo WhatsApp e ganha +7 dias por cada 3 — o Mundo continua
                    a abrir! 🎁
                  </p>
                </div>
                <Link to="/convites">
                  <ChunkyButton tone="primary" className="shrink-0">
                    🎁 Convida & Ganha
                  </ChunkyButton>
                </Link>
              </div>
            </motion.section>
          )}

          {/* Missões Diárias do Portal */}
          <section className="mt-4 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg text-white">🎯 Missões do Portal</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/30 to-amber-400/30 px-3 py-1 font-display text-xs text-amber-200">
                🔥 {daily.state.streak} dia{daily.state.streak === 1 ? "" : "s"} seguidos
              </span>
            </div>
            <p className="mt-1 text-xs text-white/60">
              Volta todos os dias — missões novas à meia-noite e a chama 🔥 cresce!
            </p>
            <div className="mt-3 grid gap-2">
              {daily.quests.map((q) => {
                const prog = Math.min(daily.state.progress[q.id] ?? 0, q.target);
                const done = prog >= q.target;
                const claimed = daily.state.claimed.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                      claimed
                        ? "border-emerald-300/40 bg-emerald-400/10"
                        : done
                          ? "border-amber-300/50 bg-amber-400/10"
                          : "border-white/15 bg-white/5",
                    )}
                  >
                    <span className="shrink-0 text-2xl">{q.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm text-white">{q.title}</p>
                      <p className="text-[11px] text-white/60">{q.desc}</p>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(prog / q.target) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className={cn(
                            "h-full rounded-full",
                            done
                              ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                              : "bg-gradient-to-r from-violet-400 to-fuchsia-300",
                          )}
                        />
                      </div>
                    </div>
                    {claimed ? (
                      <span className="shrink-0 rounded-xl bg-emerald-400/20 px-2 py-1 font-display text-[10px] text-emerald-200">
                        ✓ feito
                      </span>
                    ) : done ? (
                      <ChunkyButton onClick={() => doClaim(q)} className="shrink-0 px-2.5 text-xs">
                        +{q.reward} ✦
                      </ChunkyButton>
                    ) : (
                      <span className="shrink-0 font-display text-[10px] tabular-nums text-white/50">
                        {prog}/{q.target}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mapa dos reinos */}
          <section aria-label="Mapa dos reinos" className="relative mt-6">
            <div className="mx-auto grid max-w-[34rem] gap-5">
              {REALMS.map((realm, i) => {
                const stars = state.stars[realm.id] ?? [0, 0, 0];
                const allMastered = stars.every((s) => s >= 1);
                const offset = [
                  "md:-translate-x-6",
                  "md:translate-x-6",
                  "md:-translate-x-4",
                  "md:translate-x-4",
                  "md:translate-x-0",
                ][i];
                const playable = premium || (canTour && !state.crystals);
                return (
                  <motion.div
                    key={realm.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.06 }}
                    className={offset}
                  >
                    <div
                      className={`card-chunky relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br p-4 sm:p-5 ${realm.gradient} ${
                        allMastered ? "border-amber-300/60" : "border-white/25"
                      } backdrop-blur-xl`}
                    >
                      {allMastered && (
                        <span className="absolute right-3 top-3 rounded-full bg-amber-400/90 px-2 py-0.5 font-display text-[10px] font-black text-amber-950">
                          ★ DOMADO
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2.4 + i * 0.3, repeat: Infinity }}
                          className="text-5xl drop-shadow-lg"
                        >
                          {realm.emoji}
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg text-white sm:text-xl">{realm.name}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                            {realm.tagline}
                          </p>
                          <p className="mt-1 text-sm text-white/80">{realm.desc}</p>
                        </div>
                      </div>
                      {/* Seletor de níveis Bronze / Prata / Ouro */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {REALM_LEVELS.map((lvl, li) => {
                          const unlocked = levelUnlocked(state, realm, li);
                          const st = stars[li] ?? 0;
                          const emoji = li === 0 ? "🥉" : li === 1 ? "🥈" : "🥇";
                          return (
                            <button
                              key={lvl.key}
                              onClick={() => {
                                if (!premium) {
                                  if (playable) play(realm, 0, true);
                                  return;
                                }
                                if (!unlocked) {
                                  haptic("error");
                                  toast.info(
                                    li === 1
                                      ? "Ganha pelo menos 1 ★ no Bronze para abrir o Prata!"
                                      : "Ganha pelo menos 1 ★ no Prata para abrir o Ouro!",
                                  );
                                  return;
                                }
                                play(realm, li);
                              }}
                              className={`relative rounded-2xl border-2 px-2 py-2 text-center backdrop-blur transition-transform active:scale-95 ${
                                unlocked && (premium || playable)
                                  ? "border-white/40 bg-white/15 hover:bg-white/25"
                                  : "border-white/15 bg-white/5"
                              }`}
                            >
                              <p className="font-display text-xs text-white">
                                {emoji} {lvl.name}
                              </p>
                              <p className="text-[10px] tracking-wide text-amber-200">
                                {"★".repeat(st)}
                                {"☆".repeat(3 - st)}
                              </p>
                              {!unlocked && (
                                <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-white/50" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {!premium && (
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <p className="text-xs text-white/70">
                            {playable
                              ? "Visita guiada grátis · sem prémios"
                              : "O Mundo completo tem os 3 níveis e prémios"}
                          </p>
                          {playable ? (
                            <ChunkyButton
                              onClick={() => play(realm, 0, true)}
                              className="min-h-[42px] shrink-0 px-3 text-xs"
                            >
                              <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Experimentar
                            </ChunkyButton>
                          ) : (
                            <Link to="/premium" className="shrink-0">
                              <span className="inline-flex items-center gap-1 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 font-display text-xs text-white/70">
                                <Lock className="h-3.5 w-3.5" /> Bloqueado
                              </span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Álbum do Aventureiro */}
          <section className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <h2 className="text-center font-display text-xl text-white">📖 Álbum do Aventureiro</h2>
            <p className="mt-1 text-center text-xs text-white/60">
              Tudo o que já conquistaste no Mundo Premium
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                <p className="font-display text-xl text-amber-200">⭐ {totalStars(state)}/45</p>
                <p className="text-[10px] text-white/60">estrelas</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                <p className="font-display text-xl text-emerald-200">
                  🧪 {state.discoveries.length}/6
                </p>
                <p className="text-[10px] text-white/60">poções</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                <p className="font-display text-xl text-sky-200">🔑 {state.keysGolden}</p>
                <p className="text-[10px] text-white/60">chaves douradas</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                <p className="font-display text-xl text-rose-200">🐉 {state.dragonSlain}</p>
                <p className="text-[10px] text-white/60">dragões</p>
              </div>
            </div>
            {/* Poções descobertas */}
            <p className="mt-4 font-display text-sm text-white/80">Diário do Laboratório 🧪</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {state.discoveries.length === 0 && (
                <p className="text-xs text-white/50">
                  Ainda sem poções — acerta em 60% das perguntas do Laboratório!
                </p>
              )}
              {state.discoveries.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 font-display text-xs text-emerald-100"
                >
                  {d}
                </span>
              ))}
            </div>
            {/* Criaturas */}
            <p className="mt-4 font-display text-sm text-white/80">Criaturas 🐾</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CREATURES.map((c) => {
                const owned = state.creatures.includes(c.id);
                return (
                  <span
                    key={c.id}
                    title={owned ? `${c.name} — ${c.perk}` : `${c.name}? Adota-a no Bazar!`}
                    className={`inline-flex items-center gap-1 rounded-2xl border px-2.5 py-1 text-xs ${
                      owned
                        ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
                        : "border-white/10 bg-white/5 text-white/40 grayscale"
                    }`}
                  >
                    <span className="text-base">{c.emoji}</span>
                    {owned ? c.name : "???"}
                  </span>
                );
              })}
            </div>
            {/* Títulos */}
            {state.titles.length > 0 && (
              <>
                <p className="mt-4 font-display text-sm text-white/80">Títulos 🏅</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {state.titles.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-violet-300/40 bg-violet-400/15 px-3 py-1 font-display text-xs text-violet-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Rodapé para pais */}
          <section className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-5 text-center backdrop-blur">
            <p className="font-display text-sm text-white/80">
              💜 <b>Para os pais:</b> os reinos do Mundo Premium usam o mesmo currículo do 1.º ciclo
              — cada pergunta conta para o progresso, relatórios e conquistas da criança. As missões
              diárias criam o hábito de ~10 minutos de prática estruturada por dia. Sem anúncios,
              sempre seguro.
            </p>
            <Link
              to="/premium"
              className="mt-2 inline-block font-display text-sm text-violet-300 underline underline-offset-2"
            >
              Ver tudo o que o Premium inclui →
            </Link>
          </section>
        </main>
        <BottomNav />
      </div>

      {/* Bazar dos Cristais */}
      <CrystalBazaar
        open={bazaarOpen}
        onClose={() => setBazaarOpen(false)}
        state={state}
        onBuySupply={doBuySupply}
        onBuyCreature={doBuyCreature}
        onEquip={doEquip}
      />

      {/* Confetti na entrada */}
      {firstVisit && <ConfettiCelebration show durationMs={3800} type="chapter-complete" />}
    </div>
  );
}
