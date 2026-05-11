// Conteúdo curricular para 1.º ciclo (Portugal — 1.º ao 4.º ano)
// Cada lição tem perguntas de múltipla escolha.

export type SubjectId = "portugues" | "matematica" | "estudo-do-meio";
export type GradeLevel = 1 | 2 | 3 | 4;

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
  grade: GradeLevel;
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

import { SUBJECTS_EXTRA } from "./curriculumExtra";

const SUBJECTS_CORE: Subject[] = [
  {
    id: "portugues",
    name: "Português",
    tagline: "Ler, escrever e brincar com palavras",
    emoji: "📚",
    colorVar: "--pt-portuguese",
    lessons: [
      // 1.º ano
      {
        id: "pt-vogais", title: "As Vogais", emoji: "🔤", grade: 1,
        questions: [
          { prompt: "Qual destas é uma vogal?", options: ["B", "A", "M", "T"], answerIndex: 1 },
          { prompt: "Quantas vogais tem 'CASA'?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          { prompt: "A palavra 'OURO' começa por…", options: ["consoante", "vogal", "número", "símbolo"], answerIndex: 1 },
          { prompt: "Qual é a vogal em 'PÉ'?", options: ["P", "É", "nenhuma", "as duas"], answerIndex: 1 },
        ],
      },
      {
        id: "pt-silabas", title: "Sílabas", emoji: "🎵", grade: 1,
        questions: [
          { prompt: "Quantas sílabas tem 'BO-LA'?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          { prompt: "'BORBOLETA' divide-se em…", options: ["BOR-BO-LE-TA", "BORB-OLETA", "BO-RBO-LETA", "BORBO-LETA"], answerIndex: 0 },
          { prompt: "Qual palavra tem 3 sílabas?", options: ["SOL", "MAR", "BANANA", "PÃO"], answerIndex: 2 },
        ],
      },
      {
        id: "pt-rimas", title: "Rimas e Sons", emoji: "🎤", grade: 1,
        questions: [
          { prompt: "Qual palavra rima com 'GATO'?", options: ["CÃO", "PRATO", "MESA", "LIVRO"], answerIndex: 1 },
          { prompt: "Qual rima com 'SOL'?", options: ["LUA", "FAROL", "CASA", "FLOR"], answerIndex: 1 },
          { prompt: "Qual rima com 'MAR'?", options: ["RIO", "PESCAR", "ÁGUA", "PEIXE"], answerIndex: 1 },
        ],
      },
      // 2.º ano
      {
        id: "pt-singular-plural", title: "Singular e Plural", emoji: "✏️", grade: 2,
        questions: [
          { prompt: "Plural de 'GATO' é…", options: ["GATA", "GATOS", "GATINHO", "GATÃO"], answerIndex: 1 },
          { prompt: "Plural de 'PÃO' é…", options: ["PÃOS", "PÃES", "PÃEIS", "PANS"], answerIndex: 1 },
          { prompt: "Singular de 'FLORES' é…", options: ["FLOR", "FLORZINHA", "FLORA", "FLORI"], answerIndex: 0 },
          { prompt: "Plural de 'ANIMAL' é…", options: ["ANIMALS", "ANIMAIS", "ANIMALES", "ANIMAES"], answerIndex: 1 },
        ],
      },
      {
        id: "pt-masc-fem", title: "Masculino e Feminino", emoji: "♀️", grade: 2,
        questions: [
          { prompt: "Feminino de 'MENINO'?", options: ["MENINA", "MENININHO", "MENINHA", "MENINETE"], answerIndex: 0 },
          { prompt: "Feminino de 'CÃO'?", options: ["CÃA", "CADELA", "CÃOZINHA", "CÃNINA"], answerIndex: 1 },
          { prompt: "Masculino de 'GALINHA'?", options: ["GALINHO", "GALO", "PINTO", "PATO"], answerIndex: 1 },
        ],
      },
      // 3.º ano - Gramática
      {
        id: "pt-substantivos", title: "Substantivos", emoji: "🏷️", grade: 3,
        questions: [
          { prompt: "Qual destas palavras é um substantivo?", options: ["correr", "bonita", "casa", "depressa"], answerIndex: 2 },
          { prompt: "'Lisboa' é um substantivo…", options: ["comum", "próprio", "coletivo", "abstrato"], answerIndex: 1 },
          { prompt: "Qual é um substantivo coletivo?", options: ["abelha", "enxame", "mel", "rainha"], answerIndex: 1 },
          { prompt: "'Alegria' é um substantivo…", options: ["concreto", "abstrato", "próprio", "coletivo"], answerIndex: 1 },
        ],
      },
      {
        id: "pt-adjetivos", title: "Adjetivos", emoji: "✨", grade: 3,
        questions: [
          { prompt: "Qual destas é um adjetivo?", options: ["mesa", "rápido", "saltar", "três"], answerIndex: 1 },
          { prompt: "Em 'casa grande', 'grande' é…", options: ["substantivo", "verbo", "adjetivo", "advérbio"], answerIndex: 2 },
          { prompt: "Qualidade de 'corajoso' é…", options: ["coragem", "medroso", "lento", "alto"], answerIndex: 0 },
        ],
      },
      {
        id: "pt-verbos", title: "Verbos no Presente", emoji: "🏃", grade: 3,
        questions: [
          { prompt: "'Eu ___ um livro.' (ler)", options: ["lê", "leio", "lemos", "lêem"], answerIndex: 1 },
          { prompt: "'Tu ___ à escola.' (ir)", options: ["vou", "vais", "vai", "vamos"], answerIndex: 1 },
          { prompt: "'Nós ___ futebol.' (jogar)", options: ["jogo", "jogas", "jogam", "jogamos"], answerIndex: 3 },
          { prompt: "'Eles ___ felizes.' (ser)", options: ["é", "somos", "são", "sou"], answerIndex: 2 },
        ],
      },
      // 4.º ano
      {
        id: "pt-pronomes", title: "Pronomes Pessoais", emoji: "👥", grade: 4,
        questions: [
          { prompt: "Pronome para 'a Maria'?", options: ["ele", "ela", "tu", "nós"], answerIndex: 1 },
          { prompt: "Pronome para 'eu e o João'?", options: ["eles", "vós", "nós", "vocês"], answerIndex: 2 },
          { prompt: "'___ comprou um livro.' (a Ana)", options: ["Ele", "Ela", "Eles", "Tu"], answerIndex: 1 },
        ],
      },
      {
        id: "pt-pontuacao", title: "Pontuação", emoji: "❗", grade: 4,
        questions: [
          { prompt: "Que sinal usamos numa pergunta?", options: [".", "?", "!", ","], answerIndex: 1 },
          { prompt: "Que sinal mostra surpresa?", options: [".", "?", "!", ":"], answerIndex: 2 },
          { prompt: "Para separar palavras numa lista usamos…", options: ["ponto", "vírgula", "traço", "parêntesis"], answerIndex: 1 },
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
      // 1.º ano
      {
        id: "mat-contar", title: "Contar até 20", emoji: "🔢", grade: 1,
        questions: [
          { prompt: "Que número vem depois do 7?", options: ["6", "8", "9", "10"], answerIndex: 1 },
          { prompt: "Quantos dedos tens em duas mãos?", options: ["8", "9", "10", "12"], answerIndex: 2 },
          { prompt: "Que número vem antes do 15?", options: ["13", "14", "16", "17"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-somas", title: "Somas Simples", emoji: "➕", grade: 1,
        questions: [
          { prompt: "2 + 3 = ?", options: ["4", "5", "6", "7"], answerIndex: 1 },
          { prompt: "7 + 4 = ?", options: ["10", "11", "12", "13"], answerIndex: 1 },
          { prompt: "9 + 6 = ?", options: ["14", "15", "16", "17"], answerIndex: 1 },
          { prompt: "10 + 10 = ?", options: ["15", "20", "25", "100"], answerIndex: 1 },
        ],
      },
      // 2.º ano
      {
        id: "mat-subtracoes", title: "Subtrações", emoji: "➖", grade: 2,
        questions: [
          { prompt: "10 − 4 = ?", options: ["5", "6", "7", "8"], answerIndex: 1 },
          { prompt: "15 − 7 = ?", options: ["7", "8", "9", "10"], answerIndex: 1 },
          { prompt: "20 − 11 = ?", options: ["8", "9", "10", "11"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-tabuada-2", title: "Tabuada do 2", emoji: "✖️", grade: 2,
        questions: [
          { prompt: "2 × 3 = ?", options: ["5", "6", "7", "8"], answerIndex: 1 },
          { prompt: "2 × 5 = ?", options: ["7", "10", "12", "15"], answerIndex: 1 },
          { prompt: "2 × 8 = ?", options: ["14", "16", "18", "20"], answerIndex: 1 },
          { prompt: "2 × 10 = ?", options: ["18", "20", "22", "25"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-dezenas", title: "Dezenas e Unidades", emoji: "🔟", grade: 2,
        questions: [
          { prompt: "Quantas dezenas tem 34?", options: ["3", "4", "30", "34"], answerIndex: 0 },
          { prompt: "Em 56, qual é a unidade?", options: ["5", "6", "50", "56"], answerIndex: 1 },
          { prompt: "5 dezenas + 7 unidades = ?", options: ["12", "57", "75", "507"], answerIndex: 1 },
        ],
      },
      // 3.º ano - Tabuada e divisões
      {
        id: "mat-tabuada-5", title: "Tabuada do 5", emoji: "🖐️", grade: 3,
        questions: [
          { prompt: "5 × 4 = ?", options: ["15", "20", "25", "30"], answerIndex: 1 },
          { prompt: "5 × 7 = ?", options: ["30", "35", "40", "45"], answerIndex: 1 },
          { prompt: "5 × 9 = ?", options: ["40", "45", "50", "55"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-divisoes", title: "Divisões Simples", emoji: "➗", grade: 3,
        questions: [
          { prompt: "10 ÷ 2 = ?", options: ["3", "4", "5", "6"], answerIndex: 2, hint: "Quantas vezes o 2 cabe no 10?" },
          { prompt: "12 ÷ 3 = ?", options: ["3", "4", "5", "6"], answerIndex: 1 },
          { prompt: "20 ÷ 4 = ?", options: ["3", "4", "5", "6"], answerIndex: 2 },
          { prompt: "18 ÷ 2 = ?", options: ["7", "8", "9", "10"], answerIndex: 2 },
          { prompt: "Se 4 amigos partilham 16 berlindes, quantos para cada um?", options: ["3", "4", "5", "6"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-tabuada-mista", title: "Tabuada Mista (3, 4, 5)", emoji: "🎯", grade: 3,
        questions: [
          { prompt: "3 × 6 = ?", options: ["15", "18", "21", "24"], answerIndex: 1 },
          { prompt: "4 × 7 = ?", options: ["24", "28", "32", "36"], answerIndex: 1 },
          { prompt: "5 × 6 = ?", options: ["25", "30", "35", "40"], answerIndex: 1 },
          { prompt: "4 × 9 = ?", options: ["32", "36", "40", "44"], answerIndex: 1 },
        ],
      },
      // 4.º ano - Frações
      {
        id: "mat-fracoes-intro", title: "Frações: o que são?", emoji: "🍕", grade: 4,
        questions: [
          { prompt: "Se cortar uma piza em 4 partes iguais, cada parte é…", options: ["1/2", "1/3", "1/4", "1/8"], answerIndex: 2 },
          { prompt: "1/2 significa…", options: ["uma parte de duas", "duas partes", "metade de nada", "um e dois"], answerIndex: 0 },
          { prompt: "Em 3/5, o número 5 chama-se…", options: ["numerador", "denominador", "divisor", "dividendo"], answerIndex: 1 },
          { prompt: "Em 3/5, o número 3 chama-se…", options: ["numerador", "denominador", "fração", "resto"], answerIndex: 0 },
        ],
      },
      {
        id: "mat-fracoes-comparar", title: "Comparar Frações", emoji: "⚖️", grade: 4,
        questions: [
          { prompt: "Qual é maior?", options: ["1/2", "1/4", "são iguais", "1/8"], answerIndex: 0 },
          { prompt: "Quantos quartos formam 1 inteiro?", options: ["2", "3", "4", "5"], answerIndex: 2 },
          { prompt: "1/2 é igual a…", options: ["2/4", "1/4", "3/4", "4/4"], answerIndex: 0 },
          { prompt: "Comi 3/8 de bolo. Sobrou…", options: ["3/8", "5/8", "8/8", "1/8"], answerIndex: 1 },
        ],
      },
      {
        id: "mat-tabuada-7", title: "Tabuada do 7", emoji: "🎰", grade: 4,
        questions: [
          { prompt: "7 × 6 = ?", options: ["42", "48", "49", "56"], answerIndex: 0 },
          { prompt: "7 × 8 = ?", options: ["54", "56", "63", "64"], answerIndex: 1 },
          { prompt: "7 × 9 = ?", options: ["56", "63", "72", "81"], answerIndex: 1 },
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
        id: "em-portugal", title: "O nosso Portugal", emoji: "🇵🇹", grade: 1,
        questions: [
          { prompt: "Qual é a capital de Portugal?", options: ["Porto", "Lisboa", "Coimbra", "Faro"], answerIndex: 1 },
          { prompt: "Quantas cores tem a bandeira portuguesa?", options: ["1", "2", "3", "4"], answerIndex: 1, hint: "Verde e vermelho" },
          { prompt: "Que rio passa em Lisboa?", options: ["Douro", "Tejo", "Mondego", "Guadiana"], answerIndex: 1 },
          { prompt: "Que oceano banha Portugal?", options: ["Pacífico", "Índico", "Atlântico", "Ártico"], answerIndex: 2 },
        ],
      },
      {
        id: "em-corpo", title: "O Corpo Humano", emoji: "🧍", grade: 2,
        questions: [
          { prompt: "Quantos olhos temos?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          { prompt: "Que órgão bombeia o sangue?", options: ["Pulmão", "Coração", "Estômago", "Cérebro"], answerIndex: 1 },
          { prompt: "Para que servem os pulmões?", options: ["Comer", "Respirar", "Pensar", "Andar"], answerIndex: 1 },
          { prompt: "Quantos dentes de leite tem uma criança?", options: ["10", "20", "32", "16"], answerIndex: 1 },
        ],
      },
      {
        id: "em-natureza", title: "Animais e Plantas", emoji: "🌳", grade: 2,
        questions: [
          { prompt: "Qual destes é um mamífero?", options: ["Sardinha", "Águia", "Cão", "Cobra"], answerIndex: 2 },
          { prompt: "As plantas precisam de…", options: ["Som", "Sol e água", "Televisão", "Pilhas"], answerIndex: 1 },
          { prompt: "Quantas patas tem uma aranha?", options: ["6", "8", "10", "4"], answerIndex: 1 },
        ],
      },
      {
        id: "em-tempo", title: "Estações e Tempo", emoji: "🌤️", grade: 2,
        questions: [
          { prompt: "Quantas estações tem o ano?", options: ["2", "3", "4", "5"], answerIndex: 2 },
          { prompt: "Em que estação caem as folhas?", options: ["Primavera", "Verão", "Outono", "Inverno"], answerIndex: 2 },
          { prompt: "Quantos dias tem uma semana?", options: ["5", "6", "7", "8"], answerIndex: 2 },
        ],
      },
      // 3.º ano
      {
        id: "em-distritos", title: "Distritos de Portugal", emoji: "🗺️", grade: 3,
        questions: [
          { prompt: "Quantos distritos tem Portugal continental?", options: ["16", "18", "20", "22"], answerIndex: 1 },
          { prompt: "Em que distrito fica o Porto?", options: ["Lisboa", "Porto", "Braga", "Aveiro"], answerIndex: 1 },
          { prompt: "Qual é o distrito mais a sul?", options: ["Beja", "Faro", "Évora", "Setúbal"], answerIndex: 1 },
          { prompt: "As ilhas dos Açores e Madeira são…", options: ["distritos", "regiões autónomas", "países", "cidades"], answerIndex: 1 },
        ],
      },
      {
        id: "em-sistema-solar", title: "O Sistema Solar", emoji: "🪐", grade: 3,
        questions: [
          { prompt: "Quantos planetas tem o Sistema Solar?", options: ["7", "8", "9", "10"], answerIndex: 1 },
          { prompt: "Qual é o planeta onde vivemos?", options: ["Marte", "Vénus", "Terra", "Júpiter"], answerIndex: 2 },
          { prompt: "Que astro nos dá luz e calor?", options: ["Lua", "Sol", "Estrela", "Cometa"], answerIndex: 1 },
          { prompt: "Qual é o satélite natural da Terra?", options: ["Sol", "Marte", "Lua", "Saturno"], answerIndex: 2 },
        ],
      },
      // 4.º ano
      {
        id: "em-historia", title: "História de Portugal", emoji: "🏰", grade: 4,
        questions: [
          { prompt: "Quem foi o primeiro rei de Portugal?", options: ["D. João I", "D. Afonso Henriques", "D. Dinis", "D. Manuel"], answerIndex: 1 },
          { prompt: "Em que ano se fundou Portugal?", options: ["1143", "1500", "1640", "1910"], answerIndex: 0 },
          { prompt: "Quem chegou à Índia em 1498?", options: ["Pedro Álvares Cabral", "Vasco da Gama", "Fernão de Magalhães", "Bartolomeu Dias"], answerIndex: 1 },
          { prompt: "Quem descobriu o Brasil?", options: ["Vasco da Gama", "Pedro Álvares Cabral", "Cristóvão Colombo", "Fernão Mendes Pinto"], answerIndex: 1 },
        ],
      },
      {
        id: "em-ambiente", title: "Ambiente e Reciclagem", emoji: "♻️", grade: 4,
        questions: [
          { prompt: "Em que ecoponto se coloca o papel?", options: ["Amarelo", "Azul", "Verde", "Vermelho"], answerIndex: 1 },
          { prompt: "Em que ecoponto se coloca o vidro?", options: ["Amarelo", "Azul", "Verde", "Castanho"], answerIndex: 2 },
          { prompt: "O ecoponto amarelo é para…", options: ["vidro", "papel", "plástico e metal", "lixo orgânico"], answerIndex: 2 },
          { prompt: "Qual destas ações ajuda o planeta?", options: ["deitar lixo no chão", "poupar água", "deixar luzes acesas", "queimar plástico"], answerIndex: 1 },
        ],
      },
    ],
  },
];

export const SUBJECTS: Subject[] = [...SUBJECTS_CORE, ...SUBJECTS_EXTRA];

export const getSubject = (id: string) => SUBJECTS.find((s) => s.id === id);
export const getLesson = (subjectId: string, lessonId: string) =>
  getSubject(subjectId)?.lessons.find((l) => l.id === lessonId);


export const GRADE_LABEL: Record<GradeLevel, string> = {
  1: "1.º ano",
  2: "2.º ano",
  3: "3.º ano",
  4: "4.º ano",
};
