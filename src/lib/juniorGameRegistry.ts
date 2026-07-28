// juniorGameRegistry.ts
// Registo central de todos os mini-jogos do Júnior.
// Cada jogo é lazy-loaded — só carrega quando a criança o escolhe.
// Isto elimina o switch gigante no junior.tsx e o import bloco de 8 ficheiros.

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

// Tipos de props que os jogos aceitam
type SimpleGame = ComponentType<{ onDone?: () => void }>;
type NoPropsGame = ComponentType;
type TriviaGame = ComponentType<{ category?: string; count?: number }>;

export interface GameEntry {
  id: string;
  title: string;
  emoji: string;
  ageGroup: "2-3" | "3-4" | "4-5" | "6+";
  garden: string; // qual jardim pertence (ex: "cores", "animais")
  component: LazyExoticComponent<SimpleGame> | LazyExoticComponent<NoPropsGame> | LazyExoticComponent<TriviaGame>;
}

// --- Lazy imports por ficheiro ---
// JuniorGames (V1 original)
const GameJardimCores = lazy(() => import("@/components/junior/JuniorGames").then(m => ({ default: m.GameJardimCores })));
const GameOrquestraAnimais = lazy(() => import("@/components/junior/JuniorGames").then(m => ({ default: m.GameOrquestraAnimais })));
const GameRotinasKido = lazy(() => import("@/components/junior/JuniorGames").then(m => ({ default: m.GameRotinasKido })));
const GameLivroMagico = lazy(() => import("@/components/junior/JuniorGames").then(m => ({ default: m.GameLivroMagico })));

// JuniorGamesExtra
const GameContaPatinhos = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameContaPatinhos })));
const GameBolhas = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameBolhas })));
const GameMeuCorpo = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameMeuCorpo })));
const GameMemoria = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameMemoria })));
const GameLetraAventura = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameLetraAventura })));
const GameFormas = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameFormas })));
const GameMercado = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameMercado })));
const GameSoletrar = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameSoletrar })));
const GameMatematica = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameMatematica })));
const GameCientista = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameCientista })));
const GameRelogio = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GameRelogio })));
const GamePalop = lazy(() => import("@/components/junior/JuniorGamesExtra").then(m => ({ default: m.GamePalop })));

// V2
const GamePinta = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GamePinta })));
const GameEco = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GameEco })));
const GameJardimMagico = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GameJardimMagico })));
const GamePuzzle = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GamePuzzle })));
const GameCacaTesouro = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GameCacaTesouro })));
const GameEstacoes = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GameEstacoes })));
const GameEmocoes = lazy(() => import("@/components/junior/JuniorGamesV2").then(m => ({ default: m.GameEmocoes })));

// V3
const GameSombras = lazy(() => import("@/components/junior/JuniorGamesV3").then(m => ({ default: m.GameSombras })));
const GamePadroes = lazy(() => import("@/components/junior/JuniorGamesV3").then(m => ({ default: m.GamePadroes })));
const GameLabirinto = lazy(() => import("@/components/junior/JuniorGamesV3").then(m => ({ default: m.GameLabirinto })));
const GameTriviaJr = lazy(() => import("@/components/junior/JuniorGamesV3").then(m => ({ default: m.GameTriviaJr })));

// V4
const GameSomaRapida = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameSomaRapida })));
const GameTabuada = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameTabuada })));
const GameFracoes = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameFracoes })));
const GameSilabas = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameSilabas })));
const GameFormaFrase = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameFormaFrase })));
const GameAntonimos = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameAntonimos })));
const GameMapaPT = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameMapaPT })));
const GameCicloAgua = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameCicloAgua })));
const GameHabitats = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameHabitats })));
const GameBandeiras = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameBandeiras })));
const GameSpellingEN = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameSpellingEN })));
const GameColorsEN = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameColorsEN })));
const GameSimon = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameSimon })));
const GameLogica = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameLogica })));
const GameTriviaOnline = lazy(() => import("@/components/junior/JuniorGamesV4").then(m => ({ default: m.GameTriviaOnline })));

// V5 (baby/toddler 2-3)
const GameBaloes = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameBaloes })));
const GamePares = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GamePares })));
const GameTransportes = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameTransportes })));
const GameTamanho = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameTamanho })));
const GameContaDedos = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameContaDedos })));
const GameAlimentaBebe = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameAlimentaBebe })));
const GameOndeEsta = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameOndeEsta })));
const GameNumeros = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameNumeros })));
const GameFormasCor = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameFormasCor })));
const GameImitaSom = lazy(() => import("@/components/junior/JuniorGamesV5").then(m => ({ default: m.GameImitaSom })));

// V6 (tap games 2 anos)
const GameTapCor = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameTapCor })));
const GameAnimaTap = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameAnimaTap })));
const GameNumTap13 = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameNumTap13 })));
const GameGrandePequeno = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameGrandePequeno })));
const GameFrutaTap = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameFrutaTap })));
const GameSomAnima = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameSomAnima })));
const GameCorRoupa = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameCorRoupa })));
const GameAnimaGrande = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameAnimaGrande })));
const GameTapPatPat = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameTapPatPat })));
const GameEstrelasTap = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameEstrelasTap })));
const GameCarroCor = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameCarroCor })));
const GameAnimaCasa = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameAnimaCasa })));
const GameComidaTap = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameComidaTap })));
const GameFormaRedonda = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameFormaRedonda })));
const GameLuzTap = lazy(() => import("@/components/junior/JuniorGamesV6").then(m => ({ default: m.GameLuzTap })));

// V7 (tap extra)
const GameInstrumentos = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameInstrumentos })));
const GameTempo = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameTempo })));
const GameProfissoes = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameProfissoes })));
const GameParteDia = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameParteDia })));
const GameContrarios = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameContrarios })));
const GameNum46 = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameNum46 })));
const GameFormaSimples = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameFormaSimples })));
const GameFamilia = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameFamilia })));
const GameVeiculos = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameVeiculos })));
const GameSonsNatu = lazy(() => import("@/components/junior/JuniorGamesV7").then(m => ({ default: m.GameSonsNatu })));

// Mozambique (region-specific)
const GameProvinciasMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameProvinciasMZ })));
const GameComidaMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameComidaMZ })));
const GameAnimaisMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameAnimaisMZ })));
const GameCulturaMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameCulturaMZ })));
const GameBandeiraMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameBandeiraMZ })));
const GameRiosMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameRiosMZ })));
const GameCidadesMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameCidadesMZ })));
const GameHeroisMZ = lazy(() => import("@/components/junior/MozambiqueGames").then(m => ({ default: m.GameHeroisMZ })));

// --- MASTER REGISTRY ---
export const GAME_REGISTRY: Record<string, GameEntry> = {
  // V1 — Jardins base
  "jardim-cores":       { id: "jardim-cores",       title: "Jardim das Cores",      emoji: "🎨",  ageGroup: "2-3",  garden: "cores",     component: GameJardimCores },
  "orquestra-animais":  { id: "orquestra-animais",  title: "Orquestra dos Animais", emoji: "🐶",  ageGroup: "2-3",  garden: "animais",   component: GameOrquestraAnimais },
  "rotinas-kido":       { id: "rotinas-kido",       title: "Rotinas do Kido",       emoji: "📅",  ageGroup: "2-3",  garden: "rotinas",   component: GameRotinasKido },
  "livro-magico":       { id: "livro-magico",       title: "Livro Mágico",          emoji: "📖",  ageGroup: "3-4",  garden: "historias", component: GameLivroMagico },

  // Extra
  "conta-patinhos":     { id: "conta-patinhos",     title: "Conta Patinhos",        emoji: "🐥",  ageGroup: "2-3",  garden: "numeros",   component: GameContaPatinhos },
  "bolhas-sabao":       { id: "bolhas-sabao",       title: "Bolhas de Sabão",       emoji: "🫧",  ageGroup: "2-3",  garden: "ciencias",  component: GameBolhas },
  "meu-corpo":          { id: "meu-corpo",          title: "Meu Corpo",             emoji: "🧍",  ageGroup: "3-4",  garden: "corpo",     component: GameMeuCorpo },
  "memoria-animais":    { id: "memoria-animais",    title: "Memória Animais",       emoji: "🧠",  ageGroup: "3-4",  garden: "memoria",   component: GameMemoria },
  "letra-aventura":     { id: "letra-aventura",     title: "Letra Aventura",        emoji: "🔤",  ageGroup: "3-4",  garden: "letras",    component: GameLetraAventura },
  "formas-geo":         { id: "formas-geo",         title: "Formas Geométricas",    emoji: "🔷",  ageGroup: "3-4",  garden: "formas",    component: GameFormas },
  "frutas-mercado":     { id: "frutas-mercado",     title: "Frutas do Mercado",     emoji: "🍎",  ageGroup: "3-4",  garden: "mercado",   component: GameMercado },
  "soletrar":           { id: "soletrar",           title: "Soletrar",              emoji: "✏️",  ageGroup: "4-5",  garden: "letras",    component: GameSoletrar },
  "matematica-magica":  { id: "matematica-magica",  title: "Matemática Mágica",     emoji: "🧮",  ageGroup: "4-5",  garden: "numeros",   component: GameMatematica },
  "pequeno-cientista":  { id: "pequeno-cientista",  title: "Pequeno Cientista",     emoji: "🔬",  ageGroup: "4-5",  garden: "ciencias",  component: GameCientista },
  "relogio-kido":       { id: "relogio-kido",       title: "Relógio Kido",          emoji: "⏰",  ageGroup: "4-5",  garden: "tempo",     component: GameRelogio },
  "mapa-palop":         { id: "mapa-palop",         title: "Mapa PALOP",            emoji: "🌍",  ageGroup: "4-5",  garden: "geografia", component: GamePalop },

  // V2
  "pinta-desenho":      { id: "pinta-desenho",      title: "Pinta Desenho",         emoji: "🎨",  ageGroup: "3-4",  garden: "arte",      component: GamePinta },
  "eco-som":            { id: "eco-som",            title: "Eco do Som",            emoji: "🔊",  ageGroup: "3-4",  garden: "sons",      component: GameEco },
  "jardim-magico":      { id: "jardim-magico",      title: "Jardim Mágico",         emoji: "🌻",  ageGroup: "3-4",  garden: "natureza",  component: GameJardimMagico },
  "puzzle-kido":        { id: "puzzle-kido",        title: "Puzzle Kido",           emoji: "🧩",  ageGroup: "3-4",  garden: "logica",    component: GamePuzzle },
  "caca-tesouro":       { id: "caca-tesouro",       title: "Caça ao Tesouro",       emoji: "💰",  ageGroup: "4-5",  garden: "aventura",  component: GameCacaTesouro },
  "estacoes-ano":       { id: "estacoes-ano",       title: "Estações do Ano",       emoji: "🌸",  ageGroup: "3-4",  garden: "natureza",  component: GameEstacoes },
  "emocoes-kido":       { id: "emocoes-kido",       title: "Emoções Kido",          emoji: "😊",  ageGroup: "3-4",  garden: "emocoes",   component: GameEmocoes },

  // V3
  "sombras":            { id: "sombras",            title: "Sombras",               emoji: "👤",  ageGroup: "4-5",  garden: "logica",    component: GameSombras },
  "padroes":            { id: "padroes",            title: "Padrões",               emoji: "🔄",  ageGroup: "4-5",  garden: "logica",    component: GamePadroes },
  "labirinto":          { id: "labirinto",          title: "Labirinto",             emoji: "🏃",  ageGroup: "4-5",  garden: "aventura",  component: GameLabirinto },
  "trivia-jr":          { id: "trivia-jr",          title: "Trivia Júnior",         emoji: "💡",  ageGroup: "4-5",  garden: "curiosidades", component: GameTriviaJr },

  // V4 — 1º-4º ano
  "soma-rapida":        { id: "soma-rapida",        title: "Soma Rápida",           emoji: "➕",  ageGroup: "6+",   garden: "matematica", component: GameSomaRapida },
  "tabuada":            { id: "tabuada",            title: "Tabuada",               emoji: "✖️",  ageGroup: "6+",   garden: "matematica", component: GameTabuada },
  "fracoes":            { id: "fracoes",            title: "Frações",               emoji: "½",   ageGroup: "6+",   garden: "matematica", component: GameFracoes },
  "silabas":            { id: "silabas",            title: "Sílabas",               emoji: "📝",  ageGroup: "6+",   garden: "portugues",  component: GameSilabas },
  "forma-frase":        { id: "forma-frase",        title: "Forma Frase",           emoji: "💬",  ageGroup: "6+",   garden: "portugues",  component: GameFormaFrase },
  "antonimos":          { id: "antonimos",          title: "Antónimos",             emoji: "⚖️",  ageGroup: "6+",   garden: "portugues",  component: GameAntonimos },
  "mapa-pt":            { id: "mapa-pt",            title: "Mapa de Portugal",      emoji: "🇵🇹",  ageGroup: "6+",   garden: "geografia",  component: GameMapaPT },
  "ciclo-agua":         { id: "ciclo-agua",         title: "Ciclo da Água",         emoji: "💧",  ageGroup: "6+",   garden: "ciencias",   component: GameCicloAgua },
  "habitats":           { id: "habitats",           title: "Habitats",              emoji: "🏠",  ageGroup: "6+",   garden: "ciencias",   component: GameHabitats },
  "bandeiras":          { id: "bandeiras",          title: "Bandeiras",             emoji: "🚩",  ageGroup: "6+",   garden: "geografia",  component: GameBandeiras },
  "spelling-en":        { id: "spelling-en",        title: "Spelling EN",           emoji: "🇬🇧",  ageGroup: "6+",   garden: "ingles",     component: GameSpellingEN },
  "colors-en":          { id: "colors-en",          title: "Colors EN",             emoji: "🇬🇧",  ageGroup: "6+",   garden: "ingles",     component: GameColorsEN },
  "simon":              { id: "simon",              title: "Simon",                 emoji: "🧠",  ageGroup: "4-5",  garden: "memoria",    component: GameSimon },
  "logica":             { id: "logica",             title: "Lógica",                emoji: "🧩",  ageGroup: "6+",   garden: "logica",     component: GameLogica },
  "trivia-online":      { id: "trivia-online",      title: "Trivia Online",         emoji: "🌐",  ageGroup: "6+",   garden: "curiosidades", component: GameTriviaOnline },

  // V5 — Baby/toddler 2-3
  "baloes":             { id: "baloes",             title: "Balões",                emoji: "🎈",  ageGroup: "2-3",  garden: "tapping",    component: GameBaloes },
  "pares-jr":           { id: "pares-jr",           title: "Pares Júnior",          emoji: "👭",  ageGroup: "2-3",  garden: "memoria",    component: GamePares },
  "transportes":        { id: "transportes",        title: "Transportes",           emoji: "🚗",  ageGroup: "2-3",  garden: "mundo",      component: GameTransportes },
  "tamanho":            { id: "tamanho",            title: "Grande/Pequeno",        emoji: "🐘",  ageGroup: "2-3",  garden: "comparar",   component: GameTamanho },
  "conta-dedos":        { id: "conta-dedos",        title: "Conta Dedos",           emoji: "🤚",  ageGroup: "2-3",  garden: "numeros",    component: GameContaDedos },
  "alimenta-bebe":      { id: "alimenta-bebe",      title: "Alimenta Bebé",        emoji: "🍼",  ageGroup: "2-3",  garden: "rotinas",    component: GameAlimentaBebe },
  "onde-esta":          { id: "onde-esta",          title: "Onde Está?",            emoji: "👀",  ageGroup: "2-3",  garden: "encontrar",  component: GameOndeEsta },
  "numeros-tap":        { id: "numeros-tap",        title: "Números Tap",           emoji: "🔢",  ageGroup: "2-3",  garden: "numeros",    component: GameNumeros },
  "formas-cor":         { id: "formas-cor",         title: "Formas & Cor",          emoji: "🔴",  ageGroup: "2-3",  garden: "formas",     component: GameFormasCor },
  "imita-som":          { id: "imita-som",          title: "Imita Som",             emoji: "🔊",  ageGroup: "2-3",  garden: "sons",       component: GameImitaSom },

  // V6 — Tap games 2 anos
  "tap-cor":            { id: "tap-cor",            title: "Toca na Cor",           emoji: "🎨",  ageGroup: "2-3",  garden: "cores",      component: GameTapCor },
  "anima-tap":          { id: "anima-tap",          title: "Toca no Animal",        emoji: "🐶",  ageGroup: "2-3",  garden: "animais",    component: GameAnimaTap },
  "num-tap-1-3":        { id: "num-tap-1-3",        title: "Números 1·2·3",        emoji: "🔢",  ageGroup: "2-3",  garden: "numeros",    component: GameNumTap13 },
  "grande-pequeno-tap": { id: "grande-pequeno-tap", title: "Grande/Pequeno Tap",    emoji: "🐘",  ageGroup: "2-3",  garden: "comparar",   component: GameGrandePequeno },
  "fruta-tap":          { id: "fruta-tap",          title: "Toca na Fruta",         emoji: "🍎",  ageGroup: "2-3",  garden: "comida",     component: GameFrutaTap },
  "som-anima":          { id: "som-anima",          title: "Som do Animal",         emoji: "🔊",  ageGroup: "2-3",  garden: "sons",       component: GameSomAnima },
  "cor-roupa":          { id: "cor-roupa",          title: "Cor da Roupa",          emoji: "🧥",  ageGroup: "2-3",  garden: "cores",      component: GameCorRoupa },
  "anima-grande":       { id: "anima-grande",       title: "Animal Grande",         emoji: "🦁",  ageGroup: "2-3",  garden: "animais",    component: GameAnimaGrande },
  "tap-pat-pat":        { id: "tap-pat-pat",        title: "Pat Pat",               emoji: "👣",  ageGroup: "2-3",  garden: "tapping",    component: GameTapPatPat },
  "estrelas-tap":       { id: "estrelas-tap",       title: "Conta Estrelas",        emoji: "⭐",  ageGroup: "2-3",  garden: "numeros",    component: GameEstrelasTap },
  "carro-cor":          { id: "carro-cor",          title: "Carro da Cor",          emoji: "🚗",  ageGroup: "2-3",  garden: "cores",      component: GameCarroCor },
  "anima-casa":         { id: "anima-casa",         title: "Animal em Casa",        emoji: "🏠",  ageGroup: "2-3",  garden: "animais",    component: GameAnimaCasa },
  "comida-tap":         { id: "comida-tap",         title: "Toca na Comida",        emoji: "🍞",  ageGroup: "2-3",  garden: "comida",     component: GameComidaTap },
  "forma-redonda":      { id: "forma-redonda",      title: "Toca na Forma",         emoji: "⚪",  ageGroup: "2-3",  garden: "formas",     component: GameFormaRedonda },
  "luz-tap":            { id: "luz-tap",            title: "Toca na Luz",           emoji: "💡",  ageGroup: "2-3",  garden: "tapping",    component: GameLuzTap },

  // V7 — Tap extra
  "instrumentos":       { id: "instrumentos",       title: "Instrumentos",          emoji: "🎶",  ageGroup: "2-3",  garden: "sons",       component: GameInstrumentos },
  "tempo-meteo":        { id: "tempo-meteo",        title: "Que tempo faz?",        emoji: "🌦️",  ageGroup: "2-3",  garden: "natureza",   component: GameTempo },
  "profissoes":         { id: "profissoes",         title: "Profissões",            emoji: "🧑‍⚕️",  ageGroup: "3-4",  garden: "mundo",      component: GameProfissoes },
  "parte-dia":          { id: "parte-dia",          title: "Parte do Dia",          emoji: "🌅",  ageGroup: "2-3",  garden: "tempo",      component: GameParteDia },
  "contrarios":         { id: "contrarios",         title: "Quente/Frio",           emoji: "🔥",  ageGroup: "2-3",  garden: "comparar",   component: GameContrarios },
  "num-tap-4-6":        { id: "num-tap-4-6",        title: "Números 4·5·6",        emoji: "🔢",  ageGroup: "2-3",  garden: "numeros",    component: GameNum46 },
  "forma-simples":      { id: "forma-simples",      title: "Forma+",               emoji: "⭐",  ageGroup: "2-3",  garden: "formas",     component: GameFormaSimples },
  "familia":            { id: "familia",            title: "Família",               emoji: "👪",  ageGroup: "2-3",  garden: "mundo",      component: GameFamilia },
  "veiculos-tap":       { id: "veiculos-tap",       title: "Veículos",              emoji: "🚗",  ageGroup: "2-3",  garden: "mundo",      component: GameVeiculos },
  "sons-natu":          { id: "sons-natu",          title: "Sons da Natureza",      emoji: "🌳",  ageGroup: "2-3",  garden: "sons",       component: GameSonsNatu },

  // Mozambique (region-specific)
  "mz-provinces":       { id: "mz-provinces",       title: "Províncias",            emoji: "🇲🇿",  ageGroup: "4-5",  garden: "mz",         component: GameProvinciasMZ },
  "mz-food":            { id: "mz-food",            title: "Sabores MZ",            emoji: "🥘",  ageGroup: "4-5",  garden: "mz",         component: GameComidaMZ },
  "mz-animals":         { id: "mz-animals",         title: "Fauna MZ",              emoji: "🦒",  ageGroup: "4-5",  garden: "mz",         component: GameAnimaisMZ },
  "mz-culture":         { id: "mz-culture",         title: "Ritmos MZ",             emoji: "🎸",  ageGroup: "4-5",  garden: "mz",         component: GameCulturaMZ },
  "mz-flag":            { id: "mz-flag",            title: "Bandeira MZ",            emoji: "🚩",  ageGroup: "4-5",  garden: "mz",         component: GameBandeiraMZ },
  "mz-rivers":          { id: "mz-rivers",          title: "Rios MZ",               emoji: "🌊",  ageGroup: "4-5",  garden: "mz",         component: GameRiosMZ },
  "mz-cities":          { id: "mz-cities",          title: "Cidades MZ",            emoji: "🏢",  ageGroup: "4-5",  garden: "mz",         component: GameCidadesMZ },
  "mz-heroes":          { id: "mz-heroes",          title: "Heróis MZ",             emoji: "🏅",  ageGroup: "4-5",  garden: "mz",         component: GameHeroisMZ },
};

/**
 * Devolve o componente lazy para um jogo, ou null se não existir.
 */
export function getGameComponent(gameId: string): GameEntry | null {
  return GAME_REGISTRY[gameId] ?? null;
}

/**
 * Filtra jogos por ageGroup.
 */
export function getGamesByAge(ageGroup: "2-3" | "3-4" | "4-5" | "6+" | "all"): GameEntry[] {
  const all = Object.values(GAME_REGISTRY);
  if (ageGroup === "all") return all;
  return all.filter(g => g.ageGroup === ageGroup);
}

/**
 * Arcade pool — jogos simples (tap-style) para o modo arcade.
 */
export const ARCADE_POOL: GameEntry[] = [
  GAME_REGISTRY["tap-cor"],
  GAME_REGISTRY["anima-tap"],
  GAME_REGISTRY["num-tap-1-3"],
  GAME_REGISTRY["grande-pequeno-tap"],
  GAME_REGISTRY["fruta-tap"],
  GAME_REGISTRY["cor-roupa"],
  GAME_REGISTRY["anima-grande"],
  GAME_REGISTRY["estrelas-tap"],
  GAME_REGISTRY["carro-cor"],
  GAME_REGISTRY["comida-tap"],
  GAME_REGISTRY["forma-redonda"],
  GAME_REGISTRY["instrumentos"],
  GAME_REGISTRY["tempo-meteo"],
  GAME_REGISTRY["profissoes"],
  GAME_REGISTRY["parte-dia"],
  GAME_REGISTRY["contrarios"],
  GAME_REGISTRY["num-tap-4-6"],
  GAME_REGISTRY["forma-simples"],
  GAME_REGISTRY["familia"],
  GAME_REGISTRY["veiculos-tap"],
  GAME_REGISTRY["sons-natu"],
];
