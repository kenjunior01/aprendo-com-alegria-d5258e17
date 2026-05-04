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
}

export const MASCOTS: Mascot[] = [
  {
    id: "fox",
    name: "Faísca",
    image: fox,
    greeting: "Olá! Sou a Faísca. Vamos brincar a aprender?",
    encourage: "Tu consegues! Mais um desafio!",
    color: "bg-[oklch(0.92_0.1_50)]",
  },
  {
    id: "owl",
    name: "Mocha",
    image: owl,
    greeting: "Piu-piu! Sou a Mocha, a coruja sabichona.",
    encourage: "Sábio é quem nunca desiste!",
    color: "bg-[oklch(0.9_0.08_310)]",
  },
  {
    id: "bunny",
    name: "Pipoca",
    image: bunny,
    greeting: "Olá! Sou a Pipoca, vamos saltar para a aventura!",
    encourage: "Mais um saltinho e estás lá!",
    color: "bg-[oklch(0.94_0.05_15)]",
  },
  {
    id: "turtle",
    name: "Tito",
    image: turtle,
    greeting: "Olá! Sou o Tito. Devagar e sempre, chegamos longe.",
    encourage: "Boa! Passinho a passinho.",
    color: "bg-[oklch(0.92_0.1_145)]",
  },
];

export const getMascot = (id: MascotId | null | undefined): Mascot =>
  MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
