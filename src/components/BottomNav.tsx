import { Link, useLocation } from "@tanstack/react-router";
import { Home, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const path = location.pathname;

  const items = [
    { to: "/app", label: "Jornada", icon: Home, match: (p: string) => p.startsWith("/app") || p.startsWith("/licao") },
    { to: "/perfil", label: "Perfil", icon: User, match: (p: string) => p.startsWith("/perfil") },
    user
      ? { to: "/perfil", label: "Conta", icon: User, match: () => false, hidden: true as const }
      : { to: "/auth", label: "Entrar", icon: LogIn, match: (p: string) => p.startsWith("/auth") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.filter((i) => !("hidden" in i && i.hidden)).map((item) => {
          const active = item.match(path);
          const Icon = item.icon;
          return (
            <li key={item.to + item.label} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-display font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-6 w-6", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
