// JuniorGamesV6 — 15 mini-jogos para 2 anos. Mecânica única: TOCAR.
// Botões enormes, regras de 1 passo, narração pt-PT.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";
import { speak, playCorrect, playWrong, playLevelUp } from "@/lib/audio";
import { GameTutorial } from "./GameTutorial";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

// Generic tap-one-of-many template
function TapGame({
  gameId, title, prompt, items, targetId, rounds = 4, onWin,
  tutorial,
}: {
  gameId: string;
  title: string;
  prompt: (target: { id: string; label: string; emoji: string; cls?: string }) => string;
  items: { id: string; label: string; emoji: string; cls?: string }[];
  targetId: string;
  rounds?: number;
  onWin?: () => void;
  tutorial: { emoji: string; text: string }[];
}) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

  // Each round picks a new target & shuffles items
  const target = useMemo(
    () => items.find((i) => i.id === targetId) ?? items[0],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  // override: rotate target through items
  const dynamicTarget = items[round % items.length];
  const tiles = useMemo(
    () => shuffle([dynamicTarget, ...shuffle(items.filter((i) => i.id !== dynamicTarget.id)).slice(0, 2)]),
    [round, dynamicTarget, items],
  );

  useEffect(() => {
    if (started && !done) speak(prompt(dynamicTarget), { rate: 0.92 });
  }, [round, started, done, prompt, dynamicTarget]);

  const tap = (id: string) => {
    if (done) return;
    if (id === dynamicTarget.id) {
      playCorrect();
      speak("Boa!", { pitch: 1.2 });
      if (round + 1 >= rounds) {
        setDone(true);
        playLevelUp();
        recordJuniorPlay(gameId, `Terminou ${title}`);
        onWin?.();
      } else setRound((r) => r + 1);
    } else {
      playWrong();
      speak(`Tenta outra vez. Procura ${dynamicTarget.label}.`, { rate: 0.9 });
    }
  };

  // suppress unused warning for target
  void target;

  return (
    <div className="relative space-y-4">
      <GameTutorial gameId={gameId} title={title} steps={tutorial} onStart={() => setStarted(true)} />
      <p className="text-center font-display text-xl">{prompt(dynamicTarget)}</p>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <motion.button
            key={t.id + round}
            whileTap={{ scale: 0.9 }}
            onClick={() => tap(t.id)}
            className={`touch-target-kid flex h-32 items-center justify-center rounded-3xl border-4 border-border text-6xl shadow-lg ${t.cls ?? "bg-card"}`}
            aria-label={t.label}
          >
            {t.emoji}
          </motion.button>
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">Ronda {Math.min(round + 1, rounds)}/{rounds}</div>
      {done && <p className="text-center font-display text-2xl text-success">🎉 Parabéns!</p>}
    </div>
  );
}

// ---- 1) Toca na cor
const COLORS = [
  { id: "red",    label: "vermelho", emoji: "🟥", cls: "bg-red-100" },
  { id: "blue",   label: "azul",     emoji: "🟦", cls: "bg-blue-100" },
  { id: "yellow", label: "amarelo",  emoji: "🟨", cls: "bg-yellow-100" },
  { id: "green",  label: "verde",    emoji: "🟩", cls: "bg-green-100" },
];
export const GameTapCor = () => (
  <TapGame gameId="tap-cor" title="Toca na Cor" items={COLORS} targetId="red"
    prompt={(t) => `Toca no ${t.label}!`}
    tutorial={[
      { emoji: "🟥", text: "Vês muitas cores." },
      { emoji: "👆", text: "Toca só na cor que eu disser." },
    ]}
  />
);

// ---- 2) Toca no animal
const ANIMAIS = [
  { id: "dog", label: "o cão", emoji: "🐶" },
  { id: "cat", label: "o gato", emoji: "🐱" },
  { id: "cow", label: "a vaca", emoji: "🐮" },
  { id: "pig", label: "o porco", emoji: "🐷" },
];
export const GameAnimaTap = () => (
  <TapGame gameId="anima-tap" title="Toca no Animal" items={ANIMAIS} targetId="dog"
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🐶", text: "Vês animais." }, { emoji: "👆", text: "Toca no animal pedido." }]}
  />
);

// ---- 3) Números 1-3
const NUMS = [
  { id: "1", label: "o número 1", emoji: "1️⃣", cls: "bg-primary/10" },
  { id: "2", label: "o número 2", emoji: "2️⃣", cls: "bg-secondary/30" },
  { id: "3", label: "o número 3", emoji: "3️⃣", cls: "bg-accent/30" },
];
export const GameNumTap13 = () => (
  <TapGame gameId="num-tap-1-3" title="Números 1, 2, 3" items={NUMS} targetId="1"
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🔢", text: "Vês três números." }, { emoji: "👆", text: "Toca no número certo." }]}
  />
);

// ---- 4) Grande/Pequeno
const TAM = [
  { id: "big",   label: "o grande",   emoji: "🐘", cls: "bg-card" },
  { id: "small", label: "o pequeno",  emoji: "🐭", cls: "bg-card" },
];
export function GameGrandePequeno() {
  return (
    <TapGame gameId="grande-pequeno-tap" title="Grande ou Pequeno"
      items={TAM} targetId="big" rounds={4}
      prompt={(t) => `Toca ${t.label}!`}
      tutorial={[
        { emoji: "🐘", text: "Há grandes e pequenos." },
        { emoji: "👆", text: "Toca no que eu disser." },
      ]}
    />
  );
}

// ---- 5) Toca na fruta
const FRUTAS = [
  { id: "apple",  label: "a maçã",   emoji: "🍎", cls: "bg-red-100" },
  { id: "banana", label: "a banana", emoji: "🍌", cls: "bg-yellow-100" },
  { id: "grape",  label: "a uva",    emoji: "🍇", cls: "bg-purple-100" },
  { id: "orange", label: "a laranja",emoji: "🍊", cls: "bg-orange-100" },
];
export const GameFrutaTap = () => (
  <TapGame gameId="fruta-tap" title="Toca na Fruta" items={FRUTAS} targetId="apple"
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🍎", text: "Há frutas saborosas." }, { emoji: "👆", text: "Toca na fruta certa." }]}
  />
);

// ---- 6) Som -> animal
const SOM_ANIMA = [
  { id: "cat", label: "o gato (miau)", emoji: "🐱" },
  { id: "cow", label: "a vaca (muu)",  emoji: "🐮" },
  { id: "dog", label: "o cão (au au)", emoji: "🐶" },
];
export const GameSomAnima = () => (
  <TapGame gameId="som-anima" title="Que animal é?" items={SOM_ANIMA} targetId="cat"
    prompt={(t) => `Quem faz o som de ${t.label}?`}
    tutorial={[{ emoji: "👂", text: "Ouve com atenção." }, { emoji: "🐶", text: "Toca no animal certo." }]}
  />
);

// ---- 7) Cor das roupas
const ROUPAS = [
  { id: "red",    label: "o casaco vermelho", emoji: "🧥", cls: "bg-red-100" },
  { id: "blue",   label: "o casaco azul",     emoji: "🧥", cls: "bg-blue-100" },
  { id: "yellow", label: "o casaco amarelo",  emoji: "🧥", cls: "bg-yellow-100" },
];
export const GameCorRoupa = () => (
  <TapGame gameId="cor-roupa" title="Cor da Roupa" items={ROUPAS} targetId="red"
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🧥", text: "Casacos de cores." }, { emoji: "👆", text: "Toca na cor pedida." }]}
  />
);

// ---- 8) Animal grande
const ANIMA_TAM = [
  { id: "big",   label: "o grande",  emoji: "🦁", cls: "bg-card" },
  { id: "small", label: "o pequeno", emoji: "🐹", cls: "bg-card" },
];
export const GameAnimaGrande = () => (
  <TapGame gameId="anima-grande" title="Animal Grande/Pequeno" items={ANIMA_TAM} targetId="big" rounds={4}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🦁", text: "Animal grande." }, { emoji: "🐹", text: "Animal pequeno." }]}
  />
);

// ---- 9) Bate palmas (causa-efeito + ritmo)
export function GameTapPatPat() {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const target = 8;
  const done = count >= target;
  useEffect(() => {
    if (done) {
      playLevelUp();
      speak("Que ritmo!", { pitch: 1.2 });
      recordJuniorPlay("tap-pat-pat", "Bateu palmas!");
    }
  }, [done]);
  return (
    <div className="relative space-y-4">
      <GameTutorial gameId="tap-pat-pat" title="Bate Palmas"
        steps={[
          { emoji: "👏", text: "Toca no botão grande." },
          { emoji: "🥁", text: "Bate ao ritmo!" },
        ]}
        onStart={() => setStarted(true)}
      />
      <p className="text-center font-display text-xl">Toca {target} vezes!</p>
      <motion.button
        whileTap={{ scale: 0.85 }}
        disabled={done || !started}
        onClick={() => { playCorrect(); setCount((c) => c + 1); }}
        className="mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-8xl shadow-2xl"
      >👏</motion.button>
      <p className="text-center font-display text-2xl">{count}/{target}</p>
      {done && <p className="text-center font-display text-2xl text-success">🎉 Parabéns!</p>}
    </div>
  );
}

// ---- 10) Conta as estrelas (1-3)
export function GameEstrelasTap() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const target = (round % 3) + 1;
  const [tapped, setTapped] = useState(0);
  const done = round >= 3 && tapped >= target;
  useEffect(() => {
    if (started) speak(`Conta ${target} estrelas. Toca ${target} vezes!`, { rate: 0.92 });
    setTapped(0);
  }, [round, started, target]);
  useEffect(() => {
    if (done) { playLevelUp(); recordJuniorPlay("estrelas-tap", "Contou estrelas"); }
  }, [done]);
  return (
    <div className="relative space-y-4">
      <GameTutorial gameId="estrelas-tap" title="Conta as Estrelas"
        steps={[{ emoji: "⭐", text: "Conta as estrelas." }, { emoji: "👆", text: "Toca quantas eu disser." }]}
        onStart={() => setStarted(true)}
      />
      <p className="text-center font-display text-xl">Toca {target} estrela{target > 1 ? "s" : ""}!</p>
      <div className="flex justify-center gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.button
            key={`${round}-${i}`}
            whileTap={{ scale: 0.85 }}
            disabled={!started}
            onClick={() => {
              if (tapped < target) {
                playCorrect();
                const next = tapped + 1;
                setTapped(next);
                speak(`${next}`, { pitch: 1.2 });
                if (next >= target) {
                  setTimeout(() => { if (round < 2) setRound((r) => r + 1); }, 600);
                }
              }
            }}
            className={`h-24 w-24 rounded-2xl border-4 border-border text-5xl ${i < tapped ? "bg-yellow-200" : "bg-card"}`}
          >⭐</motion.button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">Ronda {round + 1}/3</p>
    </div>
  );
}

// ---- 11) Carro da cor
const CARROS = [
  { id: "red",    label: "o carro vermelho", emoji: "🚗", cls: "bg-red-100" },
  { id: "blue",   label: "o carro azul",     emoji: "🚙", cls: "bg-blue-100" },
  { id: "yellow", label: "o carro amarelo",  emoji: "🚕", cls: "bg-yellow-100" },
];
export const GameCarroCor = () => (
  <TapGame gameId="carro-cor" title="Carro da Cor" items={CARROS} targetId="red"
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🚗", text: "Carros de cores." }, { emoji: "👆", text: "Toca no que eu disser." }]}
  />
);

// ---- 12) Onde vive?
const HABITAT = [
  { id: "fish", label: "o peixe (na água)", emoji: "🐟", cls: "bg-blue-100" },
  { id: "bird", label: "o pássaro (no céu)", emoji: "🐦", cls: "bg-sky-100" },
  { id: "dog",  label: "o cão (em casa)",   emoji: "🐶", cls: "bg-amber-100" },
];
export const GameAnimaCasa = () => (
  <TapGame gameId="anima-casa" title="Onde Vive?" items={HABITAT} targetId="fish"
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🏠", text: "Cada animal tem a sua casa." }, { emoji: "👆", text: "Toca no certo." }]}
  />
);

// ---- 13) Comida
const COMIDA = [
  { id: "bread", label: "o pão",   emoji: "🍞", cls: "bg-amber-100" },
  { id: "milk",  label: "o leite", emoji: "🥛", cls: "bg-blue-50" },
  { id: "apple", label: "a maçã",  emoji: "🍎", cls: "bg-red-100" },
];
export const GameComidaTap = () => (
  <TapGame gameId="comida-tap" title="Toca na Comida" items={COMIDA} targetId="bread"
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🍞", text: "Vês comida." }, { emoji: "👆", text: "Toca na que eu disser." }]}
  />
);

// ---- 14) Forma redonda
const FORMAS_2A = [
  { id: "circle", label: "o círculo",  emoji: "⚪", cls: "bg-card" },
  { id: "square", label: "o quadrado", emoji: "🟦", cls: "bg-card" },
  { id: "tri",    label: "o triângulo",emoji: "🔺", cls: "bg-card" },
];
export const GameFormaRedonda = () => (
  <TapGame gameId="forma-redonda" title="Toca na Forma" items={FORMAS_2A} targetId="circle"
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "⚪", text: "Há formas diferentes." }, { emoji: "👆", text: "Toca na forma certa." }]}
  />
);

// ---- 15) Acende as luzes (causa-efeito)
export function GameLuzTap() {
  const [started, setStarted] = useState(false);
  const [on, setOn] = useState<boolean[]>(Array(6).fill(false));
  const lit = on.filter(Boolean).length;
  const done = lit === 6;
  useEffect(() => {
    if (done) { playLevelUp(); speak("Lindas luzes!", { pitch: 1.2 }); recordJuniorPlay("luz-tap", "Acendeu todas as luzes"); }
  }, [done]);
  return (
    <div className="relative space-y-4">
      <GameTutorial gameId="luz-tap" title="Acende as Luzes"
        steps={[{ emoji: "💡", text: "Toca para acender." }, { emoji: "✨", text: "Acende todas!" }]}
        onStart={() => setStarted(true)}
      />
      <p className="text-center font-display text-xl">Acende todas as luzes!</p>
      <div className="grid grid-cols-3 gap-3">
        {on.map((v, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.85 }}
            disabled={!started}
            onClick={() => {
              if (!v) { playCorrect(); setOn((arr) => arr.map((x, j) => j === i ? true : x)); }
            }}
            className={`flex h-28 items-center justify-center rounded-3xl border-4 border-border text-6xl ${v ? "bg-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.6)]" : "bg-card"}`}
          >{v ? "💡" : "⚫"}</motion.button>
        ))}
      </div>
      <p className="text-center font-display text-lg">{lit}/6</p>
    </div>
  );
}
