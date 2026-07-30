import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { defaultProfile, saveProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, ArrowLeft, User, Baby, Users } from "lucide-react";

export const Route = createFileRoute("/comecar")({
  head: () => ({
    meta: [
      { title: "Começar — Alegria" },
      { name: "description", content: "Cria o teu perfil e escolhe a tua mascote para começar a aventura." },
      { property: "og:title", content: 'Começar no Alegria' },
      { property: "og:description", content: 'Cria o teu perfil e escolhe a tua mascote para começar a aventura.' },
      { property: "og:url", content: "https://alegria.online/comecar" },
    ],
    links: [
      { rel: "canonical", href: "https://alegria.online/comecar" },
    ],
  }),
  component: Onboarding,
});

const STEPS_TOTAL = 5;

type Track = "junior" | "child" | "parent";

// ─── Animation Variants ───
const stepVariants = {
  enter: { opacity: 0, x: 40, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -40, scale: 0.98 },
};

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<Track>("child");
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [grade, setGrade] = useState(1);
  const [mascot, setMascot] = useState<MascotId>("fox");
  const [direction, setDirection] = useState(1);

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

  const goNext = () => {
    setDirection(1);
    if (track === "parent" && step === 1) {
      finish();
      return;
    }
    if (track === "junior" && step === 1) {
      setStep(4);
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <main className="bg-alegria-hero relative min-h-[100dvh] overflow-hidden">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-16 bottom-20 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-2xl flex-col px-5 py-8 sm:py-10">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <AlegriaLogo priority className="h-12 w-auto sm:h-14" />
          </motion.div>
        </div>

        {/* Progress bar — premium */}
        <div className="mb-8 flex justify-center gap-2">
          {Array.from({ length: STEPS_TOTAL }).map((_, i) => (
            <div key={i} className="relative h-2 w-10 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full",
                  i === step ? "bg-primary" : i < step ? "bg-primary/70" : ""
                )}
              />
              {i === step && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <Step key="0" direction={direction}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Mascot id="owl" size="lg" bouncing />
                </motion.div>
                <h1 className="font-display text-3xl sm:text-4xl">Quem está a chegar?</h1>
                <p className="text-muted-foreground">Conta-nos para te darmos a melhor experiência.</p>

                <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: "junior" as Track, emoji: "🧸", title: "Alegria Júnior", desc: "2 a 5 anos", icon: Baby },
                    { id: "child" as Track, emoji: "🧒", title: "Sou criança", desc: "6+ anos", icon: User },
                    { id: "parent" as Track, emoji: "👨‍👩‍👧", title: "Sou adulto", desc: "Acompanhar", icon: Users },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTrack(option.id)}
                      className={cn(
                        "card-premium group relative overflow-hidden rounded-3xl bg-card p-5 text-center transition-all hover:shadow-glow active:scale-[0.97]",
                        track === option.id && "border-primary ring-2 ring-primary/20 shadow-glow",
                      )}
                    >
                      {track === option.id && (
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-xp" />
                      )}
                      <div className="text-4xl mb-2">{option.emoji}</div>
                      <p className="font-display text-lg font-bold">{option.title}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </div>

                <ChunkyButton onClick={() => { setDirection(1); setStep(1); }} className="w-full sm:w-auto">
                  Continuar <ArrowRight className="h-4 w-4" />
                </ChunkyButton>
              </Step>
            )}

            {step === 1 && (
              <Step key="1" direction={direction}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Mascot id="owl" size="lg" bouncing />
                </motion.div>
                <h1 className="font-display text-3xl sm:text-4xl">
                  Como te chamas?
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
                  className="w-full max-w-sm rounded-2xl border-2 border-border bg-card px-5 py-4 text-center font-display text-xl outline-none transition-all focus:border-primary focus:shadow-glow"
                  autoFocus
                />
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <ChunkyButton tone="ghost" onClick={goBack} className="sm:flex-1">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </ChunkyButton>
                  <ChunkyButton onClick={goNext} disabled={!name.trim()} className="sm:flex-1">
                    {role === "parent" ? "Entrar" : "Continuar"} <ArrowRight className="h-4 w-4" />
                  </ChunkyButton>
                </div>
              </Step>
            )}

            {step === 2 && role === "child" && (
              <Step key="2" direction={direction}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-3xl">🎂</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl">Que idade tens?</h1>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {[6, 7, 8, 9, 10].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAge(a)}
                      className={cn(
                        "card-premium rounded-2xl bg-card py-6 font-display text-2xl font-bold transition-all hover:shadow-glow active:scale-95",
                        age === a && "bg-primary text-primary-foreground shadow-glow border-primary",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <ChunkyButton tone="ghost" onClick={goBack} className="sm:flex-1">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </ChunkyButton>
                  <ChunkyButton onClick={() => { setDirection(1); setStep(3); }} className="sm:flex-1">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </ChunkyButton>
                </div>
              </Step>
            )}

            {step === 3 && role === "child" && (
              <Step key="3" direction={direction}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                  <span className="text-3xl">📚</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl">Em que ano andas?</h1>
                <p className="text-muted-foreground">Vamos ajustar a aventura ao teu nível.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { g: 1, label: "1.º ano", emoji: "🌱" },
                    { g: 2, label: "2.º ano", emoji: "🌿" },
                    { g: 3, label: "3.º ano", emoji: "🌳" },
                    { g: 4, label: "4.º ano", emoji: "🌟" },
                  ].map(({ g, label, emoji }) => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={cn(
                        "card-premium rounded-2xl bg-card py-5 text-center transition-all hover:shadow-glow active:scale-95",
                        grade === g && "bg-secondary text-secondary-foreground shadow-glow border-secondary",
                      )}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <p className="font-display text-lg font-bold">{label}</p>
                    </button>
                  ))}
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <ChunkyButton tone="ghost" onClick={goBack} className="sm:flex-1">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </ChunkyButton>
                  <ChunkyButton onClick={() => { setDirection(1); setStep(4); }} className="sm:flex-1">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </ChunkyButton>
                </div>
              </Step>
            )}

            {step === 4 && role === "child" && (
              <Step key="4" direction={direction}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-xp/10">
                  <Sparkles className="h-8 w-8 text-xp" />
                </div>
                <h1 className="font-display text-3xl sm:text-4xl">Escolhe a tua mascote!</h1>
                <p className="text-muted-foreground">Vai ser o teu companheiro de aventuras.</p>
                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                  {MASCOTS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMascot(m.id)}
                      className={cn(
                        "card-premium group relative overflow-hidden rounded-3xl bg-card p-3 text-center transition-all hover:shadow-glow active:scale-95",
                        mascot === m.id && "border-primary ring-2 ring-primary/20 shadow-glow",
                      )}
                    >
                      {mascot === m.id && (
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-xp" />
                      )}
                      <Mascot id={m.id} size="md" bouncing={mascot === m.id} />
                      <p className="mt-1 font-display font-bold">{m.name}</p>
                    </button>
                  ))}
                </div>
                <motion.div
                  key={mascot}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-premium rounded-2xl bg-card px-4 py-3 text-sm italic text-muted-foreground"
                >
                  {MASCOTS.find((m) => m.id === mascot)?.greeting}
                </motion.div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <ChunkyButton tone="ghost" onClick={goBack} className="sm:flex-1">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </ChunkyButton>
                  <ChunkyButton tone="success" onClick={finish} className="sm:flex-1">
                    Vamos começar! <Sparkles className="h-4 w-4" />
                  </ChunkyButton>
                </div>
              </Step>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

// ─── Step wrapper with premium animation ───
function Step({ children, direction }: { children: React.ReactNode; direction: number }) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="flex flex-col items-center gap-5 text-center"
    >
      {children}
    </motion.div>
  );
}
