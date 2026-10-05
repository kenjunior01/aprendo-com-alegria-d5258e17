// Gerador de Torneios — "Copa Kidoz" entre turmas ou equipas.
// Kit institucional único: o professor cria um torneio (mata-mata 4/8 ou
// liga 4-6 equipas) e descarrega um PDF A4 com o quadro imprimível, as
// regras, a folha de registo de resultados e os diplomas do pódio.
// Cada ronda joga-se no Modo Turma ao vivo (PIN) ou com fichas imprimíveis
// — fechar o ciclo: jogar → registar → pódio. Zero estado no servidor:
// input estrito + trava de concorrência (mesmo padrão das fichas).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  nome: z.string().trim().min(1).max(60).default("Copa Kidoz"),
  modo: z.enum(["mata4", "mata8", "liga"]),
  equipas: z.array(z.string().trim().min(1).max(24)).min(4).max(8),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const PAIS_NOME: Record<string, string> = {
  pt: "Portugal",
  mz: "Moçambique",
  ao: "Angola",
  cv: "Cabo Verde",
  br: "Brasil",
};

const MODO_LABEL: Record<string, string> = {
  mata4: "Mata-mata · 4 equipas",
  mata8: "Mata-mata · 8 equipas",
  liga: "Liga · todos contra todos",
};

// Round-robin (método do círculo): N-1 rondas, N/2 jogos por ronda.
function roundRobin(n: number): number[][][] {
  const rondas: number[][][] = [];
  const idx = [...Array(n).keys()];
  for (let r = 0; r < n - 1; r++) {
    const jogos: number[][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = idx[i];
      const b = idx[n - 1 - i];
      jogos.push([a, b]);
    }
    rondas.push(jogos);
    idx.splice(1, 0, idx.pop() as number);
  }
  return rondas;
}

let inFlight = 0;

export const generateTournament = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (inFlight > 24) {
      return { error: "Serviço ocupado — tenta daqui a segundos." } as const;
    }
    const { nome, modo, equipas, pais } = data;

    // Validação do modo vs nº de equipas
    if (modo === "mata4" && equipas.length !== 4) {
      return { error: "O mata-mata de 4 precisa de exatamente 4 equipas." } as const;
    }
    if (modo === "mata8" && equipas.length !== 8) {
      return { error: "O mata-mata de 8 precisa de exatamente 8 equipas." } as const;
    }
    if (modo === "liga" && (equipas.length < 4 || equipas.length > 6)) {
      return { error: "A liga aceita de 4 a 6 equipas." } as const;
    }

    inFlight++;
    try {
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

      const hoje = new Date();
      const dataStr = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

      // ───────────────────────── Página 1: quadro ─────────────────────────
      const p1 = pdf.addPage([W, H]);
      p1.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: rgb(0.96, 0.93, 0.9) });
      p1.drawText(nome.toUpperCase(), {
        x: M,
        y: H - 48,
        size: 20,
        font: titleFont,
        color: primary,
      });
      p1.drawText(
        `${MODO_LABEL[modo]}  ·  ${PAIS_NOME[pais]}  ·  ${dataStr}  ·  kidoz.online/escolas`,
        {
          x: M,
          y: H - 68,
          size: 10,
          font: bodyFont,
          color: muted,
        },
      );

      // Caixa "Como funciona"
      p1.drawText("COMO FUNCIONA", { x: M, y: H - 120, size: 12, font: titleFont, color: dark });
      const regras = [
        "1. Cada ronda: as equipas jogam o Modo Turma ao vivo (PIN) ou resolvem uma ficha imprimível.",
        "2. Soma os pontos de precisão de cada equipa e escreve o resultado no quadro.",
        "3. Vence a equipa com mais pontos. Em caso de empate: ronda-extra de sequências.",
        "4. No fim, preenche os diplomas do pódio e entrega-os em cerimónia — as crianças adoram!",
      ];
      regras.forEach((r, i) => {
        p1.drawText(r, { x: M, y: H - 138 - i * 14, size: 9.5, font: bodyFont, color: dark });
      });

      // Caixa de jogo: título + duas linhas de equipa com espaço para pontos
      const matchBox = (
        x: number,
        y: number,
        titulo: string,
        a: string | null,
        b: string | null,
      ) => {
        p1.drawRectangle({ x, y, width: 150, height: 60, borderColor: border, borderWidth: 1.2 });
        p1.drawText(titulo, { x: x + 6, y: y + 46, size: 7, font: bodyFont, color: muted });
        const linha = (t: string | null, yy: number) => {
          p1.drawText(t ?? "__________", {
            x: x + 6,
            y: yy,
            size: 9,
            font: t ? titleFont : bodyFont,
            color: dark,
          });
          p1.drawText("____ : ____", {
            x: x + 96,
            y: yy,
            size: 8,
            font: bodyFont,
            color: muted,
          });
        };
        linha(a, y + 30);
        linha(b, y + 12);
      };

      const colX = [M + 4, M + 186, M + 368];

      if (modo === "mata4" || modo === "mata8") {
        const n8 = modo === "mata8";
        const qfY = n8 ? [H - 300, H - 390, H - 480, H - 570] : [H - 300, H - 450];
        const sfY = n8 ? [H - 345, H - 525] : [H - 375];
        const fY = n8 ? [H - 435] : [H - 375];

        // Ronda 1
        if (n8) {
          for (let i = 0; i < 4; i++) {
            matchBox(colX[0], qfY[i], `Quartos ${i + 1}`, equipas[i * 2], equipas[i * 2 + 1]);
          }
          // ligações QF → SF
          sfY.forEach((sy, i) => {
            const y1 = qfY[i * 2] + 30;
            const y2 = qfY[i * 2 + 1] + 30;
            const midX = colX[0] + 150 + 16;
            p1.drawLine({
              start: { x: colX[0] + 150, y: y1 },
              end: { x: midX, y: y1 },
              color: border,
              thickness: 1,
            });
            p1.drawLine({
              start: { x: colX[0] + 150, y: y2 },
              end: { x: midX, y: y2 },
              color: border,
              thickness: 1,
            });
            p1.drawLine({
              start: { x: midX, y: y1 },
              end: { x: midX, y: y2 },
              color: border,
              thickness: 1,
            });
            p1.drawLine({
              start: { x: midX, y: (y1 + y2) / 2 },
              end: { x: colX[1], y: (y1 + y2) / 2 },
              color: border,
              thickness: 1,
            });
          });
        } else {
          matchBox(colX[0], qfY[0], "Semifinal 1", equipas[0], equipas[1]);
          matchBox(colX[0], qfY[1], "Semifinal 2", equipas[2], equipas[3]);
        }

        // Semifinais (mata8) → final
        if (n8) {
          matchBox(colX[1], sfY[0], "Semifinal 1", null, null);
          matchBox(colX[1], sfY[1], "Semifinal 2", null, null);
          sfY.forEach((sy, i) => {
            const midX = colX[1] + 150 + 16;
            p1.drawLine({
              start: { x: colX[1] + 150, y: sy + 30 },
              end: { x: midX, y: sy + 30 },
              color: border,
              thickness: 1,
            });
            p1.drawLine({
              start: { x: midX, y: sfY[0] + 30 },
              end: { x: midX, y: sfY[1] + 30 },
              color: border,
              thickness: 1,
            });
            p1.drawLine({
              start: { x: midX, y: (sfY[0] + sfY[1]) / 2 + 30 },
              end: { x: colX[2], y: (sfY[0] + sfY[1]) / 2 + 30 },
              color: border,
              thickness: 1,
            });
          });
        }
        matchBox(colX[2], fY[0], "FINAL", null, null);
        // Caixa do campeão + linha da final
        p1.drawLine({
          start: { x: colX[2] + 75, y: fY[0] },
          end: { x: colX[2] + 75, y: fY[0] - 26 },
          color: border,
          thickness: 1,
        });
        p1.drawRectangle({
          x: colX[2],
          y: fY[0] - 86,
          width: 150,
          height: 60,
          borderColor: border,
          borderWidth: 1.2,
        });
        p1.drawText("CAMPEÃO", {
          x: colX[2] + 6,
          y: fY[0] - 40,
          size: 8,
          font: titleFont,
          color: primary,
        });
        p1.drawText("____________", {
          x: colX[2] + 6,
          y: fY[0] - 64,
          size: 9,
          font: bodyFont,
          color: dark,
        });
      } else {
        // ── Liga: tabela de classificação + jogos de todas as rondas ──
        const n = equipas.length;
        const colW = [190, 50, 50, 50, 50, 59];
        const colT = ["Turma / Equipa", "J", "V", "E", "D", "Pts"];
        const ty = H - 310;
        p1.drawText("CLASSIFICAÇÃO", { x: M, y: ty + 16, size: 12, font: titleFont, color: dark });
        // cabeçalho
        let tx = M;
        colT.forEach((c, i) => {
          p1.drawRectangle({
            x: tx,
            y: ty - 24,
            width: colW[i],
            height: 24,
            color: rgb(0.93, 0.9, 0.88),
          });
          p1.drawText(c, { x: tx + 6, y: ty - 17, size: 9, font: titleFont, color: dark });
          tx += colW[i];
        });
        // linhas
        equipas.forEach((e, i) => {
          const y = ty - 24 - 28 * (i + 1);
          tx = M;
          colW.forEach((w2) => {
            p1.drawRectangle({
              x: tx,
              y,
              width: w2,
              height: 28,
              borderColor: border,
              borderWidth: 1,
            });
            tx += w2;
          });
          p1.drawText(`${i + 1}. ${e}`, {
            x: M + 6,
            y: y + 9,
            size: 9.5,
            font: titleFont,
            color: dark,
          });
        });

        // Jogos: todos contra todos
        const rondas = roundRobin(n);
        const jy = ty - 24 - 28 * n - 34;
        p1.drawText("JOGOS — TODOS CONTRA TODOS", {
          x: M,
          y: jy,
          size: 12,
          font: titleFont,
          color: dark,
        });
        rondas.forEach((jogos, r) => {
          const texto = jogos.map(([a, b]) => `${equipas[a]} × ${equipas[b]}`).join("    ·    ");
          p1.drawText(`Ronda ${r + 1}:  ${texto}`, {
            x: M,
            y: jy - 20 - r * 18,
            size: 9.5,
            font: bodyFont,
            color: dark,
          });
        });
      }

      p1.drawText("Torneios grátis para instituições — gera o teu em kidoz.online/escolas", {
        x: M,
        y: 34,
        size: 9,
        font: bodyFont,
        color: muted,
      });
      p1.drawText("Kidoz", { x: W - M - 40, y: 34, size: 9, font: titleFont, color: primary });

      // ─────────────── Página 2: registo + diplomas do pódio ───────────────
      const p2 = pdf.addPage([W, H]);
      p2.drawText("REGISTO DE RESULTADOS", {
        x: M,
        y: H - 56,
        size: 14,
        font: titleFont,
        color: dark,
      });
      p2.drawText(`${nome} · ${MODO_LABEL[modo]}`, {
        x: M,
        y: H - 74,
        size: 9.5,
        font: bodyFont,
        color: muted,
      });

      const jogosLiga = Math.ceil((equipas.length * (equipas.length - 1)) / 2);
      const regRows = modo === "mata8" ? 7 : modo === "mata4" ? 3 : Math.min(jogosLiga, 6);
      const rowH = 22;
      const colW2 = [64, 150, 70, 150, 65];
      const head2 = ["Ronda", "Equipa A", "Pontos", "Equipa B", "Pontos"];
      const ry = H - 92;
      let rx = M;
      head2.forEach((c, i) => {
        p2.drawRectangle({
          x: rx,
          y: ry - rowH,
          width: colW2[i],
          height: rowH,
          color: rgb(0.93, 0.9, 0.88),
        });
        p2.drawText(c, { x: rx + 6, y: ry - rowH + 6, size: 8.5, font: titleFont, color: dark });
        rx += colW2[i];
      });
      for (let i = 0; i < regRows; i++) {
        rx = M;
        colW2.forEach((w2) => {
          p2.drawRectangle({
            x: rx,
            y: ry - rowH - rowH * (i + 1),
            width: w2,
            height: rowH,
            borderColor: border,
            borderWidth: 1,
          });
          rx += w2;
        });
      }
      if (modo === "liga" && jogosLiga > regRows) {
        p2.drawText(`(continua noutra folha — ${jogosLiga} jogos no total)`, {
          x: M,
          y: ry - rowH - rowH * regRows - 14,
          size: 8.5,
          font: bodyFont,
          color: muted,
        });
      }

      // Diplomas do pódio (recortáveis) — 3 caixas de 118 pt com medalha
      p2.drawText("DIPLOMAS DO PÓDIO — RECORTA E ENTREGA EM CERIMÓNIA", {
        x: M,
        y: 548,
        size: 12,
        font: titleFont,
        color: dark,
      });
      const lugares = ["1.º LUGAR", "2.º LUGAR", "3.º LUGAR"];
      lugares.forEach((l, i) => {
        const dy = 468 - i * 128; // topo da caixa
        p2.drawRectangle({
          x: M,
          y: dy - 118,
          width: W - M * 2,
          height: 118,
          borderColor: border,
          borderWidth: 1.5,
        });
        p2.drawRectangle({
          x: M + 6,
          y: dy - 112,
          width: W - M * 2 - 12,
          height: 106,
          borderColor: border,
          borderWidth: 0.8,
        });
        p2.drawCircle({
          x: M + 40,
          y: dy - 59,
          size: 16,
          color: rgb(0.96, 0.93, 0.9),
          borderColor: border,
          borderWidth: 1,
        });
        p2.drawText(String(i + 1), {
          x: M + 36,
          y: dy - 65,
          size: 14,
          font: titleFont,
          color: primary,
        });
        p2.drawText(`DIPLOMA — ${l}`, {
          x: M + 70,
          y: dy - 30,
          size: 13,
          font: titleFont,
          color: primary,
        });
        p2.drawText(nome, { x: M + 70, y: dy - 48, size: 9.5, font: bodyFont, color: muted });
        p2.drawText("Concedido a: ______________________________________________", {
          x: M + 70,
          y: dy - 70,
          size: 10,
          font: bodyFont,
          color: dark,
        });
        p2.drawText("Data: ____ / ____ / ____          Assinatura: ____________________", {
          x: M + 70,
          y: dy - 94,
          size: 9.5,
          font: bodyFont,
          color: dark,
        });
      });

      p2.drawText("Organiza torneios entre turmas com o Kidoz — kidoz.online/escolas", {
        x: M,
        y: 34,
        size: 9,
        font: bodyFont,
        color: muted,
      });

      const slug = nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 30);
      const fileName = `kidoz-torneio-${modo}${slug ? `-${slug}` : ""}.pdf`;
      const pdfBase64 = await pdf.saveAsBase64();
      return { pdfBase64, fileName } as const;
    } finally {
      inFlight--;
    }
  });
