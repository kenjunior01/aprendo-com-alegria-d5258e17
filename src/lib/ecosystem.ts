// Ecossistema dinâmico — gera "ornamentos vivos" no Meu Mundo
// com base no progresso da criança por matéria.
// Estes itens são puramente visuais (não ocupam grelha, não custam moedas).

import type { Profile } from "./storage";

export interface LivingOrnament {
  id: string;
  emoji: string;
  label: string;
  count: number; // nº de instâncias a desenhar
  // posição relativa (top/right) em % para cada instância
  positions: Array<{ top: number; left: number; rot: number; scale: number }>;
}

function inferSubjects(profile: Profile): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of profile.completedLessons) {
    const subj = id.split("-")[0]; // ex: "matematica-1-soma" -> "matematica"
    counts[subj] = (counts[subj] ?? 0) + 1;
  }
  return counts;
}

function spread(count: number, seed: number): LivingOrnament["positions"] {
  const arr: LivingOrnament["positions"] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    arr.push({
      top: 5 + ((seed * 13 + i * 17) % 80),
      left: Math.round(t * 90 + 3),
      rot: ((seed + i) * 23) % 30 - 15,
      scale: 0.85 + ((seed + i) % 4) * 0.08,
    });
  }
  return arr;
}

export function livingOrnaments(profile: Profile): LivingOrnament[] {
  const subj = inferSubjects(profile);
  const out: LivingOrnament[] = [];

  // Plantas crescem com Estudo do Meio
  const meio = subj["estudo-do-meio"] ?? subj["estudo"] ?? 0;
  if (meio > 0) {
    const c = Math.min(6, 1 + Math.floor(meio / 2));
    out.push({
      id: "flores-vivas",
      emoji: meio >= 6 ? "🌻" : meio >= 3 ? "🌷" : "🌱",
      label: "Jardim que floresceu",
      count: c,
      positions: spread(c, 1),
    });
  }

  // Estrelas aparecem com Matemática
  const mat = subj["matematica"] ?? 0;
  if (mat > 0) {
    const c = Math.min(5, 1 + Math.floor(mat / 2));
    out.push({
      id: "estrelas-vivas",
      emoji: mat >= 6 ? "✨" : "⭐",
      label: "Constelação dos números",
      count: c,
      positions: spread(c, 7),
    });
  }

  // Letras voam com Português
  const por = subj["portugues"] ?? 0;
  if (por > 0) {
    const c = Math.min(4, 1 + Math.floor(por / 2));
    out.push({
      id: "letras-vivas",
      emoji: por >= 6 ? "📖" : "🦋",
      label: por >= 6 ? "Biblioteca animada" : "Borboletas das palavras",
      count: c,
      positions: spread(c, 3),
    });
  }

  // Espaço/observatório com Ciências (lições com 'ciencia' ou 'espaco')
  const cien = (subj["ciencia"] ?? 0) + (subj["ciencias"] ?? 0);
  if (cien > 0 || profile.completedLessons.some((l) => l.includes("espaco"))) {
    out.push({
      id: "obs-vivo",
      emoji: "🔭",
      label: "Observatório desbloqueado",
      count: 1,
      positions: [{ top: 8, left: 80, rot: -10, scale: 1.1 }],
    });
  }

  // Mascote-pet (animais) com Inglês ou só por XP elevado
  if (profile.xp >= 200) {
    out.push({
      id: "pet-vivo",
      emoji: "🐦",
      label: "Pássaro amigo",
      count: 1,
      positions: [{ top: 18, left: 12, rot: 0, scale: 1 }],
    });
  }

  return out;
}

// Resumo curto para mostrar como "tooltip" agregado
export function ecosystemSummary(profile: Profile): string {
  const orn = livingOrnaments(profile);
  if (!orn.length) return "Completa lições para fazer o teu mundo ganhar vida ✨";
  return orn.map((o) => `${o.emoji} ${o.label}`).join(" · ");
}
