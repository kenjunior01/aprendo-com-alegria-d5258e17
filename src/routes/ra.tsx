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
import { ArrowLeft, Camera, Sparkles, Lock } from "lucide-react";

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
const MODELS: Record<MascotId, { src: string; ios?: string; label: string }> = {
  fox: {
    src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    label: "Faísca, o astronauta-raposa",
  },
  owl: {
    src: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Avocado/glTF-Binary/Avocado.glb",
    label: "Mocha, a coruja sábia",
  },
  cat: {
    src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    label: "Pipoca, a gata exploradora",
  },
  dog: {
    src: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    label: "Tito, o melhor amigo",
  },
  panda: {
    src: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    label: "Panda aventureiro",
  },
};

function ARPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selected, setSelected] = useState<MascotId>("fox");
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
  const model = MODELS[selected];

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

        {/* Mascot picker */}
        <div className="mt-5 flex flex-wrap gap-2">
          {MASCOTS.map((m) => (
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
          ))}
        </div>

        {/* Model viewer */}
        <div className="mt-5 overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-b from-sky-200 to-sky-50 dark:from-slate-800 dark:to-slate-900" style={{ height: "55vh", minHeight: 360 }}>
          {loaded ? (
            <model-viewer
              key={selected}
              src={model.src}
              alt={model.label}
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

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {model.label} · Toca no botão para colocar no teu mundo (precisa de telemóvel com câmara)
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
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string; alt?: string; ar?: boolean; "ar-modes"?: string;
        "camera-controls"?: boolean; "auto-rotate"?: boolean; "touch-action"?: string;
        "shadow-intensity"?: string;
      }, HTMLElement>;
    }
  }
}
