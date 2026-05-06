// Streaming chat endpoint para o Tutor IA (Mocha).
// Recebe POST com { messages, childName, childGrade } e responde com text/event-stream
// passando os tokens vindos do Lovable AI Gateway tal como saem.

import { createFileRoute } from "@tanstack/react-router";

interface ChatMsg { role: "user" | "assistant"; content: string }

const SYSTEM = `És "Mocha", o tutor mascote do Kidoz — uma plataforma educativa para crianças do 1.º ciclo em Portugal (6-10 anos).

Estilo:
- Fala em pt-PT, calorosamente, como um amigo paciente.
- Usa frases curtas (máx. 2-3 frases por resposta na maioria dos casos).
- Usa emojis com moderação (1 por resposta).
- Nunca dês a resposta direta a problemas escolares: faz perguntas-guia que ajudem a criança a chegar lá sozinha.
- Se a criança parecer frustrada, encoraja primeiro.
- Se perguntarem coisas inadequadas para a idade, redireciona com gentileza para aprendizagem.
- Podes inventar pequenas histórias educativas, adivinhas e desafios.

Áreas que dominas: Português (leitura, vocabulário), Matemática (1.º ao 4.º ano), Estudo do Meio.`;

export const Route = createFileRoute("/api/public/tutor-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
        }

        let body: { messages: ChatMsg[]; childName?: string; childGrade?: number };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid body", { status: 400 });
        }

        if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 30) {
          return new Response("Invalid messages", { status: 400 });
        }
        // sanity: cada mensagem com role e content (max 2000 chars)
        for (const m of body.messages) {
          if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || m.content.length > 2000) {
            return new Response("Invalid messages", { status: 400 });
          }
        }

        const ctx = body.childName
          ? `\n\nA criança chama-se ${body.childName.slice(0, 50)}${body.childGrade ? ` e anda no ${body.childGrade}.º ano` : ""}.`
          : "";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM + ctx },
              ...body.messages.slice(-12),
            ],
          }),
        });

        if (upstream.status === 429) {
          return new Response(JSON.stringify({ error: "rate-limited" }), { status: 429 });
        }
        if (upstream.status === 402) {
          return new Response(JSON.stringify({ error: "no-credits" }), { status: 402 });
        }
        if (!upstream.ok || !upstream.body) {
          return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), { status: 502 });
        }

        // Re-emit SSE: parse Lovable AI's SSE chunks and forward only deltas as plain text events.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const raw of lines) {
                  const line = raw.trim();
                  if (!line || !line.startsWith("data:")) continue;
                  const payload = line.slice(5).trim();
                  if (payload === "[DONE]") {
                    controller.enqueue(encoder.encode("event: done\ndata: \n\n"));
                    continue;
                  }
                  try {
                    const json = JSON.parse(payload);
                    const delta: string | undefined = json.choices?.[0]?.delta?.content;
                    if (delta) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ t: delta })}\n\n`));
                    }
                  } catch {
                    /* ignore */
                  }
                }
              }
              controller.enqueue(encoder.encode("event: done\ndata: \n\n"));
            } catch (e) {
              const msg = e instanceof Error ? e.message : "stream error";
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: msg })}\n\n`));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
