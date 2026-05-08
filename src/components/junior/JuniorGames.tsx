import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";

interface Item { id: string; emoji: string; color: string; targetId: string }

const POOL: Item[] = [
  { id: "f1", emoji: "🌹", color: "Vermelho", targetId: "vermelho" },
  { id: "f2", emoji: "🍎", color: "Vermelho", targetId: "vermelho" },
  { id: "f3", emoji: "🌻", color: "Amarelo", targetId: "amarelo" },
  { id: "f4", emoji: "🍌", color: "Amarelo", targetId: "amarelo" },
  { id: "f5", emoji: "🫐", color: "Azul", targetId: "azul" },
  { id: "f6", emoji: "💙", color: "Azul", targetId: "azul" },
];
const POTS = [
  { id: "vermelho", label: "Vermelho", bg: "bg-red-200", ring: "ring-red-400" },
  { id: "amarelo", label: "Amarelo", bg: "bg-yellow-200", ring: "ring-yellow-400" },
  { id: "azul", label: "Azul", bg: "bg-blue-200", ring: "ring-blue-400" },
];

export function GameJardimCores({ onDone }: { onDone?: () => void }) {
  const [items, setItems] = useState(POOL);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const done = items.length === 0;

  const handleDrop = (potId: string) => {
    if (!dragId) return;
    const item = items.find((i) => i.id === dragId);
    if (!item) return;
    if (item.targetId === potId) {
      setItems((arr) => arr.filter((i) => i.id !== dragId));
      setScore((s) => s + 1);
      setFeedback("Boa! 🎉");
    } else {
      setFeedback("Tenta outra cor 💛");
    }
    setDragId(null);
    setTimeout(() => setFeedback(null), 900);
    if (items.length === 1) {
      recordJuniorPlay("jardim-cores", "Completou o Jardim das Cores!");
      onDone?.();
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        Arrasta cada flor ou fruta para o vaso da cor certa.
      </p>

      <div className="flex justify-center gap-3 sm:gap-6">
        {POTS.map((p) => (
          <button
            key={p.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(p.id)}
            onClick={() => handleDrop(p.id)}
            className={`touch-target-kid flex h-28 w-24 flex-col items-center justify-end rounded-b-3xl rounded-t-xl ${p.bg} ring-4 ${p.ring} sm:h-32 sm:w-28`}
          >
            <span className="pb-2 font-display text-xs">{p.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence>
          {items.map((it) => (
            <motion.button
              key={it.id}
              draggable
              onDragStart={() => setDragId(it.id)}
              onClick={() => setDragId((d) => (d === it.id ? null : it.id))}
              initial={{ scale: 0 }}
              animate={{ scale: dragId === it.id ? 1.15 : 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`touch-target-kid flex items-center justify-center rounded-2xl bg-card text-5xl shadow-md ${
                dragId === it.id ? "ring-4 ring-primary" : ""
              }`}
            >
              {it.emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="font-display text-lg">Acertaste: {score}</p>
        {feedback && <p className="mt-2 font-display text-primary">{feedback}</p>}
        {done && <p className="mt-3 font-display text-2xl text-success">🌟 Completaste o jardim! 🌟</p>}
      </div>
    </div>
  );
}

interface AnimalQ { emoji: string; name: string; sound: string }
const ANIMALS: AnimalQ[] = [
  { emoji: "🐮", name: "Vaca", sound: "Mooo" },
  { emoji: "🐶", name: "Cão", sound: "Au au" },
  { emoji: "🐱", name: "Gato", sound: "Miau" },
  { emoji: "🦆", name: "Pato", sound: "Quack" },
];

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-PT";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}

export function GameOrquestraAnimais({ onDone }: { onDone?: () => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const order = useMemo(() => [...ANIMALS].sort(() => Math.random() - 0.5), []);
  const target = order[round];
  const choices = useMemo(() => [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 3).concat(target).filter((v, i, a) => a.findIndex(x => x.name === v.name) === i).slice(0, 3), [round, target]);

  if (!target) {
    return (
      <div className="text-center">
        <p className="font-display text-2xl text-success">🎶 Bravo, maestro!</p>
        <p className="mt-1">Pontuação: {score}/{order.length}</p>
      </div>
    );
  }

  const pick = (a: AnimalQ) => {
    if (a.name === target.name) {
      setScore((s) => s + 1);
      speak(`Boa! É o ${a.name}!`);
    } else {
      speak(`Não, é o ${target.name}`);
    }
    setTimeout(() => {
      const next = round + 1;
      if (next >= order.length) {
        recordJuniorPlay("orquestra-animais", `Orquestra: ${score + (a.name === target.name ? 1 : 0)}/${order.length}`);
        onDone?.();
      }
      setRound(next);
    }, 1200);
  };

  return (
    <div className="space-y-5 text-center">
      <p className="text-sm text-muted-foreground">Quem faz este som?</p>
      <button
        onClick={() => speak(target.sound)}
        className="touch-target-kid mx-auto flex h-24 w-48 items-center justify-center rounded-3xl bg-primary font-display text-2xl text-primary-foreground shadow-lg"
      >
        🔊 Ouvir som
      </button>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((c) => (
          <button
            key={c.name}
            onClick={() => pick(c)}
            className="touch-target-kid flex flex-col items-center gap-1 rounded-3xl bg-card p-3 text-5xl shadow-md active:scale-95"
          >
            <span>{c.emoji}</span>
            <span className="font-display text-xs">{c.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

interface RoutineStep { emoji: string; label: string; tools: string[]; correct: string }
const ROUTINE: RoutineStep[] = [
  { emoji: "🦷", label: "Lavar os dentes", tools: ["🪥", "🍪", "🧸"], correct: "🪥" },
  { emoji: "🍽️", label: "Pequeno-almoço", tools: ["🥣", "👟", "📚"], correct: "🥣" },
  { emoji: "🛁", label: "Hora do banho", tools: ["🧼", "🚗", "🍌"], correct: "🧼" },
  { emoji: "🛏️", label: "Dormir", tools: ["🧸", "⚽", "🎮"], correct: "🧸" },
];

export function GameRotinasKido({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState(0);
  const [happy, setHappy] = useState(false);
  const current = ROUTINE[step];
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
    }
  };
  return (
    <div className="space-y-5 text-center">
      <motion.div animate={{ scale: happy ? 1.2 : 1 }} className="text-7xl">
        {happy ? "😄" : "🙂"}
      </motion.div>
      <p className="font-display text-lg">{current.label} {current.emoji}</p>
      <p className="text-xs text-muted-foreground">Toca no objeto certo para o Kido.</p>
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

  const choose = (next: string) => {
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
