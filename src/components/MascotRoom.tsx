import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotExpression, type MascotMood } from "./MascotExpression";
import { MascotVoiceTutor } from "./MascotVoiceTutor";
import { type Profile, updateProfile } from "@/lib/storage";
import { getMascot, getGrowthStage } from "@/lib/mascots";
import { cn } from "@/lib/utils";
import { Utensils, Zap, Gamepad2, GraduationCap, Heart, Coins, MessageCircle, ShoppingBag, Mic, TrendingUp, Sparkles as SparklesIcon, X, Play, MapPin, Trophy, Gift, ListChecks, Camera, BookOpen } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { REGIONS, getMozambiqueFact, localize } from "@/lib/region";
import { playEat, playFun, playTap, playLevelUp, playWhistle, playCorrect, playWrong, playHungry, playKnowledgeWarning } from "@/lib/audio";
import { GAME_REGISTRY, type GameEntry } from "@/lib/juniorGameRegistry";
import { getRandomSticker, type Sticker } from "@/lib/stickers";
import { getRandomTrivia, type TriviaQuestion } from "@/lib/triviaBank";

// --- Lazy-loaded heavy components ---
const StickerAlbum = lazy(() => import("./StickerAlbum").then(m => ({ default: m.StickerAlbum })));
const StickerPackOpening = lazy(() => import("./StickerPackOpening").then(m => ({ default: m.StickerPackOpening })));

function GameLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-4xl">🎮</motion.span></div>}>
      {children}
    </Suspense>
  );
}

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
  const [albumOpen, setAlbumOpen] = useState(false);
  const [newSticker, setNewSticker] = useState<Sticker | null>(null);
  const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const mascot = getMascot(profile.mascot);
  const growth = getGrowthStage(profile.grade, profile.xp);
  const region = profile.region ?? "PT";
  const t = (text: string) => localize(text, region);

  const today = new Date().toISOString().slice(0, 10);
  const hasGift = profile.lastDailyGift !== today;

  // Mini-games disponíveis na sala de jogos
  const miniGameIds = useMemo(() => [
    "tap-cor", "anima-tap", "fruta-tap", "estrelas-tap",
    "mz-provinces", "mz-food", "mz-animals", "mz-culture",
    "mz-flag", "mz-rivers", "mz-cities", "mz-heroes",
  ], [region]);

  const miniGames = useMemo(() =>
    miniGameIds
      .map(id => GAME_REGISTRY[id])
      .filter((g): g is GameEntry => g != null)
      .map(g => ({ id: g.id, name: t(g.title), emoji: g.emoji, component: g.component })),
    [miniGameIds, region]
  );

  useEffect(() => {
    playWhistle();
    const timer = setInterval(() => {
      const nextHunger = Math.max(0, profile.hunger - 0.1);
      const nextEnergy = Math.max(0, profile.energy - 0.05);
      const nextFun = Math.max(0, profile.fun - 0.15);
      const nextKnowledge = Math.max(0, profile.knowledge - 0.1);

      // Play warning sounds if stats just entered red zone
      if (profile.hunger >= 25 && nextHunger < 25) playHungry();
      if (profile.knowledge >= 30 && nextKnowledge < 30) playKnowledgeWarning();

      updateProfile({
        hunger: nextHunger,
        energy: nextEnergy,
        fun: nextFun,
        knowledge: nextKnowledge,
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [profile.hunger, profile.knowledge]);

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

  const claimGift = () => {
    if (!hasGift) return;
    haptic("celebrate");
    playLevelUp();
    triggerBurst();
    updateProfile({
      coins: profile.coins + 50,
      lastDailyGift: today
    });
    toast.success(t("Recebeste o teu presente diário: 50 Abracadinhos! 🎁💰"), { icon: "🎉" });
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

  const handleMouseMove = (e: React.MouseEvent) => {
    const moveX = (e.clientX - window.innerWidth / 2) / 25;
    const moveY = (e.clientY - window.innerHeight / 2) / 25;
    setMousePos({ x: moveX, y: moveY });
  };

  const handleStatAction = (statId: string) => {
    if (statId === "talk") {
      playTap();
      navigate({ to: "/tutor", search: { mascotId: profile.mascot } });
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

      // Bonus: chance of finding a sticker when eating healthy!
      if (Math.random() > 0.7) {
        const sticker = getRandomSticker();
        if (!profile.unlockedStickers.includes(sticker.id)) {
          updateProfile({
            unlockedStickers: [...profile.unlockedStickers, sticker.id]
          });
          setNewSticker(sticker);
          playCorrect();
        }
      }

      updateProfile({ hunger: Math.min(100, profile.hunger + 20), coins: profile.coins - 5 });
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
      const trivia = getRandomTrivia(1)[0];
      setCurrentTrivia(trivia);
      setMood("thinking");
      setRoom("classroom");
      return; // Skip the default neutral timeout since we're in a minigame
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
  const stats = [
    { id: "hunger", icon: Utensils, value: profile.hunger, color: profile.hunger < 25 ? "bg-red-500" : "bg-orange-400", label: profile.hunger < 25 ? "Fome baixa" : "Fome", room: "kitchen" as RoomType },
    { id: "energy", icon: Zap, value: profile.energy, color: profile.energy < 25 ? "bg-red-500" : "bg-yellow-400", label: profile.energy < 25 ? "Energia baixa" : "Energia", room: "bedroom" as RoomType },
    { id: "fun", icon: Gamepad2, value: profile.fun, color: profile.fun < 25 ? "bg-red-500" : "bg-pink-400", label: profile.fun < 25 ? "Diversão baixa" : "Diversão", room: "living" as RoomType },
    { id: "knowledge", icon: GraduationCap, value: profile.knowledge, color: profile.knowledge < 30 ? "bg-red-600 animate-pulse" : "bg-blue-400", label: profile.knowledge < 30 ? "Conhecimento baixo" : "Conhecimento", room: "classroom" as RoomType },
    { id: "talk", icon: Mic, value: 100, color: "bg-indigo-400", label: "Conversar", room: "talk" as RoomType },
  ];

  const growthProgress = useMemo(() => {
    if (growth.stage === "bebé") return (profile.xp / 500) * 100;
    if (growth.stage === "júnior") return ((profile.xp - 500) / 1500) * 100;
    if (growth.stage === "aventureiro") return ((profile.xp - 2000) / 3000) * 100;
    return 100;
  }, [profile.xp, growth.stage]);

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

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn("relative flex h-full w-full flex-col overflow-hidden transition-colors duration-700 touch-none select-none", getBackground())}
    >
      {/* Dynamic Background Elements for Immersive Scenarios */}
      <AnimatePresence mode="wait">
        <motion.div
          key={room}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 z-0"
        >
          {room === "classroom" && (
            <>
              {/* Blackboard */}
              <div
                onClick={() => navigate({ to: "/tutor", search: { mascotId: profile.mascot } })}
                className="absolute left-[10%] right-[10%] top-[15%] h-[40%] rounded-xl border-8 border-amber-900 bg-emerald-900 shadow-2xl cursor-pointer hover:brightness-110 transition-all group"
              >
                <div className="flex h-full flex-col items-center justify-center p-4 text-white/20">
                  <div className="font-display text-4xl font-bold uppercase tracking-widest sm:text-6xl">
                    ABC • 123
                  </div>
                  <div className="mt-4 h-1 w-32 rounded-full bg-white/10" />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 text-xs mt-4 font-display">Toca para conversar com o {mascot.name}</div>
                </div>
              </div>
              {/* Desk shadow/floor line */}
              <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-amber-100/50" />
            </>
          )}

          {room === "kitchen" && (
            <>
              {/* Tiles pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              {/* Counter */}
              <div className="absolute bottom-0 left-0 right-0 h-[35%] border-t-4 border-orange-300 bg-white/40" />
            </>
          )}

          {room === "bedroom" && (
            <>
              {/* Window with stars */}
              <div className="absolute right-[10%] top-[10%] h-40 w-32 rounded-t-full border-4 border-white bg-indigo-950 p-4 shadow-inner">
                <div className="flex h-full items-center justify-center text-2xl">✨</div>
              </div>
              {/* Rug */}
              <div className="absolute bottom-[5%] left-1/2 h-[20%] w-[80%] -translate-x-1/2 rounded-[100%] bg-purple-400/30 blur-xl" />
            </>
          )}

          {room === "living" && (
            <>
              {/* Wallpaper pattern */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }} />
              {/* Floor */}
              <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-sky-100/40" />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div animate={{ x: mousePos.x, y: mousePos.y }} className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <div className="absolute left-[10%] top-[20%] text-9xl">☁️</div>
        <div className="absolute right-[15%] top-[10%] text-8xl">☁️</div>
        <div className="absolute bottom-[20%] left-[20%] text-7xl">🌳</div>
        <div className="absolute bottom-[10%] right-[25%] text-9xl">🌳</div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-white/10 via-transparent to-black/5 opacity-50" />

      <AnimatePresence>
        {photoMode && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-[100] bg-white" />}
      </AnimatePresence>

      <div className="relative z-10 flex justify-between p-4 px-6 pt-6">
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/30 px-4 py-2 shadow-lg backdrop-blur-xl">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            <span className="font-display text-base font-black text-slate-800">{profile.hearts}</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 rounded-2xl border border-orange-400/40 bg-orange-400/20 px-4 py-2 shadow-lg backdrop-blur-xl">
            <span className="text-xl">🔥</span>
            <span className="font-display text-base font-black text-orange-700">{profile.streak}</span>
          </motion.div>
        </div>

        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate({ to: "/tutor" })} className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/20 px-4 py-2 font-display text-sm font-bold text-primary shadow-lg backdrop-blur-xl transition-all hover:bg-primary/30">
            <MessageCircle className="h-4 w-4" /> {t("Conversar")}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate({ to: "/desafios" })} className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/20 px-4 py-2 font-display text-sm font-bold text-emerald-700 shadow-lg backdrop-blur-xl transition-all hover:bg-emerald-400/30">
            <ListChecks className="h-4 w-4" /> {t("Missões")}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate({ to: "/loja" })} className="flex items-center gap-2 rounded-2xl border border-xp/30 bg-xp/20 px-4 py-2 font-display text-sm font-bold text-xp shadow-lg backdrop-blur-xl transition-all hover:bg-xp/30">
            <ShoppingBag className="h-4 w-4" /> {t("Loja")}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={takePhoto} aria-label="Tirar foto" className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-2 font-display text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl transition-all hover:bg-white/30">
            <Camera className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setAlbumOpen(true)}
            aria-label="Álbum"
            className="flex items-center gap-2 rounded-2xl border border-indigo-400/40 bg-indigo-400/20 px-4 py-2 font-display text-sm font-bold text-indigo-700 shadow-lg backdrop-blur-xl transition-all hover:bg-indigo-400/30"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Álbum")}</span>
          </motion.button>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/30 px-4 py-2 shadow-lg backdrop-blur-xl">
          <Coins className="h-5 w-5 text-xp fill-current" />
          <span className="font-display text-base font-black text-slate-800">{profile.coins}</span>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-1 pt-2">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={cn("relative inline-flex items-center gap-2 rounded-full border-2 border-white px-4 py-1.5 backdrop-blur-sm shadow-sm", growth.stage === "mestre" ? "bg-amber-400 text-amber-950" : "bg-white/40 text-emerald-800")}>
          {growth.stage === "mestre" ? <SparklesIcon className="h-4 w-4 animate-pulse" /> : <TrendingUp className="h-4 w-4 text-emerald-600" />}
          <span className="font-display text-xs font-bold uppercase tracking-wider">{t(growth.label)}</span>
          {growth.stage === "mestre" && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-1 rounded-full border-2 border-amber-300" />}
        </motion.div>

        {/* Growth Progress Bar */}
        <div className="mt-1 w-32 h-1.5 overflow-hidden rounded-full bg-white/20 border border-white/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${growthProgress}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />
        </div>

        <span className="text-[10px] font-medium text-muted-foreground opacity-80">{REGIONS[region]?.flag} Região: {REGIONS[region]?.country}</span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        {currentTrivia ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="z-50 w-full max-w-sm rounded-[2.5rem] border-4 border-white bg-white/90 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 text-center">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                {currentTrivia.category}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-800">
                {currentTrivia.prompt}
              </h3>
            </div>

            <div className="grid gap-3">
              {currentTrivia.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (i === currentTrivia.answerIndex) {
                      haptic("celebrate");
                      playCorrect();
                      triggerBurst();
                      setMood("happy");
                      setBubble(t("Boa! Aprendi algo novo! 🧠✨"));
                      updateProfile({
                        knowledge: Math.min(100, profile.knowledge + 15),
                        xp: profile.xp + 10,
                        coins: profile.coins + 2
                      });
                      setCurrentTrivia(null);
                    } else {
                      haptic("error");
                      playWrong();
                      setMood("sad");
                      setBubble(t("Ups! Tenta outra vez..."));
                    }
                  }}
                  className="rounded-2xl border-2 border-slate-100 bg-white p-4 text-center font-display text-sm font-bold text-slate-700 transition-all hover:border-blue-400 hover:bg-blue-50"
                >
                  {opt}
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setCurrentTrivia(null)}
              className="mt-6 w-full text-center text-xs font-bold text-slate-500 hover:text-slate-600"
            >
              Agora não
            </button>
          </motion.div>
        ) : room === "games" ? (
          <div className="w-full max-w-md px-6 h-full overflow-y-auto pt-10 pb-20 scrollbar-none">
            {!selectedGame ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-4 pb-10">
                {miniGames.map((game) => (
                  <button key={game.id} onClick={() => { haptic("tap"); setSelectedGame(game.id); }} className="flex flex-col items-center justify-center gap-2 rounded-3xl border-4 border-white bg-white/60 p-6 shadow-lg transition-transform active:scale-95">
                    <span className="text-5xl">{game.emoji}</span>
                    <span className="font-display text-sm font-bold text-center">{game.name}</span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border-4 border-white bg-white/80 p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-xl">{miniGames.find(g => g.id === selectedGame)?.name}</h3>
                  <button onClick={() => setSelectedGame(null)} className="rounded-full bg-black/10 p-2 hover:bg-black/20"><X className="h-5 w-5" /></button>
                </div>
                <div className="min-h-[250px]">{ActiveGame && <ActiveGame />}</div>
                <div className="mt-6 flex justify-center">
                  <button onClick={() => { haptic("success"); playFun(); updateProfile({ fun: Math.min(100, profile.fun + 20), coins: profile.coins + 10 }); setSelectedGame(null); toast.success(t("Bom trabalho! Ganhaste 10 Abracadinhos! 💰")); }} className="btn-chunky flex items-center gap-2 rounded-full bg-success px-8 py-3 text-white">
                    <Play className="h-5 w-5 fill-current" /> {t("Concluir")}
                  </button>
                </div>
                {/* Win a sticker chance when finishing a game */}
                {Math.random() > 0.5 && (
                  <div className="mt-2 text-center text-[10px] font-bold text-indigo-400">
                    Dica: Continua a jogar para ganhares cromos raros! 🦁
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {hasGift && (
                <motion.button key="daily-gift" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} whileHover={{ scale: 1.1, rotate: 5 }} onClick={claimGift} className="absolute bottom-10 right-10 z-20 flex flex-col items-center gap-1 transition-transform active:scale-90">
                  <div className="relative">
                    <Gift className="h-14 w-14 text-amber-500 fill-amber-200" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-amber-400 blur-xl" />
                  </div>
                  <span className="font-display text-[10px] font-black uppercase text-amber-700">{t("Presente!")}</span>
                </motion.button>
              )}
              {room === "kitchen" && <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1 }} exit={{ opacity: 0, scale: 0 }} key="kitchen-icon" className="absolute left-10 top-1/2 text-6xl">🥣</motion.span>}
              {room === "bedroom" && <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.5, scale: 1 }} exit={{ opacity: 0, scale: 0 }} key="bedroom-icon" className="absolute right-10 top-1/3 text-6xl">🛌</motion.span>}
              {room === "classroom" && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} key="classroom-icon" className="absolute inset-0 flex flex-col items-center justify-start pt-20">
                  <div
                    onClick={() => setAlbumOpen(true)}
                    className="cursor-pointer hover:scale-110 transition-transform flex flex-col items-center"
                  >
                    <span className="text-6xl opacity-50 mb-2">📖</span>
                    <span className="bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-emerald-800 border border-white/40 uppercase tracking-widest">O meu Livro</span>
                  </div>
                  {region === "MZ" && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border-2 border-emerald-500 max-w-[280px] text-center mt-4"><MapPin className="h-5 w-5 text-emerald-600 mx-auto mb-2" /><p className="font-display text-sm text-emerald-900">Sabias que o <strong>Zambeze</strong> é o maior rio de Moçambique? 🌊</p></motion.div>}
                </motion.div>
              )}
            </AnimatePresence>

            {room === "talk" ? (
              <div className="relative scale-125 md:scale-150 transition-transform">
                {growth.stage === "mestre" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute inset-0 z-0">
                    {[...Array(6)].map((_, i) => (
                      <motion.span key={i} animate={{ y: [-20, -100], x: [0, (i % 2 === 0 ? 30 : -30)], opacity: [0, 1, 0], scale: [0, 1.5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} className="absolute left-1/2 top-1/2 text-xl">✨</motion.span>
                    ))}
                  </motion.div>
                )}
                <MascotVoiceTutor mascotId={profile.mascot} equippedItemId={profile.equippedItem} growthScale={growth.scale} />
              </div>
            ) : (
              <div
                onClick={handleMascotClick}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleMascotClick(); } }}
                role="button"
                tabIndex={0}
                aria-label="Interagir com mascote"
                className="relative cursor-pointer transition-transform active:scale-95 scale-110 md:scale-125"
              >
                {growth.stage === "mestre" && <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="pointer-events-none absolute -inset-10 z-0 rounded-full border-2 border-dashed border-amber-400/30" />}
                <MascotExpression mascotId={profile.mascot} size="xl" mood={mood} bubble={bubble} equippedItemId={profile.equippedItem} growthScale={growth.scale} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="relative z-10 p-6 pb-12">
        <div className="mx-auto flex max-w-lg justify-between gap-2 rounded-[2.5rem] border border-white/40 bg-white/40 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center gap-2">
              <motion.button whileHover={{ y: -5 }} whileTap={{ scale: 0.85 }} onClick={() => { setRoom(stat.room); handleStatAction(stat.id); }} aria-label={`${stat.label}: ${Math.round(stat.value)}%`} className={cn("relative flex h-16 w-16 items-center justify-center rounded-3xl border-4 border-white shadow-xl transition-all", room === stat.room ? stat.color : "bg-white/90")}>
                <stat.icon className={cn("h-7 w-7", room === stat.room ? "text-white" : "text-slate-600")} />

                {/* Visual cue for knowledge "feeding" */}
                {stat.id === "knowledge" && profile.knowledge < 30 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-blue-500 shadow-lg"
                  />
                )}
              </motion.button>
              {stat.id !== "talk" && (
                <div className="h-2 w-12 overflow-hidden rounded-full bg-slate-200/50" role="progressbar" aria-valuenow={Math.round(stat.value)} aria-valuemin={0} aria-valuemax={100} aria-label={stat.label}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stat.value}%` }} className={cn("h-full transition-all duration-1000 ease-out", stat.color)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {albumOpen && <StickerAlbum profile={profile} onClose={() => setAlbumOpen(false)} />}
        {newSticker && <StickerPackOpening sticker={newSticker} onClose={() => setNewSticker(null)} />}
      </AnimatePresence>
    </div>
  );
}
