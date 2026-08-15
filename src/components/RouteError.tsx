import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";

/**
 * Fallback error component for TanStack Router errorComponent.
 * Renders a Portuguese-friendly message with a reload button.
 */
export function RouteError({ error }: { error?: Error }) {
  const isNetwork =
    error?.message?.includes("fetch") ||
    error?.message?.includes("network") ||
    error?.message?.includes("Failed to fetch");

  return (
    <main
      id="main-content"
      className="flex min-h-[60dvh] items-center justify-center px-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="card-chunky max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl">
          {isNetwork ? "Sem ligação à internet" : "Algo correu mal"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isNetwork
            ? "Verifica a tua ligação e tenta de novo."
            : "Ocorreu um erro inesperado. Tenta recarregar a página."}
        </p>
        {error && !isNetwork && process.env.NODE_ENV === "development" && (
          <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-muted p-3 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <ChunkyButton
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Recarregar
          </ChunkyButton>
          <Link to="/">
            <ChunkyButton tone="ghost" className="w-full sm:w-auto">
              Voltar ao início
            </ChunkyButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
