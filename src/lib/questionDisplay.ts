// questionDisplay — helpers para os tipos de exercício da lição.
// Mantém o motor da lição limpo: baralhar ordenações, resolver dicas
// instantâneas (offline, sem IA) e converter perguntas para a fila de revisão.

import type { Question } from "./curriculum";
import { hintForPergunta } from "./hintFor";

/** É uma pergunta de escolha múltipla (tem options + answerIndex)? */
export function isMcq(q: Question): boolean {
  return Array.isArray(q.options) && typeof q.answerIndex === "number";
}

/**
 * Baralha itens de uma ordenação garantindo que NUNCA aparece já na
 * ordem certa (tenta 8x; se não conseguir — itens repetidos — inverte).
 */
export function scrambleOrder(sequence: string[]): string[] {
  if (sequence.length < 2) return [...sequence];
  const key = sequence.join("\u0000");
  for (let attempt = 0; attempt < 8; attempt++) {
    const arr = [...sequence];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join("\u0000") !== key) return arr;
  }
  return [...sequence].reverse();
}

/**
 * Dica instantânea para a lição: primeiro a escrita à mão (q.hint),
 * depois estratégias automáticas do método (hintFor), e para os novos
 * tipos uma pista de como jogar que também ensina a abordagem.
 */
export function hintForQuestion(q: Question): string | undefined {
  if (q.hint) return q.hint;
  if (q.kind === "order") {
    return "Toca nas peças pela ordem certa — se te enganares, toca na peça posta para a tirar!";
  }
  if (q.kind === "count") {
    return "Aponta para cada um e conta em voz alta: um, dois, três…";
  }
  return hintForPergunta(q.prompt);
}

/**
 * Baralha as opções de uma escolha múltipla (P3 da auditoria: memorizar a
 * POSIÇÃO da resposta deixava de funcionar — a criança pensa, não decora).
 * Mantém a coerência total: o answerIndex novo aponta para a MESMA resposta
 * certa, por isso display, voz, dica e revisão continuam alinhados.
 * Verdadeiro/Falso fica na ordem fixa (✅/❌ têm posição semântica) e
 * perguntas com menos de 3 opções não valem o baralho.
 */
export function shuffleMcqOptions<
  T extends {
    options?: string[];
    answerIndex?: number;
    kind?: string;
  },
>(q: T): T {
  if (q.kind === "truefalse") return q;
  const opts = q.options;
  const ans = q.answerIndex;
  if (!Array.isArray(opts) || typeof ans !== "number" || opts.length < 3) return q;
  const idxs = opts.map((_, i) => i);
  let perm = idxs;
  // Garante que a resposta certa NÃO fica no mesmo sítio (rejogadas diferentes).
  for (let attempt = 0; attempt < 8; attempt++) {
    perm = [...idxs];
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    if (perm[ans] !== ans) break;
  }
  return {
    ...q,
    options: perm.map((i) => opts[i]),
    answerIndex: perm.indexOf(ans),
  };
}
