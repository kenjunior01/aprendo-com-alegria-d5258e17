import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";

function speak(t: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try { const u = new SpeechSynthesisUtterance(t); u.lang = "pt-PT"; u.rate = 0.9; window.speechSynthesis.speak(u); } catch { /* */ }
}
const Done = ({ msg }: { msg: string }) => (
  <p className="mt-4 text-center font-display text-2xl text-success">🌟 {msg} 🌟</p>
);

// 🎨 Pinta o Desenho — toca em cada zona para pintar
const PAINT_ZONES = [
  { id: "sol", label: "Sol", x: 30, y: 25, r: 20 },
  { id: "casa", label: "Casa", x: 50, y: 65, r: 18 },
  { id: "arvore", label: "Árvore", x: 80, y: 60, r: 16 },
  { id: "relva", label: "Relva", x: 50, y: 90, r: 35 },
];
const PALETTE = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];
export function GamePinta({ onDone }: { onDone?: () => void }) {
  const [color, setColor] = useState(PALETTE[0]);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const done = Object.keys(filled).length >= PAINT_ZONES.length;
  useEffect(() => { if (done) { recordJuniorPlay("pinta-desenho", "Pintou o desenho!"); onDone?.(); } }, [done]);
  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-muted-foreground">Escolhe uma cor e toca em cada parte 🎨</p>
      <div className="flex justify-center gap-2">
        {PALETTE.map((c) => (
          <button key={c} onClick={() => setColor(c)} aria-label={c}
            style={{ background: c }}
            className={`h-10 w-10 rounded-full shadow-md ${color === c ? "ring-4 ring-foreground/30" : ""}`} />
        ))}
      </div>
      <svg viewBox="0 0 100 100" className="mx-auto h-64 w-full max-w-sm rounded-3xl bg-sky-100">
        {PAINT_ZONES.map((z) => (
          <circle key={z.id} cx={z.x} cy={z.y} r={z.r}
            fill={filled[z.id] ?? "#ffffff"}
            stroke="#0f172a" strokeWidth="0.7"
            onClick={() => setFilled((f) => ({ ...f, [z.id]: color }))}
            style={{ cursor: "pointer" }} />
        ))}
      </svg>
      {done && <Done msg="Que obra de arte!" />}
    </div>
  );
}

// 🎵 Eco do Som — Simon-says com animais
const ECHO = [{ e: "🐶", s: "au au" }, { e: "🐱", s: "miau" }, { e: "🐮", s: "muuu" }, { e: "🦆", s: "quack" }];
export function GameEco({ onDone }: { onDone?: () => void }) {
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [showing, setShowing] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "demo" | "play" | "win">("idle");

  const start = () => {
    const next = [...seq, Math.floor(Math.random() * ECHO.length)];
    setSeq(next); setStep(0); setPhase("demo");
    next.forEach((idx, i) => setTimeout(() => {
      setShowing(idx); speak(ECHO[idx].s);
      setTimeout(() => setShowing(null), 500);
      if (i === next.length - 1) setTimeout(() => setPhase("play"), 700);
    }, i * 900));
  };

  const tap = (i: number) => {
    if (phase !== "play") return;
    if (i === seq[step]) {
      speak(ECHO[i].s);
      if (step + 1 === seq.length) {
        if (seq.length >= 4) { setPhase("win"); recordJuniorPlay("eco-som", `Repetiu ${seq.length} sons seguidos!`); onDone?.(); }
        else setTimeout(start, 600);
      } else setStep(step + 1);
    } else { setPhase("idle"); setSeq([]); setStep(0); }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Ouve e repete a sequência 🎶</p>
      <div className="grid grid-cols-4 gap-3">
        {ECHO.map((a, i) => (
          <button key={i} onClick={() => tap(i)}
            className={`touch-target-kid rounded-3xl p-4 text-5xl shadow-md transition ${showing === i ? "scale-110 bg-primary/30" : "bg-card"}`}>
            {a.e}
          </button>
        ))}
      </div>
      {phase === "idle" && <button onClick={start} className="rounded-2xl bg-primary px-6 py-3 font-display text-primary-foreground">Começar</button>}
      {phase === "demo" && <p className="text-sm">A mostrar...</p>}
      {phase === "play" && <p className="text-sm">A tua vez! ({step + 1}/{seq.length})</p>}
      {phase === "win" && <Done msg="Memória de elefante!" />}
    </div>
  );
}

// 🌷 Jardim Mágico — semente → regar → flor
export function GameJardimMagico({ onDone }: { onDone?: () => void }) {
  const [stage, setStage] = useState(0); // 0 sem nada, 1 plantado, 2 regado, 3 flor
  const labels = ["Planta uma semente", "Rega a planta", "Vê crescer!", ""];
  const emojis = ["🌰", "💧", "✨", "🌷"];
  const tap = () => {
    if (stage < 3) {
      const n = stage + 1;
      setStage(n);
      speak(labels[n - 1] ?? "");
      if (n === 3) { recordJuniorPlay("jardim-magico", "Cuidou da sua flor mágica!"); onDone?.(); }
    }
  };
  return (
    <div className="space-y-3 text-center">
      <p className="font-display text-lg">{stage < 3 ? labels[stage] : "🌷 Floresceu!"}</p>
      <button onClick={tap} className="touch-target-kid mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-emerald-100 text-7xl shadow-inner active:scale-95">
        <motion.span key={stage} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>{emojis[stage]}</motion.span>
      </button>
      {stage === 3 && <Done msg="Bom jardineiro!" />}
    </div>
  );
}

// 🧩 Quebra-Cabeças do Kido — slide puzzle 3 peças
const PUZZLE_TARGET = ["🦁", "🐘", "🦒"];
export function GamePuzzle({ onDone }: { onDone?: () => void }) {
  const [order, setOrder] = useState(() => [...PUZZLE_TARGET].sort(() => Math.random() - 0.5));
  const [sel, setSel] = useState<number | null>(null);
  const ok = order.join("") === PUZZLE_TARGET.join("");
  useEffect(() => { if (ok) { recordJuniorPlay("puzzle-kido", "Resolveu o quebra-cabeças!"); onDone?.(); } }, [ok]);
  const tap = (i: number) => {
    if (sel === null) setSel(i);
    else { const n = [...order]; [n[sel], n[i]] = [n[i], n[sel]]; setOrder(n); setSel(null); }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Ordena: {PUZZLE_TARGET.join(" ")}</p>
      <div className="flex justify-center gap-3">
        {order.map((e, i) => (
          <button key={i} onClick={() => tap(i)}
            className={`touch-target-kid h-24 w-24 rounded-3xl text-6xl shadow-md ${sel === i ? "ring-4 ring-primary" : "bg-card"}`}>
            {e}
          </button>
        ))}
      </div>
      {ok && <Done msg="Puzzle completo!" />}
    </div>
  );
}

// 💎 Caça ao Tesouro — encontrar item escondido entre vários
export function GameCacaTesouro({ onDone }: { onDone?: () => void }) {
  const [round, setRound] = useState(0);
  const grid = useMemo(() => {
    const items = ["🌴", "🌴", "🌴", "🌴", "🌴", "🌴", "🌴", "💎"].sort(() => Math.random() - 0.5);
    return items;
  }, [round]);
  const tap = (e: string) => {
    if (e === "💎") {
      speak("Tesouro!");
      const n = round + 1;
      if (n >= 3) { recordJuniorPlay("caca-tesouro", "Encontrou todos os tesouros!"); onDone?.(); }
      setRound(n);
    } else speak("Continua a procurar");
  };
  if (round >= 3) return <Done msg="Caçador de tesouros!" />;
  return (
    <div className="space-y-3 text-center">
      <p className="font-display text-lg">Encontra o 💎 (ronda {round + 1}/3)</p>
      <div className="grid grid-cols-4 gap-2">
        {grid.map((e, i) => (
          <button key={i} onClick={() => tap(e)} className="touch-target-kid rounded-2xl bg-card p-3 text-4xl shadow-md active:scale-95">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// 🍂 Estações do Ano — associa imagem à estação
const SEASONS = [
  { e: "🌸", k: "primavera" },
  { e: "🌞", k: "verão" },
  { e: "🍂", k: "outono" },
  { e: "❄️", k: "inverno" },
];
export function GameEstacoes({ onDone }: { onDone?: () => void }) {
  const order = useMemo(() => [...SEASONS].sort(() => Math.random() - 0.5), []);
  const [i, setI] = useState(0);
  const target = order[i];
  if (!target) return <Done msg="Conheces as estações!" />;
  const opts = useMemo(() => [...SEASONS].sort(() => Math.random() - 0.5).slice(0, 3).concat(target).filter((v, idx, a) => a.findIndex(x => x.k === v.k) === idx).slice(0, 3), [i]);
  const pick = (k: string) => {
    if (k === target.k) { speak(target.k); const n = i + 1; if (n >= order.length) { recordJuniorPlay("estacoes-ano", "Identificou as estações!"); onDone?.(); } setI(n); }
  };
  return (
    <div className="space-y-3 text-center">
      <p className="text-7xl">{target.e}</p>
      <p className="text-sm text-muted-foreground">Que estação é esta?</p>
      <div className="grid grid-cols-3 gap-2">
        {opts.map((o) => (
          <button key={o.k} onClick={() => pick(o.k)} className="touch-target-kid rounded-2xl bg-card p-3 font-display capitalize shadow-md">{o.k}</button>
        ))}
      </div>
    </div>
  );
}

// 😊 Como te sentes? — emoções
const EMOJI_SET = [
  { e: "😊", k: "feliz" }, { e: "😢", k: "triste" }, { e: "😡", k: "zangado" }, { e: "😮", k: "surpreso" }, { e: "😴", k: "cansado" },
];
export function GameEmocoes({ onDone }: { onDone?: () => void }) {
  const order = useMemo(() => [...EMOJI_SET].sort(() => Math.random() - 0.5).slice(0, 4), []);
  const [i, setI] = useState(0);
  const target = order[i];
  if (!target) return <Done msg="Conheces as emoções!" />;
  const opts = useMemo(() => [...EMOJI_SET].sort(() => Math.random() - 0.5).slice(0, 3).concat(target).filter((v, idx, a) => a.findIndex(x => x.k === v.k) === idx).slice(0, 3), [i]);
  const pick = (k: string) => {
    if (k === target.k) { speak(target.k); const n = i + 1; if (n >= order.length) { recordJuniorPlay("emocoes-kido", "Identificou as emoções!"); onDone?.(); } setI(n); }
  };
  return (
    <div className="space-y-3 text-center">
      <p className="text-7xl">{target.e}</p>
      <p className="text-sm text-muted-foreground">Como se sente o Kido?</p>
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {opts.map((o) => (
            <motion.button key={o.k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => pick(o.k)}
              className="touch-target-kid rounded-2xl bg-card p-3 font-display capitalize shadow-md">{o.k}</motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
