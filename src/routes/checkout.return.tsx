import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { capturePaypalOrder } from "@/lib/paypal.functions";
import { useAuth } from "@/hooks/useAuth";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { Mascot } from "@/components/Mascot";
import { RouteError } from "@/components/RouteError";
import { loadProfile, type Profile } from "@/lib/storage";
import { openWhatsApp } from "@/lib/challengeShare";
import { PartyPopper, Gamepad2, Users, LifeBuoy, XCircle } from "lucide-react";

type Confirmado = {
  planName: string;
  amount: string;
  periodEnd: string | null;
  via: "paypal" | "stripe";
};

interface ReturnSearch {
  session_id?: string;
  token?: string;
  via?: "paypal";
  /** "1" = o utilizador cancelou no PayPal. (Não usar o nome `cancel`: alguns
   * intermediários do dev-server fazem 307 removendo esse param.) */
  cancelado?: string;
}

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): ReturnSearch => {
    // ⚠️ No SSR o parser de search converte valores numéricos (1 → number).
    // Aceitar string E number, senão o param é removido com um redirect 307.
    return {
      session_id:
        typeof search.session_id === "string" || typeof search.session_id === "number"
          ? String(search.session_id)
          : undefined,
      token:
        typeof search.token === "string" || typeof search.token === "number"
          ? String(search.token)
          : undefined,
      via: search.via === "paypal" ? "paypal" : undefined,
      cancelado: search.cancelado === "sim" ? "sim" : undefined,
    };
  },
  component: CheckoutReturn,
  errorComponent: RouteError,
});

const BOTAO =
  "inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 font-display text-primary-foreground shadow-[0_3px_0_0_hsl(var(--primary-foreground)/0.25)] transition-transform active:translate-y-px";
const BOTAO_FANTASMA =
  "inline-flex items-center justify-center rounded-full border-2 border-border bg-muted/50 px-6 py-2.5 font-display text-foreground transition-colors hover:bg-muted";

const apoioWhatsApp = () =>
  openWhatsApp("Olá! Acabei de fazer um pagamento no Kidoz e preciso de ajuda com a confirmação.");

function CheckoutReturn() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { session_id, token, via, cancelado } = Route.useSearch();
  const capturePP = useServerFn(capturePaypalOrder);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [estado, setEstado] = useState<"a_confirmar" | "ok" | "erro">("a_confirmar");
  const [msgErro, setMsgErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null);
  const started = useRef(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const paypalAtivo = via === "paypal" && !!token && !cancelado;

  // Captura do pedido PayPal (o cliente volta do PayPal com ?token=ORDERID).
  useEffect(() => {
    if (started.current) return;
    if (!paypalAtivo) return;
    if (authLoading) return;
    if (!user) {
      // Sem sessão não é possível capturar — pedir login e voltar.
      setEstado("erro");
      setMsgErro(
        "A sessão expirou. Entra na tua conta para confirmarmos o pagamento — o valor só é cobrado depois desta confirmação.",
      );
      return;
    }
    started.current = true;
    capturePP({ data: { orderId: token! } })
      .then((res) => {
        setConfirmado({
          planName: res.planName,
          amount: res.amount,
          periodEnd: res.periodEnd,
          via: "paypal",
        });
        setEstado("ok");
      })
      .catch((e: unknown) => {
        setEstado("erro");
        setMsgErro(e instanceof Error ? e.message : "Erro no PayPal");
      })
      .finally(() => window.history.replaceState({}, "", "/checkout/return"));
  }, [paypalAtivo, authLoading, user, capturePP, token]);

  const mascotId = profile?.mascot ?? "fox";
  const dataFim = confirmado?.periodEnd
    ? new Date(confirmado.periodEnd).toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="min-h-[100dvh] bg-background flex items-center justify-center p-4"
      id="main-content"
    >
      <ConfettiCelebration show={estado === "ok"} type="achievement-unlock" durationMs={4200} />

      {/* Cancelamento — calmo, sem culpa, sem cobrança */}
      {cancelado === "sim" ? (
        <Cartao>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <XCircle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl">Pagamento cancelado</h1>
          <p className="mt-2 text-muted-foreground">
            Não foi cobrado nada. Se foi um engano, podes voltar aos planos quando quiseres — os
            teus progressos continuam guardados.
          </p>
          <Acoes>
            <Link to="/premium" className={BOTAO}>
              Voltar aos planos
            </Link>
            <button type="button" onClick={apoioWhatsApp} className={BOTAO_FANTASMA}>
              <LifeBuoy className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Falar com a equipa
            </button>
          </Acoes>
        </Cartao>
      ) : estado === "ok" && confirmado ? (
        <Cartao>
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
          >
            <Mascot id={mascotId} size="lg" bouncing emotion="celebrate" className="mx-auto" />
          </motion.div>
          <h1 className="mt-3 font-display text-3xl">Pagamento confirmado! 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo ao <b className="text-foreground">{confirmado.planName}</b> — o Premium já
            está ativo nesta conta.
          </p>

          <dl className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-left text-sm">
            <div className="flex items-center justify-between py-1">
              <dt className="text-muted-foreground">Plano</dt>
              <dd className="font-display">{confirmado.planName}</dd>
            </div>
            <div className="flex items-center justify-between py-1">
              <dt className="text-muted-foreground">Valor pago</dt>
              <dd className="font-display">{confirmado.amount.replace(".", ",")} €</dd>
            </div>
            {dataFim && (
              <div className="flex items-center justify-between py-1">
                <dt className="text-muted-foreground">Válido até</dt>
                <dd className="font-display">{dataFim}</dd>
              </div>
            )}
            <div className="flex items-center justify-between py-1">
              <dt className="text-muted-foreground">Recibo</dt>
              <dd className="font-display">
                {confirmado.via === "paypal" ? "PayPal (no teu email)" : "Stripe (no teu email)"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-muted-foreground">
            <PartyPopper className="mr-1 inline h-4 w-4 text-primary" aria-hidden="true" />
            Tudo desbloqueado: os 5 reinos, o tutor IA sem limites e as fichas para imprimir.
          </p>
          <Acoes>
            <button type="button" onClick={() => navigate({ to: "/app" })} className={BOTAO}>
              <Gamepad2 className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Jogar agora
            </button>
            <Link to="/pais" className={BOTAO_FANTASMA}>
              <Users className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Painel dos pais
            </Link>
          </Acoes>
        </Cartao>
      ) : estado === "erro" ? (
        <Cartao>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl">Não conseguimos confirmar</h1>
          <p className="mt-2 text-muted-foreground">{msgErro ?? "Ocorreu um erro inesperado."}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Se o valor saiu da tua conta, não te preocupes — fala connosco e resolvemos no mesmo dia
            útil.
          </p>
          <Acoes>
            <button type="button" onClick={apoioWhatsApp} className={BOTAO}>
              <LifeBuoy className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Falar com a equipa
            </button>
            <Link to="/premium" className={BOTAO_FANTASMA}>
              Voltar aos planos
            </Link>
          </Acoes>
        </Cartao>
      ) : paypalAtivo ? (
        <Cartao>
          <Mascot id={mascotId} size="lg" bouncing className="mx-auto" />
          <h1 className="mt-4 font-display text-2xl">A confirmar o pagamento…</h1>
          <p className="mt-2 text-muted-foreground">
            Um momento — estamos a ativar o teu Premium. Não feches esta página.
          </p>
          <div
            className="mx-auto mt-5 h-2 w-40 overflow-hidden rounded-full bg-muted"
            role="status"
            aria-label="A carregar"
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-primary"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            />
          </div>
        </Cartao>
      ) : session_id ? (
        <Cartao>
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
          >
            <Mascot id={mascotId} size="lg" bouncing emotion="celebrate" className="mx-auto" />
          </motion.div>
          <h1 className="mt-3 font-display text-3xl">Bem-vindo ao Premium! 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            O pagamento por cartão foi aceite. A subscrição está a ser ativada — pode levar alguns
            segundos a aparecer no perfil.
          </p>
          <Acoes>
            <Link to="/perfil" className={BOTAO}>
              Ir para o perfil
            </Link>
            <Link to="/app" className={BOTAO_FANTASMA}>
              Jogar agora
            </Link>
          </Acoes>
        </Cartao>
      ) : (
        <Cartao>
          <h1 className="font-display text-2xl">Pagamento não encontrado</h1>
          <p className="mt-2 text-muted-foreground">Não chegámos aqui por um pagamento ativo.</p>
          <Acoes>
            <Link to="/premium" className={BOTAO}>
              Voltar aos planos
            </Link>
          </Acoes>
        </Cartao>
      )}
    </div>
  );
}

function Cartao({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-chunky w-full max-w-[30rem] rounded-3xl border border-border bg-card p-6 text-center sm:p-8">
      {children}
    </div>
  );
}

function Acoes({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">{children}</div>;
}
