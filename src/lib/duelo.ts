// duelo.ts — Motor do Duelo da Família: 2 jogadores, 1 dispositivo, 0 discussões.
//
// Design pedagógico:
// • Perguntas da trivia Kidoz (banco + lições senior) filtradas pelo ano escolar —
//   justas para os dois, mesmo com idades diferentes. No modo "Misto" cada
//   jogador pode escolher o SEU ano (handicap por irmão): o de 6 anos só
//   recebe perguntas do 1.º, o de 11 só do 6.º — ou "Tudo" para o banco completo.
//   Online, chegam ainda perguntas novas da internet (trivia-import), sempre
//   na faixa certa — offline funciona tudo igual com o banco local.
// • Alternância estrita com ecrã de passagem de vez — ninguém responde pelos
//   outros e cada criança tem o seu momento de brilho no palco.
// • Erro mostra a resposta certa + explicação (aprender > ganhar) e o tempo
//   de leitura é maior no erro do que no acerto (mesma regra do Quiz Relâmpago).
// • Recompensas para o perfil local: TODOS participam, quem vence ganha bónus —
//   nunca castigamos por perder (regressos sem culpa).
import { ALL_TRIVIA, type TriviaQuestion } from "@/lib/triviaBoost";
import { getTriviaWithSource, remoteToTrivia } from "@/lib/triviaSource";
import { shuffled } from "@/lib/utils";
import { detectRegion, gradeLabel, localizeQuestion, type RegionCode } from "@/lib/region";
import { dayGap, loadProfile, saveProfile, type Profile } from "@/lib/storage";
import type { MascotId } from "@/lib/mascots";

export type DueloGrade = "1" | "2" | "3" | "4" | "5" | "6" | "misto";

export interface DueloPlayer {
  name: string;
  mascotId: MascotId;
  score: number;
}

export interface DueloQuestion extends TriviaQuestion {
  /** jogador que responde nesta pergunta (0 = P1, 1 = P2) — alternado */
  turn: 0 | 1;
}

/** Ano escolar → idades das perguntas da trivia (faixa justa).
 *  5.º/6.º ano comem das lições senior (triviaSenior.ts) — idades 10–12. */
const GRADE_AGES: Record<DueloGrade, number[]> = {
  "1": [6, 7],
  "2": [7, 8],
  "3": [8, 9],
  "4": [9, 10],
  "5": [10, 11],
  "6": [11, 12],
  misto: [6, 7, 8, 9, 10, 11, 12],
};

export const DUELO_GRADE_LABEL: Record<DueloGrade, string> = {
  "1": "1.º ano",
  "2": "2.º ano",
  "3": "3.º ano",
  "4": "4.º ano",
  "5": "5.º ano",
  "6": "6.º ano",
  misto: "Misto",
};

/**
 * Label da série conforme a REGIÃO do perfil — uma criança de Maputo anda na
 * "2.ª classe", não no "2.º ano". `DUELO_GRADE_LABEL` mantém-se para a lista
 * de chaves e fallback PT.
 */
export function dueloGradeLabel(g: DueloGrade, region?: RegionCode | null): string {
  return g === "misto" ? "Misto" : gradeLabel(Number(g), region);
}

/** Anos escolares do handicap por jogador (chips do modo Misto). */
export const DUELO_PLAYER_GRADES = [1, 2, 3, 4, 5, 6] as const;

/** Ano de um jogador no Misto: 1–6 ou null = banco completo ("Tudo"). */
export type DueloPlayerGrade = number | null;

function playerAges(g: DueloPlayerGrade): number[] {
  if (g == null) return GRADE_AGES.misto;
  return GRADE_AGES[String(g) as DueloGrade] ?? GRADE_AGES.misto;
}

/** Perguntas suficientes por ano para não repetir muito em duelos seguidos? */
export function dueloPoolSize(grade: DueloGrade): number {
  const ages = GRADE_AGES[grade];
  return ALL_TRIVIA.filter((q) => ages.includes(q.age)).length;
}

/**
 * Pool combinado no Misto quando cada jogador tem o seu ano (união das faixas
 * dos dois) — para mostrar "X perguntas disponíveis" no setup.
 */
export function dueloMistoPoolSize(
  playerGrades: readonly [DueloPlayerGrade, DueloPlayerGrade],
): number {
  const ages = new Set([...playerAges(playerGrades[0]), ...playerAges(playerGrades[1])]);
  return ALL_TRIVIA.filter((q) => ages.has(q.age)).length;
}

/**
 * Escolhe perguntas para o duelo: baralha o pool da faixa de idade e
 * devolve `perPlayer × 2` perguntas com a vez alternada (P1 começa).
 * Vocabulário localizado pela região do perfil (BR/AO/MZ…).
 *
 * Com `playerGrades` (Misto com handicap por irmão): cada jogador sorteia do
 * SEU pool de ano, alternando a vez — pools independentes, nunca misturados.
 * Se um pool for curto, a vez desse jogador usa o pool do outro (nunca fica
 * sem pergunta).
 */
export function pickDueloQuestions(
  grade: DueloGrade,
  perPlayer: number,
  playerGrades?: readonly [DueloPlayerGrade, DueloPlayerGrade],
  remoteExtra?: TriviaQuestion[],
): DueloQuestion[] {
  const region = loadProfile()?.region ?? detectRegion().code;
  const localize = (q: TriviaQuestion) => localizeQuestion(q, region);
  // Trivia remota (roadmap §4.4): perguntas novas da internet entram no banco
  // com idade-âncora do pool certo — o filtro por faixa aceita-as nativamente.
  const bank = remoteExtra?.length ? [...ALL_TRIVIA, ...remoteExtra] : ALL_TRIVIA;

  // Handicap por irmão: só com faixas DIFERENTES — anos iguais (ou Tudo+Tudo)
  // ficam no pool único clássico, que nunca repete pergunta entre os dois.
  if (playerGrades && playerGrades[0] !== playerGrades[1]) {
    const pools = playerGrades.map((g) =>
      shuffled(bank.filter((q) => playerAges(g).includes(q.age))),
    );
    const cursor = [0, 0];
    const out: DueloQuestion[] = [];
    for (let i = 0; i < perPlayer * 2; i++) {
      const turn = (i % 2) as 0 | 1;
      const own = pools[turn][cursor[turn]];
      const other = (1 - turn) as 0 | 1;
      const q = own ?? pools[other][cursor[other]];
      if (!q) break;
      if (own) cursor[turn]++;
      else cursor[other]++;
      out.push({ ...localize(q), turn });
    }
    return out;
  }

  const ages = GRADE_AGES[grade];
  const pool = bank.filter((q) => ages.includes(q.age));
  // Fisher–Yates justo (antes: sort(random) enviesava as posições)
  const baralhado = shuffled(pool);
  const total = Math.min(perPlayer * 2, baralhado.length);
  return baralhado.slice(0, total).map((q, i) => ({
    ...localize(q),
    turn: (i % 2) as 0 | 1,
  }));
}

/** Perguntas por jogador em cada duelo. */
export const DUELO_PER_PLAYER = 4;

// ── Trivia remota (roadmap §4.4) ────────────────────────────────────────────
// Categorias amigas para crianças na Open Trivia DB — roda a sorte a cada
// duelo para o conteúdo nunca se repetir. Sem internet, o banco local chega.
const REMOTE_CATEGORIES = ["animals", "science", "general", "geography", "math", "sports"];
/** Teto de espera: criança NUNCA fica a olhar para um spinner. */
const REMOTE_TIMEOUT_MS = 3500;

/** Pools distintos que o duelo vai precisar (evita pedidos repetidos). */
function poolSpecs(
  grade: DueloGrade,
  playerGrades?: readonly [DueloPlayerGrade, DueloPlayerGrade],
): DueloPlayerGrade[] {
  if (playerGrades && playerGrades[0] !== playerGrades[1])
    return [playerGrades[0], playerGrades[1]];
  return [grade === "misto" ? null : Number(grade)];
}

/** Dificuldade remota adequada ao ano (1.º–2.º fáceis, 3.º–4.º médio, 5.º–6.º difícil). */
function gradeDifficulty(g: DueloPlayerGrade): "easy" | "medium" | "hard" {
  if (g == null || g <= 2) return "easy";
  if (g === 3 || g === 4) return "medium";
  return "hard";
}

/** Idade-âncora: coloca a pergunta remota na faixa certa do banco local. */
function gradeAnchorAge(g: DueloPlayerGrade): number {
  return g == null ? 8 : 5 + g; // 1.º→6 … 4.º→9, 5.º→10, 6.º→11, Tudo→8
}

async function fetchRemoteForPool(g: DueloPlayerGrade, count: number): Promise<TriviaQuestion[]> {
  const category = REMOTE_CATEGORIES[Math.floor(Math.random() * REMOTE_CATEGORIES.length)];
  const { questions, source } = await getTriviaWithSource({
    category,
    difficulty: gradeDifficulty(g),
    count,
    age: gradeAnchorAge(g),
  });
  // "offline" = caiu no banco local — aceitar duplicaria os pools. Só remota.
  if (source !== "remote" || !questions.length) return [];
  return questions.map((q) => remoteToTrivia(q, gradeAnchorAge(g)));
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Perguntas remotas para este duelo (ou [] se offline/lento — o fetch fica
 * a correr em segundo plano e enche a cache para a próxima vez).
 */
export async function loadDueloRemoteExtras(
  grade: DueloGrade,
  playerGrades?: readonly [DueloPlayerGrade, DueloPlayerGrade],
): Promise<TriviaQuestion[]> {
  const specs = poolSpecs(grade, playerGrades);
  try {
    const settled = await Promise.race([
      Promise.all(specs.map((g) => fetchRemoteForPool(g, DUELO_PER_PLAYER * 2))),
      delay(REMOTE_TIMEOUT_MS).then(() => null),
    ]);
    if (!settled) return [];
    return settled.flat();
  } catch {
    return [];
  }
}

/** pickDueloQuestions + extras remotas, com teto de espera para a criança. */
export async function pickDueloQuestionsAsync(
  grade: DueloGrade,
  perPlayer: number,
  playerGrades?: readonly [DueloPlayerGrade, DueloPlayerGrade],
): Promise<DueloQuestion[]> {
  const extras = await loadDueloRemoteExtras(grade, playerGrades);
  return pickDueloQuestions(grade, perPlayer, playerGrades, extras);
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Recompensa o perfil local pelo duelo (o dispositivo pertence a uma criança
 * do duelo na maioria dos casos): participação garantida + bónus de vitória.
 * Atualiza também o streak (duelO é treino!) e o histórico de sessões.
 */
export function awardDuelo(opts: {
  p1: DueloPlayer;
  p2: DueloPlayer;
  totalQuestions: number;
  minutes: number;
  grade: DueloGrade;
}): { xpEarned: number; coinsEarned: number; winner: "p1" | "p2" | "empate"; profile: Profile } {
  const current = loadProfile();
  const p1 = opts.p1;
  const p2 = opts.p2;
  const winner: "p1" | "p2" | "empate" =
    p1.score === p2.score ? "empate" : p1.score > p2.score ? "p1" : "p2";

  if (!current) {
    return { xpEarned: 0, coinsEarned: 0, winner, profile: null as unknown as Profile };
  }

  // Base por participação: cada acerto vale XP/moedas (como nas lições).
  const correctTotal = p1.score + p2.score;
  let xpEarned = correctTotal * 4 + 6; // participou e treinou
  let coinsEarned = Math.max(3, correctTotal); // mínimo digno
  if (winner === "empate") {
    xpEarned += 10;
    coinsEarned += 4;
  } else {
    // Bónus de duelo decisivo — sem comparar nomes: dois "Tomás" davam o bónus
    // ao perfil errado (hot-seat não sabe de quem é o perfil). Quem perde
    // também sai a ganhar (participar já é treinar).
    xpEarned += 14;
    coinsEarned += 6;
  }

  const t = today();
  let streak = current.streak;
  if (current.lastPlayed !== t) {
    streak = current.lastPlayed && dayGap(current.lastPlayed) === 1 ? streak + 1 : 1;
  }

  const next: Profile = {
    ...current,
    xp: current.xp + xpEarned,
    coins: current.coins + coinsEarned,
    streak,
    lastPlayed: t,
    sessionHistory: [
      ...(current.sessionHistory ?? []),
      {
        d: t,
        s: "duelo",
        c: correctTotal,
        t: opts.totalQuestions,
        m: Math.max(1, opts.minutes),
        g: current.grade,
      },
    ].slice(-120),
  };
  saveProfile(next);
  return { xpEarned, coinsEarned, winner, profile: next };
}
