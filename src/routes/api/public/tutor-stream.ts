// Streaming chat endpoint para o Tutor IA (Mocha).
// Recebe POST com { messages, childName, childGrade } e responde com text/event-stream
// passando os tokens vindos do Lovable AI Gateway tal como saem.

import { createFileRoute } from "@tanstack/react-router";

interface ChatMsg { role: "user" | "assistant"; content: string }

const DEFAULT_SYSTEM = `És um tutor mascote do Alegria — uma plataforma educativa para crianças do 1.º ciclo em Portugal e Moçambique (6-10 anos).

Estilo:
- Fala em português, calorosamente, como um amiguinho.
- Usa frases curtas (máx. 2-3 frases por resposta na maioria dos casos).
- Usa emojis com moderação.
- Nunca dês a resposta direta a problemas escolares: faz perguntas-guia.
- Redireciona com gentileza para aprendizagem se necessário.

Áreas: Português, Matemática, Estudo do Meio.`;

export const Route = createFileRoute("/api/public/tutor-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
        }

        let body: { messages: ChatMsg[]; childName?: string; childGrade?: number; mascotPersona?: string };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid body", { status: 400 });
        }

        if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 30) {
          return new Response("Invalid messages", { status: 400 });
        }

        const mascotPersona = body.mascotPersona || "És uma coruja sábia chamada Mocha.";
        const ctx = body.childName
          ? `\n\nA criança chama-se ${body.childName.slice(0, 50)}${body.childGrade ? ` e anda no ${body.childGrade}.º ano` : ""}.`
          : "";

        const systemPrompt = `${DEFAULT_SYSTEM}\n\nPERSONA ESPECÍFICA:\n${mascotPersona}${ctx}`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp",
            stream: true,
            messages: [
              { role: "system", content: systemPrompt },
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
