// check_grades.mjs — valida a cadeia 5.º/6.º ano de ponta a ponta:
// lições senior (ids únicos, perguntas), capítulos (missões resolvem,
// séries certas), ponte triviaSenior (ages 10–12, rotação de opções) e
// o merge em ALL_TRIVIA. Uso: node scripts/check_grades.mjs
import { rolldown } from "rolldown";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const outFile = path.join(root, "node_modules", ".cache", "check_grades.bundle.mjs");

const entry = `
import { SUBJECTS, GRADE_LABEL } from "${path.join(root, "src/lib/curriculum.ts")}";
import { ALL_TRIVIA } from "${path.join(root, "src/lib/triviaBoost.ts")}";
import { SENIOR_TRIVIA } from "${path.join(root, "src/lib/triviaSenior.ts")}";
import { CHAPTERS, totalMissions } from "${path.join(root, "src/lib/chapters.ts")}";
globalThis.__AUDIT__ = { SUBJECTS, GRADE_LABEL, ALL_TRIVIA, SENIOR_TRIVIA, CHAPTERS, totalMissions };
`;

const bundle = await rolldown({
  input: "virtual-entry",
  plugins: [
    {
      name: "virtual-entry",
      resolveId(id) {
        return id === "virtual-entry" ? "\0virtual-entry" : null;
      },
      load(id) {
        return id === "\0virtual-entry" ? entry : null;
      },
    },
  ],
  transform: { define: { "import.meta.env.DEV": "false" } },
  platform: "neutral",
});
await bundle.write({ file: outFile, format: "esm" });
await import(outFile);

const { SUBJECTS, GRADE_LABEL, ALL_TRIVIA, SENIOR_TRIVIA, CHAPTERS, totalMissions } =
  globalThis.__AUDIT__;
const problems = [];
const info = [];

// ── 1. Ids únicos em todo o currículo ──────────────────────────────────────
const globalIds = new Set();
for (const s of SUBJECTS) {
  for (const l of s.lessons) {
    if (globalIds.has(l.id)) problems.push(`ID duplicado de lição: ${l.id} (${s.id})`);
    globalIds.add(l.id);
  }
}
info.push(`Lições no total: ${globalIds.size}`);

// ── 2. Cobertura 5.º/6.º ano ───────────────────────────────────────────────
const seniorByGrade = { 5: {}, 6: {} };
for (const g of [5, 6]) {
  for (const s of SUBJECTS) {
    const ls = s.lessons.filter((l) => l.grade === g);
    if (ls.length) seniorByGrade[g][s.id] = ls.length;
  }
  const total = Object.values(seniorByGrade[g]).reduce((a, b) => a + b, 0);
  if (total !== 16) problems.push(`Esperava 16 lições no ${g}.º ano (2 rondas), há ${total}`);
  info.push(`${g}.º ano: ${JSON.stringify(seniorByGrade[g])}`);
}
const seniorLessons = SUBJECTS.flatMap((s) => s.lessons.filter((l) => l.grade >= 5));
const seniorQuestions = seniorLessons.reduce((a, l) => a + l.questions.length, 0);
if (seniorQuestions !== 192)
  problems.push(`Esperava 192 perguntas senior (2 rondas × 96), há ${seniorQuestions}`);
info.push(`Perguntas senior: ${seniorQuestions}`);

// Convenção MCQ: resposta certa em answerIndex 0 (shuffleMcqOptions baralha no runtime)
for (const l of seniorLessons) {
  for (const [i, q] of l.questions.entries()) {
    if (q.kind === "truefalse") {
      if (JSON.stringify(q.options) !== JSON.stringify(["Verdadeiro", "Falso"]))
        problems.push(`VF com options errados: ${l.id}[${i}]`);
    } else if (q.answerIndex !== 0) {
      problems.push(`MCQ senior com answerIndex != 0: ${l.id}[${i}]`);
    }
    if (!q.explanation) problems.push(`Sem explanation: ${l.id}[${i}]`);
    if (!q.hint) problems.push(`Sem hint: ${l.id}[${i}]`);
  }
}

// ── 3. Capítulos: missões resolvem para lições existentes ──────────────────
// (os capítulos multi-série antigos — "Todos os anos", "Aventureiros" — misturam
// anos por design; a igualdade de ano só é exigida às Grandes Expedições 5.º/6.º)
const lessonById = new Map(SUBJECTS.flatMap((s) => s.lessons).map((l) => [l.id, l]));
for (const ch of CHAPTERS) {
  for (const m of ch.missions) {
    const l = lessonById.get(m.lessonId);
    if (!l) problems.push(`Missão fantasma: ${ch.id} → ${m.lessonId}`);
    else if (ch.grade >= 5 && l.grade !== ch.grade)
      problems.push(
        `Missão ${m.lessonId} (${l.grade}.º ano) no capítulo ${ch.id} (${ch.grade}.º ano)`,
      );
  }
}
const pa = CHAPTERS.find((c) => c.id === "planeta-azul");
const dm = CHAPTERS.find((c) => c.id === "desafio-dos-mestres");
if (!pa) problems.push("Capítulo planeta-azul em falta");
if (!dm) problems.push("Capítulo desafio-dos-mestres em falta");
if (pa?.missions.length !== 8)
  problems.push(`planeta-azul: esperava 8 missões, há ${pa?.missions.length}`);
if (dm?.missions.length !== 8)
  problems.push(`desafio-dos-mestres: esperava 8 missões, há ${dm?.missions.length}`);
const numbers = CHAPTERS.map((c) => c.number).sort((a, b) => a - b);
if (new Set(numbers).size !== numbers.length) problems.push("Números de capítulo duplicados");
info.push(`Capítulos: ${CHAPTERS.length}, missões: ${totalMissions()}`);

// ── 4. Ponte triviaSenior ──────────────────────────────────────────────────
if (SENIOR_TRIVIA.length !== 192)
  problems.push(`SENIOR_TRIVIA esperava 192 (2 rondas), há ${SENIOR_TRIVIA.length}`);
const badAge = SENIOR_TRIVIA.filter((q) => q.age !== 10 && q.age !== 11);
if (badAge.length) problems.push(`${badAge.length} perguntas senior fora das idades 10–11`);
let vfs = 0;
const posCount = [0, 0, 0, 0];
for (const [i, q] of SENIOR_TRIVIA.entries()) {
  if (!Array.isArray(q.options) || q.options.length < 2)
    problems.push(`Trivia sénior sem opções: [${i}]`);
  else if (q.answerIndex == null || q.answerIndex < 0 || q.answerIndex >= q.options.length)
    problems.push(`answerIndex fora do intervalo na trivia senior: [${i}]`);
  if (JSON.stringify(q.options) === JSON.stringify(["Verdadeiro", "Falso"])) vfs++;
  else posCount[q.answerIndex] = (posCount[q.answerIndex] ?? 0) + 1;
}
if (posCount[0] === SENIOR_TRIVIA.length - vfs)
  problems.push("MCQ senior tudo com answerIndex 0 — rotação falhou!");
let vfFalse = 0;
for (const q of SENIOR_TRIVIA) {
  if (JSON.stringify(q.options) === JSON.stringify(["Verdadeiro", "Falso"]) && q.answerIndex === 1)
    vfFalse++;
}
info.push(
  `Trivia senior: ${SENIOR_TRIVIA.length} (VF: ${vfs}, das quais Falso: ${vfFalse}); posições da certa (A/B/C/D): ${posCount.join("/")}`,
);

// ── 5. ALL_TRIVIA inclui o senior ──────────────────────────────────────────
const ages = ALL_TRIVIA.reduce((m, q) => ((m[q.age] = (m[q.age] ?? 0) + 1), m), {});
info.push(`ALL_TRIVIA: ${ALL_TRIVIA.length} perguntas — idades: ${JSON.stringify(ages)}`);
for (const a of [10, 11]) {
  if (!ages[a]) problems.push(`ALL_TRIVIA sem perguntas de idade ${a}`);
}
const poolSizes = { g5: 0, g6: 0 };
for (const q of ALL_TRIVIA) {
  if ([10, 11].includes(q.age)) poolSizes.g5++;
  if ([11, 12].includes(q.age)) poolSizes.g6++;
}
info.push(`Pools do Duelo — 5.º ano (10–11): ${poolSizes.g5} · 6.º ano (11–12): ${poolSizes.g6}`);

// ── 6. GRADE_LABEL completo ────────────────────────────────────────────────
for (const g of [1, 2, 3, 4, 5, 6]) {
  if (!GRADE_LABEL[g]) problems.push(`GRADE_LABEL sem o ${g}.º ano`);
}

if (problems.length) {
  console.error(
    `\n❌ ${problems.length} problema(s):\n` + problems.map((p) => `  · ${p}`).join("\n"),
  );
  process.exit(1);
}
console.log(`\n✅ check_grades OK\n` + info.map((i) => `  · ${i}`).join("\n") + "\n");
