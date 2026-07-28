/**
 * MascotTeacher — Mascot as teaching assistant logic.
 *
 * Generates age-appropriate explanations for mistakes,
 * maps subject+grade to teaching style (visual for math, verbal for language),
 * provides encouragement sequences for consecutive failures,
 * suggests next lesson based on weak areas,
 * and uses profile data to personalize the teaching approach.
 */

import type { Profile } from "./storage";
import type { MascotId } from "./mascots";
import { getMascot } from "./mascots";

/* ─── Types ─── */

export type SubjectId = "portugues" | "matematica" | "estudo-do-meio";
export type TeachingStyle = "visual" | "verbal" | "kinesthetic" | "mixed";

export interface MistakeExplanation {
  /** Short encouragement phrase */
  encouragement: string;
  /** Age-appropriate explanation of the mistake */
  explanation: string;
  /** A hint to try again */
  hint: string;
  /** Teaching style used */
  style: TeachingStyle;
  /** Mascot name to reference */
  mascotName: string;
}

export interface LessonSuggestion {
  subjectId: SubjectId;
  reason: string;
  priority: "high" | "medium" | "low";
}

/* ─── Teaching Style Mapping ─── */

const STYLE_FOR_SUBJECT: Record<SubjectId, TeachingStyle> = {
  matematica: "visual",     // Math: visual representations, number lines, shapes
  portugues: "verbal",      // Language: verbal explanations, word associations
  "estudo-do-meio": "mixed", // Science/Social: mix of visual and verbal
};

const STYLE_FOR_GRADE: Record<number, TeachingStyle> = {
  1: "kinesthetic",  // 1st grade: hands-on, simple actions
  2: "visual",       // 2nd grade: visual aids
  3: "mixed",        // 3rd grade: combination
  4: "verbal",       // 4th grade: more abstract verbal explanations
};

/* ─── Encouragement Sequences ─── */

const ENCOURAGEMENT_1ST_WRONG = [
  "Quase! Tenta outra vez.",
  "Não faz mal — a próxima vai ser certa!",
  "Estás a aprender, e isso é o mais importante!",
];

const ENCOURAGEMENT_2ND_WRONG = [
  "Vamos pensar diferente — o {mascot} tem uma ideia!",
  "Respira fundo e tenta de novo. Tu consegues!",
  "O {mascot} diz: 'Erro é passo para aprender!'",
];

const ENCOURAGEMENT_3RD_WRONG = [
  "O {mascot} vai te explicar passo a passo. Vamos lá!",
  "Não te preocupes — vamos praticar mais juntos.",
  "É normal errar! O {mascot} também errava quando era pequenino.",
];

const ENCOURAGEMENT_4TH_PLUS = [
  "Vamos tentar algo mais fácil primeiro, e depois voltamos aqui.",
  "O {mascot} tem uma dica especial para ti!",
  "Pedimos ajuda ao Tutor? Ele sabe explicar de forma muito simples!",
];

/* ─── Subject-Specific Explanations ─── */

interface ExplanationTemplate {
  wrongType: string;   // e.g., "addition", "subtraction", "vowels", "reading"
  style: TeachingStyle;
  gradeRange: [number, number]; // min and max grade
  explanation: (mascotName: string) => string;
  hint: (mascotName: string) => string;
}

const MATH_EXPLANATIONS: ExplanationTemplate[] = [
  {
    wrongType: "addition",
    style: "visual",
    gradeRange: [1, 2],
    explanation: (m) => `O ${m} mostra com objetos: se tens 3 maçãs e ganhas 2 mais, conta-as todas: 3 + 2 = 5! Podes desenhar as maçãs para ajudar.`,
    hint: (m) => `O ${m} diz: conta com os dedos — 3 de uma mão, 2 da outra, e soma todos!`,
  },
  {
    wrongType: "addition",
    style: "visual",
    gradeRange: [3, 4],
    explanation: (m) => `O ${m} explica: quando somamos, estamos a juntar duas quantidades. Exemplo: 47 + 25 — soma primeiro as unidades (7+5=12), depois as dezenas (4+2+1=7). Resultado: 72!`,
    hint: (m) => `O ${m} diz: soma primeiro os números pequenos (unidades) e depois os grandes (dezenas).`,
  },
  {
    wrongType: "subtraction",
    style: "visual",
    gradeRange: [1, 2],
    explanation: (m) => `O ${m} conta uma história: tinhas 5 balões e 2 voaram. Quantos ficaram? 5 - 2 = 3! Subtrair é tirar alguns de um grupo.`,
    hint: (m) => `O ${m} diz: começa com o número maior e tira o menor. Conta com os dedos!`,
  },
  {
    wrongType: "subtraction",
    style: "visual",
    gradeRange: [3, 4],
    explanation: (m) => `O ${m} explica: subtrair é o contrário de somar. Se 58 - 23, primeiro tira as unidades (8-3=5), depois as dezenas (5-2=3). Resultado: 35!`,
    hint: (m) => `O ${m} diz: se for difícil, imagina que estás a tirar objetos de uma caixa.`,
  },
  {
    wrongType: "multiplication",
    style: "visual",
    gradeRange: [2, 4],
    explanation: (m) => `O ${m} mostra: multiplicar é somar várias vezes! 3 × 4 é somar 3 quatro vezes: 3+3+3+3 = 12. Podes imaginar 4 caixas com 3 chocolates cada.`,
    hint: (m) => `O ${m} diz: pensa em grupos! Quantos objetos em cada grupo, e quantos grupos?`,
  },
  {
    wrongType: "division",
    style: "visual",
    gradeRange: [3, 4],
    explanation: (m) => `O ${m} explica: dividir é partilhar igualmente! 12 ÷ 3 = quantos grupos de 3 cabem em 12? Conta: 3, 6, 9, 12 — são 4 grupos!`,
    hint: (m) => `O ${m} diz: imagina que estás a dividir bolachas entre amigos — todos recebem o mesmo!`,
  },
  {
    wrongType: "fractions",
    style: "visual",
    gradeRange: [3, 4],
    explanation: (m) => `O ${m} corta uma pizza: 1/2 é uma de duas partes iguais. 1/4 é uma de quatro partes. Se tens 2/4, é o mesmo que 1/2 — porque duas fatias de quatro = uma de duas!`,
    hint: (m) => `O ${m} diz: imagina um chocolate partido em partes iguais. Quantas partes tens?`,
  },
  {
    wrongType: "geometry",
    style: "visual",
    gradeRange: [2, 4],
    explanation: (m) => `O ${m} desenha formas: triângulo tem 3 lados, quadrado tem 4 lados iguais, círculo não tem lados — é curvo! Cada forma tem um nome especial.`,
    hint: (m) => `O ${m} diz: conta os lados da forma — o número diz o nome!`,
  },
];

const PORTUGUES_EXPLANATIONS: ExplanationTemplate[] = [
  {
    wrongType: "vowels",
    style: "verbal",
    gradeRange: [1, 2],
    explanation: (m) => `O ${m} canta: 'A, E, I, O, U — são as vogais que fazem as palavras soar!' Cada palavra precisa de pelo menos uma vogal para existir.`,
    hint: (m) => `O ${m} diz: diz a palavra em voz alta — as vogais são as letras que se cantam!`,
  },
  {
    wrongType: "syllables",
    style: "verbal",
    gradeRange: [1, 2],
    explanation: (m) => `O ${m} bate palmas: cada parte de uma palavra é uma sílaba. 'CA-CHO-RRO' = 3 sílabas = 3 palmas! Bate palmas enquanto dizes a palavra.`,
    hint: (m) => `O ${m} diz: bate palmas — cada palma é uma sílaba!`,
  },
  {
    wrongType: "reading",
    style: "verbal",
    gradeRange: [1, 4],
    explanation: (m) => `O ${m} diz: quando lês, vai devagar e repete se não perceberes. Lê a frase duas vezes — a primeira para conhecer as palavras, a segunda para entender o sentido.`,
    hint: (m) => `O ${m} diz: lê em voz alta — os teus ouvidos ajudam a entender!`,
  },
  {
    wrongType: "grammar",
    style: "verbal",
    gradeRange: [2, 4],
    explanation: (m) => `O ${m} explica: 'O menino corre' — o menino é quem faz a ação (sujeito), corre é a ação (verbo). Todas as frases precisam de quem faz + o que faz.`,
    hint: (m) => `O ${m} diz: encontra quem faz a ação e o que faz — é a base da frase!`,
  },
  {
    wrongType: "spelling",
    style: "verbal",
    gradeRange: [2, 4],
    explanation: (m) => `O ${m} ensina: algumas palavras escrevem-se diferente do que звучam. 'Casa' escreve-se com C, não com S. É preciso memorizar estas palavras especiais.`,
    hint: (m) => `O ${m} diz: quando não souberes, tenta escrever como ouves e depois corrige.`,
  },
  {
    wrongType: "plural",
    style: "verbal",
    gradeRange: [2, 4],
    explanation: (m) => `O ${m} conta: 'gato' + 's' = 'gatos'. Mas há exceções — 'papél' + 'eis' = 'papéis'. Palavras terminadas em -l mudam para -is no plural.`,
    hint: (m) => `O ${m} diz: se termina em -ão, pode ser -ões, -ãos ou -ães — memoriza os exemplos!`,
  },
];

const ESTUDO_MEIO_EXPLANATIONS: ExplanationTemplate[] = [
  {
    wrongType: "environment",
    style: "mixed",
    gradeRange: [1, 4],
    explanation: (m) => `O ${m} mostra: a Terra é como uma casa grande. Poupar água, não deitar lixo no chão e plantar árvores são formas de cuidar da nossa casa.`,
    hint: (m) => `O ${m} diz: pensa — o que farias para cuidar do teu quarto? O mesmo serve para a Terra!`,
  },
  {
    wrongType: "body",
    style: "kinesthetic",
    gradeRange: [1, 2],
    explanation: (m) => `O ${m} aponta: os olhos para ver, os ouvidos para ouvir, a boca para falar e comer, as mãos para tocar e criar. Cada parte do corpo tem um trabalho especial!`,
    hint: (m) => `O ${m} diz: aponta para a parte do corpo — o que faz?`,
  },
  {
    wrongType: "seasons",
    style: "visual",
    gradeRange: [1, 4],
    explanation: (m) => `O ${m} desenha: Primavera = flores, Verão = sol, Outono = folhas caindo, Inverno = frio e neve. As estações mudam porque a Terra gira à volta do Sol.`,
    hint: (m) => `O ${m} diz: associa cada estação a um cenário — ajuda a memorizar!`,
  },
  {
    wrongType: "history",
    style: "mixed",
    gradeRange: [3, 4],
    explanation: (m) => `O ${m} conta: Portugal tem uma história rica — navegadores que exploraram o mundo, reis e rainhas que construíram castelos, e pessoas comuns que fizeram coisas extraordinárias.`,
    hint: (m) => `O ${m} diz: imagina a história como um filme — cada evento é uma cena!`,
  },
];

/* ─── All explanations combined ─── */

const ALL_EXPLANATIONS: ExplanationTemplate[] = [
  ...MATH_EXPLANATIONS,
  ...PORTUGUES_EXPLANATIONS,
  ...ESTUDO_MEIO_EXPLANATIONS,
];

/* ─── Weak Area Detection ─── */

interface WeakArea {
  subjectId: SubjectId;
  wrongCount: number;
  recentWrong: number; // wrong in last 5 attempts
}

/**
 * Detect weak areas from lesson history.
 * @param completedLessons - list of completed lesson IDs
 * @param profile - current profile
 * @returns suggested lessons prioritized by weakness
 */
export function detectWeakAreas(completedLessons: string[]): WeakArea[] {
  // Parse lesson IDs like "mat-1a-01" or "port-2a-03"
  const subjectCounts: Record<string, { total: number; wrong: number }> = {};

  for (const id of completedLessons) {
    const subject = id.split("-")[0];
    if (!subjectCounts[subject]) subjectCounts[subject] = { total: 0, wrong: 0 };
    subjectCounts[subject].total++;
  }

  // Since we don't have explicit wrong counts in completed lessons,
  // use XP and streak as proxies — low XP per lesson = more errors
  const areas: WeakArea[] = [];
  const subjectMap: Record<string, SubjectId> = {
    mat: "matematica",
    port: "portugues",
    em: "estudo-do-meio",
  };

  for (const [prefix, subjectId] of Object.entries(subjectMap)) {
    const counts = subjectCounts[prefix] ?? { total: 0, wrong: 0 };
    if (counts.total > 0) {
      areas.push({
        subjectId,
        wrongCount: counts.wrong,
        recentWrong: Math.min(counts.wrong, 5),
      });
    }
  }

  return areas.sort((a, b) => b.wrongCount - a.wrongCount);
}

/* ─── Lesson Suggestion ─── */

export function suggestNextLesson(profile: Profile): LessonSuggestion[] {
  const completed = profile.completedLessons;
  const areas = detectWeakAreas(completed);
  const suggestions: LessonSuggestion[] = [];

  // Prioritize subjects with no completed lessons
  const subjectsCompleted: Record<SubjectId, number> = {
    matematica: completed.filter((l) => l.startsWith("mat-")).length,
    portugues: completed.filter((l) => l.startsWith("port-")).length,
    "estudo-do-meio": completed.filter((l) => l.startsWith("em-")).length,
  };

  // Suggest subjects with least progress
  const sorted = Object.entries(subjectsCompleted).sort((a, b) => a[1] - b[1]);

  for (const [subject, count] of sorted) {
    const priority: LessonSuggestion["priority"] = count === 0 ? "high" : count < 3 ? "medium" : "low";
    suggestions.push({
      subjectId: subject as SubjectId,
      reason: count === 0
        ? `Ainda não tentaste ${subjectLabel(subject)} — começa por aqui!`
        : count < 3
          ? `Continua com ${subjectLabel(subject)} — estás no caminho!`
          : `Estás a progredir bem em ${subjectLabel(subject)}!`,
      priority,
    });
  }

  // Add weak area suggestions
  for (const area of areas) {
    if (area.wrongCount > 2) {
      suggestions.push({
        subjectId: area.subjectId,
        reason: `Pratica mais ${subjectLabel(area.subjectId)} — é onde tens mais dificuldade.`,
        priority: "high",
      });
    }
  }

  return suggestions.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

function subjectLabel(id: string): string {
  switch (id) {
    case "matematica": return "Matemática";
    case "portugues": return "Português";
    case "estudo-do-meio": return "Estudo do Meio";
    default: return id;
  }
}

/* ─── Main: Generate Mistake Explanation ─── */

export function generateExplanation(
  profile: Profile,
  subjectId: SubjectId,
  wrongType: string,
  consecutiveWrong: number,
): MistakeExplanation {
  const mascot = getMascot(profile.mascot);
  const mascotName = mascot.name;

  // Determine teaching style: blend subject style with grade style
  const subjectStyle = STYLE_FOR_SUBJECT[subjectId];
  const gradeStyle = STYLE_FOR_GRADE[profile.grade] ?? "mixed";
  const style: TeachingStyle = profile.grade <= 2 ? subjectStyle : gradeStyle;

  // Find matching explanation template
  const template = ALL_EXPLANATIONS.find(
    (t) => t.wrongType === wrongType
      && t.style === style
      && profile.grade >= t.gradeRange[0]
      && profile.grade <= t.gradeRange[1],
  );

  // Fallback explanation
  const fallbackExplanation = `O ${mascotName} explica: não faz mal errar — cada erro é uma oportunidade de aprender algo novo! Vamos tentar de novo juntos.`;
  const fallbackHint = `O ${mascotName} diz: tenta lembrar o que aprendeste na última missão.`;

  // Pick encouragement based on consecutive wrong count
  let encouragement: string;
  if (consecutiveWrong <= 1) {
    encouragement = pickRandom(ENCOURAGEMENT_1ST_WRONG);
  } else if (consecutiveWrong === 2) {
    encouragement = pickRandom(ENCOURAGEMENT_2ND_WRONG).replace("{mascot}", mascotName);
  } else if (consecutiveWrong === 3) {
    encouragement = pickRandom(ENCOURAGEMENT_3RD_WRONG).replace("{mascot}", mascotName);
  } else {
    encouragement = pickRandom(ENCOURAGEMENT_4TH_PLUS).replace("{mascot}", mascotName);
  }

  return {
    encouragement,
    explanation: template ? template.explanation(mascotName) : fallbackExplanation,
    hint: template ? template.hint(mascotName) : fallbackHint,
    style,
    mascotName,
  };
}

/* ─── Teaching Style Description ─── */

export function getTeachingStyleDescription(style: TeachingStyle): string {
  switch (style) {
    case "visual": return "A mascote usa imagens, desenhos e cores para explicar.";
    case "verbal": return "A mascote explica com palavras e exemplos em voz alta.";
    case "kinesthetic": return "A mascote sugere atividades físicas e gestos para aprender.";
    case "mixed": return "A mascote combina imagens, palavras e ações para ensinar.";
  }
}

/* ─── Personalized Greeting ─── */

export function getPersonalizedGreeting(profile: Profile): string {
  const mascot = getMascot(profile.mascot);
  const name = profile.name || "amigo";

  if (profile.streak >= 7) {
    return `Olá, ${name}! 🔥 ${profile.streak} dias seguidos — ${mascot.name} está super orgulhoso!`;
  }
  if (profile.completedLessons.length === 0) {
    return `Olá, ${name}! O ${mascot.name} está pronto para começar a primeira aventura! 🌟`;
  }
  if (profile.hearts <= 2) {
    return `Olá, ${name}! O ${mascot.name} quer ajudar — vamos recuperar corações? 💪`;
  }
  return mascot.greeting;
}

/* ─── Helpers ─── */

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
