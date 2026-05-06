// Histórico de chat do Tutor — armazenado localmente, indexado pelo nome+grade da criança.
// Permite ver no painel dos pais o que a criança perguntou ao Tutor.

export interface TutorChatMsg {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface TutorHistory {
  childKey: string; // "name|grade"
  messages: TutorChatMsg[];
}

const KEY = "lusis-tutor-history-v1";
const MAX_MSGS = 200;

function load(): Record<string, TutorHistory> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function save(all: Record<string, TutorHistory>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function childKey(name: string, grade: number) {
  return `${name.toLowerCase().trim()}|${grade}`;
}

export function getHistory(name: string, grade: number): TutorHistory {
  const all = load();
  const key = childKey(name, grade);
  return all[key] ?? { childKey: key, messages: [] };
}

export function appendMessages(name: string, grade: number, msgs: TutorChatMsg[]) {
  const all = load();
  const key = childKey(name, grade);
  const cur = all[key] ?? { childKey: key, messages: [] };
  cur.messages = [...cur.messages, ...msgs].slice(-MAX_MSGS);
  all[key] = cur;
  save(all);
}

export function clearHistory(name: string, grade: number) {
  const all = load();
  delete all[childKey(name, grade)];
  save(all);
}

export function listChildren(): TutorHistory[] {
  return Object.values(load());
}
