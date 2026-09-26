// challengeShare.ts — Desafio Expresso via link (WhatsApp, copiar, partilha nativa).
// O desafio viaja 100% no URL (payload compacto base64url) — zero backend,
// funciona sem conta e abre no WhatsApp com wa.me (funciona no APK também).

import { getSubject, getLesson } from "@/lib/curriculum";
import { TRACKS, type TrackId } from "@/lib/infiniteChallenges";
import type { MascotId } from "@/lib/mascots";

const SITE = "https://kidoz.online";

export type ChallengePayload =
  | { k: "lesson"; s: string; l: string; n: string; c?: number; m?: MascotId }
  | { k: "infinite"; t: TrackId; l: number; n: string; s?: number; m?: MascotId };

// ─── Codificação compacta (base64url de JSON com chaves curtas) ───
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return b64 + "=".repeat((4 - (b64.length % 4)) % 4);
}

function encodeShort(p: ChallengePayload): Record<string, unknown> {
  if (p.k === "lesson") {
    const o: Record<string, unknown> = { k: "l", s: p.s, l: p.l, n: p.n };
    if (p.c !== undefined) o.c = p.c;
    if (p.m) o.m = p.m;
    return o;
  }
  const o: Record<string, unknown> = { k: "i", t: p.t, l: p.l, n: p.n };
  if (p.s !== undefined) o.s = p.s;
  if (p.m) o.m = p.m;
  return o;
}

function decodeShort(o: Record<string, unknown>): ChallengePayload | null {
  try {
    if (
      o.k === "l" &&
      typeof o.s === "string" &&
      typeof o.l === "string" &&
      typeof o.n === "string"
    ) {
      const out: ChallengePayload = { k: "lesson", s: o.s, l: o.l, n: o.n };
      if (typeof o.c === "number") out.c = o.c;
      if (typeof o.m === "string") out.m = o.m as MascotId;
      return out;
    }
    if (
      o.k === "i" &&
      typeof o.t === "string" &&
      typeof o.l === "number" &&
      typeof o.n === "string"
    ) {
      const out: ChallengePayload = { k: "infinite", t: o.t as TrackId, l: o.l, n: o.n };
      if (typeof o.s === "number") out.s = o.s;
      if (typeof o.m === "string") out.m = o.m as MascotId;
      return out;
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeChallenge(p: ChallengePayload): string {
  try {
    const json = JSON.stringify(encodeShort(p));
    // UTF-8 safe base64
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return toUrlSafe(btoa(bin));
  } catch {
    return "";
  }
}

export function decodeChallenge(code: string): ChallengePayload | null {
  try {
    const bin = atob(fromUrlSafe(code));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return decodeShort(JSON.parse(json) as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ─── URLs ───
export function challengeLink(p: ChallengePayload): string {
  const code = encodeChallenge(p);
  return `${SITE}/desafio?p=${code}`;
}

export function buildChallengeMessage(p: ChallengePayload): string {
  const link = challengeLink(p);
  if (p.k === "lesson") {
    const lesson = getLesson(p.s, p.l);
    const subject = getSubject(p.s);
    const title = lesson ? `${subject?.emoji ?? "📚"} ${lesson.title}` : "um desafio";
    const parts = [
      `🏆 ${p.n} desafiou-te no Kidoz!`,
      `${title} (${subject?.name ?? ""})`,
      p.c !== undefined ? `🎯 Pontuação a bater: ${p.c}%` : "🎯 Consegues ganhar?",
      "",
      `▶️ Jogar: ${link}`,
    ];
    return parts.filter(Boolean).join("\n");
  }
  const track = TRACKS.find((t) => t.id === p.t);
  const parts = [
    `🏆 ${p.n} desafiou-te no Kidoz!`,
    `${track?.emoji ?? "⚡"} ${track?.name ?? "Desafio Infinito"} — Nível ${p.l}`,
    p.s !== undefined ? `⭐ Estrelas a bater: ${p.s}` : "⭐ Consegues 3 estrelas?",
    "",
    `▶️ Jogar: ${link}`,
  ];
  return parts.filter(Boolean).join("\n");
}

// ─── Partilha ───
export async function shareChallenge(
  p: ChallengePayload,
): Promise<"shared" | "whatsapp" | "copied" | "failed"> {
  const message = buildChallengeMessage(p);
  const link = challengeLink(p);
  // 1) Partilha nativa (Android APK / iOS / Android WebView com intent)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "Desafio Kidoz ⚡", text: message, url: link });
      return "shared";
    } catch (e) {
      // AbortError = utilizador cancelou; outros erros → tentar WhatsApp
      if (e instanceof Error && e.name === "AbortError") return "failed";
    }
  }
  // 2) WhatsApp direto (funciona em qualquer telemóvel com WhatsApp instalado)
  return openWhatsApp(message) ? "whatsapp" : copyLink(link);
}

export function openWhatsApp(message: string): boolean {
  try {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    return win !== null;
  } catch {
    return false;
  }
}

export async function copyLink(link: string): Promise<"copied" | "failed"> {
  try {
    await navigator.clipboard.writeText(link);
    return "copied";
  } catch {
    // Fallback legacy
    try {
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return "copied";
    } catch {
      return "failed";
    }
  }
}

/** Nome curto para "Desafiado por X" — limita a 12 chars e remove emojis. */
export function cleanName(name: string): string {
  const cleaned = name.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
  return (cleaned || "Um amigo").slice(0, 12);
}
