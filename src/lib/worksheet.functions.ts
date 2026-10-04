// Gerador de Fichas Imprimíveis — lead magnet público para /escolas.
// O professor gera fichas A4 reais (20 exercícios + soluções) sem registo:
// valor imediato que prova o posicionamento offline-first do Kidoz.
// Server function pdf-lib (padrão classReport/certificate) — cliente só
// recebe base64, bundle fica leve. Sem auth: input estrito + trava de
// concorrência em memória (custo de geração é trivial).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  tipo: z.enum(["adicao", "subtracao", "multiplicacao", "sequencias", "dinheiro"]),
  nivel: z.number().int().min(1).max(3),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const TIPO_LABEL: Record<string, string> = {
  adicao: "Adicao",
  subtracao: "Subtracao",
  multiplicacao: "Multiplicacao",
  sequencias: "Sequencias",
  dinheiro: "Dinheiro",
};

// Configuração por país: naming do ano/classe + moeda local.
// A ficha adapta-se ao sistema de cada país — mesmo exercício, realidade local.
const PAIS: Record<
  string,
  { nome: string; moeda: string; antes: (s: string) => string; classe: (n: number) => string }
> = {
  pt: {
    nome: "Portugal",
    moeda: "\u20ac",
    antes: (s) => `${s} \u20ac`,
    classe: (n) => (n === 3 ? "3.o-4.o ano" : `${n}.o ano`),
  },
  mz: {
    nome: "Mocambique",
    moeda: "MT",
    antes: (s) => `${s} MT`,
    classe: (n) => (n === 3 ? "3.a-4.a classe" : `${n}.a classe`),
  },
  ao: {
    nome: "Angola",
    moeda: "Kz",
    antes: (s) => `${s} Kz`,
    classe: (n) => (n === 3 ? "3.a-4.a classe" : `${n}.a classe`),
  },
  cv: {
    nome: "Cabo Verde",
    moeda: "Esc",
    antes: (s) => `${s} Esc`,
    classe: (n) => (n === 3 ? "3.o-4.o ano" : `${n}.o ano`),
  },
  br: {
    nome: "Brasil",
    moeda: "R$",
    antes: (s) => `R$ ${s}`,
    classe: (n) => (n === 3 ? "3.o-4.o ano" : `${n}.o ano`),
  },
};

const NIVEL_LABEL: Record<number, string> = {
  1: "Nivel 1 - ate 10",
  2: "Nivel 2 - ate 20",
  3: "Nivel 3 - ate 100",
};

interface Ex {
  text: string;
  answer: string;
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moneyStr(v: number, moeda: string, antes: (s: string) => string): string {
  const s = v % 1 === 0 ? String(v) : v.toFixed(2).replace(".", ",");
  return antes(s);
}

function genExercises(tipo: string, nivel: number, pais: string): Ex[] {
  const exs: Ex[] = [];
  for (let i = 0; i < 20; i++) {
    if (tipo === "adicao") {
      const max = nivel === 1 ? 10 : nivel === 2 ? 20 : 100;
      const a = rnd(nivel === 3 ? 15 : 2, max - 2);
      const b = rnd(1, Math.min(nivel === 3 ? 40 : 10, max - a));
      exs.push({ text: `${a} + ${b} =`, answer: String(a + b) });
    } else if (tipo === "subtracao") {
      const max = nivel === 1 ? 10 : nivel === 2 ? 20 : 100;
      const a = rnd(nivel === 3 ? 25 : 4, max);
      const b = rnd(1, a - 1);
      exs.push({ text: `${a} - ${b} =`, answer: String(a - b) });
    } else if (tipo === "multiplicacao") {
      const aMax = nivel === 1 ? 5 : nivel === 2 ? 9 : 12;
      const bMax = nivel === 1 ? 5 : 9;
      const a = rnd(2, aMax);
      const b = rnd(2, bMax);
      exs.push({ text: `${a} × ${b} =`, answer: String(a * b) });
    } else if (tipo === "dinheiro") {
      // Preços na moeda local — soma e subtração de dinheiro do dia a dia.
      const cfg = PAIS[pais];
      const max = nivel === 1 ? 9 : nivel === 2 ? 20 : 45;
      let a = rnd(2, max) + (nivel === 3 && Math.random() < 0.4 ? 0.5 : 0);
      let b =
        rnd(1, Math.max(2, Math.min(max, nivel === 1 ? 9 : 20))) +
        (nivel === 3 && Math.random() < 0.4 ? 0.5 : 0);
      if (b > a) [a, b] = [b, a];
      // 60% somas; se a soma ultrapassar o teto do nível, fica subtração
      const plus = Math.random() < 0.6 && a + b <= (nivel === 1 ? 18 : nivel === 2 ? 20 : 100);
      const res = plus ? a + b : a - b;
      const op = plus ? "+" : "-";
      const ta = moneyStr(a, cfg.moeda, cfg.antes);
      const tb = moneyStr(b, cfg.moeda, cfg.antes);
      exs.push({ text: `${ta} ${op} ${tb} =`, answer: moneyStr(res, cfg.moeda, cfg.antes) });
    } else {
      const steps = nivel === 1 ? [1, 2] : nivel === 2 ? [2, 3, 5] : [3, 4, 6, 7, 25];
      const step = steps[rnd(0, steps.length - 1)];
      const down = nivel === 3 && Math.random() < 0.4;
      const startMax = nivel === 3 ? (down ? 100 - step * 4 : 60) : 12;
      let t = [rnd(1, startMax)];
      for (let k = 1; k <= 4; k++) t.push(t[0] + step * k);
      if (down) t = t.reverse();
      const hidden = rnd(2, 4);
      const answer = String(t[hidden]);
      const shown = t.map((v, j) => (j === hidden ? "____" : String(v)));
      exs.push({ text: shown.join(", "), answer });
    }
  }
  return exs;
}

// Trava de concorrência: evita abusos sem rate-limit complexo.
let inFlight = 0;

export const generateWorksheet = createServerFn({ method: "POST" })
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }) => {
    if (inFlight > 24) return { error: "Muitos pedidos agora. Tenta em instantes." as const };
    inFlight++;
    try {
      const { tipo, nivel, pais } = data;
      const cfg = PAIS[pais];
      const exs = genExercises(tipo, nivel, pais);

      // ─── PDF A4 ───────────────────────────────────────────────────────
      const pdf = await PDFDocument.create();
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const dark = rgb(0.18, 0.16, 0.32);
      const muted = rgb(0.45, 0.4, 0.55);
      const primary = rgb(0.85, 0.35, 0.1);
      const line = rgb(0.85, 0.85, 0.9);
      const cellBorder = rgb(0.82, 0.8, 0.88);

      const W = 595;
      const H = 842;
      const M = 48;

      // ── Página 1: exercícios ──
      const p1 = pdf.addPage([W, H]);
      p1.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: rgb(0.96, 0.93, 0.9) });
      p1.drawText(`Ficha de Matematica - ${TIPO_LABEL[tipo]}`, {
        x: M,
        y: H - 52,
        size: 20,
        font: titleFont,
        color: dark,
      });
      p1.drawText(
        `${NIVEL_LABEL[nivel]}  ·  ${cfg.classe(nivel)}  ·  ${cfg.nome}  ·  kidoz.online`,
        {
          x: M,
          y: H - 72,
          size: 10,
          font: bodyFont,
          color: muted,
        },
      );

      p1.drawText("Nome: ______________________________", {
        x: M,
        y: H - 122,
        size: 11,
        font: bodyFont,
        color: dark,
      });
      p1.drawText("Data: ____ / ____ / ____", {
        x: W - M - 170,
        y: H - 122,
        size: 11,
        font: bodyFont,
        color: dark,
      });

      const cols = 4;
      const rows = 5;
      const gap = 10;
      const cw = (W - M * 2 - gap * (cols - 1)) / cols;
      const ch = 92;
      const topY = H - 152;

      exs.forEach((ex, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = M + col * (cw + gap);
        const y = topY - row * (ch + gap);

        p1.drawRectangle({
          x,
          y: y - ch,
          width: cw,
          height: ch,
          borderColor: cellBorder,
          borderWidth: 1,
          color: rgb(1, 1, 1),
        });
        p1.drawText(String(i + 1), {
          x: x + 8,
          y: y - 16,
          size: 9,
          font: bodyFont,
          color: muted,
        });
        p1.drawText(ex.text, {
          x: x + 8,
          y: y - 44,
          size: ex.text.length > 12 ? 11 : 14,
          font: titleFont,
          color: dark,
        });
        p1.drawLine({
          start: { x: x + 8, y: y - ch + 14 },
          end: { x: x + cw - 8, y: y - ch + 14 },
          color: line,
          thickness: 1,
        });
      });

      p1.drawText("Gratis e imprimivel - gera mais em kidoz.online/escolas", {
        x: M,
        y: 34,
        size: 9,
        font: bodyFont,
        color: muted,
      });
      p1.drawText("Kidoz", { x: W - M - 40, y: 34, size: 9, font: titleFont, color: primary });

      // ── Página 2: soluções ──
      const p2 = pdf.addPage([W, H]);
      p2.drawText("Solucoes", {
        x: M,
        y: H - 70,
        size: 18,
        font: titleFont,
        color: dark,
      });
      p2.drawText(
        `Ficha de Matematica - ${TIPO_LABEL[tipo]} - ${NIVEL_LABEL[nivel]} - ${cfg.nome}`,
        {
          x: M,
          y: H - 90,
          size: 10,
          font: bodyFont,
          color: muted,
        },
      );

      exs.forEach((ex, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = M + col * ((W - M * 2) / 4);
        const y = H - 130 - row * 26;
        p2.drawText(`${i + 1}. ${ex.answer}`, {
          x,
          y,
          size: 11,
          font: bodyFont,
          color: dark,
        });
      });

      p2.drawText("Tens turmas inteiras para ocupar? O Kidoz gera exercicios infinitos e", {
        x: M,
        y: 60,
        size: 9,
        font: bodyFont,
        color: muted,
      });
      p2.drawText("acompanha o progresso de cada aluno - kidoz.online/escolas", {
        x: M,
        y: 46,
        size: 9,
        font: bodyFont,
        color: muted,
      });

      const pdfBase64 = await pdf.saveAsBase64();
      const fileName = `kidoz-ficha-${tipo}-nivel${nivel}-${pais}.pdf`;
      return { pdfBase64, fileName };
    } finally {
      inFlight--;
    }
  });
