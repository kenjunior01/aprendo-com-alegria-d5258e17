// Resolução de providers de IA para o tutor — server-side apenas.
//
// Ordem da cadeia (primeiro disponível ganha):
//   1. NVIDIA NIM (NVIDIA_API_KEY) — modelo nemotron com reasoning desligado
//      (respostas imediatas para crianças: 1.º token ~400ms, sem thinking em inglês).
//   2. Lovable AI Gateway (LOVABLE_API_KEY) — legado, mantido como fallback
//      quando a NVIDIA está indisponível ou sem créditos.
//
// Ambos os providers são OpenAI-compatible (chat/completions + stream SSE),
// por isso o consumidor só precisa de trocar url/key/model por chamada.

export interface AiUpstream {
  /** Identificador do provider — útil para logs/métricas. */
  id: "nvidia" | "lovable";
  /** URL absoluto do endpoint chat/completions. */
  url: string;
  apiKey: string;
  model: string;
  /** Extras de body (ex.: chat_template_kwargs para desligar o reasoning). */
  bodyExtras?: Record<string, unknown>;
}

const NIM_BASE = "https://integrate.api.nvidia.com/v1/chat/completions";
const LOVABLE_BASE = "https://ai.gateway.lovable.dev/v1/chat/completions";

/** Modelo NVIDIA por omissão — nemotron lightning: rápido (~1s) e forte em pt-PT. */
export const NVIDIA_DEFAULT_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";

/**
 * Cadeia de upstreams de chat ordenada por preferência.
 * Só devolve providers cuja chave está configurada; pode devolver [].
 */
export function tutorUpstreams(): AiUpstream[] {
  const out: AiUpstream[] = [];

  const nvKey = process.env.NVIDIA_API_KEY;
  if (nvKey) {
    out.push({
      id: "nvidia",
      url: NIM_BASE,
      apiKey: nvKey,
      model: process.env.NVIDIA_TUTOR_MODEL || NVIDIA_DEFAULT_MODEL,
      // Reasoning desligado: modelos nemotron "pensam" em inglês antes de
      // responder, o que atrasa o primeiro token e gasta tokens — mau para
      // crianças à espera de resposta. Validado a 2026-11-22.
      bodyExtras: { chat_template_kwargs: { enable_thinking: false } },
    });
  }

  const lvKey = process.env.LOVABLE_API_KEY;
  if (lvKey) {
    out.push({
      id: "lovable",
      url: LOVABLE_BASE,
      apiKey: lvKey,
      model: process.env.TUTOR_MODEL || "google/gemini-3-flash-preview",
    });
    out.push({
      id: "lovable",
      url: LOVABLE_BASE,
      apiKey: lvKey,
      model: "google/gemini-2.0-flash-exp", // último recurso se o primário falhar
    });
  }

  return out;
}
