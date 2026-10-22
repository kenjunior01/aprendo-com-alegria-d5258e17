// quizPais.ts — Quiz do Meu País: perguntas autoradas por região, 3 níveis.
//
// Design pedagógico (padrão Kidoz):
// • Conteúdo 100% regional — a criança joga sobre o SEU país (MZ, AO, BR, PT, CV),
//   com fatos que a escola local também ensina. Nada de copiar banco de terceiros.
// • Níveis com desbloqueio: 4+ acertos (de 5) abre o nível seguinte — progresso
//   guardado no dispositivo (localStorage), sem conta obrigatória.
// • Recompensas generosas, nunca punitivas: acertar dá moedas/XP; errar mostra a
//   resposta certa para aprender.
import type { RegionCode } from "@/lib/region";
import { REGIONS } from "@/lib/region";
import { shuffled } from "@/lib/utils";

export interface QuizPaisQ {
  level: 1 | 2 | 3;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
}

export const QUIZ_PAIS_PER_LEVEL = 5;
export const QUIZ_PAIS_MAX_LEVEL = 3;

/** Metadados dos níveis (seleção no ecrã inicial). */
export const QUIZ_PAIS_LEVELS: { level: 1 | 2 | 3; nome: string; emoji: string; desc: string }[] = [
  { level: 1, nome: "Fácil", emoji: "🌱", desc: "Capitais, moedas e símbolos" },
  { level: 2, nome: "Médio", emoji: "🚀", desc: "Geografia, música e cultura" },
  { level: 3, nome: "Campeão", emoji: "🏆", desc: "História e desafios de mestre" },
];

const q = (
  level: 1 | 2 | 3,
  prompt: string,
  options: [string, string, string, string],
  answerIndex: number,
): QuizPaisQ => ({
  level,
  prompt,
  options,
  answerIndex,
});

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
    "Cesária Évora, a 'diva pés descalços', cantava em…",
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

/** 5 perguntas do nível, baralhadas (pergunta E opções). */
export function pickQuizPais(region: RegionCode, level: 1 | 2 | 3): QuizPaisQ[] {
  const pack = (QUIZ_PAIS[region] ?? []).filter((q) => q.level === level);
  return shufflePack(pack).slice(0, QUIZ_PAIS_PER_LEVEL);
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
