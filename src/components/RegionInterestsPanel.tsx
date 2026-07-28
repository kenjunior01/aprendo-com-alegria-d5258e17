// Painel para escolher região e interesses da criança.
// Usado em /pais (parent settings) e em /perfil (child settings).

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Globe2, Sparkles } from "lucide-react";
import { REGIONS, REGION_SELECT, type RegionCode } from "@/lib/region";
import { updateProfile, type Profile } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const INTERESTS = [
  { id: "dinossauros", label: "Dinossauros", emoji: "🦖" },
  { id: "espaco", label: "Espaço", emoji: "🚀" },
  { id: "futebol", label: "Futebol", emoji: "⚽" },
  { id: "animais", label: "Animais", emoji: "🐾" },
  { id: "magia", label: "Magia", emoji: "🪄" },
  { id: "cozinha", label: "Cozinha", emoji: "🍳" },
  { id: "musica", label: "Música", emoji: "🎵" },
  { id: "carros", label: "Carros", emoji: "🏎️" },
  { id: "princesas", label: "Princesas", emoji: "👑" },
  { id: "robos", label: "Robôs", emoji: "🤖" },
  { id: "mar", label: "Mar e oceano", emoji: "🌊" },
  { id: "natureza", label: "Natureza", emoji: "🌳" },
];

interface Props {
  profile: Profile;
  onChange?: (p: Profile) => void;
  compact?: boolean;
}

export function RegionInterestsPanel({ profile, onChange, compact }: Props) {
  const [region, setRegion] = useState<RegionCode | null>(profile.region ?? null);
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setRegion(profile.region ?? null);
    setInterests(profile.interests ?? []);
  }, [profile.region, profile.interests]);

  const toggleInterest = (id: string) => {
    setDirty(true);
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const pickRegion = (r: RegionCode) => {
    setDirty(true);
    setRegion(r);
  };

  const save = () => {
    const next = updateProfile({ region: region ?? undefined, interests });
    onChange?.(next);
    setDirty(false);
    toast.success("Personalização guardada ✨");
  };

  return (
    <section className={cn("card-chunky rounded-3xl border border-border bg-card p-4 sm:p-5", compact && "p-3 sm:p-4")}>
      <header className="mb-3 flex items-center gap-2">
        <Globe2 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg sm:text-xl">Personalização</h2>
      </header>

      <div className="mb-4">
        <p className="mb-2 text-xs font-display uppercase tracking-wide text-muted-foreground">País / currículo</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {REGION_SELECT.map((code) => {
            const r = REGIONS[code];
            const active = region === code;
            return (
              <button
                key={code}
                onClick={() => pickRegion(code)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-2 text-center transition-transform active:scale-95",
                  active ? "border-primary bg-primary/10" : "border-border bg-background",
                )}
                aria-pressed={active}
              >
                <span className="text-xl">{r.flag}</span>
                <span className="font-display text-[11px] leading-tight">{r.country}</span>
                <span className="text-[10px] text-muted-foreground">{r.curriculum}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-display uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Interesses (escolhe vários)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS.map((it) => {
            const on = interests.includes(it.id);
            return (
              <button
                key={it.id}
                onClick={() => toggleInterest(it.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 font-display text-xs transition-transform active:scale-95",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
                )}
                aria-pressed={on}
              >
                <span>{it.emoji}</span>
                <span>{it.label}</span>
                {on && <Check className="ml-0.5 h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {dirty && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
          <button
            onClick={save}
            className="rounded-full bg-primary px-4 py-1.5 font-display text-sm text-primary-foreground active:scale-95"
          >
            Guardar
          </button>
        </motion.div>
      )}
    </section>
  );
}
