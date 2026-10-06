// hintFor — dicas pedagógicas automáticas para perguntas de aritmética.
// As perguntas de matemática do banco ("7 × 8 = ?") raramente têm hint
// escrita à mão; estas estratégias ensinam o MÉTODO, não só a resposta.
// Kid-friendly, 1.º ciclo: nada de decoreba — desenhar, contar, dobrar.

const EQUACAO = /^(\d+)\s*([+−\-\u2212×x*÷:\u00f7])\s*(\d+)\s*=\s*\?$/;

/** Plural simples para "grupo/grupos", "passo/passos". */
function pl(n: number, sing: string, plur: string): string {
  return n === 1 ? sing : plur;
}

export function hintForPergunta(prompt: string): string | undefined {
  const m = EQUACAO.exec(prompt.trim());
  if (!m) return undefined;
  const a = Number(m[1]);
  const op = m[2];
  const b = Number(m[3]);

  if (op === "×" || op === "x" || op === "*") {
    if (a === 1 || b === 1) return "Multiplicar por 1 não muda nada — o número fica igual!";
    if (a === 2 || b === 2) return "Multiplicar por 2 é o mesmo que dobrar o número!";
    if (a === 4 || b === 4)
      return "× 4 é dobrar duas vezes — primeiro o dobro, depois o dobro do dobro!";
    if (a === 5 || b === 5) return "Conta de 5 em 5 com os dedos das mãos!";
    if (a === 10 || b === 10) return "× 10 é só juntar um zero no fim do número!";
    if (a === 9 || b === 9) return "Truque do 9: faz × 10 e tira uma vez o número!";
    if (a === 3 || b === 3)
      return `É ${pl(Math.max(a, b), "1 grupo", "grupos")} de 3 — conta de 3 em 3!`;
    const grupos = Math.max(a, b);
    const dentro = Math.min(a, b);
    return `Desenha ${grupos} ${pl(grupos, "grupo", "grupos")} de ${dentro} e conta tudo!`;
  }

  if (op === "+") {
    if (a === 1 || b === 1) return "Juntar 1 é só avançar um passo no número!";
    if (a === 10 || b === 10) return "Juntar 10 muda só a dezena — sobe um na dezena!";
    if (a >= 10 && b >= 10) return "Soma primeiro as dezenas, depois as unidades, e junta tudo!";
    return `Começa no ${a} e conta ${b} ${pl(b, "passo", "passos")} em frente!`;
  }

  if (op === "−" || op === "-" || op === "\u2212") {
    if (b === 1) return "Tirar 1 é só recuar um passo no número!";
    if (b === 10) return "Tirar 10 muda só a dezena — desce um na dezena!";
    return `Começa no ${a} e conta para trás ${b} ${pl(b, "passo", "passos")}!`;
  }

  if (op === "÷" || op === ":" || op === "\u00f7") {
    if (b === 1) return "Dividir por 1 não muda nada — fica tudo!";
    if (b === 2) return "É partir em 2 partes iguais — a metade!";
    return `Procura o número que multiplicado por ${b} dá ${a}!`;
  }

  return undefined;
}
