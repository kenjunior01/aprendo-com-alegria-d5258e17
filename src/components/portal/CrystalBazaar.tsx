// CrystalBazaar.tsx — Bazar dos Cristais do Mundo Premium.
// Aqui se gastam os cristais ✦ ganhos nos reinos: power-ups de jogo e
// criaturas mágicas colecionáveis com bónus passivos.
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { haptic } from "@/lib/haptics";
import { playCoins, playTap } from "@/lib/audio";
import { recordPortalEvent } from "@/lib/portalDaily";
import { cn } from "@/lib/utils";
import {
  CREATURES,
  SUPPLIES,
  hintPrice,
  getCreature,
  type CreatureDef,
  type PortalState,
  type SupplyKey,
} from "@/lib/premiumWorld";

interface Props {
  open: boolean;
  onClose: () => void;
  state: PortalState;
  onBuySupply: (key: SupplyKey, price: number) => void;
  onBuyCreature: (c: CreatureDef) => void;
  onEquip: (id: string | null) => void;
}

type Tab = "powerups" | "creaturas";

export function CrystalBazaar({
  open,
  onClose,
  state,
  onBuySupply,
  onBuyCreature,
  onEquip,
}: Props) {
  const [tab, setTab] = useState<Tab>("powerups");
  const equipped = state.equippedCreature;

  const supplyPrice = (key: SupplyKey, base: number) =>
    key === "hint" ? hintPrice(getCreature(equipped)?.perkKey) : base;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-[#0b1030]/95 backdrop-blur-xl"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between gap-2 px-4 pt-4">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
              <motion.span
                animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-lg"
              >
                💎
              </motion.span>
              <span className="font-display text-sm text-amber-200 tabular-nums">
                {state.crystals} ✦
              </span>
            </div>
            <p className="font-display text-lg text-white">Bazar dos Cristais ✦</p>
            <button
              onClick={() => {
                haptic("tap");
                onClose();
              }}
              aria-label="Fechar bazar"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white backdrop-blur transition-transform active:scale-90"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>

          {/* Separadores */}
          <div className="mx-auto mt-3 flex gap-1 rounded-2xl border border-white/15 bg-white/5 p-1">
            {(
              [
                { key: "powerups", label: "🛡️ Power-ups" },
                { key: "creaturas", label: "🐾 Criaturas" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  haptic("tap");
                  setTab(t.key);
                }}
                className={cn(
                  "rounded-xl px-4 py-2 font-display text-sm transition-colors",
                  tab === t.key ? "bg-white/20 text-white" : "text-white/60 hover:text-white",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="mx-auto mt-4 w-full max-w-[40rem] flex-1 overflow-y-auto px-4 pb-8">
            {tab === "powerups" ? (
              <div className="grid gap-3">
                {SUPPLIES.map((s) => {
                  const price = supplyPrice(s.key, s.price);
                  const owned = state.supplies[s.key] ?? 0;
                  const canBuy = state.crystals >= price;
                  return (
                    <motion.div
                      key={s.key}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 rounded-3xl border border-white/20 bg-white/5 p-4 backdrop-blur"
                    >
                      <span className="text-4xl">{s.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-base text-white">
                          {s.name}
                          {owned > 0 && (
                            <span className="ml-2 rounded-full bg-amber-400/25 px-2 py-0.5 font-display text-[10px] text-amber-200">
                              tens {owned}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/70">{s.desc}</p>
                      </div>
                      <ChunkyButton
                        onClick={() => {
                          if (!canBuy) return;
                          haptic("success");
                          playCoins();
                          recordPortalEvent({ bazarUsed: true });
                          onBuySupply(s.key, price);
                        }}
                        disabled={!canBuy}
                        className={cn(
                          "shrink-0 px-3 text-sm",
                          !canBuy && "cursor-not-allowed opacity-50",
                        )}
                      >
                        ✦ {price}
                      </ChunkyButton>
                    </motion.div>
                  );
                })}
                <p className="mt-1 text-center text-xs text-white/50">
                  Usa os power-ups dentro dos reinos: 💡 no HUD para dicas, 🛡️ age sozinho, ✦×2
                  ativa antes de responderes.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {CREATURES.map((c) => {
                  const owned = state.creatures.includes(c.id);
                  const isEquipped = equipped === c.id;
                  const canBuy = state.crystals >= c.price;
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      className={cn(
                        "rounded-3xl border-2 p-4 text-center backdrop-blur",
                        isEquipped
                          ? "border-amber-300/70 bg-amber-400/15"
                          : owned
                            ? "border-emerald-300/50 bg-emerald-400/10"
                            : "border-white/20 bg-white/5",
                      )}
                    >
                      <motion.span
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.2 + c.price / 300, repeat: Infinity }}
                        className="inline-block text-5xl drop-shadow-lg"
                      >
                        {c.emoji}
                      </motion.span>
                      <p className="mt-1 font-display text-base text-white">{c.name}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-white/65">{c.desc}</p>
                      <p className="mt-2 rounded-2xl bg-white/10 px-2 py-1 text-[11px] font-bold text-emerald-200">
                        ⚡ {c.perk}
                      </p>
                      {owned ? (
                        <ChunkyButton
                          tone={isEquipped ? "secondary" : "primary"}
                          onClick={() => {
                            haptic(isEquipped ? "tap" : "success");
                            onEquip(isEquipped ? null : c.id);
                            playTap();
                          }}
                          className="mt-2 w-full text-sm"
                        >
                          {isEquipped ? "★ A acompanhar-te" : "Levar comigo"}
                        </ChunkyButton>
                      ) : (
                        <ChunkyButton
                          onClick={() => {
                            if (!canBuy) return;
                            haptic("celebrate");
                            onBuyCreature(c);
                            playCoins();
                            recordPortalEvent({ bazarUsed: true });
                          }}
                          disabled={!canBuy}
                          className={cn(
                            "mt-2 w-full text-sm",
                            !canBuy && "cursor-not-allowed opacity-50",
                          )}
                        >
                          Adotar · ✦ {c.price}
                        </ChunkyButton>
                      )}
                    </motion.div>
                  );
                })}
                <p className="mt-1 text-center text-xs text-white/50 sm:col-span-2">
                  As criaturas acompanham-te no portal e o bónus da ativa funciona em todos os
                  reinos.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
