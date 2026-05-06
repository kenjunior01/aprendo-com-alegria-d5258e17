// IA adaptativa — server function que analisa as últimas sessões da criança
// e devolve uma recomendação + dica motivacional personalizada.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface Recommendation {
  title: string;
  message: string;
  focusSubject: "portugues" | "matematica" | "estudo-do-meio" | "geral";
  difficulty: "facil" | "medio" | "dificil";
}

export const getAdaptiveRecommendation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Recommendation> => {
    const { supabase, userId } = context;

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

    const prompt = `És um tutor educacional para crianças do 1.º ciclo em Portugal, simpático e encorajador.
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
            { role: "system", content: "És um tutor educacional infantil em pt-PT. Sê breve, caloroso e motivador." },
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
