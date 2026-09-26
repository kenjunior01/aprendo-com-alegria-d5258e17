import { Link, useLocation } from "@tanstack/react-router";
import {
  Map as MapIcon,
  BookOpen,
  Trophy,
  BarChart3,
  User,
  Swords,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { loadProfile } from "@/lib/storage";
import { Mascot } from "./Mascot";

/**
 * Mobile-first bottom navigation — Premium Design
 * Large icons (~28px), generous touch targets (>=64px tall),
 * short labels, mascot as tutor entry point.
 * Hidden on md+ where in-page navigation is sufficient.
 */
export function BottomNav() {
  const location = useLocation();
  useAuth();
  const path = location.pathname;
  const profile = typeof window !== "undefined" ? loadProfile() : null;
  const isParent = profile?.role === "parent";

  type NavItem = {
    to: string;
    label: string;
    icon?: typeof MapIcon;
    mascot?: boolean;
    match: (p: string) => boolean;
  };

  const items: NavItem[] = isParent
    ? [
        { to: "/pais", label: "Painel", icon: BarChart3, match: (p) => p.startsWith("/pais") },
        { to: "/perfil", label: "Perfil", icon: User, match: (p) => p.startsWith("/perfil") },
      ]
    : [
        {
          to: "/app",
          label: "Início",
          icon: MapIcon,
          match: (p) => p === "/app" || p.startsWith("/licao") || p.startsWith("/capitulo"),
        },
        {
          to: "/leitura",
          label: "Explorar",
          icon: BookOpen,
          match: (p) => p.startsWith("/leitura") || p.startsWith("/ra") || p.startsWith("/jardim"),
        },
        {
          to: "/amigo",
          label: "O Meu Amigo",
          mascot: true,
          match: (p) => p.startsWith("/amigo") || p.startsWith("/tutor"),
        },
        {
          to: "/desafios",
          label: "Desafios",
          icon: Swords,
          match: (p) => p.startsWith("/desafios"),
        },
        {
          to: "/conquistas",
          label: "Prémios",
          icon: Trophy,
          match: (p) => p.startsWith("/conquistas") || p.startsWith("/loja"),
        },
        { to: "/ajuda", label: "Ajuda", icon: HelpCircle, match: (p) => p.startsWith("/ajuda") },
        { to: "/perfil", label: "Eu", icon: User, match: (p) => p.startsWith("/perfil") },
      ];

  return (
    <nav
      aria-label="Navegação principal"
      className="glass-premium fixed inset-x-0 bottom-0 z-40 border-t border-border/50 md:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-[28rem] items-stretch justify-around px-1 pt-1">
        {items.map((item) => {
          const active = item.match(path);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 font-display text-[11px] font-bold",
                  active
                    ? "text-primary"
                    : "text-muted-foreground active:bg-muted/60 hover:text-foreground",
                )}
              >
                {/* Pílula ativa que desliza com física de mola entre tabs */}
                {active && (
                  <motion.span
                    layoutId="bottomnav-pill"
                    aria-hidden="true"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-1">
                  {item.mascot ? (
                    <motion.div
                      animate={{ scale: active ? 1.14 : 1, y: active ? -1 : 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 15 }}
                    >
                      <Mascot id={profile?.mascot || "owl"} size="xs" bouncing={active} />
                    </motion.div>
                  ) : Icon ? (
                    <motion.div
                      animate={{ scale: active ? 1.14 : 1, y: active ? -1 : 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 15 }}
                      className="flex h-7 w-7 items-center justify-center rounded-xl"
                    >
                      <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
                    </motion.div>
                  ) : null}
                  <span className="leading-tight">{item.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
