// Painel de Desafios Infinitos para os pais — mostra o progresso da criança
// selecionada (nível por pista, XP total, vitórias e erros) lendo de
// `infinite_progress` (RLS já permite ao pai ler progresso do filho ligado).

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, Flame, Sparkles, Target, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TRACKS } from "@/lib/infiniteChallenges";

interface Props {
  childId: string;
  childName: string;
}

interface InfiniteSnap {
  levels?: Record<string, number>;
  bestStars?: Record<string, number>;
  totalXp?: number;
  wins?: number;
  errors?: number;
  lastPlayedAt?: string | null;
}

export function ChildChallengesPanel({ childId, childName }: Props) {
  const [snap, setSnap] = useState<InfiniteSnap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("infinite_progress" as never)
        .select("data")
        .eq("user_id", childId)
        .maybeSingle();
      if (cancelled) return;
      const d = (data as { data?: InfiniteSnap } | null)?.data ?? null;
      setSnap(d);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [childId]);

  const totalXp = snap?.totalXp ?? 0;
  const wins = snap?.wins ?? 0;
  const errors = snap?.errors ?? 0;
  const accuracy = wins + errors > 0 ? Math.round((wins / (wins + errors)) * 100) : 0;

  const top = TRACKS
    .map((t) => ({ ...t, level: snap?.levels?.[t.id] ?? 1, stars: snap?.bestStars?.[t.id] ?? 0 }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 4);

  return (
    <section className="card-chunky rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-4 sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="font-display text-lg sm:text-xl">Desafios de {childName}</h3>
        </div>
        <Link
          to="/desafios/infinitos"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-display text-primary-foreground hover:opacity-90"
        >
          Abrir <ChevronRight className="h-3 w-3" />
        </Link>
      </header>

      {loading ? (
        <p className="text-xs text-muted-foreground">A carregar progresso…</p>
      ) : !snap ? (
        <div className="rounded-2xl bg-background/60 p-3 text-sm text-muted-foreground">
          Ainda não jogou nenhum Desafio Infinito.{" "}
          <Link to="/desafios/infinitos" className="font-display text-primary hover:underline">
            Convidar a começar
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <KPI icon={<Sparkles className="h-4 w-4 text-primary" />} label="XP total" value={String(totalXp)} />
            <KPI icon={<Flame className="h-4 w-4 text-orange-500" />} label="Vitórias" value={String(wins)} />
            <KPI icon={<Target className="h-4 w-4 text-success" />} label="Precisão" value={`${accuracy}%`} />
          </div>

          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Top pistas</p>
            <ul className="space-y-1.5">
              {top.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="text-lg">{t.emoji}</span>
                    <span className="truncate font-display text-sm">{t.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Nv. <strong className="text-foreground">{t.level}</strong>
                    {t.stars > 0 && <span className="ml-2">{"⭐".repeat(Math.min(3, t.stars))}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/desafios"
              className="rounded-xl border-2 border-border bg-card px-3 py-2 text-center font-display text-xs hover:bg-muted"
            >
              ⚔️ Desafios PvP
            </Link>
            <Link
              to="/desafios/infinitos"
              className="rounded-xl border-2 border-primary/40 bg-primary/10 px-3 py-2 text-center font-display text-xs text-primary hover:bg-primary/15"
            >
              ♾️ Desafios Infinitos
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-2 text-center">
      <div className="flex items-center justify-center gap-1">{icon}</div>
      <p className="mt-0.5 font-display text-base leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
