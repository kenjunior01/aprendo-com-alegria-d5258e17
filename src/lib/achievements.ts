import { supabase } from "@/integrations/supabase/client";
import { loadProfile, updateProfile, type Profile } from "./storage";
import { lsGet, lsSet } from "./localStore";
import { loadQuizPaisProgress } from "./quizPais";

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  coin_reward: number;
  xp_reward: number;
  sort_order: number;
}

export interface UnlockedAchievement {
  achievement_code: string;
  unlocked_at: string;
}

/**
 * Catálogo local — espelha a seed da BD (migration 20260506141720) + as
 * Conquistas do Júnior (supabase/sql/conquistas_do_junior.sql). Serve para:
 *  1. visitantes sem sessão (RLS só deixa authenticated ler a BD) verem a
 *     página completa com barras de progresso;
 *  2. preencher códigos que ainda não existem na BD (ex.: SQL por correr) —
 *     as linhas da BD ganham sempre quando existem.
 */
export const LOCAL_ACHIEVEMENTS: Achievement[] = [
  // — seed original (13) + novos patamares das categorias existentes (5) —
  {
    code: "first_lesson",
    title: "Primeiros Passos",
    description: "Completa a tua primeira lição",
    icon: "sparkles",
    category: "progresso",
    requirement_type: "lessons_completed",
    requirement_value: 1,
    coin_reward: 20,
    xp_reward: 10,
    sort_order: 1,
  },
  {
    code: "lessons_5",
    title: "Aprendiz",
    description: "Completa 5 lições",
    icon: "book-open",
    category: "progresso",
    requirement_type: "lessons_completed",
    requirement_value: 5,
    coin_reward: 30,
    xp_reward: 20,
    sort_order: 2,
  },
  {
    code: "lessons_15",
    title: "Estudioso",
    description: "Completa 15 lições",
    icon: "graduation-cap",
    category: "progresso",
    requirement_type: "lessons_completed",
    requirement_value: 15,
    coin_reward: 60,
    xp_reward: 50,
    sort_order: 3,
  },
  {
    code: "lessons_30",
    title: "Mestre do Saber",
    description: "Completa 30 lições",
    icon: "crown",
    category: "progresso",
    requirement_type: "lessons_completed",
    requirement_value: 30,
    coin_reward: 120,
    xp_reward: 100,
    sort_order: 4,
  },
  {
    code: "lessons_60",
    title: "Maratonista",
    description: "Completa 60 lições",
    icon: "book-open",
    category: "progresso",
    requirement_type: "lessons_completed",
    requirement_value: 60,
    coin_reward: 150,
    xp_reward: 120,
    sort_order: 5,
  },
  {
    code: "streak_3",
    title: "Em Chamas",
    description: "Mantém uma sequência de 3 dias",
    icon: "flame",
    category: "consistencia",
    requirement_type: "streak",
    requirement_value: 3,
    coin_reward: 30,
    xp_reward: 15,
    sort_order: 10,
  },
  {
    code: "streak_7",
    title: "Imparável",
    description: "Mantém uma sequência de 7 dias",
    icon: "zap",
    category: "consistencia",
    requirement_type: "streak",
    requirement_value: 7,
    coin_reward: 70,
    xp_reward: 40,
    sort_order: 11,
  },
  {
    code: "streak_30",
    title: "Lenda",
    description: "Mantém uma sequência de 30 dias",
    icon: "star",
    category: "consistencia",
    requirement_type: "streak",
    requirement_value: 30,
    coin_reward: 300,
    xp_reward: 200,
    sort_order: 12,
  },
  {
    code: "streak_14",
    title: "Duas Semanas",
    description: "Mantém uma sequência de 14 dias",
    icon: "flame",
    category: "consistencia",
    requirement_type: "streak",
    requirement_value: 14,
    coin_reward: 100,
    xp_reward: 60,
    sort_order: 13,
  },
  {
    code: "xp_100",
    title: "Cem Pontos",
    description: "Alcança 100 XP",
    icon: "trophy",
    category: "xp",
    requirement_type: "xp",
    requirement_value: 100,
    coin_reward: 25,
    xp_reward: 0,
    sort_order: 20,
  },
  {
    code: "xp_500",
    title: "Quinhentos Pontos",
    description: "Alcança 500 XP",
    icon: "trophy",
    category: "xp",
    requirement_type: "xp",
    requirement_value: 500,
    coin_reward: 75,
    xp_reward: 0,
    sort_order: 21,
  },
  {
    code: "xp_1000",
    title: "Mil Pontos",
    description: "Alcança 1000 XP",
    icon: "trophy",
    category: "xp",
    requirement_type: "xp",
    requirement_value: 1000,
    coin_reward: 150,
    xp_reward: 0,
    sort_order: 22,
  },
  {
    code: "xp_2500",
    title: "Vulcão de XP",
    description: "Alcança 2500 XP",
    icon: "zap",
    category: "xp",
    requirement_type: "xp",
    requirement_value: 2500,
    coin_reward: 250,
    xp_reward: 0,
    sort_order: 23,
  },
  {
    code: "coins_100",
    title: "Mealheiro",
    description: "Junta 100 Abracadinhos",
    icon: "coins",
    category: "economia",
    requirement_type: "coins_total",
    requirement_value: 100,
    coin_reward: 20,
    xp_reward: 0,
    sort_order: 30,
  },
  {
    code: "first_purchase",
    title: "Primeira Compra",
    description: "Compra o teu primeiro item na loja",
    icon: "shopping-bag",
    category: "economia",
    requirement_type: "items_owned",
    requirement_value: 1,
    coin_reward: 15,
    xp_reward: 0,
    sort_order: 31,
  },
  {
    code: "coins_500",
    title: "Cofrinho Cheio",
    description: "Junta 500 Abracadinhos",
    icon: "coins",
    category: "economia",
    requirement_type: "coins_total",
    requirement_value: 500,
    coin_reward: 60,
    xp_reward: 0,
    sort_order: 32,
  },
  {
    code: "perfect_lesson",
    title: "Sem Erros!",
    description: "Termina uma lição com 100% de acerto",
    icon: "target",
    category: "precisao",
    requirement_type: "perfect_lessons",
    requirement_value: 1,
    coin_reward: 25,
    xp_reward: 15,
    sort_order: 40,
  },
  {
    code: "perfect_lessons_10",
    title: "Cérebro de Ouro",
    description: "Termina 10 lições com 100% de acerto",
    icon: "target",
    category: "precisao",
    requirement_type: "perfect_lessons",
    requirement_value: 10,
    coin_reward: 80,
    xp_reward: 50,
    sort_order: 41,
  },
  // — Conquistas do Júnior: jogos (7) —
  {
    code: "pais_primeiro_quiz",
    title: "Primeira Rodada",
    description: "Joga a tua primeira rodada do Quiz do Meu País",
    icon: "map",
    category: "jogos",
    requirement_type: "quiz_pais_records",
    requirement_value: 1,
    coin_reward: 20,
    xp_reward: 10,
    sort_order: 50,
  },
  {
    code: "pais_medio",
    title: "Rumo ao Médio",
    description: "Desbloqueia o nível Médio no Quiz do Meu País",
    icon: "gamepad-2",
    category: "jogos",
    requirement_type: "quiz_pais_levels",
    requirement_value: 2,
    coin_reward: 25,
    xp_reward: 15,
    sort_order: 51,
  },
  {
    code: "pais_campeao",
    title: "Campeão do País",
    description: "Desbloqueia o nível Campeão no Quiz do Meu País",
    icon: "trophy",
    category: "jogos",
    requirement_type: "quiz_pais_levels",
    requirement_value: 3,
    coin_reward: 60,
    xp_reward: 30,
    sort_order: 52,
  },
  {
    code: "pais_perfeito",
    title: "Rodada Perfeita",
    description: "Acerta 5 em 5 numa rodada do Quiz do Meu País",
    icon: "target",
    category: "jogos",
    requirement_type: "quiz_pais_perfect",
    requirement_value: 1,
    coin_reward: 30,
    xp_reward: 20,
    sort_order: 53,
  },
  {
    code: "pais_explorador",
    title: "Explorador da CPLP",
    description: "Joga o quiz de 3 países diferentes",
    icon: "globe",
    category: "jogos",
    requirement_type: "quiz_pais_countries",
    requirement_value: 3,
    coin_reward: 40,
    xp_reward: 20,
    sort_order: 54,
  },
  {
    code: "pais_globo",
    title: "Volta ao Mundo",
    description: "Joga o quiz de 5 países diferentes",
    icon: "globe",
    category: "jogos",
    requirement_type: "quiz_pais_countries",
    requirement_value: 5,
    coin_reward: 80,
    xp_reward: 40,
    sort_order: 55,
  },
  {
    code: "pais_cinco_vezes",
    title: "Colecionador de Recordes",
    description: "Marca recordes em 6 desafios país + nível",
    icon: "medal",
    category: "jogos",
    requirement_type: "quiz_pais_records",
    requirement_value: 6,
    coin_reward: 50,
    xp_reward: 25,
    sort_order: 56,
  },
];

export async function fetchAchievements(): Promise<Achievement[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return LOCAL_ACHIEVEMENTS;

  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });

  // BD manda; catálogo local preenche códigos em falta (SQL por correr).
  const byCode = new Map<string, Achievement>();
  for (const a of (data ?? []) as Achievement[]) byCode.set(a.code, a);
  for (const l of LOCAL_ACHIEVEMENTS) if (!byCode.has(l.code)) byCode.set(l.code, l);
  return [...byCode.values()].sort((a, b) => a.sort_order - b.sort_order);
}

export async function fetchUnlocked(): Promise<UnlockedAchievement[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // local fallback
    const raw = lsGet("kidoz-achievements");
    return raw ? (JSON.parse(raw) as UnlockedAchievement[]) : [];
  }
  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_code, unlocked_at")
    .eq("user_id", user.id);
  return (data ?? []) as UnlockedAchievement[];
}

// ── Estatísticas de jogos (Conquistas do Júnior) ──
// Tipos novos avaliados no cliente a partir do progresso do Quiz do Meu País:
//  - quiz_pais_levels    → maior nível desbloqueado (1..3)
//  - quiz_pais_perfect   → rodadas com 5/5 (em todos os países)
//  - quiz_pais_countries → países diferentes já jogados
//  - quiz_pais_records   → recordes marcados (chaves país:nível com placar)
// Única fonte de verdade: usada pelo desbloqueio E pelas barras de progresso.
export function gameStatValue(type: string): number {
  switch (type) {
    case "quiz_pais_levels":
      return loadQuizPaisProgress().unlocked;
    case "quiz_pais_perfect":
      return Object.values(loadQuizPaisProgress().best).filter((v) => v >= 5).length;
    case "quiz_pais_countries":
      return new Set(Object.keys(loadQuizPaisProgress().best).map((k) => k.split(":")[0])).size;
    case "quiz_pais_records":
      return Object.keys(loadQuizPaisProgress().best).length;
    default:
      return 0;
  }
}

const GAME_TYPES = new Set([
  "quiz_pais_levels",
  "quiz_pais_perfect",
  "quiz_pais_countries",
  "quiz_pais_records",
]);

function meetsRequirement(a: Achievement, p: Profile, perfectLessons: number): boolean {
  if (GAME_TYPES.has(a.requirement_type)) {
    return gameStatValue(a.requirement_type) >= a.requirement_value;
  }
  switch (a.requirement_type) {
    case "lessons_completed":
      return p.completedLessons.length >= a.requirement_value;
    case "streak":
      return p.streak >= a.requirement_value;
    case "xp":
      return p.xp >= a.requirement_value;
    case "coins_total":
      return p.coins >= a.requirement_value;
    case "items_owned":
      return p.ownedItems.length >= a.requirement_value;
    case "perfect_lessons":
      return perfectLessons >= a.requirement_value;
    default:
      return false;
  }
}

const PERFECT_KEY = "kidoz-perfect-lessons";
export function incrementPerfectLessons(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(lsGet(PERFECT_KEY) ?? "0") + 1;
  lsSet(PERFECT_KEY, String(n));
  return n;
}
export function getPerfectLessons(): number {
  if (typeof window === "undefined") return 0;
  return Number(lsGet(PERFECT_KEY) ?? "0");
}

/**
 * Verifica conquistas após uma lição. Devolve as recém-desbloqueadas.
 */
export async function checkAndUnlockAchievements(opts?: {
  wasPerfect?: boolean;
}): Promise<Achievement[]> {
  const profile = loadProfile();
  if (!profile) return [];

  const perfectLessons = opts?.wasPerfect ? incrementPerfectLessons() : getPerfectLessons();

  const [all, unlocked] = await Promise.all([fetchAchievements(), fetchUnlocked()]);
  const unlockedSet = new Set(unlocked.map((u) => u.achievement_code));

  const newly: Achievement[] = [];
  let coinBonus = 0;
  let xpBonus = 0;

  for (const a of all) {
    if (unlockedSet.has(a.code)) continue;
    if (meetsRequirement(a, profile, perfectLessons)) {
      newly.push(a);
      coinBonus += a.coin_reward;
      xpBonus += a.xp_reward;
    }
  }

  if (newly.length === 0) return [];

  // Persist locally always
  const local = await fetchUnlocked();
  const merged = [
    ...local,
    ...newly.map((a) => ({ achievement_code: a.code, unlocked_at: new Date().toISOString() })),
  ];
  if (typeof window !== "undefined") {
    lsSet("kidoz-achievements", JSON.stringify(merged));
  }

  // Push to cloud if signed in
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_achievements")
        .insert(newly.map((a) => ({ user_id: user.id, achievement_code: a.code })));
    }
  } catch {
    // offline — ignora
  }

  // Apply rewards
  if (coinBonus > 0 || xpBonus > 0) {
    updateProfile({
      coins: profile.coins + coinBonus,
      xp: profile.xp + xpBonus,
    });
  }

  return newly;
}
