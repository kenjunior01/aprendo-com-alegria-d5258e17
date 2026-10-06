// OrderQuestion — exercício "põe pela ordem" (sílabas, números, estações…).
// A criança toca nas peças pela ordem que acha certa; tocando numa peça
// já colocada, ela volta para o monte. Feedback visual ao verificar.
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

interface Props {
  /** Ordem certa (dados do currículo). */
  sequence: string[];
  /** Peças baralhadas (posições estáveis para a pergunta atual). */
  scrambled: string[];
  /** Índices para `scrambled`, pela ordem escolhida até agora. */
  picks: number[];
  revealed: boolean;
  isCorrect: boolean;
  onPick: (scrambledIdx: number) => void;
  onUnpick: (pickPos: number) => void;
}

export function OrderQuestion({
  sequence,
  scrambled,
  picks,
  revealed,
  isCorrect,
  onPick,
  onUnpick,
}: Props) {
  const used = new Set(picks);
  return (
    <div className="flex flex-col gap-4">
      {/* Slots: a ordem que a criança está a construir */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {sequence.map((_, slot) => {
          const pickIdx = picks[slot];
          const filled = pickIdx !== undefined;
          return (
            <motion.button
              key={slot}
              type="button"
              onClick={() => {
                if (revealed || !filled) return;
                haptic("tap");
                onUnpick(slot);
              }}
              disabled={revealed}
              aria-label={filled ? `Retirar ${scrambled[pickIdx]}` : `Posição ${slot + 1}, vazia`}
              animate={revealed && !isCorrect ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "flex h-14 min-w-14 items-center justify-center rounded-2xl border-2 border-dashed px-3 font-display text-lg",
                !filled && "border-border bg-muted/40 text-muted-foreground",
                filled && !revealed && "border-primary bg-card text-foreground shadow-sm",
                revealed && isCorrect && filled && "border-success bg-success/15 text-success",
                revealed &&
                  !isCorrect &&
                  filled &&
                  "border-destructive bg-destructive/10 text-destructive",
              )}
            >
              {filled ? scrambled[pickIdx] : slot + 1}
            </motion.button>
          );
        })}
      </div>

      {/* Peças baralhadas — as usadas ficam esbatidas */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {scrambled.map((item, i) => {
          const isUsed = used.has(i);
          return (
            <motion.button
              key={`${item}-${i}`}
              type="button"
              whileTap={isUsed || revealed ? undefined : { scale: 0.92 }}
              disabled={isUsed || revealed}
              onClick={() => {
                haptic("tap");
                onPick(i);
              }}
              aria-label={`Peça ${item}`}
              className={cn(
                "card-chunky flex h-14 min-w-14 items-center justify-center rounded-2xl border-2 border-border bg-card px-4 font-display text-lg shadow-sm transition-colors",
                !isUsed && !revealed && "hover:border-primary active:scale-95",
                isUsed && "border-border/60 bg-muted/30 text-muted-foreground/40",
              )}
            >
              {item}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
