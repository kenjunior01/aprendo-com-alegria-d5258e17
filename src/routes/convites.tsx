import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import {
  MILESTONES,
  acceptClaim,
  buildAcceptMessage,
  buildInviteMessage,
  decodeClaimToken,
  ensureRefCode,
  getInviteCount,
  getRewardsGiven,
  grantReward,
  makeClaimToken,
  milestoneFor,
  nextMilestone,
} from "@/lib/referral";
import { openWhatsApp, copyLink } from "@/lib/challengeShare";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { toast } from "sonner";
import { RouteError } from "@/components/RouteError";
import { KidLoader } from "@/components/KidLoader";

export const Route = createFileRoute("/convites")({
  validateSearch: (search: Record<string, unknown>): { claim?: string } => {
    if (typeof search.claim === "string" && search.claim.length > 0) {
      return { claim: search.claim };
    }
    return {};
  },
  head: () => ({
    meta: [
      { title: "Convita & Ganha — Kidoz" },
      {
        name: "description",
        content:
          "Convida amigos para o Kidoz pelo WhatsApp e ganha prémios: moedas e dias de Premium grátis!",
      },
      { property: "og:title", content: "Convita & Ganha — Kidoz" },
      {
        property: "og:description",
        content: "Convida amigos e ganha moedas e dias de Premium grátis!",
      },
      { property: "og:url", content: "https://kidoz.online/convites" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/convites" }],
  }),
  component: ConvitesPage,
  errorComponent: RouteError,
});

function ConvitesPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [count, setCount] = useState(0);
  const [given, setGiven] = useState<number[]>([]);
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [autoClaimToken, setAutoClaimToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apply = (p: Profile | null): boolean => {
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return false;
      }
      ensureRefCode();
      setProfile(p);
      setCount(getInviteCount());
      setGiven(getRewardsGiven());
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

  // Auto-reclamar quando abre /convites?claim=TOKEN
  const search = Route.useSearch();
  useEffect(() => {
    if (!search.claim) return;
    setAutoClaimToken(search.claim);
  }, [search.claim]);

  const tryClaim = (token: string) => {
    const r = acceptClaim(token);
    if (!r.ok) {
      if (r.reason === "duplicate") toast.info("Este convite já tinha sido reclamado! 🙂");
      else if (r.reason === "noprofile") {
        navigate({ to: "/comecar" });
        return;
      } else toast.error("Código inválido — confere se copiaste tudo!");
      setAutoClaimToken(null);
      return;
    }
    if (r.reward) grantReward(r.reward);
    setCount(getInviteCount());
    setGiven(getRewardsGiven());
    setAutoClaimToken(null);
    setCelebrating(
      r.reward ? `${r.reward.icon} ${r.reward.title}` : `🎉 Convite de ${r.name} aceite!`,
    );
    haptic("celebrate");
  };

  useEffect(() => {
    if (autoClaimToken && profile) tryClaim(autoClaimToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoClaimToken, profile]);

  const invite = async () => {
    if (!profile) return;
    haptic("tap");
    const code = ensureRefCode();
    const msg = buildInviteMessage(profile.name, code);
    const res = await shareOrWhatsApp(msg, refMyLink(code));
    if (res === "copied") toast.success("Link copiado! Cola no chat do amigo 📋");
  };

  const sendAcceptance = async () => {
    if (!profile) return;
    const myCode = ensureRefCode();
    // Aceitação é gerada para o código de QUEM CONVIDOU (invitedBy) ou introduzido à mão
    const target = profile.invitedBy ?? "";
    if (!target) {
      toast.info("Ainda não recebeste nenhum convite — mas podes convidar amigos! 🙂");
      return;
    }
    haptic("tap");
    const token = makeClaimToken(target, profile.name);
    const msg = buildAcceptMessage(profile.name, token);
    const res = await shareOrWhatsApp(msg, claimLinkFrom(token));
    if (res === "copied") toast.success("Mensagem copiada! Envia ao teu amigo 📋");
    void myCode;
  };

  const manualClaim = () => {
    const v = pasteValue.trim();
    if (!v) return;
    if (v.startsWith("http")) {
      const m = v.match(/claim=([A-Za-z0-9_-]+)/);
      if (m) {
        tryClaim(m[1]);
        setPasteValue("");
        return;
      }
    }
    tryClaim(v);
    setPasteValue("");
  };

  const myCode = useMemo(() => profile?.refCode ?? "", [profile]);
  const next = nextMilestone(count);

  if (!profile) return <KidLoader />;
  const mascot = getMascot(profile.mascot);

  const progressToNext = next ? Math.min(100, (count / next.at) * 100) : 100;

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      {celebrating && (
        <>
          <ConfettiCelebration
            show
            type="lesson-complete"
            durationMs={3600}
            onDone={() => setCelebrating(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="fixed inset-x-4 top-24 z-[80] mx-auto max-w-sm rounded-3xl border-2 border-primary/50 bg-card/95 p-4 text-center shadow-elegant backdrop-blur"
          >
            <p className="font-display text-lg">{celebrating}</p>
          </motion.div>
        </>
      )}
      <TopBar profile={profile} />
      <main id="main-content" className="mx-auto max-w-[48rem] px-4 py-5 sm:py-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/20 via-secondary/25 to-accent/30 p-6 text-center"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.25),transparent_35%)]" />
          <Mascot id={profile.mascot} size="lg" bouncing equippedItemId={profile.equippedItem} />
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">Convita & Ganha 🎁</h1>
          <p className="mx-auto mt-2 max-w-[34rem] text-sm text-muted-foreground sm:text-base">
            Chama um amigo para a aventura e ganhem os dois prémios. Com <b>3 convites</b> abres o{" "}
            <b>Mundo Premium</b> durante 7 dias — de graça!
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-primary/50 bg-card/80 px-4 py-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              O teu código
            </span>
            <code className="font-display text-xl tracking-[0.3em] text-primary">{myCode}</code>
            <button
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={async () => {
                await copyLink(myCode);
                toast.success("Código copiado!");
              }}
            >
              copiar
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <ChunkyButton onClick={invite} className="min-h-[56px] w-full sm:w-auto">
              💬 Convidar pelo WhatsApp
            </ChunkyButton>
            <ChunkyButton
              tone="secondary"
              onClick={async () => {
                const code = ensureRefCode();
                const res = await copyLink(refMyLink(code));
                if (res === "copied") toast.success("Link copiado!");
                haptic("tap");
              }}
              className="min-h-[56px] w-full sm:w-auto"
            >
              🔗 Copiar link
            </ChunkyButton>
          </div>
        </motion.section>

        {/* Progresso para o próximo prémio */}
        <section className="card-chunky mt-5 rounded-3xl border-2 border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-lg">
              Convites aceite{count === 1 ? "" : "s"}: <span className="text-primary">{count}</span>
            </p>
            {next && (
              <p className="text-xs text-muted-foreground">
                Faltam <b>{Math.max(0, next.at - count)}</b> para {next.icon} <b>{next.title}</b>
              </p>
            )}
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNext}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>

          {/* Marcos */}
          <ul className="mt-4 space-y-2">
            {MILESTONES.map((m) => {
              const done = count >= m.at || given.includes(m.at);
              return (
                <li
                  key={m.at}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
                    done
                      ? "border-success/50 bg-success/10"
                      : "border-border bg-muted/40 opacity-80"
                  }`}
                >
                  <span className="text-2xl">{done ? "✅" : m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm">
                      {m.at} convite{m.at === 1 ? "" : "s"} · {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  {!done && count < m.at && (
                    <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
                      a caminho
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Devolver confirmação */}
        <section className="card-chunky mt-5 rounded-3xl border-2 border-secondary/40 bg-gradient-to-br from-secondary/10 to-card p-5">
          <h2 className="font-display text-lg">O teu amigo convidou-te? Revida! 🔄</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Se <b>tu</b> foste convidado, envia a confirmação ao teu amigo para ele receber o
            prémio.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <ChunkyButton tone="secondary" onClick={sendAcceptance} className="min-h-[52px] flex-1">
              ✅ Aceitei o convite! (WhatsApp)
            </ChunkyButton>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              placeholder="Cola aqui o código ou link de confirmação…"
              aria-label="Código de confirmação"
              className="h-12 flex-1 rounded-2xl border-2 border-border bg-background px-4 text-sm outline-none focus:border-primary"
            />
            <ChunkyButton tone="ghost" onClick={manualClaim} className="min-h-[52px] sm:w-auto">
              Validar
            </ChunkyButton>
          </div>
        </section>

        {/* Como funciona */}
        <section className="mt-6 rounded-3xl border-2 border-dashed border-border bg-muted/40 p-5">
          <h2 className="font-display text-lg">Como funciona? 🤔</h2>
          <ol className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
            {[
              "1. Toca em «Convidar pelo WhatsApp»",
              "2. O teu amigo cria o perfil e ganha +120 moedas",
              "3. Ele envia-te a confirmação",
              "4. Tu reclamas o prémio aqui! 🎉",
            ].map((s) => (
              <li key={s} className="rounded-2xl bg-card px-3 py-2 font-display text-xs">
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-center text-xs italic text-muted-foreground">
            {mascot.encourage}
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function refMyLink(code: string): string {
  return `https://kidoz.online/comecar?ref=${code}`;
}

function claimLinkFrom(token: string): string {
  return `https://kidoz.online/convites?claim=${token}`;
}

async function shareOrWhatsApp(
  message: string,
  link: string,
): Promise<"shared" | "whatsapp" | "copied"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Kidoz 🎒", text: message, url: link });
      return "shared";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "shared";
    }
  }
  return openWhatsApp(message) ? "whatsapp" : "copied";
}
