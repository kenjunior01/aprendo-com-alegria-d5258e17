// Estrutura narrativa: o currículo é organizado em CAPÍTULOS/MUNDOS,
// cada um com missões (lições) e uma história ligada à mascote.
// Esta camada vive POR CIMA do currículo de src/lib/curriculum.ts.

import { SUBJECTS, type GradeLevel, type SubjectId } from "./curriculum";

export interface Mission {
  lessonId: string;
  subjectId: SubjectId;
  title: string;
  emoji: string;
  grade: GradeLevel;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  story: string; // narrativa curta
  emoji: string;
  themeColorVar: string; // CSS var
  bgGradient: string; // tailwind classes
  grade: GradeLevel;
  missions: Mission[];
}

// Helper to pick lessons by id
const pick = (subjectId: SubjectId, lessonIds: string[]): Mission[] => {
  const sub = SUBJECTS.find((s) => s.id === subjectId);
  if (!sub) return [];
  return lessonIds
    .map((id) => sub.lessons.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l)
    .map((l) => ({
      lessonId: l.id,
      subjectId,
      title: l.title,
      emoji: l.emoji,
      grade: l.grade,
    }));
};

export const CHAPTERS: Chapter[] = [
  // === 1.º ANO === Ilha das Letras
  {
    id: "ilha-das-letras",
    number: 1,
    title: "Ilha das Letras",
    subtitle: "1.º ano · Português",
    story: "A Mocha encontrou um mapa cheio de vogais perdidas. Ajuda-a a recolhê-las pela ilha!",
    emoji: "🏝️",
    themeColorVar: "--pt-portuguese",
    bgGradient: "from-[oklch(0.95_0.05_50)] to-[oklch(0.92_0.08_30)]",
    grade: 1,
    missions: pick("portugues", ["pt-vogais", "pt-silabas", "pt-rimas"]),
  },
  {
    id: "vale-dos-numeros",
    number: 2,
    title: "Vale dos Números",
    subtitle: "1.º ano · Matemática",
    story: "No vale, os números fugiram! Faísca precisa da tua ajuda para os contar.",
    emoji: "🌄",
    themeColorVar: "--pt-math",
    bgGradient: "from-[oklch(0.94_0.05_230)] to-[oklch(0.9_0.08_220)]",
    grade: 1,
    missions: pick("matematica", [
      "mat-contar",
      "mat-somas",
      "boost-mat-somar20",
      "boost-mat-subtrair",
    ]),
  },
  {
    id: "pais-magico",
    number: 3,
    title: "Portugal Mágico",
    subtitle: "1.º ano · Estudo do Meio",
    story: "Pipoca está a viajar por Portugal. Vai com ela descobrir cidades e rios!",
    emoji: "🇵🇹",
    themeColorVar: "--pt-world",
    bgGradient: "from-[oklch(0.94_0.06_145)] to-[oklch(0.9_0.09_155)]",
    grade: 1,
    missions: pick("estudo-do-meio", ["em-portugal", "boost-edm-corpo"]),
  },

  // === 2.º ANO === Floresta das Palavras
  {
    id: "floresta-das-palavras",
    number: 4,
    title: "Floresta das Palavras",
    subtitle: "2.º ano · Português",
    story: "Na floresta, cada árvore esconde uma palavra. Singular, plural, masculino, feminino…",
    emoji: "🌳",
    themeColorVar: "--pt-portuguese",
    bgGradient: "from-[oklch(0.95_0.05_120)] to-[oklch(0.9_0.08_100)]",
    grade: 2,
    missions: pick("portugues", ["pt-singular-plural", "pt-masc-fem", "boost-pt-silabas"]),
  },
  {
    id: "torre-tabuada",
    number: 5,
    title: "Torre da Tabuada",
    subtitle: "2.º ano · Matemática",
    story: "Sobe a torre resolvendo somas, subtrações e a tabuada do 2!",
    emoji: "🗼",
    themeColorVar: "--pt-math",
    bgGradient: "from-[oklch(0.94_0.05_270)] to-[oklch(0.9_0.08_280)]",
    grade: 2,
    missions: pick("matematica", [
      "mat-subtracoes",
      "mat-tabuada-2",
      "mat-dezenas",
      "boost-mat-tabuada2",
      "boost-mat-formas",
    ]),
  },
  {
    id: "corpo-natureza",
    number: 6,
    title: "Mundo Vivo",
    subtitle: "2.º ano · Estudo do Meio",
    story: "Conhece o teu corpo, animais, plantas e as quatro estações.",
    emoji: "🌱",
    themeColorVar: "--pt-world",
    bgGradient: "from-[oklch(0.94_0.06_140)] to-[oklch(0.9_0.09_170)]",
    grade: 2,
    missions: pick("estudo-do-meio", [
      "em-corpo",
      "em-natureza",
      "em-tempo",
      "boost-edm-familia",
      "boost-edm-natureza",
    ]),
  },

  // === 3.º ANO === Castelo da Gramática
  {
    id: "castelo-gramatica",
    number: 7,
    title: "Castelo da Gramática",
    subtitle: "3.º ano · Português",
    story: "No castelo, o Tito guarda os segredos da gramática: substantivos, adjetivos e verbos.",
    emoji: "🏰",
    themeColorVar: "--pt-portuguese",
    bgGradient: "from-[oklch(0.93_0.06_50)] to-[oklch(0.88_0.1_30)]",
    grade: 3,
    missions: pick("portugues", [
      "pt-substantivos",
      "pt-adjetivos",
      "pt-verbos",
      "boost-pt-plural",
      "boost-pt-verbos",
    ]),
  },
  {
    id: "laboratorio-numeros",
    number: 8,
    title: "Laboratório dos Números",
    subtitle: "3.º ano · Matemática",
    story: "No laboratório descobres a tabuada e a magia das divisões.",
    emoji: "🧪",
    themeColorVar: "--pt-math",
    bgGradient: "from-[oklch(0.93_0.06_240)] to-[oklch(0.88_0.1_260)]",
    grade: 3,
    missions: pick("matematica", [
      "mat-tabuada-5",
      "mat-divisoes",
      "mat-tabuada-mista",
      "boost-mat-horas",
    ]),
  },
  {
    id: "expedicao-portugal",
    number: 9,
    title: "Expedição Portugal",
    subtitle: "3.º ano · Estudo do Meio",
    story: "Atravessa os 18 distritos e olha o céu para conhecer o Sistema Solar.",
    emoji: "🚞",
    themeColorVar: "--pt-world",
    bgGradient: "from-[oklch(0.93_0.06_160)] to-[oklch(0.88_0.1_180)]",
    grade: 3,
    missions: pick("estudo-do-meio", ["em-distritos", "em-sistema-solar", "boost-edm-mocambique"]),
  },

  // === 4.º ANO === Galáxia do Saber
  {
    id: "biblioteca-real",
    number: 10,
    title: "Biblioteca Real",
    subtitle: "4.º ano · Português",
    story: "Pronomes e pontuação: as ferramentas dos grandes escritores.",
    emoji: "📜",
    themeColorVar: "--pt-portuguese",
    bgGradient: "from-[oklch(0.92_0.07_40)] to-[oklch(0.86_0.11_20)]",
    grade: 4,
    missions: pick("portugues", ["pt-pronomes", "pt-pontuacao", "boost-pt-ortografia"]),
  },
  {
    id: "estacao-fracoes",
    number: 11,
    title: "Estação das Frações",
    subtitle: "4.º ano · Matemática",
    story: "Aprende a partir tudo em pedaços iguais e domina a tabuada do 7.",
    emoji: "🍕",
    themeColorVar: "--pt-math",
    bgGradient: "from-[oklch(0.92_0.07_220)] to-[oklch(0.86_0.11_250)]",
    grade: 4,
    missions: pick("matematica", [
      "mat-fracoes-intro",
      "mat-fracoes-comparar",
      "mat-tabuada-7",
      "boost-mat-problemas",
    ]),
  },
  {
    id: "guardioes-planeta",
    number: 12,
    title: "Guardiões do Planeta",
    subtitle: "4.º ano · Estudo do Meio",
    story: "Viaja na história de Portugal e torna-te um guardião do ambiente.",
    emoji: "🌍",
    themeColorVar: "--pt-world",
    bgGradient: "from-[oklch(0.92_0.07_140)] to-[oklch(0.86_0.11_170)]",
    grade: 4,
    missions: pick("estudo-do-meio", ["em-historia", "em-ambiente", "boost-edm-agua"]),
  },

  // === MUNDOS DE DESCOBERTA === matérias extra, ordenadas do fácil ao difícil
  {
    id: "ilha-do-ingles",
    number: 13,
    title: "Ilha do Inglês",
    subtitle: "Início · Inglês",
    story: "Hello, friend! A Mocha trouxe palavras mágicas de longe. Vamos aprendê-las juntos!",
    emoji: "🇬🇧",
    themeColorVar: "--pt-english",
    bgGradient: "from-[oklch(0.94_0.05_300)] to-[oklch(0.9_0.08_290)]",
    grade: 1,
    missions: pick("ingles", [
      "en-saudacoes",
      "en-cores",
      "en-numeros",
      "boost-en-colors",
      "en-familia",
      "en-animais",
      "boost-en-numbers",
      "boost-en-animals",
    ]),
  },
  {
    id: "caminho-do-bem",
    number: 14,
    title: "Caminho do Bem",
    subtitle: "Todos os anos · Cidadania",
    story: "O Tito acredita em ti: vamos aprender a ser bons amigos e a cuidar do planeta.",
    emoji: "🤝",
    themeColorVar: "--pt-civic",
    bgGradient: "from-[oklch(0.95_0.05_70)] to-[oklch(0.92_0.08_60)]",
    grade: 1,
    missions: pick("cidadania", [
      "cid-respeito",
      "boost-cid-emocoes",
      "cid-ambiente",
      "cid-seguranca",
      "boost-cid-ambiente",
    ]),
  },
  {
    id: "laboratorio-curioso",
    number: 15,
    title: "Laboratório Curioso",
    subtitle: "Todos os anos · Ciências",
    story: "Pipoca vestiu a bata de cientista. Vamos descobrir animais, plantas, energia e mais!",
    emoji: "🔬",
    themeColorVar: "--pt-science",
    bgGradient: "from-[oklch(0.94_0.05_210)] to-[oklch(0.9_0.08_200)]",
    grade: 2,
    missions: pick("ciencias", [
      "boost-cie-animais",
      "ci-animais",
      "ci-plantas",
      "ci-tempo",
      "boost-cie-plantas",
      "ci-estados",
      "ci-energia",
    ]),
  },
  {
    id: "torre-do-ingles",
    number: 16,
    title: "Torre do Inglês",
    subtitle: "Aventureiros · Inglês",
    story: "Sobe a torre com corpo, comida e verbos — para falar inglês como um campeão!",
    emoji: "🗼",
    themeColorVar: "--pt-english",
    bgGradient: "from-[oklch(0.92_0.06_300)] to-[oklch(0.88_0.09_290)]",
    grade: 3,
    missions: pick("ingles", ["en-corpo", "en-comida", "boost-en-greetings", "en-verbos"]),
  },
];

export const getChapter = (id: string) => CHAPTERS.find((c) => c.id === id);

export const chaptersForGrade = (grade: number) => CHAPTERS.filter((c) => c.grade <= grade + 1); // mostra o ano e o seguinte

export const totalMissions = () => CHAPTERS.reduce((sum, c) => sum + c.missions.length, 0);

export const isChapterComplete = (chapter: Chapter, completedLessons: string[]) =>
  chapter.missions.every((m) => completedLessons.includes(m.lessonId));

export const chapterProgress = (chapter: Chapter, completedLessons: string[]) => {
  const done = chapter.missions.filter((m) => completedLessons.includes(m.lessonId)).length;
  return {
    done,
    total: chapter.missions.length,
    pct: chapter.missions.length ? done / chapter.missions.length : 0,
  };
};
