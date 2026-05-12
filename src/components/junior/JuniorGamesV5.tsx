// JuniorGamesV5 — jogos extra para bebés/toddlers (2-3 anos), com narração e tutoriais.
// Toques grandes, feedback sonoro e visual imediato.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { recordJuniorPlay } from "@/lib/junior";
import { speak, playCorrect, playWrong, playTap, playLevelUp } from "@/lib/audio";
import { GameTutorial } from "./GameTutorial";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

// ---------- 1) Balões da Cor — rebenta os balões da cor pedida ----------
const BALLOON_COLORS = [
  { id: "red",    name: "Vermelho", cls: "from-red-400 to-red-600" },
  { id: "yellow", name: "Amarelo",  cls: "from-yellow-300 to-yellow-500" },
  { id: "blue",   name: "Azul",     cls: "from-blue-400 to-blue-600" },
  { id: "green",  name: "Verde",    cls: "from-green-400 to-green-600" },
  { id: "purple", name: "Roxo",     cls: "from-purple-400 to-purple-600" },
];

export function GameBaloes({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState<string[]>([]);

  const target = BALLOON_COLORS[round % BALLOON_COLORS.length];
  const balloons = useMemo(() => {
    const list = shuffle([
      target, target, target,
      ...shuffle(BALLOON_COLORS.filter((c) => c.id !== target.id)).slice(0, 3),
    ]).map((c, i) => ({ key: `${round}-${i}`, ...c }));
    return list;
  }, [round, target]);

  useEffect(() => {
    if (started) speak(`Rebenta os balões ${target.name.toLowerCase()}!`, { rate: 0.92 });
    setPopped([]);
  }, [round, started, target.name]);

  const tap = (b: { key: string; id: string; name: string }) => {
    if (popped.includes(b.key)) return;
    if (b.id === target.id) {
      playCorrect();
      setPopped((p) => [...p, b.key]);
      const targetCount = balloons.filter((x) => x.id === target.id).length;
      if (popped.length + 1 >= targetCount) {
        setScore((s) => s + 1);
        speak("Boa!", { pitch: 1.2 });
        setTimeout(() => {
          if (round >= 4) {
            recordJuniorPlay("baloes", "Rebentou todos os balões!");
            playLevelUp();
            onDone?.();
          } else {
            setRound((r) => r + 1);
          }
        }, 800);
      }
    } else {
      playWrong();
      speak(`Esse é ${b.name.toLowerCase()}. Procura ${target.name.toLowerCase()}.`);
    }
  };

  return (
    <div className="relative space-y-4">
      <GameTutorial
        gameId="baloes"
        title="Balões da Cor"
        steps={[
          { emoji: "🎈", text: "Há muitos balões coloridos!" },
          { emoji: "👆", text: "Toca só nos balões da cor que eu disser." },
          { emoji: "💥", text: "Quando rebentares todos, ganhas!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="text-center">
        <p className="font-display text-xl">Rebenta os {target.name}!</p>
        <button onClick={() => speak(`Rebenta os ${target.name}`)} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline">
          <Volume2 className="h-3 w-3" /> Ouvir
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 p-2 sm:grid-cols-3">
        <AnimatePresence>
          {balloons.map((b) =>
            popped.includes(b.key) ? null : (
              <motion.button
                key={b.key}
                onClick={() => tap(b)}
                exit={{ scale: 1.6, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                className={`touch-target-kid h-24 rounded-full bg-gradient-to-b ${b.cls} shadow-lg`}
                aria-label={b.name}
              />
            ),
          )}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs text-muted-foreground">Rondas: {round + 1}/5 · Pontos: {score}</p>
    </div>
  );
}

// ---------- 2) Encontra o Par — emojis duplicados ----------
const PAIR_POOL = ["🐶", "🐱", "🐰", "🐻", "🦊", "🐸"];

export function GamePares({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const target = useMemo(() => shuffle(PAIR_POOL)[0], []);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const choices = useMemo(() => {
    const others = shuffle(PAIR_POOL.filter((p) => p !== target)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [round, target]);

  useEffect(() => {
    if (started) speak("Toca no que é igual.");
  }, [round, started]);

  const pick = (e: string) => {
    if (e === target) {
      playCorrect();
      setScore((s) => s + 1);
      speak("Igual! Boa!", { pitch: 1.2 });
      if (round >= 4) {
        recordJuniorPlay("pares-jr", "Encontrou todos os pares!");
        onDone?.();
      } else setTimeout(() => setRound((r) => r + 1), 700);
    } else {
      playWrong();
      speak("Não é igual. Olha bem!");
    }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="pares-jr"
        title="Encontra o Par"
        steps={[
          { emoji: "👀", text: "Vês um animal grande no topo." },
          { emoji: "👆", text: "Toca no que é igualzinho a ele." },
        ]}
        onStart={() => setStarted(true)}
      />
      <div>
        <p className="text-sm text-muted-foreground">Encontra um igual a este:</p>
        <motion.div key={round} animate={{ scale: [0.8, 1.1, 1] }} className="text-8xl">{target}</motion.div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((c, i) => (
          <button key={`${round}-${i}`} onClick={() => pick(c)} className="touch-target-kid rounded-3xl bg-card p-4 text-6xl shadow-md active:scale-95">
            {c}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score} · Ronda {round + 1}/5</p>
    </div>
  );
}

// ---------- 3) Sons de Transportes ----------
const TRANSPORTS = [
  { emoji: "🚗", name: "Carro",   sound: "Vrum vrum",   freq: 180 },
  { emoji: "✈️", name: "Avião",   sound: "Vuuuum",      freq: 600 },
  { emoji: "🚂", name: "Comboio", sound: "Tchu tchu",   freq: 250 },
  { emoji: "⛵", name: "Barco",   sound: "Pó pó",       freq: 140 },
  { emoji: "🚲", name: "Bicicleta", sound: "Trim trim", freq: 800 },
];

function playTransportTone(freq: number) {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = "sawtooth"; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.55);
  } catch { /* noop */ }
}

export function GameTransportes({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const order = useMemo(() => shuffle(TRANSPORTS).slice(0, 5), []);
  const target = order[round];

  const choices = useMemo(() => {
    if (!target) return [];
    const others = shuffle(TRANSPORTS.filter((t) => t.name !== target.name)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [round, target]);

  const playT = () => { if (target) { playTransportTone(target.freq); setTimeout(() => speak(target.sound, { rate: 0.85 }), 250); } };
  useEffect(() => { if (started && target) setTimeout(playT, 350); }, [round, started, target]);

  if (!target) {
    return <div className="text-center"><p className="font-display text-2xl text-success">🚦 Conheces todos!</p><p>Pontos: {score}/{order.length}</p></div>;
  }

  const pick = (t: typeof TRANSPORTS[number]) => {
    if (t.name === target.name) {
      playCorrect(); setScore((s) => s + 1); speak(`Sim! É ${t.name}.`, { pitch: 1.15 });
      setTimeout(() => {
        const n = round + 1;
        if (n >= order.length) { recordJuniorPlay("transportes", "Identificou os transportes!"); onDone?.(); }
        setRound(n);
      }, 1200);
    } else { playWrong(); speak(`Não, é ${target.name}.`); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="transportes"
        title="Sons dos Transportes"
        steps={[
          { emoji: "🔊", text: "Vais ouvir o som de um transporte." },
          { emoji: "👆", text: "Escolhe qual deles faz aquele som." },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="text-sm text-muted-foreground">Que transporte faz este som?</p>
      <button onClick={playT} className="touch-target-kid mx-auto flex h-24 w-56 items-center justify-center gap-3 rounded-3xl bg-primary font-display text-2xl text-primary-foreground shadow-lg">
        <Volume2 className="h-7 w-7" /> Ouvir
      </button>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((c) => (
          <button key={c.name} onClick={() => pick(c)} className="touch-target-kid rounded-3xl bg-card p-3 text-5xl shadow-md active:scale-95">
            <div>{c.emoji}</div>
            <div className="font-display text-xs">{c.name}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score} · {round + 1}/{order.length}</p>
    </div>
  );
}

// ---------- 4) Grande ou Pequeno ----------
const SIZES = ["🐘", "🐭", "🐳", "🐜", "🦒", "🐞"];

export function GameTamanho({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const target = useMemo(() => (Math.random() < 0.5 ? "grande" : "pequeno"), [round]);
  const pair = useMemo(() => {
    const a = SIZES[Math.floor(Math.random() * SIZES.length)];
    let b = SIZES[Math.floor(Math.random() * SIZES.length)];
    while (b === a) b = SIZES[Math.floor(Math.random() * SIZES.length)];
    return shuffle([{ e: a, big: true }, { e: b, big: false }]);
  }, [round]);

  useEffect(() => { if (started) speak(`Toca no ${target}.`); }, [round, started, target]);

  const pick = (i: number) => {
    const correct = (target === "grande" && pair[i].big) || (target === "pequeno" && !pair[i].big);
    if (correct) {
      playCorrect(); setScore((s) => s + 1); speak("Certo!", { pitch: 1.2 });
      if (round >= 5) { recordJuniorPlay("tamanho", "Aprendeu grande/pequeno!"); onDone?.(); }
      else setTimeout(() => setRound((r) => r + 1), 700);
    } else { playWrong(); speak("Tenta de novo."); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="tamanho"
        title="Grande ou Pequeno"
        steps={[
          { emoji: "🐘", text: "Há um animal grande e um pequeno." },
          { emoji: "👆", text: "Toca no que eu pedir." },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="font-display text-2xl">Toca no <span className="text-primary">{target}</span></p>
      <div className="grid grid-cols-2 gap-4">
        {pair.map((p, i) => (
          <button key={i} onClick={() => pick(i)} className="touch-target-kid flex h-44 items-center justify-center rounded-3xl bg-card shadow-md active:scale-95">
            <span style={{ fontSize: p.big ? "8rem" : "3rem" }}>{p.e}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

// ---------- 5) Conta os Dedos ----------
export function GameContaDedos({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const n = useMemo(() => 1 + Math.floor(Math.random() * 5), [round]);

  useEffect(() => { if (started) speak(`Quantas estrelas vês?`); }, [round, started]);

  const pick = (v: number) => {
    if (v === n) {
      playCorrect(); setScore((s) => s + 1); speak(`${n}! Muito bem.`, { pitch: 1.2 });
      if (round >= 5) { recordJuniorPlay("conta-dedos", "Contou bem!"); onDone?.(); }
      else setTimeout(() => setRound((r) => r + 1), 800);
    } else { playWrong(); speak("Conta outra vez, devagarinho."); }
  };

  const opts = useMemo(() => {
    const set = new Set<number>([n]);
    while (set.size < 3) set.add(1 + Math.floor(Math.random() * 5));
    return shuffle([...set]);
  }, [n]);

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="conta-dedos"
        title="Conta as Estrelas"
        steps={[
          { emoji: "⭐", text: "Conta as estrelas no ecrã." },
          { emoji: "🔢", text: "Toca no número certo." },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="text-sm text-muted-foreground">Quantas estrelas?</p>
      <div className="flex flex-wrap justify-center gap-2 p-3">
        {Array.from({ length: n }).map((_, i) => (
          <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="text-5xl">⭐</motion.span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {opts.map((o) => (
          <button key={o} onClick={() => pick(o)} className="touch-target-kid rounded-3xl bg-card p-4 font-display text-4xl shadow-md active:scale-95">{o}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

// ---------- 6) Alimenta o Bebé (combina fruta com o pedido) ----------
const FRUITS = [
  { e: "🍎", n: "Maçã" },
  { e: "🍌", n: "Banana" },
  { e: "🍇", n: "Uvas" },
  { e: "🍓", n: "Morango" },
  { e: "🍊", n: "Laranja" },
  { e: "🍐", n: "Pera" },
];

export function GameAlimentaBebe({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [happy, setHappy] = useState(false);
  const target = useMemo(() => FRUITS[Math.floor(Math.random() * FRUITS.length)], [round]);

  const choices = useMemo(() => {
    const others = shuffle(FRUITS.filter((f) => f.n !== target.n)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [round, target]);

  useEffect(() => { if (started) speak(`O bebé quer ${target.n.toLowerCase()}.`); }, [round, started, target]);

  const pick = (f: typeof FRUITS[number]) => {
    if (f.n === target.n) {
      playCorrect(); setScore((s) => s + 1); setHappy(true); speak("Mmm, obrigado!", { pitch: 1.3 });
      setTimeout(() => {
        setHappy(false);
        if (round >= 4) { recordJuniorPlay("alimenta-bebe", "Alimentou o bebé!"); onDone?.(); }
        else setRound((r) => r + 1);
      }, 1100);
    } else { playWrong(); speak(`O bebé queria ${target.n.toLowerCase()}.`); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="alimenta-bebe"
        title="Alimenta o Bebé"
        steps={[
          { emoji: "👶", text: "O bebé tem fome!" },
          { emoji: "🍎", text: "Dá-lhe a fruta que ele pede." },
        ]}
        onStart={() => setStarted(true)}
      />
      <motion.div animate={{ scale: happy ? 1.3 : 1 }} className="text-7xl">{happy ? "😋" : "👶"}</motion.div>
      <p className="font-display text-lg">O bebé quer: <span className="text-primary">{target.n}</span></p>
      <button onClick={() => speak(target.n)} className="inline-flex items-center gap-1 text-xs text-muted-foreground underline">
        <Volume2 className="h-3 w-3" /> Ouvir
      </button>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((f, i) => (
          <button key={`${round}-${i}`} onClick={() => pick(f)} className="touch-target-kid rounded-3xl bg-card p-4 text-6xl shadow-md active:scale-95">
            {f.e}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

// ---------- 7) Onde Está? (objeto escondido) ----------
export function GameOndeEsta({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const hidden = useMemo(() => Math.floor(Math.random() * 3), [round]);

  useEffect(() => {
    if (!started) return;
    setRevealed(true);
    speak("Olha bem onde está a bola!");
    const t = setTimeout(() => { setRevealed(false); speak("Onde está agora?"); }, 1800);
    return () => clearTimeout(t);
  }, [round, started]);

  const pick = (i: number) => {
    if (i === hidden) {
      playCorrect(); setScore((s) => s + 1); speak("Encontraste!", { pitch: 1.2 });
      if (round >= 4) { recordJuniorPlay("onde-esta", "Encontrou a bola!"); onDone?.(); }
      else setTimeout(() => setRound((r) => r + 1), 800);
    } else { playWrong(); speak("Tenta noutro copo."); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="onde-esta"
        title="Onde está a bola?"
        steps={[
          { emoji: "🥤", text: "Há três copos virados ao contrário." },
          { emoji: "⚽", text: "A bola esconde-se debaixo de um." },
          { emoji: "👆", text: "Toca no copo onde achas que está!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="font-display text-lg">Encontra a bola ⚽</p>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <button key={i} onClick={() => pick(i)} className="touch-target-kid relative h-32 rounded-3xl bg-card text-6xl shadow-md active:scale-95">
            {revealed && i === hidden ? "⚽" : "🥤"}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score} · {round + 1}/5</p>
    </div>
  );
}

// ---------- 8) Toca no Número ----------
export function GameNumeros({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const target = useMemo(() => 1 + Math.floor(Math.random() * 5), [round]);
  const opts = useMemo(() => {
    const s = new Set<number>([target]);
    while (s.size < 4) s.add(1 + Math.floor(Math.random() * 9));
    return shuffle([...s]);
  }, [target]);

  useEffect(() => { if (started) speak(`Toca no número ${target}.`); }, [round, started, target]);

  const pick = (v: number) => {
    if (v === target) {
      playCorrect(); setScore((s) => s + 1); speak(`Sim! ${target}.`, { pitch: 1.2 });
      if (round >= 5) { recordJuniorPlay("numeros-tap", "Reconhece números!"); onDone?.(); }
      else setTimeout(() => setRound((r) => r + 1), 700);
    } else { playWrong(); speak(`Esse é ${v}. Procura ${target}.`); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="numeros-tap"
        title="Toca no Número"
        steps={[
          { emoji: "🔢", text: "Vou pedir um número." },
          { emoji: "👆", text: "Toca no número certo!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="font-display text-2xl">Toca no <span className="text-primary">{target}</span></p>
      <button onClick={() => speak(String(target))} className="inline-flex items-center gap-1 text-xs text-muted-foreground underline">
        <Volume2 className="h-3 w-3" /> Ouvir
      </button>
      <div className="grid grid-cols-2 gap-4">
        {opts.map((o) => (
          <button key={o} onClick={() => { playTap(); pick(o); }} className="touch-target-kid rounded-3xl bg-card p-6 font-display text-6xl shadow-md active:scale-95">
            {o}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

// ---------- 9) Combina Forma com Cor (mistura simples) ----------
const SHAPES = [
  { e: "🔴", n: "círculo vermelho" },
  { e: "🟦", n: "quadrado azul" },
  { e: "🔺", n: "triângulo vermelho" },
  { e: "🟢", n: "círculo verde" },
  { e: "🟨", n: "quadrado amarelo" },
  { e: "🟣", n: "círculo roxo" },
];

export function GameFormasCor({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const target = useMemo(() => SHAPES[Math.floor(Math.random() * SHAPES.length)], [round]);
  const choices = useMemo(() => {
    const others = shuffle(SHAPES.filter((s) => s.n !== target.n)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [round, target]);

  useEffect(() => { if (started) speak(`Toca no ${target.n}.`); }, [round, started, target]);

  const pick = (s: typeof SHAPES[number]) => {
    if (s.n === target.n) {
      playCorrect(); setScore((x) => x + 1); speak("Boa!", { pitch: 1.2 });
      if (round >= 4) { recordJuniorPlay("formas-cor", "Identifica formas e cores!"); onDone?.(); }
      else setTimeout(() => setRound((r) => r + 1), 700);
    } else { playWrong(); speak(`Não, isso é ${s.n}.`); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="formas-cor"
        title="Forma e Cor"
        steps={[
          { emoji: "🔴", text: "Cada forma tem uma cor." },
          { emoji: "👆", text: "Toca naquela que eu disser." },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="font-display text-lg">Toca em: <span className="text-primary">{target.n}</span></p>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((c, i) => (
          <button key={`${round}-${i}`} onClick={() => pick(c)} className="touch-target-kid rounded-3xl bg-card p-4 text-7xl shadow-md active:scale-95">{c.e}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score}</p>
    </div>
  );
}

// ---------- 10) Imita o Som (onomatopeias divertidas) ----------
const ONOMS = [
  { e: "💧", n: "Plinc plinc", desc: "água" },
  { e: "👏", n: "Plás plás", desc: "palmas" },
  { e: "💨", n: "Fiuuu", desc: "vento" },
  { e: "🔔", n: "Tlim tlim", desc: "campainha" },
  { e: "🥁", n: "Pum pum", desc: "tambor" },
];

export function GameImitaSom({ onDone }: { onDone?: () => void }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const order = useMemo(() => shuffle(ONOMS).slice(0, 5), []);
  const target = order[round];

  const choices = useMemo(() => {
    if (!target) return [];
    const others = shuffle(ONOMS.filter((o) => o.n !== target.n)).slice(0, 2);
    return shuffle([target, ...others]);
  }, [round, target]);

  useEffect(() => { if (started && target) speak(target.n, { rate: 0.85, pitch: 1.2 }); }, [round, started, target]);

  if (!target) {
    return <div className="text-center"><p className="font-display text-2xl text-success">🎵 Conheces todos!</p><p>Pontos: {score}/{order.length}</p></div>;
  }

  const pick = (o: typeof ONOMS[number]) => {
    if (o.n === target.n) {
      playCorrect(); setScore((s) => s + 1); speak(`Sim, é ${o.desc}!`, { pitch: 1.2 });
      setTimeout(() => {
        const n = round + 1;
        if (n >= order.length) { recordJuniorPlay("imita-som", "Reconhece sons divertidos!"); onDone?.(); }
        setRound(n);
      }, 1100);
    } else { playWrong(); speak(`Não, é ${target.desc}.`); }
  };

  return (
    <div className="relative space-y-5 text-center">
      <GameTutorial
        gameId="imita-som"
        title="Imita o Som"
        steps={[
          { emoji: "🔊", text: "Vou dizer um som divertido." },
          { emoji: "👆", text: "Adivinha de que coisa é!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="text-sm text-muted-foreground">De que é este som?</p>
      <button onClick={() => speak(target.n, { rate: 0.85, pitch: 1.2 })} className="touch-target-kid mx-auto flex h-24 w-56 items-center justify-center gap-3 rounded-3xl bg-primary font-display text-2xl text-primary-foreground shadow-lg">
        <Volume2 className="h-7 w-7" /> "{target.n}"
      </button>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((c) => (
          <button key={c.n} onClick={() => pick(c)} className="touch-target-kid rounded-3xl bg-card p-3 text-6xl shadow-md active:scale-95">{c.e}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Pontos: {score} · {round + 1}/{order.length}</p>
    </div>
  );
}
