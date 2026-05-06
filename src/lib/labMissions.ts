// Mini-missões interativas do Laboratório RA.
// Cada missão é um quiz/desafio com feedback imediato e pontuação.

export interface LabPart {
  id: string;
  label: string;
  emoji: string;
  /** descrição curta mostrada após acerto */
  fact: string;
}

export type LabMissionKind = "order" | "match" | "identify";

export interface LabMission {
  id: string;
  emoji: string;
  title: string;
  intro: string;
  kind: LabMissionKind;
  /** Para "order": colocar na ordem certa. Para "match": ligar parte→função. Para "identify": escolher a parte certa. */
  parts: LabPart[];
  /** Ordem correta dos ids (para "order"), pares (para "match"), ou o id-alvo (para "identify"). */
  answer: string[] | Record<string, string> | string;
  /** Para "identify"/"match": pergunta apresentada à criança. */
  prompt?: string;
  rewardCoins: number;
  rewardXp: number;
}

export const LAB_MISSIONS: LabMission[] = [
  {
    id: "solar-system",
    emoji: "🪐",
    title: "Monta o Sistema Solar",
    intro: "Coloca os planetas pela ordem certa, do mais perto do Sol ao mais longe.",
    kind: "order",
    parts: [
      { id: "mercurio", label: "Mercúrio", emoji: "🟤", fact: "É o planeta mais próximo do Sol — muito quente!" },
      { id: "venus", label: "Vénus", emoji: "🟡", fact: "É o planeta mais brilhante visto da Terra." },
      { id: "terra", label: "Terra", emoji: "🌍", fact: "O nosso planeta — o único com vida que conhecemos." },
      { id: "marte", label: "Marte", emoji: "🔴", fact: "Chamam-lhe o «planeta vermelho»." },
      { id: "jupiter", label: "Júpiter", emoji: "🟠", fact: "É o maior planeta do sistema solar." },
      { id: "saturno", label: "Saturno", emoji: "🪐", fact: "Tem anéis enormes feitos de gelo e rocha." },
    ],
    answer: ["mercurio", "venus", "terra", "marte", "jupiter", "saturno"],
    rewardCoins: 30,
    rewardXp: 40,
  },
  {
    id: "cell-parts",
    emoji: "🔬",
    title: "Partes da Célula",
    intro: "Liga cada parte da célula à sua função.",
    kind: "match",
    parts: [
      { id: "nucleo", label: "Núcleo", emoji: "🧬", fact: "Guarda a informação da célula." },
      { id: "membrana", label: "Membrana", emoji: "🛡️", fact: "Protege e controla o que entra e sai." },
      { id: "mitocondria", label: "Mitocôndria", emoji: "⚡", fact: "Produz energia para a célula trabalhar." },
      { id: "citoplasma", label: "Citoplasma", emoji: "💧", fact: "Substância onde estão todas as outras partes." },
    ],
    answer: {
      nucleo: "Guarda a informação genética",
      membrana: "Protege a célula",
      mitocondria: "Produz energia",
      citoplasma: "Onde tudo flutua",
    },
    rewardCoins: 30,
    rewardXp: 40,
  },
  {
    id: "body-organs",
    emoji: "🫀",
    title: "Identifica os Órgãos",
    intro: "Em qual órgão é que o sangue é bombeado?",
    kind: "identify",
    prompt: "Escolhe o órgão que bombeia o sangue para todo o corpo.",
    parts: [
      { id: "coracao", label: "Coração", emoji: "🫀", fact: "Bate cerca de 100 mil vezes por dia!" },
      { id: "pulmoes", label: "Pulmões", emoji: "🫁", fact: "Trazem o oxigénio para o sangue." },
      { id: "cerebro", label: "Cérebro", emoji: "🧠", fact: "Comanda o corpo todo." },
      { id: "estomago", label: "Estômago", emoji: "🥣", fact: "Digere a comida." },
    ],
    answer: "coracao",
    rewardCoins: 20,
    rewardXp: 25,
  },
  {
    id: "plant-parts",
    emoji: "🌳",
    title: "Partes da Planta",
    intro: "Coloca por ordem do solo até ao céu.",
    kind: "order",
    parts: [
      { id: "raiz", label: "Raiz", emoji: "🌱", fact: "Absorve água e minerais do solo." },
      { id: "caule", label: "Caule", emoji: "🪵", fact: "Sustenta a planta e transporta a seiva." },
      { id: "folha", label: "Folha", emoji: "🍃", fact: "Faz fotossíntese — produz alimento com luz solar." },
      { id: "flor", label: "Flor", emoji: "🌸", fact: "Onde nascem as sementes." },
    ],
    answer: ["raiz", "caule", "folha", "flor"],
    rewardCoins: 25,
    rewardXp: 30,
  },
  {
    id: "water-cycle",
    emoji: "💧",
    title: "Ciclo da Água",
    intro: "Põe as fases do ciclo da água por ordem.",
    kind: "order",
    parts: [
      { id: "evaporacao", label: "Evaporação", emoji: "♨️", fact: "O sol aquece a água e ela sobe como vapor." },
      { id: "condensacao", label: "Condensação", emoji: "☁️", fact: "O vapor forma nuvens." },
      { id: "precipitacao", label: "Precipitação", emoji: "🌧️", fact: "A água cai como chuva, neve ou granizo." },
      { id: "infiltracao", label: "Infiltração", emoji: "🌊", fact: "A água volta para os rios e o solo." },
    ],
    answer: ["evaporacao", "condensacao", "precipitacao", "infiltracao"],
    rewardCoins: 25,
    rewardXp: 30,
  },
];

export function checkAnswer(mission: LabMission, userAnswer: string[] | string): { correct: boolean; partials?: number } {
  if (mission.kind === "identify") {
    return { correct: userAnswer === mission.answer };
  }
  if (mission.kind === "order") {
    const answer = mission.answer as string[];
    const ua = userAnswer as string[];
    let correctCount = 0;
    for (let i = 0; i < answer.length; i++) if (ua[i] === answer[i]) correctCount++;
    return { correct: correctCount === answer.length, partials: correctCount };
  }
  if (mission.kind === "match") {
    // For match, userAnswer is array of the chosen function for each part in parts order
    const answer = mission.answer as Record<string, string>;
    const ua = userAnswer as string[];
    let correctCount = 0;
    mission.parts.forEach((p, i) => {
      if (ua[i] === answer[p.id]) correctCount++;
    });
    return { correct: correctCount === mission.parts.length, partials: correctCount };
  }
  return { correct: false };
}
