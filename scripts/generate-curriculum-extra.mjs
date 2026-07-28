// Generate src/lib/curriculumExtra.ts with new subjects + many extra lessons.
import fs from "node:fs";

// Inglês básico — várias lições
const englishLessons = [
  {
    id: "en-saudacoes", title: "Saudações", emoji: "👋", grade: 1,
    questions: [
      ["Como dizes 'Olá'?", "Hello", ["Bye", "Sorry", "Please"]],
      ["Como dizes 'Adeus'?", "Goodbye", ["Hello", "Thanks", "Yes"]],
      ["Como dizes 'Bom dia'?", "Good morning", ["Good night", "Goodbye", "Hi night"]],
      ["Como dizes 'Boa noite'?", "Good night", ["Good morning", "Good day", "Hello"]],
      ["Como dizes 'Por favor'?", "Please", ["Sorry", "Hello", "Yes"]],
      ["Como dizes 'Obrigado'?", "Thank you", ["Sorry", "Please", "Yes"]],
      ["Como dizes 'Desculpa'?", "Sorry", ["Please", "Yes", "No"]],
      ["Como dizes 'Sim'?", "Yes", ["No", "Maybe", "Hi"]],
    ],
  },
  {
    id: "en-cores", title: "Cores", emoji: "🎨", grade: 1,
    questions: [
      ["'Red' é…", "Vermelho", ["Azul", "Verde", "Amarelo"]],
      ["'Blue' é…", "Azul", ["Verde", "Vermelho", "Roxo"]],
      ["'Green' é…", "Verde", ["Azul", "Amarelo", "Preto"]],
      ["'Yellow' é…", "Amarelo", ["Verde", "Branco", "Castanho"]],
      ["'Black' é…", "Preto", ["Branco", "Cinza", "Roxo"]],
      ["'White' é…", "Branco", ["Preto", "Verde", "Castanho"]],
      ["'Orange' é…", "Laranja", ["Roxo", "Rosa", "Castanho"]],
      ["'Pink' é…", "Rosa", ["Laranja", "Roxo", "Azul"]],
    ],
  },
  {
    id: "en-numeros", title: "Números 1–10", emoji: "🔢", grade: 1,
    questions: [
      ["'One' é…", "1", ["2", "3", "10"]],
      ["'Two' é…", "2", ["3", "4", "12"]],
      ["'Three' é…", "3", ["2", "4", "13"]],
      ["'Four' é…", "4", ["5", "14", "40"]],
      ["'Five' é…", "5", ["4", "15", "50"]],
      ["'Six' é…", "6", ["7", "16", "60"]],
      ["'Seven' é…", "7", ["6", "17", "70"]],
      ["'Eight' é…", "8", ["9", "18", "80"]],
      ["'Nine' é…", "9", ["8", "19", "90"]],
      ["'Ten' é…", "10", ["1", "100", "11"]],
    ],
  },
  {
    id: "en-familia", title: "Família", emoji: "👨‍👩‍👧", grade: 2,
    questions: [
      ["'Mother' é…", "Mãe", ["Pai", "Avó", "Tia"]],
      ["'Father' é…", "Pai", ["Mãe", "Avô", "Tio"]],
      ["'Brother' é…", "Irmão", ["Pai", "Tio", "Primo"]],
      ["'Sister' é…", "Irmã", ["Mãe", "Tia", "Prima"]],
      ["'Grandmother' é…", "Avó", ["Mãe", "Tia", "Irmã"]],
      ["'Grandfather' é…", "Avô", ["Pai", "Tio", "Irmão"]],
      ["'Uncle' é…", "Tio", ["Pai", "Avô", "Primo"]],
      ["'Aunt' é…", "Tia", ["Mãe", "Avó", "Prima"]],
    ],
  },
  {
    id: "en-animais", title: "Animais", emoji: "🐾", grade: 2,
    questions: [
      ["'Cat' é…", "Gato", ["Cão", "Pássaro", "Peixe"]],
      ["'Dog' é…", "Cão", ["Gato", "Cavalo", "Vaca"]],
      ["'Horse' é…", "Cavalo", ["Vaca", "Cão", "Porco"]],
      ["'Cow' é…", "Vaca", ["Cavalo", "Cabra", "Ovelha"]],
      ["'Bird' é…", "Pássaro", ["Peixe", "Rato", "Coelho"]],
      ["'Fish' é…", "Peixe", ["Pássaro", "Pato", "Cobra"]],
      ["'Lion' é…", "Leão", ["Tigre", "Urso", "Lobo"]],
      ["'Elephant' é…", "Elefante", ["Girafa", "Hipopótamo", "Rinoceronte"]],
    ],
  },
  {
    id: "en-corpo", title: "Corpo", emoji: "🧍", grade: 3,
    questions: [
      ["'Head' é…", "Cabeça", ["Mão", "Pé", "Olho"]],
      ["'Hand' é…", "Mão", ["Pé", "Braço", "Perna"]],
      ["'Foot' é…", "Pé", ["Mão", "Braço", "Cabeça"]],
      ["'Eye' é…", "Olho", ["Boca", "Nariz", "Orelha"]],
      ["'Mouth' é…", "Boca", ["Olho", "Nariz", "Dente"]],
      ["'Nose' é…", "Nariz", ["Boca", "Orelha", "Olho"]],
      ["'Ear' é…", "Orelha", ["Olho", "Boca", "Cabelo"]],
      ["'Hair' é…", "Cabelo", ["Pele", "Unhas", "Pé"]],
    ],
  },
  {
    id: "en-comida", title: "Comida", emoji: "🍎", grade: 3,
    questions: [
      ["'Apple' é…", "Maçã", ["Pera", "Banana", "Uva"]],
      ["'Bread' é…", "Pão", ["Bolo", "Massa", "Arroz"]],
      ["'Milk' é…", "Leite", ["Sumo", "Água", "Chá"]],
      ["'Water' é…", "Água", ["Leite", "Sumo", "Café"]],
      ["'Cheese' é…", "Queijo", ["Manteiga", "Iogurte", "Pão"]],
      ["'Fish' (comida) é…", "Peixe", ["Carne", "Frango", "Ovo"]],
      ["'Rice' é…", "Arroz", ["Massa", "Pão", "Trigo"]],
      ["'Egg' é…", "Ovo", ["Peixe", "Carne", "Pão"]],
    ],
  },
  {
    id: "en-verbos", title: "Verbos comuns", emoji: "🏃", grade: 4,
    questions: [
      ["'I am' significa…", "Eu sou/estou", ["Tu és", "Ele é", "Nós somos"]],
      ["'You are' significa…", "Tu és/Vocês são", ["Eu sou", "Ele é", "Eles são"]],
      ["'He is' significa…", "Ele é/está", ["Ela é", "Eles são", "Eu sou"]],
      ["'I have' significa…", "Eu tenho", ["Eu sou", "Eu vou", "Eu faço"]],
      ["'I go' significa…", "Eu vou", ["Eu venho", "Eu fico", "Eu sou"]],
      ["'I like' significa…", "Eu gosto", ["Eu odeio", "Eu vejo", "Eu vou"]],
      ["'To eat' significa…", "Comer", ["Beber", "Dormir", "Correr"]],
      ["'To drink' significa…", "Beber", ["Comer", "Saltar", "Falar"]],
      ["'To sleep' significa…", "Dormir", ["Acordar", "Comer", "Andar"]],
      ["'To play' significa…", "Brincar/Jogar", ["Estudar", "Dormir", "Andar"]],
    ],
  },
];

const scienceLessons = [
  {
    id: "ci-estados", title: "Estados da matéria", emoji: "💧", grade: 3,
    questions: [
      ["A água em estado sólido chama-se…", "Gelo", ["Vapor", "Líquido", "Espuma"]],
      ["A água em estado gasoso chama-se…", "Vapor", ["Gelo", "Líquido", "Sumo"]],
      ["A passagem de líquido a gás chama-se…", "Evaporação", ["Solidificação", "Condensação", "Fusão"]],
      ["A passagem de líquido a sólido chama-se…", "Solidificação", ["Fusão", "Evaporação", "Sublimação"]],
      ["A passagem de sólido a líquido chama-se…", "Fusão", ["Evaporação", "Condensação", "Solidificação"]],
      ["A passagem de gás a líquido chama-se…", "Condensação", ["Evaporação", "Fusão", "Sublimação"]],
      ["A água ferve a quantos graus?", "100", ["80", "120", "0"]],
      ["A água congela a quantos graus?", "0", ["10", "-10", "5"]],
    ],
  },
  {
    id: "ci-energia", title: "Energia e forças", emoji: "⚡", grade: 4,
    questions: [
      ["A força que nos prende ao chão é…", "Gravidade", ["Magnetismo", "Atrito", "Pressão"]],
      ["O atrito impede que…", "Os corpos deslizem livremente", ["A luz passe", "O som ouça", "A água caia"]],
      ["O sol é uma fonte de…", "Energia", ["Comida", "Água", "Som"]],
      ["A eletricidade chega a casa pelos…", "Fios", ["Tubos", "Canos", "Vidros"]],
      ["Os ímans atraem objetos de…", "Ferro", ["Madeira", "Vidro", "Plástico"]],
      ["O som propaga-se em…", "Ondas", ["Linhas", "Cubos", "Pontos"]],
      ["A luz viaja em…", "Linha reta", ["Curvas", "Espirais", "Quadrados"]],
      ["Energia eléctrica medida em…", "Volts", ["Litros", "Metros", "Graus"]],
    ],
  },
  {
    id: "ci-plantas", title: "Plantas", emoji: "🌱", grade: 2,
    questions: [
      ["Para crescer as plantas precisam de…", "Sol e água", ["Som e ar", "Pilhas", "Televisão"]],
      ["A parte que segura a planta na terra é…", "Raiz", ["Caule", "Folha", "Flor"]],
      ["A parte que liga raízes a folhas é…", "Caule", ["Flor", "Fruto", "Semente"]],
      ["A reprodução começa na…", "Flor", ["Folha", "Raiz", "Caule"]],
      ["O processo pelo qual as plantas fazem alimento é…", "Fotossíntese", ["Digestão", "Respiração", "Combustão"]],
      ["Que gás absorvem as plantas?", "Dióxido de carbono", ["Hidrogénio", "Hélio", "Néon"]],
      ["Que gás libertam as plantas?", "Oxigénio", ["Dióxido de carbono", "Azoto", "Hidrogénio"]],
      ["A semente cresce até se tornar uma…", "Planta", ["Pedra", "Bicho", "Nuvem"]],
    ],
  },
  {
    id: "ci-animais", title: "Classes de animais", emoji: "🦁", grade: 3,
    questions: [
      ["O cão é um…", "Mamífero", ["Réptil", "Anfíbio", "Ave"]],
      ["A águia é uma…", "Ave", ["Mamífero", "Réptil", "Peixe"]],
      ["A cobra é um…", "Réptil", ["Mamífero", "Anfíbio", "Ave"]],
      ["O sapo é um…", "Anfíbio", ["Réptil", "Mamífero", "Peixe"]],
      ["O salmão é um…", "Peixe", ["Anfíbio", "Réptil", "Ave"]],
      ["A abelha é um…", "Insecto", ["Aracnídeo", "Crustáceo", "Réptil"]],
      ["A aranha é um…", "Aracnídeo", ["Insecto", "Réptil", "Anfíbio"]],
      ["O caranguejo é um…", "Crustáceo", ["Peixe", "Insecto", "Réptil"]],
    ],
  },
  {
    id: "ci-tempo", title: "Tempo atmosférico", emoji: "⛅", grade: 2,
    questions: [
      ["Quando chove muito chama-se…", "Chuva", ["Neve", "Granizo", "Nevoeiro"]],
      ["Pequenos cristais de gelo que caem são…", "Neve", ["Chuva", "Granizo", "Geada"]],
      ["Pedaços maiores de gelo são…", "Granizo", ["Neve", "Chuva", "Nevoeiro"]],
      ["Quando o ar está cheio de gotinhas e quase não se vê é…", "Nevoeiro", ["Vento", "Sol", "Tempestade"]],
      ["O vento é movimento de…", "Ar", ["Água", "Terra", "Som"]],
      ["O arco-íris aparece após…", "Chuva e sol", ["Neve", "Granizo", "Trovoada"]],
      ["O instrumento que mede temperatura é…", "Termómetro", ["Barómetro", "Anemómetro", "Pluviómetro"]],
      ["O instrumento que mede a chuva é…", "Pluviómetro", ["Termómetro", "Bússola", "Régua"]],
    ],
  },
];

const cidadaniaLessons = [
  {
    id: "cid-respeito", title: "Respeito e amizade", emoji: "🤝", grade: 1,
    questions: [
      ["Quando alguém fala devemos…", "Ouvir", ["Interromper", "Ignorar", "Sair"]],
      ["Pedimos as coisas dizendo…", "Por favor", ["Já!", "Quero!", "Toma"]],
      ["Quando recebemos algo dizemos…", "Obrigado", ["Tchau", "Olá", "Mais"]],
      ["Quando erramos dizemos…", "Desculpa", ["Não foi nada", "Não fui eu", "Cala-te"]],
      ["Um bom amigo…", "Apoia e ajuda", ["Goza connosco", "Ignora-nos", "Mente"]],
      ["Bullying é…", "Magoar de propósito", ["Brincar com regras", "Estudar", "Dormir"]],
      ["Se vires bullying deves…", "Avisar um adulto", ["Rir", "Filmar", "Ignorar"]],
    ],
  },
  {
    id: "cid-ambiente", title: "Cuidar do ambiente", emoji: "🌍", grade: 2,
    questions: [
      ["O ecoponto AMARELO é para…", "Plástico e metal", ["Papel", "Vidro", "Pilhas"]],
      ["O ecoponto AZUL é para…", "Papel e cartão", ["Vidro", "Plástico", "Restos"]],
      ["O ecoponto VERDE é para…", "Vidro", ["Papel", "Plástico", "Pilhas"]],
      ["Pilhas usadas vão para…", "Pilhão", ["Lixo comum", "Vidrão", "Papelão"]],
      ["Para poupar água devemos…", "Fechar a torneira ao escovar dentes", ["Lavar pratos com torneira aberta", "Demorar mais no banho", "Regar de dia"]],
      ["Para poupar luz devemos…", "Apagar luzes que não usamos", ["Deixar tudo aceso", "Abrir o frigorífico", "Ligar tudo"]],
      ["Reciclar significa…", "Reaproveitar materiais", ["Deitar fora", "Esquecer", "Esconder"]],
    ],
  },
  {
    id: "cid-seguranca", title: "Segurança", emoji: "🚦", grade: 2,
    questions: [
      ["O semáforo verde para peões significa…", "Atravessar com cuidado", ["Parar", "Correr", "Fugir"]],
      ["O semáforo vermelho significa…", "Parar", ["Andar", "Correr", "Saltar"]],
      ["Antes de atravessar a estrada devemos…", "Olhar para os dois lados", ["Correr", "Olhar para o céu", "Fechar os olhos"]],
      ["Em caso de emergência ligamos…", "112", ["115", "100", "999"]],
      ["No carro usamos…", "Cinto de segurança", ["Capacete", "Chapéu", "Pulseira"]],
      ["De bicicleta usamos…", "Capacete", ["Cachecol", "Casaco", "Mochila"]],
      ["Não falamos com…", "Estranhos", ["Familiares", "Professores", "Amigos"]],
    ],
  },
];

const subjectsExtra = [
  { id: "ingles", name: "Inglês", tagline: "Hello, world!", emoji: "🇬🇧", colorVar: "--pt-portuguese", lessons: englishLessons },
  { id: "ciencias", name: "Ciências", tagline: "Descobre como tudo funciona", emoji: "🔬", colorVar: "--pt-math", lessons: scienceLessons },
  { id: "cidadania", name: "Cidadania", tagline: "Vamos viver bem juntos", emoji: "🌟", colorVar: "--pt-world", lessons: cidadaniaLessons },
];

// Convert to question objects with answerIndex
const toLesson = (l) => ({
  id: l.id, title: l.title, emoji: l.emoji, grade: l.grade,
  questions: l.questions.map(([prompt, correct, distractors]) => {
    const opts = [correct, ...distractors].slice(0, 4);
    // shuffle deterministically
    let s = prompt.length;
    for (let i = opts.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return { prompt, options: opts, answerIndex: opts.indexOf(correct) };
  }),
});

const out = subjectsExtra.map(s => ({ ...s, lessons: s.lessons.map(toLesson) }));

const ts = `// AUTO-GENERATED by scripts/generate-curriculum-extra.mjs
import type { Subject } from "./curriculum";

export const SUBJECTS_EXTRA: Subject[] = ${JSON.stringify(out, null, 2)} as Subject[];
`;
fs.writeFileSync("src/lib/curriculumExtra.ts", ts);
const totalLessons = out.reduce((s, x) => s + x.lessons.length, 0);
const totalQ = out.reduce((s, x) => s + x.lessons.reduce((a, l) => a + l.questions.length, 0), 0);
console.log(`wrote curriculumExtra.ts — ${out.length} subjects, ${totalLessons} lessons, ${totalQ} questions`);
