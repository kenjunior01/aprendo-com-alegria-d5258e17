// /desafio — página de destino dos Desafios Expressos partilhados por link
// (WhatsApp etc.). Funciona SEM conta: decodifica o payload do URL e
// lança a lição/desafio infinito direto. 100% client-side.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Home, Swords, Star, Target } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MascotIcon } from "@/components/MascotIcon";
import { RouteError } from "@/components/RouteError";
import { decodeChallenge, cleanName, type ChallengePayload } from "@/lib/challengeShare";
import { getLesson, getSubject } from "@/lib/curriculum";
import { TRACKS } from "@/lib/infiniteChallenges";
import { playTap, speak } from "@/lib/audio";
import { haptic } from "@/lib/haptics";

export const Route = createFileRoute("/desafio")({
  head: () => ({
    meta: [
      { title: "Desafio Expresso — Kidoz" },
      {
        name: "description",
        content: "Alguém desafiou-te para um desafio Kidoz! Aceita e joga agora — sem conta.",
      },
      { property: "og:title", content: "Fui desafiado no Kidoz! ⚡" },
      {
        property: "og:description",
        content: "Aceita o desafio e joga agora — é grátis e sem conta.",
      },
      { property: "og:url", content: "https://kidoz.online/desafio" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/desafio" }],
  }),
  validateSearch: (search: Record<string, unknown>): { p?: string } => {
    const out: { p?: string } = {};
    if (typeof search.p === "string" && search.p.length < 600) out.p = search.p;
    return out;
  },
  component: DesafioLanding,
  errorComponent: RouteError,
});

function DesafioLanding() {
  const { p } = Route.useSearch();
  const navigate = useNavigate();
  const payload = useMemo<ChallengePayload | null>(() => (p ? decodeChallenge(p) : null), [p]);

  const info = useMemo(() => {
    if (!payload) return null;
    if (payload.k === "lesson") {
      const lesson = getLesson(payload.s, payload.l);
      const subject = getSubject(payload.s);
      return {
        emoji: subject?.emoji ?? "📚",
        title: lesson ? lesson.title : "Lição mistério",
        subtitle: subject?.name ?? "Desafio de lição",
        beat: payload.c !== undefined ? `${payload.c}%` : null,
        beatLabel: "Pontuação a bater",
      };
    }
    const track = TRACKS.find((t) => t.id === payload.t);
    return {
      emoji: track?.emoji ?? "⚡",
      title: track ? `${track.name} — Nível ${payload.l}` : "Desafio Infinito",
      subtitle: "Desafios Infinitos",
      beat: payload.s !== undefined ? `${payload.s} ★` : null,
      beatLabel: "Estrelas a bater",
    };
  }, [payload]);

  const accept = () => {
    if (!payload) return;
    haptic("success");
    playTap();
    if (payload.k === "lesson") {
      speak("Desafio aceite! Vamos lá!", { pitch: 1.2 });
      void navigate({
        to: "/licao/$subjectId/$lessonId",
        params: { subjectId: payload.s, lessonId: payload.l },
        search: {},
      });
    } else {
      speak("Desafio aceite! Boa sorte!", { pitch: 1.2 });
      void navigate({ to: "/desafios/infinitos" });
    }
  };

  // ─── Link inválido ───
  if (!payload || !info) {
    return (
      <main className="bg-paper flex min-h-[100dvh] flex-col items-center justify-center px-5 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <span className="text-7xl">🤔</span>
          <h1 className="mt-4 font-display text-3xl font-bold">Desafio inválido</h1>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Este link de desafio está incompleto ou já expirou. Pede um desafio novo ao teu amigo!
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link to="/desafios">
              <ChunkyButton tone="primary">
                <Swords className="mr-2 inline h-5 w-5" /> Ver desafios
              </ChunkyButton>
            </Link>
            <Link to="/" className="text-sm font-semibold text-primary hover:underline">
              <Home className="mr-1 inline h-4 w-4" /> Página inicial
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  const challenger = cleanName(payload.n);

  return (
    <main className="bg-sky-island relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-10">
      {/* brilhos de fundo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary">
          ⚡ Desafio Expresso ⚡
        </p>

        {/* Desafiante */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 12 }}
          className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-card shadow-xl"
        >
          <MascotIcon id={payload.m ?? "fox"} size={64} animated />
        </motion.div>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {challenger} desafiou-te!
        </h1>

        {/* Cartão do desafio */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-chunky mt-6 rounded-3xl border-2 border-border bg-card p-5 shadow-soft"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
              {info.emoji}
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate font-display text-xl font-bold">{info.title}</p>
              <p className="text-sm text-muted-foreground">{info.subtitle}</p>
            </div>
          </div>
          {info.beat && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 14 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-streak/10 px-4 py-2.5 font-display font-bold text-streak"
            >
              {payload.k === "infinite" ? (
                <Star className="h-5 w-5 fill-current" />
              ) : (
                <Target className="h-5 w-5" />
              )}
              {info.beatLabel}: <span className="text-lg">{info.beat}</span>
            </motion.div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6 flex flex-col gap-3"
        >
          <ChunkyButton tone="success" onClick={accept} className="w-full text-xl">
            Aceitar desafio <ArrowRight className="ml-2 inline h-6 w-6" />
          </ChunkyButton>
          <p className="text-xs text-muted-foreground">
            Grátis, sem conta. Joga e bate{" "}
            {payload.k === "infinite" ? "as estrelas" : "a pontuação"} do {challenger}!
          </p>
          <Link to="/" className="mt-2 text-sm font-semibold text-primary hover:underline">
            <Home className="mr-1 inline h-4 w-4" /> Conhecer a Kidoz
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
