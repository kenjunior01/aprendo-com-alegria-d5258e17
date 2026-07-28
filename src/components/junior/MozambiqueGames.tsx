
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { recordJuniorPlay } from "@/lib/junior";
import { speak, playCorrect, playWrong, playLevelUp } from "@/lib/audio";
import { GameTutorial } from "./GameTutorial";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function TapGame({
  gameId, title, prompt, items, rounds = 5, onWin,
  tutorial,
}: {
  gameId: string;
  title: string;
  prompt: (target: { id: string; label: string; emoji: string; cls?: string }) => string;
  items: { id: string; label: string; emoji: string; cls?: string }[];
  rounds?: number;
  onWin?: () => void;
  tutorial: { emoji: string; text: string }[];
}) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

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
      {done && <p className="text-center font-display text-2xl text-success">🎉 Moçambique é fantástico!</p>}
    </div>
  );
}

// 1. Províncias
const PROVINCIAS = [
  { id: "maputo", label: "Maputo", emoji: "🏙️" },
  { id: "gaza", label: "Gaza", emoji: "🦁" },
  { id: "inhambane", label: "Inhambane", emoji: "🏝️" },
  { id: "sofala", label: "Sofala", emoji: "🚢" },
  { id: "manica", label: "Manica", emoji: "⛰️" },
  { id: "tete", label: "Tete", emoji: "🏗️" },
  { id: "zambezia", label: "Zambézia", emoji: "🥥" },
  { id: "nampula", label: "Nampula", emoji: "🥜" },
  { id: "niassa", label: "Niassa", emoji: "🛶" },
  { id: "cabo_delgado", label: "Cabo Delgado", emoji: "💎" },
];

export const GameProvinciasMZ = () => (
  <TapGame gameId="mz-provincias" title="Províncias de Moçambique" items={PROVINCIAS}
    prompt={(t) => `Onde fica ${t.label}?`}
    tutorial={[{ emoji: "🇲🇿", text: "Moçambique tem 10 províncias e a capital." }, { emoji: "👆", text: "Toca na província certa." }]}
  />
);

// 2. Comida
const COMIDA_MZ = [
  { id: "matapa", label: "a Matapa", emoji: "🥬" },
  { id: "xima", label: "a Xima", emoji: "🥣" },
  { id: "badjia", label: "as Badjias", emoji: "🥯" },
  { id: "caril", label: "o Caril de Amendoim", emoji: "🥜" },
  { id: "galinha", label: "a Galinha à Zambeziana", emoji: "🍗" },
];

export const GameComidaMZ = () => (
  <TapGame gameId="mz-comida" title="Sabores de Moçambique" items={COMIDA_MZ}
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🥘", text: "A comida de Moçambique é deliciosa!" }, { emoji: "😋", text: "Toca no prato que eu disser." }]}
  />
);

// 3. Animais
const ANIMAIS_MZ = [
  { id: "dugongo", label: "o Dugongo", emoji: "🧜" },
  { id: "leao", label: "o Leão", emoji: "🦁" },
  { id: "elefante", label: "o Elefante", emoji: "🐘" },
  { id: "rinoceronte", label: "o Rinoceronte", emoji: "🦏" },
  { id: "bufalo", label: "o Búfalo", emoji: "🐃" },
];

export const GameAnimaisMZ = () => (
  <TapGame gameId="mz-animais" title="Animais de Moçambique" items={ANIMAIS_MZ}
    prompt={(t) => `Encontra ${t.label}!`}
    tutorial={[{ emoji: "🦒", text: "Temos animais incríveis nos nossos parques." }, { emoji: "👀", text: "Consegues encontrar todos?" }]}
  />
);

// 4. Cultura
const CULTURA_MZ = [
  { id: "marrabenta", label: "a Marrabenta", emoji: "🎸" },
  { id: "timbila", label: "a Timbila", emoji: "🎹" },
  { id: "mapiko", label: "o Mapiko", emoji: "🎭" },
  { id: "nyau", label: "o Nyau", emoji: "👺" },
];

export const GameCulturaMZ = () => (
  <TapGame gameId="mz-cultura" title="Cultura e Ritmos" items={CULTURA_MZ}
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🎵", text: "A nossa cultura é rica em música e dança." }, { emoji: "🕺", text: "Toca no ritmo certo!" }]}
  />
);

// 5. Bandeira
const BANDEIRA_MZ = [
  { id: "verde", label: "o Verde (riqueza do solo)", emoji: "🟩" },
  { id: "preto", label: "o Preto (continente africano)", emoji: "⬛" },
  { id: "amarelo", label: "o Amarelo (riquezas minerais)", emoji: "🟨" },
  { id: "branco", label: "o Branco (paz)", emoji: "⬜" },
  { id: "vermelho", label: "o Vermelho (luta pela independência)", emoji: "🟥" },
];

export const GameBandeiraMZ = () => (
  <TapGame gameId="mz-bandeira" title="Cores da Nossa Bandeira" items={BANDEIRA_MZ}
    prompt={(t) => `Toca na cor que representa ${t.label.split('(')[1].replace(')', '')}!`}
    tutorial={[{ emoji: "🇲🇿", text: "A nossa bandeira tem cores com significados especiais." }, { emoji: "💡", text: "Toca na cor certa." }]}
  />
);

// 6. Rios
const RIOS_MZ = [
  { id: "zambeze", label: "o Rio Zambeze", emoji: "🌊" },
  { id: "limpopo", label: "o Rio Limpopo", emoji: "🐊" },
  { id: "rovuma", label: "o Rio Rovuma", emoji: "🚣" },
  { id: "save", label: "o Rio Save", emoji: "🏹" },
  { id: "pungue", label: "o Rio Púngue", emoji: "💧" },
];

export const GameRiosMZ = () => (
  <TapGame gameId="mz-rios" title="Rios de Moçambique" items={RIOS_MZ}
    prompt={(t) => `Onde está ${t.label}?`}
    tutorial={[{ emoji: "🏞️", text: "Moçambique é banhado por rios importantes." }, { emoji: "👆", text: "Toca no rio que eu disser." }]}
  />
);

// 7. Cidades
const CIDADES_MZ = [
  { id: "maputo", label: "Maputo (Capital)", emoji: "🏢" },
  { id: "beira", label: "Beira", emoji: "🏖️" },
  { id: "nampula", label: "Nampula", emoji: "🛤️" },
  { id: "quelimane", label: "Quelimane", emoji: "🚲" },
  { id: "pemba", label: "Pemba", emoji: "🐬" },
];

export const GameCidadesMZ = () => (
  <TapGame gameId="mz-cidades" title="Cidades de Moçambique" items={CIDADES_MZ}
    prompt={(t) => `Encontra a cidade de ${t.label.split('(')[0].trim()}!`}
    tutorial={[{ emoji: "🏘️", text: "Conheces as cidades do nosso país?" }, { emoji: "📍", text: "Toca na cidade certa." }]}
  />
);

// 8. Heróis e Figuras
const HEROIS_MZ = [
  { id: "mutola", label: "Maria Mutola", emoji: "🏃‍♀️" },
  { id: "eusebio", label: "Eusébio", emoji: "⚽" },
  { id: "mondlane", label: "Eduardo Mondlane", emoji: "🕯️" },
  { id: "machel", label: "Samora Machel", emoji: "🗣️" },
  { id: "chissano", label: "Joaquim Chissano", emoji: "🤝" },
];

export const GameHeroisMZ = () => (
  <TapGame gameId="mz-herois" title="Heróis de Moçambique" items={HEROIS_MZ}
    prompt={(t) => `Quem é ${t.label}?`}
    tutorial={[{ emoji: "🎖️", text: "Pessoas que fizeram história em Moçambique." }, { emoji: "👆", text: "Toca na figura certa." }]}
  />
);
