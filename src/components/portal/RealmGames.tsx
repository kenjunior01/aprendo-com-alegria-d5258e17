// RealmGames.tsx — Os 5 reinos do Mundo Kidoz Premium.
// Um motor de quiz partilhado com "cenas" visuais por reino:
// 🌋 lava que sobe · 🚀 viagem espacial · 🧪 poções · 🏰 janelas que acendem · 🐉 chefe final.
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Flame, Fuel, Heart } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { finishRealm, markTourUsed, realmQuestions, type RealmDef } from "@/lib/premiumWorld";
import type { GenQuestion } from "@/lib/infiniteChallenges";

interface Props {
  realm: RealmDef;
  grade: number;
  /** modo visita guiada (não-premium): 3 perguntas, sem recompensas reais */
  demo?: boolean;
  onExit: () => void;
}

interface Finish {
  correct: number;
  total: number;
  crystals: number;
  coins: number;
  xp: number;
  perfect: boolean;
  early?: string; // motivo do fim antecipado
  bonusTitle?: string;
}

const POTION_NAMES = [
  "Poção do Arco-Íris",
  "Elixir da Chuva Doce",
  "Soro Luminoso",
  "Essência de Estrela",
  "Ferromenta Vulcânica",
  "Banha de Dragão",
];

export function RealmGame({ realm, grade, demo, onExit }: Props) {
  const questions = useMemo<GenQuestion[]>(
    () => realmQuestions(realm, grade).slice(0, demo ? 3 : realm.questions),
    [realm, grade, demo],
  );
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [wrongShake, setWrongShake] = useState(0);
  const endedRef = useRef(false);

  const total = questions.length;
  const q = questions[idx];

  // ── estado por reino ──
  const lava = Math.max(0, Math.min(100, 40 + (idx - correct) * 12 - correct * 6));
  const fuel = 4 - (idx - correct); // galáxia: erros gastam combustível
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
        early,
      });
      return;
    }
    const discovery =
      realm.id === "lab" && finalCorrect >= Math.ceil(total * 0.6)
        ? POTION_NAMES[Math.min(POTION_NAMES.length - 1, finalCorrect - 1)]
        : undefined;
    const goldenKey = realm.id === "castelo" && (extras?.goldenKey || finalCorrect >= total);
    const slain =
      realm.id === "dragao" && (extras?.dragonSlain || finalCorrect >= Math.ceil(total * 0.7));
    const r = finishRealm(realm, finalCorrect, { discovery, goldenKey, dragonSlain: slain });
    setFinish({
      correct: finalCorrect,
      total,
      crystals: r.crystals,
      coins: r.coins,
      xp: r.xp,
      perfect: r.perfect,
      early,
      bonusTitle: slain
        ? "🐉 Dragão derrotado — és uma Lenda Kidoz!"
        : goldenKey
          ? "🔑 Chave Dourada conquistada!"
          : discovery
            ? `📖 Descoberta registada: ${discovery}`
            : undefined,
    });
    haptic(finalCorrect >= total / 2 ? "celebrate" : "success");
  };

  const answer = (i: number) => {
    if (picked !== null || finish) return;
    setPicked(i);
    const isRight = i === q.answerIndex;
    if (isRight) {
      haptic("success");
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setTimeout(() => advance(newCorrect), 850);
    } else {
      haptic("error");
      setWrongShake((s) => s + 1);
      setTimeout(() => advance(correct), 1150);
    }
  };

  const advance = (newCorrect: number) => {
    const nextIdx = idx + 1;
    // Fins antecipados por reino
    if (realm.id === "vulcao") {
      const nextLava = Math.max(
        0,
        Math.min(100, 40 + (nextIdx - newCorrect) * 12 - newCorrect * 6),
      );
      if (nextLava >= 100) {
        endRun(newCorrect, "A lava transbordou! 🌋");
        return;
      }
    }
    if (realm.id === "galaxia" && 4 - (nextIdx - newCorrect) <= 0) {
      endRun(newCorrect, "Sem combustível! 🛸");
      return;
    }
    if (realm.id === "dragao" && 3 - (nextIdx - newCorrect) <= 0) {
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
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="font-display text-sm text-white tabular-nums">
            {finish ? finish.crystals : correct * 2} ✦
          </span>
        </div>
        <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-display text-xs text-white/90 tabular-nums">
          {Math.min(idx + (finish ? 0 : 1), total)}/{total}
        </div>
      </div>

      {/* Cena do reino */}
      <div className="px-4 pt-4">
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
                  return (
                    <motion.button
                      key={`${idx}-${i}`}
                      whileTap={picked === null ? { scale: 0.96 } : undefined}
                      animate={picked === i && isAnswer === false ? { x: [0, -8, 8, -5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={() => answer(i)}
                      disabled={revealed}
                      className={cn(
                        "min-h-[58px] rounded-2xl border-2 px-4 py-3 text-left font-display text-base transition-colors",
                        !revealed &&
                          "border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/20",
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
            <p className="mt-2 font-display text-2xl text-white">
              {finish.correct}/{finish.total} acertos
            </p>
            {finish.early && <p className="mt-1 text-sm text-white/70">{finish.early}</p>}
            {finish.bonusTitle && (
              <p className="mt-1 font-display text-sm text-amber-300">{finish.bonusTitle}</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Reward label="Cristais" value={`✦ ${finish.crystals}`} />
              <Reward label="Moedas" value={`🪙 ${finish.coins}`} />
              <Reward label="XP" value={`⭐ ${finish.xp}`} />
            </div>
            {demo && (
              <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-400/15 p-3">
                <p className="font-display text-sm text-amber-200">
                  👑 Gostaste? O Mundo completo tem 5 reinos, cristais a sério e prémios!
                </p>
                <ChunkyButton onClick={onExit} className="mt-2 w-full">
                  Desbloquear o Mundo Premium
                </ChunkyButton>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
              i < 3 - (idx - correct) ? "fill-red-500 text-red-400" : "text-white/20",
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
