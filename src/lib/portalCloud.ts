// Sync do estado do Portal (Mundo Premium) com a cloud — coluna `portal_state`
// (jsonb) em `profiles`. Mesma estratégia do juniorCloud: snapshot { v, state,
// savedAt }; push debounced (3s) após cada escrita local; pull só aplica a
// cloud se for MAIS RECENTE que o local — nunca perde progresso offline.
// Só importamos TYPES do premiumWorld (erased at compile): quem importa daqui
// é o premiumWorld, e um import runtime criaria ciclo de módulos.
import { supabase } from "@/integrations/supabase/client";
import type { PortalState } from "./premiumWorld";

interface PortalCloudSnapshot {
  v: 1;
  state: PortalState;
  savedAt: string;
}

// Mesmas chaves do premiumWorld.ts (duplicadas de propósito, como no juniorCloud)
const STATE_KEY = "kidoz-portal-v1";
const STAMP_KEY = "kidoz-portal-saved-at";

function localStamp(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STAMP_KEY) ?? "";
  } catch {
    return "";
  }
}

function stampLocal() {
  try {
    localStorage.setItem(STAMP_KEY, new Date().toISOString());
  } catch {
    // storage cheio/bloqueado — sync é best-effort
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Marca o estado local como "modificado agora" e agenda push debounced (3s).
 * Chamada pelo savePortalState — cobre TODAS as escritas do Portal (fim de
 * reino, bazar, criaturas…) sem tocar nos call sites.
 */
export function schedulePortalCloudPush() {
  stampLocal();
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void pushPortalCloud();
  }, 3000);
}

export async function pushPortalCloud(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STATE_KEY);
    } catch {
      return false;
    }
    if (!raw) return false;
    const snap: PortalCloudSnapshot = {
      v: 1,
      state: JSON.parse(raw) as PortalState,
      savedAt: new Date().toISOString(),
    };
    // update (não upsert): a linha profiles já existe para qualquer sessão
    // autenticada — e nunca queremos criar linha-fantasma com só id+jsonb.
    // Coluna nova ainda não tipada nos tipos gerados → cast flexível (padrão
    // já usado em storage.ts para hunger/push_token/…).
    const { error } = await supabase
      .from("profiles")
      .update({ portal_state: snap } as never)
      .eq("id", user.id);
    return !error;
  } catch {
    return false;
  }
}

export async function pullPortalCloud(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase
      .from("profiles")
      .select("portal_state")
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data) return false;
    // Coluna ainda não tipada nos tipos gerados → shape explícito via cast
    const row = data as unknown as { portal_state: PortalCloudSnapshot | null };
    const snap = row.portal_state;
    if (!snap || snap.v !== 1 || !snap.state || typeof snap.state !== "object") return false;

    let localRaw: string | null = null;
    try {
      localRaw = localStorage.getItem(STATE_KEY);
    } catch {
      return false;
    }
    const cloudTime = new Date(snap.savedAt || 0).getTime();
    const localTime = new Date(localStamp()).getTime();
    // Cloud ganha se o local estiver vazio OU for mais antigo.
    // Local sem stamp (pré-feature) + cloud existente → NaN >= x é false →
    // cloud aplica: comportamento certo na migração do primeiro segundo sync.
    if (localRaw && localTime >= cloudTime) return false;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(snap.state));
      stampLocal();
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}
