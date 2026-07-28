// Sync do estado Kidoz Júnior (perfis, progresso, autocolantes) com a cloud.
// Estratégia: snapshot completo em jsonb por user_id. Pull faz merge "cloud é a fonte
// se for mais recente que o local"; push sobrescreve sempre o cloud.

import { supabase } from "@/integrations/supabase/client";
import {
  listJuniorChildren, loadJuniorProgress, getActiveJuniorChildId,
  type JuniorChild, type JuniorProgress,
} from "./junior";
import { loadStickers } from "./juniorRewards";

interface JuniorCloudSnapshot {
  v: 1;
  children: JuniorChild[];
  activeId: string | null;
  progress: Record<string, JuniorProgress>;
  stickers: Record<string, string[]>;
  savedAt: string;
}

const CHILDREN_KEY = "kidoz-junior-children-v1";
const ACTIVE_KEY   = "kidoz-junior-active-v1";
const progressKey  = (id: string) => `kidoz-junior-progress::${id}`;
const stickerKey   = (id: string) => `kidoz-junior-stickers::${id}`;

function snapshotLocal(): JuniorCloudSnapshot {
  const children = listJuniorChildren();
  const progress: Record<string, JuniorProgress> = {};
  const stickers: Record<string, string[]> = {};
  for (const c of children) {
    progress[c.id] = loadJuniorProgress(c.id);
    stickers[c.id] = loadStickers(c.id);
  }
  return {
    v: 1,
    children,
    activeId: getActiveJuniorChildId(),
    progress,
    stickers,
    savedAt: new Date().toISOString(),
  };
}

function applySnapshot(snap: JuniorCloudSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(snap.children ?? []));
  if (snap.activeId) localStorage.setItem(ACTIVE_KEY, snap.activeId);
  for (const [cid, p] of Object.entries(snap.progress ?? {})) {
    localStorage.setItem(progressKey(cid), JSON.stringify(p));
  }
  for (const [cid, s] of Object.entries(snap.stickers ?? {})) {
    localStorage.setItem(stickerKey(cid), JSON.stringify(s));
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Faz push debounced (3s) — chama após cada escrita local. */
export function scheduleJuniorCloudPush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushJuniorCloud(); }, 3000);
}

export async function pushJuniorCloud(): Promise<boolean> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const snap = snapshotLocal();
    const { error } = await supabase
      .from("junior_cloud")
      .upsert({ user_id: auth.user.id, data: snap as unknown as never }, { onConflict: "user_id" });
    return !error;
  } catch { return false; }
}

export async function pullJuniorCloud(): Promise<boolean> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const { data, error } = await supabase
      .from("junior_cloud")
      .select("data, updated_at")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error || !data) return false;
    const cloud = data.data as unknown as JuniorCloudSnapshot;
    if (!cloud || cloud.v !== 1) return false;
    const local = snapshotLocal();
    // Cloud ganha se for mais recente OU se o local estiver vazio
    const cloudTime = new Date(cloud.savedAt || data.updated_at || 0).getTime();
    const localTime = new Date(local.savedAt).getTime();
    if (local.children.length === 0 || cloudTime > localTime) {
      applySnapshot(cloud);
      return true;
    }
    return false;
  } catch { return false; }
}
