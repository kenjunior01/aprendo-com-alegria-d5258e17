// Cloud sync for "Desafios Infinitos" — keeps progress + stats in sync across devices.
// Mirrors the junior_cloud pattern (snapshot in jsonb, debounced push, merge on pull).

import { supabase } from "@/integrations/supabase/client";
import { loadInfiniteProgress, saveInfiniteProgress, type InfiniteProgress } from "./infiniteChallenges";

interface InfiniteCloudSnapshot extends InfiniteProgress {
  v: 1;
  savedAt: string;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleInfiniteCloudPush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushInfiniteCloud(); }, 2500);
}

export async function pushInfiniteCloud(): Promise<boolean> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const local = loadInfiniteProgress();
    const snap: InfiniteCloudSnapshot = { v: 1, savedAt: new Date().toISOString(), ...local };
    const { error } = await (supabase.from("infinite_progress" as never) as any)
      .upsert({ user_id: auth.user.id, data: snap }, { onConflict: "user_id" });
    return !error;
  } catch { return false; }
}

export async function pullInfiniteCloud(): Promise<InfiniteProgress | null> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data, error } = await supabase
      .from("infinite_progress" as never)
      .select("data, updated_at")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (error || !data) return null;
    const cloud = (data as { data: InfiniteCloudSnapshot }).data;
    if (!cloud) return null;

    const local = loadInfiniteProgress();
    // Merge: keep highest unlocked level per track and best stars
    const mergedLevels: InfiniteProgress["levels"] = { ...cloud.levels };
    for (const [t, lv] of Object.entries(local.levels ?? {})) {
      const cur = mergedLevels[t as keyof typeof mergedLevels] ?? 1;
      if ((lv ?? 1) > cur) mergedLevels[t as keyof typeof mergedLevels] = lv;
    }
    const mergedStars: InfiniteProgress["bestStars"] = { ...cloud.bestStars };
    for (const [k, v] of Object.entries(local.bestStars ?? {})) {
      mergedStars[k] = Math.max(mergedStars[k] ?? 0, v ?? 0);
    }
    const merged: InfiniteProgress = {
      levels: mergedLevels,
      bestStars: mergedStars,
      totalXp: Math.max(local.totalXp ?? 0, cloud.totalXp ?? 0),
      wins: Math.max(local.wins ?? 0, cloud.wins ?? 0),
      errors: Math.max(local.errors ?? 0, cloud.errors ?? 0),
      lastPlayedAt: cloud.lastPlayedAt ?? local.lastPlayedAt ?? null,
    };
    saveInfiniteProgress(merged);
    return merged;
  } catch { return null; }
}
