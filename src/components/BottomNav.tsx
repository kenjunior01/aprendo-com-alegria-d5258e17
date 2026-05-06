import { Link, useLocation } from "@tanstack/react-router";
import { Map as MapIcon, ShoppingBag, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { loadProfile } from "@/lib/storage";

export function BottomNav() {
  const location = useLocation();
  useAuth();
  const path = location.pathname;
  const profile = typeof window !== "undefined" ? loadProfile() : null;
  const isParent = profile?.role === "parent";

  type NavItem = { to: string; label: string; icon: typeof MapIcon; match: (p: string) => boolean };
  const items: NavItem[] = isParent
    ? [
        { to: "/pais", label: "Painel", icon: BarChart3, match: (p) => p.startsWith("/pais") },
        { to: "/perfil", label: "Perfil", icon: User, match: (p) => p.startsWith("/perfil") },
      ]
    : [
        { to: "/app", label: "Jornada", icon: MapIcon, match: (p) => p === "/app" || p.startsWith("/licao") || p.startsWith("/capitulo") },
        { to: "/loja", label: "Loja", icon: ShoppingBag, match: (p) => p.startsWith("/loja") },
        { to: "/perfil", label: "Perfil", icon: User, match: (p) => p.startsWith("/perfil") },
      ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const active = item.match(path);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
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
