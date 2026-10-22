// duelo.ts — Motor do Duelo da Família: 2 jogadores, 1 dispositivo, 0 discussões.
//
// Design pedagógico:
// • Perguntas da trivia Kidoz (890 no banco) filtradas pelo ano escolar —
//   justas para os dois, mesmo com idades diferentes. No modo "Misto" cada
//   jogador pode escolher o SEU ano (handicap por irmão): o de 6 anos só
//   recebe perguntas do 1.º, o de 10 só do 4.º — ou "Tudo" para o banco completo.
// • Alternância estrita com ecrã de passagem de vez — ninguém responde pelos
//   outros e cada criança tem o seu momento de brilho no palco.
// • Erro mostra a resposta certa + explicação (aprender > ganhar) e o tempo
//   de leitura é maior no erro do que no acerto (mesma regra do Quiz Relâmpago).
// • Recompensas para o perfil local: TODOS participam, quem vence ganha bónus —
//   nunca castigamos por perder (regressos sem culpa).
import { ALL_TRIVIA, type TriviaQuestion } from "@/lib/triviaBoost";
import { shuffled } from "@/lib/utils";
import { detectRegion, localizeQuestion } from "@/lib/region";
import { dayGap, loadProfile, saveProfile, type Profile } from "@/lib/storage";
import type { MascotId } from "@/lib/mascots";

export type DueloGrade = "1" | "2" | "3" | "4" | "misto";

export interface DueloPlayer {
  name: string;
  mascotId: MascotId;
  score: number;
}

export interface DueloQuestion extends TriviaQuestion {
  /** jogador que responde nesta pergunta (0 = P1, 1 = P2) — alternado */
  turn: 0 | 1;
}

/** Ano escolar → idades das perguntas da trivia (faixa justa). */
const GRADE_AGES: Record<DueloGrade, number[]> = {
  "1": [6, 7],
  "2": [7, 8],
  "3": [8, 9],
  "4": [9, 10],
  misto: [6, 7, 8, 9, 10],
};

export const DUELO_GRADE_LABEL: Record<DueloGrade, string> = {
  "1": "1.º ano",
  "2": "2.º ano",
  "3": "3.º ano",
  "4": "4.º ano",
  misto: "Misto",
};

/** Anos escolares do handicap por jogador (chips do modo Misto). */
export const DUELO_PLAYER_GRADES = [1, 2, 3, 4] as const;

/** Ano de um jogador no Misto: 1–4 ou null = banco completo ("Tudo"). */
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
): DueloQuestion[] {
  const region = loadProfile()?.region ?? detectRegion().code;
  const localize = (q: TriviaQuestion) => localizeQuestion(q, region);

  // Handicap por irmão: só com faixas DIFERENTES — anos iguais (ou Tudo+Tudo)
  // ficam no pool único clássico, que nunca repete pergunta entre os dois.
  if (playerGrades && playerGrades[0] !== playerGrades[1]) {
    const pools = playerGrades.map((g) =>
      shuffled(ALL_TRIVIA.filter((q) => playerAges(g).includes(q.age))),
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
  const pool = ALL_TRIVIA.filter((q) => ages.includes(q.age));
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
