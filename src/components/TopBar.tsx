import { Link } from "@tanstack/react-router";
import { Flame, Heart, Star } from "lucide-react";
import { Mascot } from "./Mascot";
import type { Profile } from "@/lib/storage";

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/app" className="flex items-center gap-2">
          <Mascot id={profile.mascot} size="sm" />
          <div className="hidden sm:block">
            <p className="font-display text-lg leading-none">Olá, {profile.name || "amigo"}!</p>
            <p className="text-xs text-muted-foreground">Vamos aprender ✨</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Stat icon={<Flame className="h-4 w-4" />} value={profile.streak} color="text-streak" />
          <Stat icon={<Star className="h-4 w-4 fill-current" />} value={profile.xp} color="text-xp" />
          <Stat icon={<Heart className="h-4 w-4 fill-current" />} value={profile.hearts} color="text-destructive" />
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, value, color }: { icon: React.ReactNode; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 font-display text-sm font-semibold shadow-sm">
      <span className={color}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}
