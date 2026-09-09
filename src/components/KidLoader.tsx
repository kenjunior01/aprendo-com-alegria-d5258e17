import { MASCOTS, type MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

interface KidLoaderProps {
  /** Id da mascote a mostrar. Por omissão usa a Mocha (a coruja, cara da marca). */
  mascotId?: MascotId | null;
  label?: string;
  /** Versão compacta, para usar dentro de páginas que já têm cabeçalho. */
  compact?: boolean;
  className?: string;
}

/**
 * Loader com a identidade da Kidoz: mascote a saltitar + pontos animados.
 * Substitui os antigos estados "A carregar…" em texto simples, que pareciam
 * inacabados e não transmitiam a marca durante as esperas de rede/SSR.
 */
export function KidLoader({
  mascotId,
  label = "A carregar…",
  compact = false,
  className,
}: KidLoaderProps) {
  const mascot = MASCOTS.find((m) => m.id === mascotId) ?? MASCOTS[1];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-6",
        compact ? "py-8" : "min-h-[60dvh]",
        className,
      )}
    >
      <img
        src={mascot.image}
        alt=""
        aria-hidden
        className={cn("animate-bounce-soft rounded-3xl", compact ? "h-14 w-14" : "h-20 w-20")}
      />
      <div className="flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 180}ms`, animationDuration: "1.1s" }}
          />
        ))}
      </div>
      <p className="font-display text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
