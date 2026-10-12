// duelo.ts — Motor do Duelo da Família: 2 jogadores, 1 dispositivo, 0 discussões.
//
// Design pedagógico:
// • Perguntas da trivia Kidoz (890 no banco) filtradas pelo ano escolar —
//   justas para os dois, mesmo com idades diferentes (modo "Misto" abre tudo).
// • Alternância estrita com ecrã de passagem de vez — ninguém responde pelos
//   outros e cada criança tem o seu momento de brilho no palco.
// • Erro mostra a resposta certa + explicação (aprender > ganhar) e o tempo
//   de leitura é maior no erro do que no acerto (mesma regra do Quiz Relâmpago).
// • Recompensas para o perfil local: TODOS participam, quem vence ganha bónus —
//   nunca castigamos por perder (regressos sem culpa).
import { ALL_TRIVIA, type TriviaQuestion } from "@/lib/triviaBoost";
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
  misto: "Misto — todos",
};

/** Perguntas suficientes por ano para não repetir muito em duelos seguidos? */
export function dueloPoolSize(grade: DueloGrade): number {
  const ages = GRADE_AGES[grade];
  return ALL_TRIVIA.filter((q) => ages.includes(q.age)).length;
}

/**
 * Escolhe perguntas para o duelo: baralha o pool da faixa de idade e
 * devolve `perPlayer × 2` perguntas com a vez alternada (P1 começa).
 * Vocabulário localizado pela região do perfil (BR/AO/MZ…).
 */
export function pickDueloQuestions(grade: DueloGrade, perPlayer: number): DueloQuestion[] {
  const ages = GRADE_AGES[grade];
  const pool = ALL_TRIVIA.filter((q) => ages.includes(q.age));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const region = loadProfile()?.region ?? detectRegion().code;
  const total = Math.min(perPlayer * 2, shuffled.length);
  return shuffled.slice(0, total).map((q, i) => ({
    ...localizeQuestion(q, region),
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
    const winnerName = (winner === "p1" ? p1.name : p2.name).trim().toLowerCase();
    const mine = current.name.trim().toLowerCase();
    if (winnerName && winnerName === mine) {
      xpEarned += 18; // bónus de vitória — mas quem perde também sai a ganhar
      coinsEarned += 8;
    }
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
