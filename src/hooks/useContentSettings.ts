// Hook para ler/escrever public.content_settings (admin).
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubjectToggle { enabled: boolean; minAge: number; maxAge: number; }
export interface GameToggle    { enabled: boolean; minAge: number; maxAge: number; }
export interface ContentSettings {
  subjects: Record<string, SubjectToggle>;
  games:    Record<string, GameToggle>;
  triviaCounts: Record<string, number>;
}

const DEFAULTS: ContentSettings = {
  subjects: {}, games: {}, triviaCounts: {},
};

export function useContentSettings() {
  const [settings, setSettings] = useState<ContentSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("content_settings")
      .select("key,value")
      .in("key", ["subjects", "games", "triviaCounts"]);
    const next: ContentSettings = { ...DEFAULTS };
    for (const row of data ?? []) {
      if (row.key === "subjects")     next.subjects     = (row.value as any) ?? {};
      if (row.key === "games")        next.games        = (row.value as any) ?? {};
      if (row.key === "triviaCounts") next.triviaCounts = (row.value as any) ?? {};
    }
    setSettings(next);
    setLoading(false);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const save = useCallback(async (next: ContentSettings) => {
    const rows = [
      { key: "subjects",     value: next.subjects as any },
      { key: "games",        value: next.games as any },
      { key: "triviaCounts", value: next.triviaCounts as any },
    ];
    const { error } = await supabase.from("content_settings").upsert(rows as any);
    if (!error) setSettings(next);
    return { error };
  }, []);

  const isSubjectEnabled = (id: string, age?: number) => {
    const s = settings.subjects[id];
    if (!s) return true; // default ON
    if (!s.enabled) return false;
    if (age == null) return true;
    return age >= s.minAge && age <= s.maxAge;
  };
  const isGameEnabled = (id: string, age?: number) => {
    const s = settings.games[id];
    if (!s) return true;
    if (!s.enabled) return false;
    if (age == null) return true;
    return age >= s.minAge && age <= s.maxAge;
  };
  const triviaCount = (cat: string, fallback = 10) =>
    settings.triviaCounts[cat] ?? fallback;

  return { settings, setSettings, loading, reload, save, isSubjectEnabled, isGameEnabled, triviaCount };
}
