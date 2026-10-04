// Proposta comercial em PDF — arma o professor para convencer a direção.
// Um clique gera uma proposta A4 de uma página: o que é o Kidoz, investimento
// na moeda do país, plano piloto de 4 semanas, garantias RGPD/offline e o
// Programa de Escolas Fundadoras. Sem auth: input estrito + trava de
// concorrência (mesmo padrão das fichas imprimíveis).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  escola: z.string().max(80).default(""),
  alunos: z.number().int().min(1).max(5000),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

// Moeda local para o equivalente de referência (cobrança continua em EUR).
const MOEDA: Record<string, { taxa: number; fmt: (v: number) => string; nome: string }> = {
  pt: { taxa: 1, nome: "euros", fmt: (v) => `${v.toFixed(2).replace(".", ",")} \u20ac` },
  mz: { taxa: 69, nome: "meticais", fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} MT` },
  ao: { taxa: 1000, nome: "kwanzas", fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} Kz` },
  cv: { taxa: 110, nome: "escudos", fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} Esc` },
  br: {
    taxa: 6,
    nome: "reais",
    fmt: (v) => `R$ ${v.toFixed(2).replace(".", ",")}`,
  },
};

const PAIS_NOME: Record<string, string> = {
  pt: "Portugal",
  mz: "Moçambique",
  ao: "Angola",
  cv: "Cabo Verde",
  br: "Brasil",
};

const eur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

let inFlight = 0;

export const generateProposal = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (inFlight > 24) {
      return { error: "Serviço ocupado — tenta daqui a segundos." } as const;
    }
    inFlight++;
    try {
      const { escola, alunos, pais } = data;
      const moeda = MOEDA[pais];
      const monthly = alunos * 0.99;
      const yearly = monthly * 12;
      const fundador = yearly * 0.5;

      const pdf = await PDFDocument.create();
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const dark = rgb(0.18, 0.16, 0.32);
      const muted = rgb(0.45, 0.4, 0.55);
      const primary = rgb(0.85, 0.35, 0.1);

      const W = 595;
      const H = 842;
      const M = 52;

      // Cabeçalho
      const header = pdf.addPage([W, H]);
      header.drawRectangle({
        x: 0,
        y: H - 110,
        width: W,
        height: 110,
        color: rgb(0.96, 0.93, 0.9),
      });
      header.drawText("KIDOZ PARA ESCOLAS", {
        x: M,
        y: H - 52,
        size: 22,
        font: titleFont,
        color: primary,
      });
      header.drawText("Proposta para a direção - kidoz.online/escolas", {
        x: M,
        y: H - 74,
        size: 10,
        font: bodyFont,
        color: muted,
      });
      const hoje = new Date();
      const dataStr = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;
      header.drawText(dataStr, {
        x: W - M - 70,
        y: H - 52,
        size: 10,
        font: bodyFont,
        color: muted,
      });

      let y = H - 150;
      const line = (text: string, size = 10.5, font = bodyFont, color = dark, gap = 16) => {
        // Quebra simples por largura aproximada (Helvetica ~0.5*size por char)
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
          header.drawText(c, { x: M, y, size, font, color });
          y -= gap;
        }
      };

      line(escola ? `Para: ${escola}` : "Para: a direção da nossa escola", 12, titleFont, dark, 20);

      line("O QUE E", 13, titleFont, primary, 20);
      line(
        "Plataforma de aprendizagem em português para o 1.º ciclo: Português, Matemática e Estudo do Meio, com mascotes, lições curtas estilo Duolingo e recompensas que trazem as crianças de volta todos os dias.",
      );
      line(
        "Painel do professor com precisão, minutos e evolução de cada aluno; relatório de turma em PDF para conselhos; exportação CSV; resumos para as famílias por WhatsApp.",
      );
      line(
        "Funciona offline e em tablets partilhados — as lições continuam disponíveis quando a internet falha e sincronizam depois. Sem anúncios, sem chat entre estranhos.",
        10.5,
        bodyFont,
        dark,
        22,
      );

      line("INVESTIMENTO", 13, titleFont, primary, 20);
      line(
        `0,99\u20ac por aluno/mês (IVA incluído) - menos de 5 cêntimos por dia útil por aluno. Com ${alunos} alunos:`,
      );
      line(`${eur(monthly)} por mês  ·  ${eur(yearly)} por ano`, 15, titleFont, dark, 24);
      if (pais !== "pt") {
        line(
          `Equivalente de referência em ${moeda.nome}: ${moeda.fmt(monthly * moeda.taxa)}/mês (câmbio de referência; a cobrança é feita em euros).`,
          9.5,
          bodyFont,
          muted,
          18,
        );
      }
      line(
        "Mínimo 20 alunos · cancelamento a qualquer momento · faturação com NIF da instituição.",
        9.5,
        bodyFont,
        muted,
        22,
      );

      line("PROGRAMA DE ESCOLAS FUNDADORAS", 13, titleFont, primary, 20);
      line(
        `As primeiras 20 instituições têm 50% de desconto no 1.º ano, aplicado na fatura: poupança de ${eur(fundador)} com ${alunos} alunos. Inclui certificado de Escola Fundadora, formação inicial gratuita e voto no roteiro do produto.`,
        10.5,
        bodyFont,
        dark,
        22,
      );

      line("PLANO PILOTO SUGERIDO (4 SEMANAS)", 13, titleFont, primary, 20);
      line(
        "1) Onboarding de 30 min: escola, turmas e códigos de acesso dos alunos.",
        10,
        bodyFont,
        dark,
        15,
      );
      line(
        "2) Uso em aula ou ATL, 2 a 3 vezes por semana (5-10 min por aluno).",
        10,
        bodyFont,
        dark,
        15,
      );
      line("3) Análise do primeiro relatório de turma (PDF de um clique).", 10, bodyFont, dark, 15);
      line("4) Decisão do conselho com dados reais dos nossos alunos.", 10, bodyFont, dark, 22);

      line("GARANTIAS", 13, titleFont, primary, 20);
      line(
        "Conformidade RGPD: dados dos alunos protegidos, apagáveis a pedido dos pais. Conteúdo adaptado ao país (" +
          PAIS_NOME[pais] +
          "): moeda, palavras e naming das classes. Suporte dedicado e onboarding da equipa incluídos.",
        10.5,
        bodyFont,
        dark,
        22,
      );

      // Rodapé
      header.drawRectangle({ x: 0, y: 0, width: W, height: 64, color: rgb(0.96, 0.93, 0.9) });
      header.drawText("Pedimos aprovação para avançar com o piloto de 4 semanas.", {
        x: M,
        y: 40,
        size: 11,
        font: titleFont,
        color: dark,
      });
      header.drawText(
        "Demonstração e fichas grátis: kidoz.online/escolas  ·  escolas@kidoz.online",
        {
          x: M,
          y: 24,
          size: 9.5,
          font: bodyFont,
          color: muted,
        },
      );
      header.drawText("Kidoz", { x: W - M - 40, y: 24, size: 11, font: titleFont, color: primary });

      // Nome de ficheiro seguro (ASCII): remove acentos/espaços
      const slug = escola
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 40);
      const fileName = `kidoz-proposta-${slug ? `${slug}-` : ""}${pais}.pdf`;
      const pdfBase64 = await pdf.saveAsBase64();
      return { pdfBase64, fileName } as const;
    } finally {
      inFlight--;
    }
  });
