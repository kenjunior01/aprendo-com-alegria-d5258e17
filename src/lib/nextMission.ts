import { CHAPTERS, chapterForRegion, type Chapter, type Mission } from "./chapters";
import type { RegionCode } from "./region";

/**
 * Encontra a próxima missão na jornada de aprendizagem contínua (estilo Duolingo).
 * Respeita o limite de capítulos visíveis por ano escolar usado em /app
 * (teto 6 — o 5.º/6.º ano também é alcançável) e filtra as missões
 * regionais "O Meu País" pela região do perfil.
 */
export function getNextMission(
  completedLessons: string[],
  grade: number,
  region?: RegionCode | null,
): { mission: Mission; chapter: Chapter } | null {
  const visible = CHAPTERS.map((c) => chapterForRegion(c, region)).filter(
    (c) => c.grade <= Math.min(6, grade + 1),
  );
  for (const chapter of visible) {
    for (const mission of chapter.missions) {
      if (!completedLessons.includes(mission.lessonId)) {
        return { mission, chapter };
      }
    }
  }
  return null;
}
