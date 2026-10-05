// PlanificadorSemanal — "O teu domingo à noite, devolvido".
// Gera um plano semanal pronto a imprimir: 3 blocos por dia (Português,
// Matemática, Estudo do Meio), alinhado ao 1.º ciclo e adaptado ao país
// (naming ano/classe, moeda nos problemas, vocabulário local). Diferencial
// único: o professor recebe o plano E as fichas E o modo turma — sem
// planear do zero. Sem backend: server fn PDF + download por Blob.

import { useEffect, useState } from "react";
import { CalendarDays, Download, LoaderCircle, Check } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generatePlanificador } from "@/lib/planificador.functions";

const PAISES_PLAN = [
  { id: "pt", flag: "🇵🇹", nome: "Portugal" },
  { id: "mz", flag: "🇲🇿", nome: "Moçambique" },
  { id: "ao", flag: "🇦🇴", nome: "Angola" },
  { id: "cv", flag: "🇨🇻", nome: "Cabo Verde" },
  { id: "br", flag: "🇧🇷", nome: "Brasil" },
] as const;

type PaisPlan = (typeof PAISES_PLAN)[number]["id"];

const ANOS = [
  { id: 1, label: "1.º" },
  { id: 2, label: "2.º" },
  { id: 3, label: "3.º" },
  { id: 4, label: "4.º" },
] as const;

export function PlanificadorSemanal() {
  const [turma, setTurma] = useState("");
  const [ano, setAno] = useState<number>(2);
  const [pais, setPais] = useState<PaisPlan>("pt");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // País partilhado com a home e a calculadora (kidoz-pais)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kidoz-pais")?.toLowerCase();
      if (saved && PAISES_PLAN.some((p) => p.id === saved)) setPais(saved as PaisPlan);
    } catch {
      /* noop */
    }
  }, []);

  const escolherPais = (id: PaisPlan) => {
    setPais(id);
    try {
      localStorage.setItem("kidoz-pais", id.toUpperCase());
    } catch {
      /* noop */
    }
  };

  const descarregar = async () => {
    setBusy(true);
    setErro(null);
    try {
      const r = await generatePlanificador({ data: { turma: turma.trim(), ano, pais } });
      if ("error" in r && r.error) {
        setErro(r.error);
        return;
      }
      if (!r.pdfBase64) {
        setErro("Não foi possível gerar o plano — tenta outra vez.");
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
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOk(true);
    } catch {
      setErro("Não foi possível gerar o plano — tenta outra vez.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-chunky mt-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/20">
          <CalendarDays className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Plano semanal pronto para segunda-feira</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O teu domingo à noite, devolvido: 3 blocos por dia (Português, Matemática, Estudo do
            Meio), progressão real do 1.º ao 4.º ano e adaptação ao teu país — dinheiro local,
            vocabulário e naming das classes. Imprime, riscar e adaptar é incentivado.
          </p>
        </div>
      </div>

      {/* Nome da turma (opcional) */}
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nome da turma (opcional — entra no plano)
        </span>
        <input
          type="text"
          maxLength={40}
          value={turma}
          onChange={(e) => setTurma(e.target.value)}
          placeholder="Ex.: 3.º A — Escola da Malhangalene"
          className="mt-1 h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-display text-sm outline-none focus:border-primary"
        />
      </label>

      {/* Ano do 1.º ciclo */}
      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Ano">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Ano/classe:
        </span>
        {ANOS.map((a) => {
          const ativo = ano === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAno(a.id)}
              aria-pressed={ativo}
              className={`rounded-xl border-2 px-3.5 py-1.5 font-display text-sm transition-colors ${
                ativo
                  ? "border-primary bg-primary/15 font-semibold text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {/* País (partilhado com a home e a calculadora) */}
      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="País do plano"
      >
        {PAISES_PLAN.map((p) => {
          const ativo = pais === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => escolherPais(p.id)}
              aria-pressed={ativo}
              className={`rounded-full border px-3 py-1.5 font-display text-xs transition-colors ${
                ativo
                  ? "border-primary bg-primary/15 font-semibold text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <span aria-hidden="true">{p.flag}</span> {p.nome}
            </button>
          );
        })}
      </div>

      {erro && (
        <p role="alert" className="mt-2 text-center text-sm font-semibold text-destructive">
          {erro}
        </p>
      )}

      <ChunkyButton
        onClick={descarregar}
        disabled={busy}
        tone={ok && !busy ? "success" : "primary"}
        className="mt-4 min-h-[52px] w-full sm:w-auto"
      >
        {busy ? (
          <>
            <LoaderCircle className="mr-1 inline h-5 w-5 animate-spin" /> A gerar o plano…
          </>
        ) : ok ? (
          <>
            <Check className="mr-1 inline h-5 w-5" /> Plano pronto · gerar outra vez
          </>
        ) : (
          <>
            <Download className="mr-1 inline h-5 w-5" /> Descarregar plano semanal (PDF)
          </>
        )}
      </ChunkyButton>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Uma página A4: semana tipo com blocos de 30/30/20 min, notas de adaptação local e ligação ao
        Modo Turma ao Vivo e às fichas imprimíveis — tudo num único ciclo de trabalho.
      </p>
    </section>
  );
}
