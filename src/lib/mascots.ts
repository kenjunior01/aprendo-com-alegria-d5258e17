import fox from "@/assets/mascot-fox.png";
import owl from "@/assets/mascot-owl.png";
import bunny from "@/assets/mascot-bunny.png";
import turtle from "@/assets/mascot-turtle.png";

export type MascotId = "fox" | "owl" | "bunny" | "turtle";

export interface Mascot {
  id: MascotId;
  name: string;
  image: string;
  greeting: string;
  encourage: string;
  color: string; // tailwind utility for accent bg
  persona: string; // Instruções para o LLM
}

export const MASCOTS: Mascot[] = [
  {
    id: "fox",
    name: "Faísca",
    image: fox,
    greeting: "Olá! Sou a Faísca. Vamos brincar a aprender?",
    encourage: "Tu consegues! Mais um desafio!",
    color: "bg-[oklch(0.92_0.1_50)]",
    persona: "És a Faísca, uma raposa super veloz e cheia de energia. Adoras matemática e lógica. Falas de forma entusiasmada e usas expressões como 'À velocidade da luz!' ou 'Fizeste isto num piscar de olhos!'."
  },
  {
    id: "owl",
    name: "Mocha",
    image: owl,
    greeting: "Piu-piu! Sou a Mocha, a coruja sabichona.",
    encourage: "Sábio é quem nunca desiste!",
    color: "bg-[oklch(0.9_0.08_310)]",
    persona: "És a Mocha, uma coruja sábia e calma. Sabes tudo sobre a história de Moçambique, o Rio Zambeze e as nossas tradições. Falas com paciência e adoras ensinar factos curiosos sobre o mundo."
  },
  {
    id: "bunny",
    name: "Pipoca",
    image: bunny,
    greeting: "Olá! Sou a Pipoca, vamos saltar para a aventura!",
    encourage: "Mais um saltinho e estás lá!",
    color: "bg-[oklch(0.94_0.05_15)]",
    persona: "És a Pipoca, uma coelhinha rítmica e alegre. Adoras ler, escrever e música. Falas de forma doce e rítmica, incentivando a criança a ler em voz alta e a descobrir o prazer das palavras."
  },
  {
    id: "turtle",
    name: "Tito",
    image: turtle,
    greeting: "Olá! Sou o Tito. Devagar e sempre, chegamos longe.",
    encourage: "Boa! Passinho a passinho.",
    color: "bg-[oklch(0.92_0.1_145)]",
    persona: "És o Tito, uma tartaruga paciente e metódica. Adoras o meio ambiente, a ciência e os animais. Falas de forma estruturada e lembras sempre que o importante é aprender bem, não é ir depressa."
  },
];

export const getMascot = (id: MascotId | null | undefined): Mascot =>
  MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];

export type GrowthStage = "bebé" | "júnior" | "aventureiro" | "mestre";

export function getGrowthStage(grade: number, xp: number): { stage: GrowthStage; scale: number; label: string } {
  // Crescimento baseado em XP (conhecimento acumulado) e "Idade" (Progresso acadêmico)
  if (grade >= 4 || xp > 5000) return { stage: "mestre", scale: 1.25, label: "Mestre do Saber" };
  if (grade >= 3 || xp > 2000) return { stage: "aventureiro", scale: 1.1, label: "Explorador" };
  if (grade >= 2 || xp > 500) return { stage: "júnior", scale: 0.95, label: "Mascote Júnior" };
  return { stage: "bebé", scale: 0.8, label: "Recém-Adotado" };
}
