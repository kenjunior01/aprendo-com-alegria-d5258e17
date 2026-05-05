import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { defaultProfile, saveProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/comecar")({
  head: () => ({
    meta: [
      { title: "Começar — Lusis" },
      { name: "description", content: "Cria o teu perfil e escolhe a tua mascote para começar a aventura." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [mascot, setMascot] = useState<MascotId>("fox");

  const finish = () => {
    const p = { ...defaultProfile(), name: name.trim() || "Amigo", age, mascot };
    saveProfile(p);
    navigate({ to: "/app" });
  };

  return (
    <main className="bg-paper min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-10 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Step key="0">
              <Mascot id="owl" size="lg" bouncing />
              <h1 className="font-display text-4xl">Como te chamas?</h1>
              <p className="text-muted-foreground">Vamos criar o teu cantinho de aprendizagem.</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="O teu nome"
                className="w-full max-w-sm rounded-2xl border-2 border-border bg-card px-5 py-4 text-center font-display text-xl outline-none focus:border-primary"
                autoFocus
              />
              <ChunkyButton onClick={() => setStep(1)} disabled={!name.trim()}>
                Continuar →
              </ChunkyButton>
            </Step>
          )}

          {step === 1 && (
            <Step key="1">
              <h1 className="font-display text-4xl">Que idade tens?</h1>
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
                <ChunkyButton tone="ghost" onClick={() => setStep(0)} className="sm:flex-1">← Voltar</ChunkyButton>
                <ChunkyButton onClick={() => setStep(2)} className="sm:flex-1">Continuar →</ChunkyButton>
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step key="2">
              <h1 className="font-display text-4xl">Escolhe a tua mascote!</h1>
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
                <ChunkyButton tone="ghost" onClick={() => setStep(1)} className="sm:flex-1">← Voltar</ChunkyButton>
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
