/**
 * formatTutorText — torna as respostas do tutor legíveis para crianças.
 *
 * O modelo por vezes devolve sintaxe LaTeX (`$7 \times 7$`, `\frac{3}{4}`)
 * ou markdown (`**negrito**`) que não faz sentido mostrar a um aluno
 * do 1.º ciclo. Esta função converte para símbolos simples e legíveis:
 *
 *   $7 \times 7$      →  7 × 7
 *   \frac{3}{4}       →  3/4
 *   \sqrt{9}          →  √9
 *   **importante**    →  importante
 */

const LATEX_SYMBOLS: Array<[RegExp, string]> = [
  [/\\times/g, "×"],
  [/\\cdot/g, "·"],
  [/\\div/g, "÷"],
  [/\\pm/g, "±"],
  [/\\leq?/g, "≤"],
  [/\\geq?/g, "≥"],
  [/\\neq/g, "≠"],
  [/\\approx/g, "≈"],
  [/\\rightarrow|\\to/g, "→"],
  [/\\left|\\right/g, ""],
  [/\\,|\\;|\\!/g, " "],
  [/\\% /g, "% "],
];

export function formatTutorText(raw: string): string {
  if (!raw) return raw;

  let out = raw;

  // 1) \frac{a}{b} → a/b  (também frações aninhadas simples, da interna p/ externa)
  for (let i = 0; i < 3; i++) {
    out = out.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  }
  // Simplifica parênteses de dígitos puros: (3)/(4) → 3/4
  out = out.replace(/\((\d+)\)\/\((\d+)\)/g, "$1/$2");

  // 2) \sqrt{x} → √x
  out = out.replace(/\\sqrt\{([^{}]+)\}/g, "√$1");

  // 3) Expoentes comuns: x^{2} / x^2 → x², x^{3} → x³ (só 2, 3 e potências de 1 dígito comuns)
  out = out.replace(/\^\{?2\}?/g, "²");
  out = out.replace(/\^\{?3\}?/g, "³");

  // 4) Símbolos LaTeX básicos
  for (const [re, rep] of LATEX_SYMBOLS) out = out.replace(re, rep);

  // 5) Remove delimitadores $ restantes (inline e display)
  out = out.replace(/\$\$([^$]+)\$\$/g, "$1");
  out = out.replace(/\$([^$]+)\$/g, "$1");
  out = out.replace(/\\\[/g, "").replace(/\\\]/g, "");
  out = out.replace(/\\\(/g, "").replace(/\\\)/g, "");

  // 6) Markdown simples que a criança não deve ver
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1"); // **bold**
  out = out.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, "$1"); // *itálico*
  out = out.replace(/`([^`]+)`/g, "$1"); // `código`
  out = out.replace(/^#{1,3}\s+/gm, ""); // títulos markdown

  // 7) Normaliza espaços duplos acidentais
  out = out.replace(/ {2,}/g, " ");

  return out;
}
