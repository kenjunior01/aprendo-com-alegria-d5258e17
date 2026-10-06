// RealmGames.tsx — Os 5 reinos do Mundo Kidoz Premium.
// Um motor de quiz partilhado com "cenas" visuais por reino:
// 🌋 lava que sobe · 🚀 viagem espacial · 🧪 poções · 🏰 janelas que acendem · 🐉 chefe final.
// Suporta 3 níveis por reino (Bronze/Prata/Ouro), estrelas e power-ups
// (🛡️ escudo · 💡 dica 50/50 · ✦×2 dobro) comprados no Bazar dos Cristais.
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Flame, Fuel, Heart, Shield, Lightbulb } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import {
  playCorrect,
  playCoins,
  playDanger,
  playLevelUp,
  playPortal,
  playShield as playShieldSfx,
  playStar,
  playTap,
  playWrong,
} from "@/lib/audio";
import { MascotActor, type ActorMood } from "@/components/MascotActor";
import { getMascot, type MascotId } from "@/lib/mascots";
import {
  finishRealm,
  markTourUsed,
  realmQuestions,
  realmQuestionCount,
  REALM_LEVELS,
  type RealmDef,
  type RealmId,
  type SupplyKey,
} from "@/lib/premiumWorld";
import type { GenQuestion } from "@/lib/infiniteChallenges";

export interface GameSupplies {
  shield: number;
  hint: number;
  double: number;
}

export interface GamePerks {
  startShield: boolean;
  freeHint: boolean;
}

interface Props {
  realm: RealmDef;
  grade: number;
  /** 0 = Bronze, 1 = Prata, 2 = Ouro */
  levelIdx: number;
  /** seed da tentativa — cada jogo tem perguntas novas */
  seed?: number;
  /** modo visita guiada (não-premium): 3 perguntas, sem recompensas reais */
  demo?: boolean;
  supplies?: GameSupplies;
  perks?: GamePerks;
  onUseSupply?: (kind: SupplyKey) => void;
  onExit: () => void;
  /** jogar o nível seguinte do mesmo reino */
  onNextLevel?: () => void;
  /** mascote da criança — treinadora viva do reino */
  mascotId?: MascotId | null;
  /** criatura equipada do Bazar (emoji) — reage às jogadas */
  creatureEmoji?: string | null;
}

interface Finish {
  correct: number;
  total: number;
  crystals: number;
  coins: number;
  xp: number;
  perfect: boolean;
  stars: number;
  nextUnlocked: boolean;
  early?: string; // motivo do fim antecipado
  bonusTitle?: string;
  newTitle?: string | null;
}

const POTION_NAMES = [
  "Poção do Arco-Íris",
  "Elixir da Chuva Doce",
  "Soro Luminoso",
  "Essência de Estrela",
  "Ferromenta Vulcânica",
  "Banha de Dragão",
];

// ─── Falas da treinadora viva (por reino) ───
const REALM_COACH: Record<RealmId, { intro: string; danger: string; win: string[] }> = {
  vulcao: {
    intro: "A lava sobe a cada erro — acerta para a arrefecer!",
    danger: "A lava está a ficar QUENTE! Respira fundo! \ud83c\udf0b",
    win: ["A lava baixou — que herói!", "Vulcão meio domado, continua!", "Esmagaste a erupção!"],
  },
  galaxia: {
    intro: "Respostas certas são combustível. Boa viagem!",
    danger: "Só resta 1 de combustível! Concentra-te! \ud83d\udef8",
    win: ["Motor a toda a força!", "Meio universo visitado!", "Aterragem estelar!"],
  },
  lab: {
    intro: "Cada acerto enche o frasco da poção mágica!",
    danger: "A poção está a agitar-se! Cuidado! \ud83e\uddea",
    win: ["A mistura borbulha bem!", "Metade do frasco cheio!", "Poção perfeita, alquimista!"],
  },
  castelo: {
    intro: "Acerta para acender as janelas do castelo!",
    danger: "O castelo está a escurecer outra vez! \ud83c\udff0",
    win: ["Que luz tão bonita!", "Metade do castelo acesa!", "Castelo brilhante por completo!"],
  },
  dragao: {
    intro: "O dragão guarda o tesouro — cada acerto é um golpe!",
    danger: "O dragão está a atacar! Não falhes! \ud83d\udc09",
    win: ["Direto ao dragão!", "O dragão fraqueja!", "Golpe de Lenda!"],
  },
};

const CELEBRATE_LINES = ["Embalada! Não pares!", "És imparável!", "Ritmo de Lenda!"];

export function RealmGame({
  realm,
  grade,
  levelIdx,
  seed = 0,
  demo,
  supplies,
  perks,
  onUseSupply,
  onExit,
  onNextLevel,
  mascotId,
  creatureEmoji,
}: Props) {
  const questions = useMemo<GenQuestion[]>(
    () =>
      realmQuestions(realm, grade, levelIdx, seed).slice(
        0,
        demo ? 3 : realmQuestionCount(realm, levelIdx),
      ),
    [realm, grade, levelIdx, seed, demo],
  );
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [wrongShake, setWrongShake] = useState(0);
  const endedRef = useRef(false);

  // ── Power-ups (inventário local de esta jogada) ──
  const [hintsLeft, setHintsLeft] = useState(
    demo ? 0 : (supplies?.hint ?? 0) + (perks?.freeHint ? 1 : 0),
  );
  const [shieldsLeft, setShieldsLeft] = useState(
    demo ? 0 : (supplies?.shield ?? 0) + (perks?.startShield ? 1 : 0),
  );
  const [doublesLeft, setDoublesLeft] = useState(demo ? 0 : (supplies?.double ?? 0));
  const [doubleActive, setDoubleActive] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [shieldFlash, setShieldFlash] = useState(0);
  /** erros NÃO absorvidos por escudo — é isto que sobe a lava / gasta combustível */
  const [unguarded, setUnguarded] = useState(0);

  const total = questions.length;
  const q = questions[idx];
  const levelDef = REALM_LEVELS[levelIdx] ?? REALM_LEVELS[0];

  // ── Treinadora viva (mascote + falas reativas) ──
  const mascot = mascotId ? getMascot(mascotId) : null;
  const [coach, setCoach] = useState<{ line: string; mood: ActorMood; k: number }>(() => ({
    line: REALM_COACH[realm.id].intro,
    mood: "neutral" as ActorMood,
    k: 0,
  }));
  const [streak, setStreak] = useState(0);
  const [creatureBurst, setCreatureBurst] = useState(0);
  const dangerFlags = useRef({ lava: false, fuel: false, heart: false });
  const say = (line: string, mood: ActorMood) => setCoach((c) => ({ line, mood, k: c.k + 1 }));

  // Aviso de perigo (uma vez por limite) + som
  const checkDanger = (ug: number) => {
    const f = dangerFlags.current;
    let hit = false;
    if (realm.id === "vulcao" && !f.lava && 40 + ug * 12 - correct * 6 >= 70) {
      f.lava = true;
      hit = true;
    }
    if (realm.id === "galaxia" && !f.fuel && 4 - ug <= 1) {
      f.fuel = true;
      hit = true;
    }
    if (realm.id === "dragao" && !f.heart && 3 - ug <= 1) {
      f.heart = true;
      hit = true;
    }
    if (hit) {
      playDanger();
      say(REALM_COACH[realm.id].danger, "worried");
    }
  };

  // Som de entrada do reino (o componente remonta por jogo)
  useEffect(() => {
    playPortal();
  }, []);

  // ── estado por reino ──
  const lava = Math.max(0, Math.min(100, 40 + unguarded * 12 - correct * 6));
  const fuel = 4 - unguarded; // galáxia: erros gastam combustível
  const windowsLit = correct; // castelo
  const dragonHP = Math.max(0, total - correct);

  const endRun = (
    finalCorrect: number,
    early?: string,
    extras?: { goldenKey?: boolean; dragonSlain?: boolean; discovery?: string },
  ) => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (demo) {
      markTourUsed();
      setFinish({
        correct: finalCorrect,
        total,
        crystals: finalCorrect * 2,
        coins: 0,
        xp: 0,
        perfect: finalCorrect >= total,
        stars:
          finalCorrect >= total
            ? 3
            : finalCorrect >= Math.ceil(total * 0.8)
              ? 2
              : finalCorrect >= Math.ceil(total * 0.6)
                ? 1
                : 0,
        nextUnlocked: false,
        early,
      });
      haptic("success");
      playLevelUp();
      say("Gostaste? O Mundo completo tem 5 reinos e criaturas mágicas!", "celebrate");
      return;
    }
    const discovery =
      realm.id === "lab" && finalCorrect >= Math.ceil(total * 0.6)
        ? POTION_NAMES[Math.min(POTION_NAMES.length - 1, finalCorrect - 1)]
        : undefined;
    const goldenKey = realm.id === "castelo" && (extras?.goldenKey || finalCorrect >= total);
    const slain =
      realm.id === "dragao" && (extras?.dragonSlain || finalCorrect >= Math.ceil(total * 0.7));
    const r = finishRealm(realm, levelIdx, finalCorrect, {
      discovery,
      goldenKey,
      dragonSlain: slain,
      doubled: doubleActive,
    });
    setFinish({
      correct: finalCorrect,
      total,
      crystals: r.crystals,
      coins: r.coins,
      xp: r.xp,
      perfect: r.perfect,
      stars: r.starsEarned,
      nextUnlocked: r.nextUnlocked,
      early,
      bonusTitle: slain
        ? "🐉 Dragão derrotado — és uma Lenda Kidoz!"
        : goldenKey
          ? "🔑 Chave Dourada conquistada!"
          : discovery
            ? `📖 Descoberta registada: ${discovery}`
            : undefined,
      newTitle: r.newTitle,
    });
    haptic(finalCorrect >= total / 2 ? "celebrate" : "success");
    playLevelUp();
    for (let s = 0; s < r.starsEarned; s++) {
      setTimeout(() => playStar(), 650 + s * 380);
    }
    if (early) {
      say(mascot?.encourage ?? "Quase! Treina e volta mais forte!", "sad");
    } else {
      const wins = REALM_COACH[realm.id].win;
      say(wins[finalCorrect % wins.length], r.starsEarned >= 2 ? "celebrate" : "happy");
    }
  };

  const answer = (i: number) => {
    if (picked !== null || finish) return;
    setPicked(i);
    const isRight = i === q.answerIndex;
    if (isRight) {
      haptic("success");
      playCorrect();
      const ns = streak + 1;
      setStreak(ns);
      setCreatureBurst((b) => b + 1);
      if (ns % 3 === 0 && !finish) {
        const wins = REALM_COACH[realm.id].win;
        say(CELEBRATE_LINES[(Math.floor(ns / 3) - 1) % CELEBRATE_LINES.length], "celebrate");
      } else {
        setCoach((c) => ({ ...c, mood: "happy" as ActorMood }));
      }
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setTimeout(() => advance(newCorrect, false, false), 850);
    } else {
      haptic("error");
      playWrong();
      setWrongShake((s) => s + 1);
      setStreak(0);
      const hadShield = shieldsLeft > 0;
      if (hadShield) {
        // O escudo absorve o erro: sem penalização para o reino
        setShieldsLeft((n) => n - 1);
        onUseSupply?.("shield");
        setShieldFlash((f) => f + 1);
        playShieldSfx();
        say("\ud83d\udee1 Escudo ativado — erro absorvido!", "excited");
      } else {
        setUnguarded((u) => u + 1);
        // Momento de ensino: a resposta certa fica visível (borda verde) e a
        // treinadora diz o que era — com tempo extra para ler antes de avançar.
        say(
          `A resposta certa era “${q.options[q.answerIndex]}”. ${mascot?.encourage ?? "Agora já sabes para a próxima!"}`,
          "sad",
        );
        checkDanger(unguarded + 1);
      }
      const newCorrect = correct;
      setTimeout(() => advance(newCorrect, true, hadShield), hadShield ? 1150 : 2100);
    }
  };

  const useHint = () => {
    if (demo || picked !== null || finish || !q) return;
    if (hintsLeft <= 0) return;
    setHintsLeft((n) => n - 1);
    onUseSupply?.("hint");
    haptic("tap");
    playTap();
    const wrongIdx = q.options.map((_, i) => i).filter((i) => i !== q.answerIndex);
    // embaralhar e tirar 2
    for (let i = wrongIdx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongIdx[i], wrongIdx[j]] = [wrongIdx[j], wrongIdx[i]];
    }
    setRemoved(wrongIdx.slice(0, Math.min(2, wrongIdx.length - 1)));
  };

  const useDouble = () => {
    if (demo || doubleActive || finish) return;
    if (doublesLeft <= 0) return;
    setDoublesLeft((n) => n - 1);
    onUseSupply?.("double");
    setDoubleActive(true);
    haptic("celebrate");
    playCoins();
  };

  const advance = (newCorrect: number, wasWrong: boolean, hadShield: boolean) => {
    const nextIdx = idx + 1;
    setRemoved([]);
    // Erros efetivos (só os não absorvidos por escudo penalizam)
    const effectiveWrong = unguarded + (wasWrong && !hadShield ? 1 : 0);
    if (realm.id === "vulcao") {
      const nextLava = Math.max(0, Math.min(100, 40 + effectiveWrong * 12 - newCorrect * 6));
      if (nextLava >= 100) {
        endRun(newCorrect, "A lava transbordou! 🌋");
        return;
      }
    }
    if (realm.id === "galaxia" && 4 - effectiveWrong <= 0) {
      endRun(newCorrect, "Sem combustível! 🛸");
      return;
    }
    if (realm.id === "dragao" && 3 - effectiveWrong <= 0) {
      endRun(newCorrect, "O dragão afastou-te da caverna! 🐉");
      return;
    }
    if (nextIdx >= total) {
      endRun(newCorrect, undefined, { goldenKey: newCorrect >= total, dragonSlain: true });
      return;
    }
    setIdx(nextIdx);
    setPicked(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-b from-[#0b1030] via-[#141b45] to-[#1e1450]">
      {/* HUD */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <button
          onClick={() => {
            haptic("tap");
            onExit();
          }}
          aria-label="Sair do reino"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-white backdrop-blur transition-transform active:scale-90"
        >
          <X className="h-5 w-5" strokeWidth={3} />
        </button>
        <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
          <Sparkles
            className={cn("h-4 w-4", doubleActive ? "text-fuchsia-300" : "text-amber-300")}
          />
          <span className="font-display text-sm text-white tabular-nums">
            {finish ? finish.crystals : correct * 2} ✦{doubleActive && !finish ? " ×2" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Power-ups */}
          {!demo && !finish && (
            <>
              <button
                onClick={useHint}
                disabled={hintsLeft <= 0}
                aria-label="Usar dica mágica"
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur transition-transform active:scale-90",
                  hintsLeft > 0
                    ? "border-amber-300/60 bg-amber-400/25 text-amber-100"
                    : "border-white/15 bg-white/5 text-white/30",
                )}
              >
                <Lightbulb className="h-5 w-5" />
                {hintsLeft > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 font-display text-[10px] font-black text-amber-950">
                    {hintsLeft}
                  </span>
                )}
              </button>
              <button
                onClick={useDouble}
                disabled={doublesLeft <= 0 || doubleActive}
                aria-label="Ativar dobro de cristais"
                className={cn(
                  "relative flex h-11 min-w-11 items-center justify-center rounded-2xl border px-1.5 font-display text-xs backdrop-blur transition-transform active:scale-90",
                  doubleActive
                    ? "border-fuchsia-300 bg-fuchsia-400/40 text-white"
                    : doublesLeft > 0
                      ? "border-fuchsia-300/60 bg-fuchsia-400/20 text-fuchsia-100"
                      : "border-white/15 bg-white/5 text-white/30",
                )}
              >
                ×2
                {doublesLeft > 0 && !doubleActive && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-400 px-1 font-display text-[10px] font-black text-fuchsia-950">
                    {doublesLeft}
                  </span>
                )}
              </button>
            </>
          )}
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-display text-xs text-white/90 tabular-nums">
            {Math.min(idx + (finish ? 0 : 1), total)}/{total}
          </div>
        </div>
      </div>

      {/* Nível atual */}
      <p className="mt-2 text-center font-display text-[11px] uppercase tracking-[0.25em] text-white/50">
        {levelDef.key === "bronze" ? "🥉" : levelDef.key === "prata" ? "🥈" : "🥇"} Nível{" "}
        {levelDef.name}
      </p>

      {/* Treinadora viva: mascote + criatura reagem em tempo real */}
      {mascot && (
        <RealmCoach
          mascotId={mascot.id}
          creatureEmoji={creatureEmoji ?? null}
          line={coach.line}
          mood={coach.mood}
          burst={creatureBurst}
        />
      )}

      {/* Flash do escudo */}
      <AnimatePresence>
        {shieldFlash > 0 && !finish && (
          <motion.div
            key={shieldFlash}
            initial={{ opacity: 0, y: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14 }}
            className="pointer-events-none absolute left-1/2 top-16 z-10 -translate-x-1/2"
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/60 bg-sky-400/30 px-3 py-1 font-display text-sm text-sky-100 backdrop-blur">
              <Shield className="h-4 w-4" /> Escudo absorveu o erro!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cena do reino */}
      <div className="px-4 pt-2">
        <RealmScene
          realm={realm}
          picked={picked}
          answer={q?.answerIndex ?? -1}
          correct={correct}
          total={total}
          lava={lava}
          fuel={fuel}
          windowsLit={windowsLit}
          dragonHP={dragonHP}
          unguarded={unguarded}
          shake={wrongShake}
          idx={idx}
        />
      </div>

      {/* Pergunta + opções */}
      <div className="mx-auto mt-4 w-full max-w-[36rem] flex-1 overflow-y-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {!finish && q && (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mb-1 text-center font-display text-xs uppercase tracking-[0.2em] text-white/50">
                {realm.emoji} {realm.name}
              </p>
              <p className="mb-4 text-center font-display text-xl leading-snug text-white sm:text-2xl">
                {q.prompt}
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const isAnswer = i === q.answerIndex;
                  const isPicked = picked === i;
                  const revealed = picked !== null;
                  const hidden = removed.includes(i) && !revealed;
                  return (
                    <motion.button
                      key={`${idx}-${i}`}
                      whileTap={picked === null && !hidden ? { scale: 0.96 } : undefined}
                      animate={picked === i && isAnswer === false ? { x: [0, -8, 8, -5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={() => answer(i)}
                      disabled={revealed || hidden}
                      className={cn(
                        "min-h-[58px] rounded-2xl border-2 px-4 py-3 text-left font-display text-base transition-colors",
                        !revealed &&
                          !hidden &&
                          "border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/20",
                        hidden &&
                          "border-white/5 bg-white/[0.03] text-white/20 line-through opacity-50",
                        revealed && isAnswer && "border-success bg-success/25 text-white",
                        revealed &&
                          isPicked &&
                          !isAnswer &&
                          "border-red-400 bg-red-500/25 text-white",
                        revealed &&
                          !isPicked &&
                          !isAnswer &&
                          "border-white/10 bg-white/5 text-white/40",
                      )}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ecrã final */}
        {finish && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-2 max-w-sm rounded-3xl border-2 border-white/25 bg-white/10 p-5 text-center backdrop-blur-xl"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 1.2, repeat: 1 }}
              className="text-6xl"
            >
              {finish.perfect ? "🏆" : finish.correct >= total / 2 ? "🎉" : "💪"}
            </motion.div>
            {/* Estrelas */}
            <div className="mt-1 flex justify-center gap-1">
              {[0, 1, 2].map((s) => (
                <motion.span
                  key={s}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={
                    s < finish.stars
                      ? { scale: 1, rotate: 0 }
                      : { scale: 1, rotate: 0, opacity: 0.25 }
                  }
                  transition={{ delay: 0.3 + s * 0.25, type: "spring", stiffness: 260 }}
                  className={cn("text-3xl", s < finish.stars ? "grayscale-0" : "grayscale")}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <p className="mt-1 font-display text-2xl text-white">
              {finish.correct}/{finish.total} acertos
            </p>
            {finish.early && <p className="mt-1 text-sm text-white/70">{finish.early}</p>}
            {finish.bonusTitle && (
              <p className="mt-1 font-display text-sm text-amber-300">{finish.bonusTitle}</p>
            )}
            {finish.newTitle && (
              <p className="mt-1 font-display text-sm text-violet-300">
                🏅 Novo título: <b>{finish.newTitle}</b>
              </p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Reward label="Cristais" value={`✦ ${finish.crystals}`} />
              <Reward label="Moedas" value={`🪙 ${finish.coins}`} />
              <Reward label="XP" value={`⭐ ${finish.xp}`} />
            </div>
            {demo && (
              <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-400/15 p-3">
                <p className="font-display text-sm text-amber-200">
                  👑 Gostaste? O Mundo completo tem 5 reinos × 3 níveis, criaturas e prémios!
                </p>
                <ChunkyButton onClick={onExit} className="mt-2 w-full">
                  Desbloquear o Mundo Premium
                </ChunkyButton>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {!demo && finish.nextUnlocked && onNextLevel && (
                <ChunkyButton onClick={onNextLevel} className="flex-1">
                  ⬆️ Nível seguinte
                </ChunkyButton>
              )}
              <ChunkyButton tone="secondary" onClick={onExit} className="flex-1">
                Voltar ao Portal
              </ChunkyButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Reward({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-white/60">{label}</p>
      <p className="font-display text-sm text-white">{value}</p>
    </div>
  );
}

// ─── Treinadora viva: mascote emocional + criatura companheira ───
function RealmCoach({
  mascotId,
  creatureEmoji,
  line,
  mood,
  burst,
}: {
  mascotId: MascotId;
  creatureEmoji: string | null;
  line: string;
  mood: ActorMood;
  burst: number;
}) {
  return (
    <div className="mx-auto mt-1.5 flex w-full max-w-[36rem] items-center gap-1.5 px-4">
      <div className="-my-2 shrink-0 scale-[0.72]">
        <MascotActor mascotId={mascotId} size="sm" mood={mood} calm />
      </div>
      {creatureEmoji && (
        <motion.span
          key={burst}
          initial={false}
          animate={burst > 0 ? { scale: [1, 1.4, 1], rotate: [0, 12, -8, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="shrink-0 text-xl drop-shadow"
          title="A tua criatura companheira"
        >
          {creatureEmoji}
        </motion.span>
      )}
      <motion.p
        key={line}
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="min-w-0 flex-1 rounded-2xl rounded-bl-sm border border-white/20 bg-white/10 px-3 py-1.5 font-display text-xs leading-snug text-white backdrop-blur"
      >
        {line}
      </motion.p>
    </div>
  );
}

// ─── Cena visual por reino ───
function RealmScene({
  realm,
  picked,
  answer,
  correct,
  total,
  lava,
  fuel,
  windowsLit,
  dragonHP,
  unguarded,
  shake,
  idx,
}: {
  realm: RealmDef;
  picked: number | null;
  answer: number;
  correct: number;
  total: number;
  lava: number;
  fuel: number;
  windowsLit: number;
  dragonHP: number;
  unguarded: number;
  shake: number;
  idx: number;
}) {
  const revealed = picked !== null;
  const lastRight = revealed && picked === answer;

  if (realm.id === "vulcao") {
    return (
      <div className="relative mx-auto h-36 w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-orange-950/60 to-red-900/40">
        <div
          className="absolute inset-x-0 bottom-0 transition-all duration-700"
          style={{
            height: `${lava}%`,
            background: "linear-gradient(180deg,#fbbf24,#ef4444 60%,#b91c1c)",
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-x-0 top-0 h-2 bg-amber-300/80 blur-[2px]"
          />
        </div>
        <div className="relative flex h-full flex-col items-center justify-between py-3">
          <motion.span
            key={shake}
            animate={
              revealed && !lastRight
                ? { x: [0, -8, 8, -5, 0] }
                : { scale: lastRight ? [1, 1.25, 1] : 1 }
            }
            transition={{ duration: 0.45 }}
            className="text-5xl drop-shadow-lg"
          >
            🌋
          </motion.span>
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 font-display text-xs text-white backdrop-blur">
            <Flame className={cn("h-4 w-4", lava > 70 ? "text-red-400" : "text-amber-300")} />
            Lava: {100 - Math.round(lava)}%
          </div>
        </div>
      </div>
    );
  }

  if (realm.id === "galaxia") {
    const planets = ["🪐", "🌕", "🔴"];
    return (
      <div className="relative mx-auto h-36 w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-indigo-950/70 to-violet-900/40">
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{ left: `${(i * 37) % 95}%`, top: `${(i * 53) % 85}%` }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <div className="relative flex h-full items-center justify-between px-5">
          {planets.map((p, i) => {
            const reached = idx >= (i + 1) * 2 - 1;
            return (
              <motion.span
                key={p}
                animate={reached ? { scale: [1, 1.3, 1] } : { opacity: 0.45 }}
                className={cn("text-4xl", !reached && "grayscale")}
              >
                {p}
              </motion.span>
            );
          })}
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [-8, 0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="text-5xl"
          >
            🚀
          </motion.span>
        </div>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/40 px-3 py-1 font-display text-xs text-white backdrop-blur">
          <Fuel className={cn("h-4 w-4", fuel <= 1 ? "text-red-400" : "text-cyan-300")} />
          Combustível: {Math.max(0, fuel)}
        </div>
      </div>
    );
  }

  if (realm.id === "lab") {
    const colors = ["#10b981", "#14b8a6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444"];
    const fill = Math.round((correct / total) * 100);
    return (
      <div className="relative mx-auto flex h-36 w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-emerald-950/60 to-teal-900/40">
        <motion.div
          key={shake}
          animate={revealed && !lastRight ? { x: [0, -8, 8, -5, 0], rotate: [0, -6, 6, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="relative mx-auto h-24 w-20 overflow-hidden rounded-b-[2.5rem] rounded-t-lg border-4 border-white/60 bg-white/10">
            <motion.div
              animate={{
                height: `${fill}%`,
                backgroundColor: colors[Math.min(colors.length - 1, correct)],
              }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-0 w-full"
            />
            {lastRight &&
              [...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-2 left-1/2 h-2 w-2 rounded-full bg-white/80"
                  animate={{ y: [-10, -70 - i * 8], x: [(i - 3) * 6], opacity: [1, 0] }}
                  transition={{ duration: 0.9, delay: i * 0.08 }}
                />
              ))}
          </div>
          <div className="mx-auto -mt-1 h-2 w-28 rounded-full bg-white/60" />
        </motion.div>
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 font-display text-xs text-white backdrop-blur">
          Frasco enchido: {fill}%
        </p>
      </div>
    );
  }

  if (realm.id === "castelo") {
    return (
      <div className="relative mx-auto h-36 w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-sky-950/70 to-indigo-900/40">
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-end gap-1">
          {[...Array(total)].map((_, i) => (
            <motion.div
              key={i}
              animate={
                i < windowsLit
                  ? { backgroundColor: ["#fbbf24", "#fef08a", "#fbbf24"] }
                  : { backgroundColor: "#1e293b" }
              }
              transition={i < windowsLit ? { duration: 1.6, repeat: Infinity } : { duration: 0.3 }}
              className="w-5 rounded-t-md border border-white/30"
              style={{ height: `${28 + (i % 3) * 10}px` }}
            />
          ))}
        </div>
        <motion.span
          key={shake}
          animate={
            revealed && !lastRight ? { x: [0, -8, 8, -5, 0] } : lastRight ? { y: [0, -6, 0] } : {}
          }
          transition={{ duration: 0.5 }}
          className="absolute right-4 top-3 text-4xl"
        >
          🏰
        </motion.span>
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 font-display text-xs text-white backdrop-blur">
          Janelas acesas: {windowsLit}/{total}
        </p>
      </div>
    );
  }

  // dragao
  return (
    <div className="relative mx-auto h-36 w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-amber-950/60 to-red-900/40">
      <motion.span
        key={shake}
        animate={
          revealed && !lastRight
            ? { x: [0, -10, 10, -6, 0], rotate: [0, -5, 5, 0] }
            : lastRight
              ? { scale: [1, 0.9, 1.1, 1], rotate: [0, 10, -10, 0] }
              : { y: [0, -4, 0] }
        }
        transition={{ duration: 0.55 }}
        className="absolute left-4 top-4 text-5xl"
      >
        🐉
      </motion.span>
      <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
        {[...Array(3)].map((_, i) => (
          <Heart
            key={i}
            className={cn(
              "h-5 w-5",
              i < 3 - unguarded ? "fill-red-500 text-red-400" : "text-white/20",
            )}
          />
        ))}
      </div>
      <div className="absolute bottom-3 left-4 right-4">
        <p className="mb-1 text-center font-display text-[10px] uppercase tracking-widest text-white/60">
          Dragão
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-black/50">
          <motion.div
            animate={{ width: `${(dragonHP / total) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
          />
        </div>
      </div>
    </div>
  );
}
