// Eventos sazonais — banner que muda conforme o calendário e a região.
// Usa apenas data corrente (mês + dia) para evitar dependências externas.

import type { RegionCode } from "./region";

export interface SeasonalEvent {
  id: string;
  emoji: string;
  title: string;
  message: string;
  bg: string; // tailwind classes
  start: { m: number; d: number };
  end: { m: number; d: number };
  regions?: RegionCode[]; // se omisso, todas
}

const EVENTS: SeasonalEvent[] = [
  {
    id: "natal",
    emoji: "🎄",
    title: "Aventura de Natal",
    message: "Missões especiais com a família Pai Natal. Ganha estrelas douradas extra!",
    bg: "from-rose-500/20 via-emerald-500/15 to-amber-300/20",
    start: { m: 12, d: 1 }, end: { m: 12, d: 26 },
  },
  {
    id: "pascoa",
    emoji: "🐣",
    title: "Caça aos Ovos da Sabedoria",
    message: "Encontra ovos escondidos nas lições e desbloqueia uma surpresa!",
    bg: "from-pink-300/30 via-amber-200/30 to-emerald-300/30",
    start: { m: 3, d: 25 }, end: { m: 4, d: 15 },
  },
  {
    id: "carnaval",
    emoji: "🎭",
    title: "Carnaval em Festa",
    message: "Veste a tua mascote com fantasia e ganha o dobro de Abracadinhos hoje.",
    bg: "from-fuchsia-400/25 via-amber-400/25 to-cyan-400/25",
    start: { m: 2, d: 1 }, end: { m: 2, d: 28 },
  },
  {
    id: "dia-crianca-pt",
    emoji: "🎈",
    title: "Dia da Criança",
    message: "Hoje és o herói da Kidoz! Missões mais doces, prémios em dobro.",
    bg: "from-sky-300/30 via-pink-300/30 to-amber-200/30",
    start: { m: 6, d: 1 }, end: { m: 6, d: 1 },
  },
  {
    id: "dia-portugal",
    emoji: "🇵🇹",
    title: "Dia de Portugal",
    message: "Descobre Camões e os heróis lusos numa missão especial.",
    bg: "from-emerald-500/20 via-amber-300/20 to-rose-500/20",
    start: { m: 6, d: 10 }, end: { m: 6, d: 10 },
    regions: ["PT", "AO", "MZ", "CV"],
  },
  {
    id: "independencia-br",
    emoji: "🇧🇷",
    title: "Independência do Brasil",
    message: "Aprende com Dom Pedro I num desafio histórico.",
    bg: "from-emerald-500/20 via-amber-300/20 to-sky-500/20",
    start: { m: 9, d: 7 }, end: { m: 9, d: 7 },
    regions: ["BR"],
  },
  {
    id: "independencia-ao",
    emoji: "🇦🇴",
    title: "Independência de Angola",
    message: "Conhece a história do 11 de Novembro.",
    bg: "from-rose-500/20 via-amber-400/20 to-slate-700/20",
    start: { m: 11, d: 11 }, end: { m: 11, d: 11 },
    regions: ["AO"],
  },
  {
    id: "independencia-mz",
    emoji: "🇲🇿",
    title: "Independência de Moçambique",
    message: "Descobre a bandeira e os símbolos do país.",
    bg: "from-emerald-500/20 via-rose-500/20 to-amber-300/20",
    start: { m: 6, d: 25 }, end: { m: 6, d: 25 },
    regions: ["MZ"],
  },
];

function inRange(today: Date, ev: SeasonalEvent): boolean {
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const a = ev.start.m * 100 + ev.start.d;
  const b = ev.end.m * 100 + ev.end.d;
  const t = m * 100 + d;
  return t >= a && t <= b;
}

export function currentSeasonalEvent(region: RegionCode | undefined, now = new Date()): SeasonalEvent | null {
  for (const ev of EVENTS) {
    if (!inRange(now, ev)) continue;
    if (ev.regions && (!region || !ev.regions.includes(region))) continue;
    return ev;
  }
  return null;
}
