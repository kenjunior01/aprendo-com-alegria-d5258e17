// Motor de IA adaptativa (server-only). Calcula estatísticas por criança a partir
// de practice_sessions e pede à IA um relatório/sugestões. Quanto mais dados
// (sessões/minutos), mais profunda e específica é a adaptação.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";
function createRunIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
    return res;
  };
}

export interface SessionRow {
  subject_id: string;
  lesson_id: string;
  correct: number;
  total: number;
  duration_seconds: number;
  created_at: string;
}

export interface ChildStats {
  sessions: number;
  minutes: number;
  accuracy: number;
  activeDays: number;
  trend: number; // diferença de acerto (pontos %) entre a metade recente e a antiga
  bySubject: { subject: string; sessions: number; accuracy: number; minutes: number }[];
  weakLessons: { subject: string; lesson: string; accuracy: number; attempts: number }[];
  strongLessons: { subject: string; lesson: string; accuracy: number; attempts: number }[];
  level: "inicial" | "a_conhecer" | "detalhado" | "profundo";
}

export function computeStats(rows: SessionRow[]): ChildStats {
  let c = 0, t = 0, sec = 0;
  const days = new Set<string>();
  const subj: Record<string, { c: number; t: number; sec: number; n: number }> = {};
  const les: Record<string, { s: string; l: string; c: number; t: number; n: number }> = {};
  for (const r of rows) {
    c += r.correct; t += r.total; sec += r.duration_seconds;
    days.add(r.created_at.slice(0, 10));
    const b = (subj[r.subject_id] ??= { c: 0, t: 0, sec: 0, n: 0 });
    b.c += r.correct; b.t += r.total; b.sec += r.duration_seconds; b.n++;
    const k = `${r.subject_id}/${r.lesson_id}`;
    const L = (les[k] ??= { s: r.subject_id, l: r.lesson_id, c: 0, t: 0, n: 0 });
    L.c += r.correct; L.t += r.total; L.n++;
  }
  const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const half = Math.floor(sorted.length / 2);
  const acc = (xs: SessionRow[]) => {
    const tt = xs.reduce((a, x) => a + x.total, 0);
    return tt ? (xs.reduce((a, x) => a + x.correct, 0) / tt) * 100 : 0;
  };
  const trend = sorted.length >= 4 ? Math.round(acc(sorted.slice(half)) - acc(sorted.slice(0, half))) : 0;
  const lessons = Object.values(les)
    .filter((x) => x.t >= 3)
    .map((x) => ({ subject: x.s, lesson: x.l, accuracy: Math.round((x.c / x.t) * 100), attempts: x.n }));
  const minutes = Math.round(sec / 60);
  const level: ChildStats["level"] =
    rows.length < 3 ? "inicial" : rows.length < 10 || minutes < 30 ? "a_conhecer" : rows.length < 30 ? "detalhado" : "profundo";
  return {
    sessions: rows.length,
    minutes,
    accuracy: t ? Math.round((c / t) * 100) : 0,
    activeDays: days.size,
    trend,
    bySubject: Object.entries(subj).map(([s, v]) => ({
      subject: s, sessions: v.n, accuracy: v.t ? Math.round((v.c / v.t) * 100) : 0, minutes: Math.round(v.sec / 60),
    })),
    weakLessons: [...lessons].sort((a, b) => a.accuracy - b.accuracy).filter((x) => x.accuracy < 70).slice(0, 5),
    strongLessons: [...lessons].sort((a, b) => b.accuracy - a.accuracy).filter((x) => x.accuracy >= 85).slice(0, 5),
    level,
  };
}

export interface AiExercise {
  subject: string;
  lessonId: string | null;
  title: string;
  why: string;
  difficulty: "facil" | "medio" | "dificil";
  minutes: number;
}
export interface AiReport {
  summary: string;
  strengths: string[];
  needs: string[];
  exercises: AiExercise[];
  mascotMessage: string;
  adultTip: string;
  aiGenerated: boolean;
  error?: string;
}

export type Audience = "child" | "parent" | "teacher";

function fallback(stats: ChildStats, name: string, error?: string): AiReport {
  const weakest = [...stats.bySubject].sort((a, b) => a.accuracy - b.accuracy)[0];
  return {
    summary: stats.sessions
      ? `${name} fez ${stats.sessions} sessões (${stats.minutes} min) com ${stats.accuracy}% de acerto.`
      : `${name} ainda não tem sessões suficientes para análise.`,
    strengths: stats.strongLessons.slice(0, 3).map((l) => `${l.subject}: ${l.lesson} (${l.accuracy}%)`),
    needs: stats.weakLessons.slice(0, 3).map((l) => `${l.subject}: ${l.lesson} (${l.accuracy}%)`),
    exercises: stats.weakLessons.slice(0, 3).map((l) => ({
      subject: l.subject, lessonId: l.lesson, title: `Rever ${l.lesson}`, why: `Acerto de ${l.accuracy}%`,
      difficulty: "facil", minutes: 10,
    })),
    mascotMessage: weakest ? `Vamos treinar ${weakest.subject} juntos? Tu consegues!` : "Bora jogar a primeira missão?",
    adultTip: "Incentive sessões curtas e diárias de 10-15 minutos.",
    aiGenerated: false,
    error,
  };
}

const LEVEL_TEXT: Record<ChildStats["level"], string> = {
  inicial: "Poucos dados: sê prudente, sugestões gerais e de diagnóstico.",
  a_conhecer: "Dados moderados: começa a personalizar com cuidado.",
  detalhado: "Bons dados: personaliza claramente por lição e tendência.",
  profundo: "Muitos dados: análise intensa e muito específica, padrões, ritmo e progressão fina de dificuldade.",
};

export async function generateAiReport(opts: {
  name: string; age: number | null; grade: number; mascot: string; interests: string[];
  stats: ChildStats; audience: Audience; signal?: AbortSignal;
}): Promise<AiReport> {
  const { stats, name } = opts;
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return fallback(stats, name, "IA não configurada");
  if (stats.sessions === 0) return fallback(stats, name);

  const audienceText = {
    child: "O público é a própria criança: linguagem muito simples, carinhosa, curta, na voz da mascote.",
    parent: "O público são os pais: claro, sem jargão, prático para casa.",
    teacher: "O público é o professor: rigoroso, pedagógico, com indicadores e sugestões de intervenção em aula.",
  }[opts.audience];

  const system = `És o cérebro pedagógico da mascote "${opts.mascot}" da app Kidoz (crianças em Portugal/PALOP, currículo do 1.º ciclo).
Responde SEMPRE em pt-PT. Nunca uses "errado" nem rótulos negativos. ${audienceText}
${LEVEL_TEXT[stats.level]}
Responde APENAS com um objeto JSON válido (sem markdown) com as chaves:
summary (string, 2-3 frases), strengths (array de até 3 strings), needs (array de até 3 strings),
exercises (array de 3 a 5 objetos {subject, lessonId (id exato de uma lição fornecida ou null), title, why, difficulty: "facil"|"medio"|"dificil", minutes (número)}),
mascotMessage (string curta dirigida à criança, máx 20 palavras), adultTip (string, 1 frase para pais/professor).`;

  const user = JSON.stringify({
    crianca: { nome: name, idade: opts.age, ano: opts.grade, interesses: opts.interests },
    estatisticas: stats,
  });

  try {
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: createRunIdFetch(),
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system,
      messages: [{ role: "user", content: user }],
      abortSignal: opts.signal,
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return fallback(stats, name, "Resposta da IA vazia");
    const j = JSON.parse(m[0]) as Partial<AiReport>;
    const arr = (x: unknown) => (Array.isArray(x) ? x.map(String).slice(0, 3) : []);
    return {
      summary: String(j.summary ?? ""),
      strengths: arr(j.strengths),
      needs: arr(j.needs),
      exercises: (Array.isArray(j.exercises) ? j.exercises : []).slice(0, 5).map((e) => ({
        subject: String(e?.subject ?? "geral"),
        lessonId: e?.lessonId ? String(e.lessonId) : null,
        title: String(e?.title ?? "Exercício"),
        why: String(e?.why ?? ""),
        difficulty: (["facil", "medio", "dificil"].includes(String(e?.difficulty)) ? e.difficulty : "medio") as AiExercise["difficulty"],
        minutes: Math.min(30, Math.max(3, Number(e?.minutes) || 10)),
      })),
      mascotMessage: String(j.mascotMessage ?? "").slice(0, 200),
      adultTip: String(j.adultTip ?? ""),
      aiGenerated: true,
    };
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    const msg = status === 402 ? "Créditos de IA esgotados" : status === 429 ? "IA ocupada, tente daqui a pouco" : "IA indisponível de momento";
    return fallback(stats, name, msg);
  }
}
