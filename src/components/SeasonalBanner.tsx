// Banner de evento sazonal, mostrado no topo do dashboard.

import { motion } from "framer-motion";
import { currentSeasonalEvent } from "@/lib/seasonal";
import type { RegionCode } from "@/lib/region";

interface Props { region?: RegionCode | null }

export function SeasonalBanner({ region }: Props) {
  const ev = currentSeasonalEvent(region ?? undefined);
  if (!ev) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-chunky mb-4 overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-r ${ev.bg} p-4 sm:p-5`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl sm:text-4xl">{ev.emoji}</span>
        <div className="min-w-0">
          <p className="font-display text-base sm:text-lg leading-tight">{ev.title}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">{ev.message}</p>
        </div>
      </div>
    </motion.div>
  );
}
