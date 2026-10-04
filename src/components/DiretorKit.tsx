// DirectorKit — "Leva a proposta à direção".
// Professores raramente decidem a fatura: decide a direção/conselho.
// Este kit gera uma proposta pronta (custos, piloto de 4 semanas, garantias)
// que o professor copia ou abre no email — tornando cada professor um
// embaixador de vendas. Zero backend: tudo é gerado localmente.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Mail, Check, FileSignature } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";

const PRESETS = [
  { label: "1 turma", alunos: 24 },
  { label: "Escola pequena", alunos: 120 },
  { label: "Escola grande", alunos: 400 },
] as const;

const eur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

export function DiretorKit() {
  const [alunos, setAlunos] = useState<number>(24);
  const [copied, setCopied] = useState(false);

  const proposta = useMemo(() => {
    const monthly = alunos * 0.99;
    const firstYear = monthly * 12 * 0.5;
    return [
      "Proposta — Kidoz para a nossa escola",
      "",
      "O QUE É",
      "Plataforma de aprendizagem em português para o 1.º ciclo (Português, Matemática e Estudo do Meio), com painel do professor, relatórios em PDF para conselhos de turma e ligação às famílias por WhatsApp. Funciona offline — ideal para tablets partilhados e redes instáveis. Sem anúncios.",
      "",
      "INVESTIMENTO",
      `0,99€ por aluno/mês (IVA incluído). Com ±${alunos} alunos: ${eur(monthly)}/mês — menos de 5 cêntimos por dia útil por aluno. Cancelamento a qualquer momento.`,
      "",
      "PLANO PILOTO SUGERIDO (4 SEMANAS)",
      "1) Onboarding: criação da escola e turmas, códigos de acesso para os alunos (1 sessão de 30 min)",
      "2) Uso em aula ou ATL, 2 a 3 vezes por semana (5–10 min por aluno)",
      "3) Análise do primeiro relatório de turma (PDF gerado com um clique)",
      "4) Decisão do conselho com dados reais dos nossos alunos",
      "",
      "GARANTIAS",
      "• Conformidade RGPD: sem anúncios, dados dos alunos protegidos, apagáveis a pedido",
      "• Conteúdo alinhado ao 1.º ciclo, com variantes PT/MZ/AO/CV/BR",
      "• Programa de Escolas Fundadoras (primeiras 20): 50% de desconto no 1.º ano — poupança anual de " +
        eur(firstYear) +
        " com " +
        alunos +
        " alunos",
      "",
      "Peço aprovação para avançarmos com o piloto. Mais informações e demonstração: kidoz.online/escolas",
    ].join("\n");
  }, [alunos]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(proposta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard pode falhar em contextos restritos — o utilizador ainda
      // pode selecionar o texto manualmente (textarea é readOnly, não disabled)
    }
  };

  const mailHref = `mailto:?subject=${encodeURIComponent(
    "Proposta Kidoz para a nossa escola",
  )}&body=${encodeURIComponent(proposta)}`;

  return (
    <section className="card-chunky mt-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/20">
          <FileSignature className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Leva a proposta à direção</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolhe o tamanho da escola e recebes uma proposta completa, pronta a enviar ao diretor
            ou conselho pedagógico — custo, plano piloto e garantias incluídos.
          </p>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setAlunos(p.alunos)}
            aria-pressed={alunos === p.alunos}
            className={`rounded-xl border-2 px-3 py-2 font-display text-sm transition-colors ${
              alunos === p.alunos
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {p.label} · {p.alunos} alunos
          </button>
        ))}
        <label className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-muted px-3 py-1.5">
          <span className="text-xs font-bold text-muted-foreground">Outro:</span>
          <input
            type="number"
            min={1}
            max={5000}
            value={alunos}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) setAlunos(Math.min(5000, Math.max(1, v)));
            }}
            className="w-20 bg-transparent text-center font-display text-sm outline-none"
            aria-label="Número de alunos personalizado"
          />
        </label>
      </div>

      <div className="mt-3 rounded-2xl bg-primary/10 px-4 py-2.5 text-center text-sm font-bold text-primary">
        {eur(alunos * 0.99)}/mês · 0,99€ × {alunos} alunos · IVA incluído
      </div>

      {/* Proposta gerada */}
      <motion.textarea
        key={alunos}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        readOnly
        value={proposta}
        rows={12}
        aria-label="Proposta pronta para a direção"
        onFocus={(e) => e.currentTarget.select()}
        className="mt-4 w-full resize-y rounded-2xl border-2 border-border bg-background p-4 font-mono text-xs leading-relaxed outline-none focus:border-primary"
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <ChunkyButton
          onClick={copy}
          tone={copied ? "success" : "primary"}
          className="min-h-[52px] flex-1"
        >
          {copied ? (
            <>
              <Check className="mr-1 inline h-5 w-5" /> Copiada!
            </>
          ) : (
            <>
              <Copy className="mr-1 inline h-5 w-5" /> Copiar proposta
            </>
          )}
        </ChunkyButton>
        <a
          href={mailHref}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 font-display text-base hover:bg-muted"
        >
          <Mail className="h-5 w-5" />
          Abrir no meu email
        </a>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        A proposta abre no teu email já preenchida — só tens de escrever o endereço da direção.
      </p>
    </section>
  );
}
