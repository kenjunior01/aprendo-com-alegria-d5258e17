import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Plus, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { cn } from "@/lib/utils";
import { loadProfile, updateProfile, defaultProfile, type Profile } from "@/lib/storage";
import {
  WORLD_CATALOG,
  GRID_W,
  GRID_H,
  defaultWorldState,
  loadLocalWorld,
  saveLocalWorld,
  pullWorldState,
  getWorldItem,
  canPlace,
  backgroundClass,
  rugColor,
  type WorldItem,
  type WorldState,
  type WorldCategory,
} from "@/lib/world";
import { toast } from "sonner";

export const Route = createFileRoute("/mundo")({
  head: () => ({
    meta: [
      { title: "O Meu Mundo — Kidoz" },
      { name: "description", content: "Decora o teu quarto virtual com Abracadinhos. Adiciona móveis, plantas e fundos divertidos." },
    ],
  }),
  component: MundoPage,
});

const CATEGORY_LABELS: Record<WorldCategory, string> = {
  movel: "Móveis",
  planta: "Plantas",
  decoracao: "Decoração",
  fundo: "Fundos",
  tapete: "Tapetes",
};

function MundoPage() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile() ?? defaultProfile());
  const [world, setWorld] = useState<WorldState>(() => loadLocalWorld());
  const [activeCat, setActiveCat] = useState<WorldCategory>("movel");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [placing, setPlacing] = useState<WorldItem | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // pull cloud state on mount
  useEffect(() => {
    let cancelled = false;
    pullWorldState().then((cloud) => {
      if (cancelled || !cloud) return;
      setWorld(cloud);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ownedIds = useMemo(() => new Set(profile.ownedItems), [profile.ownedItems]);

  function persist(next: WorldState) {
    setWorld(next);
    saveLocalWorld(next);
  }

  function handleBuyOrSelect(item: WorldItem) {
    if (!ownedIds.has(item.id) && item.price > 0) {
      if (profile.coins < item.price) {
        toast.error(`Faltam ${item.price - profile.coins} Abracadinhos 💰`);
        return;
      }
      const updated = updateProfile({
        coins: profile.coins - item.price,
        ownedItems: [...profile.ownedItems, item.id],
      });
      setProfile(updated);
      toast.success(`Compraste ${item.name}! ${item.emoji}`);
    } else if (!ownedIds.has(item.id)) {
      const updated = updateProfile({ ownedItems: [...profile.ownedItems, item.id] });
      setProfile(updated);
    }

    if (item.category === "fundo") {
      persist({ ...world, background: item.id });
      setPickerOpen(false);
    } else if (item.category === "tapete") {
      persist({ ...world, rug: world.rug === item.id ? undefined : item.id });
      setPickerOpen(false);
    } else {
      // entrar em modo "colocar"
      setPlacing(item);
      setPickerOpen(false);
    }
  }

  function handleCellClick(x: number, y: number) {
    if (placing) {
      if (!canPlace(world, placing, x, y)) {
        toast.error("Não cabe aí 🙈");
        return;
      }
      persist({ ...world, placed: [...world.placed, { itemId: placing.id, x, y }] });
      setPlacing(null);
      toast.success("Adicionado! ✨");
    }
  }

  function handleRemoveSelected() {
    if (selectedIdx === null) return;
    const next = { ...world, placed: world.placed.filter((_, i) => i !== selectedIdx) };
    persist(next);
    setSelectedIdx(null);
  }

  const filteredCatalog = WORLD_CATALOG.filter((i) => i.category === activeCat);

  return (
    <div className="min-h-[100dvh] pb-24 sm:pb-6">
      <TopBar profile={profile} />

      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link to="/app" className="inline-flex items-center gap-1 text-sm font-display text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl">O Meu Mundo ✨</h1>
          <div className="w-12" />
        </div>

        <p className="mb-3 text-center text-sm text-muted-foreground">
          Toca no <strong>+</strong> para escolher itens. Toca num item colocado para o remover.
        </p>

        {/* Modo colocar — banner */}
        <AnimatePresence>
          {placing && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="mb-2 flex items-center justify-between gap-2 rounded-2xl border-2 border-primary bg-primary/10 px-3 py-2 font-display text-sm"
            >
              <span>
                {placing.emoji} A colocar <strong>{placing.name}</strong> — toca numa célula livre
              </span>
              <button onClick={() => setPlacing(null)} className="text-xs underline">
                Cancelar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cena (grelha) */}
        <div
          className={cn(
            "relative mx-auto overflow-hidden rounded-3xl border-4 border-border shadow-lg",
            backgroundClass(world.background),
          )}
          style={{ aspectRatio: `${GRID_W}/${GRID_H}` }}
        >
          {/* Tapete */}
          {world.rug && (
            <div
              className={cn("absolute rounded-3xl", rugColor(world.rug))}
              style={{
                left: `${(2 / GRID_W) * 100}%`,
                top: `${(3 / GRID_H) * 100}%`,
                width: `${(4 / GRID_W) * 100}%`,
                height: `${(2 / GRID_H) * 100}%`,
              }}
            />
          )}

          {/* Grelha invisível */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_H}, 1fr)`,
            }}
          >
            {Array.from({ length: GRID_W * GRID_H }).map((_, i) => {
              const x = i % GRID_W;
              const y = Math.floor(i / GRID_W);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCellClick(x, y)}
                  className={cn(
                    "border border-white/10 transition-colors",
                    placing && canPlace(world, placing, x, y) ? "hover:bg-white/30 active:bg-white/40" : "",
                  )}
                  aria-label={`Célula ${x},${y}`}
                />
              );
            })}
          </div>

          {/* Itens colocados */}
          {world.placed.map((p, idx) => {
            const it = getWorldItem(p.itemId);
            if (!it) return null;
            const isSel = selectedIdx === idx;
            return (
              <motion.button
                key={`${p.itemId}-${idx}`}
                type="button"
                layout
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIdx(isSel ? null : idx);
                }}
                className={cn(
                  "absolute flex items-center justify-center text-4xl sm:text-5xl drop-shadow-lg transition-transform",
                  isSel && "ring-4 ring-amber-300 rounded-2xl bg-white/30",
                )}
                style={{
                  left: `${(p.x / GRID_W) * 100}%`,
                  top: `${(p.y / GRID_H) * 100}%`,
                  width: `${(it.size.w / GRID_W) * 100}%`,
                  height: `${(it.size.h / GRID_H) * 100}%`,
                }}
              >
                <span>{it.emoji}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Acções */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <ChunkyButton tone="primary" onClick={() => setPickerOpen(true)} className="gap-2">
            <Plus className="h-5 w-5" /> Adicionar item
          </ChunkyButton>
          {selectedIdx !== null && (
            <ChunkyButton tone="ghost" onClick={handleRemoveSelected} className="gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Remover
            </ChunkyButton>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Sparkles className="mr-1 inline h-3 w-3" /> Ganha mais Abracadinhos ao completar lições!
        </p>
      </div>

      {/* Picker (sheet) */}
      <AnimatePresence>
        {pickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setPickerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t-4 border-border bg-card p-4 pb-8"
              style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl">Catálogo</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-display text-sm">
                  <Coins className="h-4 w-4 text-xp" /> {profile.coins}
                </span>
              </div>

              {/* tabs */}
              <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                {(Object.keys(CATEGORY_LABELS) as WorldCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 font-display text-sm transition-colors",
                      activeCat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {filteredCatalog.map((item) => {
                  const owned = ownedIds.has(item.id);
                  const equipped =
                    (item.category === "fundo" && world.background === item.id) ||
                    (item.category === "tapete" && world.rug === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleBuyOrSelect(item)}
                      className={cn(
                        "flex min-h-[110px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 transition-transform active:scale-95",
                        equipped
                          ? "border-primary bg-primary/10"
                          : owned
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-border bg-background",
                      )}
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <span className="text-center font-display text-[11px] leading-tight">{item.name}</span>
                      {owned ? (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {equipped ? "EM USO" : "TENS"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-xp">
                          <Coins className="h-3 w-3" /> {item.price}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
