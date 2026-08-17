import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
  errorComponent: RouteError,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6" id="main-content">
      <div className="card-chunky max-w-[28rem] rounded-3xl border border-border bg-card p-8 text-center">
        {session_id ? (
          <>
            <h1 className="font-display text-3xl">🎉 Bem-vindo ao Premium!</h1>
            <p className="mt-3 text-muted-foreground">A tua subscrição está a ser ativada. Pode demorar alguns segundos a aparecer no perfil.</p>
            <Link to="/perfil" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 font-display text-primary-foreground">Ir para o perfil</Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl">Pagamento não encontrado</h1>
            <Link to="/premium" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 font-display text-primary-foreground">Voltar aos planos</Link>
          </>
        )}
      </div>
    </div>
  );
}
