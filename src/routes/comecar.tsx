import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { defaultProfile, saveProfile, type Profile } from "@/lib/storage";
import { applyWelcomeBonus, REF_CODE_RE } from "@/lib/referral";
import { REGION_SELECT, REGIONS, detectRegion, type RegionCode } from "@/lib/region";
import { cn } from "@/lib/utils";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/comecar")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    if (typeof search.ref === "string" && REF_CODE_RE.test(search.ref.toUpperCase())) {
      return { ref: search.ref.toUpperCase() };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Começar — Kidoz" },
      {
        name: "description",
        content: "Cria o teu perfil e escolhe a tua mascote para começar a aventura.",
      },
      { property: "og:title", content: "Começar no Kidoz" },
      {
        property: "og:description",
        content: "Cria o teu perfil e escolhe a tua mascote para começar a aventura.",
      },
      { property: "og:url", content: "https://kidoz.online/comecar" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/comecar" }],
  }),
  component: Onboarding,
  errorComponent: RouteError,
});

const STEPS_TOTAL = 5;

type Track = "junior" | "child" | "parent";

function Onboarding() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const refCode =
    search.ref && REF_CODE_RE.test(search.ref.toUpperCase()) ? search.ref.toUpperCase() : null;
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<Track>("child");
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [grade, setGrade] = useState(1);
  const [mascot, setMascot] = useState<MascotId>("fox");
  // País da criança — pré-selecionado pelo browser (idioma/fuso), 1 toque muda.
  const [region, setRegion] = useState<RegionCode | null>(() => detectRegion().code);
  // Consentimento parental (RGPD art.º 8 / COPPA) — exigido antes de criar perfil de criança.
  const [showConsent, setShowConsent] = useState(false);
  const [consentOk, setConsentOk] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const emailOk = /.+@.+\..+/.test(parentEmail.trim());

  const role: "child" | "parent" = track === "parent" ? "parent" : "child";

  const finish = () => {
    const finalAge = track === "junior" ? 4 : age;
    const finalGrade = track === "junior" ? 0 : grade;
    const p: Profile = {
      ...defaultProfile(),
      role,
      name: name.trim() || (track === "parent" ? "Adulto" : "Amigo"),
      age: finalAge,
      grade: finalGrade,
      mascot,
      region: region ?? detectRegion().code,
      // Consentimento parental registado no onboarding (RGPD art.º 8 / COPPA)
      consentAt: track === "parent" ? null : new Date().toISOString(),
      consentParentEmail: track === "parent" ? null : parentEmail.trim().toLowerCase(),
    };
    saveProfile(p);
    // Bónus de boas-vindas por convite (+140 moedas)
    if (refCode) applyWelcomeBonus(refCode);
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
        {refCode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl border-2 border-primary/50 bg-primary/10 px-4 py-2.5 text-center font-display text-sm text-primary"
          >
            🎁 Foste convidado! Vais receber <b>+140 moedas</b> ao criar o perfil.
          </motion.div>
        )}
        <div className="mb-4 flex justify-center">
          <AlegriaLogo priority className="h-12 w-auto sm:h-14" />
        </div>
        <div className="mb-8 flex justify-center gap-2">
          {Array.from({ length: STEPS_TOTAL }).map((_, i) => (
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
          {showConsent && (
            <Step key="consent">
              <Mascot id="owl" size="lg" />
              <h1 className="font-display text-3xl sm:text-4xl">Adulto, é a tua vez 👋</h1>
              <p className="text-muted-foreground">
                Para criar o perfil de uma criança, a lei (RGPD/COPPA) pede a autorização de um
                responsável. Leva menos de um minuto.
              </p>
              <label className="flex w-full max-w-[26rem] cursor-pointer items-start gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left text-sm">
                <input
                  type="checkbox"
                  checked={consentOk}
                  onChange={(e) => setConsentOk(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                />
                <span>
                  Sou o pai, mãe ou responsável e autorizo a criação do perfil e o tratamento dos
                  dados conforme a{" "}
                  <Link to="/privacidade" className="text-primary underline" target="_blank">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
              <div className="w-full max-w-[26rem] text-left">
                <label
                  htmlFor="comecar-parent-email"
                  className="mb-1 block font-display text-xs uppercase tracking-wide text-muted-foreground"
                >
                  Email do responsável
                </label>
                <input
                  id="comecar-parent-email"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="responsavel@exemplo.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3.5 outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Só para recibos, recuperação de conta e avisos importantes. Nunca é mostrado na
                  app.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <ChunkyButton
                  tone="ghost"
                  onClick={() => setShowConsent(false)}
                  className="sm:flex-1"
                >
                  ← Voltar
                </ChunkyButton>
                <ChunkyButton
                  onClick={() => {
                    setShowConsent(false);
                    setStep(1);
                  }}
                  disabled={!consentOk || !emailOk}
                  className="sm:flex-1"
                >
                  Autorizar e continuar →
                </ChunkyButton>
              </div>
            </Step>
          )}

          {!showConsent && step === 0 && (
            <Step key="0">
              <Mascot id="owl" size="lg" bouncing />
              <h1 className="font-display text-3xl sm:text-4xl">Quem está a chegar?</h1>
              <p className="text-muted-foreground">
                Conta-nos para te darmos a melhor experiência.
              </p>
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
                  <div className="text-4xl">👪</div>
                  <p className="mt-2 font-display text-lg">Sou adulto</p>
                  <p className="text-xs text-muted-foreground">Acompanhar uma criança</p>
                </button>
              </div>
              <ChunkyButton
                onClick={() => (track === "parent" ? setStep(1) : setShowConsent(true))}
                className="w-full sm:w-auto"
              >
                Continuar →
              </ChunkyButton>
            </Step>
          )}

          {!showConsent && step === 1 && (
            <Step key="1">
              <Mascot id="owl" size="lg" bouncing />
              <h1 className="font-display text-3xl sm:text-4xl">
                {role === "parent" ? "Como te chamas?" : "Como te chamas?"}
              </h1>
              <p className="text-muted-foreground">
                {role === "parent"
                  ? "Para personalizar o teu painel."
                  : "Vamos criar a tua aventura."}
              </p>
              <label htmlFor="comecar-name" className="sr-only">
                O teu nome
              </label>
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
                <ChunkyButton tone="ghost" onClick={() => setStep(0)} className="sm:flex-1">
                  ← Voltar
                </ChunkyButton>
                <ChunkyButton onClick={goNext} disabled={!name.trim()} className="sm:flex-1">
                  {role === "parent" ? "Entrar 🎉" : "Continuar →"}
                </ChunkyButton>
              </div>
            </Step>
          )}

          {!showConsent && step === 2 && role === "child" && (
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
                <ChunkyButton tone="ghost" onClick={() => setStep(1)} className="sm:flex-1">
                  ← Voltar
                </ChunkyButton>
                <ChunkyButton onClick={() => setStep(3)} className="sm:flex-1">
                  Continuar →
                </ChunkyButton>
              </div>
            </Step>
          )}

          {!showConsent && step === 3 && role === "child" && (
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
              <div className="w-full">
                <p className="mb-2 text-xs font-display uppercase tracking-wide text-muted-foreground">
                  Em que país vives?
                </p>
                <div role="list" className="flex flex-wrap justify-center gap-2">
                  {REGION_SELECT.map((code) => {
                    const r = REGIONS[code];
                    const active = region === code;
                    return (
                      <button
                        key={code}
                        role="listitem"
                        onClick={() => setRegion(code)}
                        aria-pressed={active}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-2xl border-2 px-3 py-2 transition-transform active:scale-95",
                          active ? "border-primary bg-primary/10" : "border-border bg-card",
                        )}
                      >
                        <span className="text-xl">{r.flag}</span>
                        <span className="font-display text-[11px] leading-tight">{r.country}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <ChunkyButton tone="ghost" onClick={() => setStep(2)} className="sm:flex-1">
                  ← Voltar
                </ChunkyButton>
                <ChunkyButton onClick={() => setStep(4)} className="sm:flex-1">
                  Continuar →
                </ChunkyButton>
              </div>
            </Step>
          )}

          {!showConsent && step === 4 && role === "child" && (
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
                <ChunkyButton tone="ghost" onClick={() => setStep(3)} className="sm:flex-1">
                  ← Voltar
                </ChunkyButton>
                <ChunkyButton tone="success" onClick={finish} className="sm:flex-1">
                  Vamos começar! 🎉
                </ChunkyButton>
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
