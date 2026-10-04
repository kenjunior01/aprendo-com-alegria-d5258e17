// CopiasCalc — "E as fotocópias, quanto custam hoje?"
// Calculadora honesta que compara o custo mensal das fotocópias de fichas
// com a mensalidade do Kidoz. Todos os pressupostos são visíveis e ajustáveis
// (preço da fotocópia editável) — se a poupança não existir, dizemos isso
// também: a credibilidade vale mais que a venda.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";

const eur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

export function CopiasCalc() {
  const [alunos, setAlunos] = useState(100);
  const [fichasSemana, setFichasSemana] = useState(2);
  const [precoCopia, setPrecoCopia] = useState(0.05);

  const calc = useMemo(() => {
    const copiasMes = Math.round(alunos * fichasSemana * 4.33);
    const custoCopias = copiasMes * precoCopia;
    const kidoz = alunos * 0.99;
    const poupanca = custoCopias - kidoz;
    const pct = custoCopias > 0 ? Math.round((poupanca / custoCopias) * 100) : 0;
    return { copiasMes, custoCopias, kidoz, poupanca, pct };
  }, [alunos, fichasSemana, precoCopia]);

  return (
    <section
      className="card-chunky mt-4 rounded-3xl border-2 border-secondary/40 bg-gradient-to-br from-secondary/10 via-card to-accent/10 p-6 sm:p-8"
      aria-labelledby="copias-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/25">
          <Calculator className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <h3 id="copias-heading" className="font-display text-xl sm:text-2xl">
            Faz as contas às tuas fotocópias
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Quantas fichas a tua escola fotocopia por mês? Ajusta os números e vê o que sai da
            secretaria — com os pressupostos à vista, sem mágica.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="rounded-2xl border-2 border-border bg-card p-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Alunos que usam fichas
          </span>
          <input
            type="number"
            min={20}
            max={5000}
            value={alunos}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) setAlunos(Math.min(5000, Math.max(1, v)));
            }}
            className="mt-1 w-full bg-transparent font-display text-2xl outline-none"
            aria-label="Número de alunos que usam fichas"
          />
        </label>
        <div className="rounded-2xl border-2 border-border bg-card p-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fichas por aluno/semana
          </span>
          <div className="mt-1 flex gap-1.5" role="group" aria-label="Fichas por aluno por semana">
            {[1, 2, 3, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFichasSemana(n)}
                aria-pressed={fichasSemana === n}
                className={`h-11 flex-1 rounded-xl border-2 font-display text-base transition-colors ${
                  fichasSemana === n
                    ? "border-primary bg-primary/15 font-semibold text-primary"
                    : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <label className="rounded-2xl border-2 border-border bg-card p-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Preço por fotocópia (€)
          </span>
          <input
            type="number"
            min={0.01}
            max={0.5}
            step={0.01}
            value={precoCopia}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v > 0) setPrecoCopia(Math.min(0.5, Math.max(0.01, v)));
            }}
            className="mt-1 w-full bg-transparent font-display text-2xl outline-none"
            aria-label="Preço por fotocópia em euros"
          />
        </label>
      </div>

      <motion.div
        key={`${calc.copiasMes}-${calc.custoCopias.toFixed(2)}`}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        className="mt-4 grid gap-2 sm:grid-cols-3"
      >
        <div className="rounded-2xl bg-muted/60 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Fotocópias por mês
          </p>
          <p className="font-display text-2xl">{calc.copiasMes.toLocaleString("pt-PT")}</p>
        </div>
        <div className="rounded-2xl bg-muted/60 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Custo das fotocópias/mês
          </p>
          <p className="font-display text-2xl">{eur(calc.custoCopias)}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-primary/70">
            Kidoz (todos os alunos)
          </p>
          <p className="font-display text-2xl text-primary">{eur(calc.kidoz)}</p>
        </div>
      </motion.div>

      <div
        className={`mt-3 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
          calc.poupanca > 0 ? "bg-success/15 text-success" : "bg-muted/60 text-muted-foreground"
        }`}
        role="status"
      >
        {calc.poupanca > 0 ? (
          <>
            Poupança potencial: <span className="font-display text-lg">{eur(calc.poupanca)}</span>{" "}
            por mês ({calc.pct}%) — e as fichas saem já corrigidas, com soluções e moeda local.
          </>
        ) : (
          <>
            Com este uso baixo, as fotocópias até saem mais baratas — e dizemos isso com
            honestidade. O valor do Kidoz está no progresso automático, nos relatórios para os pais
            e no engano zero: cada aluno segue o seu ritmo.
          </>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Pressupostos: 4,33 semanas/mês · preço da fotocópia A4 P&B editável acima · as fichas do
        Kidoz são ilimitadas e grátis dentro do plano.
      </p>
    </section>
  );
}
