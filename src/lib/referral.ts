// referral.ts — "Convita & Ganha": sistema de convites com recompensas.
//
// Zero-backend (como os Desafios Expressos): tudo viaja no URL.
// 1. A criança partilha https://kidoz.online/comecar?ref=CODE no WhatsApp.
// 2. O amigo cria o perfil e recebe bónus de boas-vindas (+120 moedas, +2 gemas).
// 3. O amigo devolve a confirmação: /convites?claim=TOKEN (botão "Aceitei o convite!").
// 4. Quem convidou valida o token, sobe de nível e ganha prémios:
//    1º convite → moedas · 2º → gemas · 3º → 7 DIAS PREMIUM · 5º → 15 dias · 8º → Embaixador.
//
// Tokens de aceitação são únicos (salt aleatória) e só podem ser usados uma vez
// (hash guardado localmente) — simples e à prova de duplicados casuais.
//
// Anti-abuso: os marcos que dão DIAS DE PREMIUM exigem sessão cloud — sem conta,
// caem em moedas. Assim, tokens fabricados deixam de dar Premium a dispositivos
// anónimos. (Verificação server-side completa dos convites: P1.)

import { loadProfile, updateProfile, type Profile } from "./storage";
import { grantPremiumDays } from "./premium";
import { supabase } from "@/integrations/supabase/client";

export const REF_CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/; // sem I,L,O,0,1 (evita confusão)

// ─── Código de convite ───
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 6): string {
  let out = "";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}

/** Código único do perfil — criado uma vez e guardado. */
export function ensureRefCode(): string {
  const p = loadProfile();
  if (!p) return "";
  if (p.refCode && REF_CODE_RE.test(p.refCode)) return p.refCode;
  const code = randomCode();
  updateProfile({ refCode: code });
  return code;
}

export function refLink(code: string): string {
  return `https://kidoz.online/comecar?ref=${code}`;
}

// ─── Token de aceitação (base64url de {r, n, s}) ───
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return b64 + "=".repeat((4 - (b64.length % 4)) % 4);
}

export interface ClaimToken {
  r: string; // refCode de quem convidou
  n: string; // nome de quem aceitou
  s: string; // salt
}

export function makeClaimToken(inviterCode: string, inviteeName: string): string {
  const payload: ClaimToken = {
    r: inviterCode.toUpperCase(),
    n: inviteeName.slice(0, 14) || "Um amigo",
    s: randomCode(4),
  };
  try {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return toUrlSafe(btoa(bin));
  } catch {
    return "";
  }
}

export function decodeClaimToken(token: string): ClaimToken | null {
  try {
    const bin = atob(fromUrlSafe(token));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const obj = JSON.parse(new TextDecoder().decode(bytes)) as Partial<ClaimToken>;
    if (typeof obj.r !== "string" || !REF_CODE_RE.test(obj.r.toUpperCase())) return null;
    return {
      r: obj.r.toUpperCase(),
      n: typeof obj.n === "string" ? obj.n.slice(0, 14) : "Um amigo",
      s: typeof obj.s === "string" ? obj.s : "",
    };
  } catch {
    return null;
  }
}

export function claimLink(token: string): string {
  return `https://kidoz.online/convites?claim=${token}`;
}

// ─── Mensagens WhatsApp ───
export function buildInviteMessage(name: string, code: string): string {
  return [
    `🎒 ${name} convidou-te para o Kidoz!`,
    "🦉 Aprender brincando: lições, jogos, mascotes e desafios com amigos.",
    "🎁 Entra com o convite e ganhas +120 moedas para a loja!",
    "",
    `▶️ Criar perfil: ${refLink(code)}`,
  ].join("\n");
}

export function buildAcceptMessage(inviteeName: string, token: string): string {
  return [
    `✅ ${inviteeName} aceitou o teu convite do Kidoz!`,
    "🎉 Toca aqui para receber o teu prémio:",
    "",
    `▶️ ${claimLink(token)}`,
  ].join("\n");
}

// ─── Estado local de convites aceite ───
const CLAIMS_KEY = "kidoz-ref-claims-v1";
const WELCOME_KEY = (code: string) => `kidoz-ref-welcome-${code}`;

interface RefState {
  accepted: string[]; // salts já reclamados (hash simples)
  count: number;
  rewardsGiven: number[]; // marcos já entregues
}

function loadState(): RefState {
  if (typeof window === "undefined") return { accepted: [], count: 0, rewardsGiven: [] };
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) return { accepted: [], count: 0, rewardsGiven: [] };
    return { accepted: [], count: 0, rewardsGiven: [], ...JSON.parse(raw) };
  } catch {
    return { accepted: [], count: 0, rewardsGiven: [] };
  }
}

function saveState(s: RefState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(s));
}

export const getInviteCount = (): number => loadState().count;
export const getRewardsGiven = (): number[] => loadState().rewardsGiven;

function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export interface ClaimResult {
  ok: boolean;
  reason?: "invalid" | "duplicate" | "noprofile";
  name?: string;
  count?: number;
  reward?: RefReward | null;
}

/** Registra a aceitação de um convite (token do amigo). */
export function acceptClaim(token: string): ClaimResult {
  const t = decodeClaimToken(token);
  if (!t) return { ok: false, reason: "invalid" };
  const me = loadProfile();
  if (!me?.name) return { ok: false, reason: "noprofile" };
  // Nota: t.r é SEMPRE o código de quem convida — e quem valida é o convidante.
  // (Um auto-claim fabricado fica travado pelo sistema de honra, à semelhança dos Desafios.)
  const state = loadState();
  const h = simpleHash(`${t.r}:${t.n}:${t.s}`);
  if (state.accepted.includes(h)) return { ok: false, reason: "duplicate" };
  state.accepted.push(h);
  if (state.accepted.length > 200) state.accepted.shift();
  state.count += 1;
  const reward = milestoneFor(state.count);
  if (reward && !state.rewardsGiven.includes(state.count)) {
    state.rewardsGiven.push(state.count);
  }
  saveState(state);
  // Garante que o código próprio existe para a próxima rodada
  ensureRefCode();
  return { ok: true, name: t.n, count: state.count, reward };
}

// ─── Bónus de boas-vindas (quem é convidado) ───
export function applyWelcomeBonus(refCode: string): { applied: boolean; profile?: Profile } {
  const code = refCode.toUpperCase().trim();
  if (!REF_CODE_RE.test(code)) return { applied: false };
  const key = WELCOME_KEY(code);
  if (typeof window !== "undefined" && localStorage.getItem(key)) return { applied: false };
  const p = loadProfile();
  if (!p) return { applied: false };
  const next = updateProfile({
    coins: p.coins + 140,
    invitedBy: code,
  });
  if (typeof window !== "undefined") localStorage.setItem(key, "1");
  return { applied: true, profile: next };
}

// ─── Marcos de recompensa ───
export interface RefReward {
  at: number;
  icon: string;
  title: string;
  desc: string;
}

export const MILESTONES: RefReward[] = [
  { at: 1, icon: "🪙", title: "150 Abracadinhos", desc: "Moedas para gastar na loja!" },
  { at: 2, icon: "🪙", title: "600 Abracadinhos", desc: "Uma fortuna para gastar na loja!" },
  {
    at: 3,
    icon: "👑",
    title: "7 dias de Premium",
    desc: "Uma semana desbloqueada — requer conta ligada!",
  },
  {
    at: 5,
    icon: "🏆",
    title: "15 dias de Premium + 300 moedas",
    desc: "Meio mês de magia — requer conta ligada!",
  },
  {
    at: 8,
    icon: "🌟",
    title: "Embaixador Kidoz",
    desc: "30 dias de Premium + título — requer conta ligada!",
  },
];

export function milestoneFor(count: number): RefReward | null {
  return MILESTONES.find((m) => m.at === count) ?? null;
}

/** Há sessão Supabase ativa neste dispositivo? */
async function hasCloudSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session?.user);
  } catch {
    return false;
  }
}

/** Entrega o prémio do marco atingido (idempotente por chamada).
 *  Dias de Premium exigem sessão cloud — sem conta, caem em moedas (anti-abuso).
 *  Devolve a nota a celebrar (ex.: fallback de moedas). */
export async function grantReward(
  reward: RefReward,
): Promise<{ profile: Profile | null; note: string }> {
  const p = loadProfile();
  if (!p) return { profile: null, note: "" };
  const coinsFallback = (coins: number, note: string) => ({
    profile: updateProfile({ coins: p.coins + coins }),
    note,
  });
  switch (reward.at) {
    case 1:
      return { profile: updateProfile({ coins: p.coins + 150 }), note: reward.title };
    case 2:
      return { profile: updateProfile({ coins: p.coins + 600 }), note: reward.title };
    case 3: {
      if (await hasCloudSession()) return { profile: grantPremiumDays(7), note: reward.title };
      return coinsFallback(250, "+250 moedas — liga a conta para dias Premium! 👑");
    }
    case 5: {
      if (await hasCloudSession()) {
        const after = grantPremiumDays(15);
        return { profile: updateProfile({ coins: after.coins + 300 }), note: reward.title };
      }
      return coinsFallback(400, "+400 moedas — liga a conta para dias Premium! 🏆");
    }
    case 8: {
      if (await hasCloudSession()) return { profile: grantPremiumDays(30), note: reward.title };
      return coinsFallback(800, "+800 moedas — liga a conta para dias Premium! 🌟");
    }
    default:
      return { profile: null, note: "" };
  }
}

export function nextMilestone(count: number): RefReward | null {
  return MILESTONES.find((m) => m.at > count) ?? null;
}
