import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { Mascot } from "@/components/Mascot";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { getMascot } from "@/lib/mascots";
import { haptic } from "@/lib/haptics";
import { isPremiumActive, premiumDaysLeft } from "@/lib/premium";
import {
  REALMS,
  loadPortalState,
  tourAvailable,
  type PortalState,
  type RealmDef,
} from "@/lib/premiumWorld";
import { RealmGame } from "@/components/portal/RealmGames";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Crown, Sparkles, Lock, ArrowLeft, Gift } from "lucide-react";
import { RouteError } from "@/components/RouteError";
import { KidLoader } from "@/components/KidLoader";

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
  const [activeRealm, setActiveRealm] = useState<RealmDef | null>(null);
  const [demoRealm, setDemoRealm] = useState<RealmDef | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return;
      }
      setProfile(p);
      if (!localStorage.getItem("kidoz-portal-seen")) {
        setFirstVisit(true);
        localStorage.setItem("kidoz-portal-seen", "1");
        setTimeout(() => setFirstVisit(false), 4200);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const premium = useMemo(() => isPremiumActive(profile), [profile]);
  const canTour = useMemo(() => tourAvailable(), []);

  if (!profile) return <KidLoader />;
  const mascot = getMascot(profile.mascot);
  const daysLeft = premiumDaysLeft(profile);

  const play = (realm: RealmDef, demo = false) => {
    haptic(demo ? "tap" : "celebrate");
    if (demo) setDemoRealm(realm);
    else {
      setActiveRealm(realm);
      setGameKey((k) => k + 1);
    }
  };

  const exitGame = () => {
    setActiveRealm(null);
    setDemoRealm(null);
    setState(loadPortalState());
    setProfile(loadProfile());
  };

  // ── Jogo ativo (full-screen overlay) ──
  if (activeRealm) {
    return <RealmGame key={gameKey} realm={activeRealm} grade={profile.grade} onExit={exitGame} />;
  }
  if (demoRealm) {
    return <RealmGame key="demo" realm={demoRealm} grade={profile.grade} demo onExit={exitGame} />;
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

            {/* Contadores do Passaporte */}
            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              {[
                { n: `✦ ${state.crystals}`, l: "cristais" },
                {
                  n: String(REALMS.filter((r) => (state.best[r.id] ?? 0) >= r.questions).length),
                  l: "reinos 100%",
                },
                { n: `🐉 ${state.dragonSlain}`, l: "dragões" },
                { n: `🔑 ${state.keysGolden}`, l: "chaves" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/15 bg-white/5 p-2">
                  <p className="font-display text-base text-amber-200 sm:text-lg">{s.n}</p>
                  <p className="text-[10px] text-white/60">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Mascote guia */}
          <section className="mt-4 flex items-center gap-3 rounded-3xl border border-white/15 bg-white/5 p-3 backdrop-blur">
            <Mascot id={profile.mascot} size="md" bouncing equippedItemId={profile.equippedItem} />
            <p className="text-sm text-white/85">
              {premium
                ? `${mascot.encourage} Escolhe um reino e boa sorte! ✦`
                : "Toca numa ilha para experimentares a Visita Guiada grátis! 👇"}
            </p>
          </section>

          {/* Mapa dos reinos */}
          <section aria-label="Mapa dos reinos" className="relative mt-6">
            <div className="mx-auto grid max-w-[34rem] gap-5">
              {REALMS.map((realm, i) => {
                const best = state.best[realm.id] ?? 0;
                const mastered = best >= realm.questions;
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
                        mastered ? "border-amber-300/60" : "border-white/25"
                      } backdrop-blur-xl`}
                    >
                      {mastered && (
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
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(realm.questions)].map((_, j) => (
                            <span
                              key={j}
                              className={`h-1.5 w-4 rounded-full ${
                                j < best ? "bg-amber-300" : "bg-white/20"
                              }`}
                            />
                          ))}
                          <span className="ml-1 font-display text-[11px] text-white/70">
                            recorde {best}/{realm.questions}
                          </span>
                        </div>
                        {premium ? (
                          <ChunkyButton
                            onClick={() => play(realm)}
                            className="min-h-[46px] shrink-0 px-4 text-sm"
                          >
                            <Sparkles className="mr-1 inline h-4 w-4" /> Jogar
                          </ChunkyButton>
                        ) : playable ? (
                          <ChunkyButton
                            onClick={() => play(realm, true)}
                            className="min-h-[46px] shrink-0 px-3 text-sm"
                          >
                            <Sparkles className="mr-1 inline h-4 w-4" /> Visita guiada
                          </ChunkyButton>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 font-display text-xs text-white/70">
                            <Lock className="h-3.5 w-3.5" /> Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Rodapé para pais */}
          <section className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-5 text-center backdrop-blur">
            <p className="font-display text-sm text-white/80">
              💜 <b>Para os pais:</b> os reinos do Mundo Premium usam o mesmo currículo do 1.º ciclo
              — cada pergunta conta para o progresso, relatórios e conquistas da criança. Sem
              anúncios, sempre seguro.
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

      {/* Confetti na entrada */}
      {firstVisit && <ConfettiCelebration show durationMs={3800} type="chapter-complete" />}
    </div>
  );
}
