import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotExpression, type MascotMood } from "./MascotExpression";
import { MascotVoiceTutor } from "./MascotVoiceTutor";
import { type Profile, updateProfile } from "@/lib/storage";
import { getMascot, getGrowthStage } from "@/lib/mascots";
import { cn, localize } from "@/lib/utils";
import { Utensils, Zap, Gamepad2, GraduationCap, Heart, Coins, MessageCircle, ShoppingBag, Mic, TrendingUp, Sparkles as SparklesIcon, X, Play, MapPin, Trophy, Gift, ListChecks, Camera } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { REGIONS, getMozambiqueFact } from "@/lib/region";
import { playEat, playFun, playTap, playLevelUp } from "@/lib/audio";
import {
  GameTapCor, GameAnimaTap, GameFrutaTap, GameEstrelasTap, GameComidaTap
} from "@/components/junior/JuniorGamesV6";

type RoomType = "living" | "kitchen" | "bedroom" | "classroom" | "talk" | "games";

interface Props {
  profile: Profile;
}

export function MascotRoom({ profile }: Props) {
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType>("living");
  const [mood, setMood] = useState<MascotMood>("neutral");
  const [bubble, setBubble] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState(false);
  const mascot = getMascot(profile.mascot);
  const growth = getGrowthStage(profile.grade, profile.xp);
  const region = profile.region ?? "PT";
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const t = (text: string) => localize(text, region);

  const today = new Date().toISOString().slice(0, 10);
  const hasGift = profile.lastDailyGift !== today;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 25;
    const moveY = (clientY - window.innerHeight / 2) / 25;
    setMousePos({ x: moveX, y: moveY });
  };

  const claimGift = () => {
    if (!hasGift) return;
    haptic("celebrate");
    playLevelUp();
    triggerBurst();
    updateProfile({
      coins: profile.coins + 50,
      lastDailyGift: today
    });
    toast.success(t("Recebeste o teu presente diário: 50 Abracadinhos! 🎁💰"), {
      icon: "🎉"
    });
  };

  const miniGames = [
    { id: "colors", name: t("Cores"), emoji: "🎨", component: GameTapCor },
    { id: "animals", name: t("Animais"), emoji: "🐶", component: GameAnimaTap },
    { id: "fruits", name: t("Frutas"), emoji: "🍎", component: GameFrutaTap },
    { id: "stars", name: t("Estrelas"), emoji: "⭐", component: GameEstrelasTap },
  ];

  // Particle burst for actions
  const triggerBurst = () => {
    import("canvas-confetti").then(confetti => {
      confetti.default({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e']
      });
    });
  };

  const takePhoto = () => {
    setPhotoMode(true);
    haptic("success");
    playTap();
    setTimeout(() => {
      setPhotoMode(false);
      toast.success(t("Foto guardada na galeria! 📸✨"));
    }, 2000);
  };

  // Passive decay effect: needs decrease slightly over time
  useEffect(() => {
    playWhistle();
    const timer = setInterval(() => {
      updateProfile({
        hunger: Math.max(0, profile.hunger - 0.1),
        energy: Math.max(0, profile.energy - 0.05),
        fun: Math.max(0, profile.fun - 0.15),
      });
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [profile.hunger, profile.energy, profile.fun]);

  const stats = [
    { id: "hunger", icon: Utensils, value: profile.hunger, color: "bg-orange-400", room: "kitchen" as RoomType },
    { id: "energy", icon: Zap, value: profile.energy, color: "bg-yellow-400", room: "bedroom" as RoomType },
    { id: "fun", icon: Gamepad2, value: profile.fun, color: "bg-pink-400", room: "living" as RoomType },
    { id: "knowledge", icon: GraduationCap, value: profile.knowledge, color: "bg-blue-400", room: "classroom" as RoomType },
    { id: "talk", icon: Mic, value: 100, color: "bg-indigo-400", room: "talk" as RoomType },
  ];

  const handleMascotClick = () => {
    if (room === "talk") return;
    haptic("tap");
    setMood("happy");
    setBubble(t(mascot.greeting));
    setTimeout(() => {
      setMood("neutral");
      setBubble(null);
    }, 3000);
  };

  const handleStatAction = (statId: string) => {
    if (statId === "talk") {
      playTap();
      setRoom("talk");
      return;
    }

    haptic("celebrate");
    if (statId === "hunger") {
      if (profile.coins < 5) {
        toast.error(t(`Precisas de 5 Abracadinhos para comer! 💰`));
        return;
      }
      playEat();
      triggerBurst();
      setMood("happy");
      setBubble(t("Nhame! Que delícia! 🍎"));
      updateProfile({
        hunger: Math.min(100, profile.hunger + 20),
        coins: profile.coins - 5
      });
    } else if (statId === "fun") {
      playTap();
      setRoom("games");
      return;
    } else if (statId === "energy") {
      playTap();
      triggerBurst();
      setMood("tired");
      setBubble(t("Zzz... Vou descansar um pouco. 💤"));
      updateProfile({ energy: Math.min(100, profile.energy + 25) });
    } else if (statId === "knowledge") {
      playTap();
      triggerBurst();
      setMood("thinking");
      if (region === "MZ") {
        setBubble(getMozambiqueFact());
      } else {
        setBubble(t("Vamos aprender algo novo? 📚"));
      }
      updateProfile({ knowledge: Math.min(100, profile.knowledge + 10) });
    }

    setTimeout(() => {
      setMood("neutral");
      setBubble(null);
    }, 3000);
  };

  const getBackground = () => {
    switch (room) {
      case "kitchen": return "bg-gradient-to-b from-orange-100 to-orange-200";
      case "bedroom": return "bg-gradient-to-b from-indigo-200 to-purple-300";
      case "classroom": return region === "MZ" ? "bg-gradient-to-b from-emerald-100 to-yellow-50" : "bg-gradient-to-b from-blue-100 to-emerald-100";
      case "talk": return "bg-gradient-to-b from-indigo-100 to-sky-200";
      case "games": return "bg-gradient-to-b from-pink-100 to-rose-200";
      default: return "bg-gradient-to-b from-sky-200 to-white";
    }
  };

  const ActiveGame = selectedGame ? miniGames.find(g => g.id === selectedGame)?.component : null;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn("relative flex h-full w-full flex-col overflow-hidden transition-colors duration-700", getBackground())}
    >
      {/* Parallax Background Layers */}
      <motion.div
        animate={{ x: mousePos.x, y: mousePos.y }}
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
      >
        <div className="absolute left-[10%] top-[20%] text-9xl">☁️</div>
        <div className="absolute right-[15%] top-[10%] text-8xl">☁️</div>
        <div className="absolute bottom-[20%] left-[20%] text-7xl">🌳</div>
        <div className="absolute bottom-[10%] right-[25%] text-9xl">🌳</div>
      </motion.div>

      {/* Dynamic Lighting Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-white/10 via-transparent to-black/5 opacity-50" />

      {/* Flash Effect */}
      <AnimatePresence>
        {photoMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[100] bg-white"
          />
        )}
      </AnimatePresence>

      {/* Top Stats - Glassmorphism style */}
      <div className="relative z-10 flex justify-between p-4 px-6 pt-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/30 px-4 py-2 shadow-lg backdrop-blur-xl"
        >
          <Heart className="h-5 w-5 text-red-500 fill-current" />
          <span className="font-display text-base font-black text-slate-800">{profile.hearts}</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 rounded-2xl border border-orange-400/40 bg-orange-400/20 px-4 py-2 shadow-lg backdrop-blur-xl"
        >
          <span className="text-xl">🔥</span>
          <span className="font-display text-base font-black text-orange-700">{profile.streak}</span>
        </motion.div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate({ to: "/tutor" })}
            className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/20 px-4 py-2 font-display text-sm font-bold text-primary shadow-lg backdrop-blur-xl transition-all hover:bg-primary/30"
          >
            <MessageCircle className="h-4 w-4" />
            {t("Conversar")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate({ to: "/desafios" })}
            className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/20 px-4 py-2 font-display text-sm font-bold text-emerald-700 shadow-lg backdrop-blur-xl transition-all hover:bg-emerald-400/30"
          >
            <ListChecks className="h-4 w-4" />
            {t("Missões")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate({ to: "/loja" })}
            className="flex items-center gap-2 rounded-2xl border border-xp/30 bg-xp/20 px-4 py-2 font-display text-sm font-bold text-xp shadow-lg backdrop-blur-xl transition-all hover:bg-xp/30"
          >
            <ShoppingBag className="h-4 w-4" />
            {t("Loja")}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/30 px-4 py-2 shadow-lg backdrop-blur-xl"
        >
          <Coins className="h-5 w-5 text-xp fill-current" />
          <span className="font-display text-base font-black text-slate-800">{profile.coins}</span>
        </motion.div>
      </div>

      {/* Growth Stage Badge */}
      <div className="flex flex-col items-center gap-1 pt-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative inline-flex items-center gap-2 rounded-full border-2 border-white px-4 py-1.5 backdrop-blur-sm shadow-sm",
            growth.stage === "mestre" ? "bg-amber-400 text-amber-950" : "bg-white/40 text-emerald-800"
          )}
        >
          {growth.stage === "mestre" ? (
            <SparklesIcon className="h-4 w-4 animate-pulse" />
          ) : (
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          )}
          <span className="font-display text-xs font-bold uppercase tracking-wider">
            {t(growth.label)}
          </span>
          {growth.stage === "mestre" && (
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 rounded-full border-2 border-amber-300"
            />
          )}
        </motion.div>
        <span className="text-[10px] font-medium text-muted-foreground opacity-80">
          {REGIONS[region]?.flag} Região: {REGIONS[region]?.country}
        </span>
      </div>

      {/* Main Area */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        {room === "games" ? (
          <div className="w-full max-w-md px-6">
            {!selectedGame ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-4">
                {miniGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      haptic("tap");
                      setSelectedGame(game.id);
                    }}
                    className="flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-white bg-white/60 p-6 shadow-lg transition-transform active:scale-95"
                  >
                    <span className="text-5xl">{game.emoji}</span>
                    <span className="font-display text-sm font-bold">{game.name}</span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border-4 border-white bg-white/80 p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-xl">{miniGames.find(g => g.id === selectedGame)?.name}</h3>
                  <button onClick={() => setSelectedGame(null)} className="rounded-full bg-black/10 p-2 hover:bg-black/20">
                    <X className="h-5 w-5" />
                  </button>
                  <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
                <div className="min-h-[250px]">
                  {ActiveGame && <ActiveGame />}
                  <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      haptic("success");
                      playFun();
                      updateProfile({ fun: Math.min(100, profile.fun + 20), coins: profile.coins + 10 });
                      setSelectedGame(null);
                      toast.success(t("Bom trabalho! Ganhaste 10 Abracadinhos! 💰"));
                    }}
                    className="btn-chunky flex items-center gap-2 rounded-full bg-success px-8 py-3 text-white"
                  >
                    <Play className="h-5 w-5 fill-current" /> {t("Concluir")}
                  </button>
                  <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
              </motion.div>
            )}
            <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
        ) : (
          <>
            {/* Scenario Elements based on room */}
            <AnimatePresence mode="wait">
              {hasGift && (
                <motion.button
                  key="daily-gift"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  onClick={claimGift}
                  className="absolute bottom-10 right-10 z-20 flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                  <div className="relative">
                    <Gift className="h-14 w-14 text-amber-500 fill-amber-200" />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-amber-400 blur-xl"
                    />
                    <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
                  <span className="font-display text-[10px] font-black uppercase text-amber-700">{t("Presente!")}</span>
                </motion.button>
              )}

              {room === "kitchen" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  key="kitchen-icon" className="absolute left-10 top-1/2 text-6xl"
                >
                  🥣
                </motion.span>
              )}
              {room === "bedroom" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  key="bedroom-icon" className="absolute right-10 top-1/3 text-6xl"
                >
                  🛌
                </motion.span>
              )}
              {room === "classroom" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                  key="classroom-icon" className="absolute inset-0 flex flex-col items-center justify-start pt-20"
                >
                  <span className="text-6xl opacity-50 mb-4">📖</span>
                  {region === "MZ" && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border-2 border-emerald-500 max-w-[280px] text-center"
                    >
                      <MapPin className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                      <p className="font-display text-sm text-emerald-900">
                        Sabias que o <strong>Zambeze</strong> é o maior rio de Moçambique? 🌊
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {room === "talk" ? (
          <div className="relative scale-125">
            {growth.stage === "mestre" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-0 z-0"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      y: [-20, -100],
                      x: [0, (i % 2 === 0 ? 30 : -30)],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute left-1/2 top-1/2 text-xl"
                  >
                    ✨
                  </motion.span>
                ))}
              </motion.div>
            )}
            <MascotVoiceTutor mascotId={profile.mascot} equippedItemId={profile.equippedItem} growthScale={growth.scale} />
            <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
        ) : (
          <div onClick={handleMascotClick} className="relative cursor-pointer transition-transform active:scale-95">
            {growth.stage === "mestre" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -inset-10 z-0 rounded-full border-2 border-dashed border-amber-400/30"
              />
            )}
            <MascotExpression
              mascotId={profile.mascot}
              size="xl"
              mood={mood}
              bubble={bubble}
              equippedItemId={profile.equippedItem}
              growthScale={growth.scale}
            />
            <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
        )}
      </div>

      {/* Bottom Interface - High Impact Design */}
      <div className="relative z-10 p-6 pb-12">
        <div className="mx-auto flex max-w-lg justify-between gap-2 rounded-[2.5rem] border border-white/40 bg-white/40 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center gap-2">
              <motion.button
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  setRoom(stat.room);
                  handleStatAction(stat.id);
                }}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-3xl border-4 border-white shadow-xl transition-all",
                  room === stat.room ? stat.color : "bg-white/90"
                )}
              >
                <stat.icon className={cn("h-7 w-7", room === stat.room ? "text-white" : "text-slate-600")} />
              </motion.button>

              {/* Animated Progress Bar */}
              {stat.id !== "talk" && (
                <div className="h-2 w-12 overflow-hidden rounded-full bg-slate-200/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    className={cn("h-full transition-all duration-1000 ease-out", stat.color)}
                  />
                  <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
              )}
              <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={takePhoto}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30"
          >
            <Camera className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
