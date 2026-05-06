// Missões Diárias — geram desafios que rotam por dia e dão recompensas no Jardim.
// Persistido em localStorage. Uma "geração" por dia (seed determinística por data).

export type MissionSubject = "portugues" | "matematica" | "estudo-do-meio" | "leitura";

export interface DailyMission {
  id: string;
  subject: MissionSubject;
  emoji: string;
  title: string;
  description: string;
  target: number;
  metric: "lessons" | "correct" | "minutes" | "reads";
  rewardCoins: number;
  rewardXp: number;
  /** Se preenchido, desbloqueia uma planta extra no jardim (id do GardenItem) */
  rewardGardenItem?: string;
}

export interface DailyMissionsState {
  date: string; // YYYY-MM-DD
  missions: DailyMission[];
  /** progresso por id da missão */
  progress: Record<string, number>;
  /** ids das missões já reclamadas hoje */
  claimed: string[];
}

const KEY = "lusis-daily-missions-v1";

const POOL: DailyMission[] = [
  { id: "pt-2-lessons", subject: "portugues", emoji: "📖", title: "Lê e responde", description: "Completa 2 missões de Português.", target: 2, metric: "lessons", rewardCoins: 25, rewardXp: 30 },
  { id: "pt-10-correct", subject: "portugues", emoji: "✏️", title: "Mestre das palavras", description: "Acerta 10 perguntas de Português.", target: 10, metric: "correct", rewardCoins: 30, rewardXp: 40 },
  { id: "mat-2-lessons", subject: "matematica", emoji: "🧮", title: "Calculista", description: "Completa 2 missões de Matemática.", target: 2, metric: "lessons", rewardCoins: 25, rewardXp: 30 },
  { id: "mat-10-correct", subject: "matematica", emoji: "🔢", title: "Conta, conta!", description: "Acerta 10 contas de Matemática.", target: 10, metric: "correct", rewardCoins: 30, rewardXp: 40 },
  { id: "edm-1-lesson", subject: "estudo-do-meio", emoji: "🌍", title: "Pequeno cientista", description: "Faz 1 missão de Estudo do Meio.", target: 1, metric: "lessons", rewardCoins: 20, rewardXp: 25 },
  { id: "edm-5-correct", subject: "estudo-do-meio", emoji: "🔬", title: "Descobridor", description: "Acerta 5 perguntas de Estudo do Meio.", target: 5, metric: "correct", rewardCoins: 25, rewardXp: 30 },
  { id: "read-1", subject: "leitura", emoji: "🎤", title: "Lê em voz alta", description: "Faz 1 prática de leitura com voz.", target: 1, metric: "reads", rewardCoins: 20, rewardXp: 25 },
  { id: "time-10", subject: "portugues", emoji: "⏱️", title: "10 minutos focado", description: "Estuda durante 10 minutos no total.", target: 10, metric: "minutes", rewardCoins: 20, rewardXp: 25 },
];

function seededPick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < n && used.size < arr.length) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      out.push(arr[idx]);
    }
  }
  return out;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function generateForDay(date: string): DailyMission[] {
  // seed: soma dos chars da data, garante 3 missões diferentes por dia
  let seed = 0;
  for (let i = 0; i < date.length; i++) seed += date.charCodeAt(i) * (i + 1);
  // Garantir uma missão de cada eixo principal: leitura, matemática e estudo do meio.
  const pt = POOL.filter((m) => m.subject === "portugues");
  const mat = POOL.filter((m) => m.subject === "matematica");
  const edm = POOL.filter((m) => m.subject === "estudo-do-meio");
  const reading = POOL.filter((m) => m.subject === "leitura");
  return [
    seededPick(pt, 1, seed)[0],
    seededPick(mat, 1, seed + 7)[0],
    seededPick(edm, 1, seed + 13)[0],
    seededPick(reading, 1, seed + 21)[0],
  ];
}

export function loadMissions(): DailyMissionsState {
  if (typeof window === "undefined") {
    const date = todayStr();
    return { date, missions: generateForDay(date), progress: {}, claimed: [] };
  }
  try {
    const raw = localStorage.getItem(KEY);
    const today = todayStr();
    if (raw) {
      const parsed = JSON.parse(raw) as DailyMissionsState;
      if (parsed.date === today) return parsed;
    }
    const fresh: DailyMissionsState = { date: today, missions: generateForDay(today), progress: {}, claimed: [] };
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    const date = todayStr();
    return { date, missions: generateForDay(date), progress: {}, claimed: [] };
  }
}

export function saveMissions(state: DailyMissionsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export interface ProgressEvent {
  subject?: MissionSubject | string;
  lessonsDelta?: number;
  correctDelta?: number;
  minutesDelta?: number;
  readsDelta?: number;
}

/** Aplica progresso a TODAS as missões do dia e devolve as recém-completadas (não reclamadas ainda). */
export function applyProgress(ev: ProgressEvent): { state: DailyMissionsState; newlyCompleted: DailyMission[] } {
  const state = loadMissions();
  const newlyCompleted: DailyMission[] = [];
  for (const m of state.missions) {
    const prev = state.progress[m.id] ?? 0;
    if (prev >= m.target) continue;
    let delta = 0;
    const subjMatches = m.subject === ev.subject || m.subject === "leitura" && ev.subject === "leitura";
    if (m.metric === "lessons" && ev.lessonsDelta && subjMatches) delta = ev.lessonsDelta;
    else if (m.metric === "correct" && ev.correctDelta && subjMatches) delta = ev.correctDelta;
    else if (m.metric === "minutes" && ev.minutesDelta) delta = ev.minutesDelta; // minutos contam para qualquer disciplina
    else if (m.metric === "reads" && ev.readsDelta) delta = ev.readsDelta;
    if (delta > 0) {
      state.progress[m.id] = Math.min(m.target, prev + delta);
      if (state.progress[m.id] >= m.target && !state.claimed.includes(m.id)) {
        newlyCompleted.push(m);
      }
    }
  }
  saveMissions(state);
  return { state, newlyCompleted };
}

export function claimMission(id: string): DailyMission | null {
  const state = loadMissions();
  const m = state.missions.find((x) => x.id === id);
  if (!m) return null;
  const prog = state.progress[id] ?? 0;
  if (prog < m.target || state.claimed.includes(id)) return null;
  state.claimed.push(id);
  saveMissions(state);
  return m;
}

export function dailyMissionStats(state: DailyMissionsState) {
  const total = state.missions.length;
  const completed = state.missions.filter((m) => (state.progress[m.id] ?? 0) >= m.target).length;
  return { total, completed, pct: total === 0 ? 0 : completed / total };
}
