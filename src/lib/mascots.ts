import fox from "@/assets/mascot-fox.png";
import owl from "@/assets/mascot-owl.png";
import bunny from "@/assets/mascot-bunny.png";
import turtle from "@/assets/mascot-turtle.png";
import foxCelebrate from "@/assets/mascot-fox-celebrate.png";
import owlCelebrate from "@/assets/mascot-owl-celebrate.png";
import bunnyCelebrate from "@/assets/mascot-bunny-celebrate.png";
import turtleCelebrate from "@/assets/mascot-turtle-celebrate.png";
import foxSad from "@/assets/mascot-fox-sad.png";
import owlSad from "@/assets/mascot-owl-sad.png";
import bunnySad from "@/assets/mascot-bunny-sad.png";
import turtleSad from "@/assets/mascot-turtle-sad.png";
import foxSleep from "@/assets/mascot-fox-sleep.png";
import owlSleep from "@/assets/mascot-owl-sleep.png";
import bunnySleep from "@/assets/mascot-bunny-sleep.png";
import turtleSleep from "@/assets/mascot-turtle-sleep.png";

export type MascotId = "fox" | "owl" | "bunny" | "turtle";

/** Sprites emocionais (renders 3D — identidade mantida entre poses). */
export type MascotEmotion = "idle" | "celebrate" | "sad" | "sleep";

export interface Mascot {
  id: MascotId;
  name: string;
  /** Artigo definido correto para o nome ("a Faísca", "o Tito"). */
  article: "a" | "o";
  image: string;
  /** Sprites por emoção — usados pelo MascotActor. */
  emotions: Record<MascotEmotion, string>;
  greeting: string;
  encourage: string;
  color: string; // tailwind utility for accent bg
  persona: string; // Instruções para o LLM
}

export const MASCOTS: Mascot[] = [
  {
    id: "fox",
    name: "Faísca",
    article: "a",
    image: fox,
    emotions: { idle: fox, celebrate: foxCelebrate, sad: foxSad, sleep: foxSleep },
    greeting: "Olá! Sou a Faísca. Vamos brincar a aprender?",
    encourage: "Tu consegues! Mais um desafio!",
    color: "bg-[oklch(0.92_0.1_50)]",
    persona:
      "És a Faísca, uma raposa super veloz e cheia de energia. Adoras matemática e lógica. Falas de forma entusiasmada e usas expressões como 'À velocidade da luz!' ou 'Fizeste isto num piscar de olhos!'.",
  },
  {
    id: "owl",
    name: "Mocha",
    article: "a",
    image: owl,
    emotions: { idle: owl, celebrate: owlCelebrate, sad: owlSad, sleep: owlSleep },
    greeting: "Piu-piu! Sou a Mocha, a coruja sabichona.",
    encourage: "Sábio é quem nunca desiste!",
    color: "bg-[oklch(0.9_0.08_310)]",
    persona:
      "És a Mocha, uma coruja sábia e calma. Sabes tudo sobre a história e as tradições de Portugal e do mundo — dos descobrimentos às invenções incríveis. Falas com paciência e adoras ensinar factos curiosos.",
  },
  {
    id: "bunny",
    name: "Pipoca",
    article: "a",
    image: bunny,
    emotions: { idle: bunny, celebrate: bunnyCelebrate, sad: bunnySad, sleep: bunnySleep },
    greeting: "Olá! Sou a Pipoca, vamos saltar para a aventura!",
    encourage: "Mais um saltinho e estás lá!",
    color: "bg-[oklch(0.94_0.05_15)]",
    persona:
      "És a Pipoca, uma coelhinha rítmica e alegre. Adoras ler, escrever e música. Falas de forma doce e rítmica, incentivando a criança a ler em voz alta e a descobrir o prazer das palavras.",
  },
  {
    id: "turtle",
    name: "Tito",
    article: "o",
    image: turtle,
    emotions: { idle: turtle, celebrate: turtleCelebrate, sad: turtleSad, sleep: turtleSleep },
    greeting: "Olá! Sou o Tito. Devagar e sempre, chegamos longe.",
    encourage: "Boa! Passinho a passinho.",
    color: "bg-[oklch(0.92_0.1_145)]",
    persona:
      "És o Tito, uma tartaruga paciente e metódica. Adoras o meio ambiente, a ciência e os animais. Falas de forma estruturada e lembras sempre que o importante é aprender bem, não é ir depressa.",
  },
];

export const getMascot = (id: MascotId | null | undefined): Mascot =>
  MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];

export type GrowthStage = "bebé" | "júnior" | "aventureiro" | "mestre";

export function getGrowthStage(
  grade: number,
  xp: number,
): { stage: GrowthStage; scale: number; label: string } {
  // Crescimento baseado em XP (conhecimento acumulado) e "Idade" (Progresso acadêmico)
  if (grade >= 4 || xp > 5000) return { stage: "mestre", scale: 1.25, label: "Mestre do Saber" };
  if (grade >= 3 || xp > 2000) return { stage: "aventureiro", scale: 1.1, label: "Explorador" };
  if (grade >= 2 || xp > 500) return { stage: "júnior", scale: 0.95, label: "Mascote Júnior" };
  return { stage: "bebé", scale: 0.8, label: "Recém-Adotado" };
}
