// GlobalErrorBoundary — última rede de segurança da app (T3 da auditoria).
// O router TanStack já tem errorComponent por rota; este boundary apanha
// erros de render FORA das rotas (UsageGuard, CookieConsent, InstallPrompt,
// plugins nativos…) e transforma um ecrã branco num ecrã amigável para
// crianças, com o progresso tranquilizado e caminhos claros de recuperação.
// Componente de classe de propósito: só classes podem apanhar erros de render.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  eventId: number;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, eventId: 0 };

  static getDerivedStateFromError(): State {
    return { hasError: true, eventId: Date.now() };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    // Sem serviço externo de error tracking (privacidade primeiro): registo
    // local no console para diagnóstico ao ligar o dispositivo a um computador.
    console.error("[Kidoz] Erro inesperado apanhado pelo boundary:", error, info?.componentStack);
  }

  private reset = () => {
    this.setState({ hasError: false, eventId: Date.now() });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        id="main-content"
        role="alert"
        className="bg-sky-island flex min-h-[100dvh] flex-col items-center justify-center gap-3 overflow-hidden px-4 py-10 text-center"
      >
        <span aria-hidden="true" className="animate-bounce-soft text-7xl sm:text-8xl">
          🦉
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Ups! Uma nuvem atravessou o caminho
        </h1>
        <p className="max-w-sm text-muted-foreground">
          Não te preocupes: o teu progresso está guardado. Vamos recomeçar a aventura?
        </p>
        <div className="mt-5 flex w-full max-w-[22rem] flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-chunky inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl bg-primary px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-primary-foreground"
          >
            Recomeçar
          </button>
          <a
            href="/"
            className="btn-chunky inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-foreground"
          >
            Início
          </a>
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Tentar continuar onde estava
        </button>
      </main>
    );
  }
}
