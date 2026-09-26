// JuniorGamesV8 — 8 mini-jogos novos de qualidade (memória, corrida, lógica…).
// Mantém o padrão dos V6/V7: TTS, sons, recordJuniorPlay, GameTutorial.
import { useEffect, useMemo, useRef, useState } from "react";
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

// ═══════════════ 1. Memória das Frutas (pares) ═══════════════
const FRUTAS = ["🍎", "🍌", "🍇", "🥭", "🍓", "🍊"];
export function GameMemoriaFrutas() {
  const gameId = "memoria-frutas";
  const [started, setStarted] = useState(false);
  const [deck] = useState(() =>
    shuffle([...FRUTAS, ...FRUTAS].map((f, i) => ({ id: i, fruit: f }))),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const done = matched.length === FRUTAS.length;

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Incrível! Encontraste todos os pares em ${moves} jogadas!`, { pitch: 1.2 });
      recordJuniorPlay(gameId, `Memória das Frutas: ${moves} jogadas`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    playCorrect(); // som suave de virar
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => deck[i].fruit);
      if (a === b) {
        setTimeout(() => {
          setMatched((m) => [...m, ...next]);
          setFlipped([]);
          speak("Par encontrado!", { pitch: 1.25, rate: 1 });
        }, 450);
      } else {
        setTimeout(() => setFlipped([]), 850);
      }
    }
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Memória das Frutas"
        steps={[
          { emoji: "🃏", text: "Toca nas cartas para virar." },
          { emoji: "🍎", text: "Encontra os pares iguais!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="flex justify-between font-display text-sm">
        <span>Jogadas: {moves}</span>
        <span>Pares: {matched.length / 2}/6</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {deck.map((card, i) => {
          const open = flipped.includes(i) || matched.includes(i);
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => flip(i)}
              className={cn(
                "flex h-20 items-center justify-center rounded-2xl border-4 text-4xl shadow-md transition-colors sm:h-24",
                open ? "border-amber-300 bg-white" : "border-primary/30 bg-primary/15",
                matched.includes(i) && "border-success/60 bg-success/10 opacity-80",
              )}
              aria-label={open ? card.fruit : "carta virada"}
            >
              {open ? card.fruit : "❓"}
            </motion.button>
          );
        })}
      </div>
      {done && <DoneBanner msg={`Todos os pares em ${moves} jogadas!`} />}
    </div>
  );
}

// ═══════════════ 2. Corrida de Soma (60 s) ═══════════════
export function GameCorridaSoma() {
  const gameId = "corrida-soma";
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => genSum());
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);

  function genSum() {
    const a = 1 + Math.floor(Math.random() * 10);
    const b = 1 + Math.floor(Math.random() * 10);
    const ans = a + b;
    const ds = shuffle([ans + 1, ans - 1, ans + 2].map(String));
    return { prompt: `${a} + ${b}`, ans: String(ans), options: shuffle([String(ans), ...ds]) };
  }

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Corrida terminada! Fizeste ${score} somas!`, { pitch: 1.15 });
      recordJuniorPlay(gameId, `Corrida de Soma: ${score} acertos em 60s`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (opt: string) => {
    if (done) return;
    if (opt === q.ans) {
      setScore((s) => s + 1);
      playCorrect();
      setFlash("ok");
    } else {
      playWrong();
      setFlash("no");
    }
    setTimeout(() => setFlash(null), 250);
    setQ(genSum());
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Corrida de Soma"
        steps={[
          { emoji: "⚡", text: "Tens 60 segundos!" },
          { emoji: "➕", text: "Resolve o máximo de somas." },
        ]}
        onStart={() => {
          setStarted(true);
          speak("Prepara-te… já!", { rate: 1.05 });
        }}
      />
      {!started && (
        <p className="text-center text-muted-foreground">Toca em Começar no tutorial!</p>
      )}
      {started && !done && (
        <>
          <div className="flex justify-between font-display text-sm">
            <span className={cn("font-bold", time <= 10 && "text-destructive")}>⏱ {time}s</span>
            <span className="text-xp font-bold">⭐ {score}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-streak transition-all duration-1000 ease-linear"
              style={{ width: `${(time / 60) * 100}%` }}
            />
          </div>
          <motion.p
            key={q.prompt}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-center font-display text-5xl font-black tabular-nums",
              flash === "ok" && "text-success",
              flash === "no" && "text-destructive",
            )}
          >
            {q.prompt} = ?
          </motion.p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.92 }}
                onClick={() => answer(opt)}
                className="touch-target-kid rounded-3xl border-4 border-border bg-card py-6 font-display text-3xl font-black shadow-lg active:border-primary"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </>
      )}
      {done && <DoneBanner msg={`${score} somas em 60 segundos!`} emoji="🏁" />}
    </div>
  );
}

// ═══════════════ 3. Verdade ou Falso ═══════════════
const TRUE_FALSE: { s: string; a: boolean }[] = [
  { s: "O sol nasce pela manhã.", a: true },
  { s: "Os peixes andam de bicicleta.", a: false },
  { s: "A água é molhada.", a: true },
  { s: "As árvores têm asas.", a: false },
  { s: "2 + 2 é igual a 4.", a: true },
  { s: "A lua é feita de queijo.", a: false },
  { s: "Os pássaros voam.", a: true },
  { s: "Elefantes sabem voar como super-heróis.", a: false },
  { s: "O gelo é frio.", a: true },
  { s: "As casas caminham até à escola.", a: false },
  { s: "As flores precisam de água.", a: true },
  { s: "As pedras falam inglês.", a: false },
  { s: "O fogo é quente.", a: true },
  { s: "As estrelas são quadradas.", a: false },
  { s: "A chuva molha a terra.", a: true },
  { s: "As bananas tocam piano à noite.", a: false },
];
export function GameVerdadeFalso() {
  const gameId = "verdade-falso";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);
  const rounds = useMemo(() => shuffle(TRUE_FALSE).slice(0, 8), []);
  const cur = rounds[Math.min(round, rounds.length - 1)];

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Acertaste em ${score} de 8!`, { pitch: 1.15 });
      recordJuniorPlay(gameId, `Verdade/Falso: ${score}/8`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (v: boolean) => {
    if (done) return;
    if (v === cur.a) {
      setScore((s) => s + 1);
      playCorrect();
      speak("Certo!", { pitch: 1.25, rate: 1.05 });
      setRound((r) => (r + 1 >= rounds.length ? (setDone(true), r) : r + 1));
    } else {
      playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="space-y-5">
      <GameTutorial
        gameId={gameId}
        title="Verdade ou Falso"
        steps={[
          { emoji: "✅", text: "Vês uma frase." },
          { emoji: "🤔", text: "É verdade ou é mentira? Toca no certo!" },
        ]}
        onStart={() => setStarted(true)}
      />
      {started && !done && (
        <>
          <p className="text-center font-display text-sm text-muted-foreground">
            Ronda {Math.min(round + 1, 8)}/8 · ⭐ {score}
          </p>
          <motion.p
            animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}}
            className="rounded-3xl border-4 border-secondary/40 bg-card px-4 py-8 text-center font-display text-2xl font-bold leading-snug"
          >
            “{cur.s}”
          </motion.p>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => answer(true)}
              className="touch-target-kid rounded-3xl border-4 border-success/40 bg-success/15 py-8 font-display text-2xl font-black text-success shadow-lg active:bg-success/30"
            >
              ✅ Verdade
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => answer(false)}
              className="touch-target-kid rounded-3xl border-4 border-destructive/40 bg-destructive/10 py-8 font-display text-2xl font-black text-destructive shadow-lg active:bg-destructive/20"
            >
              ❌ Falso
            </motion.button>
          </div>
        </>
      )}
      {done && <DoneBanner msg={`${score} de 8 certas!`} emoji="🧠" />}
    </div>
  );
}

// ═══════════════ 4. Palavra Mágica (ordenar letras) ═══════════════
const PALAVRAS: { w: string; e: string }[] = [
  { w: "GATO", e: "🐱" },
  { w: "BOLA", e: "⚽" },
  { w: "CASA", e: "🏠" },
  { w: "FLOR", e: "🌸" },
  { w: "PATO", e: "🦆" },
  { w: "SAPO", e: "🐸" },
  { w: "MEL", e: "🍯" },
  { w: "SOL", e: "☀️" },
  { w: "PÉ", e: "🦶" },
  { w: "BICO", e: "🐦" },
];
export function GamePalavraMagica() {
  const gameId = "palavra-magica";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const [built, setBuilt] = useState<number[]>([]);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const rounds = useMemo(() => shuffle(PALAVRAS).slice(0, 5), []);
  const cur = rounds[Math.min(round, rounds.length - 1)];
  const letters = useMemo(
    () => cur.w.split("").map((l, i) => ({ l, id: `${round}-${i}` })),
    [cur, round],
  );
  const shuffled = useMemo(() => shuffle(letters), [letters]);
  const target = built.length;
  const done2 = built.length === cur.w.length;

  useEffect(() => {
    if (done2 && !done) {
      playCorrect();
      speak(`${cur.w}! Muito bem!`, { pitch: 1.2 });
      const t = setTimeout(() => {
        setBuilt([]);
        if (round + 1 >= rounds.length) {
          setDone(true);
          playLevelUp();
          recordJuniorPlay(gameId, "Palavra Mágica: 5 palavras formadas");
        } else setRound((r) => r + 1);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [done2]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (idx: number, i: number) => {
    if (built.includes(idx) || done) return;
    if (letters[target].l === shuffled[i].l) {
      setBuilt((b) => [...b, idx]);
      playCorrect();
    } else {
      playWrong();
      setWrongIdx(i);
      setTimeout(() => setWrongIdx(null), 450);
    }
  };

  return (
    <div className="space-y-5">
      <GameTutorial
        gameId={gameId}
        title="Palavra Mágica"
        steps={[
          { emoji: "🔤", text: "Vês letras misturadas." },
          { emoji: "👆", text: "Toca na ordem certa para formar a palavra!" },
        ]}
        onStart={() => setStarted(true)}
      />
      {started && !done && (
        <>
          <p className="text-center text-6xl">{cur.e}</p>
          <div className="flex justify-center gap-2">
            {cur.w.split("").map((_, i) => (
              <span
                key={i}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed font-display text-2xl font-black",
                  i < built.length
                    ? "border-success bg-success/15 text-success"
                    : "border-muted-foreground/30",
                )}
              >
                {i < built.length ? cur.w[i] : ""}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {shuffled.map((t, i) => {
              const used = built.includes(i);
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.9 }}
                  animate={wrongIdx === i ? { x: [0, -8, 8, -5, 0] } : {}}
                  onClick={() => tap(i, i)}
                  disabled={used}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-border bg-card font-display text-2xl font-black shadow-md",
                    used && "border-success/50 bg-success/10 opacity-40",
                  )}
                >
                  {t.l}
                </motion.button>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Palavra {Math.min(round + 1, 5)}/5
          </p>
        </>
      )}
      {done && <DoneBanner msg="Formaste 5 palavras!" emoji="✨" />}
    </div>
  );
}

// ═══════════════ 5. Moedas de Moçambique ═══════════════
const PRODUTOS = [
  { e: "🥭", nome: "manga", preco: 15 },
  { e: "🍞", nome: "pão", preco: 10 },
  { e: "🥛", nome: "leite", preco: 25 },
  { e: "🍌", nome: "banana", preco: 5 },
  { e: "🍬", nome: "caramelo", preco: 8 },
  { e: "💧", nome: "água", preco: 20 },
];
export function GameMoedasMz() {
  const gameId = "moedas-mz";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const rounds = useMemo(() => {
    const out = [];
    for (let i = 0; i < 6; i++) {
      const p = PRODUTOS[Math.floor(Math.random() * PRODUTOS.length)];
      const mult = 1 + Math.floor(Math.random() * 3); // 1-3 unidades
      out.push({ ...p, qty: mult, total: p.preco * mult });
    }
    return out;
  }, []);
  const cur = rounds[Math.min(round, rounds.length - 1)];
  const options = useMemo(() => {
    const ds = shuffle([cur.total + 5, cur.total - 5, cur.total + 10].map(String));
    return shuffle([String(cur.total), ...ds]);
  }, [cur]);

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Compraste tudo! ${score} de 6 certas!`, { pitch: 1.15 });
      recordJuniorPlay(gameId, `Moedas MZ: ${score}/6 compras certas`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const pay = (v: string) => {
    if (done) return;
    if (v === String(cur.total)) {
      setScore((s) => s + 1);
      playCorrect();
      speak("Certo! Obrigado!", { pitch: 1.2, rate: 1.05 });
    } else playWrong();
    setRound((r) => (r + 1 >= rounds.length ? (setDone(true), r) : r + 1));
  };

  return (
    <div className="space-y-5">
      <GameTutorial
        gameId={gameId}
        title="Moedas de Moçambique"
        steps={[
          { emoji: "🛒", text: "Quantos meticais custa tudo?" },
          { emoji: "🪙", text: "Conta e toca no valor certo!" },
        ]}
        onStart={() => setStarted(true)}
      />
      {started && !done && (
        <>
          <p className="text-center font-display text-sm text-muted-foreground">
            Compra {Math.min(round + 1, 6)}/6 · ⭐ {score}
          </p>
          <div className="rounded-3xl border-4 border-xp/30 bg-card p-5 text-center">
            <p className="text-5xl">{cur.e}</p>
            <p className="mt-1 font-display text-lg font-bold">
              {cur.qty} × {cur.nome} ({cur.preco} MT cada)
            </p>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: Math.min(cur.qty, 5) }).map((_, i) => (
                <span key={i} className="text-2xl">
                  🪙
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {options.map((v) => (
              <motion.button
                key={v}
                whileTap={{ scale: 0.92 }}
                onClick={() => pay(v)}
                className="rounded-3xl border-4 border-border bg-card py-5 font-display text-2xl font-black shadow-lg active:border-xp"
              >
                {v} MT
              </motion.button>
            ))}
          </div>
        </>
      )}
      {done && <DoneBanner msg={`${score} de 6 compras certas!`} emoji="💰" />}
    </div>
  );
}

// ═══════════════ 6. Saltos de Contagem (2 em 2, 5 em 5…) ═══════════════
export function GameSaltoContar() {
  const gameId = "salto-contar";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [jump, setJump] = useState(0);
  const rounds = useMemo(() => {
    const out: { step: number; seq: number[]; ans: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const step = [2, 5, 10][Math.floor(Math.random() * 3)];
      const start = 2 + Math.floor(Math.random() * 5) * step;
      const seq = [start, start + step, start + 2 * step];
      out.push({ step, seq, ans: start + 3 * step });
    }
    return out;
  }, []);
  const cur = rounds[Math.min(round, rounds.length - 1)];
  const options = useMemo(() => {
    const ds = shuffle([cur.ans + cur.step, cur.ans - cur.step, cur.ans + 1].map(String));
    return shuffle([String(cur.ans), ...ds]);
  }, [cur]);

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Salto salto! ${score} de 6 certas!`, { pitch: 1.15 });
      recordJuniorPlay(gameId, `Saltos de Contagem: ${score}/6`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const hop = (v: string) => {
    if (done) return;
    if (v === String(cur.ans)) {
      setScore((s) => s + 1);
      setJump((j) => j + 1);
      playCorrect();
      speak(`De ${cur.step} em ${cur.step}!`, { pitch: 1.2, rate: 1.05 });
    } else playWrong();
    setRound((r) => (r + 1 >= rounds.length ? (setDone(true), r) : r + 1));
  };

  return (
    <div className="space-y-5">
      <GameTutorial
        gameId={gameId}
        title="Saltos de Contagem"
        steps={[
          { emoji: "🐸", text: "O sapo salta de 2 em 2, 5 em 5…" },
          { emoji: "🔢", text: "Qual é o próximo número?" },
        ]}
        onStart={() => setStarted(true)}
      />
      {started && !done && (
        <>
          <p className="text-center font-display text-sm text-muted-foreground">
            Salto {Math.min(round + 1, 6)}/6 · ⭐ {score}
          </p>
          <motion.div
            animate={jump % 2 === 0 && jump > 0 ? { y: [0, -22, 0] } : {}}
            className="text-center text-6xl"
          >
            🐸
          </motion.div>
          <div className="flex items-center justify-center gap-3 rounded-3xl border-4 border-secondary/40 bg-card py-6 font-display text-3xl font-black">
            <span className="rounded-2xl bg-secondary/20 px-3 py-1.5">{cur.seq[0]}</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-2xl bg-secondary/20 px-3 py-1.5">{cur.seq[1]}</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-2xl bg-secondary/20 px-3 py-1.5">{cur.seq[2]}</span>
            <span className="text-muted-foreground">→</span>
            <span className="rounded-2xl border-2 border-dashed border-primary px-4 py-1.5 text-primary">
              ?
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {options.map((v) => (
              <motion.button
                key={v}
                whileTap={{ scale: 0.9 }}
                onClick={() => hop(v)}
                className="touch-target-kid rounded-3xl border-4 border-border bg-card py-6 font-display text-2xl font-black shadow-lg active:border-primary"
              >
                {v}
              </motion.button>
            ))}
          </div>
        </>
      )}
      {done && <DoneBanner msg={`${score} de 6 saltos certos!`} emoji="🐸" />}
    </div>
  );
}

// ═══════════════ 7. Quebra-Cabeças Deslizante 3×3 ═══════════════
export function GameQuebraEmoji() {
  const gameId = "quebra-emoji";
  const [started, setStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [board, setBoard] = useState<number[]>(() => {
    // embaralhar com movimentos legais (sempre solucionável)
    const b = [...solved];
    let blank = 8;
    for (let i = 0; i < 80; i++) {
      const neighbors = [
        blank - 3,
        blank + 3,
        blank % 3 > 0 ? blank - 1 : -1,
        blank % 3 < 2 ? blank + 1 : -1,
      ].filter((n) => n >= 0 && n < 9);
      const pickN = neighbors[Math.floor(Math.random() * neighbors.length)];
      [b[blank], b[pickN]] = [b[pickN], b[blank]];
      blank = pickN;
    }
    return b;
  });

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Resolveste o quebra-cabeças em ${moves} movimentos!`, { pitch: 1.2 });
      recordJuniorPlay(gameId, `Quebra-Emoji: resolvido em ${moves} movimentos`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const blankIdx = board.indexOf(0);
  const tap = (i: number) => {
    if (done) return;
    const ok =
      Math.abs(i - blankIdx) === 3 ||
      (Math.abs(i - blankIdx) === 1 && Math.floor(i / 3) === Math.floor(blankIdx / 3));
    if (!ok) return;
    const b = [...board];
    [b[i], b[blankIdx]] = [b[blankIdx], b[i]];
    setBoard(b);
    setMoves((m) => m + 1);
    playCorrect();
    if (b.every((v, idx) => v === solved[idx])) {
      setDone(true);
    }
  };

  return (
    <div className="space-y-4">
      <GameTutorial
        gameId={gameId}
        title="Quebra-Emoji"
        steps={[
          { emoji: "🧩", text: "Toca numa peça ao lado do vazio." },
          { emoji: "↔️", text: "Ordena tudo de 1 a 8!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <div className="flex justify-between font-display text-sm">
        <span>Movimentos: {moves}</span>
      </div>
      <div className="mx-auto grid w-fit grid-cols-3 gap-2 rounded-3xl border-4 border-accent/40 bg-accent/10 p-3">
        {board.map((v, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.92 }}
            onClick={() => tap(i)}
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl border-4 font-display text-3xl font-black shadow-md",
              v === 0
                ? "border-transparent bg-transparent"
                : "border-accent/50 bg-card active:bg-accent/20",
            )}
            aria-label={v === 0 ? "vazio" : `peça ${v}`}
          >
            {v === 0 ? "" : v === 8 ? "⭐" : v}
          </motion.button>
        ))}
      </div>
      {done && <DoneBanner msg={`Resolvido em ${moves} movimentos!`} emoji="🧩" />}
    </div>
  );
}

// ═══════════════ 8. Par ou Ímpar ═══════════════
export function GameParOuImpar() {
  const gameId = "par-ou-impar";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [pop, setPop] = useState(0);
  const nums = useMemo(
    () => Array.from({ length: 10 }, () => 1 + Math.floor(Math.random() * 50)),
    [],
  );
  const cur = nums[Math.min(round, nums.length - 1)];

  useEffect(() => {
    if (done) {
      playLevelUp();
      speak(`Fizeste ${score} de 10!`, { pitch: 1.15 });
      recordJuniorPlay(gameId, `Par/Ímpar: ${score}/10`);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (isPar: boolean) => {
    if (done) return;
    const isCurPar = cur % 2 === 0;
    if (isPar === isCurPar) {
      setScore((s) => s + 1);
      setPop((p) => p + 1);
      playCorrect();
    } else playWrong();
    setRound((r) => (r + 1 >= nums.length ? (setDone(true), r) : r + 1));
  };

  return (
    <div className="space-y-5">
      <GameTutorial
        gameId={gameId}
        title="Par ou Ímpar"
        steps={[
          { emoji: "🔢", text: "Vês um número." },
          { emoji: "👆", text: "É par ou ímpar? Toca no certo!" },
        ]}
        onStart={() => setStarted(true)}
      />
      {started && !done && (
        <>
          <p className="text-center font-display text-sm text-muted-foreground">
            Ronda {Math.min(round + 1, 10)}/10 · ⭐ {score}
          </p>
          <motion.div
            key={round}
            animate={pop ? { scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] } : {}}
            className="text-center font-display text-7xl font-black tabular-nums text-primary"
          >
            {cur}
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => answer(true)}
              className="touch-target-kid rounded-3xl border-4 border-primary/40 bg-primary/15 py-8 font-display text-2xl font-black shadow-lg active:bg-primary/25"
            >
              🌓 Par
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => answer(false)}
              className="touch-target-kid rounded-3xl border-4 border-accent/40 bg-accent/15 py-8 font-display text-2xl font-black shadow-lg active:bg-accent/25"
            >
              🌗 Ímpar
            </motion.button>
          </div>
        </>
      )}
      {done && <DoneBanner msg={`${score} de 10 certas!`} emoji="🔢" />}
    </div>
  );
}
