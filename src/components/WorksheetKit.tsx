// WorksheetKit — gerador de fichas imprimíveis grátis na landing /escolas.
// Lead magnet tangível: o professor escolhe matéria + nível e descarrega
// uma ficha A4 real (20 exercícios + soluções), sem registo. Prova o valor
// do Kidoz ANTES de pagar e reforça o posicionamento offline-first.

import { useState } from "react";
import { motion } from "framer-motion";
import { PencilRuler, Loader2, ArrowRight, Check } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generateWorksheet } from "@/lib/worksheet.functions";
import { toast } from "sonner";

const DISCIPLINAS = [
  { id: "mat", label: "Matemática", emoji: "🧮" },
  { id: "port", label: "Português", emoji: "📖" },
] as const;

const TIPOS_MAT = [
  { id: "adicao", label: "Adição", emoji: "➕" },
  { id: "subtracao", label: "Subtração", emoji: "➖" },
  { id: "multiplicacao", label: "Multiplicação", emoji: "✖️" },
  { id: "sequencias", label: "Sequências", emoji: "🔢" },
  { id: "dinheiro", label: "Dinheiro", emoji: "🪙" },
  { id: "problemas", label: "Problemas", emoji: "📝" },
] as const;

const TIPOS_PORT = [
  { id: "silabas", label: "Sílabas", emoji: "🔤" },
  { id: "palavras", label: "Palavras", emoji: "🧩" },
] as const;

// Países suportados — naming do ano/classe + moeda local nas fichas
const PAISES = [
  {
    id: "pt",
    flag: "🇵🇹",
    nome: "Portugal",
    ano: (n: number) => (n === 3 ? "3.º–4.º ano" : `${n}.º ano`),
  },
  {
    id: "mz",
    flag: "🇲🇿",
    nome: "Moçambique",
    ano: (n: number) => (n === 3 ? "3.ª–4.ª classe" : `${n}.ª classe`),
  },
  {
    id: "ao",
    flag: "🇦🇴",
    nome: "Angola",
    ano: (n: number) => (n === 3 ? "3.ª–4.ª classe" : `${n}.ª classe`),
  },
  {
    id: "cv",
    flag: "🇨🇻",
    nome: "Cabo Verde",
    ano: (n: number) => (n === 3 ? "3.º–4.º ano" : `${n}.º ano`),
  },
  {
    id: "br",
    flag: "🇧🇷",
    nome: "Brasil",
    ano: (n: number) => (n === 3 ? "3.º–4.º ano" : `${n}.º ano`),
  },
] as const;

const NIVEIS_MAT = [
  { n: 1, label: "Até 10" },
  { n: 2, label: "Até 20" },
  { n: 3, label: "Até 100" },
] as const;

const NIVEIS_PORT = [
  { n: 1, label: "Palavras curtas" },
  { n: 2, label: "Palavras longas" },
  { n: 3, label: "Palavras gigantes" },
] as const;

type DiscId = (typeof DISCIPLINAS)[number]["id"];
type TipoId = (typeof TIPOS_MAT)[number]["id"] | (typeof TIPOS_PORT)[number]["id"];
type PaisId = (typeof PAISES)[number]["id"];

// Exemplo tangível por tipo — moeda e palavras mudam com o país.
const EXEMPLO_DINHEIRO: Record<PaisId, string> = {
  pt: "3 € + 4 € =",
  mz: "5 MT + 4 MT =",
  ao: "10 Kz + 15 Kz =",
  cv: "100 Esc + 50 Esc =",
  br: "R$ 4 + R$ 3 =",
};

const EXEMPLO_SILABAS: Record<PaisId, string> = {
  pt: "telemóvel → te-le-mó-vel",
  mz: "capulana → ca-pu-la-na",
  ao: "candongueiro → can-don-guei-ro",
  cv: "coladeira → co-la-dei-ra",
  br: "ônibus → ô-ni-bus",
};

// Transporte local nos problemas — o dia-a-dia de cada país entra na ficha.
const EXEMPLO_PROBLEMAS: Record<PaisId, string> = {
  pt: "O autocarro leva 8 sentados e 2 de pé. Quantos vão?",
  mz: "O chapa leva 5 sentados e 3 de pé. Quantos vão?",
  ao: "O candongueiro leva 8 sentados e 2 de pé. Quantos vão?",
  cv: "O aluguer leva 6 sentados e 2 de pé. Quantos vão?",
  br: "O ônibus leva 8 sentados e 2 de pé. Quantos vão?",
};

function exemploDe(tipo: TipoId, pais: PaisId): string {
  switch (tipo) {
    case "adicao":
      return "12 + 5 =";
    case "subtracao":
      return "14 - 6 =";
    case "multiplicacao":
      return "7 × 3 =";
    case "sequencias":
      return "2, 4, 6, __";
    case "dinheiro":
      return EXEMPLO_DINHEIRO[pais];
    case "problemas":
      return EXEMPLO_PROBLEMAS[pais];
    case "silabas":
      return EXEMPLO_SILABAS[pais];
    case "palavras":
      return "te · ta · pe → tapete";
  }
}

export function WorksheetKit() {
  const [disc, setDisc] = useState<DiscId>("mat");
  const [tipo, setTipo] = useState<TipoId>("adicao");
  const [nivel, setNivel] = useState<number>(1);
  const [pais, setPais] = useState<PaisId>("pt");
  const [busy, setBusy] = useState(false);
  const [downloads, setDownloads] = useState(0);
  const paisCfg = PAISES.find((p) => p.id === pais) ?? PAISES[0];
  const tipos = disc === "mat" ? TIPOS_MAT : TIPOS_PORT;
  const niveis = disc === "mat" ? NIVEIS_MAT : NIVEIS_PORT;

  const mudarDisc = (d: DiscId) => {
    setDisc(d);
    setTipo(d === "mat" ? "adicao" : "silabas");
  };

  const download = async () => {
    setBusy(true);
    try {
      const r = await generateWorksheet({ data: { tipo, nivel, pais } });
      if ("error" in r || !r.pdfBase64) {
        toast.error("error" in r ? r.error : "Não foi possível gerar agora.");
        setBusy(false);
        return;
      }
      const bin = atob(r.pdfBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.fileName;
      a.click();
      URL.revokeObjectURL(url);
      setDownloads((d) => d + 1);
      toast.success("Ficha pronta! Boa aula 🎉");
    } catch {
      toast.error("Não foi possível gerar agora. Tenta novamente.");
    }
    setBusy(false);
  };

  return (
    <section className="card-chunky mt-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/25">
          <PencilRuler className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl">Fichas para a sala de aula</h2>
            <span className="rounded-full bg-success/15 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-success">
              Grátis · sem registo
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Gera uma ficha A4 com 20 exercícios e soluções — pronta a imprimir para os dias sem
            internet ou para o caderno diário. Adaptada ao currículo, à moeda e às palavras do teu
            país.
          </p>
        </div>
      </div>

      {/* País */}
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">País</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PAISES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPais(p.id)}
            aria-pressed={pais === p.id}
            className={`rounded-xl border-2 px-3 py-2 font-display text-sm transition-colors ${
              pais === p.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span aria-hidden="true">{p.flag}</span> {p.nome}
          </button>
        ))}
      </div>

      {/* Disciplina */}
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Disciplina
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DISCIPLINAS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => mudarDisc(d.id)}
            aria-pressed={disc === d.id}
            className={`rounded-xl border-2 px-4 py-2 font-display text-sm transition-colors ${
              disc === d.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span aria-hidden="true">{d.emoji}</span> {d.label}
          </button>
        ))}
      </div>

      {/* Tipo de exercício */}
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Exercícios
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {tipos.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTipo(t.id)}
            aria-pressed={tipo === t.id}
            className={`rounded-xl border-2 px-3 py-2 font-display text-sm transition-colors ${
              tipo === t.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span aria-hidden="true">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Exemplo:{" "}
        <span className="font-display font-bold text-foreground">{exemploDe(tipo, pais)}</span>
      </p>

      {/* Nível */}
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Nível</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {niveis.map((nv) => (
          <button
            key={nv.n}
            type="button"
            onClick={() => setNivel(nv.n)}
            aria-pressed={nivel === nv.n}
            className={`rounded-xl border-2 px-3 py-2 text-left font-display text-sm transition-colors ${
              nivel === nv.n
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {nv.label}
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
              {paisCfg.ano(nv.n)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ChunkyButton onClick={download} disabled={busy} className="min-h-[56px] flex-1 text-base">
          {busy ? (
            <>
              <Loader2 className="mr-1 inline h-5 w-5 animate-spin" /> A gerar…
            </>
          ) : (
            <>
              🖨️ Descarregar ficha (PDF) · {paisCfg.flag} {paisCfg.nome}
            </>
          )}
        </ChunkyButton>
        <p className="text-center text-xs text-muted-foreground sm:max-w-[16rem] sm:text-left">
          {downloads > 0 ? (
            <span className="font-bold text-success">
              <Check className="mr-0.5 inline h-3.5 w-3.5" />
              {downloads} {downloads === 1 ? "ficha gerada" : "fichas geradas"} — cada download tem
              exercícios novos.
            </span>
          ) : (
            <>Sem limite de fichas. Cada download sai com exercícios novos.</>
          )}
        </p>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 rounded-2xl bg-primary/8 px-4 py-3 text-center text-sm sm:text-left"
      >
        Gostaste? No Kidoz completo, as fichas são infinitas <em>e</em> o progresso de cada aluno
        fica registado no painel — com exercícios, vozes e cultura do teu país.{" "}
        <a
          href="#fundador"
          className="font-display font-bold text-primary underline underline-offset-2"
        >
          Quero o sistema completo <ArrowRight className="inline h-3.5 w-3.5" />
        </a>
      </motion.p>
    </section>
  );
}
