// Gerador de Fichas Imprimíveis — lead magnet público para /escolas.
// O professor gera fichas A4 reais (20 exercícios + soluções) sem registo:
// valor imediato que prova o posicionamento offline-first do Kidoz.
// Server function pdf-lib (padrão classReport/certificate) — cliente só
// recebe base64, bundle fica leve. Sem auth: input estrito + trava de
// concorrência em memória (custo de geração é trivial).
//
// Duas disciplinas: Matemática (adição, subtração, multiplicação,
// sequências, dinheiro) e Português (sílabas, palavras). Tudo adaptado
// ao país: naming do ano/classe, moeda local e vocabulário local
// (telemóvel em PT, ônibus no BR, capulana em MZ, candongueiro em AO,
// coladeira em CV) — mesmo produto, cinco realidades.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  tipo: z.enum([
    "adicao",
    "subtracao",
    "multiplicacao",
    "sequencias",
    "dinheiro",
    "problemas",
    "silabas",
    "palavras",
  ]),
  nivel: z.number().int().min(1).max(3),
  pais: z.enum(["pt", "mz", "ao", "cv", "br"]).default("pt"),
});

const DISC: Record<string, "mat" | "port"> = {
  adicao: "mat",
  subtracao: "mat",
  multiplicacao: "mat",
  sequencias: "mat",
  dinheiro: "mat",
  problemas: "mat",
  silabas: "port",
  palavras: "port",
};

const DISC_LABEL: Record<string, string> = {
  mat: "Matemática",
  port: "Português",
};

const TIPO_LABEL: Record<string, string> = {
  adicao: "Adição",
  subtracao: "Subtração",
  multiplicacao: "Multiplicação",
  sequencias: "Sequências",
  dinheiro: "Dinheiro",
  problemas: "Problemas",
  silabas: "Sílabas",
  palavras: "Palavras",
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
    classe: (n) => (n === 3 ? "3.º-4.º ano" : `${n}.º ano`),
  },
  mz: {
    nome: "Moçambique",
    moeda: "MT",
    antes: (s) => `${s} MT`,
    classe: (n) => (n === 3 ? "3.ª-4.ª classe" : `${n}.ª classe`),
  },
  ao: {
    nome: "Angola",
    moeda: "Kz",
    antes: (s) => `${s} Kz`,
    classe: (n) => (n === 3 ? "3.ª-4.ª classe" : `${n}.ª classe`),
  },
  cv: {
    nome: "Cabo Verde",
    moeda: "Esc",
    antes: (s) => `${s} Esc`,
    classe: (n) => (n === 3 ? "3.º-4.º ano" : `${n}.º ano`),
  },
  br: {
    nome: "Brasil",
    moeda: "R$",
    antes: (s) => `R$ ${s}`,
    classe: (n) => (n === 3 ? "3.º-4.º ano" : `${n}.º ano`),
  },
};

function nivelLabel(disc: string, nivel: number): string {
  if (disc === "port") {
    return nivel === 1
      ? "Nível 1 · palavras curtas"
      : nivel === 2
        ? "Nível 2 · palavras longas"
        : "Nível 3 · palavras gigantes";
  }
  return nivel === 1 ? "Nível 1 · até 10" : nivel === 2 ? "Nível 2 · até 20" : "Nível 3 · até 100";
}

// ─── Banco de palavras (Português) ────────────────────────────────────
// Sílabas pré-computadas: "-" marca a divisão silábica. Listas base
// universais + palavras locais por país (flavor real de cada realidade).
// curta = 2 sílabas · longa = 3 sílabas · gigante = 4+ sílabas.
const PAL: Record<"curta" | "longa" | "gigante", string[]> = {
  curta: [
    "ca-sa",
    "bo-la",
    "ga-to",
    "me-sa",
    "pa-to",
    "de-do",
    "ve-la",
    "ma-la",
    "pi-pa",
    "fa-ca",
    "sa-po",
    "ro-da",
    "bo-ta",
    "na-bo",
    "fi-ta",
    "mo-ça",
    "lo-bo",
    "go-la",
    "da-do",
    "jo-go",
    "fo-go",
    "la-ta",
    "po-ço",
    "li-vro",
    "nu-vem",
  ],
  longa: [
    "bo-ne-ca",
    "ca-va-lo",
    "ja-ne-la",
    "ga-li-nha",
    "ba-na-na",
    "ta-pe-te",
    "sa-pa-to",
    "ca-be-lo",
    "pa-ne-la",
    "fo-gue-te",
    "ca-me-lo",
    "mo-chi-la",
    "ca-ne-ta",
    "a-mi-go",
    "ca-dei-ra",
    "ga-rra-fa",
    "se-men-te",
    "pla-ne-ta",
    "cas-te-lo",
    "pro-fes-sor",
    "po-e-ta",
    "ge-la-do",
  ],
  gigante: [
    "bor-bo-le-ta",
    "bi-ci-cle-ta",
    "e-le-fan-te",
    "te-le-vi-são",
    "com-pu-ta-dor",
    "la-gar-ti-xa",
    "as-tro-nau-ta",
    "he-li-cóp-te-ro",
    "pa-pa-ga-io",
    "pa-ra-fu-so",
    "ge-la-ti-na",
    "a-mi-za-de",
    "tar-ta-ru-ga",
    "pro-fes-so-ra",
    "a-pa-ga-dor",
    "brin-ca-dei-ra",
    "jo-ga-do-ra",
    "ma-re-mo-to",
    "guar-da-na-po",
    "a-qua-ri-o",
  ],
};

// Palavras locais por país — a ficha de Português fala a língua da rua.
const PAL_PAIS: Record<string, Partial<Record<"curta" | "longa" | "gigante", string[]>>> = {
  pt: { gigante: ["te-le-mó-vel", "au-to-car-ro"] },
  br: { longa: ["ô-ni-bus", "ce-lu-lar"] },
  mz: { curta: ["cha-pa"], longa: ["ma-cham-ba"], gigante: ["ca-pu-la-na"] },
  ao: { curta: ["sem-ba"], longa: ["ki-zom-ba"], gigante: ["can-don-guei-ro"] },
  cv: { curta: ["mor-na"], longa: ["fu-na-ná", "a-lu-guer"], gigante: ["co-la-dei-ra"] },
};

// Pares singular→plural cuidadosamente regulares (+s / +es em -r).
const PLURAIS: Record<number, [string, string][]> = {
  1: [
    ["gato", "gatos"],
    ["bola", "bolas"],
    ["mesa", "mesas"],
    ["pato", "patos"],
    ["vela", "velas"],
    ["sapo", "sapos"],
    ["roda", "rodas"],
    ["fita", "fitas"],
  ],
  2: [
    ["boneca", "bonecas"],
    ["cavalo", "cavalos"],
    ["banana", "bananas"],
    ["cadeira", "cadeiras"],
    ["mochila", "mochilas"],
    ["garrafa", "garrafas"],
    ["planeta", "planetas"],
    ["janela", "janelas"],
  ],
  3: [
    ["elefante", "elefantes"],
    ["borboleta", "borboletas"],
    ["astronauta", "astronautas"],
    ["gelatina", "gelatinas"],
    ["professora", "professoras"],
    ["amizade", "amizades"],
    ["parafuso", "parafusos"],
    ["tartaruga", "tartarugas"],
  ],
};

const VOGAIS = new Set(["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú", "â", "ê", "ô", "ã", "õ"]);

function nivelSize(nivel: number): "curta" | "longa" | "gigante" {
  return nivel === 1 ? "curta" : nivel === 2 ? "longa" : "gigante";
}

function portPool(nivel: number, pais: string): string[] {
  const size = nivelSize(nivel);
  return [...PAL[size], ...(PAL_PAIS[pais]?.[size] ?? [])];
}

interface Ex {
  text: string;
  answer: string;
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function moneyStr(v: number, moeda: string, antes: (s: string) => string): string {
  const s = v % 1 === 0 ? String(v) : v.toFixed(2).replace(".", ",");
  return antes(s);
}

// Português — silabas: dividir 20 palavras em sílabas.
function genSilabas(nivel: number, pais: string): Ex[] {
  return shuffle(portPool(nivel, pais))
    .slice(0, 20)
    .map((s) => ({ text: s.replace(/-/g, ""), answer: s }));
}

// Português — palavras: mistura de 3 jogos (ordena sílabas, completa,
// plural) rodando por exercício para dar variedade na mesma folha.
function genPalavras(nivel: number, pais: string): Ex[] {
  const pool = shuffle(portPool(nivel, pais));
  const plurais = shuffle(PLURAIS[nivel]);
  const exs: Ex[] = [];
  let pi = 0;
  for (let i = 0; i < 20; i++) {
    const s = pool[i % pool.length];
    const p = s.replace(/-/g, "");
    const syl = s.split("-");
    const mode = i % 3;
    if (mode === 0) {
      // Ordena as sílabas — embaralhado nunca fica igual à palavra original.
      let sh = shuffle(syl);
      while (syl.length > 1 && sh.join("-") === s) sh = shuffle(syl);
      exs.push({ text: sh.join(" · "), answer: p });
    } else if (mode === 1) {
      if (nivel === 1) {
        // Completa a vogal que falta.
        const idxVogais = [...p].map((c, k) => (VOGAIS.has(c) ? k : -1)).filter((k) => k >= 0);
        const k = idxVogais[rnd(0, idxVogais.length - 1)];
        const falha = p[k];
        exs.push({
          text: p.slice(0, k) + "_" + p.slice(k + 1),
          answer: falha,
        });
      } else {
        // Completa a sílaba que falta (nunca a primeira nem a última).
        const idx = rnd(1, syl.length - 2);
        const comFalha = syl.map((x, k) => (k === idx ? "__" : x)).join("-");
        exs.push({ text: comFalha, answer: syl[idx] });
      }
    } else {
      const [sing, plu] = plurais[pi % plurais.length];
      pi++;
      exs.push({ text: `1 ${sing}, 2 ___`, answer: plu });
    }
  }
  return exs;
}

// Quebra de texto simples por palavras (problemas ocupam 4 linhas no máximo).
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

// Problemas com contexto local: transporte autêntico de cada país
// (autocarro PT, chapa MZ, candongueiro AO, aluguer CV, ônibus BR) —
// a realidade do dia-a-dia das crianças entra na matemática.
const PROB_TRANSPORTE: Record<string, string> = {
  pt: "autocarro",
  mz: "chapa",
  ao: "candongueiro",
  cv: "aluguer",
  br: "ônibus",
};

const NOMES_PROB = ["Ana", "João", "Maria", "Luís", "Sofia", "Pedro", "Rita", "Tomás"];

// Matemática — problemas: 8 problemas de texto (contexto e moeda locais),
// 2 colunas × 4 linhas no PDF com quebra de linha automática.
function genProblemas(nivel: number, pais: string): Ex[] {
  const cfg = PAIS[pais];
  const transp = PROB_TRANSPORTE[pais];
  const nomes = shuffle(NOMES_PROB);
  const m = (v: number) => moneyStr(v, cfg.moeda, cfg.antes);
  const exs: Ex[] = [];
  // geradores por nível — cada índice produz um problema com estrutura diferente
  for (let i = 0; i < 8; i++) {
    const N = nomes[i % nomes.length];
    if (nivel === 1) {
      const t = [
        () => {
          const a = rnd(3, 8);
          const b = rnd(1, 6);
          return {
            t: `${N} tem ${a} ${cfg.moeda} e ganha mais ${b}. Quantos ${cfg.moeda} tem agora?`,
            r: String(a + b),
          };
        },
        () => {
          const a = rnd(5, 8);
          const b = rnd(1, 3);
          return {
            t: `O ${transp} leva ${a} crianças sentadas e ${b} de pé. Quantas crianças vão?`,
            r: String(a + b),
          };
        },
        () => {
          const a = rnd(5, 10);
          const b = rnd(1, a - 1);
          return {
            t: `${N} tinha ${a} bolinhas e perdeu ${b}. Com quantas ficou?`,
            r: String(a - b),
          };
        },
        () => {
          const b = rnd(2, 4);
          const k = rnd(2, 3);
          return {
            t: `A professora reparte ${b * k} livros por ${b} mesas, igualmente. Quantos livros ficam em cada mesa?`,
            r: String(k),
          };
        },
        () => {
          const p = rnd(2, 5);
          const k = rnd(2, 3);
          return { t: `Um lápis custa ${m(p)}. Quantos custam ${k} lápis?`, r: m(p * k) };
        },
        () => {
          const a = rnd(2, 7);
          const b = a + rnd(1, 5);
          return { t: `${N} paga ${m(a)} com ${m(b)}. Quanto recebe de troco?`, r: m(b - a) };
        },
        () => {
          const a = rnd(3, 7);
          const b = rnd(2, 6);
          return {
            t: `Na fila há ${a} meninas e ${b} meninos. Quantas crianças há na fila?`,
            r: String(a + b),
          };
        },
        () => {
          const a = rnd(6, 10);
          const b = rnd(1, 4);
          return {
            t: `Na caixa havia ${a} bolos; ${N} comeu ${b}. Quantos bolos ficam?`,
            r: String(a - b),
          };
        },
      ];
      const p = t[i % t.length]();
      exs.push({ text: p.t, answer: p.r });
    } else if (nivel === 2) {
      const t = [
        () => {
          const p = rnd(8, 20);
          const k = rnd(2, 4);
          return { t: `Um caderno custa ${m(p)}. Quantos custam ${k} cadernos?`, r: m(p * k) };
        },
        () => {
          const a = rnd(8, 15);
          const b = rnd(3, 9);
          return {
            t: `No ${transp} vão ${a} adultos e ${b} crianças. Quantas pessoas vão?`,
            r: String(a + b),
          };
        },
        () => {
          const b = rnd(3, 5);
          const k = rnd(3, 6);
          return {
            t: `${b * k} bolinhas repartidas por ${b} crianças, igualmente. Quantas recebe cada uma?`,
            r: String(k),
          };
        },
        () => {
          const a = rnd(15, 25);
          const b = rnd(5, a - 3);
          return {
            t: `Um livro custa ${m(a)} e ${N} já tem ${m(b)}. Quanto falta juntar?`,
            r: m(a - b),
          };
        },
        () => {
          const k = rnd(3, 5);
          const a = rnd(4, 9);
          return {
            t: `Uma caixa tem ${k} fileiras com ${a} bolinhas em cada. Quantas bolinhas há?`,
            r: String(k * a),
          };
        },
        () => {
          const a = rnd(6, 15);
          const b = rnd(4, 12);
          return {
            t: `${N} fez ${a} exercícios na 2.ª-feira e ${b} na 4.ª. Quantos fez ao todo?`,
            r: String(a + b),
          };
        },
        () => {
          const p = rnd(6, 12);
          const k = rnd(3, 6);
          return {
            t: `Um copo de leite custa ${m(p)}. Quanto se gasta em ${k} dias, um por dia?`,
            r: m(p * k),
          };
        },
        () => {
          const a = rnd(15, 30);
          const b = rnd(5, a - 4);
          return {
            t: `Um livro tem ${a} páginas; ${N} já leu ${b}. Quantas faltam?`,
            r: String(a - b),
          };
        },
      ];
      const p = t[i % t.length]();
      exs.push({ text: p.t, answer: p.r });
    } else {
      const t = [
        () => {
          const p = rnd(25, 60);
          const q = rnd(10, 25);
          return {
            t: `Um caderno custa ${m(p)} e um lápis ${m(q)}. Quanto custam os dois juntos?`,
            r: m(p + q),
          };
        },
        () => {
          const p = rnd(15, 35);
          const k = rnd(2, 4);
          const n = p * k + rnd(10, 50);
          return {
            t: `${N} compra ${k} cadernos de ${m(p)} e paga com ${m(n)}. Quanto recebe de troco?`,
            r: m(n - p * k),
          };
        },
        () => {
          const k = rnd(3, 6);
          const c = rnd(8, 15);
          return {
            t: `O ${transp} faz ${k} viagens com ${c} crianças cada uma. Quantas crianças viajam ao todo?`,
            r: String(k * c),
          };
        },
        () => {
          const b = rnd(3, 5);
          const k = rnd(20, 40);
          return {
            t: `Repartir ${m(b * k)} por ${b} irmãos, em partes iguais. Quanto recebe cada um?`,
            r: m(k),
          };
        },
        () => {
          const a = rnd(35, 70);
          const b = rnd(20, 45);
          return {
            t: `Na 1.ª semana a turma juntou ${a} estrelas; na 2.ª juntou ${b}. Quantas estrelas têm no total?`,
            r: String(a + b),
          };
        },
        () => {
          const a = rnd(60, 120);
          const b = rnd(25, 55);
          return {
            t: `A escola tem ${a} alunos e ${b} já usam o Kidoz. Quantos alunos faltam começar?`,
            r: String(a - b),
          };
        },
        () => {
          const k = rnd(3, 5);
          const a = rnd(12, 20);
          const b = rnd(5, 15);
          return {
            t: `Uma caixa tem ${k} fileiras de ${a} bolinhas e mais ${b} soltas. Quantas bolinhas há?`,
            r: String(k * a + b),
          };
        },
        () => {
          const p = rnd(20, 45);
          const k = rnd(3, 6);
          return {
            t: `O bilhete do passeio custa ${m(p)}. Quanto pagam ${k} bilhetes?`,
            r: m(p * k),
          };
        },
      ];
      const p = t[i % t.length]();
      exs.push({ text: p.t, answer: p.r });
    }
  }
  return exs;
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
    } else if (tipo === "sequencias") {
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
      const disc = DISC[tipo];
      const exs =
        tipo === "silabas"
          ? genSilabas(nivel, pais)
          : tipo === "palavras"
            ? genPalavras(nivel, pais)
            : tipo === "problemas"
              ? genProblemas(nivel, pais)
              : genExercises(tipo, nivel, pais);

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

      const titulo = `Ficha de ${DISC_LABEL[disc]} - ${TIPO_LABEL[tipo]}`;
      const subtitulo = `${nivelLabel(disc, nivel)}  ·  ${cfg.classe(nivel)}  ·  ${cfg.nome}  ·  kidoz.online`;

      // ── Página 1: exercícios ──
      const p1 = pdf.addPage([W, H]);
      p1.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: rgb(0.96, 0.93, 0.9) });
      p1.drawText(titulo, {
        x: M,
        y: H - 52,
        size: 20,
        font: titleFont,
        color: dark,
      });
      p1.drawText(subtitulo, {
        x: M,
        y: H - 72,
        size: 10,
        font: bodyFont,
        color: muted,
      });

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

      // Problemas: 8 células largas (2×4) com texto quebrado; restantes: 20 (4×5).
      const prob = tipo === "problemas";
      const cols = prob ? 2 : 4;
      const gap = 10;
      const cw = (W - M * 2 - gap * (cols - 1)) / cols;
      const ch = prob ? 128 : 92;
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
        if (prob) {
          const linhas = wrapText(ex.text, 44).slice(0, 4);
          linhas.forEach((ln, k) => {
            p1.drawText(ln, {
              x: x + 8,
              y: y - 26 - k * 13,
              size: 10.5,
              font: bodyFont,
              color: dark,
            });
          });
        } else {
          p1.drawText(ex.text, {
            x: x + 8,
            y: y - 44,
            size: ex.text.length > 12 ? 11 : 14,
            font: titleFont,
            color: dark,
          });
        }
        p1.drawLine({
          start: { x: x + 8, y: y - ch + 14 },
          end: { x: x + cw - 8, y: y - ch + 14 },
          color: line,
          thickness: 1,
        });
      });

      p1.drawText("Grátis e imprimível - gera mais em kidoz.online/escolas", {
        x: M,
        y: 34,
        size: 9,
        font: bodyFont,
        color: muted,
      });
      p1.drawText("Kidoz", { x: W - M - 40, y: 34, size: 9, font: titleFont, color: primary });

      // ── Página 2: soluções ──
      const p2 = pdf.addPage([W, H]);
      p2.drawText("Soluções", {
        x: M,
        y: H - 70,
        size: 18,
        font: titleFont,
        color: dark,
      });
      p2.drawText(`${titulo} - ${nivelLabel(disc, nivel)} - ${cfg.nome}`, {
        x: M,
        y: H - 90,
        size: 10,
        font: bodyFont,
        color: muted,
      });

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

      p2.drawText("Tens turmas inteiras para ocupar? O Kidoz gera exercícios infinitos e", {
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
