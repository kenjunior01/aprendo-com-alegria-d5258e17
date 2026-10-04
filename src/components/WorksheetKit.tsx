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

const TIPOS = [
  { id: "adicao", label: "Adição", emoji: "➕" },
  { id: "subtracao", label: "Subtração", emoji: "➖" },
  { id: "multiplicacao", label: "Multiplicação", emoji: "✖️" },
  { id: "sequencias", label: "Sequências", emoji: "🔢" },
] as const;

const NIVEIS = [
  { n: 1, label: "Até 10", hint: "1.º ano" },
  { n: 2, label: "Até 20", hint: "2.º ano" },
  { n: 3, label: "Até 100", hint: "3.º–4.º ano" },
] as const;

type TipoId = (typeof TIPOS)[number]["id"];

export function WorksheetKit() {
  const [tipo, setTipo] = useState<TipoId>("adicao");
  const [nivel, setNivel] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [downloads, setDownloads] = useState(0);

  const download = async () => {
    setBusy(true);
    try {
      const r = await generateWorksheet({ data: { tipo, nivel } });
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
            internet ou para o caderno diário. Prova o que o Kidoz prepara para a tua escola.
          </p>
        </div>
      </div>

      {/* Matéria */}
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Matéria
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TIPOS.map((t) => (
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

      {/* Nível */}
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Nível</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {NIVEIS.map((nv) => (
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
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{nv.hint}</span>
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
            <>🖨️ Descarregar ficha (PDF)</>
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
        fica registado no painel.{" "}
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
