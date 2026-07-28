// JuniorGamesV7 — 10 mini-jogos extra (toca-no-certo). Mantém o padrão dos V5/V6.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";
import { speak, playCorrect, playWrong, playLevelUp } from "@/lib/audio";
import { GameTutorial } from "./GameTutorial";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function TapPick({
  gameId, title, prompt, items, rounds = 4, tutorial,
}: {
  gameId: string;
  title: string;
  prompt: (t: { id: string; label: string; emoji: string; cls?: string }) => string;
  items: { id: string; label: string; emoji: string; cls?: string }[];
  rounds?: number;
  tutorial: { emoji: string; text: string }[];
}) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const target = items[round % items.length];
  const tiles = useMemo(
    () => shuffle([target, ...shuffle(items.filter((i) => i.id !== target.id)).slice(0, 2)]),
    [round, target, items],
  );
  useEffect(() => { if (started && !done) speak(prompt(target), { rate: 0.92 }); }, [round, started, done, prompt, target]);
  const tap = (id: string) => {
    if (done) return;
    if (id === target.id) {
      playCorrect();
      speak("Boa!", { pitch: 1.2 });
      if (round + 1 >= rounds) { setDone(true); playLevelUp(); recordJuniorPlay(gameId, `Terminou ${title}`); }
      else setRound((r) => r + 1);
    } else { playWrong(); speak(`Tenta outra vez. Procura ${target.label}.`, { rate: 0.9 }); }
  };
  return (
    <div className="relative space-y-4">
      <GameTutorial gameId={gameId} title={title} steps={tutorial} onStart={() => setStarted(true)} />
      <p className="text-center font-display text-xl">{prompt(target)}</p>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <motion.button key={t.id + round} whileTap={{ scale: 0.9 }} onClick={() => tap(t.id)}
            className={`touch-target-kid flex h-32 items-center justify-center rounded-3xl border-4 border-border text-6xl shadow-lg ${t.cls ?? "bg-card"}`}
            aria-label={t.label}>{t.emoji}</motion.button>
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">Ronda {Math.min(round + 1, rounds)}/{rounds}</div>
      {done && <p className="text-center font-display text-2xl text-success">🎉 Parabéns!</p>}
    </div>
  );
}

const INSTR = [
  { id: "drum", label: "o tambor", emoji: "🥁" },
  { id: "guitar", label: "a guitarra", emoji: "🎸" },
  { id: "piano", label: "o piano", emoji: "🎹" },
  { id: "trumpet", label: "a trompete", emoji: "🎺" },
];
export const GameInstrumentos = () => (
  <TapPick gameId="instrumentos" title="Toca no Instrumento" items={INSTR}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🎶", text: "Vês instrumentos." }, { emoji: "👆", text: "Toca no que eu disser." }]} />
);

const TEMPO = [
  { id: "sun", label: "o sol", emoji: "☀️", cls: "bg-yellow-100" },
  { id: "rain", label: "a chuva", emoji: "🌧️", cls: "bg-blue-100" },
  { id: "snow", label: "a neve", emoji: "❄️", cls: "bg-sky-100" },
  { id: "cloud", label: "a nuvem", emoji: "☁️", cls: "bg-card" },
];
export const GameTempo = () => (
  <TapPick gameId="tempo-meteo" title="Que tempo faz?" items={TEMPO}
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "☀️", text: "Há sol, chuva, neve…" }, { emoji: "👆", text: "Toca no tempo certo." }]} />
);

const PROF = [
  { id: "doc", label: "o médico", emoji: "🧑‍⚕️" },
  { id: "fire", label: "o bombeiro", emoji: "🧑‍🚒" },
  { id: "chef", label: "o cozinheiro", emoji: "🧑‍🍳" },
  { id: "teach", label: "a professora", emoji: "🧑‍🏫" },
];
export const GameProfissoes = () => (
  <TapPick gameId="profissoes" title="Profissões" items={PROF}
    prompt={(t) => `Quem é ${t.label}?`}
    tutorial={[{ emoji: "👷", text: "Vês profissões." }, { emoji: "👆", text: "Toca na pessoa certa." }]} />
);

const PARTE_DIA = [
  { id: "morn", label: "a manhã", emoji: "🌅", cls: "bg-yellow-100" },
  { id: "noon", label: "o meio-dia", emoji: "🌞", cls: "bg-orange-100" },
  { id: "night", label: "a noite", emoji: "🌙", cls: "bg-indigo-100" },
];
export const GameParteDia = () => (
  <TapPick gameId="parte-dia" title="Parte do Dia" items={PARTE_DIA}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🌅", text: "Há manhã, dia e noite." }, { emoji: "👆", text: "Toca na parte certa." }]} />
);

const CONTRA = [
  { id: "hot", label: "o quente", emoji: "🔥", cls: "bg-red-100" },
  { id: "cold", label: "o frio", emoji: "🧊", cls: "bg-blue-100" },
];
export const GameContrarios = () => (
  <TapPick gameId="contrarios" title="Quente ou Frio" items={CONTRA} rounds={4}
    prompt={(t) => `Toca ${t.label}!`}
    tutorial={[{ emoji: "🔥", text: "Há quente e frio." }, { emoji: "👆", text: "Toca no certo." }]} />
);

const NUMS46 = [
  { id: "4", label: "o número 4", emoji: "4️⃣", cls: "bg-primary/10" },
  { id: "5", label: "o número 5", emoji: "5️⃣", cls: "bg-secondary/30" },
  { id: "6", label: "o número 6", emoji: "6️⃣", cls: "bg-accent/30" },
];
export const GameNum46 = () => (
  <TapPick gameId="num-tap-4-6" title="Números 4, 5, 6" items={NUMS46}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🔢", text: "Vês três números." }, { emoji: "👆", text: "Toca no certo." }]} />
);

const FORMAS = [
  { id: "circle", label: "o círculo", emoji: "⚪" },
  { id: "square", label: "o quadrado", emoji: "🟥" },
  { id: "triangle", label: "o triângulo", emoji: "🔺" },
  { id: "star", label: "a estrela", emoji: "⭐" },
];
export const GameFormaSimples = () => (
  <TapPick gameId="forma-simples" title="Toca na Forma" items={FORMAS}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🔺", text: "Vês formas." }, { emoji: "👆", text: "Toca na forma certa." }]} />
);

const FAMILIA = [
  { id: "mae", label: "a mãe", emoji: "👩" },
  { id: "pai", label: "o pai", emoji: "👨" },
  { id: "bebe", label: "o bebé", emoji: "👶" },
  { id: "avo", label: "o avô", emoji: "👴" },
];
export const GameFamilia = () => (
  <TapPick gameId="familia" title="A Minha Família" items={FAMILIA}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "👪", text: "Vês a família." }, { emoji: "👆", text: "Toca em quem eu disser." }]} />
);

const VEICULOS = [
  { id: "car", label: "o carro", emoji: "🚗" },
  { id: "bike", label: "a bicicleta", emoji: "🚲" },
  { id: "boat", label: "o barco", emoji: "⛵" },
  { id: "plane", label: "o avião", emoji: "✈️" },
];
export const GameVeiculos = () => (
  <TapPick gameId="veiculos-tap" title="Veículos" items={VEICULOS}
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🚗", text: "Vês meios de transporte." }, { emoji: "👆", text: "Toca no certo." }]} />
);

const SONS_NATU = [
  { id: "thunder", label: "o trovão", emoji: "⛈️" },
  { id: "wind", label: "o vento", emoji: "🍃" },
  { id: "wave", label: "a onda", emoji: "🌊" },
];
export const GameSonsNatu = () => (
  <TapPick gameId="sons-natu" title="Sons da Natureza" items={SONS_NATU} rounds={3}
    prompt={(t) => `Toca em ${t.label}!`}
    tutorial={[{ emoji: "🌳", text: "Sons da natureza." }, { emoji: "👆", text: "Toca no certo." }]} />
);
