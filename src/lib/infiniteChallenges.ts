// Infinite procedural challenges — generates near-infinite questions
// across multiple tracks (math, language, science, world, logic) and
// difficulty levels 1..∞. Each level pulls a deterministic seed so the
// same level replays identically until the player advances.

export type TrackId =
  | "math-arithmetic"
  | "math-tables"
  | "math-fractions"
  | "math-algebra"
  | "math-geometry"
  | "lang-vocab"
  | "lang-grammar"
  | "lang-spelling"
  | "world-geography"
  | "world-history"
  | "science-nature"
  | "logic-puzzles";

export interface InfiniteTrack {
  id: TrackId;
  name: string;
  emoji: string;
  tagline: string;
  ageMin: number;
  ageMax: number; // 99 = adult
  premium: boolean;
  colorVar: string;
}

export interface GenQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  hint?: string;
}

export const TRACKS: InfiniteTrack[] = [
  { id: "math-arithmetic", name: "Aritmética sem Fim", emoji: "➕", tagline: "Somas e subtrações cada vez maiores", ageMin: 5, ageMax: 99, premium: false, colorVar: "--pt-math" },
  { id: "math-tables", name: "Tabuadas Mestras", emoji: "✖️", tagline: "Do 2 ao 12, todas as combinações", ageMin: 7, ageMax: 99, premium: false, colorVar: "--pt-math" },
  { id: "math-fractions", name: "Frações & Decimais", emoji: "🍕", tagline: "Compara, soma, simplifica", ageMin: 9, ageMax: 99, premium: true, colorVar: "--pt-math" },
  { id: "math-algebra", name: "Álgebra Aventureira", emoji: "🧮", tagline: "Equações com x e y", ageMin: 10, ageMax: 99, premium: true, colorVar: "--pt-math" },
  { id: "math-geometry", name: "Geometria Mágica", emoji: "📐", tagline: "Perímetros, áreas, ângulos", ageMin: 8, ageMax: 99, premium: true, colorVar: "--pt-math" },
  { id: "lang-vocab", name: "Vocabulário Infinito", emoji: "📖", tagline: "Sinónimos, antónimos, significados", ageMin: 6, ageMax: 99, premium: false, colorVar: "--pt-portuguese" },
  { id: "lang-grammar", name: "Gramática Galáctica", emoji: "✏️", tagline: "Classes de palavras e frases", ageMin: 8, ageMax: 99, premium: true, colorVar: "--pt-portuguese" },
  { id: "lang-spelling", name: "Ortografia em Festa", emoji: "🔤", tagline: "Acentos, plurais, sons difíceis", ageMin: 7, ageMax: 99, premium: false, colorVar: "--pt-portuguese" },
  { id: "world-geography", name: "Atlas do Mundo", emoji: "🌍", tagline: "Capitais, rios, continentes", ageMin: 8, ageMax: 99, premium: true, colorVar: "--pt-world" },
  { id: "world-history", name: "Cápsula do Tempo", emoji: "🏰", tagline: "Datas e personagens da história", ageMin: 9, ageMax: 99, premium: true, colorVar: "--pt-world" },
  { id: "science-nature", name: "Natureza Curiosa", emoji: "🌳", tagline: "Animais, corpo, ambiente", ageMin: 6, ageMax: 99, premium: false, colorVar: "--pt-world" },
  { id: "logic-puzzles", name: "Lógica & Enigmas", emoji: "🧩", tagline: "Sequências, padrões, raciocínio", ageMin: 7, ageMax: 99, premium: true, colorVar: "--pt-portuguese" },
];

// Deterministic PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const intBetween = (rng: () => number, a: number, b: number) => a + Math.floor(rng() * (b - a + 1));

function shuffleOptions(rng: () => number, correct: string, distractors: string[]): { options: string[]; answerIndex: number } {
  const all = [correct, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { options: all, answerIndex: all.indexOf(correct) };
}

// === Generators ===
function genArith(rng: () => number, level: number): GenQuestion {
  const cap = Math.min(10 + level * 4, 9999);
  const a = intBetween(rng, 1, cap);
  const b = intBetween(rng, 1, cap);
  const op = level < 3 ? "+" : pick(rng, ["+", "+", "-", "-"]);
  const ans = op === "+" ? a + b : a - b;
  const ds = [ans + 1, ans - 1, ans + intBetween(rng, 2, 10)].map(String);
  const { options, answerIndex } = shuffleOptions(rng, String(ans), ds);
  return { prompt: `${a} ${op} ${b} = ?`, options, answerIndex };
}
function genTables(rng: () => number, level: number): GenQuestion {
  const maxFactor = Math.min(2 + level, 12);
  const a = intBetween(rng, 2, maxFactor);
  const b = intBetween(rng, 2, maxFactor);
  const ans = a * b;
  const ds = [ans + a, ans - a, ans + b].map((n) => String(Math.max(1, n)));
  const { options, answerIndex } = shuffleOptions(rng, String(ans), ds);
  return { prompt: `${a} × ${b} = ?`, options, answerIndex };
}
function genFractions(rng: () => number, level: number): GenQuestion {
  const den = pick(rng, [2, 3, 4, 5, 6, 8, 10]);
  const n1 = intBetween(rng, 1, den - 1);
  const n2 = intBetween(rng, 1, den - 1);
  if (level < 4) {
    const bigger = n1 > n2 ? `${n1}/${den}` : `${n2}/${den}`;
    const { options, answerIndex } = shuffleOptions(rng, bigger, [n1 < n2 ? `${n1}/${den}` : `${n2}/${den}`, "iguais", `${den}/${n1}`]);
    return { prompt: `Qual fração é maior?  ${n1}/${den}  ou  ${n2}/${den}`, options, answerIndex };
  }
  const sum = n1 + n2;
  const correct = `${sum}/${den}`;
  const { options, answerIndex } = shuffleOptions(rng, correct, [`${sum}/${den * 2}`, `${n1 * n2}/${den}`, `${sum + 1}/${den}`]);
  return { prompt: `${n1}/${den} + ${n2}/${den} = ?`, options, answerIndex };
}
function genAlgebra(rng: () => number, level: number): GenQuestion {
  const cap = 10 + level * 2;
  const x = intBetween(rng, 1, cap);
  const a = intBetween(rng, 2, Math.min(5 + level, 12));
  const b = intBetween(rng, 1, cap);
  const result = a * x + b;
  const ds = [x + 1, x - 1, x + 2].map((n) => String(Math.max(1, n)));
  const { options, answerIndex } = shuffleOptions(rng, String(x), ds);
  return { prompt: `${a}x + ${b} = ${result}.  x = ?`, options, answerIndex };
}
function genGeometry(rng: () => number, level: number): GenQuestion {
  const cap = 5 + level * 2;
  const w = intBetween(rng, 2, cap);
  const h = intBetween(rng, 2, cap);
  const which = pick(rng, ["perim", "area"]);
  if (which === "perim") {
    const ans = 2 * (w + h);
    const { options, answerIndex } = shuffleOptions(rng, String(ans), [String(w * h), String(w + h), String(ans + 2)]);
    return { prompt: `Perímetro de um retângulo ${w}×${h} cm = ? cm`, options, answerIndex };
  }
  const ans = w * h;
  const { options, answerIndex } = shuffleOptions(rng, String(ans), [String(2 * (w + h)), String(ans + w), String(ans - 1)]);
  return { prompt: `Área de um retângulo ${w}×${h} cm = ? cm²`, options, answerIndex };
}

const SYNS: Array<[string, string, string[]]> = [
  ["bonito", "belo", ["feio", "triste", "lento"]],
  ["rápido", "veloz", ["devagar", "calmo", "fraco"]],
  ["alegre", "feliz", ["triste", "zangado", "cansado"]],
  ["grande", "enorme", ["pequeno", "curto", "fino"]],
  ["forte", "robusto", ["fraco", "leve", "magro"]],
  ["inteligente", "esperto", ["tonto", "lento", "calado"]],
  ["sábio", "culto", ["ignorante", "novo", "novato"]],
  ["calmo", "tranquilo", ["nervoso", "rápido", "alto"]],
  ["antigo", "velho", ["novo", "moderno", "atual"]],
  ["limpo", "asseado", ["sujo", "molhado", "frio"]],
];
const ANTS: Array<[string, string, string[]]> = [
  ["dia", "noite", ["sol", "tarde", "manhã"]],
  ["cheio", "vazio", ["meio", "alto", "leve"]],
  ["frio", "quente", ["morno", "fresco", "gelado"]],
  ["amigo", "inimigo", ["colega", "vizinho", "irmão"]],
  ["claro", "escuro", ["nublado", "limpo", "azul"]],
  ["alto", "baixo", ["médio", "longo", "curto"]],
  ["entrar", "sair", ["voltar", "ficar", "passar"]],
  ["abrir", "fechar", ["partir", "ligar", "puxar"]],
];
function genVocab(rng: () => number, level: number): GenQuestion {
  const useAnt = level > 2 && rng() > 0.5;
  const set = useAnt ? ANTS : SYNS;
  const [w, ans, ds] = pick(rng, set);
  const { options, answerIndex } = shuffleOptions(rng, ans, ds);
  return { prompt: `${useAnt ? "Antónimo" : "Sinónimo"} de “${w}” é…`, options, answerIndex };
}

const GRAMMAR_BANK: GenQuestion[] = [
  { prompt: "Em 'O cão corre rápido', 'rápido' é…", options: ["substantivo", "adjetivo", "advérbio", "verbo"], answerIndex: 2 },
  { prompt: "Plural de 'animal' é…", options: ["animals", "animais", "animales", "animaes"], answerIndex: 1 },
  { prompt: "Plural de 'pão' é…", options: ["pãos", "pães", "panes", "pãoes"], answerIndex: 1 },
  { prompt: "'Eu fui ao cinema' está no…", options: ["presente", "passado", "futuro", "infinitivo"], answerIndex: 1 },
  { prompt: "Feminino de 'herói' é…", options: ["heroia", "heroína", "herói", "heroia-mulher"], answerIndex: 1 },
  { prompt: "Em 'a casa amarela', 'amarela' é…", options: ["substantivo", "verbo", "adjetivo", "pronome"], answerIndex: 2 },
  { prompt: "'Nós' é um pronome…", options: ["pessoal", "possessivo", "demonstrativo", "interrogativo"], answerIndex: 0 },
  { prompt: "'Rapidamente' é…", options: ["adjetivo", "advérbio", "verbo", "substantivo"], answerIndex: 1 },
  { prompt: "Conjuga 'amanhã eu ___ ao parque' (ir)", options: ["fui", "vou", "irei", "vai"], answerIndex: 2 },
  { prompt: "Plural de 'cidadão' é…", options: ["cidadãos", "cidadães", "cidadões", "cidadons"], answerIndex: 0 },
  { prompt: "Em 'O Pedro estuda muito', 'O' é um…", options: ["pronome", "artigo", "verbo", "advérbio"], answerIndex: 1 },
  { prompt: "Forma correta: 'há dois anos' significa…", options: ["existem", "tem", "passados", "ainda"], answerIndex: 2 },
];
function genGrammar(rng: () => number): GenQuestion {
  return GRAMMAR_BANK[Math.floor(rng() * GRAMMAR_BANK.length)];
}

const SPELLING_BANK: GenQuestion[] = [
  { prompt: "Como se escreve corretamente?", options: ["excessão", "exceção", "esceção", "exseção"], answerIndex: 1 },
  { prompt: "Como se escreve corretamente?", options: ["pesquiza", "pesquisa", "pezquisa", "pessquisa"], answerIndex: 1 },
  { prompt: "Qual está bem acentuada?", options: ["pôr de sol", "por do sol", "pôr-do-sol", "por-do-sol"], answerIndex: 2 },
  { prompt: "Como se escreve corretamente?", options: ["jeito", "geito", "jeyto", "geyto"], answerIndex: 0 },
  { prompt: "Como se escreve corretamente?", options: ["caçar", "cassar", "caicar", "cazar"], answerIndex: 0 },
  { prompt: "Plural correto de 'limão'?", options: ["limões", "limãos", "limãoes", "limons"], answerIndex: 0 },
  { prompt: "Forma correta:", options: ["assobio", "assopio", "asobio", "açobio"], answerIndex: 0 },
  { prompt: "Forma correta:", options: ["beneficiente", "beneficente", "beneficiénte", "beneficiando"], answerIndex: 1 },
  { prompt: "Forma correta:", options: ["através", "atravéz", "atravéis", "atravas"], answerIndex: 0 },
];
function genSpelling(rng: () => number): GenQuestion {
  return SPELLING_BANK[Math.floor(rng() * SPELLING_BANK.length)];
}

const GEO_BANK: GenQuestion[] = [
  { prompt: "Capital de Espanha?", options: ["Barcelona", "Madrid", "Sevilha", "Valência"], answerIndex: 1 },
  { prompt: "Capital de França?", options: ["Lyon", "Marselha", "Paris", "Nice"], answerIndex: 2 },
  { prompt: "Capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], answerIndex: 2 },
  { prompt: "Capital de Itália?", options: ["Milão", "Roma", "Veneza", "Florença"], answerIndex: 1 },
  { prompt: "Continente do Egito?", options: ["Ásia", "África", "Europa", "Oceânia"], answerIndex: 1 },
  { prompt: "Maior oceano do mundo?", options: ["Atlântico", "Índico", "Pacífico", "Ártico"], answerIndex: 2 },
  { prompt: "Capital de Angola?", options: ["Luanda", "Benguela", "Lobito", "Huambo"], answerIndex: 0 },
  { prompt: "Capital de Moçambique?", options: ["Beira", "Maputo", "Nampula", "Pemba"], answerIndex: 1 },
  { prompt: "Capital de Cabo Verde?", options: ["Mindelo", "Praia", "Sal", "Boa Vista"], answerIndex: 1 },
  { prompt: "Rio mais longo do mundo?", options: ["Nilo", "Amazonas", "Yangtzé", "Tejo"], answerIndex: 1 },
  { prompt: "Capital do Japão?", options: ["Quioto", "Osaka", "Tóquio", "Nagoya"], answerIndex: 2 },
  { prompt: "Maior deserto quente?", options: ["Sahara", "Gobi", "Kalahari", "Atacama"], answerIndex: 0 },
  { prompt: "Quantos continentes existem?", options: ["5", "6", "7", "8"], answerIndex: 2 },
];
function genGeo(rng: () => number): GenQuestion {
  return GEO_BANK[Math.floor(rng() * GEO_BANK.length)];
}

const HIST_BANK: GenQuestion[] = [
  { prompt: "Em que ano se fundou Portugal?", options: ["1143", "1500", "1640", "1910"], answerIndex: 0 },
  { prompt: "Quem chegou à Índia em 1498?", options: ["Cabral", "Vasco da Gama", "Magalhães", "Bartolomeu Dias"], answerIndex: 1 },
  { prompt: "Quem descobriu o Brasil em 1500?", options: ["Vasco da Gama", "Pedro Álvares Cabral", "Colombo", "Mendes Pinto"], answerIndex: 1 },
  { prompt: "Em que ano foi a Revolução de 25 de Abril?", options: ["1910", "1945", "1974", "1986"], answerIndex: 2 },
  { prompt: "Primeiro rei de Portugal?", options: ["D. João I", "D. Afonso Henriques", "D. Dinis", "D. Manuel"], answerIndex: 1 },
  { prompt: "Quando começou a 1.ª Guerra Mundial?", options: ["1900", "1914", "1939", "1945"], answerIndex: 1 },
  { prompt: "Quem inventou a lâmpada elétrica?", options: ["Tesla", "Edison", "Newton", "Einstein"], answerIndex: 1 },
  { prompt: "Em que ano o homem foi à Lua?", options: ["1957", "1965", "1969", "1972"], answerIndex: 2 },
];
function genHist(rng: () => number): GenQuestion {
  return HIST_BANK[Math.floor(rng() * HIST_BANK.length)];
}

const SCIENCE_BANK: GenQuestion[] = [
  { prompt: "Quantas patas tem uma aranha?", options: ["6", "8", "10", "4"], answerIndex: 1 },
  { prompt: "Que órgão bombeia o sangue?", options: ["Pulmão", "Coração", "Fígado", "Cérebro"], answerIndex: 1 },
  { prompt: "As plantas precisam de…", options: ["pilhas", "sol e água", "som", "vento"], answerIndex: 1 },
  { prompt: "A água ferve a quantos °C ao nível do mar?", options: ["50", "80", "100", "120"], answerIndex: 2 },
  { prompt: "Animal que dá leite chama-se…", options: ["réptil", "ave", "mamífero", "anfíbio"], answerIndex: 2 },
  { prompt: "Quantos ossos tem um humano adulto?", options: ["106", "206", "306", "406"], answerIndex: 1 },
  { prompt: "O Sol é uma…", options: ["planeta", "estrela", "lua", "nebulosa"], answerIndex: 1 },
  { prompt: "Energia das plantas vem da…", options: ["fotossíntese", "respiração", "digestão", "fermentação"], answerIndex: 0 },
  { prompt: "Reciclar plástico no ecoponto…", options: ["azul", "amarelo", "verde", "vermelho"], answerIndex: 1 },
  { prompt: "Animal mais rápido em terra?", options: ["leão", "guepardo", "cavalo", "lobo"], answerIndex: 1 },
];
function genScience(rng: () => number): GenQuestion {
  return SCIENCE_BANK[Math.floor(rng() * SCIENCE_BANK.length)];
}

function genLogic(rng: () => number, level: number): GenQuestion {
  const start = intBetween(rng, 1, 9);
  const step = intBetween(rng, 2, Math.min(2 + level, 9));
  const seq = [start, start + step, start + 2 * step, start + 3 * step];
  const ans = start + 4 * step;
  const ds = [ans + step, ans - 1, ans + 1].map(String);
  const { options, answerIndex } = shuffleOptions(rng, String(ans), ds);
  return { prompt: `Que número continua a sequência?  ${seq.join(", ")}, ?`, options, answerIndex };
}

export function generateQuestions(track: TrackId, level: number, count = 8): GenQuestion[] {
  const rng = mulberry32((level + 1) * 9973 + track.length * 131);
  const out: GenQuestion[] = [];
  for (let i = 0; i < count; i++) {
    switch (track) {
      case "math-arithmetic": out.push(genArith(rng, level)); break;
      case "math-tables": out.push(genTables(rng, level)); break;
      case "math-fractions": out.push(genFractions(rng, level)); break;
      case "math-algebra": out.push(genAlgebra(rng, level)); break;
      case "math-geometry": out.push(genGeometry(rng, level)); break;
      case "lang-vocab": out.push(genVocab(rng, level)); break;
      case "lang-grammar": out.push(genGrammar(rng)); break;
      case "lang-spelling": out.push(genSpelling(rng)); break;
      case "world-geography": out.push(genGeo(rng)); break;
      case "world-history": out.push(genHist(rng)); break;
      case "science-nature": out.push(genScience(rng)); break;
      case "logic-puzzles": out.push(genLogic(rng, level)); break;
    }
  }
  return out;
}

// === Progress storage ===
const PROG_KEY = "kidoz-infinite-progress-v1";
export interface InfiniteProgress {
  levels: Partial<Record<TrackId, number>>; // current unlocked level per track
  bestStars: Partial<Record<string, number>>; // `${track}:${level}` -> stars
  totalXp: number;
}
export function loadInfiniteProgress(): InfiniteProgress {
  if (typeof window === "undefined") return { levels: {}, bestStars: {}, totalXp: 0 };
  try {
    const raw = localStorage.getItem(PROG_KEY);
    if (!raw) return { levels: {}, bestStars: {}, totalXp: 0 };
    return { levels: {}, bestStars: {}, totalXp: 0, ...JSON.parse(raw) };
  } catch {
    return { levels: {}, bestStars: {}, totalXp: 0 };
  }
}
export function saveInfiniteProgress(p: InfiniteProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROG_KEY, JSON.stringify(p));
}
export function recordResult(track: TrackId, level: number, correct: number, total: number): InfiniteProgress {
  const p = loadInfiniteProgress();
  const ratio = correct / Math.max(1, total);
  const stars = ratio >= 0.95 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.5 ? 1 : 0;
  const key = `${track}:${level}`;
  p.bestStars[key] = Math.max(p.bestStars[key] ?? 0, stars);
  const cur = p.levels[track] ?? 1;
  if (stars >= 2 && level >= cur) p.levels[track] = level + 1;
  p.totalXp = (p.totalXp ?? 0) + correct * (5 + Math.floor(level / 2));
  saveInfiniteProgress(p);
  return p;
}
