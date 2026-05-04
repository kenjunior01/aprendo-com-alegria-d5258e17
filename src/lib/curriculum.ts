// Conteúdo curricular simplificado para 1.º ciclo (Portugal — 1.º a 4.º ano)
// Cada lição tem perguntas de múltipla escolha.

export type SubjectId = "portugues" | "matematica" | "estudo-do-meio";

export interface Question {
  prompt: string;
  options: string[];
  answerIndex: number;
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  questions: Question[];
}

export interface Subject {
  id: SubjectId;
  name: string;
  tagline: string;
  emoji: string;
  colorVar: string; // CSS variable name
  lessons: Lesson[];
}

export const SUBJECTS: Subject[] = [
  {
    id: "portugues",
    name: "Português",
    tagline: "Ler, escrever e brincar com palavras",
    emoji: "📚",
    colorVar: "--pt-portuguese",
    lessons: [
      {
        id: "pt-vogais",
        title: "As Vogais",
        emoji: "🔤",
        questions: [
          { prompt: "Qual destas é uma vogal?", options: ["B", "A", "M", "T"], answerIndex: 1 },
          { prompt: "Quantas vogais tem 'CASA'?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          { prompt: "A palavra 'OURO' começa por…", options: ["consoante", "vogal", "número", "símbolo"], answerIndex: 1 },
          { prompt: "Qual é a vogal em 'PÉ'?", options: ["P", "É", "nenhuma", "as duas"], answerIndex: 1 },
        ],
      },
      {
        id: "pt-silabas",
        title: "Sílabas",
        emoji: "🎵",
        questions: [
          { prompt: "Quantas sílabas tem 'BO-LA'?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          { prompt: "'BORBOLETA' divide-se em…", options: ["BOR-BO-LE-TA", "BORB-OLETA", "BO-RBO-LETA", "BORBO-LETA"], answerIndex: 0 },
          { prompt: "Qual palavra tem 3 sílabas?", options: ["SOL", "MAR", "BANANA", "PÃO"], answerIndex: 2 },
        ],
      },
      {
        id: "pt-singular-plural",
        title: "Singular e Plural",
        emoji: "✏️",
        questions: [
          { prompt: "Plural de 'GATO' é…", options: ["GATA", "GATOS", "GATINHO", "GATÃO"], answerIndex: 1 },
          { prompt: "Plural de 'PÃO' é…", options: ["PÃOS", "PÃES", "PÃEIS", "PANS"], answerIndex: 1 },
          { prompt: "Singular de 'FLORES' é…", options: ["FLOR", "FLORZINHA", "FLORA", "FLORI"], answerIndex: 0 },
          { prompt: "Plural de 'ANIMAL' é…", options: ["ANIMALS", "ANIMAIS", "ANIMALES", "ANIMAES"], answerIndex: 1 },
        ],
      },
      {
        id: "pt-rimas",
        title: "Rimas e Sons",
        emoji: "🎤",
        questions: [
          { prompt: "Qual palavra rima com 'GATO'?", options: ["CÃO", "PRATO", "MESA", "LIVRO"], answerIndex: 1 },
          { prompt: "Qual rima com 'SOL'?", options: ["LUA", "FAROL", "CASA", "FLOR"], answerIndex: 1 },
          { prompt: "Qual rima com 'MAR'?", options: ["RIO", "PESCAR", "ÁGUA", "PEIXE"], answerIndex: 1 },
        ],
      },
    ],
  },
  {
    id: "matematica",
    name: "Matemática",
    tagline: "Contar, somar e descobrir",
    emoji: "➕",
    colorVar: "--pt-math",
    lessons: [
      {
        id: "mat-contar",
        title: "Contar até 20",
        emoji: "🔢",
        questions: [
          { prompt: "Que número vem depois do 7?", options: ["6", "8", "9", "10"], answerIndex: 1 },
          { prompt: "Quantos dedos tens em duas mãos?", options: ["8", "9", "10", "12"], answerIndex: 2 },
          { prompt: "Que número vem antes do 15?", options: ["13", "14", "16", "17"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-somas",
        title: "Somas Simples",
        emoji: "➕",
        questions: [
          { prompt: "2 + 3 = ?", options: ["4", "5", "6", "7"], answerIndex: 1 },
          { prompt: "7 + 4 = ?", options: ["10", "11", "12", "13"], answerIndex: 1 },
          { prompt: "9 + 6 = ?", options: ["14", "15", "16", "17"], answerIndex: 1 },
          { prompt: "10 + 10 = ?", options: ["15", "20", "25", "100"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-subtracoes",
        title: "Subtrações",
        emoji: "➖",
        questions: [
          { prompt: "10 − 4 = ?", options: ["5", "6", "7", "8"], answerIndex: 1 },
          { prompt: "15 − 7 = ?", options: ["7", "8", "9", "10"], answerIndex: 1 },
          { prompt: "20 − 11 = ?", options: ["8", "9", "10", "11"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-tabuada",
        title: "Tabuada do 2",
        emoji: "✖️",
        questions: [
          { prompt: "2 × 3 = ?", options: ["5", "6", "7", "8"], answerIndex: 1 },
          { prompt: "2 × 5 = ?", options: ["7", "10", "12", "15"], answerIndex: 1 },
          { prompt: "2 × 8 = ?", options: ["14", "16", "18", "20"], answerIndex: 1 },
          { prompt: "2 × 10 = ?", options: ["18", "20", "22", "25"], answerIndex: 1 },
        ],
      },
    ],
  },
  {
    id: "estudo-do-meio",
    name: "Estudo do Meio",
    tagline: "Portugal, natureza e o mundo",
    emoji: "🌍",
    colorVar: "--pt-world",
    lessons: [
      {
        id: "em-portugal",
        title: "O nosso Portugal",
        emoji: "🇵🇹",
        questions: [
          { prompt: "Qual é a capital de Portugal?", options: ["Porto", "Lisboa", "Coimbra", "Faro"], answerIndex: 1 },
          { prompt: "Quantas cores tem a bandeira portuguesa?", options: ["1", "2", "3", "4"], answerIndex: 1, hint: "Verde e vermelho" },
          { prompt: "Que rio passa em Lisboa?", options: ["Douro", "Tejo", "Mondego", "Guadiana"], answerIndex: 1 },
          { prompt: "Que oceano banha Portugal?", options: ["Pacífico", "Índico", "Atlântico", "Ártico"], answerIndex: 2 },
        ],
      },
      {
        id: "em-corpo",
        title: "O Corpo Humano",
        emoji: "🧍",
        questions: [
          { prompt: "Quantos olhos temos?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          { prompt: "Que órgão bombeia o sangue?", options: ["Pulmão", "Coração", "Estômago", "Cérebro"], answerIndex: 1 },
          { prompt: "Para que servem os pulmões?", options: ["Comer", "Respirar", "Pensar", "Andar"], answerIndex: 1 },
        ],
      },
      {
        id: "em-natureza",
        title: "Animais e Plantas",
        emoji: "🌳",
        questions: [
          { prompt: "Qual destes é um mamífero?", options: ["Sardinha", "Águia", "Cão", "Cobra"], answerIndex: 2 },
          { prompt: "As plantas precisam de…", options: ["Som", "Sol e água", "Televisão", "Pilhas"], answerIndex: 1 },
          { prompt: "Quantas patas tem uma aranha?", options: ["6", "8", "10", "4"], answerIndex: 1 },
        ],
      },
      {
        id: "em-tempo",
        title: "Estações e Tempo",
        emoji: "🌤️",
        questions: [
          { prompt: "Quantas estações tem o ano?", options: ["2", "3", "4", "5"], answerIndex: 2 },
          { prompt: "Em que estação caem as folhas?", options: ["Primavera", "Verão", "Outono", "Inverno"], answerIndex: 2 },
          { prompt: "Quantos dias tem uma semana?", options: ["5", "6", "7", "8"], answerIndex: 2 },
        ],
      },
    ],
  },
];

export const getSubject = (id: string) => SUBJECTS.find((s) => s.id === id);
export const getLesson = (subjectId: string, lessonId: string) =>
  getSubject(subjectId)?.lessons.find((l) => l.id === lessonId);
