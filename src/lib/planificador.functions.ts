// Planificador Semanal do Professor — PDF A4 de uma página com a semana
// tipo pronta: 3 blocos por dia (Português, Matemática, Estudo do Meio/
// Reforço), alinhado ao 1.º ciclo e adaptado ao país (naming ano/classe,
// moeda nos problemas, exemplos locais). Sem auth: input estrito + trava de
// concorrência (mesmo padrão da proposta e das fichas).
//
// Diferencial: nenhum concorrente entrega ao professor um plano semanal
// pronto a imprimir, ligado às lições da plataforma e à realidade local.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  turma: z.string().max(40).default(""),
  ano: z.number().int().min(1).max(4),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const PAIS_NOME: Record<string, string> = {
  pt: "Portugal",
  mz: "Moçambique",
  ao: "Angola",
  cv: "Cabo Verde",
  br: "Brasil",
};

// "N.º ano" (PT/BR) vs "N.ª classe" (MZ/AO/CV) — naming local do 1.º ciclo
const anoLabel = (ano: number, pais: string) =>
  pais === "mz" || pais === "ao" || pais === "cv" ? `${ano}.ª classe` : `${ano}.º ano`;

// Moeda usada nos problemas de matemática
const MOEDA_EXEMPLO: Record<string, { nome: string; ex: string }> = {
  pt: { nome: "euros", ex: "um caderno de 2€ e uma caneta de 1,50€" },
  mz: { nome: "meticais", ex: "um caderno de 30 MT e uma caneta de 20 MT" },
  ao: { nome: "kwanzas", ex: "um caderno de 500 Kz e uma caneta de 300 Kz" },
  cv: { nome: "escudos", ex: "um caderno de 150 Esc e uma caneta de 100 Esc" },
  br: { nome: "reais", ex: "um caderno de R$ 5,00 e uma caneta de R$ 3,50" },
};

// Palavra local de referência (adaptação vocabular do país)
const PALAVRA_LOCAL: Record<string, string> = {
  pt: "telemóvel",
  mz: "capulana",
  ao: "candongueiro",
  cv: "coladeira",
  br: "ônibus",
};

// Banco de conteúdos por ano — 5 dias × 3 blocos. Estrutura semanal estável
// (leitura → escrita → jogo → ditado → avaliação lúdica) com progressão real
// do 1.º ao 4.º ano.
type Dia = { pt: string; mat: string; em: string };

const SEMANA: Record<number, Dia[]> = {
  1: [
    {
      pt: "Vogais e sílabas simples — caça-sílabas com a palavra local",
      mat: "Números até 50 — contar e escrever",
      em: "O meu corpo e os cinco sentidos",
    },
    {
      pt: "Leitura oral de sílabas — jogo do comboio de palavras",
      mat: "Adição sem transporte — objetos da sala",
      em: "A minha família — desenho e apresentação",
    },
    {
      pt: "Escrever o próprio nome e palavras simples",
      mat: "Comparar quantidades — mais/menos/igual",
      em: "A escola: salas, professores e regras",
    },
    {
      pt: "Ditado de sílabas simples + revisão em pares",
      mat: "Números até 100 — sequências de 2 em 2",
      em: "Animais que conheço — sons e habitats",
    },
    {
      pt: "Avaliação lúdica: bingo das letras",
      mat: "Jogo de contagem com estrelas da turma",
      em: "Assembleia das estrelas — semana em revista",
    },
  ],
  2: [
    {
      pt: "Leitura de palavras com dígrafos (ch, nh, lh, rr)",
      mat: "Números até 500 — decompor em centenas",
      em: "A água no dia a dia — poupar é cuidar",
    },
    {
      pt: "Escrita de frases simples — pontuação inicial",
      mat: "Adição e subtração com dinheiro local",
      em: "Os meus direitos e deveres na escola",
    },
    {
      pt: "Leitura em voz alta com expressão (teatro curto)",
      mat: "Problemas do dia a dia: comprar e dar troco",
      em: "Plantas da minha terra — observar e desenhar",
    },
    {
      pt: "Ditado de palavras com dígrafos + autocorreção",
      mat: "Dobro e metade — com materiais concretos",
      em: "Os transportes da minha comunidade",
    },
    {
      pt: "Avaliação lúdica: caça ao tesouro de palavras",
      mat: "Desafio em equipas: problemas de 2 passos",
      em: "Assembleia das estrelas — o que aprendemos",
    },
  ],
  3: [
    {
      pt: "Leitura fluente de parágrafos — compreensão literal",
      mat: "Multiplicação como somas repetidas",
      em: "O clima e as estações no meu país",
    },
    {
      pt: "Gramática: nome, adjetivo e concordância",
      mat: "Tabuadas do 2, 5 e 10 — rodagem cronometrada",
      em: "Profissões da minha comunidade — entrevistas",
    },
    {
      pt: "Escrita criativa: descrição de um lugar conhecido",
      mat: "Multiplicação com dinheiro local",
      em: "Mapa da escola e do caminho de casa",
    },
    {
      pt: "Ditado de frases + revisão ortográfica",
      mat: "Divisão em partes iguais — partilha justa",
      em: "Animais da região: classe e alimentação",
    },
    {
      pt: "Avaliação lúdica: quiz de compreensão",
      mat: "Jogo de tabuadas com fichas de estrelas",
      em: "Assembleia das estrelas — projetos da semana",
    },
  ],
  4: [
    {
      pt: "Leitura interpretativa — inferir intenção e causa",
      mat: "Números até 10 000 — ordem e comparação",
      em: "O meio ambiente: problemas e soluções",
    },
    {
      pt: "Escrita de parágrafos com início, meio e fim",
      mat: "Adição e subtração com transporte",
      em: "Energia: fontes, usos e poupança",
    },
    {
      pt: "Projeto de escrita: cartaz informativo da turma",
      mat: "Frações simples — metade, terço, quarto",
      em: "Património local: tradições e origens",
    },
    {
      pt: "Ditado semanal + análise de erros comuns",
      mat: "Problemas de várias etapas com dinheiro",
      em: "Saúde e higiene — hábitos e prevenção",
    },
    {
      pt: "Avaliação lúdica: debate de ideias em equipas",
      mat: "Torneio de problemas — modo mata-mata",
      em: "Assembleia das estrelas — balanço do mês",
    },
  ],
};

const DIAS = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"] as const;
const BLOCOS = ["1.º bloco (30 min)", "2.º bloco (30 min)", "3.º bloco (20 min)"] as const;

let inFlight = 0;

export const generatePlanificador = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    if (inFlight > 24) {
      return { error: "Serviço ocupado — tenta daqui a segundos." } as const;
    }
    inFlight++;
    try {
      const { turma, ano, pais } = data;
      const semana = SEMANA[ano];
      const moeda = MOEDA_EXEMPLO[pais];
      const palavra = PALAVRA_LOCAL[pais];

      const pdf = await PDFDocument.create();
      const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
      const dark = rgb(0.18, 0.16, 0.32);
      const muted = rgb(0.45, 0.4, 0.55);
      const primary = rgb(0.85, 0.35, 0.1);

      const W = 595;
      const H = 842;
      const M = 48;

      const page = pdf.addPage([W, H]);

      // Cabeçalho
      page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: rgb(0.96, 0.93, 0.9) });
      page.drawText("PLANO SEMANAL DO PROFESSOR", {
        x: M,
        y: H - 46,
        size: 19,
        font: titleFont,
        color: primary,
      });
      page.drawText(
        `${turma.trim() || "A minha turma"}  ·  ${anoLabel(ano, pais)}  ·  ${PAIS_NOME[pais]}`,
        { x: M, y: H - 68, size: 11, font: titleFont, color: dark },
      );
      page.drawText("kidoz.online/escolas — alinhado ao 1.º ciclo", {
        x: W - M - 200,
        y: H - 68,
        size: 9,
        font: bodyFont,
        color: muted,
      });

      let y = H - 124;
      const draw = (text: string, size = 10, font = bodyFont, color = dark, gap = 15, x = M) => {
        const maxChars = Math.floor((W - M * 2 - (x - M)) / (size * 0.5));
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
          page.drawText(c, { x, y, size, font, color });
          y -= gap;
        }
      };

      draw(
        `Semana tipo com 3 blocos por dia. Riscar, reordenar e adaptar é permitido — o plano serve a turma, não o contrário. Cada bloco liga-se às lições da plataforma (Modo Turma ao Vivo) e às fichas imprimíveis.`,
        9.5,
        bodyFont,
        muted,
        13,
      );

      // Dias da semana
      for (let d = 0; d < 5; d++) {
        page.drawRectangle({
          x: M - 8,
          y: y - 4,
          width: W - M * 2 + 16,
          height: 16,
          color: rgb(0.93, 0.89, 0.86),
        });
        page.drawText(DIAS[d], {
          x: M,
          y: y + 1,
          size: 11,
          font: titleFont,
          color: dark,
        });
        y -= 22;

        draw(`${BLOCOS[0]}  ·  Português`, 9.5, titleFont, primary, 13, M + 8);
        draw(semana[d].pt, 9.5, bodyFont, dark, 13, M + 16);
        draw(`${BLOCOS[1]}  ·  Matemática`, 9.5, titleFont, primary, 13, M + 8);
        draw(semana[d].mat, 9.5, bodyFont, dark, 13, M + 16);
        draw(`${BLOCOS[2]}  ·  Estudo do Meio`, 9.5, titleFont, primary, 13, M + 8);
        draw(semana[d].em, 9.5, bodyFont, dark, 14, M + 16);
        y -= 4;
      }

      // Notas de adaptação local (posição fixa, com folga garantida após os 5 dias)
      page.drawRectangle({
        x: M - 8,
        y: 96,
        width: W - M * 2 + 16,
        height: 64,
        color: rgb(0.96, 0.93, 0.9),
      });
      page.drawText("ADAPTAÇÃO LOCAL", { x: M, y: 142, size: 10, font: titleFont, color: primary });
      const notas = [
        `Dinheiro nos problemas: ${moeda.ex} (${moeda.nome}).`,
        `Vocabulário de referência do país: "${palavra}" — usa palavras que as crianças veem todos os dias.`,
        `Naming: ${anoLabel(ano, pais)} (${PAIS_NOME[pais]}). Avaliação: estrelas da turma, sem notas nos 1.º meses.`,
      ];
      let ny = 128;
      for (const n of notas) {
        page.drawText(n, { x: M, y: ny, size: 8.5, font: bodyFont, color: dark });
        ny -= 11;
      }

      // Rodapé
      page.drawRectangle({ x: 0, y: 0, width: W, height: 56, color: rgb(0.96, 0.93, 0.9) });
      page.drawText("Plano editável — imprime, adapta e partilha com a equipa da escola.", {
        x: M,
        y: 34,
        size: 10,
        font: titleFont,
        color: dark,
      });
      page.drawText("Fichas imprimíveis grátis e Modo Turma: kidoz.online/escolas", {
        x: M,
        y: 19,
        size: 9,
        font: bodyFont,
        color: muted,
      });

      const slug = (turma || anoLabel(ano, pais))
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0, 40);
      const fileName = `kidoz-plano-semanal-${slug}-${pais}.pdf`;
      const pdfBase64 = await pdf.saveAsBase64();
      return { pdfBase64, fileName } as const;
    } finally {
      inFlight--;
    }
  });
