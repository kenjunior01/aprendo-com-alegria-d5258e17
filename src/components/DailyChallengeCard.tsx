// DailyChallengeCard — componente visual do Desafio Diário — Premium Design
// Mostra na home e permite iniciar o quiz rápido
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Clock, CheckCircle2, XCircle, Trophy, Star, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { playCorrect, playWrong, playLevelUp, speak } from "@/lib/audio";
import {
  loadDailyChallenge,
  answerDailyChallenge,
  calculateDailyChallengeRewards,
  isDailyChallengeAvailable,
  type DailyChallengeState,
} from "@/lib/dailyChallenge";
import type { Profile } from "@/lib/storage";
import { updateProfile } from "@/lib/storage";

interface DailyChallengeCardProps {
  profile: Profile;
  onCompleted?: () => void;
}

export function DailyChallengeCard({ profile, onCompleted }: DailyChallengeCardProps) {
  const [state, setState] = useState<DailyChallengeState | null>(null);
  const [mode, setMode] = useState<"preview" | "playing" | "result">("preview");
  const [currentQ, setCurrentQ] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [rewards, setRewards] = useState<ReturnType<typeof calculateDailyChallengeRewards> | null>(null);

  useEffect(() => {
    const loaded = loadDailyChallenge(profile.grade as 1 | 2 | 3 | 4);
    setState(loaded);
    if (!isDailyChallengeAvailable(loaded)) {
      setMode("result");
      const r = calculateDailyChallengeRewards(loaded, profile.streak);
      setRewards(r);
    }
  }, [profile.grade, profile.streak]);

  const handleStart = useCallback(() => {
    if (!state) return;
    haptic("tap");
    setMode("playing");
    setCurrentQ(0);
    speak("Vamos lá! Desafio diário!", { rate: 1.0 });
  }, [state]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!state || mode !== "playing") return;

    const { state: newState, isCorrect } = answerDailyChallenge(state, currentQ, answerIndex);
    setState(newState);

    if (isCorrect) {
      haptic("success");
      playCorrect();
      setFeedback("correct");
      speak("Muito bem!", { rate: 1.1 });
    } else {
      haptic("error");
      playWrong();
      setFeedback("wrong");
      speak("Ops! Tenta outra vez na próxima!", { rate: 0.9 });
    }

    // After brief feedback, move to next question or finish
    setTimeout(() => {
      setFeedback(null);
      if (currentQ + 1 >= newState.questions.length || newState.completedAt) {
        // Challenge complete
        const r = calculateDailyChallengeRewards(newState, profile.streak);
        setRewards(r);
        setMode("result");

        // Apply rewards to profile
        updateProfile({
          xp: profile.xp + r.xpEarned,
          coins: profile.coins + r.coinsEarned,
        });

        if (r.perfectBonus) {
          playLevelUp();
          haptic("celebrate");
        }

        onCompleted?.();
      } else {
        setCurrentQ(currentQ + 1);
      }
    }, 1200);
  }, [state, currentQ, mode, profile, onCompleted]);

  if (!state) return null;

  const isAvailable = isDailyChallengeAvailable(state);
  const answeredCount = state.answers.filter((a) => a !== null).length;

  // ─── Preview Mode — Premium ───
  if (mode === "preview") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-orange-50/50 p-4 dark:to-orange-950/20"
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-streak/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-streak/10 text-3xl shadow-sm">
            🔥
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-streak">
              Desafio Diário
            </p>
            <h3 className="font-display text-lg leading-tight">Quiz de Hoje</h3>
            <p className="text-xs text-muted-foreground">
              5 perguntas mistas · Bónus de streak!
            </p>
          </div>
        </div>

        {profile.streak > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-streak/8 px-3 py-1.5">
            <Flame className="h-4 w-4 text-streak" />
            <span className="text-xs font-bold text-streak">
              Streak x{Math.min(2.0, 1.0 + Math.floor(profile.streak / 3) * 0.1).toFixed(1)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({profile.streak} dias seguidos)
            </span>
          </div>
        )}

        {isAvailable ? (
          <button
            onClick={handleStart}
            className="btn-chunky mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-streak px-6 py-3 font-display text-white shadow-lg transition-transform active:scale-95"
          >
            <Zap className="h-5 w-5" />
            Começar Desafio
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-display text-sm text-success">Completado hoje!</span>
          </div>
        )}
      </motion.div>
    );
  }

  // ─── Playing Mode — Premium ───
  if (mode === "playing" && state.questions[currentQ]) {
    const q = state.questions[currentQ];
    return (
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="card-premium overflow-hidden rounded-3xl bg-card p-4 sm:p-5"
      >
        {/* Progress bar */}
        <div className="mb-4 flex items-center gap-2">
          {state.questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-full transition-all",
                i < currentQ ? "bg-success" :
                i === currentQ ? "bg-primary" :
                state.answers[i] !== null ? "bg-success" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Subject badge */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">{q.subjectEmoji}</span>
          <span className="text-xs font-bold text-muted-foreground">{q.subjectName}</span>
          <span className="ml-auto text-xs text-muted-foreground">{currentQ + 1}/{state.questions.length}</span>
        </div>

        {/* Question */}
        <h3 className="mb-4 font-display text-lg leading-snug">{q.prompt}</h3>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSelected = state.answers[currentQ] === i;
            const isCorrectAnswer = i === q.answerIndex;
            const showFeedback = feedback !== null && isSelected;

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(i)}
                disabled={feedback !== null}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-display text-sm transition-all",
                  showFeedback && isCorrectAnswer && "border-success bg-success/10 text-success",
                  showFeedback && !isCorrectAnswer && "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30",
                  !showFeedback && isSelected && "border-primary bg-primary/10",
                  !showFeedback && !isSelected && "border-border bg-card hover:border-primary/50 hover:shadow-sm",
                  feedback !== null && !isSelected && "opacity-50",
                )}
              >
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                  showFeedback && isCorrectAnswer && "bg-success text-white",
                  showFeedback && !isCorrectAnswer && "bg-red-500 text-white",
                  !showFeedback && "bg-muted text-muted-foreground",
                )}>
                  {showFeedback && isCorrectAnswer ? <CheckCircle2 className="h-4 w-4" /> :
                   showFeedback && !isCorrectAnswer ? <XCircle className="h-4 w-4" /> :
                   String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Hint */}
        {q.hint && feedback === "wrong" && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl bg-warning/10 px-3 py-2 text-xs text-warning-foreground"
          >
            Dica: {q.hint}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // ─── Result Mode — Premium ───
  if (mode === "result" && rewards) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-premium overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-xp/5 p-5"
      >
        <div className="mb-4 text-center">
          <motion.div
            animate={rewards.perfectBonus ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : undefined}
            transition={{ duration: 0.6 }}
            className="mb-2 text-5xl"
          >
            {rewards.perfectBonus ? "🏆" : rewards.correct >= 3 ? "🌟" : "💪"}
          </motion.div>
          <h3 className="font-display text-xl font-bold">
            {rewards.perfectBonus ? "Perfeito!" : rewards.correct >= 3 ? "Muito Bem!" : "Bom Esforço!"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {rewards.correct} de {rewards.total} correctas
          </p>
        </div>

        {/* Rewards breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-xp/10 px-3 py-2">
            <span className="text-sm">XP ganho</span>
            <span className="font-display font-bold text-xp">+{rewards.xpEarned}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-coins/10 px-3 py-2">
            <span className="text-sm">Moedas</span>
            <span className="font-display font-bold text-coins">+{rewards.coinsEarned}</span>
          </div>
          {rewards.streakMultiplier > 1 && (
            <div className="flex items-center justify-between rounded-xl bg-streak/10 px-3 py-2">
              <span className="text-sm">Bónus Streak</span>
              <span className="font-display font-bold text-streak">x{rewards.streakMultiplier.toFixed(1)}</span>
            </div>
          )}
          {rewards.perfectBonus && (
            <div className="flex items-center justify-between rounded-xl bg-leagues-lenda/10 px-3 py-2">
              <span className="text-sm">Bónus Perfeito</span>
              <span className="font-display font-bold text-leagues-lenda">+50 XP</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Volta amanhã para um novo desafio!
        </p>
      </motion.div>
    );
  }

  return null;
}
