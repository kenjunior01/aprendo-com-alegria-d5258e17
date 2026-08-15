// ThemeToggle — alternar entre modo claro e escuro
// Persiste preferência em localStorage
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("alegria-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || (!stored && prefersDark);
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("alegria-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-muted active:scale-90",
        className,
      )}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      <MotionIcon isDark={isDark} />
    </button>
  );
}

function MotionIcon({ isDark }: { isDark: boolean }) {
  return isDark ? (
    <Sun className="h-4 w-4 text-xp" />
  ) : (
    <Moon className="h-4 w-4 text-muted-foreground" />
  );
}
