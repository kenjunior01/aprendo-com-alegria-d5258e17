import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";

const Done = ({ msg }: { msg: string }) => (
  <p className="mt-4 text-center font-display text-2xl text-success">🌟 {msg} 🌟</p>
);

// 🌑 Associa a Sombra
const SHADOW_ITEMS = [
  { e: "🐘", id: "ele" }, { e: "🦒", id: "gir" }, { e: "🦁", id: "leo" },
  { e: "🐢", id: "tar" }, { e: "🐰", id: "rab" }, { e: "🐧", id: "pen" },
];
export function GameSombras({ onDone }: { onDone?: () => void }) {
  const [shadows] = useState(() => [...SHADOW_ITEMS].sort(() => Math.random() - 0.5));
  const [animals] = useState(() => [...SHADOW_ITEMS].sort(() => Math.random() - 0.5));
  const [picked, setPicked] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const done = Object.keys(matched).length >= SHADOW_ITEMS.length;
  useEffect(() => { if (done) { recordJuniorPlay("sombras", "Encontrou todas as sombras!"); onDone?.(); } }, [done]);

  const tryMatch = (animalId: string) => {
    if (!picked) return;
    if (picked === animalId) {
      setMatched((m) => ({ ...m, [animalId]: true }));
    }
    setPicked(null);
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Toca numa sombra e depois no animal certo 🌑</p>
      <div className="grid grid-cols-3 gap-3">
        {shadows.map((s) => (
          <button
            key={"sh-" + s.id}
            onClick={() => !matched[s.id] && setPicked(s.id)}
            disabled={!!matched[s.id]}
            className={`text-5xl rounded-2xl p-3 transition ${
              matched[s.id] ? "opacity-30" : picked === s.id ? "bg-primary/20 ring-4 ring-primary" : "bg-muted hover:scale-105"
            }`}
            style={!matched[s.id] && picked !== s.id ? { filter: "brightness(0)" } : {}}
            aria-label="sombra"
          >
            {s.e}
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">↓ animais ↓</div>
      <div className="grid grid-cols-3 gap-3">
        {animals.map((a) => (
          <button
            key={"a-" + a.id}
            onClick={() => tryMatch(a.id)}
            disabled={!!matched[a.id]}
            className={`text-5xl rounded-2xl p-3 transition ${
              matched[a.id] ? "bg-success/30" : "bg-card hover:scale-105 shadow-sm"
            }`}
          >
            {a.e}
          </button>
        ))}
      </div>
      {done && <Done msg="Boa observação!" />}
    </div>
  );
}

// 🔁 Completa o Padrão
const PATTERN_BANK = [
  { seq: ["🔴", "🔵", "🔴", "🔵", "🔴"], next: "🔵", opts: ["🔵", "🟡", "🟢"] },
  { seq: ["🌞", "🌙", "🌞", "🌙"], next: "🌞", opts: ["🌞", "⭐", "🌧️"] },
  { seq: ["🐶", "🐱", "🐶", "🐱", "🐶"], next: "🐱", opts: ["🐱", "🐭", "🐰"] },
  { seq: ["🍎", "🍌", "🍎", "🍌"], next: "🍎", opts: ["🍎", "🍇", "🍓"] },
  { seq: ["⭐", "⭐", "🌙", "⭐", "⭐"], next: "🌙", opts: ["🌙", "⭐", "🌞"] },
  { seq: ["🟥", "🟦", "🟨", "🟥", "🟦"], next: "🟨", opts: ["🟨", "🟩", "🟪"] },
  { seq: ["🚗", "🚌", "🚗", "🚌"], next: "🚗", opts: ["🚗", "🚕", "🚒"] },
  { seq: ["🎈", "🎈", "🎁", "🎈", "🎈"], next: "🎁", opts: ["🎁", "🎂", "🎉"] },
];
export function GamePadroes({ onDone }: { onDone?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const total = 5;
  const q = PATTERN_BANK[idx % PATTERN_BANK.length];

  const pick = (o: string) => {
    if (feedback) return;
    if (o === q.next) {
      setFeedback("ok"); setScore((s) => s + 1);
      setTimeout(() => {
        if (idx + 1 >= total) {
          recordJuniorPlay("padroes", "Completou os padrões!");
          onDone?.();
        }
        setIdx((i) => i + 1); setFeedback(null);
      }, 800);
    } else {
      setFeedback("no"); setTimeout(() => setFeedback(null), 600);
    }
  };
  const done = idx >= total;

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Que figura vem a seguir? 🔁</p>
      {!done ? (
        <>
          <div className="text-5xl tracking-wider bg-muted/40 rounded-2xl p-4 inline-flex gap-1 flex-wrap justify-center">
            {q.seq.map((c, i) => <span key={i}>{c}</span>)}
            <span className="opacity-40">❓</span>
          </div>
          <div className="flex gap-3 justify-center">
            {q.opts.map((o) => (
              <button key={o} onClick={() => pick(o)}
                className={`text-5xl rounded-2xl p-3 transition shadow-sm ${
                  feedback === "ok" && o === q.next ? "bg-success/40 scale-110" :
                  feedback === "no" ? "bg-card hover:scale-105" : "bg-card hover:scale-105"
                }`}>{o}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{idx + 1}/{total}</p>
        </>
      ) : (
        <Done msg={`Acertaste ${score}/${total}!`} />
      )}
    </div>
  );
}

// 🌀 Labirinto Simples — usa o teclado ou os botões
const MAZE = [
  "S....#...E",
  ".#.#.#.#..",
  ".#...#....",
  ".###.####.",
  ".....#....",
  "####.#.###",
  "...#...#..",
  ".#.#.#.#..",
  ".#...#....",
  "..#######.",
];
export function GameLabirinto({ onDone }: { onDone?: () => void }) {
  const start = useMemo(() => {
    for (let r = 0; r < MAZE.length; r++) {
      const c = MAZE[r].indexOf("S");
      if (c >= 0) return { r, c };
    }
    return { r: 0, c: 0 };
  }, []);
  const exitPos = useMemo(() => {
    for (let r = 0; r < MAZE.length; r++) {
      const c = MAZE[r].indexOf("E");
      if (c >= 0) return { r, c };
    }
    return { r: 0, c: 0 };
  }, []);
  const [pos, setPos] = useState(start);
  const [won, setWon] = useState(false);

  const move = (dr: number, dc: number) => {
    if (won) return;
    const nr = pos.r + dr, nc = pos.c + dc;
    if (nr < 0 || nc < 0 || nr >= MAZE.length || nc >= MAZE[0].length) return;
    if (MAZE[nr][nc] === "#") return;
    const next = { r: nr, c: nc };
    setPos(next);
    if (nr === exitPos.r && nc === exitPos.c) {
      setWon(true);
      recordJuniorPlay("labirinto", "Saiu do labirinto!");
      onDone?.();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(-1, 0);
      if (e.key === "ArrowDown") move(1, 0);
      if (e.key === "ArrowLeft") move(0, -1);
      if (e.key === "ArrowRight") move(0, 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-muted-foreground">Leva o ratinho 🐭 ao queijo 🧀</p>
      <div className="inline-block bg-muted/40 rounded-2xl p-2">
        {MAZE.map((row, r) => (
          <div key={r} className="flex">
            {row.split("").map((cell, c) => {
              const here = pos.r === r && pos.c === c;
              const isExit = exitPos.r === r && exitPos.c === c;
              return (
                <div key={c} className={`h-7 w-7 grid place-items-center text-xs rounded ${
                  cell === "#" ? "bg-foreground/80" : "bg-background"
                }`}>
                  {here ? "🐭" : isExit ? "🧀" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => move(-1, 0)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground text-lg">↑</button>
        <div className="flex gap-1">
          <button onClick={() => move(0, -1)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground text-lg">←</button>
          <button onClick={() => move(1, 0)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground text-lg">↓</button>
          <button onClick={() => move(0, 1)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground text-lg">→</button>
        </div>
      </div>
      {won && <Done msg="Encontraste o queijo!" />}
    </div>
  );
}

// ❓ Trivia Júnior — usa banco de trivia
import { getRandomTrivia } from "@/lib/triviaBank";

export function GameTriviaJr({ onDone }: { onDone?: () => void }) {
  const [questions] = useState(() => getRandomTrivia(8));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = questions[idx];
  const done = idx >= questions.length;

  useEffect(() => { if (done) { recordJuniorPlay("trivia-jr", `Trivia: ${score}/${questions.length}`); onDone?.(); } }, [done]);

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answerIndex) setScore((s) => s + 1);
    setTimeout(() => { setPicked(null); setIdx((x) => x + 1); }, 900);
  };

  if (done) {
    return (
      <div className="space-y-2 text-center">
        <Done msg={`Acertaste ${score} de ${questions.length}!`} />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-xs text-muted-foreground">Pergunta {idx + 1} / {questions.length} · {q.category}</p>
      <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-semibold px-2">
        {q.prompt}
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-[28rem] mx-auto">
        {q.options.map((o, i) => {
          const isCorrect = picked !== null && i === q.answerIndex;
          const isWrong = picked === i && i !== q.answerIndex;
          return (
            <button key={i} onClick={() => pick(i)}
              className={`p-3 rounded-2xl border text-sm transition ${
                isCorrect ? "bg-success/30 border-success" :
                isWrong ? "bg-destructive/30 border-destructive" :
                "bg-card hover:bg-muted"
              }`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
