// Trivia source com cache local + fallback offline para `triviaBank`.
import { supabase } from "@/integrations/supabase/client";
import { TRIVIA_BANK, type TriviaQuestion } from "@/lib/triviaBank";

const LS_PREFIX = "kidoz.trivia.cache.v1::";
const LS_TTL_MS = 6 * 3600 * 1000; // 6h client cache

export interface RemoteTriviaQ {
  category: string;
  difficulty?: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}

function readLocal(key: string): RemoteTriviaQ[] | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const { at, qs } = JSON.parse(raw) as { at: number; qs: RemoteTriviaQ[] };
    if (Date.now() - at > LS_TTL_MS) return null;
    return qs;
  } catch { return null; }
}
function writeLocal(key: string, qs: RemoteTriviaQ[]) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify({ at: Date.now(), qs })); } catch {}
}

function fallbackOffline(count: number, age?: number): RemoteTriviaQ[] {
  const pool = TRIVIA_BANK.filter((q) => age == null || Math.abs(q.age - age) <= 2);
  const src = pool.length ? pool : TRIVIA_BANK;
  const shuffled = [...src].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((q: TriviaQuestion) => ({
    category: q.category, prompt: q.prompt, options: q.options, answerIndex: q.answerIndex,
  }));
}

export async function getTrivia(opts: {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  age?: number;
}): Promise<RemoteTriviaQ[]> {
  const category = opts.category ?? "general";
  const difficulty = opts.difficulty ?? "easy";
  const count = opts.count ?? 10;
  const cacheKey = `${category}:${difficulty}:${count}`;

  const local = readLocal(cacheKey);
  if (local && local.length >= count) return local.slice(0, count);

  try {
    const { data, error } = await supabase.functions.invoke("trivia-import", {
      body: { category, difficulty, count },
    });
    if (error) throw error;
    const qs: RemoteTriviaQ[] = Array.isArray(data?.questions) ? data.questions : [];
    if (qs.length >= Math.min(count, 5)) {
      writeLocal(cacheKey, qs);
      return qs.slice(0, count);
    }
  } catch (e) {
    console.warn("[triviaSource] remote failed, fallback offline", e);
  }
  return fallbackOffline(count, opts.age);
}
