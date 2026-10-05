// Gerador do Mural de Estrelas da Turma — poster A4 imprimível.
// Ferramenta de gestão de sala clássica, digitalizada: 36 slots (6×6) com
// nome à mão e 10 estrelas por aluno para pintar a cada conquista. O
// professor imprime, escreve os nomes e cola na parede — motivação diária
// offline que nenhuma app de fichas oferece.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  turma: z.string().trim().min(1).max(40),
  alunos: z.number().int().min(1).max(36),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const PAIS_NOME: Record<string, string> = {
  pt: "Portugal",
  mz: "Moçambique",
  ao: "Angola",
  cv: "Cabo Verde",
  br: "Brasil",
};

// Estrela de 5 pontas centrada na origem (espaço SVG, y para baixo,
// ponta para cima). Desenhada com drawSvgPath — contorno para colorir.
const ESTRELA =
  "M 0 -10 L -2.35 -3.24 L -9.51 -3.09 L -3.8 1.24 L -5.88 8.09 L 0 4 L 5.88 8.09 L 3.8 1.24 L 9.51 -3.09 L 2.35 -3.24 Z";

let inFlight = 0;

export const generateMural = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (inFlight > 24) {
      return { error: "Serviço ocupado — tenta daqui a segundos." } as const;
    }
    inFlight++;
    try {
      const { turma, alunos, pais } = data;

      const pdf = await PDFDocument.create();
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const dark = rgb(0.18, 0.16, 0.32);
      const muted = rgb(0.45, 0.4, 0.55);
      const primary = rgb(0.85, 0.35, 0.1);
      const border = rgb(0.82, 0.8, 0.88);
      const estrelaCor = rgb(0.87, 0.62, 0.12);
      const spareBorder = rgb(0.9, 0.89, 0.94);

      const W = 595;
      const H = 842;
      const M = 44;

      const p1 = pdf.addPage([W, H]);

      // ── Cabeçalho ──
      p1.drawRectangle({ x: 0, y: H - 116, width: W, height: 116, color: rgb(0.96, 0.93, 0.9) });
      p1.drawText("MURAL DE ESTRELAS", {
        x: M,
        y: H - 50,
        size: 24,
        font: titleFont,
        color: dark,
      });
      p1.drawText(`Turma: ${turma}`, {
        x: M,
        y: H - 76,
        size: 13,
        font: titleFont,
        color: primary,
      });
      p1.drawText(
        `Uma estrela pintada por cada conquista — 10 por aluno  ·  ${PAIS_NOME[pais]}  ·  kidoz.online/escolas`,
        { x: M, y: H - 96, size: 9.5, font: bodyFont, color: muted },
      );

      // ── Grelha 6×6 ──
      const cols = 6;
      const rows = 6;
      const gap = 8;
      const top = H - 128;
      const cw = (W - M * 2 - gap * (cols - 1)) / cols;
      const ch = (top - 44 - gap * (rows - 1)) / rows;

      for (let i = 0; i < cols * rows; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = M + col * (cw + gap);
        const y = top - row * (ch + gap);
        const num = i + 1;
        const ativo = num <= alunos;

        p1.drawRectangle({
          x,
          y: y - ch,
          width: cw,
          height: ch,
          borderColor: ativo ? border : spareBorder,
          borderWidth: ativo ? 1 : 0.7,
          color: ativo ? rgb(1, 1, 1) : rgb(0.99, 0.99, 1),
        });

        if (ativo) {
          p1.drawText(`${num}.`, {
            x: x + 6,
            y: y - 14,
            size: 9,
            font: titleFont,
            color: muted,
          });
          p1.drawLine({
            start: { x: x + 22, y: y - 14 },
            end: { x: x + cw - 6, y: y - 14 },
            color: border,
            thickness: 0.9,
          });

          // 10 estrelas para pintar (2 fileiras × 5)
          for (let s = 0; s < 10; s++) {
            const sx = x + (cw * ((s % 5) + 0.5)) / 5;
            const sy = y - 36 - Math.floor(s / 5) * 26;
            p1.drawSvgPath(ESTRELA, {
              x: sx,
              y: sy,
              scale: 0.62,
              borderColor: estrelaCor,
              borderWidth: 0.9,
            });
          }
        }
      }

      // ── Rodapé ──
      p1.drawText("Pinta uma estrela por cada exercício, ronda ou boa ação da semana.", {
        x: M,
        y: 30,
        size: 9,
        font: bodyFont,
        color: muted,
      });
      p1.drawText("Kidoz", { x: W - M - 40, y: 30, size: 9, font: titleFont, color: primary });

      const pdfBase64 = await pdf.saveAsBase64();
      const fileName = `kidoz-mural-estrelas.pdf`;
      return { pdfBase64, fileName };
    } finally {
      inFlight--;
    }
  });
