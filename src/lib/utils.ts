import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fisher–Yates justo — devolve UMA CÓPIA baralhada sem viés de posição.
 * Proibido o antigo `[...arr].sort(() => Math.random() - 0.5)`, que enviesa
 * a posição da resposta correta e a ordem das perguntas (detetável por
 * crianças mais velhas e injusto nos duelos).
 */
export function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
