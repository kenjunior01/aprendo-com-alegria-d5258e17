// Auditoria de currículo — valida invariantes dos dados de currículo/trivia.
// Uso: npx tsx scripts/auditCurriculum.mts
// (usa tsx para importar TS diretamente; tsconfig paths @/* resolvidos pelo tsx)
import { SUBJECTS } from "../src/lib/curriculum";
import { ALL_TRIVIA } from "../src/lib/triviaBoost";

const problems: string[] = [];
let lessons = 0;
let questions = 0;
const bySubject: Record<string, { lessons: number; questions: number }> = {};

for (const s of SUBJECTS) {
  bySubject[s.id] = { lessons: s.lessons.length, questions: 0 };
  const seen = new Set<string>();
  for (const l of s.lessons) {
    lessons++;
    if (seen.has(l.id)) problems.push(`ID duplicado: ${s.id}/${l.id}`);
    seen.add(l.id);
    if (!l.title || !l.emoji) problems.push(`Sem título/emoji: ${s.id}/${l.id}`);
    if (!Array.isArray(l.questions) || l.questions.length < 4)
      problems.push(`Menos de 4 perguntas: ${s.id}/${l.id} (${l.questions?.length ?? 0})`);
    for (let i = 0; i < (l.questions?.length ?? 0); i++) {
      const q = l.questions[i];
      questions++;
      bySubject[s.id].questions++;
      if (!q.prompt) problems.push(`Sem prompt: ${s.id}/${l.id}[${i}]`);
      if (q.kind === "order") {
        if (!Array.isArray(q.sequence) || q.sequence.length < 3)
          problems.push(`Order inválida: ${s.id}/${l.id}[${i}]`);
      } else if (q.kind === "count") {
        if (!q.visual || q.visual.groups < 1 || q.visual.perGroup < 1)
          problems.push(`Count inválido: ${s.id}/${l.id}[${i}]`);
      } else {
        if (!Array.isArray(q.options) || q.options.length < 2)
          problems.push(`Sem opções suficientes: ${s.id}/${l.id}[${i}]`);
        else if (q.answerIndex == null || q.answerIndex < 0 || q.answerIndex >= q.options.length)
          problems.push(`answerIndex fora do intervalo: ${s.id}/${l.id}[${i}]`);
      }
    }
  }
}

const dist: Record<number, number> = {};
for (const q of ALL_TRIVIA) dist[q.age] = (dist[q.age] ?? 0) + 1;

console.log("=== CURRÍCULO ===");
for (const [id, v] of Object.entries(bySubject))
  console.log(`${id.padEnd(16)} lições=${String(v.lessons).padStart(3)} perguntas=${v.questions}`);
console.log(`TOTAL: ${SUBJECTS.length} matérias · ${lessons} lições · ${questions} perguntas`);
console.log("\n=== TRIVIA (ALL_TRIVIA) ===");
console.log(`total=${ALL_TRIVIA.length} · idades=${JSON.stringify(dist)}`);
console.log("\n=== PROBLEMAS ===");
console.log(problems.length === 0 ? "✅ Nenhum — dados íntegros" : problems.slice(0, 40).join("\n"));
