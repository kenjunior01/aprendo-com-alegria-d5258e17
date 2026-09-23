import { CHAPTERS, type Chapter, type Mission } from "./chapters";

/**
 * Encontra a próxima missão na jornada de aprendizagem contínua (estilo Duolingo).
 * Respeita o limite de capítulos visíveis por ano escolar usado em /app.
 */
export function getNextMission(
  completedLessons: string[],
  grade: number,
): { mission: Mission; chapter: Chapter } | null {
  const visible = CHAPTERS.filter((c) => c.grade <= Math.min(4, grade + 1));
  for (const chapter of visible) {
    for (const mission of chapter.missions) {
      if (!completedLessons.includes(mission.lessonId)) {
        return { mission, chapter };
      }
    }
  }
  return null;
}
