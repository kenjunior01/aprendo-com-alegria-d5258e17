// Gerador de Desafios Relâmpago — folha de registo imprimível A4.
// Complemento dos torneios (Copa Kidoz): aqui o professor cria um desafio
// direto entre DUAS turmas, com código partilhável (WhatsApp), Placar ao
// Vivo no projetor e esta folha de pontuação por ronda. Zero estado no
// servidor: input estrito + trava de concorrência (mesmo padrão das fichas).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  nome: z.string().trim().min(1).max(60).default("Desafio Relâmpago"),
  turmaA: z.string().trim().min(1).max(24),
  turmaB: z.string().trim().min(1).max(24),
  disciplina: z.enum(["mat", "port", "em"]),
  rondas: z.number().int().min(1).max(5),
  codigo: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]{4,12}$/, "código inválido"),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const PAIS_NOME: Record<string, string> = {
  pt: "Portugal",
  mz: "Moçambique",
  ao: "Angola",
  cv: "Cabo Verde",
  br: "Brasil",
};

const DISC_LABEL: Record<string, string> = {
  mat: "Matemática",
  port: "Português",
  em: "Estudo do Meio",
};

const RONDAS_LABEL: Record<number, string> = {
  1: "Duelo único (1 ronda)",
  3: "Melhor de 3 rondas",
  5: "Grande final (5 rondas)",
};

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (cand.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cand;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

let inFlight = 0;

export const generateDesafio = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (inFlight > 24) {
      return { error: "Serviço ocupado — tenta daqui a segundos." } as const;
    }
    inFlight++;
    try {
      const { nome, turmaA, turmaB, disciplina, rondas, codigo, pais } = data;

      const pdf = await PDFDocument.create();
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const dark = rgb(0.18, 0.16, 0.32);
      const muted = rgb(0.45, 0.4, 0.55);
      const primary = rgb(0.85, 0.35, 0.1);
      const border = rgb(0.82, 0.8, 0.88);

      const W = 595;
      const H = 842;
      const M = 48;

      // ── Cabeçalho ──
      const p1 = pdf.addPage([W, H]);
      p1.drawRectangle({ x: 0, y: H - 104, width: W, height: 104, color: rgb(0.96, 0.93, 0.9) });
      p1.drawText(nome.toUpperCase(), {
        x: M,
        y: H - 46,
        size: nome.length > 36 ? 14 : 18,
        font: titleFont,
        color: dark,
      });
      p1.drawText("Desafio Relâmpago entre turmas · Kidoz", {
        x: M,
        y: H - 66,
        size: 10,
        font: bodyFont,
        color: muted,
      });
      p1.drawText(
        `${turmaA}  vs  ${turmaB}  ·  ${DISC_LABEL[disciplina]}  ·  ${RONDAS_LABEL[rondas]}  ·  ${PAIS_NOME[pais]}`,
        { x: M, y: H - 84, size: 10, font: bodyFont, color: dark },
      );

      // Caixa do código (canto direito)
      p1.drawRectangle({
        x: W - M - 132,
        y: H - 96,
        width: 132,
        height: 40,
        borderColor: primary,
        borderWidth: 1.6,
        color: rgb(1, 1, 1),
      });
      p1.drawText("CÓDIGO DO DESAFIO", {
        x: W - M - 124,
        y: H - 74,
        size: 6.5,
        font: bodyFont,
        color: muted,
      });
      p1.drawText(codigo, {
        x: W - M - 124,
        y: H - 90,
        size: 15,
        font: titleFont,
        color: primary,
      });

      // ── Como funciona ──
      p1.drawText("COMO FUNCIONA", {
        x: M,
        y: H - 132,
        size: 12,
        font: titleFont,
        color: dark,
      });
      const regras = [
        "Cada ronda joga-se no Modo Turma ao vivo do Kidoz (kidoz.online) ou com fichas imprimíveis.",
        "No fim de cada ronda soma os pontos e regista na tabela — ou usa o Placar ao Vivo do Kidoz no projetor.",
        "No fim, soma todas as rondas: a turma com mais pontos vence o desafio.",
        "Empate? Ronda extra de sequências, ditado ou cálculo mental — decide-se no momento.",
        "Pontos sugeridos: 2 pontos por vitória no ao vivo · 1 ponto por exercício certo em fichas.",
      ];
      regras.forEach((r, i) => {
        wrapText(r, 92).forEach((ln, k) => {
          p1.drawText(k === 0 ? `${i + 1}. ${ln}` : ln, {
            x: M,
            y: H - 150 - i * 24 - k * 12,
            size: 9.5,
            font: bodyFont,
            color: dark,
          });
        });
      });

      // ── Tabela de pontuação ──
      const tableTop = H - 300;
      const colX = [M, M + 70, M + 190, M + 310];
      const colW = [70, 120, 120, 189];
      const rowH = 42;
      const headers = ["Ronda", turmaA, turmaB, "Vencedor da ronda"];

      p1.drawText("REGISTO DE PONTOS", {
        x: M,
        y: tableTop + 24,
        size: 12,
        font: titleFont,
        color: dark,
      });

      headers.forEach((h, c) => {
        p1.drawRectangle({
          x: colX[c],
          y: tableTop,
          width: colW[c],
          height: 30,
          borderColor: border,
          borderWidth: 1,
          color: rgb(0.93, 0.91, 0.96),
        });
        p1.drawText(h.length > 22 ? `${h.slice(0, 21)}…` : h, {
          x: colX[c] + 6,
          y: tableTop + 12,
          size: 9,
          font: titleFont,
          color: dark,
        });
      });

      const rows = rondas + 1;
      for (let r = 0; r < rows; r++) {
        const y = tableTop - (r + 1) * rowH;
        const isTotal = r === rondas;
        const label = isTotal ? "TOTAL" : `Ronda ${r + 1}`;
        colW.forEach((w, c) => {
          p1.drawRectangle({
            x: colX[c],
            y,
            width: w,
            height: rowH,
            borderColor: border,
            borderWidth: 1,
            color: isTotal ? rgb(0.96, 0.93, 0.9) : rgb(1, 1, 1),
          });
        });
        p1.drawText(label, {
          x: colX[0] + 6,
          y: y + rowH / 2 - 4,
          size: 10,
          font: isTotal ? titleFont : bodyFont,
          color: dark,
        });
      }

      // ── Assinaturas + rodapé ──
      const sigY = tableTop - (rows + 1) * rowH - 40;
      p1.drawText("Professor(a) da turma A: ________________________", {
        x: M,
        y: sigY,
        size: 10,
        font: bodyFont,
        color: dark,
      });
      p1.drawText("Professor(a) da turma B: ________________________", {
        x: M,
        y: sigY - 26,
        size: 10,
        font: bodyFont,
        color: dark,
      });

      p1.drawText(
        "Grátis e imprimível — cria desafios, torneios e fichas em kidoz.online/escolas",
        {
          x: M,
          y: 34,
          size: 9,
          font: bodyFont,
          color: muted,
        },
      );
      p1.drawText("Kidoz", { x: W - M - 40, y: 34, size: 9, font: titleFont, color: primary });

      const pdfBase64 = await pdf.saveAsBase64();
      const fileName = `kidoz-desafio-${codigo.toLowerCase()}.pdf`;
      return { pdfBase64, fileName };
    } finally {
      inFlight--;
    }
  });
