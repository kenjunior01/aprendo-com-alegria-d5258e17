import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { defaultProfile, saveProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/comecar")({
  head: () => ({
    meta: [
      { title: "Começar — Kidoz" },
      { name: "description", content: "Cria o teu perfil e escolhe a tua mascote para começar a aventura." },
      { property: "og:title", content: 'Começar no Kidoz' },
      { property: "og:description", content: 'Cria o teu perfil e escolhe a tua mascote para começar a aventura.' },
      { property: "og:url", content: "https://kidoz.online/comecar" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/comecar" },
    ],
  }),
  component: Onboarding,
  errorComponent: RouteError,
});

const STEPS_TOTAL = 5;

type Track = "junior" | "child" | "parent";

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<Track>("child");
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [grade, setGrade] = useState(1);
  const [mascot, setMascot] = useState<MascotId>("fox");

  const role: "child" | "parent" = track === "parent" ? "parent" : "child";

  const finish = () => {
    const finalAge = track === "junior" ? 4 : age;
    const finalGrade = track === "junior" ? 0 : grade;
    const p = {
      ...defaultProfile(),
      role,
      name: name.trim() || (track === "parent" ? "Adulto" : "Amigo"),
      age: finalAge,
      grade: finalGrade,
      mascot,
    };
    saveProfile(p);
    if (track === "parent") navigate({ to: "/pais" });
    else if (track === "junior") navigate({ to: "/junior" });
    else navigate({ to: "/app" });
  };

  // Skip steps not relevant to parents/junior
  const goNext = () => {
    if (track === "parent" && step === 1) {
      finish();
      return;
    }
    if (track === "junior" && step === 1) {
      // Junior: pula idade/ano, vai direto para escolher mascote
      setStep(4);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <main id="main-content" className="bg-paper min-h-[100dvh] px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-[32rem]">
        <div className="mb-4 flex justify-center">
          <AlegriaLogo priority className="h-12 w-auto sm:h-14" />
        </div>
        <div className="mb-8 flex justify-center gap-2">
          {Array.from({ length: STEPS_TOTAL }).map((_, i) => (
            <span
              key={i}
              className={cn("h-2 w-10 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Step key="0">
              <Mascot id="owl" size="lg" bouncing />
              <h1 className="font-display text-3xl sm:text-4xl">Quem está a chegar?</h1>
              <p className="text-muted-foreground">Conta-nos para te darmos a melhor experiência.</p>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setTrack("junior")}
                  className={cn(
                    "card-chunky rounded-3xl border-2 border-border bg-card p-5 text-center transition-transform hover:-translate-y-1",
                    track === "junior" && "border-primary ring-4 ring-primary/25",
                  )}
                >
                  <div className="text-4xl">🧸</div>
                  <p className="mt-2 font-display text-lg">Kidoz Júnior</p>
                  <p className="text-xs text-muted-foreground">2 a 5 anos · jogos simples</p>
                </button>
                <button
                  onClick={() => setTrack("child")}
                  className={cn(
                    "card-chunky rounded-3xl border-2 border-border bg-card p-5 text-center transition-transform hover:-translate-y-1",
                    track === "child" && "border-primary ring-4 ring-primary/25",
                  )}
                >
                  <div className="text-4xl">🧒</div>
                  <p className="mt-2 font-display text-lg">Sou criança</p>
                  <p className="text-xs text-muted-foreground">6+ anos · aprender e jogar</p>
                </button>
                <button
                  onClick={() => setTrack("parent")}
                  className={cn(
                    "card-chunky rounded-3xl border-2 border-border bg-card p-5 text-center transition-transform hover:-translate-y-1",
                    track === "parent" && "border-primary ring-4 ring-primary/25",
                  )}
                >
                  <div className="text-4xl">👨‍👩‍👧</div>
                  <p className="mt-2 font-display text-lg">Sou adulto</p>
                  <p className="text-xs text-muted-foreground">Acompanhar uma criança</p>
                </button>
              </div>
              <ChunkyButton onClick={() => setStep(1)} className="w-full sm:w-auto">
                Continuar →
              </ChunkyButton>
            </Step>
          )}

          {step === 1 && (
            <Step key="1">
              <Mascot id="owl" size="lg" bouncing />
              <h1 className="font-display text-3xl sm:text-4xl">
                {role === "parent" ? "Como te chamas?" : "Como te chamas?"}
              </h1>
              <p className="text-muted-foreground">
                {role === "parent" ? "Para personalizar o teu painel." : "Vamos criar a tua aventura."}
              </p>
              <label htmlFor="comecar-name" className="sr-only">O teu nome</label>
              <input
                id="comecar-name"
                name="name"
                aria-label="O teu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder={role === "parent" ? "O teu nome" : "O teu nome"}
                className="w-full max-w-[24rem] rounded-2xl border-2 border-border bg-card px-5 py-4 text-center font-display text-xl outline-none focus:border-primary"
                autoFocus
              />
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <ChunkyButton tone="ghost" onClick={() => setStep(0)} className="sm:flex-1">← Voltar</ChunkyButton>
                <ChunkyButton onClick={goNext} disabled={!name.trim()} className="sm:flex-1">
                  {role === "parent" ? "Entrar 🎉" : "Continuar →"}
                </ChunkyButton>
              </div>
            </Step>
          )}

          {step === 2 && role === "child" && (
            <Step key="2">
              <h1 className="font-display text-3xl sm:text-4xl">Que idade tens?</h1>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {[6, 7, 8, 9, 10].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAge(a)}
                    className={cn(
                      "card-chunky rounded-2xl border-2 border-border bg-card py-6 font-display text-2xl transition-transform hover:-translate-y-0.5",
                      age === a && "border-primary bg-accent text-accent-foreground",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <ChunkyButton tone="ghost" onClick={() => setStep(1)} className="sm:flex-1">← Voltar</ChunkyButton>
                <ChunkyButton onClick={() => setStep(3)} className="sm:flex-1">Continuar →</ChunkyButton>
              </div>
            </Step>
          )}

          {step === 3 && role === "child" && (
            <Step key="3">
              <h1 className="font-display text-3xl sm:text-4xl">Em que ano andas?</h1>
              <p className="text-muted-foreground">Vamos ajustar a aventura ao teu nível.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={cn(
                      "card-chunky rounded-2xl border-2 border-border bg-card py-5 font-display text-lg transition-transform hover:-translate-y-0.5",
                      grade === g && "border-primary bg-accent text-accent-foreground",
                    )}
                  >
                    {g}.º ano
                  </button>
                ))}
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <ChunkyButton tone="ghost" onClick={() => setStep(2)} className="sm:flex-1">← Voltar</ChunkyButton>
                <ChunkyButton onClick={() => setStep(4)} className="sm:flex-1">Continuar →</ChunkyButton>
              </div>
            </Step>
          )}

          {step === 4 && role === "child" && (
            <Step key="4">
              <h1 className="font-display text-3xl sm:text-4xl">Escolhe a tua mascote!</h1>
              <p className="text-muted-foreground">Vai ser o teu companheiro de aventuras.</p>
              <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                {MASCOTS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMascot(m.id)}
                    className={cn(
                      "card-chunky rounded-3xl border-2 border-border bg-card p-3 text-center transition-transform hover:-translate-y-1",
                      mascot === m.id && "border-primary ring-4 ring-primary/30",
                    )}
                  >
                    <Mascot id={m.id} size="md" bouncing={mascot === m.id} />
                    <p className="mt-1 font-display font-semibold">{m.name}</p>
                  </button>
                ))}
              </div>
              <p className="rounded-2xl bg-card px-4 py-3 text-sm italic text-muted-foreground shadow-sm">
                💬 “{MASCOTS.find((m) => m.id === mascot)?.greeting}”
              </p>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <ChunkyButton tone="ghost" onClick={() => setStep(3)} className="sm:flex-1">← Voltar</ChunkyButton>
                <ChunkyButton tone="success" onClick={finish} className="sm:flex-1">Vamos começar! 🎉</ChunkyButton>
              </div>
            </Step>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-5 text-center"
    >
      {children}
    </motion.div>
  );
}
