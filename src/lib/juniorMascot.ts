// Sistema de mascote dinâmico para o Alegria Júnior (PT).
// O mascote evolui com a aprendizagem (sessões, jogos), tem emoções,
// vozes (rate/pitch), e cenários que o miúdo pode escolher ou que mudam
// automaticamente com o nível.

import type { JuniorProgress } from "./junior";

export type Emotion = "feliz" | "entusiasmado" | "curioso" | "orgulhoso" | "calmo" | "sonolento";
export type SceneId = "jardim" | "praia" | "espaco" | "floresta" | "castelo";
export type VoiceTone = "doce" | "energica" | "sussurro";

export interface JuniorMascotStateBase {
  scene: SceneId;
  voice: VoiceTone;
  unlockedScenes: SceneId[];
}
export interface JuniorMascotComputed extends JuniorMascotStateBase {
  level: number;          // 1..10+
  emotion: Emotion;       // derived from recency / progress
  xp: number;             // derived from sessions and games played
  nextLevelAt: number;    // xp needed for next level
  unlockedScenes: SceneId[];
  greeting: string;       // PT greeting tailored to emotion + scene
  encouragement: string;  // PT phrase for after a play session
}

export interface SceneMeta {
  id: SceneId; name: string; emoji: string; gradient: string;
  unlockLevel: number;
}
export const SCENES: SceneMeta[] = [
  { id: "jardim",   name: "Jardim Mágico",  emoji: "🌷", gradient: "from-success/30 via-secondary/30 to-accent/30", unlockLevel: 1 },
  { id: "praia",    name: "Praia Dourada",  emoji: "🏖️", gradient: "from-amber-200/40 via-sky-200/40 to-cyan-200/40", unlockLevel: 3 },
  { id: "floresta", name: "Floresta dos Sonhos", emoji: "🌳", gradient: "from-emerald-300/40 via-lime-200/30 to-secondary/30", unlockLevel: 5 },
  { id: "castelo",  name: "Castelo Encantado", emoji: "🏰", gradient: "from-rose-200/40 via-fuchsia-200/30 to-violet-300/40", unlockLevel: 7 },
  { id: "espaco",   name: "Aventura Espacial",  emoji: "🚀", gradient: "from-indigo-400/40 via-purple-400/30 to-slate-700/40", unlockLevel: 9 },
];

const VOICES: Record<VoiceTone, { rate: number; pitch: number; label: string }> = {
  doce:     { rate: 0.85, pitch: 1.25, label: "Voz doce" },
  energica: { rate: 1.05, pitch: 1.10, label: "Voz energética" },
  sussurro: { rate: 0.75, pitch: 0.95, label: "Voz suave" },
};

export function getVoiceParams(v: VoiceTone): { rate: number; pitch: number } {
  const x = VOICES[v];
  return { rate: x.rate, pitch: x.pitch };
}
export function listVoices() {
  return (Object.keys(VOICES) as VoiceTone[]).map((id) => ({ id, ...VOICES[id] }));
}

const STATE_KEY = (childId: string) => `alegria-junior-mascot::${childId}`;

const defaults = (): JuniorMascotStateBase => ({
  scene: "jardim", voice: "doce", unlockedScenes: ["jardim"],
});

export function loadMascotState(childId: string): JuniorMascotStateBase {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STATE_KEY(childId));
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch { return defaults(); }
}
export function saveMascotState(childId: string, s: JuniorMascotStateBase) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY(childId), JSON.stringify(s));
}
export function setScene(childId: string, scene: SceneId) {
  const s = loadMascotState(childId);
  saveMascotState(childId, { ...s, scene });
}
export function setVoice(childId: string, voice: VoiceTone) {
  const s = loadMascotState(childId);
  saveMascotState(childId, { ...s, voice });
}

// === Evolução ===

export function xpFromProgress(p: JuniorProgress): number {
  // points são a fonte primária; jogos únicos / sessões / highlights / streak somam bónus
  const base = (p.points ?? 0);
  const unique = (p.playedGames?.length ?? 0) * 10;
  const repeats = Math.max(0, (p.totalSessions ?? 0) - (p.playedGames?.length ?? 0)) * 3;
  const hl = (p.highlights?.length ?? 0) * 5;
  const streak = (p.streak ?? 0) * 15;
  const medals = (p.medals?.length ?? 0) * 20;
  return base + unique + repeats + hl + streak + medals;
}
export function levelFromXp(xp: number): { level: number; nextLevelAt: number; xpInLevel: number } {
  // 0→100, 100→250, 250→450, …  delta cresce 50 por nível
  let lv = 1, threshold = 0, step = 100;
  while (xp >= threshold + step && lv < 50) {
    threshold += step;
    step += 50;
    lv += 1;
  }
  return { level: lv, nextLevelAt: threshold + step, xpInLevel: xp - threshold };
}
function unlockedScenesFor(level: number, manual: SceneId[] = []): SceneId[] {
  const auto = SCENES.filter((s) => s.unlockLevel <= level).map((s) => s.id);
  return Array.from(new Set([...auto, ...manual]));
}

function emotionFor(p: JuniorProgress, level: number): Emotion {
  const last = p.lastPlayedAt ? new Date(p.lastPlayedAt).getTime() : 0;
  const hoursSince = last ? (Date.now() - last) / 36e5 : 9999;
  if (hoursSince > 48) return "sonolento";
  if (hoursSince < 1) return "entusiasmado";
  if (level >= 7) return "orgulhoso";
  if (level >= 4) return "curioso";
  if (level >= 2) return "feliz";
  return "calmo";
}

const GREETINGS: Record<Emotion, string[]> = {
  feliz:        ["Olá, amiguinho! Vamos brincar?", "Que bom ver-te! Estou tão feliz!"],
  entusiasmado: ["Yupiiii! Vamos jogar agora?", "Estou cheio de energia! Vem comigo!"],
  curioso:      ["Hmm… o que vamos descobrir hoje?", "Tenho uma surpresa nova para ti!"],
  orgulhoso:    ["Estou tão orgulhoso de ti!", "És incrível, sabias?"],
  calmo:        ["Olá, tudo bem? Vamos com calma.", "Vamos aprender devagarinho."],
  sonolento:    ["Há tanto tempo! Tive saudades…", "Vamos acordar a aventura!"],
};
const ENCOURAGEMENTS: Record<Emotion, string[]> = {
  feliz:        ["Boa! Continua assim!", "Adoro brincar contigo!"],
  entusiasmado: ["Uau, és um campeão!", "Mais, mais, mais!"],
  curioso:      ["Que descoberta fantástica!", "Aprendeste algo novo!"],
  orgulhoso:    ["Estás a ficar mestre!", "Que talento incrível!"],
  calmo:        ["Muito bem, com calma chega-se longe.", "Cada passo conta."],
  sonolento:    ["Bem-vindo de volta!", "Que bom termos jogado!"],
};
function pick<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export function computeMascotState(childId: string, progress: JuniorProgress): JuniorMascotComputed {
  const base = loadMascotState(childId);
  const xp = xpFromProgress(progress);
  const { level, nextLevelAt } = levelFromXp(xp);
  const emotion = emotionFor(progress, level);
  const unlockedScenes = unlockedScenesFor(level, base.unlockedScenes);
  const seed = (progress.totalSessions ?? 0) + level;
  return {
    ...base,
    unlockedScenes,
    scene: unlockedScenes.includes(base.scene) ? base.scene : "jardim",
    level,
    nextLevelAt,
    xp,
    emotion,
    greeting: pick(GREETINGS[emotion], seed),
    encouragement: pick(ENCOURAGEMENTS[emotion], seed + 1),
  };
}

// Auto-unlock newly available scenes (called after each session)
export function autoUnlockScenes(childId: string, progress: JuniorProgress) {
  const base = loadMascotState(childId);
  const xp = xpFromProgress(progress);
  const { level } = levelFromXp(xp);
  const next = unlockedScenesFor(level, base.unlockedScenes);
  if (next.length !== base.unlockedScenes.length) {
    saveMascotState(childId, { ...base, unlockedScenes: next });
  }
}

export const EMOTION_EMOJI: Record<Emotion, string> = {
  feliz: "😊", entusiasmado: "🤩", curioso: "🧐", orgulhoso: "🥹", calmo: "😌", sonolento: "😴",
};
