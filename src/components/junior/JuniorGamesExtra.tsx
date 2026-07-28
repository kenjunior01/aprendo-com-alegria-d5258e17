import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-PT"; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}

const Done = ({ msg }: { msg: string }) => (
  <p className="mt-4 text-center font-display text-2xl text-success">🌟 {msg} 🌟</p>
);

// 1) Conta os Patinhos
export function GameContaPatinhos({ onDone }: { onDone?: () => void }) {
  const [target] = useState(() => Math.floor(Math.random() * 4) + 2); // 2-5
  const [count, setCount] = useState(0);
  const done = count >= target;
  useEffect(() => {
    if (done) {
      recordJuniorPlay("conta-patinhos", `Contou ${target} patinhos!`);
      onDone?.();
    }
  }, [done, target, onDone]);
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-lg">Toca em {target} patinhos 🦆</p>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            onClick={() => { if (!done && i >= count) { setCount(i + 1); speak(String(i + 1)); } }}
            className={`touch-target-kid rounded-3xl p-3 text-5xl shadow-md transition ${i < count ? "bg-yellow-200" : "bg-card"}`}
          >
            {i < count ? "🦆" : "🥚"}
          </button>
        ))}
      </div>
      <p className="font-display">Contaste: {count}</p>
      {done && <Done msg="Que bom contador!" />}
    </div>
  );
}

// 2) Bolhas de Sabão
export function GameBolhas({ onDone }: { onDone?: () => void }) {
  const colors = ["bg-pink-300", "bg-sky-300", "bg-yellow-300", "bg-emerald-300", "bg-purple-300", "bg-orange-300"];
  const [bubbles, setBubbles] = useState(() => colors.map((c, i) => ({ id: i, c })));
  const pop = (id: number) => {
    setBubbles((b) => b.filter((x) => x.id !== id));
    if (bubbles.length === 1) {
      recordJuniorPlay("bolhas-sabao", "Rebentou todas as bolhas!");
      onDone?.();
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Rebenta todas as bolhas! 🫧</p>
      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
              onClick={() => pop(b.id)}
              className={`touch-target-kid h-24 rounded-full ${b.c} shadow-inner`}
            />
          ))}
        </AnimatePresence>
      </div>
      {bubbles.length === 0 && <Done msg="Pop pop pop!" />}
    </div>
  );
}

// 3) O Meu Corpo
const BODY = [{ k: "cabeça", e: "🧠" }, { k: "olhos", e: "👀" }, { k: "boca", e: "👄" }, { k: "mãos", e: "✋" }, { k: "pés", e: "🦶" }];
export function GameMeuCorpo({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const target = BODY[i];
  if (!target) return <Done msg="Conheces o teu corpo!" />;
  const opts = useMemo(() => [...BODY].sort(() => Math.random() - 0.5).slice(0, 3).concat(target).filter((v, idx, a) => a.findIndex(x => x.k === v.k) === idx).slice(0, 3), [i]);
  const pick = (k: string) => {
    if (k === target.k) {
      speak("Boa!");
      const n = i + 1;
      if (n >= BODY.length) { recordJuniorPlay("meu-corpo", "Identificou as partes do corpo!"); onDone?.(); }
      setI(n);
    } else speak("Tenta outra vez");
  };
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-xl">Onde está: <strong>{target.k}</strong>?</p>
      <div className="grid grid-cols-3 gap-3">
        {opts.map((o) => (
          <button key={o.k} onClick={() => pick(o.k)} className="touch-target-kid rounded-3xl bg-card p-4 text-5xl shadow-md active:scale-95">{o.e}</button>
        ))}
      </div>
    </div>
  );
}

// 4) Memória dos Animais
export function GameMemoria({ onDone }: { onDone?: () => void }) {
  const animals = ["🐶", "🐱", "🐰", "🦊"];
  const [cards] = useState(() => [...animals, ...animals].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, e })));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  useEffect(() => {
    if (open.length === 2) {
      const [a, b] = open;
      if (cards[a].e === cards[b].e) setMatched((m) => [...m, cards[a].e]);
      const t = setTimeout(() => setOpen([]), 800);
      return () => clearTimeout(t);
    }
  }, [open, cards]);
  useEffect(() => {
    if (matched.length === animals.length) {
      recordJuniorPlay("memoria-animais", "Encontrou todos os pares!");
      onDone?.();
    }
  }, [matched, onDone]);
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Encontra os pares 🧠</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => {
          const show = open.includes(i) || matched.includes(c.e);
          return (
            <button
              key={c.id}
              onClick={() => { if (!show && open.length < 2) setOpen((o) => [...o, i]); }}
              className={`touch-target-kid h-20 rounded-2xl text-4xl shadow-md ${show ? "bg-card" : "bg-primary/30"}`}
            >
              {show ? c.e : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 5) Aventura das Letras
const LETTERS = [{ word: "GATO", missing: 1 }, { word: "BOLA", missing: 0 }, { word: "PATO", missing: 2 }, { word: "CASA", missing: 3 }];
export function GameLetraAventura({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const cur = LETTERS[i];
  if (!cur) return <Done msg="Letras dominadas!" />;
  const correct = cur.word[cur.missing];
  const opts = useMemo(() => Array.from(new Set([correct, "A", "E", "I", "O", "U", "M", "T"])).slice(0, 4).sort(() => Math.random() - 0.5), [i]);
  const pick = (l: string) => {
    if (l === correct) {
      speak(cur.word);
      const n = i + 1;
      if (n >= LETTERS.length) { recordJuniorPlay("letra-aventura", "Completou as palavras!"); onDone?.(); }
      setI(n);
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-3xl tracking-widest">
        {cur.word.split("").map((ch, idx) => idx === cur.missing ? "_" : ch).join(" ")}
      </p>
      <p className="text-xs text-muted-foreground">Que letra falta?</p>
      <div className="flex justify-center gap-3">
        {opts.map((l) => (
          <button key={l} onClick={() => pick(l)} className="touch-target-kid rounded-2xl bg-card px-5 py-4 font-display text-2xl shadow-md">{l}</button>
        ))}
      </div>
    </div>
  );
}

// 6) Mestre das Formas
const SHAPES = [{ k: "círculo", e: "⚪" }, { k: "quadrado", e: "🟦" }, { k: "triângulo", e: "🔺" }, { k: "estrela", e: "⭐" }];
export function GameFormas({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const t = SHAPES[i];
  if (!t) return <Done msg="Mestre das formas!" />;
  const pick = (k: string) => {
    if (k === t.k) {
      speak(t.k);
      const n = i + 1;
      if (n >= SHAPES.length) { recordJuniorPlay("formas-geo", "Acertou em todas as formas!"); onDone?.(); }
      setI(n);
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-xl">Toca no <strong>{t.k}</strong></p>
      <div className="grid grid-cols-4 gap-3">
        {SHAPES.map((s) => (
          <button key={s.k} onClick={() => pick(s.k)} className="touch-target-kid rounded-2xl bg-card p-4 text-5xl shadow-md active:scale-95">{s.e}</button>
        ))}
      </div>
    </div>
  );
}

// 7) Mercado das Frutas (cultura PALOP)
const FRUITS = [{ e: "🥭", n: "manga" }, { e: "🍌", n: "banana" }, { e: "🍍", n: "ananás" }, { e: "🥥", n: "coco" }];
export function GameMercado({ onDone }: { onDone?: () => void }) {
  const [target] = useState(() => FRUITS[Math.floor(Math.random() * FRUITS.length)]);
  const [qty] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [chosen, setChosen] = useState(0);
  const done = chosen === qty;
  useEffect(() => {
    if (done) { recordJuniorPlay("frutas-mercado", `Comprou ${qty} ${target.n}s no mercado!`); onDone?.(); }
  }, [done]);
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-lg">A mãe pediu {qty} {target.n}{qty > 1 ? "s" : ""} {target.e}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <button
            key={i}
            onClick={() => { if (!done) setChosen((c) => Math.min(qty + 1, c + 1)); }}
            className="touch-target-kid rounded-3xl bg-card p-3 text-4xl shadow-md active:scale-95"
          >{target.e}</button>
        ))}
      </div>
      <p className="font-display">No cesto: {chosen}</p>
      {done && <Done msg="Bom mercador!" />}
      {chosen > qty && <p className="text-sm text-destructive">Demasiadas! Recomeça 🙂</p>}
    </div>
  );
}

// 8) Soletrar
const SPELL = [{ word: "SOL", e: "☀️" }, { word: "PAI", e: "👨" }, { word: "MAR", e: "🌊" }];
export function GameSoletrar({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const cur = SPELL[i];
  const [built, setBuilt] = useState("");
  useEffect(() => { setBuilt(""); }, [i]);
  if (!cur) return <Done msg="Sabes soletrar!" />;
  const letters = useMemo(() => cur.word.split("").sort(() => Math.random() - 0.5), [i]);
  const add = (l: string) => {
    const next = built + l;
    setBuilt(next);
    if (next === cur.word) {
      speak(cur.word);
      const n = i + 1;
      if (n >= SPELL.length) { recordJuniorPlay("soletrar", "Soletrou todas as palavras!"); onDone?.(); }
      setTimeout(() => setI(n), 800);
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="text-6xl">{cur.e}</p>
      <p className="font-display text-2xl tracking-widest">{built || "_ _ _"}</p>
      <div className="flex justify-center gap-2">
        {letters.map((l, idx) => (
          <button key={idx} onClick={() => add(l)} className="touch-target-kid rounded-2xl bg-card px-4 py-3 font-display text-2xl shadow-md">{l}</button>
        ))}
      </div>
      <button onClick={() => setBuilt("")} className="text-xs text-muted-foreground underline">Apagar</button>
    </div>
  );
}

// 9) Matemática Mágica
export function GameMatematica({ onDone }: { onDone?: () => void }) {
  const [round, setRound] = useState(0);
  const qs = useMemo(() => Array.from({ length: 4 }).map(() => {
    const a = Math.floor(Math.random() * 4) + 1, b = Math.floor(Math.random() * 4) + 1;
    return { a, b, r: a + b };
  }), []);
  const cur = qs[round];
  if (!cur) return <Done msg="Pequeno matemático!" />;
  const opts = useMemo(() => Array.from(new Set([cur.r, cur.r + 1, Math.max(1, cur.r - 1), cur.r + 2])).slice(0, 4).sort(() => Math.random() - 0.5), [round]);
  const pick = (n: number) => {
    if (n === cur.r) {
      speak(`${cur.a} mais ${cur.b} é ${cur.r}`);
      const next = round + 1;
      if (next >= qs.length) { recordJuniorPlay("matematica-magica", "Resolveu todas as somas!"); onDone?.(); }
      setRound(next);
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-3xl">{"⭐".repeat(cur.a)} + {"⭐".repeat(cur.b)} = ?</p>
      <div className="flex justify-center gap-3">
        {opts.map((o) => (
          <button key={o} onClick={() => pick(o)} className="touch-target-kid rounded-2xl bg-card px-5 py-4 font-display text-2xl shadow-md">{o}</button>
        ))}
      </div>
    </div>
  );
}

// 10) Pequeno Cientista (mistura cores)
const MIX: Record<string, { with: string; result: string; emoji: string }> = {
  amarelo: { with: "azul", result: "verde", emoji: "🟢" },
  azul:    { with: "vermelho", result: "roxo", emoji: "🟣" },
  vermelho:{ with: "amarelo", result: "laranja", emoji: "🟠" },
};
export function GameCientista({ onDone }: { onDone?: () => void }) {
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const result = a && b && MIX[a]?.with === b ? MIX[a].result : null;
  useEffect(() => { if (result) { recordJuniorPlay("pequeno-cientista", `Descobriu o ${result}!`); onDone?.(); } }, [result]);
  const pick = (c: string) => { if (!a) setA(c); else if (!b) setB(c); else { setA(c); setB(null); } };
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Mistura duas cores no caldeirão 🧪</p>
      <div className="flex justify-center gap-3">
        {["amarelo", "azul", "vermelho"].map((c) => (
          <button key={c} onClick={() => pick(c)} className={`touch-target-kid rounded-3xl p-4 font-display shadow-md ${
            c === "amarelo" ? "bg-yellow-300" : c === "azul" ? "bg-blue-300" : "bg-red-300"}`}>{c}</button>
        ))}
      </div>
      <p className="font-display text-xl">{a ?? "?"} + {b ?? "?"} = {result ? `${result} ${MIX[a!].emoji}` : "?"}</p>
      {result && <Done msg={`Descobriste o ${result}!`} />}
    </div>
  );
}

// 11) Que Horas São?
const CLOCK = [{ h: 7, act: "acordar 🌅" }, { h: 12, act: "almoçar 🍽️" }, { h: 18, act: "banho 🛁" }, { h: 21, act: "dormir 🛏️" }];
export function GameRelogio({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const cur = CLOCK[i];
  if (!cur) return <Done msg="Aprendeste as horas!" />;
  const opts = useMemo(() => Array.from(new Set([cur.h, (cur.h + 3) % 24, (cur.h + 6) % 24, (cur.h + 9) % 24])).slice(0, 4).sort(() => Math.random() - 0.5), [i]);
  const pick = (h: number) => {
    if (h === cur.h) {
      speak(`${cur.h} horas`);
      const n = i + 1;
      if (n >= CLOCK.length) { recordJuniorPlay("relogio-kido", "Aprendeu as horas do dia!"); onDone?.(); }
      setI(n);
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="font-display text-lg">A que horas é <strong>{cur.act}</strong>?</p>
      <div className="grid grid-cols-2 gap-3">
        {opts.map((h) => (
          <button key={h} onClick={() => pick(h)} className="touch-target-kid rounded-2xl bg-card p-4 font-display text-2xl shadow-md">{h}h</button>
        ))}
      </div>
    </div>
  );
}

// 12) Viagem pela Lusofonia
const PALOP = [
  { f: "🇦🇴", n: "Angola", word: "Bué" },
  { f: "🇲🇿", n: "Moçambique", word: "Maningue" },
  { f: "🇨🇻", n: "Cabo Verde", word: "Sodade" },
  { f: "🇵🇹", n: "Portugal", word: "Fixe" },
  { f: "🇧🇷", n: "Brasil", word: "Legal" },
];
export function GamePalop({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const t = PALOP[i];
  if (!t) return <Done msg="Conheces a lusofonia!" />;
  const opts = useMemo(() => [...PALOP].sort(() => Math.random() - 0.5).slice(0, 3).concat(t).filter((v, idx, a) => a.findIndex(x => x.n === v.n) === idx).slice(0, 3), [i]);
  const pick = (n: string) => {
    if (n === t.n) {
      speak(`${t.n}: ${t.word}`);
      const nx = i + 1;
      if (nx >= PALOP.length) { recordJuniorPlay("mapa-palop", "Viajou pela lusofonia!"); onDone?.(); }
      setI(nx);
    }
  };
  return (
    <div className="space-y-4 text-center">
      <p className="text-7xl">{t.f}</p>
      <p className="text-sm text-muted-foreground">Que país é este?</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opts.map((o) => (
          <button key={o.n} onClick={() => pick(o.n)} className="touch-target-kid rounded-2xl bg-card p-3 font-display text-lg shadow-md">{o.n}</button>
        ))}
      </div>
    </div>
  );
}
