// Desafio Diário — quiz rápido estilo Duolingo que muda todos os dias
// 5 perguntas mistas, bónus de streak, XP e moedas
import { SUBJECTS, type Question, type SubjectId, type GradeLevel } from "./curriculum";

// ─── Daily Challenge Data ───
export interface DailyChallengeQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  hint?: string;
  subjectEmoji: string;
  subjectName: string;
  subjectId: SubjectId;
}

export interface DailyChallengeState {
  date: string; // YYYY-MM-DD
  questions: DailyChallengeQuestion[];
  answers: (number | null)[]; // index of chosen answer, null = unanswered
  startedAt: number | null; // timestamp
  completedAt: number | null;
  streakBonus: number; // calculated from profile.streak
}

const KEY = "alegria-daily-challenge-v1";

// ─── Seeded random for deterministic daily questions ───
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateToSeed(date: string): number {
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed = ((seed << 5) - seed + date.charCodeAt(i)) | 0;
  }
  return Math.abs(seed);
}

// ─── Generate daily challenge ───
export function generateDailyChallenge(date: string, grade: GradeLevel): DailyChallengeQuestion[] {
  const seed = dateToSeed(date);
  const rand = seededRandom(seed);

  // Collect all questions from subjects at or below the child's grade
  const allQuestions: DailyChallengeQuestion[] = [];
  for (const subject of SUBJECTS) {
    const relevantLessons = subject.lessons.filter((l) => l.grade <= grade);
    for (const lesson of relevantLessons) {
      for (const q of lesson.questions) {
        allQuestions.push({
          ...q,
          subjectEmoji: subject.emoji,
          subjectName: subject.name,
          subjectId: subject.id,
        });
      }
    }
  }

  // Shuffle with seeded random
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick 5, ensuring variety of subjects
  const selected: DailyChallengeQuestion[] = [];
  const subjectsUsed = new Set<SubjectId>();

  // First pass: one from each subject
  for (const q of shuffled) {
    if (selected.length >= 5) break;
    if (!subjectsUsed.has(q.subjectId)) {
      selected.push(q);
      subjectsUsed.add(q.subjectId);
    }
  }

  // Fill remaining with any questions
  for (const q of shuffled) {
    if (selected.length >= 5) break;
    if (!selected.includes(q)) {
      selected.push(q);
    }
  }

  return selected.slice(0, 5);
}

// ─── Persistence ───
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function loadDailyChallenge(grade: GradeLevel): DailyChallengeState {
  const today = todayStr();
  if (typeof window === "undefined") {
    return {
      date: today,
      questions: generateDailyChallenge(today, grade),
      answers: [null, null, null, null, null],
      startedAt: null,
      completedAt: null,
      streakBonus: 0,
    };
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyChallengeState;
      if (parsed.date === today) return parsed;
    }
  } catch {
    // ignore
  }

  const fresh: DailyChallengeState = {
    date: today,
    questions: generateDailyChallenge(today, grade),
    answers: [null, null, null, null, null],
    startedAt: null,
    completedAt: null,
    streakBonus: 0,
  };
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveDailyChallenge(state: DailyChallengeState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

// ─── Calculate rewards ───
export function calculateDailyChallengeRewards(state: DailyChallengeState, streak: number): {
  correct: number;
  total: number;
  xpEarned: number;
  coinsEarned: number;
  streakMultiplier: number;
  perfectBonus: boolean;
} {
  const correct = state.answers.reduce((sum, ans, i) => {
    if (ans === null) return sum;
    return sum + (ans === state.questions[i]?.answerIndex ? 1 : 0);
  }, 0);
  const total = state.questions.length;
  const perfect = correct === total;

  // Streak multiplier: 1.0 base, +0.1 per 3 days of streak, max 2.0
  const streakMultiplier = Math.min(2.0, 1.0 + Math.floor(streak / 3) * 0.1);

  // Base XP: 10 per correct answer
  let xpEarned = Math.round(correct * 10 * streakMultiplier);

  // Perfect bonus: +50 XP
  let perfectBonus = false;
  if (perfect) {
    xpEarned += 50;
    perfectBonus = true;
  }

  // Coins: 5 per correct + 20 for perfect
  let coinsEarned = Math.round(correct * 5 * streakMultiplier);
  if (perfect) coinsEarned += 20;

  return { correct, total, xpEarned, coinsEarned, streakMultiplier, perfectBonus };
}

// ─── Answer a question ───
export function answerDailyChallenge(
  state: DailyChallengeState,
  questionIndex: number,
  answerIndex: number,
): { state: DailyChallengeState; isCorrect: boolean } {
  const newAnswers = [...state.answers];
  newAnswers[questionIndex] = answerIndex;

  const isCorrect = answerIndex === state.questions[questionIndex]?.answerIndex;

  const now = Date.now();
  const allAnswered = newAnswers.every((a) => a !== null);

  const newState: DailyChallengeState = {
    ...state,
    answers: newAnswers,
    startedAt: state.startedAt ?? now,
    completedAt: allAnswered ? now : null,
  };

  saveDailyChallenge(newState);
  return { state: newState, isCorrect };
}

// ─── Check if today's challenge is available (not yet completed) ───
export function isDailyChallengeAvailable(state: DailyChallengeState): boolean {
  return state.completedAt === null;
}
