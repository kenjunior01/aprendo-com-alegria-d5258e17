// quizPais.ts — Quiz do Meu País: perguntas autoradas por região, 3 níveis.
//
// Design pedagógico (padrão Kidoz):
// • Conteúdo 100% regional — a criança joga sobre o SEU país (MZ, AO, BR, PT, CV),
//   com fatos que a escola local também ensina. Nada de copiar banco de terceiros.
// • Níveis enquadrados por idade/classe: Fácil = 1.ª–2.ª classe (6–8 anos),
//   Médio = 3.ª (8–9), Campeão = 4.ª (9–10) — o nome da série segue a região
//   ("classe" em MZ/AO/CV, "ano" em PT/BR).
// • Balanceamento por idade: cada pergunta leva um "d" (1 = leve, 3 = forte).
//   Crianças de 1.ª/2.ª começam pelas mais leves; as grandes, pelas fortes.
// • Desbloqueio: 4+ acertos (de 5) abre o nível seguinte — progresso guardado
//   no dispositivo (localStorage), sem conta obrigatória.
// • Recompensas generosas, nunca punitivas, e ESCALAM com o nível: Campeão
//   paga mais que Fácil. Errar mostra a resposta certa para aprender.
import type { RegionCode } from "@/lib/region";
import { gradeBadge, gradeNoun, REGIONS } from "@/lib/region";
import { shuffled } from "@/lib/utils";

export interface QuizPaisQ {
  level: 1 | 2 | 3;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
  /** Sub-dificuldade dentro do nível (1 = leve, 3 = forte) — usado no balanceamento por idade. */
  d?: 1 | 2 | 3;
}

export const QUIZ_PAIS_PER_LEVEL = 5;
export const QUIZ_PAIS_MAX_LEVEL = 3;

/** Metadados dos níveis — cada um enquadrado na série escolar e idade da criança. */
export const QUIZ_PAIS_LEVELS: {
  level: 1 | 2 | 3;
  nome: string;
  emoji: string;
  desc: string;
  grades: [number, number];
  ages: [number, number];
}[] = [
  {
    level: 1,
    nome: "Fácil",
    emoji: "🌱",
    desc: "Capitais, moedas e símbolos",
    grades: [1, 2],
    ages: [6, 8],
  },
  {
    level: 2,
    nome: "Médio",
    emoji: "🚀",
    desc: "Geografia, música e cultura",
    grades: [3, 3],
    ages: [8, 9],
  },
  {
    level: 3,
    nome: "Campeão",
    emoji: "🏆",
    desc: "História e desafios de mestre",
    grades: [4, 4],
    ages: [9, 10],
  },
];

const q = (
  level: 1 | 2 | 3,
  prompt: string,
  options: [string, string, string, string],
  answerIndex: number,
  d?: 1 | 2 | 3,
): QuizPaisQ => ({ level, prompt, options, answerIndex, ...(d ? { d } : {}) });

/** Regiões com pack próprio (ordem de exibição no seletor). */
export const QUIZ_PAIS_REGIONS: RegionCode[] = ["MZ", "AO", "BR", "PT", "CV"];

// ─── MOÇAMBIQUE (pt-PT) ───
const MZ_PACK: QuizPaisQ[] = [
  q(1, "Qual é a capital de Moçambique?", ["Maputo", "Luanda", "Lisboa", "Harare"], 0),
  q(1, "Qual é a moeda de Moçambique?", ["Metical", "Euro", "Kwanza", "Rand"], 0),
  q(
    1,
    "Que oceano banha a costa de Moçambique?",
    ["Oceano Índico", "Oceano Atlântico", "Oceano Pacífico", "Mar Vermelho"],
    0,
  ),
  q(1, "Qual é a língua oficial de Moçambique?", ["Português", "Espanhol", "Inglês", "Francês"], 0),
  q(
    1,
    "O que mostra a bandeira de Moçambique?",
    [
      "Um livro, uma enxada e um fuzil",
      "Um leão e uma coroa",
      "Uma estrela e um escudo",
      "Uma águia e uma serpente",
    ],
    0,
  ),
  q(1, "Moçambique fica em que continente?", ["África", "Europa", "Ásia", "América"], 0, 1),
  q(
    1,
    "Qual destes pratos é muito popular em Moçambique?",
    ["Xima", "Sushi", "Paella", "Hambúrguer"],
    0,
    1,
  ),
  q(
    1,
    "Como se chamam as pessoas de Moçambique?",
    ["Moçambicanos", "Brasileiros", "Angolanos", "Portugueses"],
    0,
    1,
  ),
  q(
    1,
    "Qual destas cores está na bandeira de Moçambique?",
    ["Verde", "Roxo", "Rosa", "Laranja"],
    0,
    1,
  ),
  q(
    1,
    "Qual destes animais vive nos parques nacionais de Moçambique?",
    ["Elefante", "Panda", "Pinguim", "Camelo"],
    0,
    2,
  ),
  q(
    1,
    "Qual destas frutas é muito produzida em Moçambique?",
    ["Caju", "Morango", "Kiwi", "Cereja"],
    0,
    2,
  ),
  q(1, "Qual destas cidades fica em Moçambique?", ["Beira", "Lisboa", "Luanda", "Praia"], 0, 2),
  q(
    2,
    "Que ilha foi a primeira capital de Moçambique?",
    ["Ilha de Moçambique", "Ilha da Madeira", "Ilha de Zanzibar", "Ilha de Santiago"],
    0,
  ),
  q(2, "Qual é o maior rio que atravessa Moçambique?", ["Zambeze", "Nilo", "Congo", "Okavango"], 0),
  q(2, "A marrabenta é um estilo de…", ["Música e dança", "Comida", "Vestuário", "Pintura"], 0),
  q(
    2,
    "Qual arquipélago tem ilhas paradisíacas no norte de Moçambique?",
    ["Quirimbas", "Açores", "Galápagos", "Maldivas"],
    0,
  ),
  q(
    2,
    "Que país vizinho fica a SUL de Moçambique?",
    ["África do Sul", "Zâmbia", "Tanzânia", "Malawi"],
    0,
  ),
  q(
    2,
    "A cidade da Beira é a capital da província de…",
    ["Sofala", "Maputo", "Gaza", "Tete"],
    0,
    2,
  ),
  q(
    2,
    "Que país vizinho fica a NORTE de Moçambique?",
    ["Tanzânia", "África do Sul", "Essuatíni", "Zimbabué"],
    0,
    2,
  ),
  q(
    2,
    "Qual destes países faz fronteira com Moçambique?",
    ["Malawi", "Madagáscar", "Etiópia", "Quénia"],
    0,
    2,
  ),
  q(
    2,
    "A castanha que Moçambique exporta para o mundo é a castanha de…",
    ["Caju", "Abacate", "Banana", "Coco"],
    0,
    2,
  ),
  q(
    2,
    "O Parque Nacional da Gorongosa é famoso pelos seus…",
    ["Animais selvagens", "Carros antigos", "Arranha-céus", "Campos de neve"],
    0,
    1,
  ),
  q(
    2,
    "Que línguas africanas se falam em Moçambique?",
    ["Macua e Changana", "Zulu e Xhosa", "Suaíli e Amárico", "Francês e Crioulo"],
    0,
    3,
  ),
  q(
    2,
    "As praias do Tofo são famosas pelos mergulhos com…",
    ["Tubarões-baleia", "Leões-marinhos", "Crocodilos", "Cavalos"],
    0,
    2,
  ),
  q(
    3,
    "Qual é a segunda montanha mais alta de Moçambique?",
    ["Monte Namuli", "Monte Kilimanjaro", "Monte Tabaco", "Monte Atlas"],
    0,
  ),
  q(
    3,
    "Quando é o Dia da Independência de Moçambique?",
    ["25 de junho", "11 de novembro", "7 de setembro", "5 de julho"],
    0,
  ),
  q(
    3,
    "Que navegador português chegou a Moçambique em 1498?",
    ["Vasco da Gama", "Bartolomeu Dias", "Pedro Álvares Cabral", "Fernão de Magalhães"],
    0,
  ),
  q(3, "Com quantos países faz fronteira Moçambique?", ["6", "3", "4", "9"], 0),
  q(
    3,
    "Que grande lago fica entre Moçambique e o Malawi?",
    ["Lago Niassa", "Lago Vitória", "Lago Tanganyika", "Lago Kariba"],
    0,
  ),
  q(
    3,
    "Que canal separa Moçambique de Madagáscar?",
    ["Canal de Moçambique", "Canal da Mancha", "Estreito de Gibraltar", "Mar Vermelho"],
    0,
    3,
  ),
  q(
    3,
    "Quem foi o primeiro presidente de Moçambique?",
    ["Samora Machel", "Agostinho Neto", "Joaquim Chissano", "Nelson Mandela"],
    0,
    2,
  ),
  q(3, "Quantos centavos fazem um metical?", ["100", "10", "50", "1000"], 0, 3),
  q(
    3,
    "A grande ponte de Maputo liga a cidade a…",
    ["Katembe", "Matola", "Xai-Xai", "Inhambane"],
    0,
    3,
  ),
  q(
    3,
    "Em que província ficam as Ilhas Quirimbas?",
    ["Cabo Delgado", "Gaza", "Inhambane", "Maputo"],
    0,
    3,
  ),
  q(
    3,
    "Em 2025, Moçambique celebrou quantos anos de independência?",
    ["50", "30", "40", "60"],
    0,
    3,
  ),
  q(
    3,
    "Na língua Changana, “Kanimambo” quer dizer…",
    ["Obrigado", "Bom dia", "Por favor", "Adeus"],
    0,
    2,
  ),
];

// ─── ANGOLA (pt-PT) ───
const AO_PACK: QuizPaisQ[] = [
  q(1, "Qual é a capital de Angola?", ["Luanda", "Maputo", "Praia", "Bissau"], 0),
  q(1, "Qual é a moeda de Angola?", ["Kwanza", "Metical", "Euro", "Naira"], 0),
  q(1, "Qual é a língua oficial de Angola?", ["Português", "Espanhol", "Inglês", "Francês"], 0),
  q(
    1,
    "Que oceano fica a oeste de Angola?",
    ["Oceano Atlântico", "Oceano Índico", "Oceano Pacífico", "Mar Vermelho"],
    0,
  ),
  q(
    1,
    "Qual é o animal símbolo de Angola, que só existe lá?",
    ["Palanca negra gigante", "Elefante", "Girafa", "Panda"],
    0,
  ),
  q(1, "Angola fica em que continente?", ["África", "Europa", "Ásia", "América"], 0, 1),
  q(
    1,
    "Como se chamam as pessoas de Angola?",
    ["Angolanos", "Moçambicanos", "Brasileiros", "Espanhóis"],
    0,
    1,
  ),
  q(
    1,
    "Que cores tem a bandeira de Angola?",
    ["Vermelho e preto", "Azul e branco", "Verde e amarelo", "Laranja e roxo"],
    0,
    2,
  ),
  q(
    1,
    "Qual destes pratos é muito popular em Angola?",
    ["Funje", "Sushi", "Tacos", "Rissol"],
    0,
    2,
  ),
  q(
    1,
    "O kizomba e o semba são…",
    ["Músicas e danças de Angola", "Pratos de comida", "Jogos de bola", "Rios de Angola"],
    0,
    1,
  ),
  q(
    1,
    "Qual destas frutas é muito comum em Angola?",
    ["Manga", "Cereja", "Kiwi", "Framboesa"],
    0,
    1,
  ),
  q(
    1,
    "Qual destes animais vive nas savanas de Angola?",
    ["Elefante", "Urso-polar", "Pinguim", "Alce"],
    0,
    1,
  ),
  q(
    2,
    "O semba, dança de Angola, é avô de que ritmo?",
    ["Samba", "Marrabenta", "Morna", "Tango"],
    0,
  ),
  q(
    2,
    "Como se chama a fortaleza histórica de Luanda?",
    ["Fortaleza de São Miguel", "Torre de Belém", "Fortaleza de Maputo", "Castelo de São Jorge"],
    0,
  ),
  q(2, "Que rio dá o nome à moeda de Angola?", ["Kwanza", "Zambeze", "Congo", "Cubango"], 0),
  q(
    2,
    "As famosas Quedas de Kalandula são…",
    ["Quedas de água", "Montanhas", "Praias", "Desertos"],
    0,
  ),
  q(
    2,
    "Que parque nacional protege a palanca negra?",
    ["Cangandala", "Kruger", "Serengeti", "Etosha"],
    0,
  ),
  q(2, "O deserto do sul de Angola chama-se…", ["Namibe", "Saara", "Kalahari", "Atacama"], 0, 2),
  q(
    2,
    "A cidade do Lobito é conhecida pelo seu…",
    ["Porto marítimo", "Vulcão", "Deserto de gelo", "Zoológico gigante"],
    0,
    2,
  ),
  q(
    2,
    "Em Angola, o “matabicho” é…",
    ["O pequeno-almoço", "O almoço", "O jantar", "Uma dança"],
    0,
    1,
  ),
  q(
    2,
    "A muamba de galinha é…",
    ["Um prato típico de Angola", "Uma dança tradicional", "Um jogo de cartas", "Uma ilha"],
    0,
    1,
  ),
  q(
    2,
    "Qual destas cidades NÃO fica em Angola?",
    ["Maputo", "Huambo", "Benguela", "Lubango"],
    0,
    2,
  ),
  q(
    2,
    "A Ilha de Luanda é famosa pelas suas…",
    ["Praias", "Montanhas com neve", "Minas de diamante", "Geleiras"],
    0,
    2,
  ),
  q(
    2,
    "O kizomba, ritmo angolano, dança-se…",
    ["A dois, bem coladinhos", "Sozinho em linha", "A saltar", "De cabeça para baixo"],
    0,
    1,
  ),
  q(
    3,
    "Quando é o Dia da Independência de Angola?",
    ["11 de novembro", "25 de junho", "7 de setembro", "5 de julho"],
    0,
  ),
  q(
    3,
    "Em África, Angola é um dos maiores produtores de…",
    ["Petróleo", "Trigo", "Arroz", "Aço"],
    0,
  ),
  q(3, "Qual é a província mais a sul de Angola?", ["Cunene", "Cabinda", "Moxico", "Benguela"], 0),
  q(
    3,
    "Quem foi o primeiro presidente de Angola?",
    ["Agostinho Neto", "José Eduardo dos Santos", "Samora Machel", "Nelson Mandela"],
    0,
  ),
  q(
    3,
    "Que país vizinho fica a sul de Angola?",
    ["Namíbia", "Zâmbia", "Botsuana", "África do Sul"],
    0,
  ),
  q(
    3,
    "Qual é a montanha mais alta de Angola?",
    ["Morro do Moco", "Monte Namuli", "Kilimanjaro", "Pico da Neblina"],
    0,
    3,
  ),
  q(
    3,
    "Agostinho Neto, primeiro presidente de Angola, era também…",
    ["Poeta", "Futebolista", "Astronauta", "Arquiteto"],
    0,
    2,
  ),
  q(
    3,
    "Angola é um dos maiores produtores mundiais de…",
    ["Diamantes", "Aço", "Trigo", "Seda"],
    0,
    2,
  ),
  q(
    3,
    "As Quedas de Kalandula ficam na província de…",
    ["Malanje", "Luanda", "Benguela", "Huíla"],
    0,
    3,
  ),
  q(3, "Desde 2024, Angola tem quantas províncias?", ["21", "5", "12", "30"], 0, 3),
  q(
    3,
    "O Caminho de Ferro de Benguela liga o porto do Lobito ao…",
    ["Congo e à Zâmbia", "Brasil e à Argentina", "Marrocos e à Argélia", "Egipto e ao Sudão"],
    0,
    3,
  ),
  q(
    3,
    "A República Democrática do Congo fica a que parte de Angola?",
    ["Norte e leste", "Sul", "Oeste", "Sudoeste"],
    0,
    3,
  ),
];

// ─── BRASIL (pt-BR — só quem joga do Brasil vê) ───
const BR_PACK: QuizPaisQ[] = [
  q(1, "Qual é a capital do Brasil?", ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"], 0),
  q(1, "Qual é a moeda do Brasil?", ["Real", "Peso", "Euro", "Metical"], 0),
  q(
    1,
    "Em que cidade fica o Cristo Redentor?",
    ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
    0,
  ),
  q(
    1,
    "Qual é a maior floresta tropical do mundo, no Brasil?",
    ["Amazônia", "Mata Atlântica", "Cerrado", "Pantanal"],
    0,
  ),
  q(1, "Qual é a língua oficial do Brasil?", ["Português", "Espanhol", "Inglês", "Francês"], 0),
  q(1, "O Brasil fica em que continente?", ["América do Sul", "Europa", "África", "Ásia"], 0, 1),
  q(
    1,
    "Como se chamam as pessoas do Brasil?",
    ["Brasileiros", "Portugueses", "Angolanos", "Italianos"],
    0,
    1,
  ),
  q(1, "O açaí é…", ["Uma fruta brasileira", "Um jogo de futebol", "Uma dança", "Um animal"], 0, 1),
  q(
    1,
    "Qual destes animais só existe no Brasil?",
    ["Mico-leão-dourado", "Leão africano", "Panda gigante", "Elefante"],
    0,
    2,
  ),
  q(
    1,
    "Que cores tem a bandeira do Brasil?",
    ["Verde, amarelo, azul e branco", "Só verde e vermelho", "Azul e laranja", "Preto e branco"],
    0,
    2,
  ),
  q(
    1,
    "O brigadeiro é um doce feito com…",
    ["Leite condensado e chocolate", "Batata e queijo", "Peixe e limão", "Milho verde"],
    0,
    2,
  ),
  q(
    1,
    "Qual destes bichos vive na Amazônia?",
    ["Bicho-preguiça", "Camelo", "Urso-polar", "Rena"],
    0,
    1,
  ),
  q(
    2,
    "Em cima de qual morro fica o Cristo Redentor?",
    ["Corcovado", "Pão de Açúcar", "Urca", "Dois Irmãos"],
    0,
  ),
  q(
    2,
    "A grande festa com samba e desfiles no Rio é o…",
    ["Carnaval", "Rock in Rio", "Réveillon", "Círio de Nazaré"],
    0,
  ),
  q(
    2,
    "Qual é o rio mais famoso da Amazônia?",
    ["Rio Amazonas", "Rio São Francisco", "Rio Tietê", "Rio Paraná"],
    0,
  ),
  q(
    2,
    "Qual destes países faz fronteira com o Brasil?",
    ["Argentina", "Chile", "México", "Cuba"],
    0,
  ),
  q(2, "O Brasil é pentacampeão mundial de…", ["Futebol", "Vôlei", "Natação", "Xadrez"], 0),
  q(
    2,
    "O pão de queijo é comida típica de…",
    ["Minas Gerais", "Amazonas", "Acre", "Roraima"],
    0,
    2,
  ),
  q(2, "Na Festa Junina dança-se…", ["Quadrilha", "Ballet", "Tango", "Breakdance"], 0, 1),
  q(2, "Qual é o maior estado do Brasil?", ["Amazonas", "Bahia", "São Paulo", "Paraná"], 0, 2),
  q(
    2,
    "A capoeira, mistura de luta e dança, nasceu no…",
    ["Brasil", "Japão", "México", "Portugal"],
    0,
    1,
  ),
  q(
    2,
    "O nome “Brasil” vem de…",
    ["Uma árvore: o pau-brasil", "Um rio", "Um rei antigo", "Uma flor"],
    0,
    2,
  ),
  q(
    2,
    "As Cataratas do Iguaçu ficam na fronteira com…",
    ["Argentina", "Chile", "Peru", "Uruguai"],
    0,
    2,
  ),
  q(
    2,
    "O Saci-Pererê é…",
    [
      "Um personagem do folclore brasileiro",
      "Um prato de festa",
      "Um time de futebol",
      "Um rio do Norte",
    ],
    0,
    1,
  ),
  q(
    3,
    "Quando é a Independência do Brasil?",
    ["7 de setembro", "11 de novembro", "25 de junho", "1º de maio"],
    0,
  ),
  q(
    3,
    "Qual cidade foi capital do Brasil antes de Brasília?",
    ["Rio de Janeiro", "São Paulo", "Belo Horizonte", "Curitiba"],
    0,
  ),
  q(3, "Com quantos países da América do Sul o Brasil faz fronteira?", ["10", "5", "7", "8"], 0),
  q(
    3,
    "Qual felino gigante vive no Pantanal?",
    ["Onça-pintada", "Leão", "Tigre-siberiano", "Lince"],
    0,
  ),
  q(
    3,
    "Quem proclamou a Independência do Brasil?",
    ["D. Pedro I", "D. Pedro II", "D. João VI", "Tiradentes"],
    0,
  ),
  q(
    3,
    "Que navegador português chegou ao Brasil em 1500?",
    ["Pedro Álvares Cabral", "Vasco da Gama", "Cristóvão Colombo", "Fernão de Magalhães"],
    0,
    3,
  ),
  q(
    3,
    "Qual foi a PRIMEIRA capital do Brasil?",
    ["Salvador", "Rio de Janeiro", "Brasília", "Ouro Preto"],
    0,
    3,
  ),
  q(3, "Quantas estrelas tem a bandeira do Brasil?", ["27", "10", "50", "5"], 0, 3),
  q(
    3,
    "Quantos estados tem o Brasil (sem contar o Distrito Federal)?",
    ["26", "13", "40", "8"],
    0,
    3,
  ),
  q(
    3,
    "O Cerrado é…",
    ["Um bioma de savanas brasileiro", "Um deserto de areia", "Uma cordilheira", "Um mar interior"],
    0,
    3,
  ),
  q(
    3,
    "Quem liderou o Quilombo dos Palmares?",
    ["Zumbi", "Tiradentes", "D. Pedro I", "Machado de Assis"],
    0,
    3,
  ),
  q(3, "Em que ano foi inaugurada Brasília?", ["1960", "1900", "1950", "1980"], 0, 3),
];

// ─── PORTUGAL (pt-PT) ───
const PT_PACK: QuizPaisQ[] = [
  q(1, "Qual é a capital de Portugal?", ["Lisboa", "Porto", "Madri", "Maputo"], 0),
  q(1, "Qual é a moeda de Portugal?", ["Euro", "Real", "Libra", "Metical"], 0),
  q(
    1,
    "Que torre famosa fica em Lisboa, junto ao rio?",
    ["Torre de Belém", "Torre Eiffel", "Big Ben", "Torre de Pisa"],
    0,
  ),
  q(
    1,
    "Que oceano fica a oeste de Portugal?",
    ["Oceano Atlântico", "Oceano Índico", "Oceano Pacífico", "Mar Vermelho"],
    0,
  ),
  q(1, "Qual é a língua oficial de Portugal?", ["Português", "Espanhol", "Inglês", "Francês"], 0),
  q(1, "Portugal fica em que continente?", ["Europa", "África", "Ásia", "América"], 0, 1),
  q(
    1,
    "Como se chamam as pessoas de Portugal?",
    ["Portugueses", "Brasileiros", "Moçambicanos", "Franceses"],
    0,
    1,
  ),
  q(
    1,
    "O famoso galo de Barcelos é um símbolo de…",
    ["Portugal", "Espanha", "Itália", "Grécia"],
    0,
    1,
  ),
  q(
    1,
    "Cristiano Ronaldo é um famoso…",
    ["Futebolista português", "Cantor de fado", "Ator de cinema", "Escritor"],
    0,
    1,
  ),
  q(1, "Qual destas cidades fica em Portugal?", ["Coimbra", "Luanda", "Maputo", "Praia"], 0, 2),
  q(
    1,
    "O bacalhau é…",
    [
      "Um peixe muito comido em Portugal",
      "Uma dança popular",
      "Um doce de amêndoa",
      "Um jogo tradicional",
    ],
    0,
    1,
  ),
  q(
    1,
    "Que cores tem a bandeira de Portugal?",
    ["Verde e vermelho", "Azul e amarelo", "Laranja e preto", "Roxo e branco"],
    0,
    2,
  ),
  q(2, "Qual é o rio de Lisboa?", ["Tejo", "Douro", "Mondego", "Sado"], 0),
  q(
    2,
    "Os famosos azulejos portugueses são…",
    ["Telhas cerâmicas pintadas", "Doces de amêndoa", "Danças tradicionais", "Barcos de pesca"],
    0,
  ),
  q(
    2,
    "Qual é o doce mais famoso de Portugal?",
    ["Pastel de nata", "Croissant", "Brigadeiro", "Mochi"],
    0,
  ),
  q(2, "Qual é o único país vizinho de Portugal?", ["Espanha", "França", "Itália", "Marrocos"], 0),
  q(
    2,
    "Quais são as ilhas de Portugal?",
    ["Madeira e Açores", "Baleares", "Canárias", "Maldivas"],
    0,
  ),
  q(
    2,
    "Lisboa é conhecida como a cidade das…",
    ["Sete colinas", "Sete pontes", "Sete praças", "Sete ilhas"],
    0,
    2,
  ),
  q(
    2,
    "A Livraria Lello, uma das mais bonitas do mundo, fica no…",
    ["Porto", "Faro", "Évora", "Braga"],
    0,
    3,
  ),
  q(2, "A guitarra portuguesa toca nas canções de…", ["Fado", "Rock", "Samba", "Kizomba"], 0, 2),
  q(2, "O vinho do Porto nasce no vale do rio…", ["Douro", "Tejo", "Mondego", "Sado"], 0, 3),
  q(
    2,
    "A sardinha assada é a estrela das festas de…",
    ["Lisboa", "Bragança", "Évora", "Viseu"],
    0,
    2,
  ),
  q(
    2,
    "A ilha da Madeira fica em que oceano?",
    ["Oceano Atlântico", "Oceano Índico", "Oceano Pacífico", "Mar Mediterrâneo"],
    0,
    2,
  ),
  q(
    2,
    "As calçadas portuguesas são famosas pelos seus…",
    [
      "Desenhos de pedras brancas e pretas",
      "Pisos de gelo",
      "Tapetes de metal",
      "Escadas de madeira",
    ],
    0,
    3,
  ),
  q(
    3,
    "Quem foi o primeiro rei de Portugal?",
    ["D. Afonso Henriques", "D. Dinis", "D. João I", "D. Sebastião"],
    0,
  ),
  q(
    3,
    "Quando é o Dia de Portugal?",
    ["10 de junho", "25 de abril", "5 de outubro", "1º de dezembro"],
    0,
  ),
  q(
    3,
    "Que navegador português chegou à Índia em 1498?",
    ["Vasco da Gama", "Bartolomeu Dias", "Pedro Álvares Cabral", "Fernão de Magalhães"],
    0,
  ),
  q(
    3,
    "Qual é o maior rio que nasce e morre em Portugal?",
    ["Mondego", "Tejo", "Douro", "Guadiana"],
    0,
  ),
  q(
    3,
    "O fado é…",
    ["Música tradicional portuguesa", "Uma dança brasileira", "Um prato típico", "Um jogo popular"],
    0,
  ),
  q(
    3,
    "Qual é a montanha mais alta de Portugal continental?",
    ["Serra da Estrela", "Serra de Sintra", "Serra de Monchique", "Serra da Arrábida"],
    0,
    3,
  ),
  q(
    3,
    "O Pico, o ponto mais alto de Portugal, fica nos…",
    ["Açores", "Algarve", "Alentejo", "Douro"],
    0,
    3,
  ),
  q(3, "O português é língua oficial de cerca de quantos países?", ["9", "3", "25", "50"], 0, 3),
  q(
    3,
    "Que navegador português chegou ao Brasil em 1500?",
    ["Pedro Álvares Cabral", "Vasco da Gama", "Bartolomeu Dias", "Diogo Cão"],
    0,
    3,
  ),
  q(
    3,
    "Quem escreveu Os Lusíadas?",
    ["Luís de Camões", "Eça de Queirós", "Fernando Pessoa", "Amália Rodrigues"],
    0,
    3,
  ),
  q(
    3,
    "A Revolução de 25 de abril de 1974 é conhecida pela flor…",
    ["Cravos", "Rosas", "Tulipas", "Girassóis"],
    0,
    3,
  ),
  q(
    3,
    "Fernão de Magalhães organizou a primeira…",
    ["Viagem de volta ao mundo", "Subida ao Evereste", "Travessia do Saara", "Chegada à Lua"],
    0,
    2,
  ),
];

// ─── CABO VERDE (pt-PT) ───
const CV_PACK: QuizPaisQ[] = [
  q(1, "Qual é a capital de Cabo Verde?", ["Praia", "Mindelo", "Sal", "Fogo"], 0),
  q(1, "Qual é a moeda de Cabo Verde?", ["Escudo", "Euro", "Kwanza", "Metical"], 0),
  q(
    1,
    "Que cores estão na bandeira de Cabo Verde?",
    [
      "Azul, branco, vermelho e estrelas amarelas",
      "Só verde e amarelo",
      "Verde, vermelho e preto",
      "Laranja, branco e verde",
    ],
    0,
  ),
  q(
    1,
    "Em que oceano fica Cabo Verde?",
    ["Oceano Atlântico", "Oceano Índico", "Oceano Pacífico", "Mar Mediterrâneo"],
    0,
  ),
  q(1, "Qual é a língua oficial de Cabo Verde?", ["Português", "Espanhol", "Inglês", "Francês"], 0),
  q(
    1,
    "Cabo Verde fica perto da costa de que continente?",
    ["África", "Europa", "Ásia", "América"],
    0,
    1,
  ),
  q(
    1,
    "Como se chamam as pessoas de Cabo Verde?",
    ["Cabo-verdianos", "Angolanos", "Brasileiros", "Santomenses"],
    0,
    1,
  ),
  q(1, "Qual destas ilhas é de Cabo Verde?", ["Santiago", "Madeira", "Malta", "Bali"], 0, 2),
  q(1, "Qual é a maior ilha de Cabo Verde?", ["Santiago", "Sal", "Fogo", "Boa Vista"], 0, 2),
  q(
    1,
    "Que animal marinho vem pôr ovos nas praias de Cabo Verde?",
    ["Tartaruga", "Pinguim", "Urso", "Camelo"],
    0,
    1,
  ),
  q(
    1,
    "Como é o tempo em Cabo Verde?",
    [
      "Quente e com sol quase todo o ano",
      "Neve no inverno",
      "Chove todos os dias",
      "Frio e gelado",
    ],
    0,
    1,
  ),
  q(
    1,
    "Qual destas cidades fica em Cabo Verde?",
    ["Mindelo", "Luanda", "Bissau", "São Tomé"],
    0,
    2,
  ),
  q(
    2,
    "A morna, música de Cabo Verde, ficou famosa com…",
    ["Cesária Évora", "Amália Rodrigues", "Roberto Carlos", "Seu Jorge"],
    0,
  ),
  q(
    2,
    "Que cidade tem o carnaval mais famoso de Cabo Verde?",
    ["Mindelo", "Praia", "Tarrafal", "Assomada"],
    0,
  ),
  q(2, "Que ilha tem o vulcão ativo de Cabo Verde?", ["Fogo", "Sal", "Boa Vista", "Santiago"], 0),
  q(
    2,
    "A ilha do Sal é famosa pelas…",
    ["Praias e surf", "Montanhas com neve", "Desertos de gelo", "Florestas tropicais"],
    0,
  ),
  q(2, "Quantas ilhas tem Cabo Verde?", ["10", "2", "25", "50"], 0),
  q(2, "A funaná é…", ["Um ritmo de Cabo Verde", "Um prato", "Uma ilha", "Um barco"], 0, 2),
  q(
    2,
    "A cachupa, prato nacional, é feita de…",
    ["Milho, feijão e carne ou peixe", "Chocolate e caramelo", "Arroz doce", "Batata frita"],
    0,
    2,
  ),
  q(
    2,
    "A praia de Santa Mónica fica na ilha da…",
    ["Boa Vista", "Santo Antão", "Brava", "Maio"],
    0,
    3,
  ),
  q(
    2,
    "A ilha de Santo Antão é famosa pelas suas…",
    ["Montanhas e vales verdes", "Desertos de gelo", "Pistas de esqui", "Cavernas de cristal"],
    0,
    2,
  ),
  q(
    2,
    "Cabo Verde é famoso mundialmente pelo desporto de…",
    ["Kitesurf e ondas", "Esqui na neve", "Hóquei no gelo", "Curling"],
    0,
    1,
  ),
  q(2, "O Monte Verde fica na ilha de…", ["São Vicente", "Sal", "Fogo", "Santiago"], 0, 3),
  q(
    2,
    "A cidade da Praia, capital do país, fica em que ilha?",
    ["Santiago", "São Vicente", "Sal", "Fogo"],
    0,
    2,
  ),
  q(
    3,
    "Quando é a Independência de Cabo Verde?",
    ["5 de julho", "11 de novembro", "25 de junho", "25 de abril"],
    0,
  ),
  q(
    3,
    "Cidade Velha foi a primeira cidade europeia nos trópicos — como se chamava?",
    ["Ribeira Grande", "Praia", "Mindelo", "Espargos"],
    0,
  ),
  q(
    3,
    "Cesária Évora, a “diva pés descalços”, cantava em…",
    ["Crioulo cabo-verdiano", "Inglês", "Espanhol", "Francês"],
    0,
  ),
  q(
    3,
    "Cabo Verde fica a oeste de que ponto de África?",
    ["Dakar, no Senegal", "Luanda, em Angola", "Cidade do Cabo", "Maputo"],
    0,
  ),
  q(
    3,
    "Como se chama a língua crioula falada em Cabo Verde?",
    ["Kriolu", "Suaíli", "Zulu", "Iorubá"],
    0,
  ),
  q(
    3,
    "Cabo Verde ficou independente em 1975 — quantos anos faziam em 2025?",
    ["50", "30", "40", "60"],
    0,
    3,
  ),
  q(
    3,
    "O vulcão do Fogo entrou em erupção mais recentemente em…",
    ["2014", "1990", "2005", "1980"],
    0,
    3,
  ),
  q(
    3,
    "Quem foi o primeiro presidente de Cabo Verde?",
    ["Aristides Pereira", "Amílcar Cabral", "Pedro Pires", "Jorge Carlos Fonseca"],
    0,
    3,
  ),
  q(
    3,
    "Amílcar Cabral é lembrado como…",
    ["O herói da independência", "Um futebolista", "Um navegador português", "Um rei antigo"],
    0,
    2,
  ),
  q(
    3,
    "Barlavento e Sotavento são os dois grupos de…",
    ["Ilhas de Cabo Verde", "Danças", "Pratos típicos", "Times de futebol"],
    0,
    3,
  ),
  q(
    3,
    "Mindelo, cidade do carnaval, fica na ilha de…",
    ["São Vicente", "Santiago", "Sal", "Fogo"],
    0,
    2,
  ),
  q(3, "Quantas estrelas douradas tem a bandeira de Cabo Verde?", ["10", "5", "27", "12"], 0, 3),
];

export const QUIZ_PAIS: Partial<Record<RegionCode, QuizPaisQ[]>> = {
  MZ: MZ_PACK,
  AO: AO_PACK,
  BR: BR_PACK,
  PT: PT_PACK,
  CV: CV_PACK,
};

// Todas as respostas certas estão no índice 0 na definição — baralhamos na saída.
function shufflePack(pack: QuizPaisQ[]): QuizPaisQ[] {
  return pack.map((q) => {
    const ordem = shuffled([0, 1, 2, 3]);
    return {
      ...q,
      options: ordem.map((i) => q.options[i]) as QuizPaisQ["options"],
      answerIndex: ordem.indexOf(q.answerIndex),
    };
  });
}

/** Tem pack para esta região? */
export function hasQuizPais(region?: RegionCode | null): boolean {
  return Boolean(region && QUIZ_PAIS[region]?.length);
}

/** Nome do país da região (para títulos: "Quiz de Moçambique"). */
export function quizPaisCountry(region: RegionCode): string {
  return REGIONS[region]?.country ?? region;
}

/** Faixa do nível na língua da escola da criança: "1.ª–2.ª classe · 6–8 anos" ou "3.º ano · 8–9 anos". */
export function quizPaisLevelFrame(level: 1 | 2 | 3, region?: RegionCode | null): string {
  const lv = QUIZ_PAIS_LEVELS.find((l) => l.level === level);
  if (!lv) return "";
  const badge =
    lv.grades[0] === lv.grades[1]
      ? gradeBadge(lv.grades[0], region)
      : `${gradeBadge(lv.grades[0], region)}–${gradeBadge(lv.grades[1], region)}`;
  const noun = gradeNoun(region) === "classe" ? "classe" : "ano";
  return `${badge} ${noun} · ${lv.ages[0]}–${lv.ages[1]} anos`;
}

/**
 * Recompensas equilibradas: o nível que é mais difícil paga mais.
 * Fácil mantém a fórmula original (2 moedas/4 XP por acerto) — Médio e Campeão
 * escalam (3/5 e 4/6), com bónus de perfeição 5×nível.
 */
export function quizPaisRewards(level: 1 | 2 | 3, acertos: number): { moedas: number; xp: number } {
  return {
    moedas: acertos * (1 + level) + (acertos >= QUIZ_PAIS_PER_LEVEL ? 5 * level : 0),
    xp: acertos * (3 + level),
  };
}

/**
 * 5 perguntas do nível, baralhadas (pergunta E opções) — com balanceamento por
 * idade: os mais novos (1.ª/2.ª) começam pelas perguntas mais leves da faixa;
 * os grandes (4.ª/4.º) recebem primeiro as mais fortes. Sem grade conhecida,
 * é baralho puro.
 */
export function pickQuizPais(region: RegionCode, level: 1 | 2 | 3, grade?: number): QuizPaisQ[] {
  const pack = shufflePack((QUIZ_PAIS[region] ?? []).filter((x) => x.level === level));
  const ordered =
    grade != null && grade <= 2
      ? [...pack.filter((x) => x.d === 1), ...pack.filter((x) => x.d !== 1)]
      : grade != null && grade >= 4
        ? [...pack.filter((x) => x.d === 3), ...pack.filter((x) => x.d !== 3)]
        : pack;
  return ordered.slice(0, QUIZ_PAIS_PER_LEVEL);
}

// ── Progresso (nível desbloqueado + recorde por região:nível) ──
const LS_KEY = "kidoz-quiz-pais-v1";

export interface QuizPaisProgress {
  unlocked: number; // maior nível desbloqueado (1..3)
  best: Record<string, number>; // "MZ:2" -> melhor placar 0..5
}

export function loadQuizPaisProgress(): QuizPaisProgress {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { unlocked: 1, best: {} };
    const p = JSON.parse(raw) as Partial<QuizPaisProgress>;
    return {
      unlocked: Math.min(QUIZ_PAIS_MAX_LEVEL, Math.max(1, Number(p.unlocked) || 1)),
      best: p.best ?? {},
    };
  } catch {
    return { unlocked: 1, best: {} };
  }
}

/**
 * Registra o resultado de uma rodada. Devolve o progresso novo e se um nível
 * acabou de ser desbloqueado (para celebrar!). 4+ acertos desbloqueia o próximo.
 */
export function saveQuizPaisResult(
  region: RegionCode,
  level: 1 | 2 | 3,
  correct: number,
): { progress: QuizPaisProgress; unlockedNow: boolean; isRecord: boolean } {
  const progress = loadQuizPaisProgress();
  const key = `${region}:${level}`;
  const isRecord = correct > (progress.best[key] ?? -1);
  if (isRecord) progress.best[key] = correct;

  let unlockedNow = false;
  if (correct >= 4 && level === progress.unlocked && progress.unlocked < QUIZ_PAIS_MAX_LEVEL) {
    progress.unlocked = level + 1;
    unlockedNow = true;
  }
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(progress));
  } catch {
    // storage cheio — progresso fica só em memória nesta sessão
  }
  return { progress, unlockedNow, isRecord };
}
