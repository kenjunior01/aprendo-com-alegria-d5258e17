// check_pvp_achievements.mjs — valida a cadeia das Conquistas de Duelo:
// contadores pvpStats (gravação e leitura), catálogo local (8 medalhas novas
// com tipos certos), gameStatValue ligado aos contadores e o SQL idempotente
// com os mesmos códigos. Uso: node scripts/check_pvp_achievements.mjs
import { rolldown } from "rolldown";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const outFile = path.join(root, "node_modules", ".cache", "check_pvp.bundle.mjs");

// localStorage em memória — o bundle corre em Node (pvpStats usa try/catch,
// mas assim a gravação testa a sério em vez de cair nos defaults).
const shim = `
const __mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (__mem.has(k) ? __mem.get(k) : null),
  setItem: (k, v) => { __mem.set(k, String(v)); },
  removeItem: (k) => { __mem.delete(k); },
};
`;

const entry = `
${shim}
import { LOCAL_ACHIEVEMENTS, GAME_TYPES, gameStatValue } from "${path.join(root, "src/lib/achievements.ts")}";
import { loadPvpStats, recordDueloResult, recordRelampagoResult } from "${path.join(root, "src/lib/pvpStats.ts")}";
globalThis.__AUDIT__ = { LOCAL_ACHIEVEMENTS, GAME_TYPES, gameStatValue, loadPvpStats, recordDueloResult, recordRelampagoResult };
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
  resolve: { alias: { "@": path.join(root, "src") } },
  transform: { define: { "import.meta.env.DEV": "false", "import.meta.env.VITE_SUPABASE_URL": '""', "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": '""' } },
  platform: "neutral",
});
await bundle.write({ file: outFile, format: "esm" });
await import(outFile);

const { LOCAL_ACHIEVEMENTS, GAME_TYPES, gameStatValue, loadPvpStats, recordDueloResult, recordRelampagoResult } =
  globalThis.__AUDIT__;
const problems = [];
const info = [];

// ── 1. Contadores pvpStats: gravação fim-a-fim ─────────────────────────────
if (loadPvpStats().dueloRounds !== 0) problems.push("Contadores deviam começar a zero");
recordDueloResult(3);
recordDueloResult(4);
recordDueloResult(-2); // valor inválido: conta a rodada, não conta acertos negativos
let s = loadPvpStats();
if (s.dueloRounds !== 3) problems.push(`Esperava 3 duelos, há ${s.dueloRounds}`);
if (s.dueloCorrect !== 7) problems.push(`Esperava 7 acertos de duelo, há ${s.dueloCorrect}`);
recordRelampagoResult(5, 5);
recordRelampagoResult(3, 5);
recordRelampagoResult(0, 0); // rodada vazia: não conta como perfeita
s = loadPvpStats();
if (s.relampagoRounds !== 3) problems.push(`Esperava 3 rodadas relâmpago, há ${s.relampagoRounds}`);
if (s.relampagoCorrect !== 8) problems.push(`Esperava 8 acertos relâmpago, há ${s.relampagoCorrect}`);
if (s.relampagoPerfect !== 1) problems.push(`Esperava 1 rodada perfeita, há ${s.relampagoPerfect}`);
info.push(`pvpStats: ${JSON.stringify(s)}`);

// ── 2. gameStatValue lê os contadores (desbloqueio + barras usam isto) ─────
for (const [type, expected] of [
  ["duelo_rounds", 3],
  ["duelo_correct", 7],
  ["relampago_rounds", 3],
  ["relampago_perfect", 1],
]) {
  const v = gameStatValue(type);
  if (v !== expected) problems.push(`gameStatValue(${type}) = ${v}, esperava ${expected}`);
  if (!GAME_TYPES.has(type)) problems.push(`Tipo ${type} fora de GAME_TYPES (sem desbloqueio!)`);
}
info.push("gameStatValue ligado aos 4 tipos novos ✓");

// ── 3. Catálogo local: 8 medalhas novas, tipos e patamares certos ──────────
const expected = [
  ["duelo_primeiro", "duelo_rounds", 1, 57],
  ["duelo_cinco", "duelo_rounds", 5, 58],
  ["duelo_vinte", "duelo_rounds", 20, 59],
  ["duelo_acertos", "duelo_correct", 50, 60],
  ["relampago_primeiro", "relampago_rounds", 1, 61],
  ["relampago_dez", "relampago_rounds", 10, 62],
  ["relampago_perfeito", "relampago_perfect", 1, 63],
  ["relampago_perfeito_10", "relampago_perfect", 10, 64],
];
const byCode = new Map(LOCAL_ACHIEVEMENTS.map((a) => [a.code, a]));
for (const [code, type, value, sort] of expected) {
  const a = byCode.get(code);
  if (!a) {
    problems.push(`Conquista em falta no catálogo local: ${code}`);
    continue;
  }
  if (a.requirement_type !== type)
    problems.push(`${code}: tipo ${a.requirement_type}, esperava ${type}`);
  if (a.requirement_value !== value)
    problems.push(`${code}: valor ${a.requirement_value}, esperava ${value}`);
  if (a.sort_order !== sort) problems.push(`${code}: sort_order ${a.sort_order}, esperava ${sort}`);
  if (a.category !== "jogos") problems.push(`${code}: categoria ${a.category}, esperava jogos`);
  if (!GAME_TYPES.has(a.requirement_type))
    problems.push(`${code}: requisito ${a.requirement_type} não é avaliável no cliente`);
  if (!a.description || !a.title) problems.push(`${code}: sem título ou descrição`);
}
const sorts = LOCAL_ACHIEVEMENTS.map((a) => a.sort_order);
if (new Set(sorts).size !== sorts.length) problems.push("sort_order duplicado no catálogo");
// Sem "vitórias" por design (hot-seat: o perfil pertence ao dispositivo)
if (LOCAL_ACHIEVEMENTS.some((a) => a.requirement_type.includes("win")))
  problems.push("Conquista de vitórias? O hot-seat não sabe de quem é o perfil (duelo.ts)");
info.push(`Catálogo local: ${LOCAL_ACHIEVEMENTS.length} conquistas (25 antigas + 8 de duelo)`);
if (LOCAL_ACHIEVEMENTS.length !== 33)
  problems.push(`Esperava 33 conquistas no catálogo, há ${LOCAL_ACHIEVEMENTS.length}`);

// ── 4. SQL idempotente com os mesmos códigos (colar no SQL Editor) ─────────
import { readFileSync } from "node:fs";
const sql = readFileSync(path.join(root, "supabase/sql/conquistas_de_duelo.sql"), "utf8");
for (const [code] of expected) {
  if (!sql.includes(`'${code}'`)) problems.push(`SQL sem o código ${code}`);
}
if (!sql.includes("ON CONFLICT (code) DO UPDATE"))
  problems.push("SQL sem ON CONFLICT — não é re-corridível");
info.push("SQL conquistas_de_duelo.sql com os 8 códigos ✓ (re-corridível)");

if (problems.length) {
  console.error(
    `\n❌ ${problems.length} problema(s):\n` + problems.map((p) => `  · ${p}`).join("\n"),
  );
  process.exit(1);
}
console.log(`\n✅ check_pvp_achievements OK\n` + info.map((i) => `  · ${i}`).join("\n") + "\n");
