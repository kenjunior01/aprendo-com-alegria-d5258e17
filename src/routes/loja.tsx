import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { SHOP_FALLBACK, TYPE_LABEL, type ItemType, type ShopItem } from "@/lib/shop";
import { buyItem, equipItem, loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { Coins, Lock, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { playCorrect, playWrong } from "@/lib/audio";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — Kidoz" },
      { name: "description", content: "Personaliza a tua mascote com chapéus, fatos e cenários ganhos com Abracadinhos." },
      { property: "og:title", content: 'Loja Kidoz — personaliza a tua mascote' },
      { property: "og:description", content: 'Chapéus, fatos e cenários para a tua mascote, ganhos com Abracadinhos.' },
      { property: "og:url", content: "https://kidoz.online/loja" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/loja" },
    ],
  }),
  component: ShopPage,
});

const TYPES: ItemType[] = ["hat", "outfit", "scene", "badge"];

function ShopPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeType, setActiveType] = useState<ItemType>("hat");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return;
      }
      setProfile(p);
    };
    init();
    return () => { cancelled = true; };
  }, [navigate]);

  if (!profile) return null;

  const items = SHOP_FALLBACK.filter((i) => i.type === activeType);

  const flash = (type: "ok" | "err", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 2200);
  };

  const onBuy = (item: ShopItem) => {
    if (item.premium && !profile.isPremium) {
      flash("err", "Este item é só para Premium ✨");
      playWrong();
      return;
    }
    const result = buyItem(item.id, item.price);
    if (!result.ok) {
      if (result.reason === "not_enough_coins") {
        flash("err", `Faltam ${item.price - profile.coins} Abracadinhos`);
        playWrong();
      }
      return;
    }
    setProfile(result.profile);
    flash("ok", `${item.name} desbloqueado! 🎉`);
    playCorrect();
  };

  const onEquip = (item: ShopItem) => {
    const next = equipItem(profile.equippedItem === item.id ? null : item.id);
    setProfile(next);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />

      <main className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/40 via-card to-secondary/30 p-5 sm:p-7"
        >
          <div className="flex items-center gap-4">
            <Mascot id={profile.mascot} size="lg" bouncing equippedItemId={profile.equippedItem} />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl">Loja dos Abracadinhos</h1>
              <p className="text-sm text-muted-foreground">Personaliza a tua mascote!</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 font-display font-semibold shadow-sm">
                <Coins className="h-4 w-4 text-xp" /> {profile.coins} Abracadinhos
              </div>
            </div>
          </div>
        </motion.section>

        {/* Feedback toast */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 rounded-2xl px-4 py-3 text-center font-display text-sm",
              feedback.type === "ok" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {feedback.msg}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors",
                activeType === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
              )}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {items.map((item) => {
            const owned = profile.ownedItems.includes(item.id);
            const equipped = profile.equippedItem === item.id;
            const lockedPremium = item.premium && !profile.isPremium;
            const canAfford = profile.coins >= item.price;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                className={cn(
                  "card-chunky relative flex flex-col items-center gap-2 rounded-3xl border-2 bg-card p-3 text-center sm:p-4",
                  equipped && "border-primary ring-4 ring-primary/30",
                  !equipped && "border-border",
                )}
              >
                {item.premium && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-xp/20 px-1.5 py-0.5 font-display text-[9px] font-bold text-xp">
                    <Sparkles className="h-2.5 w-2.5" /> PREMIUM
                  </span>
                )}
                <div className="text-5xl sm:text-6xl">{item.emoji}</div>
                <p className="font-display text-xs font-semibold sm:text-sm">{item.name}</p>

                {owned ? (
                  <button
                    onClick={() => onEquip(item)}
                    className={cn(
                      "btn-chunky w-full rounded-2xl px-3 py-1.5 font-display text-xs font-semibold sm:text-sm",
                      equipped ? "bg-primary text-primary-foreground" : "bg-success text-success-foreground",
                    )}
                  >
                    {equipped ? <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Equipado</span> : "Equipar"}
                  </button>
                ) : lockedPremium ? (
                  <Link to="/premium" className="w-full">
                    <button className="btn-chunky w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-3 py-1.5 font-display text-xs font-semibold text-primary-foreground sm:text-sm">
                      <Lock className="mr-1 inline h-3 w-3" aria-hidden="true" />Premium — precisa de conta Premium
                    </button>
                  </Link>
                ) : canAfford ? (
                  <button
                    onClick={() => onBuy(item)}
                    className="btn-chunky inline-flex w-full items-center justify-center gap-1 rounded-2xl bg-primary px-3 py-1.5 font-display text-xs font-semibold text-primary-foreground sm:text-sm"
                  >
                    <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.price}
                  </button>
                ) : (
                  <div className="w-full">
                    <button
                      onClick={() => onBuy(item)}
                      disabled
                      className="btn-chunky inline-flex w-full items-center justify-center gap-1 rounded-2xl bg-muted px-3 py-1.5 font-display text-xs font-semibold text-muted-foreground sm:text-sm"
                    >
                      <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.price}
                    </button>
                    <p className="mt-1 text-[10px] text-muted-foreground font-semibold">
                      Faltam {item.price - profile.coins} Abracadinhos — completa missões para ganhar mais!
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl bg-accent/40 p-5 text-center sm:p-6">
          <p className="font-display text-base sm:text-lg">💡 Como ganhar Abracadinhos?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa missões! Cada resposta certa dá-te 3 Abracadinhos, e missões 100% certas dão 10 bónus.
          </p>
          <Link to="/app" className="mt-3 inline-block">
            <ChunkyButton tone="primary">Voltar à aventura</ChunkyButton>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
