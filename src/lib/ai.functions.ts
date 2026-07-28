// IA adaptativa — server functions para recomendação e explicação de erros.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface Recommendation {
  title: string;
  message: string;
  focusSubject: "portugues" | "matematica" | "estudo-do-meio" | "geral";
  difficulty: "facil" | "medio" | "dificil";
}

interface MistakeExplanationInput {
  question: string;
  childAnswer: string;
  correctAnswer: string;
  subject: string;
  grade: number;
}

interface MistakeExplanation {
  explanation: string;
  hint: string;
}

export const explainMistake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): MistakeExplanationInput => {
    const i = input as Partial<MistakeExplanationInput>;
    return {
      question: String(i.question ?? "").slice(0, 500),
      childAnswer: String(i.childAnswer ?? "").slice(0, 200),
      correctAnswer: String(i.correctAnswer ?? "").slice(0, 200),
      subject: String(i.subject ?? "geral").slice(0, 40),
      grade: Math.min(6, Math.max(1, Number(i.grade) || 1)),
    };
  })
  .handler(async ({ data }): Promise<MistakeExplanation> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        explanation: `A resposta certa é "${data.correctAnswer}". Não faz mal — vamos tentar outra vez!`,
        hint: "Lê devagar a pergunta antes de responderes.",
      };
    }

    const systemMsg = `És um tutor educacional carinhoso para crianças do ${data.grade}.º ano em Portugal.
Responde SEMPRE em pt-PT, com tom encorajador, sem nunca dizer "errado". Usa frases curtas e uma analogia simples.
NUNCA reveles a resposta correta antes de explicar o porquê.`;

    const userMsg = `Disciplina: ${data.subject}
Pergunta: "${data.question}"
Resposta da criança: "${data.childAnswer}"
Resposta correta: "${data.correctAnswer}"

Explica em 1-2 frases curtas porque a resposta correta é a correta, e dá uma dica para a próxima tentativa.`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userMsg },
          ],
          tools: [{
            type: "function",
            function: {
              name: "explain",
              description: "Explicar de forma encorajadora à criança",
              parameters: {
                type: "object",
                properties: {
                  explanation: { type: "string", description: "Explicação curta e gentil em pt-PT (1-2 frases)" },
                  hint: { type: "string", description: "Dica curta para a próxima tentativa em pt-PT" },
                },
                required: ["explanation", "hint"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "explain" } },
        }),
      });

      if (resp.status === 429) {
        return { explanation: "Vamos com calma — respira fundo!", hint: "Tenta de novo daqui a pouco." };
      }
      if (!resp.ok) throw new Error(`AI ${resp.status}`);
      const json = await resp.json();
      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (args) return JSON.parse(args) as MistakeExplanation;
    } catch {
      /* fallthrough */
    }

    return {
      explanation: `A resposta certa é "${data.correctAnswer}". Olha bem para a pergunta — vais ver que faz sentido!`,
      hint: "Lê a pergunta em voz alta antes de escolher.",
    };
  });



export const getAdaptiveRecommendation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Recommendation> => {
    const { supabase, userId } = context;

    // Profile (region + interests)
    const { data: prof } = await supabase
      .from("profiles")
      .select("region, interests, name")
      .eq("id", userId)
      .maybeSingle();
    const region = (prof as { region?: string | null } | null)?.region ?? "PT";
    const interests = ((prof as { interests?: string[] } | null)?.interests ?? []) as string[];

    // Last 20 sessions
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("subject_id, correct, total, duration_seconds, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!sessions || sessions.length === 0) {
      return {
        title: "Vamos começar a aventura!",
        message: "Faz a tua primeira missão para eu poder ajudar-te melhor. Tu consegues!",
        focusSubject: "geral",
        difficulty: "facil",
      };
    }

    // Aggregate accuracy per subject
    const stats: Record<string, { correct: number; total: number }> = {};
    for (const s of sessions) {
      const k = s.subject_id;
      stats[k] = stats[k] ?? { correct: 0, total: 0 };
      stats[k].correct += s.correct;
      stats[k].total += s.total;
    }
    const summary = Object.entries(stats).map(([sub, v]) => ({
      sub,
      acc: v.total ? v.correct / v.total : 0,
      total: v.total,
    }));

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      const weakest = summary.sort((a, b) => a.acc - b.acc)[0];
      return {
        title: "Continua a praticar!",
        message: `Estás a sair-te bem. Tenta mais missões de ${weakest?.sub ?? "qualquer disciplina"}.`,
        focusSubject: (weakest?.sub as Recommendation["focusSubject"]) ?? "geral",
        difficulty: "medio",
      };
    }

    // Lazy-import server-only helper to keep this file lean
    const { regionalContextPrompt } = await import("@/lib/region");
    const ctx = regionalContextPrompt(region as never, interests);

    const prompt = `És um tutor educacional infantil simpático e encorajador.
${ctx}
Analisa o desempenho recente e recomenda em que se devem focar a seguir.
Responde APENAS via tool calling.

Estatísticas:
${summary.map((s) => `- ${s.sub}: ${Math.round(s.acc * 100)}% de acerto em ${s.total} respostas`).join("\n")}

Última sessão: ${sessions[0].subject_id}, ${sessions[0].correct}/${sessions[0].total}.`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `És um tutor educacional infantil. ${ctx} Sê breve, caloroso e motivador.` },
            { role: "user", content: prompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "recommend",
              description: "Recomendar próximo foco à criança",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Título curto, máx 6 palavras, em pt-PT" },
                  message: { type: "string", description: "Mensagem motivadora 1-2 frases, em pt-PT" },
                  focusSubject: { type: "string", enum: ["portugues", "matematica", "estudo-do-meio", "geral"] },
                  difficulty: { type: "string", enum: ["facil", "medio", "dificil"] },
                },
                required: ["title", "message", "focusSubject", "difficulty"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "recommend" } },
        }),
      });

      if (!resp.ok) throw new Error(`AI ${resp.status}`);
      const data = await resp.json();
      const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (args) return JSON.parse(args) as Recommendation;
    } catch {
      // fallthrough
    }

    const weakest = summary.sort((a, b) => a.acc - b.acc)[0];
    return {
      title: "Continua, estás a ir bem!",
      message: `Foca-te um pouco mais em ${weakest?.sub ?? "praticar"} e vais ver progressos rápidos.`,
      focusSubject: (weakest?.sub as Recommendation["focusSubject"]) ?? "geral",
      difficulty: "medio",
    };
  });
