// triviaSenior.ts — Ponte currículo→trivia: as lições do 5.º e 6.º ano
// (curriculumSenior.ts) alimentam o Duelo da Família e o Quiz Relâmpago
// nas idades 10–12, que antes só tinham 27 perguntas no teto.
//
// Cada pergunta MCQ/VF de lição vira uma TriviaQuestion com:
// • age ancorado na faixa do ano — 5.º → 10, 6.º → 11;
// • MCQ com a resposta certa em posição ROTATIVA (determinística por
//   pergunta) — o Duelo e o Relâmpago mostram as opções pela ordem
//   guardada, ao contrário das lições (que baralham com shuffleMcqOptions);
// • VF mantém options fixos ["Verdadeiro", "Falso"].
import type { Question } from "@/lib/curriculum";
import { SENIOR_LESSONS } from "@/lib/curriculumSenior";
import type { TriviaQuestion } from "@/lib/triviaBoost";

/** Ano escolar → idade-âncora da pergunta (dentro da faixa do GRADE_AGES). */
const AGE_BY_GRADE: Record<number, number> = { 5: 10, 6: 11 };

/** Matéria → categoria do banco de trivia (nomes já usados nos bancos). */
const CATEGORY_BY_SUBJECT: Record<string, string> = {
  portugues: "portugues",
  matematica: "matematica",
  "estudo-do-meio": "mundo",
  ciencias: "ciencia",
  ingles: "ingles",
  cidadania: "mundo",
};

/** Hash estável (FNV-1a) para a rotação determinística das opções. */
function hashPrompt(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function lessonToTrivia(q: Question, category: string, age: number): TriviaQuestion | null {
  const opts = q.options;
  const ans = q.answerIndex;
  if (!Array.isArray(opts) || typeof ans !== "number" || opts.length < 2) return null;
  const correct = opts[ans];
  if (correct == null) return null;
  if (q.kind === "truefalse") {
    // VF: opções fixas (0 = Verdadeiro, 1 = Falso) — nunca baralhar.
    return { category, age, prompt: q.prompt, options: opts, answerIndex: ans, hint: q.hint };
  }
  // MCQ: a resposta certa circula entre as posições (determinístico por
  // prompt) para o padrão "a certa é sempre a 1.ª" nunca aparecer nos jogos.
  const rest = opts.map((_, i) => i).filter((i) => i !== ans);
  const shift = hashPrompt(q.prompt) % opts.length;
  const rotated = [...rest.slice(0, shift), ans, ...rest.slice(shift)];
  return {
    category,
    age,
    prompt: q.prompt,
    options: rotated.map((i) => opts[i]),
    answerIndex: rotated.indexOf(ans),
    hint: q.hint,
  };
}

export const SENIOR_TRIVIA: TriviaQuestion[] = Object.entries(SENIOR_LESSONS).flatMap(
  ([subjectId, lessons]) => {
    const category = CATEGORY_BY_SUBJECT[subjectId] ?? "mundo";
    return (lessons ?? []).flatMap((lesson) => {
      const age = AGE_BY_GRADE[lesson.grade] ?? 10;
      return lesson.questions
        .map((q) => lessonToTrivia(q, category, age))
        .filter((q): q is TriviaQuestion => q !== null);
    });
  },
);
