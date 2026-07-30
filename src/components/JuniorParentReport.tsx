import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import {
  listJuniorChildren, loadJuniorProgress, GAMES, GARDENS, gardenProgressFor,
  type JuniorChild, type JuniorProgress,
} from "@/lib/junior";
import { loadStickers, STICKERS } from "@/lib/juniorRewards";
import { pullJuniorCloud } from "@/lib/juniorCloud";

interface ChildSummary {
  child: JuniorChild;
  progress: JuniorProgress;
  stickers: string[];
}

export function JuniorParentReport() {
  const [items, setItems] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Garante que vê a versão mais recente da cloud
      await pullJuniorCloud();
      if (cancelled) return;
      const list = listJuniorChildren();
      const data = list.map((c) => ({
        child: c,
        progress: loadJuniorProgress(c.id),
        stickers: loadStickers(c.id),
      }));
      setItems(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;

  if (items.length === 0) {
    return (
      <div className="card-chunky rounded-3xl border-2 border-dashed border-border bg-card/60 p-5 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-primary" />
        <p className="mt-2 font-display text-lg">Sem perfis Alegria Júnior</p>
        <p className="text-xs text-muted-foreground">
          Vai a /junior para criar o primeiro perfil de criança (2-5 anos).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(({ child, progress, stickers }) => {
        const stats = gardenProgressFor(progress);
        const last = progress.lastPlayedAt ? new Date(progress.lastPlayedAt) : null;
        const lastStr = last ? last.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "Ainda não brincou";
        return (
          <article key={child.id} className="card-chunky rounded-3xl border-2 border-border bg-card p-4 sm:p-5">
            <header className="flex items-center gap-3">
              <Mascot id={child.mascot} size="md" />
              <div className="flex-1">
                <h4 className="font-display text-xl">{child.name}</h4>
                <p className="text-xs text-muted-foreground">{child.age} anos · Última sessão: {lastStr}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl">⭐ {stickers.length}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Autocolantes</p>
              </div>
            </header>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Stat label="Jogos" value={`${progress.playedGames.length}/${GAMES.length}`} />
              <Stat label="Sessões" value={String(progress.totalSessions)} />
              <Stat label="Coleção" value={`${stickers.length}/${Object.keys(STICKERS).length}`} />
            </div>

            <div className="mt-4 space-y-2">
              {stats.map((s) => (
                <div key={s.garden.id}>
                  <div className="flex justify-between text-xs">
                    <span className="font-display">{s.garden.emoji} {s.garden.name}</span>
                    <span className="text-muted-foreground">{s.played}/{s.total} · {s.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-success"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {progress.highlights.length > 0 && (
              <div className="mt-4 rounded-2xl bg-muted/50 p-3">
                <p className="text-xs font-display uppercase tracking-wide text-muted-foreground">Atividade recente</p>
                <ul className="mt-1 space-y-1 text-sm">
                  {progress.highlights.slice(0, 4).map((h, i) => {
                    const game = GAMES.find((g) => g.id === h.gameId);
                    return (
                      <li key={i} className="flex items-center gap-2">
                        <span>{game?.emoji ?? "🎮"}</span>
                        <span className="flex-1">{h.note}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(h.at).toLocaleDateString("pt-PT")}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <p className="mt-3 text-[10px] text-muted-foreground">
              Sincronizado com a tua conta — disponível em todos os dispositivos.
            </p>
          </article>
        );
      })}

      <p className="text-center text-[10px] text-muted-foreground">
        Total: {items.length} {items.length === 1 ? "criança" : "crianças"} · {GARDENS.length} jardins disponíveis
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-base">{value}</p>
    </div>
  );
}
