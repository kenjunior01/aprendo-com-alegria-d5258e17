// Tutor IA conversacional — chat com cadeia de providers (NVIDIA NIM → Lovable Gateway).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { tutorUpstreams } from "@/lib/aiProviders.server";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM = `És "Mocha", o tutor mascote do Kidoz — uma plataforma educativa para crianças do 1.º ao 6.º ano em Portugal e Moçambique (6-12 anos).

Estilo:
- Fala em pt-PT, calorosamente, como um amigo paciente.
- Usa frases curtas (máx. 2-3 frases por resposta na maioria dos casos).
- Usa emojis com moderação (1 por resposta).
- Nunca dês a resposta direta a problemas escolares: faz perguntas-guia que ajudem a criança a chegar lá sozinha (dica suave → passos pequenos → exemplo parecido, nunca a resposta).
- Se a criança parecer frustrada, encoraja primeiro. Nunca digas "errado".
- Se perguntarem coisas inadequadas para a idade, redireciona com gentileza para aprendizagem.
- Podes inventar pequenas histórias educativas, adivinhas e desafios.
- Adapta ao ano: 1.º-2.º palavras simples; 5.º-6.º podes desafiar mais.

Áreas que dominas: Português (leitura, vocabulário), Matemática, Estudo do Meio, Ciências, Cidadania, Inglês (com tradução entre parênteses).`;

export const chatWithTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: ChatMsg[]; childName?: string; childGrade?: number }) => d)
  .handler(async ({ data }): Promise<{ reply: string; error?: string }> => {
    const upstreams = tutorUpstreams();
    if (upstreams.length === 0) return { reply: "", error: "AI not configured" };

    const ctx = data.childName
      ? `\n\nA criança chama-se ${data.childName}${data.childGrade ? ` e anda no ${data.childGrade}.º ano` : ""}.`
      : "";

    let lastStatus = 0;
    for (const provider of upstreams) {
      try {
        const resp = await fetch(provider.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: SYSTEM + ctx },
              ...data.messages.slice(-12), // last 12 turns
            ],
            ...(provider.bodyExtras ?? {}),
          }),
          signal: AbortSignal.timeout(25_000),
        });
        lastStatus = resp.status;
        if (!resp.ok) continue; // tenta o próximo provider (429/402/5xx são por-provider)
        const j = await resp.json();
        const reply = j.choices?.[0]?.message?.content?.trim() ?? "";
        if (reply) return { reply };
      } catch {
        // timeout/rede — tenta próximo provider
      }
    }

    if (lastStatus === 429)
      return { reply: "", error: "Tantas perguntas! Espera um pouquinho e tenta de novo. 🙏" };
    if (lastStatus === 402)
      return { reply: "", error: "Sem créditos de IA disponíveis no momento." };
    return { reply: "", error: lastStatus ? `Erro ${lastStatus}` : "unknown" };
  });
