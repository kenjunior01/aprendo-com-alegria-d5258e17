import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { loadProfile, type Profile } from "@/lib/storage";
import { isPremium } from "@/lib/premium";
import { ArrowLeft, Camera, Sparkles, Lock, FlaskConical } from "lucide-react";

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

export const Route = createFileRoute("/ra")({
  head: () => ({
    meta: [
      { title: "Realidade Aumentada — Lusis" },
      { name: "description", content: "Vê os mascotes do Lusis no teu mundo real, em 3D!" },
    ],
  }),
  component: ARPage,
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
  const [tab, setTab] = useState<"mascot" | "lab">("mascot");
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

  if (!profile) return null;
  const premium = isPremium(profile);
  const mascotModel = MODELS[selected];
  const labModel = LAB_MODELS.find((m) => m.id === labSelected)!;
  const activeSrc = tab === "mascot" ? mascotModel.src : labModel.src;
  const activeLabel = tab === "mascot" ? mascotModel.label : labModel.label;
  const activeKey = tab === "mascot" ? `mascot-${selected}` : `lab-${labSelected}`;

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-6">
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
        </div>

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

// JSX type for <model-viewer>
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
