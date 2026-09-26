// JuniorGamesV9 — 4 mini-jogos novos (Ronda 2): caça-palavras, ordena frases,
// balão matemático e províncias de Moçambique.
// Mantém o padrão dos V6/V7/V8: TTS, sons, recordJuniorPlay, GameTutorial.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";
import { speak, playCorrect, playWrong, playLevelUp } from "@/lib/audio";
import { GameTutorial } from "./GameTutorial";
import { cn } from "@/lib/utils";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function DoneBanner({ msg, emoji = "🎉" }: { msg: string; emoji?: string }) {
  return (
    <motion.p
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center font-display text-2xl text-success"
    >
      {emoji} {msg}
    </motion.p>
  );
}

const LETTERS = "ABCDEFGHIJLMNOPRSTU".split("");

// ═══════════════ 1. Caça-Palavras ═══════════════
interface WSPuzzle {
  words: { word: string; emoji: string }[];
  grid: string[];
  size: number;
}
function makeWordSearch(words: string[], size = 7): WSPuzzle | null {
  const grid: (string | null)[] = Array(size * size).fill(null);
  const placements: { word: string; start: number; end: number }[] = [];
  for (const raw of words) {
    const word = raw.toUpperCase();
    let placed = false;
    for (let attempt = 0; attempt < 200 && !placed; attempt++) {
      const horiz = Math.random() < 0.5;
      const maxStart = size - word.length;
      if (maxStart < 0) return null;
      const row = Math.floor(Math.random() * (horiz ? size : maxStart + 1));
      const col = Math.floor(Math.random() * (horiz ? maxStart + 1 : size));
      const step = horiz ? 1 : size;
      const start = row * size + col;
      const cells: number[] = [];
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const idx = start + i * step;
        if (grid[idx] !== null && grid[idx] !== word[i]) {
          ok = false;
          break;
        }
        cells.push(idx);
      }
      if (!ok) continue;
      cells.forEach((idx, i) => (grid[idx] = word[i]));
      placements.push({ word, start, end: cells[cells.length - 1] });
      placed = true;
    }
    if (!placed) return null;
  }
  const finalGrid = grid.map((c) => c ?? LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  return {
    words: placements.map((p) => ({ word: p.word, emoji: "" })),
    grid: finalGrid,
    size,
  };
}

const WS_ROUNDS = [
  { theme: "Animais 🦁", words: ["LEAO", "MACACO", "COBRA"] },
  { theme: "Frutas 🥭", words: ["MANGA", "CAJU", "MELANCIA"] },
  { theme: "Escola ✏️", words: ["LAPIS", "LIVRO", "ESCOLA"] },
];
const WS_EMOJI: Record<string, string> = {
  LEAO: "🦁",
  MACACO: "🐵",
  COBRA: "🐍",
  MANGA: "🥭",
  CAJU: "🥜",
  MELANCIA: "🍉",
  LAPIS: "✏️",
  LIVRO: "📖",
  ESCOLA: "🏫",
};

export function GameCacaPalavras() {
  const gameId = "caca-palavras";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState<WSPuzzle | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selFirst, setSelFirst] = useState<number | null>(null);
  const [wrongPair, setWrongPair] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const roundData = WS_ROUNDS[round];

  useEffect(() => {
    if (!started) return;
    setPuzzle(makeWordSearch(roundData.words));
    setFound(new Set());
    setSelFirst(null);
    speak(`Caça-palavras! Procura: ${roundData.words.join(", ")}`, { pitch: 1.15 });
  }, [started, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const tapCell = (idx: number) => {
    if (!puzzle) return;
    playCorrect();
    if (selFirst === null) {
      setSelFirst(idx);
      return;
    }
    // tentativa: procura palavra que comece num e acabe no outro (linha/coluna)
    const a = Math.min(selFirst, idx);
    const b = Math.max(selFirst, idx);
    const size = puzzle.size;
    let hit: string | null = null;
    for (const p of puzzle.words) {
      const word = p.word;
      const starts = [selFirst, idx];
      for (const s of starts) {
        const e = s + word.length - 1;
        const sameRow = Math.floor(s / size) === Math.floor(e / size);
        const sameCol = s % size === e % size;
        if (!(sameRow || sameCol) || e >= size * size) continue;
        let str = "";
        const step = sameRow ? 1 : size;
        for (let i = 0; i < word.length; i++) str += puzzle.grid[s + i * step];
        if (str === word) {
          hit = word;
          break;
        }
        // inverso
        let rev = "";
        for (let i = word.length - 1; i >= 0; i--)
          rev += puzzle.grid[s + (word.length - 1 - i) * step];
        if (rev === word) {
          hit = word;
          break;
        }
      }
      if (hit) break;
    }
    if (hit && !found.has(hit)) {
      const next = new Set(found);
      next.add(hit);
      setFound(next);
      speak(`${hit}! Muito bem!`, { pitch: 1.25 });
      if (next.size === roundData.words.length) {
        if (round + 1 < WS_ROUNDS.length) {
          playLevelUp();
          setTimeout(() => setRound((r) => r + 1), 1400);
        } else {
          playLevelUp();
          setDone(true);
          recordJuniorPlay(gameId, "Caça-Palavras: 3 rondas completas!");
        }
      }
    } else if (!hit) {
      playWrong();
      setWrongPair(b);
      setTimeout(() => setWrongPair(null), 500);
    }
    setSelFirst(null);
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Caça-Palavras"
        steps={[
          { emoji: "🔤", text: "Toca na PRIMEIRA letra da palavra." },
          { emoji: "👉", text: "Depois toca na ÚLTIMA letra!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="flex justify-between font-display text-sm">
        <span>
          {roundData.theme} · Ronda {round + 1}/3
        </span>
        <span>
          {found.size}/{roundData.words.length} palavras
        </span>
      </div>
      {puzzle && (
        <div
          className="grid gap-1 rounded-2xl border-4 border-primary/30 bg-primary/10 p-2"
          style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
        >
          {puzzle.grid.map((letter, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => tapCell(i)}
              className={cn(
                "flex h-8 items-center justify-center rounded-lg border-2 font-display text-sm font-black sm:h-10 sm:text-lg",
                selFirst === i
                  ? "border-amber-400 bg-amber-200 text-amber-900"
                  : "border-transparent bg-white/80 hover:bg-white",
              )}
              aria-label={`letra ${letter}`}
            >
              {letter}
            </motion.button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {roundData.words.map((w) => (
          <span
            key={w}
            className={cn(
              "rounded-full border-2 px-3 py-1 font-display text-sm font-bold",
              found.has(w)
                ? "border-success bg-success/15 text-success line-through"
                : "border-border bg-background",
            )}
          >
            {WS_EMOJI[w] ?? "⭐"} {w}
          </span>
        ))}
      </div>
      {wrongPair !== null && (
        <p className="text-center font-display text-sm text-destructive">Tenta outra vez! 💪</p>
      )}
      {done && <DoneBanner msg="Encontraste TODAS as palavras!" emoji="🔍" />}
    </div>
  );
}

// ═══════════════ 2. Ordena a Frase ═══════════════
const FRASES = [
  { words: ["A", "girafa", "come", "folhas"], emoji: "🦒" },
  { words: ["O", "sol", "brilha", "hoje"], emoji: "☀️" },
  { words: ["A", "escola", "é", "divertida"], emoji: "🏫" },
  { words: ["O", "macaco", "sobe", "à", "árvore"], emoji: "🐵" },
  { words: ["Eu", "amo", "a", "minha", "família"], emoji: "👨‍👩‍👧" },
  { words: ["A", "chuva", "molha", "a", "terra"], emoji: "🌧️" },
];

export function GameOrdenaFrase() {
  const gameId = "ordena-frase";
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [built, setBuilt] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);

  const frase = FRASES[idx];
  const chips = useMemo(
    () => (started ? shuffle(frase.words.map((w, i) => ({ w, i }))) : []),
    [started, frase],
  );

  useEffect(() => {
    if (started && idx === 0 && built.length === 0) {
      speak("Toca nas palavras pela ordem certa!", { pitch: 1.15 });
    }
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  const tapChip = (w: string) => {
    const expected = frase.words[built.length];
    if (w === expected) {
      playCorrect();
      const next = [...built, w];
      setBuilt(next);
      if (next.length === frase.words.length) {
        speak(frase.words.join(" ") + "! Perfeito!", { pitch: 1.2 });
        if (idx + 1 < FRASES.length) {
          playLevelUp();
          setTimeout(() => {
            setIdx((v) => v + 1);
            setBuilt([]);
          }, 1800);
        } else {
          playLevelUp();
          setDone(true);
          recordJuniorPlay(gameId, "Ordena a Frase: 6 frases completas!");
        }
      }
    } else {
      playWrong();
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
    }
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Ordena a Frase"
        steps={[
          { emoji: "🔤", text: "Toca nas palavras pela ordem certa." },
          { emoji: "📖", text: "Constrói a frase completa!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="flex items-center justify-between font-display text-sm">
        <span>Frase {idx + 1}/6</span>
        <span>{frase.emoji}</span>
      </div>
      {/* Frase em construção */}
      <div
        className={cn(
          "flex min-h-16 flex-wrap items-center gap-1.5 rounded-2xl border-4 border-dashed border-primary/30 bg-primary/5 p-3",
          wrong && "border-destructive/50 bg-destructive/5",
        )}
      >
        {built.length === 0 && (
          <span className="text-sm text-muted-foreground">Toca nas palavras aqui em baixo…</span>
        )}
        {built.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            initial={{ scale: 0.5, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="rounded-xl bg-success/15 px-2.5 py-1 font-display text-base font-bold text-success"
          >
            {w}
          </motion.span>
        ))}
      </div>
      {/* Chips embaralhados (só as que faltam) */}
      <div className="flex flex-wrap justify-center gap-2">
        {chips
          .filter(
            (c) =>
              built.filter((b) => b === c.w).length < chips.filter((x) => x.w === c.w).length ||
              !built.includes(c.w),
          )
          .map((c, i) => {
            // simples: mostra chips cuja quantidade usada < disponível
            const usedCount = built.filter((b) => b === c.w).length;
            const totalCount = frase.words.filter((w) => w === c.w).length;
            if (usedCount >= totalCount) return null;
            return (
              <motion.button
                key={`${c.w}-${c.i}-${i}`}
                whileTap={{ scale: 0.92 }}
                onClick={() => tapChip(c.w)}
                className="rounded-xl border-2 border-primary/30 bg-white px-3.5 py-2 font-display text-base font-bold shadow-sm hover:border-primary/60"
              >
                {c.w}
              </motion.button>
            );
          })}
      </div>
      {done && <DoneBanner msg="6 frases perfeitas!" emoji="✍️" />}
    </div>
  );
}

// ═══════════════ 3. Balão Matemático ═══════════════
function makeEquation(n: number) {
  const add = Math.random() < 0.6;
  let a: number, b: number, answer: number;
  if (add) {
    a = 1 + Math.floor(Math.random() * 10);
    b = 1 + Math.floor(Math.random() * 10);
    answer = a + b;
  } else {
    a = 5 + Math.floor(Math.random() * 14);
    b = 1 + Math.floor(Math.random() * a);
    answer = a - b;
  }
  const distract = new Set<number>();
  while (distract.size < 2) {
    const d = answer + (Math.floor(Math.random() * 7) - 3);
    if (d !== answer && d >= 0) distract.add(d);
  }
  return {
    prompt: `${a} ${add ? "+" : "−"} ${b}`,
    answer,
    options: shuffle([answer, ...distract]),
  };
}

const BALLOON_COLORS = ["#ef476f", "#06d6a0", "#118ab2", "#f78c6b"];

export function GameBalaoMatematico() {
  const gameId = "balao-matematico";
  const TOTAL = 8;
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [eq, setEq] = useState(() => makeEquation(0));
  const [popped, setPopped] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const nextRound = () => {
    if (round + 1 >= TOTAL) {
      playLevelUp();
      setDone(true);
      speak(`Incrível! Acertaste ${score + 1 <= TOTAL ? score : score} de ${TOTAL}!`, {
        pitch: 1.2,
      });
      recordJuniorPlay(gameId, `Balão Matemático: ${score}/${TOTAL}`);
      return;
    }
    setRound((r) => r + 1);
    setEq(makeEquation(round + 1));
    setPopped(null);
  };

  const tapBalloon = (opt: number) => {
    if (popped !== null) return;
    if (opt === eq.answer) {
      setPopped("correct");
      playCorrect();
      speak("Boom! Certo!", { pitch: 1.25 });
      setScore((s) => s + 1);
      setTimeout(nextRound, 1100);
    } else {
      setPopped("wrong");
      playWrong();
      speak("Ops! Era " + eq.answer, { pitch: 1.1 });
      setTimeout(nextRound, 1400);
    }
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Balão Matemático"
        steps={[
          { emoji: "🎈", text: "Resolve a conta em baixo." },
          { emoji: "💥", text: "Estoura o balão com a resposta certa!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="flex justify-between font-display text-sm">
        <span>
          Conta {round + 1}/{TOTAL}
        </span>
        <span>Acertos: {score}</span>
      </div>
      <div className="relative h-56 overflow-hidden rounded-3xl border-4 border-sky-200 bg-gradient-to-b from-sky-100 to-sky-50">
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <span className="rounded-full bg-white/90 px-4 py-1.5 font-display text-2xl font-black text-slate-800 shadow">
            {eq.prompt} = ?
          </span>
        </div>
        {/* balões a flutuar */}
        <div className="absolute inset-x-0 bottom-3 flex items-end justify-around px-2">
          {eq.options.map((opt, i) => (
            <motion.button
              key={`${round}-${i}`}
              type="button"
              onClick={() => tapBalloon(opt)}
              animate={{ y: [0, -8, 0, -5, 0] }}
              transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, ease: "easeInOut" }}
              whileTap={{ scale: 1.25 }}
              className="relative flex flex-col items-center"
              aria-label={`balão com ${opt}`}
            >
              <span
                className={cn(
                  "flex h-14 w-11 items-center justify-center rounded-[50%] font-display text-lg font-black text-white shadow-md",
                  popped === "correct" && opt === eq.answer && "animate-ping",
                )}
                style={{ backgroundColor: BALLOON_COLORS[i % BALLOON_COLORS.length] }}
              >
                {popped && opt === (popped === "correct" ? eq.answer : opt) && popped === "correct"
                  ? "💥"
                  : opt}
              </span>
              <span className="h-6 w-px bg-white/70" />
            </motion.button>
          ))}
        </div>
      </div>
      {done && <DoneBanner msg={`${score}/${TOTAL} certas!`} emoji="🎈" />}
    </div>
  );
}

// ═══════════════ 4. Províncias de Moçambique ═══════════════
const MZ_QUESTIONS = [
  {
    q: "Qual é a capital da província de Maputo?",
    options: ["Matola (província) / Maputo cidade", "Xai-Xai", "Inhambane"],
    answer: 0,
    fact: "Maputo é a maior cidade do país!",
  },
  {
    q: "A capital de Sofala é…",
    options: ["Beira", "Quelimane", "Chimoio"],
    answer: 0,
    fact: "A Beira é o 2.º porto mais importante.",
  },
  {
    q: "Qual é a capital de Nampula?",
    options: ["Nampula", "Pemba", "Lichinga"],
    answer: 0,
    fact: "Nampula é a província com mais habitantes.",
  },
  {
    q: "A capital de Cabo Delgado é…",
    options: ["Pemba", "Mocímboa", "Montepuez"],
    answer: 0,
    fact: "Pemba fica numa baía lindíssima.",
  },
  {
    q: "Qual é a capital do Niassa?",
    options: ["Lichinga", "Tete", "Chimoio"],
    answer: 0,
    fact: "O Niassa tem a maior reserva natural do país.",
  },
  {
    q: "A capital de Tete é…",
    options: ["Tete", "Marromeu", "Moatize"],
    answer: 0,
    fact: "A ponte de Tete atravessa o Zambeze.",
  },
  {
    q: "Qual é a capital da Zambézia?",
    options: ["Quelimane", "Gurúè", "Mocuba"],
    answer: 0,
    fact: "A Zambézia produz muito chá e coco.",
  },
  {
    q: "A capital de Manica é…",
    options: ["Chimoio", "Catandica", "Gondola"],
    answer: 0,
    fact: "Chimoio fica perto das montanhas.",
  },
  {
    q: "Qual é a capital de Gaza?",
    options: ["Xai-Xai", "Chókwè", "Chibuto"],
    answer: 0,
    fact: "Gaza tem as praias do Xai-Xai.",
  },
  {
    q: "A capital de Inhambane é…",
    options: ["Inhambane", "Maxixe", "Vilanculos"],
    answer: 0,
    fact: "Inhambane é uma das cidades mais antigas.",
  },
];

export function GameProvinciasMZ() {
  const gameId = "provincias-mz";
  const TOTAL = 8;
  const [started, setStarted] = useState(false);
  const [qs, setQs] = useState(() => shuffle(MZ_QUESTIONS).slice(0, TOTAL));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = qs[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      setScore((s) => s + 1);
      playCorrect();
      speak(`Certo! ${q.fact}`, { pitch: 1.2 });
    } else {
      playWrong();
      speak(`Era ${q.options[q.answer]}. ${q.fact}`, { pitch: 1.1 });
    }
    setTimeout(() => {
      if (idx + 1 >= TOTAL) {
        playLevelUp();
        setDone(true);
        recordJuniorPlay(gameId, `Províncias MZ: ${score + (i === q.answer ? 1 : 0)}/${TOTAL}`);
      } else {
        setIdx((v) => v + 1);
        setPicked(null);
      }
    }, 1800);
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Províncias de Moçambique"
        steps={[
          { emoji: "🗺️", text: "Vou perguntar sobre províncias e capitais." },
          { emoji: "🇲🇿", text: "Toca na resposta certa e aprende factos!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="flex justify-between font-display text-sm">
        <span>
          Pergunta {idx + 1}/{TOTAL}
        </span>
        <span>Acertos: {score}</span>
      </div>
      {!done && q && (
        <>
          <p className="rounded-2xl border-4 border-primary/30 bg-primary/10 p-4 text-center font-display text-lg font-bold">
            {q.q}
          </p>
          <div className="grid gap-2">
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => pick(i)}
                disabled={picked !== null}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3 text-left font-display font-semibold transition",
                  picked === null && "border-border bg-background hover:border-primary/50",
                  picked !== null && i === q.answer && "border-success bg-success/15 text-success",
                  picked !== null &&
                    i === picked &&
                    i !== q.answer &&
                    "border-destructive bg-destructive/10 text-destructive",
                  picked !== null && i !== q.answer && i !== picked && "border-border opacity-50",
                )}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </>
      )}
      {done && <DoneBanner msg={`${score}/${TOTAL} sobre Moçambique!`} emoji="🇲🇿" />}
    </div>
  );
}
