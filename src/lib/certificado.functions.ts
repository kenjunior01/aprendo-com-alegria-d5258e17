// Carta de adesão ao Programa de Escolas Fundadoras — o documento que a
// direção imprime, assina e devolve. Transforma o interesse num passo
// administrativo concreto: escola, benefícios (50% no 1.º ano), condições e
// linhas de assinatura. Sem auth: input estrito + trava de concorrência
// (mesmo padrão da proposta, fichas e planificador).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  escola: z.string().min(2).max(80),
  alunos: z.number().int().min(1).max(5000),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const PAIS_NOME: Record<string, string> = {
  pt: "Portugal",
  mz: "Moçambique",
  ao: "Angola",
  cv: "Cabo Verde",
  br: "Brasil",
};

const eur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

let inFlight = 0;

export const generateCartaFundadora = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (inFlight > 24) {
      return { error: "Serviço ocupado — tenta daqui a segundos." } as const;
    }
    inFlight++;
    try {
      const { escola, alunos, pais } = data;
      const annualPoupanca = alunos * 0.99 * 12 * 0.5; // 50% do 1.º ano
      const anual = alunos * 0.99 * 10; // plano anual: 10 meses pagos

      const pdf = await PDFDocument.create();
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const dark = rgb(0.18, 0.16, 0.32);
      const muted = rgb(0.45, 0.4, 0.55);
      const primary = rgb(0.85, 0.35, 0.1);

      const W = 595;
      const H = 842;
      const M = 56;

      const page = pdf.addPage([W, H]);

      // Moldura elegante (dupla linha)
      page.drawRectangle({
        x: 28,
        y: 28,
        width: W - 56,
        height: H - 56,
        borderColor: primary,
        borderWidth: 2,
        color: rgb(1, 1, 1),
      });
      page.drawRectangle({
        x: 34,
        y: 34,
        width: W - 68,
        height: H - 68,
        borderColor: rgb(0.93, 0.89, 0.86),
        borderWidth: 1,
      });

      page.drawText("KIDOZ · PROGRAMA DE ESCOLAS FUNDADORAS", {
        x: M,
        y: H - 92,
        size: 13,
        font: titleFont,
        color: primary,
      });
      page.drawText("CARTA DE ADESÃO", {
        x: M,
        y: H - 128,
        size: 26,
        font: titleFont,
        color: dark,
      });

      const hoje = new Date();
      const dataStr = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
      page.drawText(`Data: ${dataStr}`, {
        x: W - M - 90,
        y: H - 92,
        size: 10,
        font: bodyFont,
        color: muted,
      });

      let y = H - 176;
      const line = (text: string, size = 11, font = bodyFont, color = dark, gap = 17) => {
        const maxChars = Math.floor((W - M * 2) / (size * 0.5));
        const chunks: string[] = [];
        let rest = text;
        while (rest.length > maxChars) {
          let cut = rest.lastIndexOf(" ", maxChars);
          if (cut <= 0) cut = maxChars;
          chunks.push(rest.slice(0, cut));
          rest = rest.slice(cut).trimStart();
        }
        chunks.push(rest);
        for (const c of chunks) {
          page.drawText(c, { x: M, y, size, font, color });
          y -= gap;
        }
      };

      line(
        `A ${escola}, em ${PAIS_NOME[pais]}, com aproximadamente ${alunos} alunos do 1.º ciclo, manifesta a sua intenção de aderir ao Programa de Escolas Fundadoras da Kidoz — um grupo limitado às primeiras 20 instituições que moldam o produto e reservam condições especiais.`,
        11,
        bodyFont,
        dark,
        18,
      );

      line("BENEFÍCIOS RESERVADOS ÀS ESCOLAS FUNDADORAS", 11.5, titleFont, primary, 20);
      const beneficios = [
        `50% de desconto no 1.º ano, aplicado diretamente na fatura — poupança estimada de ${eur(annualPoupanca)} com ${alunos} alunos.`,
        "Certificado digital de Escola Fundadora Kidoz para a receção da escola.",
        "Formação inicial e onboarding gratuitos para todos os professores.",
        "Voto direto no roteiro do produto: novas matérias, relatórios e idiomas.",
      ];
      for (const b of beneficios) {
        line(`•  ${b}`, 10.5, bodyFont, dark, 16);
      }
      y -= 4;

      line("CONDIÇÕES", 11.5, titleFont, primary, 20);
      const condicoes = [
        "Plano mensal de 0,99€ por aluno (IVA incluído), sem fidelização — cancelamento a qualquer momento.",
        `Plano anual com 2 meses grátis: ${eur(anual)}/ano com ${alunos} alunos (cobrança única, em euros).`,
        "Piloto de 4 semanas antes da decisão final do conselho — sem custos para experimentar em modo demonstração.",
        "Faturação com NIF da instituição; pagamento por cartão, PayPal, transferência ou processo administrativo.",
        "Conformidade RGPD: dados dos alunos apagáveis a pedido dos pais, sem anúncios nem chat entre estranhos.",
      ];
      for (const c of condicoes) {
        line(`•  ${c}`, 10.5, bodyFont, dark, 16);
      }
      y -= 6;

      line(
        "Pela Kidoz, comprometemo-nos a acompanhar a adesão com um gestor dedicado, formação da equipa e relatórios mensais para o conselho.",
        10.5,
        bodyFont,
        muted,
        18,
      );

      // Assinaturas
      const yAss = 150;
      page.drawText("Pela escola", {
        x: M,
        y: yAss + 14,
        size: 10.5,
        font: titleFont,
        color: dark,
      });
      page.drawLine({
        start: { x: M, y: yAss },
        end: { x: M + 200, y: yAss },
        thickness: 1,
        color: muted,
      });
      page.drawText("nome, cargo e assinatura", {
        x: M,
        y: yAss - 14,
        size: 8.5,
        font: bodyFont,
        color: muted,
      });

      page.drawText("Pela Kidoz", {
        x: W - M - 200,
        y: yAss + 14,
        size: 10.5,
        font: titleFont,
        color: dark,
      });
      page.drawLine({
        start: { x: W - M - 200, y: yAss },
        end: { x: W - M, y: yAss },
        thickness: 1,
        color: muted,
      });
      page.drawText("gestor de adesão · data", {
        x: W - M - 200,
        y: yAss - 14,
        size: 8.5,
        font: bodyFont,
        color: muted,
      });

      page.drawText(
        "Envio desta carta assinada + perguntas: escolas@kidoz.online  ·  kidoz.online/escolas",
        { x: M, y: 66, size: 9, font: bodyFont, color: muted },
      );

      const slug = escola
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 40);
      const fileName = `kidoz-carta-fundadora-${slug}.pdf`;
      const pdfBase64 = await pdf.saveAsBase64();
      return { pdfBase64, fileName } as const;
    } finally {
      inFlight--;
    }
  });
