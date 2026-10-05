// Pagamentos — "Paga como for mais fácil".
// O checkout com cartão (Stripe) ativa automaticamente; aqui ficam os métodos
// alternativos que as instituições reais precisam: PayPal (cartão ou saldo,
// mesmo sem conta PayPal), transferência bancária com referência gerada e
// fatura/processo administrativo com NIF. Tudo sem backend: links pré-preenchidos,
// clipboard e mailto/wa.me — com prazos honestos em vez de promessas falsas.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Landmark,
  FileCheck2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  MessageCircle,
} from "lucide-react";
import {
  PAYMENTS,
  PRECO_POR_ALUNO_EUR,
  FX_PAG,
  paisSeguro,
  paypalMeLink,
  referenciaPagamento,
  type PaisPagId,
} from "@/lib/payments";

const PAISES_PAG = [
  { id: "pt", flag: "🇵🇹", nome: "Portugal" },
  { id: "mz", flag: "🇲🇿", nome: "Moçambique" },
  { id: "ao", flag: "🇦🇴", nome: "Angola" },
  { id: "cv", flag: "🇨🇻", nome: "Cabo Verde" },
  { id: "br", flag: "🇧🇷", nome: "Brasil" },
] as const;

const eur = (v: number) => v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

interface PagamentosProps {
  /** N.º de alunos — sincronizado com a calculadora acima (controlado). */
  alunos: number;
  /** País selecionado — sincronizado via localStorage pela página. */
  pais: string;
  /** Escolhe o país (a página grava no localStorage partilhado). */
  onEscolherPais: (id: PaisPagId) => void;
}

export function Pagamentos({ alunos, pais, onEscolherPais }: PagamentosProps) {
  const p = paisSeguro(pais);
  const [escola, setEscola] = useState("");
  const [copiado, setCopiado] = useState(false);

  const monthly = Math.max(1, alunos) * PRECO_POR_ALUNO_EUR;
  const fx = FX_PAG[p];

  const referencia = useMemo(() => referenciaPagamento(escola || "Instituição"), [escola]);

  const copiarReferencia = async () => {
    try {
      await navigator.clipboard.writeText(referencia);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // clipboard pode falhar em contextos restritos — a referência fica
      // selecionável no ecrã (não usamos disabled)
    }
  };

  const mailTransferencia = `mailto:${PAYMENTS.emailFaturacao}?subject=${encodeURIComponent(
    `Transferência bancária — referência ${referencia}`,
  )}&body=${encodeURIComponent(
    `Olá!\n\nQuero pagar a subscrição Escolas do Kidoz por transferência bancária.\n\nInstituição: ${escola || "…"}\nAlunos: ${alunos}\nTotal mensal: ${eur(monthly)}\nReferência: ${referencia}\n\nEnvio os dados bancários (IBAN) e a fatura com NIF, por favor.\n\nObrigado!`,
  )}`;

  const mailFatura = `mailto:${PAYMENTS.emailFaturacao}?subject=${encodeURIComponent(
    "Fatura com NIF / processo administrativo — Kidoz Escolas",
  )}&body=${encodeURIComponent(
    `Olá!\n\nSomos uma instituição de ensino e precisamos de fatura com NIF (pagamento anual ou processo administrativo oficial).\n\nInstituição: …\nNIF: …\nAlunos: ${alunos}\nTotal mensal estimado: ${eur(monthly)}\n\nComo podemos avançar?\n\nObrigado!`,
  )}`;

  const waPaypal = `https://wa.me/?text=${encodeURIComponent(
    `Olá! Quero pagar o plano Kidoz Escolas por PayPal (${eur(monthly)}/mês, ${alunos} alunos). Podem enviar o link de pagamento?`,
  )}`;

  return (
    <section
      id="pagamentos"
      className="card-chunky mt-8 scroll-mt-24 rounded-3xl border-2 border-border bg-card p-6 sm:p-8"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Paga como for mais fácil</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cartão (ativação imediata), PayPal, transferência bancária ou fatura com NIF para
            instituições. Sem taxas escondidas e com cancelamento a qualquer momento.
          </p>
        </div>
      </div>

      {/* País (sincronizado com a calculadora e a home via kidoz-pais) */}
      <div
        className="mt-4 flex flex-wrap gap-1.5"
        role="group"
        aria-label="País para os métodos de pagamento"
      >
        {PAISES_PAG.map((px) => {
          const ativo = p === px.id;
          return (
            <button
              key={px.id}
              type="button"
              onClick={() => onEscolherPais(px.id)}
              aria-pressed={ativo}
              className={`rounded-full border px-3 py-1.5 font-display text-xs transition-colors ${
                ativo
                  ? "border-primary bg-primary/15 font-semibold text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <span aria-hidden="true">{px.flag}</span> {px.nome}
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl bg-primary/10 px-4 py-2.5 text-center text-sm font-bold text-primary">
        {eur(monthly)}/mês · 0,99€ × {alunos} alunos · IVA incluído
        {p !== "pt" && (
          <span className="mt-0.5 block text-xs font-semibold text-primary/80">
            ≈ {fx.fmt(monthly * fx.taxa)} por mês (câmbio de referência — a cobrança é feita em
            euros)
          </span>
        )}
      </div>

      {/* 1. PayPal */}
      <motion.div
        whileHover={{ y: -2 }}
        className="mt-4 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-card p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg font-black tracking-tight text-[#003087]">
            Pay<span className="text-[#009cde]">Pal</span>
          </span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
            cartão ou saldo · sem comissões para ti
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Paga com saldo PayPal ou com cartão Visa/Mastercard —{" "}
          <strong className="text-foreground">não precisas de conta PayPal</strong> para pagar com
          cartão. Confirmado o pagamento, ativamos a escola no mesmo dia útil.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <a
            href={paypalMeLink(monthly)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#003087] px-5 font-display text-base font-semibold text-white shadow-lg transition-colors hover:bg-[#002460] active:scale-[0.98]"
          >
            Pagar {eur(monthly)} com PayPal
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={waPaypal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-success/50 bg-success/15 px-5 font-display text-sm text-success hover:bg-success/25"
          >
            <MessageCircle className="h-5 w-5" />
            Pedir o link por WhatsApp
          </a>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Pagas à Kidoz ({PAYMENTS.beneficiario}) com proteção do comprador PayPal. Se preferires
          que enviemos o link por email:{" "}
          <a
            href={`mailto:${PAYMENTS.emailFaturacao}?subject=${encodeURIComponent("Link de pagamento PayPal — Kidoz Escolas")}`}
            className="underline underline-offset-2"
          >
            {PAYMENTS.emailFaturacao}
          </a>
        </p>
      </motion.div>

      {/* 2. Transferência bancária com referência */}
      <motion.div
        whileHover={{ y: -2 }}
        className="mt-3 rounded-2xl border-2 border-border bg-card p-4 sm:p-5"
      >
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-secondary-foreground" />
          <p className="font-display text-lg">Transferência bancária</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Sem cartão? Sem problema. Escreve o nome da instituição para gerar a referência, pede os
          dados bancários e envia o comprovativo — ativamos no mesmo dia útil.
        </p>
        <label className="mt-3 block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nome da instituição (gera a referência)
          </span>
          <input
            type="text"
            maxLength={60}
            value={escola}
            onChange={(e) => setEscola(e.target.value)}
            placeholder="Ex.: Escola Primária da Malhangalene"
            className="mt-1 h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-display text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center justify-between gap-2 rounded-2xl bg-muted px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Referência
            </span>
            <span className="font-mono text-lg font-black tracking-widest text-foreground">
              {referencia}
            </span>
            <button
              type="button"
              onClick={copiarReferencia}
              aria-label="Copiar referência de pagamento"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-border bg-card text-foreground transition-colors hover:bg-muted"
            >
              {copiado ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <a
            href={mailTransferencia}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 font-display text-sm hover:bg-muted"
          >
            <Mail className="h-5 w-5" />
            Pedir IBAN e instruções
          </a>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          A mesma escola gera sempre a mesma referência — fácil de conciliar no comprovativo. A
          fatura com NIF é emitida depois do pagamento.
        </p>
      </motion.div>

      {/* 3. Fatura / processo administrativo */}
      <motion.div
        whileHover={{ y: -2 }}
        className="mt-3 rounded-2xl border-2 border-border bg-card p-4 sm:p-5"
      >
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-accent-foreground" />
          <p className="font-display text-lg">Fatura e processo administrativo</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolas públicas ou privadas com procedimento oficial: emitimos fatura com NIF, aceitamos
          pagamento anual (com condições especiais) e adaptamo-nos ao processo de contratação da tua
          instituição.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <a
            href={mailFatura}
            className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 font-display text-sm hover:bg-muted"
          >
            <Mail className="h-5 w-5" />
            Pedir proposta com fatura
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Olá! Precisamos de fatura com NIF para o plano Kidoz Escolas (${alunos} alunos, ${eur(monthly)}/mês). Como avançamos?`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-success/50 bg-success/15 px-5 font-display text-sm text-success hover:bg-success/25"
          >
            <MessageCircle className="h-5 w-5" />
            Falar por WhatsApp
          </a>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Nota honesta: PayPal e transferência são confirmados manualmente — ativação no mesmo dia
        útil (9h–17h, Lisboa). Para ativar já, usa o pagamento por cartão no botão «Subscrever»
        acima.
      </p>
    </section>
  );
}
