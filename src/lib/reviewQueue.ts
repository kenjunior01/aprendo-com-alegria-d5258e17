// reviewQueue — "Revisão Mágica": prática espaçada dos erros entre sessões.
// A técnica com melhor evidência para fixar memória: rever o que falhou
// no dia seguinte (e de novo, se voltar a falhar). Fica só no dispositivo
// (localStorage) — não altera o perfil sincronizado na cloud.
//
// Fluxo: erra na lição → entra na fila → no dia seguinte aparece o cartão
// "Revisão Mágica" no /app → acertou? sai da fila; voltou a errar? fica
// para amanhã (times++ ajuda a priorizar).

export interface ReviewItem {
  /** Estável: `${subjectId}|${prompt}` */
  id: string;
  subjectId: string;
  subjectName: string;
  lessonId: string;
  lessonTitle: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  hint?: string;
  explanation?: string;
  /** YYYY-MM-DD do último erro. */
  missedAt: string;
  /** Quantas vezes já errou esta pergunta. */
  times: number;
}

const KEY = "kidoz-review-v1";
const CAP = 30;
export const SESSION_LIMIT = 10;

export const todayStr = (): string => new Date().toISOString().slice(0, 10);

/** ID estável de uma pergunta (igual ao usado por addMistake). */
export const reviewId = (subjectId: string, prompt: string): string => `${subjectId}|${prompt}`;

function safeLoad(): ReviewItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is ReviewItem =>
        !!i &&
        typeof i === "object" &&
        typeof (i as ReviewItem).id === "string" &&
        typeof (i as ReviewItem).prompt === "string" &&
        Array.isArray((i as ReviewItem).options) &&
        typeof (i as ReviewItem).answerIndex === "number",
    );
  } catch {
    return [];
  }
}

function save(items: ReviewItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, CAP)));
  } catch {
    // storage cheio/bloqueado — ignorar
  }
}

/** Perguntas à espera de revisão (erros de dias anteriores). */
export function dueItems(today = todayStr(), limit = SESSION_LIMIT): ReviewItem[] {
  return safeLoad()
    .filter((i) => i.missedAt < today)
    .sort((a, b) => a.missedAt.localeCompare(b.missedAt))
    .slice(0, limit);
}

export function countDue(today = todayStr()): number {
  return safeLoad().filter((i) => i.missedAt < today).length;
}

/**
 * Regista um erro da lição (só perguntas de escolha múltipla — os
 * exercícios de ordenar não fazem sentido na fila de revisão MCQ).
 */
export function addMistake(input: {
  subjectId: string;
  subjectName: string;
  lessonId: string;
  lessonTitle: string;
  question: {
    prompt: string;
    options?: string[];
    answerIndex?: number;
    hint?: string;
    explanation?: string;
  };
}): void {
  const q = input.question;
  if (!Array.isArray(q.options) || typeof q.answerIndex !== "number") return;
  const id = `${input.subjectId}|${q.prompt}`;
  const items = safeLoad();
  const existing = items.find((i) => i.id === id);
  const today = todayStr();
  if (existing) {
    existing.missedAt = today;
    existing.times += 1;
  } else {
    items.push({
      id,
      subjectId: input.subjectId,
      subjectName: input.subjectName,
      lessonId: input.lessonId,
      lessonTitle: input.lessonTitle,
      prompt: q.prompt,
      options: q.options,
      answerIndex: q.answerIndex,
      hint: q.hint,
      explanation: q.explanation,
      missedAt: today,
      times: 1,
    });
  }
  // Se passou do limite, larga primeiro os mais antigos e menos errados.
  items.sort((a, b) => b.missedAt.localeCompare(a.missedAt) || b.times - a.times);
  save(items);
}

/**
 * Resultado de uma revisão: acertou → sai da fila; voltou a errar →
 * fica para amanhã (missedAt = hoje).
 */
export function markReviewed(id: string, wasCorrect: boolean, today = todayStr()): void {
  const items = safeLoad();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  if (wasCorrect) {
    items.splice(idx, 1);
  } else {
    items[idx].missedAt = today;
    items[idx].times += 1;
  }
  save(items);
}
