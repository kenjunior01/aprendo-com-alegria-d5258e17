// Edge function: importa trivia da Open Trivia DB e traduz para PT-PT.
// Cache em public.trivia_cache (TTL 7 dias).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TTL_MS = 7 * 24 * 3600 * 1000;

// mapping de categoria interna → opentdb category id (free public, sem chave)
const CATEGORY_MAP: Record<string, number> = {
  general: 9,
  books: 10,
  film: 11,
  music: 12,
  science: 17,
  computers: 18,
  math: 19,
  mythology: 20,
  sports: 21,
  geography: 22,
  history: 23,
  animals: 27,
  vehicles: 28,
};

interface OpenTdbQ {
  category: string;
  type: "multiple";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface NormQ {
  category: string;
  difficulty: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&shy;/g, "")
    .replace(/&eacute;/g, "é").replace(/&aacute;/g, "á").replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú").replace(/&ntilde;/g, "ñ");

async function fetchOpenTdb(catId: number, amount: number, difficulty: string): Promise<OpenTdbQ[]> {
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${catId}&difficulty=${difficulty}&type=multiple`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`opentdb ${r.status}`);
  const j = await r.json();
  if (j.response_code !== 0) throw new Error(`opentdb code=${j.response_code}`);
  return j.results as OpenTdbQ[];
}

async function translateBatch(items: NormQ[], lovableKey: string): Promise<NormQ[]> {
  if (!lovableKey) return items; // sem chave, devolve em EN
  const prompt = `Traduz para português europeu (PT-PT, NUNCA português do Brasil) o seguinte JSON de perguntas de quiz para crianças. Mantém EXATAMENTE a mesma estrutura e ordem, traduz apenas "prompt" e "options". Não adiciones nem removas elementos. Devolve apenas JSON válido.

${JSON.stringify(items)}`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "És um tradutor PT-PT preciso. Devolves apenas JSON válido, sem markdown." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    console.warn("translate failed", resp.status);
    return items;
  }
  const j = await resp.json();
  const text = j.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(text);
    const arr: NormQ[] = Array.isArray(parsed) ? parsed : (parsed.questions ?? parsed.items ?? items);
    if (!Array.isArray(arr) || arr.length !== items.length) return items;
    return arr.map((q, i) => ({
      category: items[i].category,
      difficulty: items[i].difficulty,
      prompt: String(q.prompt ?? items[i].prompt),
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options.map(String) : items[i].options,
      answerIndex: items[i].answerIndex,
    }));
  } catch {
    return items;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { category = "general", difficulty = "easy", count = 25, force = false } =
      req.method === "POST" ? await req.json().catch(() => ({})) : Object.fromEntries(new URL(req.url).searchParams);

    const catId = CATEGORY_MAP[category] ?? CATEGORY_MAP.general;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) cache lookup
    if (!force) {
      const { data: cached } = await supabase
        .from("trivia_cache")
        .select("questions, fetched_at")
        .eq("category", category).eq("difficulty", difficulty).eq("lang", "pt-PT")
        .maybeSingle();
      if (cached && Date.now() - new Date(cached.fetched_at).getTime() < TTL_MS) {
        const qs = (cached.questions as NormQ[]).slice(0, Number(count));
        return new Response(JSON.stringify({ source: "cache", questions: qs }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2) fetch from opentdb
    const raw = await fetchOpenTdb(catId, Math.min(50, Math.max(10, Number(count))), String(difficulty));
    const norm: NormQ[] = raw.map((q) => {
      const correct = decode(q.correct_answer);
      const opts = [...q.incorrect_answers.map(decode), correct].sort(() => Math.random() - 0.5);
      return {
        category, difficulty: q.difficulty,
        prompt: decode(q.question), options: opts, answerIndex: opts.indexOf(correct),
      };
    });

    // 3) translate
    const lovableKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
    const translated = await translateBatch(norm, lovableKey);

    // 4) upsert cache
    await supabase.from("trivia_cache").upsert({
      category, difficulty, lang: "pt-PT", questions: translated, fetched_at: new Date().toISOString(),
    }, { onConflict: "category,difficulty,lang" });

    return new Response(JSON.stringify({ source: "fresh", questions: translated.slice(0, Number(count)) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trivia-import error", e);
    return new Response(JSON.stringify({ error: String(e), questions: [] }), {
      status: 200, // 200 + empty so client cai no fallback offline
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
