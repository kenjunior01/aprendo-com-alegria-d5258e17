import { useEffect, useState } from "react";
import { loadStickers, STICKERS } from "@/lib/juniorRewards";

interface Props {
  childId: string | null;
  refreshKey?: number;
}

export function JuniorStickerBook({ childId, refreshKey }: Props) {
  const [owned, setOwned] = useState<string[]>([]);
  useEffect(() => { setOwned(loadStickers(childId)); }, [childId, refreshKey]);

  const all = Object.values(STICKERS);
  const ownedSet = new Set(owned);

  return (
    <div className="card-chunky rounded-3xl border-2 border-border bg-card p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xl">📒 Os meus autocolantes</h3>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 font-display text-xs text-primary">
          {owned.length}/{all.length}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">Ganha um autocolante sempre que terminas um jogo.</p>
      <div role="list" className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8">
        {all.map((s) => {
          const has = ownedSet.has(s.id);
          return (
            <div
              key={s.id}
              role="listitem"
              title={has ? s.label : "Por desbloquear"}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl transition-all ${
                has
                  ? "border-primary bg-gradient-to-br from-primary/15 to-accent/20 shadow-sm"
                  : "border-dashed border-border bg-muted/40 opacity-40 grayscale"
              }`}
            >
              {has ? s.emoji : "?"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
