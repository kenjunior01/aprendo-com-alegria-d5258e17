import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { loadProfile, updateProfile, type Profile } from "@/lib/storage";
import { isPremium } from "@/lib/premium";
import { LAB_MISSIONS, checkAnswer, type LabMission } from "@/lib/labMissions";
import { ArrowLeft, Camera, Sparkles, Lock, FlaskConical, Target, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteError } from "@/components/RouteError";

type LabModelId = "astronaut" | "robot" | "horse" | "helmet" | "duck" | "fox-3d";

const LAB_MODELS: { id: LabModelId; src: string; label: string; fact: string }[] = [
  { id: "astronaut", src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    label: "🚀 Astronauta no Espaço",
    fact: "Os astronautas flutuam porque na Estação Espacial estão em queda livre à volta da Terra." },
  { id: "robot", src: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    label: "🤖 Robot Expressivo",
    fact: "Os robots seguem instruções (programas). Tu também podes aprender a programar!" },
  { id: "horse", src: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    label: "🐎 Cavalo a Galopar",
    fact: "Um cavalo pode correr até 70 km/h — quase tão rápido como um carro na cidade!" },
  { id: "helmet", src: "https://modelviewer.dev/shared-assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf",
    label: "🪖 Capacete Antigo",
    fact: "Capacetes protegem a cabeça. Usa sempre quando andas de bicicleta!" },
  { id: "duck", src: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    label: "🦆 Pato Amigo",
    fact: "Os patos têm penas impermeáveis — a água escorre sem os molhar." },
  { id: "fox-3d", src: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb",
    label: "🦊 Raposa Curiosa",
    fact: "As raposas comunicam com mais de 40 sons diferentes!" },
];

// @ts-ignore TanStack Router file-route type resolution
export const Route = createFileRoute("/ra")({
  head: () => ({
    meta: [
      { title: "Realidade Aumentada — Kidoz" },
      { name: "description", content: "Vê os mascotes do Kidoz no teu mundo real, em 3D!" },
      { property: "og:title", content: 'Realidade Aumentada — Kidoz' },
      { property: "og:description", content: 'Vê os mascotes do Kidoz no teu mundo real, em 3D.' },
      { property: "og:url", content: "https://kidoz.online/ra" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/ra" },
    ],
  }),
  component: ARPage,
  errorComponent: RouteError,
});

// Modelos 3D públicos (animados) — Khronos / Google sample assets, sem chave de API.
const MODELS: Record<MascotId, { src: string; label: string }> = {
  fox: {
    src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    label: "Faísca, em modo astronauta",
  },
  owl: {
    src: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    label: "Mocha, a coruja sábia (robot dançarino)",
  },
  bunny: {
    src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    label: "Pipoca, a coelhinha exploradora",
  },
  turtle: {
    src: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    label: "Tito, devagar e sempre",
  },
};

function ARPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<"mascot" | "lab" | "missions">("mascot");
  const [selected, setSelected] = useState<MascotId>("fox");
  const [labSelected, setLabSelected] = useState<LabModelId>("astronaut");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
    setSelected(p.mascot);
    // Load model-viewer Web Component once
    if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, [navigate]);

  if (!profile) return (
    <main id="main-content" className="flex min-h-[60dvh] items-center justify-center">
      <p className="animate-pulse font-display text-lg text-muted-foreground" role="status" aria-live="polite">A carregar…</p>
    </main>
  );
  const premium = isPremium(profile);
  const mascotModel = MODELS[selected];
  const labModel = LAB_MODELS.find((m) => m.id === labSelected)!;
  const activeSrc = tab === "mascot" ? mascotModel.src : labModel.src;
  const activeLabel = tab === "mascot" ? mascotModel.label : labModel.label;
  const activeKey = tab === "mascot" ? `mascot-${selected}` : `lab-${labSelected}`;
  const grantReward = (xp: number, coins: number) => {
    if (!profile) return;
    const next = updateProfile({ xp: profile.xp + xp, coins: profile.coins + coins });
    setProfile(next);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/app" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Aventura
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/40 to-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <Camera className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-display text-2xl">Mascote no teu mundo 🥽</h1>
              <p className="text-sm text-muted-foreground">Aponta a câmara para o chão e vê o mascote em 3D!</p>
            </div>
          </div>
          {!premium && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-card px-3 py-1.5 text-xs">
              <Lock className="h-3 w-3" /> Versão de demonstração — <Link to="/premium" className="font-bold text-primary underline">desbloqueia tudo</Link>
            </div>
          )}
        </motion.section>

        {/* Tabs */}
        <div className="mt-5 inline-flex rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setTab("mascot")}
            className={`rounded-full px-4 py-1.5 font-display text-sm transition-colors ${tab === "mascot" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            🦊 Mascotes
          </button>
          <button
            onClick={() => setTab("lab")}
            className={`rounded-full px-4 py-1.5 font-display text-sm transition-colors ${tab === "lab" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <FlaskConical className="mr-1 inline h-3.5 w-3.5" /> Laboratório
          </button>
          <button
            onClick={() => setTab("missions")}
            className={`rounded-full px-4 py-1.5 font-display text-sm transition-colors ${tab === "missions" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <Target className="mr-1 inline h-3.5 w-3.5" /> Mini-missões
          </button>
        </div>

        {tab === "missions" ? (
          <div className="mt-4">
            <LabMissionsPanel onReward={grantReward} />
          </div>
        ) : (
          <>
        {/* Picker */}
        <div className="mt-3 flex flex-wrap gap-2">
          {tab === "mascot"
            ? MASCOTS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-sm transition-colors ${
                    selected === m.id ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                  }`}
                >
                  <Mascot id={m.id} size="sm" />
                  {m.name}
                </button>
              ))
            : LAB_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setLabSelected(m.id)}
                  className={`rounded-full px-3 py-1.5 font-display text-sm transition-colors ${
                    labSelected === m.id ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                  }`}
                >
                  {m.label}
                </button>
              ))}
        </div>

        {/* Model viewer */}
        <div className="mt-4 overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-b from-sky-200 to-sky-50 dark:from-slate-800 dark:to-slate-900" style={{ height: "55vh", minHeight: 360 }}>
          {loaded ? (
            <model-viewer
              key={activeKey}
              src={activeSrc}
              alt={activeLabel}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              style={{ width: "100%", height: "100%", background: "transparent" }}
            >
              <button slot="ar-button" className="btn-chunky absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-5 py-3 font-display text-white">
                <Sparkles className="mr-1 inline h-4 w-4" /> Ver no meu mundo
              </button>
            </model-viewer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="font-display text-sm text-muted-foreground">A carregar 3D…</p>
            </div>
          )}
        </div>

        {tab === "lab" && (
          <motion.div
            key={labSelected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl bg-accent/30 px-4 py-3 text-sm"
          >
            <p className="font-display text-xs uppercase tracking-wide text-muted-foreground">💡 Sabias que…</p>
            <p className="mt-1">{labModel.fact}</p>
          </motion.div>
        )}

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {activeLabel} · Toca no botão para colocar no teu mundo (precisa de telemóvel com câmara)
        </p>
          </>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/app">
            <ChunkyButton tone="ghost" className="w-full">← Aventura</ChunkyButton>
          </Link>
          <Link to="/leitura">
            <ChunkyButton tone="primary" className="w-full">🎤 Praticar leitura</ChunkyButton>
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

// =====================================================================
// Mini-missões interativas do Laboratório RA
// =====================================================================
function LabMissionsPanel({ onReward }: { onReward: (xp: number, coins: number) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const active = LAB_MISSIONS.find((m) => m.id === activeId) ?? null;

  if (active) {
    return (
      <MissionPlayer
        mission={active}
        onClose={() => setActiveId(null)}
        onComplete={(score) => {
          setCompleted((c) => ({ ...c, [active.id]: Math.max(c[active.id] ?? 0, score) }));
          onReward(active.rewardXp, active.rewardCoins);
        }}
      />
    );
  }

  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg">Mini-missões do Laboratório</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Desafios interativos com feedback imediato. Ganha 🪙 e ⭐ por cada missão.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {LAB_MISSIONS.map((m) => {
          const score = completed[m.id];
          const stars = score === undefined ? 0 : score === 100 ? 3 : score >= 70 ? 2 : 1;
          return (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className="card-chunky group rounded-2xl border-2 border-border bg-card p-3 text-left transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start gap-2">
                <span className="text-3xl">{m.emoji}</span>
                <div className="flex-1">
                  <p className="font-display text-sm">{m.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{m.intro}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-display text-[10px] text-muted-foreground">🪙 {m.rewardCoins} · ⭐ {m.rewardXp}</span>
                    {score !== undefined && (
                      <span className="font-display text-[10px] text-secondary-foreground">
                        {"⭐".repeat(stars)}{"☆".repeat(3 - stars)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MissionPlayer({ mission, onClose, onComplete }: { mission: LabMission; onClose: () => void; onComplete: (scorePct: number) => void }) {
  const [orderState, setOrderState] = useState<string[]>([]);
  const [matchState, setMatchState] = useState<string[]>(() => mission.parts.map(() => ""));
  const [identifyChoice, setIdentifyChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; partials?: number } | null>(null);
  const [done, setDone] = useState(false);

  // Match: pool de "funções" baralhadas (valores do answer map)
  const matchOptions = mission.kind === "match"
    ? Object.values(mission.answer as Record<string, string>)
    : [];

  const reset = () => {
    setOrderState([]);
    setMatchState(mission.parts.map(() => ""));
    setIdentifyChoice(null);
    setFeedback(null);
    setDone(false);
  };

  const submit = () => {
    let userAnswer: string | string[] = "";
    if (mission.kind === "order") userAnswer = orderState;
    else if (mission.kind === "identify") userAnswer = identifyChoice ?? "";
    else if (mission.kind === "match") userAnswer = matchState;

    const r = checkAnswer(mission, userAnswer);
    if (r.correct) {
      const pct = 100;
      setFeedback({ correct: true, message: "Boa! Acertaste tudo! 🎉", partials: r.partials });
      setDone(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onComplete(pct);
    } else {
      const pct = r.partials !== undefined ? Math.round((r.partials / mission.parts.length) * 100) : 0;
      setFeedback({ correct: false, message: r.partials !== undefined ? `Quase! Acertaste ${r.partials}/${mission.parts.length}. Tenta de novo!` : "Não é essa. Tenta outra vez!", partials: r.partials });
      if (pct >= 70) onComplete(pct);
    }
  };

  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{mission.emoji}</span>
          <div>
            <h2 className="font-display text-lg leading-tight">{mission.title}</h2>
            <p className="text-[11px] text-muted-foreground">{mission.intro}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground" aria-label="Fechar">✕</button>
      </div>

      {/* Order kind */}
      {mission.kind === "order" && (
        <div className="mt-4">
          <p className="font-display text-xs text-muted-foreground">Toca pela ordem certa:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mission.parts.map((p) => {
              const idx = orderState.indexOf(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setOrderState((s) => s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id])}
                  className={cn(
                    "rounded-2xl border-2 px-3 py-2 font-display text-sm transition-all",
                    idx >= 0 ? "border-primary bg-primary/10" : "border-border bg-muted/40",
                  )}
                >
                  {idx >= 0 && <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground">{idx + 1}</span>}
                  <span className="text-lg">{p.emoji}</span> {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Identify kind */}
      {mission.kind === "identify" && (
        <div className="mt-4">
          <p className="font-display text-sm">{mission.prompt}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {mission.parts.map((p) => (
              <button
                key={p.id}
                onClick={() => setIdentifyChoice(p.id)}
                className={cn(
                  "rounded-2xl border-2 p-3 text-center transition-all",
                  identifyChoice === p.id ? "border-primary bg-primary/10" : "border-border bg-muted/40",
                )}
              >
                <div className="text-3xl">{p.emoji}</div>
                <div className="mt-1 font-display text-sm">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Match kind */}
      {mission.kind === "match" && (
        <div className="mt-4 space-y-2">
          <p className="font-display text-xs text-muted-foreground">Para cada parte, escolhe a função certa:</p>
          {mission.parts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 p-2">
              <span className="text-2xl">{p.emoji}</span>
              <span className="w-24 font-display text-sm">{p.label}</span>
              <select
                value={matchState[i]}
                onChange={(e) => setMatchState((s) => { const n = [...s]; n[i] = e.target.value; return n; })}
                className="flex-1 rounded-xl border border-border bg-card px-2 py-1.5 text-sm"
              >
                <option value="">Escolhe…</option>
                {matchOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-4 rounded-2xl px-4 py-3",
              feedback.correct ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            <p className="font-display text-sm">{feedback.message}</p>
            {feedback.correct && (
              <div className="mt-2 space-y-1 text-xs text-foreground">
                {mission.parts.map((p) => (
                  <p key={p.id}><span className="text-base">{p.emoji}</span> <strong>{p.label}:</strong> {p.fact}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button onClick={reset} className="inline-flex items-center gap-1 text-xs font-display text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-3 w-3" /> Recomeçar
        </button>
        {done ? (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-secondary-foreground" />
            <span className="font-display text-xs">+{mission.rewardXp} ⭐ · +{mission.rewardCoins} 🪙</span>
            <button onClick={onClose} className="btn-chunky rounded-full bg-primary px-4 py-1.5 font-display text-sm text-primary-foreground">
              Concluir
            </button>
          </div>
        ) : (
          <button
            onClick={submit}
            className="btn-chunky rounded-full bg-primary px-5 py-2 font-display text-sm text-primary-foreground"
          >
            Verificar
          </button>
        )}
      </div>
    </div>
  );
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "touch-action"?: string;
          "shadow-intensity"?: string;
        },
        HTMLElement
      >;
    }
  }
}
