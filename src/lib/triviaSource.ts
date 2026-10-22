// Trivia source com cache local + fallback offline para `triviaBank` + `triviaBoost`.
import { supabase } from "@/integrations/supabase/client";
import { ALL_TRIVIA, type TriviaQuestion } from "@/lib/triviaBoost";
import { shuffled } from "@/lib/utils";

const LS_PREFIX = "alegria.trivia.cache.v1::";
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
  } catch {
    return null;
  }
}
function writeLocal(key: string, qs: RemoteTriviaQ[]) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ at: Date.now(), qs }));
  } catch {
    // storage cheio/indisponível — falha silenciosa OK para cache
  }
}

function fallbackOffline(count: number, age?: number): RemoteTriviaQ[] {
  const pool = ALL_TRIVIA.filter((q) => age == null || Math.abs(q.age - age) <= 2);
  const src = pool.length ? pool : ALL_TRIVIA;
  const baralhado = shuffled(src).slice(0, count);
  return baralhado.map((q: TriviaQuestion) => ({
    category: q.category,
    prompt: q.prompt,
    options: q.options,
    answerIndex: q.answerIndex,
  }));
}

export type TriviaSourceKind = "remote" | "offline";

/**
 * Como `getTrivia`, mas diz DE ONDE vieram as perguntas. Quem mistura remotas
 * com o banco local (Duelo) precisa disto: o fallback "offline" devolve
 * perguntas DO BANCO LOCAL — aceitá-las como "extras" duplicaria o pool.
 */
export async function getTriviaWithSource(opts: {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  age?: number;
}): Promise<{ questions: RemoteTriviaQ[]; source: TriviaSourceKind }> {
  const category = opts.category ?? "general";
  const difficulty = opts.difficulty ?? "easy";
  const count = opts.count ?? 10;
  const cacheKey = `${category}:${difficulty}:${count}`;

  // Cache local só é escrito a partir de sucesso remoto → origem "remote"
  const local = readLocal(cacheKey);
  if (local && local.length >= count) {
    return { questions: local.slice(0, count), source: "remote" };
  }

  try {
    const { data, error } = await supabase.functions.invoke("trivia-import", {
      body: { category, difficulty, count },
    });
    if (error) throw error;
    const qs: RemoteTriviaQ[] = Array.isArray(data?.questions) ? data.questions : [];
    if (qs.length >= Math.min(count, 5)) {
      writeLocal(cacheKey, qs);
      return { questions: qs.slice(0, count), source: "remote" };
    }
  } catch (e) {
    console.warn("[triviaSource] remote failed, fallback offline", e);
  }
  return { questions: fallbackOffline(count, opts.age), source: "offline" };
}

export async function getTrivia(opts: {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  age?: number;
}): Promise<RemoteTriviaQ[]> {
  return (await getTriviaWithSource(opts)).questions;
}

/** Converte uma pergunta remota (sem idade) para o formato do banco local. */
export function remoteToTrivia(q: RemoteTriviaQ, age: number): TriviaQuestion {
  return {
    category: q.category,
    age,
    prompt: q.prompt,
    options: q.options,
    answerIndex: q.answerIndex,
  };
}
