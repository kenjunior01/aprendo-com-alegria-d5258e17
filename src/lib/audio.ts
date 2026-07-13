// Sons sintéticos via WebAudio (sem ficheiros) + narração via Web Speech API
// Pensado para crianças: tons alegres, voz pt-PT quando disponível.

let ctx: AudioContext | null = null;
let muted = false;

const STORAGE_KEY = "lusis-sound-muted";

if (typeof window !== "undefined") {
  muted = localStorage.getItem(STORAGE_KEY) === "1";
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.18, delay = 0) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(ac.destination);
  const t = ac.currentTime + delay;
  gain.gain.linearRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export function setMuted(v: boolean) {
  muted = v;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  }
  if (v) stopSpeech();
}

export function isMuted(): boolean {
  return muted;
}

export function playCorrect() {
  if (muted) return;
  // arpejo alegre C-E-G
  tone(523.25, 0.18, "triangle", 0.22, 0);
  tone(659.25, 0.18, "triangle", 0.22, 0.09);
  tone(783.99, 0.28, "triangle", 0.24, 0.18);
}

export function playWrong() {
  if (muted) return;
  // tom descendente suave (não assustador)
  tone(330, 0.18, "sine", 0.18, 0);
  tone(247, 0.28, "sine", 0.18, 0.12);
}

export function playTap() {
  if (muted) return;
  tone(440, 0.06, "square", 0.08, 0);
}

export function playEat() {
  if (muted) return;
  // som de "nham" mastigando
  tone(200, 0.1, "sine", 0.2, 0);
  tone(250, 0.1, "sine", 0.2, 0.05);
}

export function playWhistle() {
  if (muted) return;
  // som de assobio ascendente
  tone(880, 0.1, "sine", 0.1, 0);
  tone(1100, 0.15, "sine", 0.1, 0.08);
}

export function playHungry() {
  if (muted) return;
  // som de "estômago a roncar" sintetizado
  tone(100, 0.3, "sine", 0.15, 0);
  tone(90, 0.4, "sine", 0.1, 0.1);
}

export function playKnowledgeWarning() {
  if (muted) return;
  // tom de aviso intelectual (limpo mas urgente)
  tone(660, 0.1, "triangle", 0.15, 0);
  tone(660, 0.1, "triangle", 0.15, 0.15);
}

export function playFun() {
  if (muted) return;
  // som de "bolha" ou diversão
  tone(600, 0.2, "sine", 0.2, 0);
  tone(800, 0.2, "sine", 0.2, 0.1);
}

export function playLevelUp() {
  if (muted) return;
  tone(523.25, 0.12, "triangle", 0.22, 0);
  tone(659.25, 0.12, "triangle", 0.22, 0.08);
  tone(783.99, 0.12, "triangle", 0.22, 0.16);
  tone(1046.5, 0.32, "triangle", 0.26, 0.24);
}

// ===== Web Speech (TTS) =====

let voicesLoaded = false;
let cachedVoice: SpeechSynthesisVoice | null = null;

// Vozes preferidas por nome (mais naturais/humanas em cada SO/navegador).
const PREFERRED_NAMES = [
  // macOS / iOS
  "Joana", "Inês", "Catarina", "Luciana", "Joaquim",
  // Google (Android/Chrome)
  "Google português de Portugal", "Google português do Brasil", "Google português",
  // Microsoft (Windows/Edge)
  "Microsoft Duarte", "Microsoft Raquel", "Microsoft Helia", "Microsoft Fernanda", "Microsoft Maria",
];

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = (v.name || "").toLowerCase();
  const lang = (v.lang || "").toLowerCase();
  let score = 0;
  if (lang.startsWith("pt-pt")) score += 100;
  else if (lang.startsWith("pt-br")) score += 50;
  else if (lang.startsWith("pt")) score += 30;
  else return -1;
  // Preferred natural voices
  PREFERRED_NAMES.forEach((n, i) => {
    if (name.includes(n.toLowerCase())) score += 50 - i;
  });
  // Hint at "natural"/"neural"/"online"
  if (/(natural|neural|online|wavenet|premium|enhanced)/.test(name)) score += 20;
  // Penalise robotic eSpeak voices
  if (/espeak|compact/.test(name)) score -= 30;
  return score;
}

function pickPortugueseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const ranked = voices
    .map((v) => ({ v, s: scoreVoice(v) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);
  return ranked[0]?.v ?? null;
}

function ensureVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return resolve();
    if (voicesLoaded) return resolve();
    const ready = () => {
      cachedVoice = pickPortugueseVoice();
      voicesLoaded = true;
      resolve();
    };
    if (window.speechSynthesis.getVoices().length) {
      ready();
    } else {
      window.speechSynthesis.onvoiceschanged = ready;
      // fallback timeout
      setTimeout(ready, 800);
    }
  });
}

export async function speak(text: string, opts?: { rate?: number; pitch?: number }) {
  if (muted) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  await ensureVoices();
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Match the chosen voice's lang when possible — improves naturalness.
    u.lang = cachedVoice?.lang || "pt-PT";
    u.rate = opts?.rate ?? 0.95;
    u.pitch = opts?.pitch ?? 1.0;
    u.volume = 1;
    if (cachedVoice) u.voice = cachedVoice;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

export function stopSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

export function ttsAvailable(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}
