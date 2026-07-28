// 14 mini-jogos novos para o Júnior (1.º–4.º ano). Componentes leves, sem deps extra.
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTrivia, type RemoteTriviaQ } from "@/lib/triviaSource";

const Cell = ({ children, onClick, active = false }: any) => (
  <button onClick={onClick}
    className={`rounded-2xl border-2 px-4 py-3 font-display text-xl transition-all ${
      active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-border"
    }`}>{children}</button>
);
const Score = ({ s, n }: { s: number; n: number }) => (
  <p className="mt-3 text-center text-sm text-muted-foreground">Pontos: {s} / {n}</p>
);

// 1. Soma Rápida
export function GameSomaRapida() {
  const [a, setA] = useState(0), [b, setB] = useState(0), [score, setScore] = useState(0), [n, setN] = useState(0);
  const next = () => { setA(Math.floor(Math.random()*10)); setB(Math.floor(Math.random()*10)); };
  useEffect(next, []);
  const opts = useMemo(() => {
    const r = a + b; const o = new Set<number>([r]);
    while (o.size < 4) o.add(Math.max(0, r + (Math.floor(Math.random()*7)-3)));
    return [...o].sort(() => Math.random()-0.5);
  }, [a, b]);
  const pick = (v: number) => { setN(n+1); if (v === a+b) setScore(score+1); next(); };
  return (<div><p className="text-center text-3xl font-display">{a} + {b} = ?</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{opts.map(o => <Cell key={o} onClick={()=>pick(o)}>{o}</Cell>)}</div>
    <Score s={score} n={n}/></div>);
}

// 2. Tabuada Express
export function GameTabuada() {
  const [a, setA] = useState(2), [b, setB] = useState(2), [score, setScore] = useState(0), [n, setN] = useState(0);
  const next = () => { setA(2+Math.floor(Math.random()*9)); setB(2+Math.floor(Math.random()*9)); };
  useEffect(next, []);
  const opts = useMemo(() => {
    const r = a*b; const o = new Set<number>([r]);
    while (o.size < 4) o.add(Math.max(0, r + (Math.floor(Math.random()*9)-4)));
    return [...o].sort(() => Math.random()-0.5);
  }, [a, b]);
  const pick = (v: number) => { setN(n+1); if (v === a*b) setScore(score+1); next(); };
  return (<div><p className="text-center text-3xl font-display">{a} × {b} = ?</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{opts.map(o => <Cell key={o} onClick={()=>pick(o)}>{o}</Cell>)}</div>
    <Score s={score} n={n}/></div>);
}

// 3. Frações Visuais
export function GameFracoes() {
  const ROUNDS = [
    { num: 1, den: 2 }, { num: 1, den: 4 }, { num: 3, den: 4 }, { num: 2, den: 3 }, { num: 1, den: 3 },
  ];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = ROUNDS[i % ROUNDS.length];
  const opts = useMemo(() => {
    const o = new Set([`${cur.num}/${cur.den}`]);
    while (o.size < 3) o.add(`${1+Math.floor(Math.random()*3)}/${2+Math.floor(Math.random()*4)}`);
    return [...o].sort(()=>Math.random()-0.5);
  }, [i]);
  return (<div className="text-center">
    <div className="mx-auto grid w-48 grid-cols-4 gap-1">
      {Array.from({length: cur.den}).map((_,k) => (
        <div key={k} className={`h-12 rounded ${k < cur.num ? "bg-primary" : "bg-muted"}`}/>
      ))}
    </div>
    <p className="mt-3 text-sm text-muted-foreground">Que fração está pintada?</p>
    <div className="mt-3 flex justify-center gap-2">{opts.map(o => (
      <Cell key={o} onClick={()=>{ if (o === `${cur.num}/${cur.den}`) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 4. Caça-Sílabas
export function GameSilabas() {
  const WORDS = [["bo","la"], ["pa","to"], ["me","sa"], ["sa","po"], ["ca","sa"], ["pi","po"]];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const word = WORDS[i % WORDS.length];
  const opts = useMemo(() => {
    const o = new Set([word[1]]);
    const pool = ["la","to","sa","po","ca","mo","ri"];
    while (o.size < 4) o.add(pool[Math.floor(Math.random()*pool.length)]);
    return [...o].sort(()=>Math.random()-0.5);
  }, [i]);
  return (<div className="text-center">
    <p className="font-display text-3xl">{word[0]} __</p>
    <p className="mt-1 text-sm text-muted-foreground">Que sílaba completa "{word.join("")}"?</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===word[1]) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 5. Forma Frase
export function GameFormaFrase() {
  const SENTENCES = [
    ["O", "gato", "bebe", "leite"],
    ["A", "Maria", "lê", "livros"],
    ["Os", "patos", "nadam", "felizes"],
  ];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const target = SENTENCES[i % SENTENCES.length];
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => { setShuffled([...target].sort(()=>Math.random()-0.5)); setPicked([]); }, [i]);
  const pick = (w: string) => { setPicked([...picked, w]); setShuffled(shuffled.filter(x=>x!==w)); };
  const submit = () => { if (picked.join(" ")===target.join(" ")) setScore(score+1); setI(i+1); };
  return (<div>
    <p className="text-center text-sm text-muted-foreground">Forma a frase pela ordem certa:</p>
    <div className="mt-3 min-h-12 rounded-xl bg-muted p-3 text-center font-display">{picked.join(" ") || "…"}</div>
    <div className="mt-3 flex flex-wrap justify-center gap-2">{shuffled.map(w =>
      <Cell key={w} onClick={()=>pick(w)}>{w}</Cell>
    )}</div>
    <div className="mt-3 flex justify-center"><Button onClick={submit} disabled={picked.length<target.length}>Verificar</Button></div>
    <Score s={score} n={i}/></div>);
}

// 6. Antónimos
export function GameAntonimos() {
  const PAIRS: [string,string][] = [["alto","baixo"],["dia","noite"],["frio","quente"],["claro","escuro"],["grande","pequeno"]];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = PAIRS[i % PAIRS.length];
  const opts = useMemo(() => {
    const o = new Set([cur[1]]);
    const all = PAIRS.flat();
    while (o.size < 4) o.add(all[Math.floor(Math.random()*all.length)]);
    return [...o].filter(x => x !== cur[0]).slice(0,4).sort(()=>Math.random()-0.5);
  }, [i]);
  return (<div className="text-center">
    <p className="font-display text-2xl">Qual é o oposto de <span className="text-primary">{cur[0]}</span>?</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===cur[1]) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 7. Mapa de Portugal
export function GameMapaPT() {
  const REGIOES = ["Norte","Centro","Lisboa","Alentejo","Algarve","Açores","Madeira"];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = REGIOES[i % REGIOES.length];
  const opts = useMemo(() => [...REGIOES].sort(()=>Math.random()-0.5).slice(0,4).includes(cur)
    ? [...REGIOES].sort(()=>Math.random()-0.5).slice(0,4)
    : [cur, ...REGIOES.filter(r=>r!==cur).sort(()=>Math.random()-0.5).slice(0,3)].sort(()=>Math.random()-0.5)
  , [i]);
  const pistas: Record<string,string> = {
    Norte: "Cidade do Porto fica aqui.", Centro: "Onde fica Coimbra.", Lisboa: "Capital de Portugal.",
    Alentejo: "Famoso pelas planícies douradas.", Algarve: "Praias a sul.",
    Açores: "Arquipélago no Atlântico (9 ilhas).", Madeira: "Ilha da Pérola do Atlântico.",
  };
  return (<div className="text-center">
    <p className="text-sm text-muted-foreground">Pista:</p>
    <p className="font-display text-xl">{pistas[cur]}</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===cur) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 8. Ciclo da Água
export function GameCicloAgua() {
  const ORDER = ["Evaporação 💨","Condensação ☁️","Precipitação 🌧️","Escoamento 🏞️"];
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => { setShuffled([...ORDER].sort(()=>Math.random()-0.5)); setPicked([]); setDone(null); }, []);
  const pick = (s: string) => { setPicked([...picked, s]); setShuffled(shuffled.filter(x=>x!==s)); };
  useEffect(() => { if (picked.length===ORDER.length) setDone(picked.join("|")===ORDER.join("|")); }, [picked]);
  return (<div>
    <p className="text-center text-sm text-muted-foreground">Ordena o ciclo da água:</p>
    <ol className="mt-2 space-y-1">{picked.map((p,k) => <li key={k} className="rounded bg-muted px-3 py-1 font-display">{k+1}. {p}</li>)}</ol>
    <div className="mt-3 flex flex-wrap justify-center gap-2">{shuffled.map(s=><Cell key={s} onClick={()=>pick(s)}>{s}</Cell>)}</div>
    {done!=null && <p className={`mt-3 text-center font-display ${done?"text-success":"text-destructive"}`}>{done?"Boa! ✅":"Quase! Tenta outra vez."}</p>}
  </div>);
}

// 9. Animais & Habitats
export function GameHabitats() {
  const PAIRS: [string,string][] = [["🐠","Mar"],["🦁","Savana"],["🐒","Floresta"],["🐪","Deserto"],["🐧","Polo"]];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = PAIRS[i % PAIRS.length];
  const opts = useMemo(() => [...new Set([cur[1], ...PAIRS.map(p=>p[1]).sort(()=>Math.random()-0.5).slice(0,3)])].sort(()=>Math.random()-0.5), [i]);
  return (<div className="text-center">
    <p className="text-6xl">{cur[0]}</p>
    <p className="mt-1 text-sm text-muted-foreground">Onde vive este animal?</p>
    <div className="mt-3 grid grid-cols-2 gap-3">{opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===cur[1]) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 10. Bandeiras
export function GameBandeiras() {
  const FLAGS: [string,string][] = [["🇵🇹","Portugal"],["🇧🇷","Brasil"],["🇪🇸","Espanha"],["🇫🇷","França"],["🇮🇹","Itália"],["🇩🇪","Alemanha"],["🇬🇧","Reino Unido"]];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = FLAGS[i % FLAGS.length];
  const opts = useMemo(() => {
    const o = new Set([cur[1]]);
    while (o.size<4) o.add(FLAGS[Math.floor(Math.random()*FLAGS.length)][1]);
    return [...o].sort(()=>Math.random()-0.5);
  }, [i]);
  return (<div className="text-center">
    <p className="text-7xl">{cur[0]}</p>
    <div className="mt-3 grid grid-cols-2 gap-3">{opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===cur[1]) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 11. Spelling EN
export function GameSpellingEN() {
  const WORDS = ["cat","dog","sun","book","tree","milk","blue","star"];
  const [i, setI] = useState(0), [score, setScore] = useState(0), [val, setVal] = useState("");
  const cur = WORDS[i % WORDS.length];
  const speak = () => { try { const u = new SpeechSynthesisUtterance(cur); u.lang="en-US"; speechSynthesis.speak(u); } catch {} };
  useEffect(() => { setVal(""); const t = setTimeout(speak, 300); return () => clearTimeout(t); }, [i]);
  const submit = () => { if (val.trim().toLowerCase()===cur) setScore(score+1); setI(i+1); };
  return (<div className="text-center">
    <Button onClick={speak} variant="outline">🔊 Ouvir outra vez</Button>
    <Input value={val} onChange={e=>setVal(e.target.value)} placeholder="Escreve a palavra…" className="mt-3"/>
    <Button onClick={submit} className="mt-3">Verificar</Button>
    <Score s={score} n={i}/></div>);
}

// 12. Cores & Números EN
export function GameColorsEN() {
  const ITEMS = [["red","Vermelho"],["blue","Azul"],["green","Verde"],["yellow","Amarelo"],["one","Um"],["two","Dois"],["three","Três"]];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = ITEMS[i % ITEMS.length];
  const opts = useMemo(() => {
    const o = new Set([cur[1]]);
    while (o.size<4) o.add(ITEMS[Math.floor(Math.random()*ITEMS.length)][1]);
    return [...o].sort(()=>Math.random()-0.5);
  }, [i]);
  return (<div className="text-center">
    <p className="font-display text-4xl">{cur[0]}</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===cur[1]) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// 13. Memória Musical (Simon)
export function GameSimon() {
  const COLORS = ["red","green","blue","yellow"];
  const [seq, setSeq] = useState<number[]>([]);
  const [pl, setPl] = useState<number[]>([]);
  const [active, setActive] = useState<number|null>(null);
  const [round, setRound] = useState(0);
  const next = () => { const s = [...seq, Math.floor(Math.random()*4)]; setSeq(s); setPl([]); play(s); setRound(round+1); };
  const play = async (s: number[]) => { for (const c of s) { setActive(c); await new Promise(r=>setTimeout(r,400)); setActive(null); await new Promise(r=>setTimeout(r,150)); } };
  useEffect(() => { if (seq.length===0) next(); }, []);
  const pick = (c: number) => { const np = [...pl, c]; if (seq[np.length-1] !== c) { alert("Errou! Recomeça."); setSeq([]); setRound(0); return; } setPl(np); if (np.length===seq.length) setTimeout(next, 600); };
  return (<div className="text-center">
    <p className="text-sm text-muted-foreground">Ronda {round}</p>
    <div className="mt-3 grid grid-cols-2 gap-2">{COLORS.map((c,k) => (
      <button key={c} onClick={()=>pick(k)} className={`h-24 rounded-2xl transition-all ${active===k?"opacity-100 scale-105":"opacity-70"}`} style={{background: c}}/>
    ))}</div>
  </div>);
}

// 14. Quebra-Cabeças Lógico
export function GameLogica() {
  const PUZZLES = [
    { q: "Se 🍎=2 e 🍎+🍎=?", a: "4", opts: ["3","4","5","6"] },
    { q: "Próximo: 2,4,6,?", a: "8", opts: ["7","8","9","10"] },
    { q: "Próximo: 🔺🔵🔺🔵?", a: "🔺", opts: ["🔺","🔵","🟢","🟡"] },
    { q: "Mãe da minha mãe é a minha…?", a: "Avó", opts: ["Tia","Avó","Prima","Irmã"] },
  ];
  const [i, setI] = useState(0), [score, setScore] = useState(0);
  const cur = PUZZLES[i % PUZZLES.length];
  return (<div className="text-center">
    <p className="font-display text-xl">{cur.q}</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{cur.opts.map(o=>(
      <Cell key={o} onClick={()=>{ if (o===cur.a) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}

// Trivia online (Open Trivia DB) — usado por jogos que querem conteúdo dinâmico
export function GameTriviaOnline({ category = "general", count = 8 }: { category?: string; count?: number }) {
  const [qs, setQs] = useState<RemoteTriviaQ[]>([]);
  const [i, setI] = useState(0), [score, setScore] = useState(0), [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTrivia({ category, count }).then(q => { if (!cancelled) { setQs(q); setLoading(false); } });
    return () => { cancelled = true; };
  }, [category, count]);
  if (loading) return <p className="text-center text-sm text-muted-foreground">A carregar perguntas…</p>;
  if (!qs.length) return <p className="text-center text-sm">Sem perguntas disponíveis.</p>;
  if (i >= qs.length) return <p className="text-center font-display text-2xl">Fim! {score}/{qs.length} ⭐</p>;
  const cur = qs[i];
  return (<div>
    <p className="text-xs text-muted-foreground">Pergunta {i+1}/{qs.length}</p>
    <p className="mt-2 font-display text-lg">{cur.prompt}</p>
    <div className="mt-3 grid grid-cols-1 gap-2">{cur.options.map((o,k)=>(
      <Cell key={k} onClick={()=>{ if (k===cur.answerIndex) setScore(score+1); setI(i+1); }}>{o}</Cell>
    ))}</div>
    <Score s={score} n={i}/></div>);
}
