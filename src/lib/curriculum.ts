// Conteúdo curricular para 1.º ciclo (Portugal — 1.º ao 4.º ano)
// Tipos de exercício: escolha múltipla (clássico), verdadeiro/falso,
// ordenar (sílabas, números, estações…) e contar (grelha visual de emojis).

export type SubjectId =
  | "portugues"
  | "matematica"
  | "estudo-do-meio"
  | "ingles"
  | "ciencias"
  | "cidadania"
  | string;
export type GradeLevel = 1 | 2 | 3 | 4;

export interface Question {
  prompt: string;
  /** Opções possíveis — ausente apenas nas perguntas de ordenar (kind "order"). */
  options?: string[];
  /** Índice da resposta certa — ausente apenas nas perguntas de ordenar. */
  answerIndex?: number;
  hint?: string;
  /** Tipo de exercício — ausente = escolha múltipla clássica. */
  kind?: "mcq" | "truefalse" | "order" | "count";
  /** kind "order": itens pela ordem certa (o jogo baralha antes de mostrar). */
  sequence?: string[];
  /** kind "count": grelha visual de emojis — groups grupos de perGroup. */
  visual?: { emoji: string; groups: number; perGroup: number };
  /** Mostrada depois de responder — o "porquê" que ensina de verdade. */
  explanation?: string;
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
        id: "pt-vogais",
        title: "As Vogais",
        emoji: "🔤",
        grade: 1,
        questions: [
          {
            prompt: "Qual destas é uma vogal?",
            options: ["B", "A", "M", "T"],
            answerIndex: 1,
            explanation: "As vogais são A, E, I, O, U — todas as outras letras são consoantes.",
          },
          { prompt: "Quantas vogais tem 'CASA'?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          {
            prompt: "A palavra 'OURO' começa por…",
            options: ["consoante", "vogal", "número", "símbolo"],
            answerIndex: 1,
          },
          {
            prompt: "Qual é a vogal em 'PÉ'?",
            options: ["P", "É", "nenhuma", "as duas"],
            answerIndex: 1,
          },
          {
            prompt: "Toca nas vogais pela ordem!",
            kind: "order",
            sequence: ["A", "E", "I", "O", "U"],
            hint: "Canta baixinho: a, e, i, o, u!",
            explanation: "A ordem das vogais: A, E, I, O, U!",
          },
        ],
      },
      {
        id: "pt-silabas",
        title: "Sílabas",
        emoji: "🎵",
        grade: 1,
        questions: [
          {
            prompt: "Quantas sílabas tem 'BO-LA'?",
            options: ["1", "2", "3", "4"],
            answerIndex: 1,
            explanation: "BO-LA: cada pedacinho com vogal é uma sílaba — são 2!",
          },
          {
            prompt: "'BORBOLETA' divide-se em…",
            options: ["BOR-BO-LE-TA", "BORB-OLETA", "BO-RBO-LETA", "BORBO-LETA"],
            answerIndex: 0,
          },
          {
            prompt: "Qual palavra tem 3 sílabas?",
            options: ["SOL", "MAR", "BANANA", "PÃO"],
            answerIndex: 2,
          },
          {
            prompt: "Monta a palavra MO-CHI-LA pelas sílabas!",
            kind: "order",
            sequence: ["MO", "CHI", "LA"],
            explanation: "MO + CHI + LA = MOCHILA! Cada pedacinho com vogal é uma sílaba.",
          },
          {
            prompt: "Monta 'BORBOLETA' pelas sílabas!",
            kind: "order",
            sequence: ["BOR", "BO", "LE", "TA"],
            hint: "Diz devagarinho: bor… bo… le… ta!",
          },
        ],
      },
      {
        id: "pt-rimas",
        title: "Rimas e Sons",
        emoji: "🎤",
        grade: 1,
        questions: [
          {
            prompt: "Qual palavra rima com 'GATO'?",
            options: ["CÃO", "PRATO", "MESA", "LIVRO"],
            answerIndex: 1,
          },
          {
            prompt: "Qual rima com 'SOL'?",
            options: ["LUA", "FAROL", "CASA", "FLOR"],
            answerIndex: 1,
          },
          {
            prompt: "Qual rima com 'MAR'?",
            options: ["RIO", "PESCAR", "ÁGUA", "PEIXE"],
            answerIndex: 1,
          },
          {
            prompt: "Qual rima com 'BALÃO'?",
            options: ["FAZENDA", "MÃO", "VERDE", "BOLA"],
            answerIndex: 1,
            explanation: "BALÃO e MÃO terminam no mesmo som: -ão!",
          },
          {
            prompt: "Qual rima com 'FLOR'?",
            options: ["DOR", "SOL", "CASA", "PÉ"],
            answerIndex: 0,
            explanation: "FLOR e DOR terminam no mesmo som: -or!",
          },
        ],
      },
      {
        id: "pt-alfabeto",
        title: "O Alfabeto",
        emoji: "🔡",
        grade: 1,
        questions: [
          {
            prompt: "Quantas letras tem o alfabeto?",
            options: ["23", "26", "20", "30"],
            answerIndex: 1,
            explanation: "O alfabeto tem 26 letras, de A a Z!",
          },
          {
            prompt: "Qual é a primeira letra do alfabeto?",
            options: ["Z", "A", "M", "B"],
            answerIndex: 1,
          },
          {
            prompt: "Qual é a última letra do alfabeto?",
            options: ["X", "S", "Z", "R"],
            answerIndex: 2,
            explanation: "O Z é a última letra: …X, Y, Z!",
          },
          {
            prompt: "Que letra vem depois do C?",
            options: ["D", "B", "E", "A"],
            answerIndex: 0,
            explanation: "A, B, C… e depois vem o D!",
          },
          {
            prompt: "Põe as letras pela ordem!",
            kind: "order",
            sequence: ["M", "N", "O"],
            hint: "Canta o alfabeto devagarinho…",
          },
          {
            prompt: "A palavra 'GATO' começa por que letra?",
            options: ["T", "G", "O", "A"],
            answerIndex: 1,
          },
        ],
      },
      {
        id: "pt-palavras",
        title: "Ler Palavras",
        emoji: "🧩",
        grade: 1,
        questions: [
          {
            prompt: "Como se lê: P-A-T-O?",
            options: ["PATO", "POTA", "TAPA", "PADO"],
            answerIndex: 0,
          },
          {
            prompt: "Completa: B_LA (uma bola para jogar)",
            options: ["O", "I", "U", "E"],
            answerIndex: 0,
            explanation: "B-O-L-A: bola!",
          },
          {
            prompt: "Que palavra é um animal?",
            options: ["CASA", "GATO", "BOLO", "MESA"],
            answerIndex: 1,
            explanation: "O gato é um animal — miau!",
          },
          {
            prompt: "Qual palavra começa por MA-?",
            options: ["MESA", "MALA", "BOLA", "PATO"],
            answerIndex: 1,
          },
          {
            prompt: "A palavra 'SOL' tem 3 letras.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
            explanation: "S-O-L: três letras, como três raios!",
          },
          {
            prompt: "Como se escreve a palavra do bicho que late?",
            options: ["CACHORRO", "CATXORRO", "CAXORO", "KACHORRO"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "pt-frases",
        title: "Ler Frases",
        emoji: "📖",
        grade: 1,
        questions: [
          {
            prompt: "Toda frase começa por…",
            options: ["letra minúscula", "letra maiúscula", "número", "ponto"],
            answerIndex: 1,
            explanation: "Toda frase começa com letra maiúscula: «O gato dorme.»",
          },
          {
            prompt: "Como termina uma frase que conta algo?",
            options: ["Com ponto (.)", "Com vírgula (,)", "Sem nada", "Com asterisco"],
            answerIndex: 0,
          },
          {
            prompt: "Põe as palavras na ordem certa!",
            kind: "order",
            sequence: ["O", "gato", "bebe", "leite"],
            hint: "Quem faz a ação vem primeiro: o gato…",
            explanation: "«O gato bebe leite» — frase completa!",
          },
          {
            prompt: "Que frase está certa?",
            options: ["o pato nada.", "O pato nada.", "o Pato nada", "O pato Nada."],
            answerIndex: 1,
          },
          {
            prompt: "Completa a frase: A bola é ___ Azul.",
            options: ["do", "da", "de", "das"],
            answerIndex: 1,
            explanation: "A bola é DA cor azul — «da» acompanha «bola» (feminino).",
          },
        ],
      },
      {
        id: "pt-categorias",
        title: "Juntar Palavras",
        emoji: "🗂️",
        grade: 1,
        questions: [
          {
            prompt: "Qual NÃO é uma fruta?",
            options: ["MAÇÃ", "BANANA", "CENOURA", "PERA"],
            answerIndex: 2,
            explanation: "A cenoura é um legume — cresce debaixo da terra!",
          },
          {
            prompt: "Qual NÃO é um animal?",
            options: ["CAVALO", "COELHO", "CADEIRA", "GALINHA"],
            answerIndex: 2,
          },
          {
            prompt: "Frutas e legumes são…",
            options: ["comidas saudáveis", "brinquedos", "animais", "roupas"],
            answerIndex: 0,
          },
          {
            prompt: "Põe em ordem: do menor para o maior!",
            kind: "order",
            sequence: ["FORMIGA", "GATO", "CAVALO"],
            hint: "Pensa no tamanho de cada bicho!",
          },
          {
            prompt: "Qual é um meio de transporte?",
            options: ["BICICLETA", "COLHER", "ALMOFADA", "TELHA"],
            answerIndex: 0,
          },
        ],
      },
      // 2.º ano
      {
        id: "pt-singular-plural",
        title: "Singular e Plural",
        emoji: "✏️",
        grade: 2,
        questions: [
          {
            prompt: "Plural de 'GATO' é…",
            options: ["GATA", "GATOS", "GATINHO", "GATÃO"],
            answerIndex: 1,
          },
          {
            prompt: "Plural de 'PÃO' é…",
            options: ["PÃOS", "PÃES", "PÃEIS", "PANS"],
            answerIndex: 1,
            explanation: "Palavras terminadas em -ÃO mudam para -ÕES: pão → pães.",
          },
          {
            prompt: "Singular de 'FLORES' é…",
            options: ["FLOR", "FLORZINHA", "FLORA", "FLORI"],
            answerIndex: 0,
          },
          {
            prompt: "Plural de 'ANIMAL' é…",
            options: ["ANIMALS", "ANIMAIS", "ANIMALES", "ANIMAES"],
            answerIndex: 1,
            explanation: "Terminadas em -AL mudam para -AIS: animal → animais.",
          },
        ],
      },
      {
        id: "pt-masc-fem",
        title: "Masculino e Feminino",
        emoji: "♀️",
        grade: 2,
        questions: [
          {
            prompt: "Feminino de 'MENINO'?",
            options: ["MENINA", "MENININHO", "MENINHA", "MENINETE"],
            answerIndex: 0,
          },
          {
            prompt: "Feminino de 'CÃO'?",
            options: ["CÃA", "CADELA", "CÃOZINHA", "CÃNINA"],
            answerIndex: 1,
            explanation: "Há palavras que mudam por completo: cão → cadela!",
          },
          {
            prompt: "Masculino de 'GALINHA'?",
            options: ["GALINHO", "GALO", "PINTO", "PATO"],
            answerIndex: 1,
          },
          {
            prompt: "Feminino de 'AVÔ'?",
            options: ["AVÓ", "AVOA", "AVINHA", "AVÔA"],
            answerIndex: 0,
            explanation: "Só o acento muda: avô → avó!",
          },
          {
            prompt: "Masculino de 'ÉGUA'?",
            options: ["CAVALO", "ÉGUO", "CAVALETA", "ÉGUE"],
            answerIndex: 0,
            explanation: "Égua é a fêmea; o macho é o cavalo.",
          },
        ],
      },
      {
        id: "pt-digramas",
        title: "CH, LH, NH",
        emoji: "🔗",
        grade: 2,
        questions: [
          {
            prompt: "Qual palavra tem CH?",
            options: ["CHAVE", "CASA", "CAMA", "COPO"],
            answerIndex: 0,
            explanation: "CH-AVE: o CH faz um som só, como em chimarrão!",
          },
          {
            prompt: "Qual palavra tem LH?",
            options: ["TELHA", "TELA", "TALA", "TULA"],
            answerIndex: 0,
          },
          {
            prompt: "O NH aparece em…",
            options: ["NINHO", "NIDO", "NADA", "NAVIO"],
            answerIndex: 0,
            explanation: "NI-NHO: o NH faz o som de 'nhac'!",
          },
          {
            prompt: "'CARRO' leva RR ou R só?",
            options: ["RR (dois erres)", "R (um erre)", "R com acento", "Nenhum"],
            answerIndex: 0,
          },
          {
            prompt: "Completa: NI_HO (onde o pássaro dorme)",
            options: ["N", "NH", "LH", "CH"],
            answerIndex: 1,
            hint: "NI-N-HO: dois sons juntinhos que fazem 'nhá'!",
          },
          {
            prompt: "Qual palavra NÃO tem CH, LH, NH nem RR?",
            options: ["BOLA", "CHAVE", "TELHA", "CARRO"],
            answerIndex: 0,
            explanation: "B-O-L-A: só letras simples, sem pares especiais!",
          },
        ],
      },
      {
        id: "pt-antonimos",
        title: "Palavras Opostas",
        emoji: "🔄",
        grade: 2,
        questions: [
          {
            prompt: "O oposto de 'GRANDE' é…",
            options: ["PEQUENO", "GIGANTE", "FORTE", "LARGO"],
            answerIndex: 0,
          },
          {
            prompt: "O oposto de 'DIA' é…",
            options: ["MANHÃ", "NOITE", "TARDE", "SOL"],
            answerIndex: 1,
            explanation: "Dia e noite se revezam: quando o sol sai, a lua chega!",
          },
          {
            prompt: "O oposto de 'ALTO' é…",
            options: ["LONGE", "BAIXO", "CLARO", "LEVE"],
            answerIndex: 1,
          },
          {
            prompt: "O oposto de 'RÁPIDO' é…",
            options: ["LENTO", "LEVE", "ALTO", "FORTE"],
            answerIndex: 0,
          },
          {
            prompt: "'Frio' é o oposto de 'quente'.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
          },
          {
            prompt: "O oposto de 'CHEIO' é…",
            options: ["VAZIO", "TODO", "MUITO", "PESADO"],
            answerIndex: 0,
            explanation: "Um copo cheio de água fica vazio quando bebemos tudo!",
          },
        ],
      },
      {
        id: "pt-texto-curto",
        title: "Ler Textos Curtos",
        emoji: "📚",
        grade: 2,
        questions: [
          {
            prompt:
              "Lê: «A Rita tem um coelho chamado Bombo. Ele come cenouras e salta muito.» — Como se chama o coelho?",
            options: ["Rita", "Bombo", "Cenoura", "Salta"],
            answerIndex: 1,
          },
          {
            prompt: "No texto, o coelho come…",
            options: ["maçãs", "cenouras", "biscoitos", "queijo"],
            answerIndex: 1,
          },
          {
            prompt: "No texto, quem tem um coelho?",
            options: ["A Rita", "O Bombo", "A professora", "O vizinho"],
            answerIndex: 0,
          },
          {
            prompt: "Lê: «Hoje está sol. O Tomás vai à praia com a bola.» — Para onde vai o Tomás?",
            options: ["Para a escola", "Para a praia", "Para a cama", "Para o mercado"],
            answerIndex: 1,
          },
          {
            prompt: "No texto do Tomás, como está o tempo?",
            options: ["Chove", "Está sol", "Neva", "Vento forte"],
            answerIndex: 1,
          },
        ],
      },
      {
        id: "pt-escrever",
        title: "Escrever Certo",
        emoji: "✍️",
        grade: 2,
        questions: [
          {
            prompt: "Completa: TA_ELA (para estudar e comer)",
            options: ["B", "M", "V", "P"],
            answerIndex: 0,
            hint: "TA-B-E-LA: onde pomos os livros!",
          },
          {
            prompt: "Como se escreve o bicho que dá lã?",
            options: ["OVELHA", "OVELJA", "OBELHA", "OVELLA"],
            answerIndex: 0,
          },
          {
            prompt: "Qual está escrito certo?",
            options: ["CORAÇÃO", "CORASSÃO", "CORASÃO", "CORACAM"],
            answerIndex: 0,
            explanation: "CORAÇÃO leva Ç e o til no ão!",
          },
          {
            prompt: "Como se escreve o lugar onde aprendemos?",
            options: ["ESCOLA", "ESCORA", "ESQUOLA", "ESCOLTA"],
            answerIndex: 0,
            hint: "ES-CO-LA: onde vão os alunos!",
          },
          {
            prompt: "'MENINA' está escrito certo.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
          },
        ],
      },
      // 3.º ano - Gramática
      {
        id: "pt-substantivos",
        title: "Substantivos",
        emoji: "🏷️",
        grade: 3,
        questions: [
          {
            prompt: "Qual destas palavras é um substantivo?",
            options: ["correr", "bonita", "casa", "depressa"],
            answerIndex: 2,
          },
          {
            prompt: "'Lisboa' é um substantivo…",
            options: ["comum", "próprio", "coletivo", "abstrato"],
            answerIndex: 1,
          },
          {
            prompt: "Qual é um substantivo coletivo?",
            options: ["abelha", "enxame", "mel", "rainha"],
            answerIndex: 1,
          },
          {
            prompt: "'Alegria' é um substantivo…",
            options: ["concreto", "abstrato", "próprio", "coletivo"],
            answerIndex: 1,
          },
        ],
      },
      {
        id: "pt-adjetivos",
        title: "Adjetivos",
        emoji: "✨",
        grade: 3,
        questions: [
          {
            prompt: "Qual destas é um adjetivo?",
            options: ["mesa", "rápido", "saltar", "três"],
            answerIndex: 1,
          },
          {
            prompt: "Em 'casa grande', 'grande' é…",
            options: ["substantivo", "verbo", "adjetivo", "advérbio"],
            answerIndex: 2,
          },
          {
            prompt: "Qualidade de 'corajoso' é…",
            options: ["coragem", "medroso", "lento", "alto"],
            answerIndex: 0,
          },
          {
            prompt: "Em 'gato preto', a palavra 'preto' é…",
            options: ["substantivo", "verbo", "adjetivo", "número"],
            answerIndex: 2,
            explanation: "'Preto' diz como é o gato — uma qualidade. É um adjetivo!",
          },
          {
            prompt: "O contrário de 'ALTO' é…",
            options: ["grande", "baixo", "longe", "forte"],
            answerIndex: 1,
            explanation: "Adjetivos opostos: alto ↔ baixo, como uma girafa e um rato.",
          },
        ],
      },
      {
        id: "pt-verbos",
        title: "Verbos no Presente",
        emoji: "🏃",
        grade: 3,
        questions: [
          {
            prompt: "'Eu ___ um livro.' (ler)",
            options: ["lê", "leio", "lemos", "lêem"],
            answerIndex: 1,
          },
          {
            prompt: "'Tu ___ à escola.' (ir)",
            options: ["vou", "vais", "vai", "vamos"],
            answerIndex: 1,
          },
          {
            prompt: "'Nós ___ futebol.' (jogar)",
            options: ["jogo", "jogas", "jogam", "jogamos"],
            answerIndex: 3,
          },
          {
            prompt: "'Eles ___ felizes.' (ser)",
            options: ["é", "somos", "são", "sou"],
            answerIndex: 2,
          },
        ],
      },
      // 4.º ano
      {
        id: "pt-pronomes",
        title: "Pronomes Pessoais",
        emoji: "👥",
        grade: 4,
        questions: [
          {
            prompt: "Pronome para 'a Maria'?",
            options: ["ele", "ela", "tu", "nós"],
            answerIndex: 1,
          },
          {
            prompt: "Pronome para 'eu e o João'?",
            options: ["eles", "vós", "nós", "vocês"],
            answerIndex: 2,
          },
          {
            prompt: "'___ comprou um livro.' (a Ana)",
            options: ["Ele", "Ela", "Eles", "Tu"],
            answerIndex: 1,
          },
          {
            prompt: "Pronome para 'tu e eu'?",
            options: ["eles", "nós", "vós", "ela"],
            answerIndex: 1,
            explanation: "Quando falo comigo + tu = nós!",
          },
          {
            prompt: "'___ vão ao parque.' (o João e a Ana)",
            options: ["Nós", "Eles", "Eu", "Tu"],
            answerIndex: 1,
            explanation: "Duas outras pessoas de que se fala = eles.",
          },
        ],
      },
      {
        id: "pt-pontuacao",
        title: "Pontuação",
        emoji: "❗",
        grade: 4,
        questions: [
          {
            prompt: "Que sinal usamos numa pergunta?",
            options: [".", "?", "!", ","],
            answerIndex: 1,
          },
          { prompt: "Que sinal mostra surpresa?", options: [".", "?", "!", ":"], answerIndex: 2 },
          {
            prompt: "Para separar palavras numa lista usamos…",
            options: ["ponto", "vírgula", "traço", "parêntesis"],
            answerIndex: 1,
          },
          {
            prompt: "O que mostra o '!' em 'Corre!'?",
            options: ["Uma pergunta", "Força ou surpresa", "Uma lista", "O fim de um texto"],
            answerIndex: 1,
            explanation: "O ponto de exclamação dá energia: susto, alegria ou ordem!",
          },
          {
            prompt: "Onde colocamos o ponto final?",
            options: ["No meio da frase", "No fim da frase", "Antes das palavras", "Nunca se usa"],
            answerIndex: 1,
            explanation: "O ponto final descansa a frase: diz 'acabou aqui'.",
          },
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
        id: "mat-contar",
        title: "Contar até 20",
        emoji: "🔢",
        grade: 1,
        questions: [
          { prompt: "Que número vem depois do 7?", options: ["6", "8", "9", "10"], answerIndex: 1 },
          {
            prompt: "Quantos dedos tens em duas mãos?",
            options: ["8", "9", "10", "12"],
            answerIndex: 2,
          },
          {
            prompt: "Que número vem antes do 15?",
            options: ["13", "14", "16", "17"],
            answerIndex: 1,
          },
          {
            prompt: "Conta as maçãs!",
            kind: "count",
            visual: { emoji: "🍎", groups: 1, perGroup: 5 },
            options: ["4", "5", "6", "7"],
            answerIndex: 1,
            hint: "Aponta para cada maçã e conta em voz alta!",
          },
          {
            prompt: "Conta os peixinhos!",
            kind: "count",
            visual: { emoji: "🐟", groups: 2, perGroup: 3 },
            options: ["5", "6", "7", "8"],
            answerIndex: 1,
            explanation: "2 grupos de 3: 3 + 3 = 6 peixinhos!",
          },
          {
            prompt: "Põe os números do menor para o maior!",
            kind: "order",
            sequence: ["3", "7", "10"],
          },
          {
            prompt: "Depois do 9 vem o 10.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
            explanation: "Conta: 6, 7, 8, 9… e depois vem o 10!",
          },
        ],
      },
      {
        id: "mat-somas",
        title: "Somas Simples",
        emoji: "➕",
        grade: 1,
        questions: [
          {
            prompt: "2 + 3 = ?",
            options: ["4", "5", "6", "7"],
            answerIndex: 1,
            explanation: "Começa no 2 e conta 3 passos: 3, 4, 5!",
          },
          { prompt: "7 + 4 = ?", options: ["10", "11", "12", "13"], answerIndex: 1 },
          { prompt: "9 + 6 = ?", options: ["14", "15", "16", "17"], answerIndex: 1 },
          { prompt: "10 + 10 = ?", options: ["15", "20", "25", "100"], answerIndex: 1 },
          {
            prompt: "2 grupos de 4 estrelas — quantas ao todo?",
            kind: "count",
            visual: { emoji: "⭐", groups: 2, perGroup: 4 },
            options: ["6", "7", "8", "9"],
            answerIndex: 2,
            explanation: "4 + 4 = 8 estrelas. Conta tudo junto!",
          },
        ],
      },
      {
        id: "mat-ordem",
        title: "Ordem dos Números",
        emoji: "📶",
        grade: 1,
        questions: [
          {
            prompt: "Qual é o MENOR número?",
            options: ["9", "4", "7", "6"],
            answerIndex: 1,
            explanation: "Entre 9, 4, 7 e 6, o menor é o 4!",
          },
          {
            prompt: "Qual é o MAIOR número?",
            options: ["5", "8", "2", "6"],
            answerIndex: 1,
          },
          {
            prompt: "Põe do menor para o maior!",
            kind: "order",
            sequence: ["2", "5", "9"],
            hint: "Começa pelo número mais pequeno!",
          },
          {
            prompt: "Põe do maior para o menor!",
            kind: "order",
            sequence: ["10", "6", "3"],
            hint: "Agora é ao contrário: o maior primeiro!",
          },
          {
            prompt: "Que número vem entre o 4 e o 6?",
            options: ["3", "5", "7", "8"],
            answerIndex: 1,
            explanation: "4, 5, 6 — o 5 está no meio!",
          },
          {
            prompt: "O 7 é maior do que o 3.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "mat-formas-1",
        title: "Formas Geométricas",
        emoji: "🔷",
        grade: 1,
        questions: [
          {
            prompt: "Que forma é redonda como uma roda?",
            options: ["Círculo", "Quadrado", "Triângulo", "Retângulo"],
            answerIndex: 0,
            explanation: "O círculo não tem pontas — roda que nem a roda da bicicleta!",
          },
          {
            prompt: "Quantos lados tem um triângulo?",
            options: ["2", "3", "4", "5"],
            answerIndex: 1,
          },
          {
            prompt: "Quantos lados tem um quadrado?",
            options: ["3", "4", "5", "6"],
            answerIndex: 1,
            explanation: "O quadrado tem 4 lados iguais — como o ladrilho do chão!",
          },
          {
            prompt: "A porta de casa parece uma…",
            options: ["bola", "porta com forma de retângulo", "pirâmide", "estrela"],
            answerIndex: 1,
          },
          {
            prompt: "Um triângulo é igual a um quadrado.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "Não! O triângulo tem 3 lados, o quadrado tem 4.",
          },
          {
            prompt: "Que objeto é um círculo?",
            options: ["Uma moeda", "Um livro fechado", "Uma porta", "Uma janela quadrada"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "mat-dobro",
        title: "Dobro e Metade",
        emoji: "✌️",
        grade: 1,
        questions: [
          {
            prompt: "O dobro de 2 é…",
            options: ["3", "4", "5", "6"],
            answerIndex: 1,
            explanation: "Dobro = duas vezes: 2 + 2 = 4!",
          },
          {
            prompt: "O dobro de 5 é…",
            options: ["8", "9", "10", "12"],
            answerIndex: 2,
          },
          {
            prompt: "A metade de 4 é…",
            options: ["1", "2", "3", "4"],
            answerIndex: 1,
            explanation: "Parte em dois grupos iguais: 2 e 2!",
          },
          {
            prompt: "A metade de 10 é…",
            options: ["4", "5", "6", "8"],
            answerIndex: 1,
          },
          {
            prompt: "Conta os patinhos e diz o dobro!",
            kind: "count",
            visual: { emoji: "🦆", groups: 1, perGroup: 3 },
            options: ["3", "5", "6", "9"],
            answerIndex: 2,
            hint: "3 patinhos… e mais 3 patinhos!",
          },
          {
            prompt: "A metade de 6 é 3.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "mat-comparar",
        title: "Maior, Menor ou Igual",
        emoji: "⚖️",
        grade: 1,
        questions: [
          {
            prompt: "5 ___ 3 — que sinal falta?",
            options: [">", "<", "=", "+ "],
            answerIndex: 0,
            explanation: "5 é maior que 3: usamos o sinal >!",
          },
          {
            prompt: "2 ___ 8 — que sinal falta?",
            options: [">", "<", "=", "−"],
            answerIndex: 1,
          },
          {
            prompt: "6 ___ 6 — que sinal falta?",
            options: [">", "<", "=", "×"],
            answerIndex: 2,
            explanation: "São iguais: 6 = 6!",
          },
          {
            prompt: "O 9 é menor do que o 4.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "Não! 9 vem depois do 4 na contagem, então é maior.",
          },
          {
            prompt: "Quantas bolas há ao todo?",
            kind: "count",
            visual: { emoji: "⚽", groups: 2, perGroup: 4 },
            options: ["4 bolas", "8 bolas", "2 bolas", "6 bolas"],
            answerIndex: 1,
            hint: "Conta todos os emojis!",
          },
        ],
      },
      // 2.º ano
      {
        id: "mat-subtracoes",
        title: "Subtrações",
        emoji: "➖",
        grade: 2,
        questions: [
          {
            prompt: "10 − 4 = ?",
            options: ["5", "6", "7", "8"],
            answerIndex: 1,
            explanation: "Do 10, conta para trás 4 passos: 9, 8, 7, 6!",
          },
          { prompt: "15 − 7 = ?", options: ["7", "8", "9", "10"], answerIndex: 1 },
          { prompt: "20 − 11 = ?", options: ["8", "9", "10", "11"], answerIndex: 1 },
          {
            prompt: "10 − 10 = 0.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
            explanation: "Se tiras tudo, não fica nada: 0!",
          },
        ],
      },
      {
        id: "mat-tabuada-2",
        title: "Tabuada do 2",
        emoji: "✖️",
        grade: 2,
        questions: [
          {
            prompt: "2 × 3 = ?",
            options: ["5", "6", "7", "8"],
            answerIndex: 1,
            explanation: "2 × 3 são 3 grupos de 2 — conta de 2 em 2: 2, 4, 6!",
          },
          { prompt: "2 × 5 = ?", options: ["7", "10", "12", "15"], answerIndex: 1 },
          { prompt: "2 × 8 = ?", options: ["14", "16", "18", "20"], answerIndex: 1 },
          { prompt: "2 × 10 = ?", options: ["18", "20", "22", "25"], answerIndex: 1 },
          {
            prompt: "3 grupos de 2 olhos — quantos olhos?",
            kind: "count",
            visual: { emoji: "👀", groups: 3, perGroup: 2 },
            options: ["5", "6", "7", "8"],
            answerIndex: 1,
            explanation: "2 × 3 = 6: três grupos, dois olhos em cada.",
          },
        ],
      },
      {
        id: "mat-dezenas",
        title: "Dezenas e Unidades",
        emoji: "🔟",
        grade: 2,
        questions: [
          { prompt: "Quantas dezenas tem 34?", options: ["3", "4", "30", "34"], answerIndex: 0 },
          { prompt: "Em 56, qual é a unidade?", options: ["5", "6", "50", "56"], answerIndex: 1 },
          {
            prompt: "5 dezenas + 7 unidades = ?",
            options: ["12", "57", "75", "507"],
            answerIndex: 1,
          },
          {
            prompt: "Põe do menor para o maior!",
            kind: "order",
            sequence: ["25", "52", "55"],
            hint: "Olha primeiro para a dezena: 2 é menor do que 5.",
            explanation: "25 < 52 < 55 — compara sempre as dezenas primeiro!",
          },
        ],
      },
      {
        id: "mat-dinheiro",
        title: "Dinheiro e Moedas",
        emoji: "🪙",
        grade: 2,
        questions: [
          {
            prompt: "Uma moeda vale 2 e outra vale 1. Quantas tens juntas?",
            options: ["2", "3", "4", "5"],
            answerIndex: 1,
            explanation: "2 + 1 = 3! Juntar moedas é como somar.",
          },
          {
            prompt: "Duas moedas de 5 — quantas ao todo?",
            options: ["7", "10", "15", "25"],
            answerIndex: 1,
          },
          {
            prompt: "Queres comprar um lanche de 6. Tens uma moeda de 5 e uma de 1. Chega?",
            options: [
              "Sim, dá exatamente 6",
              "Não, falta muito",
              "Só se pedir mais",
              "Não sei contar",
            ],
            answerIndex: 0,
            explanation: "5 + 1 = 6 — exato! Sem troco.",
          },
          {
            prompt: "Qual é MAIS dinheiro?",
            options: ["Uma moeda de 10", "Uma moeda de 2", "Uma moeda de 1", "Nenhuma"],
            answerIndex: 0,
          },
          {
            prompt: "Três moedas de 2 fazem…",
            options: ["5", "6", "8", "9"],
            answerIndex: 1,
            hint: "2 + 2 + 2 = …",
          },
          {
            prompt: "Paguei 8 com uma moeda de 10. O troco é…",
            options: ["2", "3", "4", "1"],
            answerIndex: 0,
            explanation: "10 − 8 = 2. O troco volta para o bolso!",
          },
        ],
      },
      {
        id: "mat-horas-1",
        title: "As Horas",
        emoji: "🕐",
        grade: 2,
        questions: [
          {
            prompt: "Quando o ponteiro pequeno está no 3 e o grande no 12, são…",
            options: ["3 horas", "12 horas", "Meia noite", "6 horas"],
            answerIndex: 0,
            explanation: "O ponteiro grande no 12 mostra a hora certa: 3 em ponto!",
          },
          {
            prompt: "Quantas horas tem um dia?",
            options: ["12", "24", "10", "36"],
            answerIndex: 1,
          },
          {
            prompt: "Em que hora do dia tomamos o pequeno-almoço/matabicho?",
            options: [
              "De manhã",
              "À meia-noite",
              "Depois do jantar",
              "Ao meio-dia em ponto de noite",
            ],
            answerIndex: 0,
          },
          {
            prompt: "O ponteiro GRANDE do relógio mostra…",
            options: ["os minutos", "os dias", "os meses", "os anos"],
            answerIndex: 0,
          },
          {
            prompt: "A escola começa às 8 e acaba ao meio-dia. Quantas horas ficas na aula?",
            options: ["2 horas", "3 horas", "4 horas", "5 horas"],
            answerIndex: 2,
            hint: "De 8 a 12: conta de hora em hora!",
          },
        ],
      },
      {
        id: "mat-medidas",
        title: "Medidas",
        emoji: "📏",
        grade: 2,
        questions: [
          {
            prompt: "O que mede a ALTURA de uma porta?",
            options: ["O metro", "O quilo", "O litro", "A hora"],
            answerIndex: 0,
            explanation: "Comprimentos medem-se em metros — com a fita métrica!",
          },
          {
            prompt: "O que se mede em QUILOS?",
            options: ["O peso", "A altura", "A água", "O tempo"],
            answerIndex: 0,
          },
          {
            prompt: "A água da garrafa mede-se em…",
            options: ["litros", "metros", "quilos", "dias"],
            answerIndex: 0,
          },
          {
            prompt: "O que é MAIS pesado?",
            options: ["Um elefante", "Uma pena", "Uma folha", "Uma unha"],
            answerIndex: 0,
          },
          {
            prompt: "Um lápis é mais longo do que um autocarro/machimbombo.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "O autocarro é enorme — o lápis cabe no teu estojo!",
          },
        ],
      },
      {
        id: "mat-problemas-1",
        title: "Pequenos Problemas",
        emoji: "🧠",
        grade: 2,
        questions: [
          {
            prompt: "Tens 3 bolachas e ganhas mais 4. Quantas tens?",
            options: ["6", "7", "8", "5"],
            answerIndex: 1,
            explanation: "3 + 4 = 7 bolachas — que bom lanche!",
          },
          {
            prompt: "Havia 8 pássaros na árvore; 3 voaram. Quantos ficaram?",
            options: ["4", "5", "6", "11"],
            answerIndex: 1,
          },
          {
            prompt: "Ana tem 5 lápis vermelhos e 5 azuis. Quantos lápis tem?",
            options: ["8", "9", "10", "12"],
            answerIndex: 2,
            explanation: "5 + 5 = 10 — metade de cada cor!",
          },
          {
            prompt: "Um pacote tem 10 figurinhas; já colaste 6. Quantas faltam?",
            options: ["3", "4", "5", "6"],
            answerIndex: 1,
            hint: "10 − 6 = …",
          },
          {
            prompt: "Dois amigos têm 2 brinquedos cada. Quantos brinquedos juntos?",
            options: ["2", "3", "4", "6"],
            answerIndex: 2,
          },
        ],
      },
      // 3.º ano - Tabuada e divisões
      {
        id: "mat-tabuada-5",
        title: "Tabuada do 5",
        emoji: "🖐️",
        grade: 3,
        questions: [
          { prompt: "5 × 4 = ?", options: ["15", "20", "25", "30"], answerIndex: 1 },
          { prompt: "5 × 7 = ?", options: ["30", "35", "40", "45"], answerIndex: 1 },
          { prompt: "5 × 9 = ?", options: ["40", "45", "50", "55"], answerIndex: 1 },
          {
            prompt: "5 × 2 = ?",
            options: ["8", "10", "12", "15"],
            answerIndex: 1,
            hint: "Conta de 5 em 5: 5, 10!",
          },
          {
            prompt: "5 × 6 = ?",
            options: ["25", "30", "35", "40"],
            answerIndex: 1,
            explanation: "De 5 em 5, seis vezes: 5, 10, 15, 20, 25, 30!",
          },
        ],
      },
      {
        id: "mat-divisoes",
        title: "Divisões Simples",
        emoji: "➗",
        grade: 3,
        questions: [
          {
            prompt: "10 ÷ 2 = ?",
            options: ["3", "4", "5", "6"],
            answerIndex: 2,
            hint: "Quantas vezes o 2 cabe no 10?",
          },
          { prompt: "12 ÷ 3 = ?", options: ["3", "4", "5", "6"], answerIndex: 1 },
          { prompt: "20 ÷ 4 = ?", options: ["3", "4", "5", "6"], answerIndex: 2 },
          { prompt: "18 ÷ 2 = ?", options: ["7", "8", "9", "10"], answerIndex: 2 },
          {
            prompt: "Se 4 amigos partilham 16 berlindes, quantos para cada um?",
            options: ["3", "4", "5", "6"],
            answerIndex: 1,
          },
          {
            prompt: "16 balas em 4 sacos iguais — quantas balas em cada saco?",
            kind: "count",
            visual: { emoji: "🍬", groups: 4, perGroup: 4 },
            options: ["2", "3", "4", "8"],
            answerIndex: 2,
            hint: "Conta só as balas de um saco!",
            explanation: "16 ÷ 4 = 4: quatro sacos, quatro balas em cada.",
          },
        ],
      },
      {
        id: "mat-tabuada-mista",
        title: "Tabuada Mista (3, 4, 5)",
        emoji: "🎯",
        grade: 3,
        questions: [
          { prompt: "3 × 6 = ?", options: ["15", "18", "21", "24"], answerIndex: 1 },
          { prompt: "4 × 7 = ?", options: ["24", "28", "32", "36"], answerIndex: 1 },
          { prompt: "5 × 6 = ?", options: ["25", "30", "35", "40"], answerIndex: 1 },
          { prompt: "4 × 9 = ?", options: ["32", "36", "40", "44"], answerIndex: 1 },
        ],
      },
      // 4.º ano - Frações
      {
        id: "mat-fracoes-intro",
        title: "Frações: o que são?",
        emoji: "🍕",
        grade: 4,
        questions: [
          {
            prompt: "Se cortar uma piza em 4 partes iguais, cada parte é…",
            options: ["1/2", "1/3", "1/4", "1/8"],
            answerIndex: 2,
          },
          {
            prompt: "1/2 significa…",
            options: ["uma parte de duas", "duas partes", "metade de nada", "um e dois"],
            answerIndex: 0,
          },
          {
            prompt: "Em 3/5, o número 5 chama-se…",
            options: ["numerador", "denominador", "divisor", "dividendo"],
            answerIndex: 1,
          },
          {
            prompt: "Em 3/5, o número 3 chama-se…",
            options: ["numerador", "denominador", "fração", "resto"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "mat-fracoes-comparar",
        title: "Comparar Frações",
        emoji: "⚖️",
        grade: 4,
        questions: [
          { prompt: "Qual é maior?", options: ["1/2", "1/4", "são iguais", "1/8"], answerIndex: 0 },
          {
            prompt: "Quantos quartos formam 1 inteiro?",
            options: ["2", "3", "4", "5"],
            answerIndex: 2,
          },
          { prompt: "1/2 é igual a…", options: ["2/4", "1/4", "3/4", "4/4"], answerIndex: 0 },
          {
            prompt: "Comi 3/8 de bolo. Sobrou…",
            options: ["3/8", "5/8", "8/8", "1/8"],
            answerIndex: 1,
          },
        ],
      },
      {
        id: "mat-tabuada-7",
        title: "Tabuada do 7",
        emoji: "🎰",
        grade: 4,
        questions: [
          { prompt: "7 × 6 = ?", options: ["42", "48", "49", "56"], answerIndex: 0 },
          { prompt: "7 × 8 = ?", options: ["54", "56", "63", "64"], answerIndex: 1 },
          { prompt: "7 × 9 = ?", options: ["56", "63", "72", "81"], answerIndex: 1 },
          {
            prompt: "7 × 3 = ?",
            options: ["18", "21", "24", "27"],
            answerIndex: 1,
            hint: "De 7 em 7: 7, 14, 21!",
          },
          {
            prompt: "7 × 10 = ?",
            options: ["63", "70", "77", "80"],
            answerIndex: 1,
            explanation: "Multiplicar por 10 é só acrescentar um zero: 7 × 10 = 70!",
          },
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
        grade: 1,
        questions: [
          {
            prompt: "Qual é a capital de Portugal?",
            options: ["Porto", "Lisboa", "Coimbra", "Faro"],
            answerIndex: 1,
          },
          {
            prompt: "Quantas cores tem a bandeira portuguesa?",
            options: ["1", "2", "3", "4"],
            answerIndex: 1,
            hint: "Verde e vermelho",
          },
          {
            prompt: "Que rio passa em Lisboa?",
            options: ["Douro", "Tejo", "Mondego", "Guadiana"],
            answerIndex: 1,
          },
          {
            prompt: "Que oceano banha Portugal?",
            options: ["Pacífico", "Índico", "Atlântico", "Ártico"],
            answerIndex: 2,
          },
        ],
      },
      {
        id: "em-escola",
        title: "A Minha Escola",
        emoji: "🏫",
        grade: 1,
        questions: [
          {
            prompt: "Quem ensina na sala de aula?",
            options: ["A professora ou o professor", "O bombeiro", "O piloto", "O padeiro"],
            answerIndex: 0,
            explanation: "Na escola, quem ajuda a aprender é a professora ou o professor!",
          },
          {
            prompt: "Onde guardamos os livros e lápis na escola?",
            options: ["No caderno/lima", "No estojo", "No frigorífico", "No armário da rua"],
            answerIndex: 1,
          },
          {
            prompt: "O que se faz na cantina?",
            options: ["Come-se", "Dorme-se", "Joga-se futebol", "Corta-se o cabelo"],
            answerIndex: 0,
          },
          {
            prompt: "Põe o dia da escola pela ordem!",
            kind: "order",
            sequence: ["Chegar à escola", "Aprender", "Brincar no recreio", "Voltar para casa"],
            hint: "O que vem primeiro: chegar ou voltar?",
          },
          {
            prompt: "Chegar atrasado à aula é bom.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "Chegar à hora mostra respeito pelos amigos e pela professora!",
          },
        ],
      },
      {
        id: "em-animais-casa",
        title: "Animais por Perto",
        emoji: "🐶",
        grade: 1,
        questions: [
          {
            prompt: "Qual destes animais vive em casa connosco?",
            options: ["O cão", "O leão", "O elefante", "A girafa"],
            answerIndex: 0,
            explanation: "Cães e gatos são animais domésticos — vivem com as pessoas!",
          },
          {
            prompt: "Qual animal é selvagem?",
            options: ["Gato", "Vaca", "Leão", "Galinha"],
            answerIndex: 2,
          },
          {
            prompt: "O que precisa o teu cãozinho todos os dias?",
            options: ["Água e comida", "Um telemóvel", "Livros", "Roupas novas"],
            answerIndex: 0,
          },
          {
            prompt: "A vaca dá-nos…",
            options: ["leite", "bijuterias", "papel", "areia"],
            answerIndex: 0,
          },
          {
            prompt: "Põe do menor para o maior!",
            kind: "order",
            sequence: ["Rato", "Coelho", "Cavalo"],
            hint: "Pensa no tamanho de cada bicho!",
          },
        ],
      },
      {
        id: "em-dia-noite",
        title: "Dia e Noite",
        emoji: "🌞",
        grade: 1,
        questions: [
          {
            prompt: "De dia brilha no céu o…",
            options: ["Sol", "Farol", "Lanterna", "Neon"],
            answerIndex: 0,
          },
          {
            prompt: "De noite vemos muitas…",
            options: ["estrelas", "nuvens de chuva", "borboletas", "pessoas na rua"],
            answerIndex: 0,
          },
          {
            prompt: "O que fazemos de noite, deitado?",
            options: ["Dormimos", "Corremos", "Nadamos", "Cozinhamos"],
            answerIndex: 0,
            explanation: "Dormir bem faz crescer e dá energia para o dia!",
          },
          {
            prompt: "Põe o dia pela ordem!",
            kind: "order",
            sequence: ["Manhã", "Tarde", "Noite"],
            hint: "Começa quando o sol nasce!",
          },
          {
            prompt: "A lua sai de dia e o sol sai de noite.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "Ao contrário! O sol ilumina o dia; a lua aparece à noite.",
          },
        ],
      },
      {
        id: "em-higiene",
        title: "Higiene e Saúde",
        emoji: "🧼",
        grade: 1,
        questions: [
          {
            prompt: "Quando temos de lavar as mãos?",
            options: ["Antes de comer", "Só ao domingo", "Nunca", "Só quando chove"],
            answerIndex: 0,
            explanation: "Lavar as mãos com água e sabão afasta os micróbios!",
          },
          {
            prompt: "Quantas vezes por dia escovamos os dentes?",
            options: ["Nenhuma", "Uma só de noite", "De manhã e à noite", "Dez vezes"],
            answerIndex: 2,
          },
          {
            prompt: "Qual lanche é mais saudável?",
            options: ["Uma maçã", "Bolos todos os dias", "Refrescos com açúcar", "Sonhos fritos"],
            answerIndex: 0,
          },
          {
            prompt: "O que fazemos ao tossir ou espirrar?",
            options: [
              "Tapamos com o cotovelo",
              "Tossimos nos amigos",
              "Cantamos",
              "Abraçamos todos",
            ],
            answerIndex: 0,
          },
          {
            prompt: "Tomar banho todos os dias é saudável.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
          },
        ],
      },
      {
        id: "em-corpo",
        title: "O Corpo Humano",
        emoji: "🧍",
        grade: 2,
        questions: [
          { prompt: "Quantos olhos temos?", options: ["1", "2", "3", "4"], answerIndex: 1 },
          {
            prompt: "Que órgão bombeia o sangue?",
            options: ["Pulmão", "Coração", "Estômago", "Cérebro"],
            answerIndex: 1,
          },
          {
            prompt: "Para que servem os pulmões?",
            options: ["Comer", "Respirar", "Pensar", "Andar"],
            answerIndex: 1,
          },
          {
            prompt: "Quantos dentes de leite tem uma criança?",
            options: ["10", "20", "32", "16"],
            answerIndex: 1,
          },
          {
            prompt: "O coração trabalha sem parar, dia e noite.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
            explanation: "O coração bate cerca de 100 mil vezes por dia — nunca descansa!",
          },
        ],
      },
      {
        id: "em-natureza",
        title: "Animais e Plantas",
        emoji: "🌳",
        grade: 2,
        questions: [
          {
            prompt: "Qual destes é um mamífero?",
            options: ["Sardinha", "Águia", "Cão", "Cobra"],
            answerIndex: 2,
          },
          {
            prompt: "As plantas precisam de…",
            options: ["Som", "Sol e água", "Televisão", "Pilhas"],
            answerIndex: 1,
          },
          {
            prompt: "Quantas patas tem uma aranha?",
            options: ["6", "8", "10", "4"],
            answerIndex: 1,
          },
          {
            prompt: "As aranhas são insetos.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "Insetos têm 6 patas — as aranhas têm 8 e são aracnídeos!",
          },
        ],
      },
      {
        id: "em-tempo",
        title: "Estações e Tempo",
        emoji: "🌤️",
        grade: 2,
        questions: [
          { prompt: "Quantas estações tem o ano?", options: ["2", "3", "4", "5"], answerIndex: 2 },
          {
            prompt: "Em que estação caem as folhas?",
            options: ["Primavera", "Verão", "Outono", "Inverno"],
            answerIndex: 2,
          },
          { prompt: "Quantos dias tem uma semana?", options: ["5", "6", "7", "8"], answerIndex: 2 },
          {
            prompt: "Põe as estações do ano pela ordem, a começar na Primavera!",
            kind: "order",
            sequence: ["Primavera", "Verão", "Outono", "Inverno"],
            hint: "Depois da Primavera vem o calor do Verão.",
            explanation: "Primavera → Verão → Outono → Inverno e recomeça!",
          },
        ],
      },
      {
        id: "em-plantas",
        title: "As Plantas",
        emoji: "🌻",
        grade: 2,
        questions: [
          {
            prompt: "Que parte da planta fica debaixo da terra?",
            options: ["A raiz", "A flor", "A folha", "O fruto"],
            answerIndex: 0,
            explanation: "A raiz bebe a água e segura a planta na terra!",
          },
          {
            prompt: "O que as plantas precisam para crescer?",
            options: ["Água e sol", "Bijuterias", "Televisão", "Areia só"],
            answerIndex: 0,
          },
          {
            prompt: "Por que as folhas são importantes?",
            options: ["Apanham a luz do sol", "Fazem barulho", "Guardam lápis", "Nada"],
            answerIndex: 0,
          },
          {
            prompt: "A maçã é o fruto de que planta?",
            options: ["A macieira", "O bananeiro", "A vinha", "O pinheiro"],
            answerIndex: 0,
          },
          {
            prompt: "As plantas ajudam a dar-nos ar fresco.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 0,
            explanation: "Sim! As plantas limpam o ar — por isso há que plantar árvores!",
          },
        ],
      },
      {
        id: "em-agua",
        title: "A Água",
        emoji: "💧",
        grade: 2,
        questions: [
          {
            prompt: "A água com muito frio fica…",
            options: ["Gelo", "Vapor", "Areia", "Sal"],
            answerIndex: 0,
            explanation: "Com frio congela em gelo; com calor vira vapor!",
          },
          {
            prompt: "Como se chama a água que cai da nuvem?",
            options: ["Chuva", "Areia", "Pó", "Fumaça"],
            answerIndex: 0,
          },
          {
            prompt: "Qual é a boa ação para poupar água?",
            options: [
              "Fechar a torneira ao escovar os dentes",
              "Banho com mangueira aberta à toa",
              "Lavar a rua com mangueira",
              "Deixar a torneira a pingar",
            ],
            answerIndex: 0,
          },
          {
            prompt: "Onde vive a maior parte dos peixes?",
            options: ["Na água", "Nas árvores", "No deserto", "Na neve"],
            answerIndex: 0,
          },
          {
            prompt: "Podemos viver sem beber água.",
            kind: "truefalse",
            options: ["Verdadeiro", "Falso"],
            answerIndex: 1,
            explanation: "Não! O corpo precisa de água todos os dias para funcionar.",
          },
        ],
      },
      {
        id: "em-trabalhos",
        title: "Profissões",
        emoji: "👷",
        grade: 2,
        questions: [
          {
            prompt: "Quem cuida de nós quando estamos doentes?",
            options: ["O médico ou a enfermeira", "O pescador", "O motorista", "O jardineiro"],
            answerIndex: 0,
          },
          {
            prompt: "Quem apaga incêndios?",
            options: ["Os bombeiros", "Os pasteleiros", "Os professores", "Os padeiros"],
            answerIndex: 0,
            explanation: "Os bombeiros salvam vidas e apagam fogos — heróis de capacete!",
          },
          {
            prompt: "Quem constrói casas?",
            options: ["O pedreiro e a equipa da obra", "O cantor", "O padeiro", "O médico"],
            answerIndex: 0,
          },
          {
            prompt: "Quem leva o correio até casa?",
            options: ["O carteiro", "O piloto", "O dentista", "O alfaiate"],
            answerIndex: 0,
          },
          {
            prompt: "Põe a visita ao médico pela ordem!",
            kind: "order",
            sequence: [
              "Chegar ao centro de saúde",
              "Falar com o médico",
              "Tomar a vacina",
              "Ir para casa",
            ],
            hint: "Primeiro entra, depois fala, depois toma o cuidado!",
          },
        ],
      },
      {
        id: "em-transportes",
        title: "Transportes",
        emoji: "🚌",
        grade: 2,
        questions: [
          {
            prompt: "Qual transporte anda na ÁGUA?",
            options: ["O barco", "O comboio/trem", "O avião", "A bicicleta"],
            answerIndex: 0,
            explanation: "Barcos e canoas deslizam na água!",
          },
          {
            prompt: "Qual transporte voa?",
            options: ["O avião", "O carro", "O barco", "O camião"],
            answerIndex: 0,
          },
          {
            prompt: "Para atravessar a rua com segurança…",
            options: [
              "Olho para os dois lados",
              "Corro sem olhar",
              "Fecho os olhos",
              "Empurro os amigos",
            ],
            answerIndex: 0,
          },
          {
            prompt: "Onde se anda a pé com segurança?",
            options: ["No passeio", "No meio da estrada", "Na autoestrada", "No túnel"],
            answerIndex: 0,
          },
          {
            prompt: "Põe a viagem pela ordem, da mais lenta para a mais rápida!",
            kind: "order",
            sequence: ["Bicicleta", "Carro", "Avião"],
            hint: "Pedais… rodas… asas!",
          },
        ],
      },
      // 3.º ano
      {
        id: "em-distritos",
        title: "Distritos de Portugal",
        emoji: "🗺️",
        grade: 3,
        questions: [
          {
            prompt: "Quantos distritos tem Portugal continental?",
            options: ["16", "18", "20", "22"],
            answerIndex: 1,
          },
          {
            prompt: "Em que distrito fica o Porto?",
            options: ["Lisboa", "Porto", "Braga", "Aveiro"],
            answerIndex: 1,
          },
          {
            prompt: "Qual é o distrito mais a sul?",
            options: ["Beja", "Faro", "Évora", "Setúbal"],
            answerIndex: 1,
          },
          {
            prompt: "As ilhas dos Açores e Madeira são…",
            options: ["distritos", "regiões autónomas", "países", "cidades"],
            answerIndex: 1,
          },
        ],
      },
      {
        id: "em-sistema-solar",
        title: "O Sistema Solar",
        emoji: "🪐",
        grade: 3,
        questions: [
          {
            prompt: "Quantos planetas tem o Sistema Solar?",
            options: ["7", "8", "9", "10"],
            answerIndex: 1,
          },
          {
            prompt: "Qual é o planeta onde vivemos?",
            options: ["Marte", "Vénus", "Terra", "Júpiter"],
            answerIndex: 2,
          },
          {
            prompt: "Que astro nos dá luz e calor?",
            options: ["Lua", "Sol", "Estrela", "Cometa"],
            answerIndex: 1,
          },
          {
            prompt: "Qual é o satélite natural da Terra?",
            options: ["Sol", "Marte", "Lua", "Saturno"],
            answerIndex: 2,
          },
          {
            prompt: "Põe os planetas pela ordem, do Sol para fora!",
            kind: "order",
            sequence: ["Mercúrio", "Vénus", "Terra"],
            hint: "Mercúrio é o planeta mais perto do Sol.",
            explanation: "Mercúrio, Vénus e depois a Terra — vivemos no 3.º planeta!",
          },
        ],
      },
      // 4.º ano
      {
        id: "em-historia",
        title: "História de Portugal",
        emoji: "🏰",
        grade: 4,
        questions: [
          {
            prompt: "Quem foi o primeiro rei de Portugal?",
            options: ["D. João I", "D. Afonso Henriques", "D. Dinis", "D. Manuel"],
            answerIndex: 1,
          },
          {
            prompt: "Em que ano se fundou Portugal?",
            options: ["1143", "1500", "1640", "1910"],
            answerIndex: 0,
          },
          {
            prompt: "Quem chegou à Índia em 1498?",
            options: [
              "Pedro Álvares Cabral",
              "Vasco da Gama",
              "Fernão de Magalhães",
              "Bartolomeu Dias",
            ],
            answerIndex: 1,
          },
          {
            prompt: "Quem descobriu o Brasil?",
            options: [
              "Vasco da Gama",
              "Pedro Álvares Cabral",
              "Cristóvão Colombo",
              "Fernão Mendes Pinto",
            ],
            answerIndex: 1,
          },
        ],
      },
      {
        id: "em-ambiente",
        title: "Ambiente e Reciclagem",
        emoji: "♻️",
        grade: 4,
        questions: [
          {
            prompt: "Em que ecoponto se coloca o papel?",
            options: ["Amarelo", "Azul", "Verde", "Vermelho"],
            answerIndex: 1,
          },
          {
            prompt: "Em que ecoponto se coloca o vidro?",
            options: ["Amarelo", "Azul", "Verde", "Castanho"],
            answerIndex: 2,
          },
          {
            prompt: "O ecoponto amarelo é para…",
            options: ["vidro", "papel", "plástico e metal", "lixo orgânico"],
            answerIndex: 2,
          },
          {
            prompt: "Qual destas ações ajuda o planeta?",
            options: [
              "deitar lixo no chão",
              "poupar água",
              "deixar luzes acesas",
              "queimar plástico",
            ],
            answerIndex: 1,
          },
        ],
      },
    ],
  },
];

export const SUBJECTS: Subject[] = [...SUBJECTS_CORE, ...SUBJECTS_EXTRA];

// Lições boost (curriculumBoost.ts) — anexadas a cada matéria existente.
// Aparecem no fim do caminho de aprendizagem de cada matéria.
import { BOOST_LESSONS } from "./curriculumBoost";
import { BOOST2_LESSONS } from "./curriculumBoost2";
import { BOOST3_LESSONS } from "./curriculumBoost3";
for (const s of SUBJECTS) {
  const extra = BOOST_LESSONS[s.id];
  if (extra?.length) s.lessons.push(...extra);
  const extra2 = BOOST2_LESSONS[s.id];
  if (extra2?.length) s.lessons.push(...extra2);
  const extra3 = BOOST3_LESSONS[s.id];
  if (extra3?.length) s.lessons.push(...extra3);
}

export const getSubject = (id: string) => SUBJECTS.find((s) => s.id === id);
export const getLesson = (subjectId: string, lessonId: string) =>
  getSubject(subjectId)?.lessons.find((l) => l.id === lessonId);

// ---------------------------------------------------------------------------
// Validador de integridade (só em dev) — apanha dados quebrados ANTES de
// chegarem às crianças: resposta fora do intervalo, IDs duplicados, lições
// finas, perguntas sem opções… Cada violação aparece na consola com prefixo
// [currículo]. Produção não paga nada (o bloco nem executa).
// Auditoria completa em scripts/auditCurriculum.mts (mesmas regras).
// ---------------------------------------------------------------------------
if (import.meta.env.DEV) {
  const problems: string[] = [];
  const globalIds = new Set<string>();
  for (const s of SUBJECTS) {
    for (const l of s.lessons) {
      const tag = `${s.id}/${l.id}`;
      if (globalIds.has(l.id)) problems.push(`ID duplicado: ${tag}`);
      globalIds.add(l.id);
      if (!l.title || !l.emoji) problems.push(`Sem título/emoji: ${tag}`);
      if (!Array.isArray(l.questions) || l.questions.length < 4)
        problems.push(`Menos de 4 perguntas: ${tag} (${l.questions?.length ?? 0})`);
      (l.questions ?? []).forEach((q, i) => {
        if (!q.prompt) problems.push(`Sem prompt: ${tag}[${i}]`);
        if (q.kind === "order") {
          if (!Array.isArray(q.sequence) || q.sequence.length < 3)
            problems.push(`Order inválida (sequence < 3): ${tag}[${i}]`);
        } else if (q.kind === "count") {
          if (!q.visual || q.visual.groups < 1 || q.visual.perGroup < 1)
            problems.push(`Count inválido (visual): ${tag}[${i}]`);
        } else if (!Array.isArray(q.options) || q.options.length < 2) {
          problems.push(`Opções insuficientes: ${tag}[${i}]`);
        } else if (
          q.answerIndex == null ||
          q.answerIndex < 0 ||
          q.answerIndex >= q.options.length
        ) {
          problems.push(`answerIndex fora do intervalo: ${tag}[${i}]`);
        }
      });
    }
  }
  if (problems.length)
    console.error(`[currículo] ${problems.length} problema(s):\n` + problems.join("\n"));
  else console.info(`[currículo] OK — ${SUBJECTS.length} matérias validadas ✔`);
}

export const GRADE_LABEL: Record<GradeLevel, string> = {
  1: "1.º ano",
  2: "2.º ano",
  3: "3.º ano",
  4: "4.º ano",
};
