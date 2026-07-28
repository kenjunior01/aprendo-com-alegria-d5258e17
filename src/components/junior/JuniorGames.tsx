// Mini-jogos base do Júnior (2-5). Melhorados: narração consistente (pt-PT via lib/audio),
// botão de "ouvir outra vez", maior área tátil para toddlers e tutorial inicial.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, RotateCcw } from "lucide-react";
import { recordJuniorPlay } from "@/lib/junior";
import { speak, playCorrect, playWrong, playTap, stopSpeech } from "@/lib/audio";
import { GameTutorial } from "./GameTutorial";

// ============================================================
// 1) Jardim das Cores e Formas (2-3) — versão "tap-tap" + narração
// ============================================================

interface ColorItem { id: string; emoji: string; color: string; targetId: string }

const COLOR_POOL: ColorItem[] = [
  { id: "f1", emoji: "🌹", color: "Vermelho", targetId: "vermelho" },
  { id: "f2", emoji: "🍎", color: "Vermelho", targetId: "vermelho" },
  { id: "f3", emoji: "🍓", color: "Vermelho", targetId: "vermelho" },
  { id: "f4", emoji: "🌻", color: "Amarelo", targetId: "amarelo" },
  { id: "f5", emoji: "🍌", color: "Amarelo", targetId: "amarelo" },
  { id: "f6", emoji: "🍋", color: "Amarelo", targetId: "amarelo" },
  { id: "f7", emoji: "🫐", color: "Azul",     targetId: "azul" },
  { id: "f8", emoji: "💙", color: "Azul",     targetId: "azul" },
  { id: "f9", emoji: "🌊", color: "Azul",     targetId: "azul" },
  { id: "fa", emoji: "🍃", color: "Verde",    targetId: "verde" },
  { id: "fb", emoji: "🥦", color: "Verde",    targetId: "verde" },
  { id: "fc", emoji: "🍇", color: "Roxo",     targetId: "roxo" },
  { id: "fd", emoji: "🍆", color: "Roxo",     targetId: "roxo" },
];

const POTS = [
  { id: "vermelho", label: "Vermelho", bg: "bg-red-200",    ring: "ring-red-400",    text: "text-red-700" },
  { id: "amarelo",  label: "Amarelo",  bg: "bg-yellow-200", ring: "ring-yellow-400", text: "text-yellow-700" },
  { id: "azul",     label: "Azul",     bg: "bg-blue-200",   ring: "ring-blue-400",   text: "text-blue-700" },
  { id: "verde",    label: "Verde",    bg: "bg-green-200",  ring: "ring-green-400",  text: "text-green-700" },
  { id: "roxo",     label: "Roxo",     bg: "bg-purple-200", ring: "ring-purple-400", text: "text-purple-700" },
];

export function GameJardimCores({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<ColorItem[]>(() =>
    [...COLOR_POOL].sort(() => Math.random() - 0.5).slice(0, 8),
  );
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<ColorItem | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const visiblePots = useMemo(
    () => POTS.filter((p) => items.some((i) => i.targetId === p.id)),
    [items],
  );
  const done = items.length === 0;

  useEffect(() => {
    if (started && picked) speak(`${picked.color}. Onde está o vaso ${picked.color.toLowerCase()}?`, { rate: 0.9 });
  }, [picked, started]);

  const choose = (it: ColorItem) => {
    playTap();
    setPicked(it);
  };

  const handleDrop = (potId: string) => {
    if (!picked) {
      speak("Primeiro, toca numa flor.");
      return;
    }
    if (picked.targetId === potId) {
      playCorrect();
      speak(`Boa! ${picked.emoji} ${picked.color}!`, { rate: 0.95, pitch: 1.15 });
      setItems((arr) => arr.filter((i) => i.id !== picked.id));
      setScore((s) => s + 1);
      setFeedback({ ok: true, text: "Boa! 🎉" });
      if (items.length === 1) {
        recordJuniorPlay("jardim-cores", "Completou o Jardim das Cores!");
        onDone?.();
      }
    } else {
      playWrong();
      speak(`Não, isso é ${POTS.find((p) => p.id === potId)?.label}. Procura o ${picked.color.toLowerCase()}.`);
      setFeedback({ ok: false, text: "Tenta outra cor 💛" });
    }
    setPicked(null);
    setTimeout(() => setFeedback(null), 1100);
  };

  return (
    <div className="relative space-y-5">
      <GameTutorial
        gameId="jardim-cores"
        title="Jardim das Cores"
        steps={[
          { emoji: "🌸", text: "Vês muitas flores e frutos coloridos." },
          { emoji: "👆", text: "Toca numa flor — ela vai brilhar." },
          { emoji: "🪴", text: "Depois toca no vaso da mesma cor." },
          { emoji: "🎉", text: "Quando todas estiverem nos vasos, ganhas!" },
        ]}
        onStart={() => setStarted(true)}
        parentNote="Pode dizer a cor em voz alta enquanto ela escolhe — reforça o vocabulário."
      />

      <p className="text-center text-sm text-muted-foreground">
        {picked ? `Agora toca no vaso ${picked.color.toLowerCase()}.` : "Toca numa flor para começar."}
      </p>

      {/* Vasos */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {visiblePots.map((p) => (
          <button
            key={p.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(p.id)}
            onClick={() => handleDrop(p.id)}
            className={`touch-target-kid flex h-28 w-20 flex-col items-center justify-end rounded-b-3xl rounded-t-xl ${p.bg} ring-4 ${p.ring} sm:h-32 sm:w-24 ${
              picked ? "animate-pulse" : ""
            }`}
          >
            <span className={`pb-2 font-display text-xs ${p.text}`}>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Itens */}
      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence>
          {items.map((it) => (
            <motion.button
              key={it.id}
              draggable
              onDragStart={() => setPicked(it)}
              onClick={() => choose(it)}
              initial={{ scale: 0 }}
              animate={{ scale: picked?.id === it.id ? 1.25 : 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`touch-target-kid flex h-20 w-20 items-center justify-center rounded-2xl bg-card text-5xl shadow-md ${
                picked?.id === it.id ? "ring-4 ring-primary" : ""
              }`}
            >
              {it.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="font-display text-lg">Acertaste: {score}</p>
        {feedback && (
          <p className={`mt-2 font-display ${feedback.ok ? "text-success" : "text-destructive"}`}>
            {feedback.text}
          </p>
        )}
        {done && <p className="mt-3 font-display text-2xl text-success">🌟 Completaste o jardim! 🌟</p>}
      </div>
    </div>
  );
}

// ============================================================
// 2) Orquestra dos Animais (2-3) — narração + sons sintéticos
// ============================================================

interface AnimalQ { emoji: string; name: string; sound: string; pitch: number; freq: number }

// freq + pitch usados para gerar um "som" sintético reconhecível além do TTS
const ANIMALS: AnimalQ[] = [
  { emoji: "🐮", name: "Vaca",    sound: "Mooo",     pitch: 0.6, freq: 110 },
  { emoji: "🐶", name: "Cão",     sound: "Au au",    pitch: 1.1, freq: 280 },
  { emoji: "🐱", name: "Gato",    sound: "Miauuu",   pitch: 1.4, freq: 520 },
  { emoji: "🦆", name: "Pato",    sound: "Quá quá",  pitch: 1.0, freq: 360 },
  { emoji: "🐑", name: "Ovelha",  sound: "Méééé",    pitch: 1.2, freq: 420 },
  { emoji: "🐔", name: "Galinha", sound: "Cócócó",   pitch: 1.3, freq: 480 },
  { emoji: "🐷", name: "Porco",   sound: "Oinc oinc",pitch: 0.8, freq: 200 },
  { emoji: "🐴", name: "Cavalo",  sound: "Hiiii",    pitch: 1.1, freq: 340 },
];

function playAnimalTone(a: AnimalQ) {
  // pequeno "rugido" sintético antes da voz, p/ reforçar o som
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = a.freq < 200 ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(a.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, a.freq * 0.55), ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.45);
  } catch { /* noop */ }
}

function playAnimal(a: AnimalQ) {
  stopSpeech();
  playAnimalTone(a);
  // pequeno delay para o tom não atropelar a voz
  setTimeout(() => speak(a.sound, { rate: 0.85, pitch: a.pitch }), 280);
}

export function GameOrquestraAnimais({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState<string | null>(null);

  const order = useMemo(() => [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 6), []);
  const target = order[round];

  const choices = useMemo(() => {
    if (!target) return [];
    const others = ANIMALS.filter((a) => a.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 2);
    return [...others, target].sort(() => Math.random() - 0.5);
  }, [round, target]);

  // Toca o som-alvo automaticamente ao iniciar a ronda
  useEffect(() => {
    if (started && target && !revealed) {
      const t = setTimeout(() => playAnimal(target), 350);
      return () => clearTimeout(t);
    }
  }, [round, started, target, revealed]);

  if (!target) {
    return (
      <div className="text-center">
        <p className="font-display text-2xl text-success">🎶 Bravo, maestro!</p>
        <p className="mt-1">Pontuação: {score}/{order.length}</p>
      </div>
    );
  }

  const pick = (a: AnimalQ) => {
    if (revealed) return;
    if (a.name === target.name) {
      setScore((s) => s + 1);
      playCorrect();
      setRevealed(a.name);
      speak(`Boa! É o ${a.name}! Faz ${a.sound}.`, { pitch: 1.15 });
    } else {
      playWrong();
      speak(`Não, este é o ${a.name}. Ouve outra vez.`, { rate: 0.9 });
      return;
    }
    setTimeout(() => {
      const next = round + 1;
      if (next >= order.length) {
        recordJuniorPlay("orquestra-animais", `Orquestra: ${score + 1}/${order.length}`);
        onDone?.();
      }
      setRevealed(null);
      setRound(next);
    }, 1800);
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="orquestra-animais"
        title="Orquestra dos Animais"
        steps={[
          { emoji: "🔊", text: "Vais ouvir o som de um animal." },
          { emoji: "👂", text: "Podes tocar no botão azul para ouvir outra vez." },
          { emoji: "🐮", text: "Escolhe o animal que faz aquele som." },
        ]}
        onStart={() => setStarted(true)}
        parentNote="Se não perceber, repita o som consigo (mooo, miauuu) — ajuda a associar."
      />

      <p className="text-sm text-muted-foreground">Quem faz este som? ({round + 1}/{order.length})</p>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => playAnimal(target)}
          className="touch-target-kid mx-auto flex h-24 w-56 items-center justify-center gap-3 rounded-3xl bg-primary font-display text-2xl text-primary-foreground shadow-lg active:scale-95"
        >
          <Volume2 className="h-7 w-7" /> Ouvir
        </button>
        <button
          onClick={() => playAnimal(target)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline"
        >
          <RotateCcw className="h-3 w-3" /> Outra vez
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {choices.map((c) => {
          const isAnswer = revealed === c.name;
          return (
            <button
              key={c.name}
              onClick={() => pick(c)}
              className={`touch-target-kid flex flex-col items-center gap-1 rounded-3xl p-3 text-5xl shadow-md active:scale-95 ${
                isAnswer ? "bg-success/30 ring-4 ring-success" : "bg-card"
              }`}
            >
              <motion.span animate={isAnswer ? { scale: [1, 1.4, 1] } : {}}>{c.emoji}</motion.span>
              <span className="font-display text-xs">{c.name}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

// ============================================================
// 3) Rotinas do Kido (3-4)
// ============================================================

interface RoutineStep { emoji: string; label: string; tools: string[]; correct: string }
const ROUTINE: RoutineStep[] = [
  { emoji: "🦷", label: "Lavar os dentes", tools: ["🪥", "🍪", "🧸"], correct: "🪥" },
  { emoji: "🍽️", label: "Pequeno-almoço",  tools: ["🥣", "👟", "📚"], correct: "🥣" },
  { emoji: "🛁", label: "Hora do banho",   tools: ["🧼", "🚗", "🍌"], correct: "🧼" },
  { emoji: "🛏️", label: "Dormir",          tools: ["🧸", "⚽", "🎮"], correct: "🧸" },
];

export function GameRotinasKido({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [happy, setHappy] = useState(false);
  const current = ROUTINE[step];

  useEffect(() => {
    if (started && current) speak(`${current.label}. Toca no objeto certo.`);
  }, [step, started, current]);

  if (!current) {
    return (
      <div className="text-center">
        <p className="text-7xl">😄</p>
        <p className="mt-3 font-display text-2xl text-success">O Kido está feliz!</p>
      </div>
    );
  }
  const pick = (t: string) => {
    if (t === current.correct) {
      playCorrect();
      speak("Muito bem!", { pitch: 1.2 });
      setHappy(true);
      setTimeout(() => {
        setHappy(false);
        const n = step + 1;
        if (n >= ROUTINE.length) {
          recordJuniorPlay("rotinas-kido", "Ajudou o Kido em todas as rotinas!");
          onDone?.();
        }
        setStep(n);
      }, 900);
    } else {
      playWrong();
      speak("Tenta outra vez.");
    }
  };
  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="rotinas-kido"
        title="Rotinas do Kido"
        steps={[
          { emoji: "🧒", text: "O Kido precisa de ajuda nas suas rotinas." },
          { emoji: "👆", text: "Toca no objeto certo para cada momento." },
        ]}
        onStart={() => setStarted(true)}
      />
      <motion.div animate={{ scale: happy ? 1.2 : 1 }} className="text-7xl">
        {happy ? "😄" : "🙂"}
      </motion.div>
      <p className="font-display text-lg">{current.label} {current.emoji}</p>
      <button
        onClick={() => speak(current.label)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline"
      >
        <Volume2 className="h-3 w-3" /> Ouvir
      </button>
      <div className="flex justify-center gap-3">
        {current.tools.map((t) => (
          <button
            key={t}
            onClick={() => pick(t)}
            className="touch-target-kid rounded-3xl bg-card p-4 text-5xl shadow-md active:scale-95"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4) Livro Mágico (4-5)
// ============================================================

interface StoryBeat { scene: string; choices: { emoji: string; next: string }[] }
const STORY: Record<string, StoryBeat> = {
  start: {
    scene: "🌳 O Kido encontra um amigo na floresta. Quem é?",
    choices: [
      { emoji: "🐰 Coelho", next: "rabbit" },
      { emoji: "🐢 Tartaruga", next: "turtle" },
    ],
  },
  rabbit: {
    scene: "🐰 O coelho está com fome. O que lhe dás?",
    choices: [
      { emoji: "🥕 Cenoura", next: "share" },
      { emoji: "🍫 Chocolate", next: "share" },
    ],
  },
  turtle: {
    scene: "🐢 A tartaruga está cansada. O que fazes?",
    choices: [
      { emoji: "💤 Deixar descansar", next: "share" },
      { emoji: "🎵 Cantar uma canção", next: "share" },
    ],
  },
  share: {
    scene: "✨ Que bonito! Aprendeste a partilhar e a cuidar dos amigos. 💖",
    choices: [],
  },
};

export function GameLivroMagico({ onDone }: { onDone?: () => void }) {
  const [node, setNode] = useState("start");
  const beat = STORY[node];
  const ended = beat.choices.length === 0;

  useEffect(() => { speak(beat.scene.replace(/[^\p{L}\p{N}\s.,!?]/gu, " ")); }, [node, beat.scene]);

  const choose = (next: string) => {
    playTap();
    setNode(next);
    if (STORY[next].choices.length === 0) {
      recordJuniorPlay("livro-magico", "Leu uma história mágica até ao fim.");
      onDone?.();
    }
  };

  return (
    <div className="space-y-5 text-center">
      <motion.p
        key={node}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-accent/40 p-6 font-display text-xl"
      >
        {beat.scene}
      </motion.p>
      <button
        onClick={() => speak(beat.scene)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline"
      >
        <Volume2 className="h-3 w-3" /> Ouvir outra vez
      </button>
      {!ended && (
        <div className="grid gap-3 sm:grid-cols-2">
          {beat.choices.map((c) => (
            <button
              key={c.next + c.emoji}
              onClick={() => choose(c.next)}
              className="touch-target-kid rounded-3xl bg-card p-4 font-display text-lg shadow-md active:scale-95"
            >
              {c.emoji}
            </button>
          ))}
        </div>
      )}
      {ended && <p className="font-display text-success">🌟 Fim da história 🌟</p>}
    </div>
  );
}
