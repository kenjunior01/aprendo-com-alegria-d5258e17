// DirectorKit — "Leva a proposta à direção".
// Professores raramente decidem a fatura: decide a direção/conselho.
// Este kit gera uma proposta pronta (custos, piloto de 4 semanas, garantias)
// que o professor copia, abre no email ou descarrega em PDF — tornando cada
// professor um embaixador de vendas. O PDF adapta-se ao país (moeda local)
// e ao nome da escola; a cópia de texto funciona sem backend.

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Mail, Check, FileSignature, Download, LoaderCircle } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generateProposal } from "@/lib/proposal.functions";

const PRESETS = [
  { label: "1 turma", alunos: 24 },
  { label: "Escola pequena", alunos: 120 },
  { label: "Escola grande", alunos: 400 },
] as const;

const PAISES_PROPOSTA = [
  { id: "pt", flag: "🇵🇹", nome: "Portugal" },
  { id: "mz", flag: "🇲🇿", nome: "Moçambique" },
  { id: "ao", flag: "🇦🇴", nome: "Angola" },
  { id: "cv", flag: "🇨🇻", nome: "Cabo Verde" },
  { id: "br", flag: "🇧🇷", nome: "Brasil" },
] as const;

type PaisProposta = (typeof PAISES_PROPOSTA)[number]["id"];

// Equivalente local do total mensal (câmbio de referência; cobrança em EUR).
const FX_PROPOSTA: Record<PaisProposta, { taxa: number; fmt: (v: number) => string }> = {
  pt: { taxa: 1, fmt: () => "" },
  mz: { taxa: 69, fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} MT` },
  ao: { taxa: 1000, fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} Kz` },
  cv: { taxa: 110, fmt: (v) => `${Math.round(v).toLocaleString("pt-PT")} Esc` },
  br: { taxa: 6, fmt: (v) => `R$ ${v.toFixed(2).replace(".", ",")}` },
};

const eur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

export function DiretorKit() {
  const [alunos, setAlunos] = useState<number>(24);
  const [escola, setEscola] = useState<string>("");
  const [pais, setPais] = useState<PaisProposta>("pt");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pdfOk, setPdfOk] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  // País partilhado com a home e a calculadora (kidoz-pais)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kidoz-pais")?.toLowerCase();
      if (saved && PAISES_PROPOSTA.some((p) => p.id === saved)) setPais(saved as PaisProposta);
    } catch {
      /* noop */
    }
  }, []);

  const escolherPais = (id: PaisProposta) => {
    setPais(id);
    try {
      localStorage.setItem("kidoz-pais", id.toUpperCase());
    } catch {
      /* noop */
    }
  };

  const proposta = useMemo(() => {
    const monthly = alunos * 0.99;
    const firstYear = monthly * 12 * 0.5;
    const fx = FX_PROPOSTA[pais];
    return [
      "Proposta — Kidoz para a nossa escola",
      "",
      "O QUE É",
      "Plataforma de aprendizagem em português para o 1.º ciclo (Português, Matemática e Estudo do Meio), com painel do professor, relatórios em PDF para conselhos de turma e ligação às famílias por WhatsApp. Funciona offline — ideal para tablets partilhados e redes instáveis. Sem anúncios.",
      "",
      "INVESTIMENTO",
      `0,99€ por aluno/mês (IVA incluído). Com ±${alunos} alunos: ${eur(monthly)}/mês — menos de 5 cêntimos por dia útil por aluno. Cancelamento a qualquer momento.`,
      pais !== "pt"
        ? `Equivalente de referência: ${fx.fmt(monthly * fx.taxa)}/mês (câmbio de referência; cobrança em euros).`
        : "",
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
    ]
      .filter(Boolean)
      .join("\n");
  }, [alunos, pais]);

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

  const descarregarPdf = async () => {
    setBusy(true);
    setErro(null);
    try {
      const r = await generateProposal({ data: { escola: escola.trim(), alunos, pais } });
      if ("error" in r && r.error) {
        setErro(r.error);
        return;
      }
      if (!r.pdfBase64) {
        setErro("Não foi possível gerar o PDF — tenta outra vez.");
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
      setPdfOk((n) => n + 1);
    } catch {
      setErro("Não foi possível gerar o PDF — tenta outra vez.");
    } finally {
      setBusy(false);
    }
  };

  const mailHref = `mailto:?subject=${encodeURIComponent(
    "Proposta Kidoz para a nossa escola",
  )}&body=${encodeURIComponent(proposta)}`;

  const fx = FX_PROPOSTA[pais];

  return (
    <section className="card-chunky mt-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/20">
          <FileSignature className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Leva a proposta à direção</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolhe o tamanho da escola e recebes uma proposta completa — em texto, email ou PDF —
            com custo na moeda do teu país, plano piloto e garantias.
          </p>
        </div>
      </div>

      {/* Nome da escola (opcional, entra no PDF) */}
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nome da escola (opcional — entra na proposta)
        </span>
        <input
          type="text"
          maxLength={80}
          value={escola}
          onChange={(e) => setEscola(e.target.value)}
          placeholder="Ex.: Escola Primária da Malhangalene"
          className="mt-1 h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-display text-sm outline-none focus:border-primary"
        />
      </label>

      {/* Presets */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
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

      {/* País da proposta (partilhado com a home e a calculadora) */}
      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="País da proposta"
      >
        {PAISES_PROPOSTA.map((p) => {
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

      <div className="mt-3 rounded-2xl bg-primary/10 px-4 py-2.5 text-center text-sm font-bold text-primary">
        {eur(alunos * 0.99)}/mês · 0,99€ × {alunos} alunos · IVA incluído
        {pais !== "pt" && (
          <span className="mt-0.5 block text-xs font-semibold text-primary/80">
            ≈ {fx.fmt(alunos * 0.99 * fx.taxa)} por mês (câmbio de referência)
          </span>
        )}
      </div>

      {/* Proposta gerada (texto) */}
      <motion.textarea
        key={proposta.length}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        readOnly
        value={proposta}
        rows={12}
        aria-label="Proposta pronta para a direção"
        onFocus={(e) => e.currentTarget.select()}
        className="mt-4 w-full resize-y rounded-2xl border-2 border-border bg-background p-4 font-mono text-xs leading-relaxed outline-none focus:border-primary"
      />

      {erro && (
        <p role="alert" className="mt-2 text-center text-sm font-semibold text-destructive">
          {erro}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <ChunkyButton
          onClick={descarregarPdf}
          disabled={busy}
          tone={pdfOk > 0 && !busy ? "success" : "primary"}
          className="min-h-[52px] flex-1"
        >
          {busy ? (
            <>
              <LoaderCircle className="mr-1 inline h-5 w-5 animate-spin" /> A gerar…
            </>
          ) : pdfOk > 0 ? (
            <>
              <Download className="mr-1 inline h-5 w-5" /> PDF pronto · descarregar outra vez
            </>
          ) : (
            <>
              <Download className="mr-1 inline h-5 w-5" /> Descarregar proposta em PDF
            </>
          )}
        </ChunkyButton>
        <ChunkyButton
          onClick={copy}
          tone={copied ? "success" : "secondary"}
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
        O PDF sai com o nome da escola, a moeda do teu país e o Programa Fundador — pronto a
        entregar ao diretor ou a enviar por email.
        {pdfOk > 0 && ` ${pdfOk} ${pdfOk === 1 ? "proposta gerada" : "propostas geradas"}.`}
      </p>
    </section>
  );
}
