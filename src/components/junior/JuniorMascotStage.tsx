import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles, Lock } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { speak } from "@/lib/audio";
import {
  computeMascotState,
  setScene,
  setVoice,
  getVoiceParams,
  listVoices,
  autoUnlockScenes,
  SCENES,
  EMOTION_EMOJI,
  type SceneId,
  type VoiceTone,
} from "@/lib/juniorMascot";
import type { JuniorChild, JuniorProgress } from "@/lib/junior";

interface Props {
  child: JuniorChild;
  progress: JuniorProgress;
}

export function JuniorMascotStage({ child, progress }: Props) {
  const [tick, setTick] = useState(0);
  const state = useMemo(
    () => computeMascotState(child.id, progress),
    [child.id, progress, tick],
  );

  // Auto-unlock newly available scenes when progress changes
  useEffect(() => { autoUnlockScenes(child.id, progress); }, [child.id, progress]);

  // Greet once per mount/child
  useEffect(() => {
    const v = getVoiceParams(state.voice);
    const t = setTimeout(() => { void speak(state.greeting, v); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  const sceneMeta = SCENES.find((s) => s.id === state.scene)!;
  const pct = Math.min(100, Math.round((state.xp / state.nextLevelAt) * 100));

  const onPickScene = (id: SceneId) => {
    if (!state.unlockedScenes.includes(id)) return;
    setScene(child.id, id);
    setTick((n) => n + 1);
  };
  const onPickVoice = (v: VoiceTone) => {
    setVoice(child.id, v);
    setTick((n) => n + 1);
    void speak(state.encouragement, getVoiceParams(v));
  };
  const onSpeak = () => {
    void speak(state.greeting, getVoiceParams(state.voice));
  };

  return (
    <div className={`card-chunky relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br ${sceneMeta.gradient} p-5`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mascot id={child.mascot} size="lg" />
          </motion.div>
          <span className="absolute -bottom-1 -right-1 rounded-full bg-card px-2 py-0.5 text-lg shadow">
            {EMOTION_EMOJI[state.emotion]}
          </span>
        </div>

        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-display uppercase tracking-wide text-muted-foreground">
            {sceneMeta.emoji} {sceneMeta.name}
          </p>
          <h3 className="font-display text-2xl">Nível {state.level} · {state.xp} XP</h3>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              className="h-full bg-gradient-to-r from-primary via-xp to-success"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={state.greeting}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3 inline-block rounded-2xl bg-card/80 px-3 py-2 font-display text-sm"
            >
              💬 {state.greeting}
            </motion.p>
          </AnimatePresence>
        </div>

        <button
          onClick={onSpeak}
          className="touch-target-kid inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 font-display text-sm text-primary-foreground shadow hover:scale-105"
          aria-label="Ouvir mascote"
        >
          <Volume2 className="h-4 w-4" /> Falar
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-display uppercase tracking-wide text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3" /> Cenário
          </p>
          <div className="flex flex-wrap gap-2">
            {SCENES.map((s) => {
              const unlocked = state.unlockedScenes.includes(s.id);
              const active = state.scene === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onPickScene(s.id)}
                  disabled={!unlocked}
                  className={`rounded-full px-3 py-1.5 font-display text-xs transition ${
                    active ? "bg-primary text-primary-foreground" :
                    unlocked ? "bg-card hover:bg-muted" : "bg-muted/50 text-muted-foreground"
                  }`}
                  title={unlocked ? s.name : `Desbloqueia no Nível ${s.unlockLevel}`}
                >
                  {unlocked ? s.emoji : <Lock className="inline h-3 w-3" />} {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-display uppercase tracking-wide text-muted-foreground">
            🎙️ Voz
          </p>
          <div className="flex flex-wrap gap-2">
            {listVoices().map((v) => {
              const active = state.voice === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onPickVoice(v.id)}
                  className={`rounded-full px-3 py-1.5 font-display text-xs transition ${
                    active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
