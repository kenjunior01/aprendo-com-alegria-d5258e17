// Tutor IA conversacional — chat com Gemini via Lovable AI Gateway.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface ChatMsg { role: "user" | "assistant"; content: string }

const SYSTEM = `És "Mocha", o tutor mascote do Lusis — uma plataforma educativa para crianças do 1.º ciclo em Portugal (6-10 anos).

Estilo:
- Fala em pt-PT, calorosamente, como um amigo paciente.
- Usa frases curtas (máx. 2 frases por resposta na maioria dos casos).
- Usa emojis com moderação (1 por resposta).
- Nunca dês a resposta direta a problemas escolares: faz perguntas-guia que ajudem a criança a chegar lá sozinha.
- Se a criança parecer frustrada, encoraja primeiro.
- Se perguntarem coisas inadequadas para a idade, redireciona com gentileza para aprendizagem.
- Podes inventar pequenas histórias educativas, adivinhas e desafios.

Áreas que dominas: Português (leitura, vocabulário), Matemática (1.º ao 4.º ano), Estudo do Meio.`;

export const chatWithTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: ChatMsg[]; childName?: string; childGrade?: number }) => d)
  .handler(async ({ data }): Promise<{ reply: string; error?: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { reply: "", error: "AI not configured" };

    const ctx = data.childName
      ? `\n\nA criança chama-se ${data.childName}${data.childGrade ? ` e anda no ${data.childGrade}.º ano` : ""}.`
      : "";

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM + ctx },
            ...data.messages.slice(-12), // last 12 turns
          ],
        }),
      });
      if (resp.status === 429) return { reply: "", error: "Tantas perguntas! Espera um pouquinho e tenta de novo. 🙏" };
      if (resp.status === 402) return { reply: "", error: "Sem créditos de IA disponíveis no momento." };
      if (!resp.ok) return { reply: "", error: `Erro ${resp.status}` };
      const j = await resp.json();
      const reply = j.choices?.[0]?.message?.content?.trim() ?? "";
      return { reply };
    } catch (e) {
      return { reply: "", error: e instanceof Error ? e.message : "unknown" };
    }
  });
