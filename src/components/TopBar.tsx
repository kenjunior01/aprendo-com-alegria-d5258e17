import { Link } from "@tanstack/react-router";
import { Coins, Flame, Heart, Star } from "lucide-react";
import { Mascot } from "./Mascot";
import { SoundToggle } from "./SoundToggle";
import type { Profile } from "@/lib/storage";

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <header
      className="glass-premium sticky top-0 z-30 border-b border-border/50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <Link to="/app" className="group flex items-center gap-2.5">
          <div className="relative">
            <Mascot id={profile.mascot} size="sm" equippedItemId={profile.equippedItem} />
            {profile.streak > 0 && (
              <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5 rounded-full bg-streak px-1.5 py-0 shadow-sm">
                <Flame className="h-2.5 w-2.5 text-white" />
                <span className="font-display text-[8px] font-bold text-white">{profile.streak}</span>
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-base font-bold leading-none">Olá, {profile.name || "amigo"}!</p>
            <p className="text-xs text-muted-foreground">Vamos aprender</p>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Stat icon={<Flame className="h-4 w-4" aria-hidden="true" />} value={profile.streak} color="text-streak" bg="bg-streak/10" title="Sequência" />
          <Stat icon={<Coins className="h-4 w-4" aria-hidden="true" />} value={profile.coins} color="text-coins" bg="bg-coins/10" title="Abracadinhos" />
          <Stat icon={<Star className="h-4 w-4 fill-current" aria-hidden="true" />} value={profile.xp} color="text-xp" bg="bg-xp/10" title="XP" />
          <Stat icon={<Heart className="h-4 w-4 fill-current" aria-hidden="true" />} value={profile.hearts} color="text-hearts" bg="bg-hearts/10" title="Corações" />
          <SoundToggle className="ml-1" />
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, value, color, bg, title }: { icon: React.ReactNode; value: number; color: string; bg: string; title: string }) {
  return (
    <div title={title} className={`flex items-center gap-1 rounded-full ${bg} px-2 py-1.5 font-display text-xs font-semibold shadow-sm sm:px-2.5 sm:text-sm`}>
      <span className={color}>{icon}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
