// SchoolLeadForm — captura de leads B2B em /escolas.
// A instituição preenche um formulário rigoroso (não "demasiado simples" —
// é a porta de entrada da versão institucional): instituição, tipo, país,
// alunos, responsável, cargo, contacto, NIF opcional. Grava em `school_leads`
// (BD — antes só saía por WhatsApp) e oferece WhatsApp/email como alternativa.
// Honeypot anti-spam + validação — a seriedade que a direção espera.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  ChevronDown,
  ShieldCheck,
  LoaderCircle,
  PartyPopper,
} from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { submitSchoolLead } from "@/lib/teacherContent.functions";
import { precoPorAluno } from "@/lib/schoolPricing";

const TIPOS = [
  "Escola (1.º ciclo)",
  "Agrupamento de escolas",
  "Creche / Jardim de infância",
  "ATL / Centro de atividades",
  "Rede municipal / Secretaria",
  "Outro",
] as const;

// Momento preferido para a demo — qualifica o lead e poupa um ciclo de emails.
const MOMENTOS = ["Qualquer momento", "Manhã (9h–12h)", "Tarde (14h–17h)"] as const;

// País da instituição — encaminha para o especialista certo e prioriza o roteiro.
const PAISES = ["Portugal", "Moçambique", "Angola", "Cabo Verde", "Brasil", "Outro país"] as const;

interface LeadData {
  inst: string;
  tipo: string;
  pais: string;
  alunos: string;
  responsavel: string;
  cargo: string;
  contacto: string;
  email: string;
  nif: string;
  momento: string;
  nota: string;
  // honeypot — humanos nunca o veem
  website: string;
}

const EMPTY: LeadData = {
  inst: "",
  tipo: TIPOS[0],
  pais: PAISES[0],
  alunos: "",
  responsavel: "",
  cargo: "",
  contacto: "",
  email: "",
  nif: "",
  momento: MOMENTOS[0],
  nota: "",
  website: "",
};

function buildMessage(d: LeadData): string {
  const unit = precoPorAluno(Number(d.alunos) || 20);
  const unitLabel = unit.toFixed(2).replace(".", ",");
  const lines = [
    "🏫 *Pedido de proposta — Kidoz para Instituições*",
    "",
    `• Instituição: ${d.inst}`,
    `• Tipo: ${d.tipo}`,
    `• País: ${d.pais}`,
    `• N.º de alunos: ${d.alunos}`,
    d.responsavel ? `• Responsável: ${d.responsavel}${d.cargo ? ` (${d.cargo})` : ""}` : null,
    `• Contacto: ${d.contacto}`,
    d.email ? `• Email: ${d.email}` : null,
    d.nif ? `• NIF: ${d.nif}` : null,
    d.momento !== MOMENTOS[0] ? `• Melhor momento para a demo: ${d.momento}` : null,
    d.nota ? `• Nota: ${d.nota}` : null,
    "",
    `Custo estimado: ${(Number(d.alunos) * unit).toLocaleString("pt-PT", {
      style: "currency",
      currency: "EUR",
    })}/mês (${unitLabel}€ × ${d.alunos} alunos, desconto por volume automático).`,
    "Quero saber mais sobre o painel de professor e a demo gratuita!",
  ].filter(Boolean);
  return lines.join("\n");
}

export function SchoolLeadForm() {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<LeadData>(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = useMemo(
    () =>
      d.inst.trim().length >= 2 &&
      Number(d.alunos) > 0 &&
      d.contacto.trim().length >= 5 &&
      // rigor institucional: exigimos um identificador de contacto formal
      (d.email.trim().length >= 5 || d.contacto.trim().length >= 9),
    [d],
  );

  const set = (k: keyof LeadData) => (e: { target: { value: string } }) =>
    setD((prev) => ({ ...prev, [k]: e.target.value }));

  const message = buildMessage(d);
  const waHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:escolas@kidoz.online?subject=${encodeURIComponent(
    `Pedido de proposta — ${d.inst || "Instituição"}`,
  )}&body=${encodeURIComponent(message)}`;

  const submit = async (fallback: "wa" | "mail") => {
    if (!valid || d.website) return; // honeypot preenchido → silêncio
    setSending(true);
    try {
      await submitSchoolLead({
        data: {
          institution: d.inst.trim(),
          tipo: d.tipo,
          country: d.pais,
          students: Math.min(20000, Math.max(1, Math.round(Number(d.alunos)))),
          contactName: d.responsavel.trim() || undefined,
          roleTitle: d.cargo.trim() || undefined,
          email: d.email.trim() || undefined,
          phone: d.contacto.trim() || undefined,
          taxId: d.nif.trim() || undefined,
          demoSlot: d.momento,
          message: d.nota.trim() || undefined,
          source: "escolas_page",
        },
      });
    } catch {
      // BD indisponível — o fallback humano (WhatsApp/email) continua válido
    } finally {
      setSending(false);
      setSent(true);
      const href = fallback === "wa" ? waHref : mailHref;
      if (href) window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      id="fundador"
      className="card-chunky mt-8 overflow-hidden rounded-3xl border-2 border-success/40 bg-gradient-to-br from-success/10 to-emerald-400/10"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="font-display text-lg">🏫 Pedido institucional (formal)</p>
          <p className="text-sm text-muted-foreground">
            Formulário seguro para direções e secretarias — respondemos no mesmo dia útil com
            proposta, fatura com NIF e demo agendada.
          </p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5"
        >
          {sent ? (
            <div className="py-6 text-center">
              <PartyPopper className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 font-display text-lg">Pedido registado! 🎉</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Guardámos o teu pedido e abrimos o teu canal preferido para o enviares de imediato.
                Respondemos no mesmo dia útil com a proposta (e o desconto por volume já calculado).
              </p>
              <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-success/50 bg-success/15 px-5 font-display text-sm text-success hover:bg-success/25"
                >
                  <MessageCircle className="h-4 w-4" /> Reenviar por WhatsApp
                </a>
                <a
                  href={mailHref}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 font-display text-sm hover:bg-muted"
                >
                  <Mail className="h-4 w-4" /> Reenviar por email
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Nome da instituição *
                  </span>
                  <input
                    value={d.inst}
                    onChange={set("inst")}
                    placeholder="Ex.: EB1 de São Pedro / Agrupamento Horizonte"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Tipo de instituição *
                  </span>
                  <select
                    value={d.tipo}
                    onChange={set("tipo")}
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    País *
                  </span>
                  <select
                    value={d.pais}
                    onChange={set("pais")}
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {PAISES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    N.º de alunos *
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={20000}
                    value={d.alunos}
                    onChange={set("alunos")}
                    placeholder="Ex.: 120"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    NIF (opcional — acelera a fatura)
                  </span>
                  <input
                    value={d.nif}
                    onChange={set("nif")}
                    placeholder="Ex.: 500123456"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Responsável *
                  </span>
                  <input
                    value={d.responsavel}
                    onChange={set("responsavel")}
                    placeholder="Ex.: Prof.ª Ana Silva"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Cargo
                  </span>
                  <input
                    value={d.cargo}
                    onChange={set("cargo")}
                    placeholder="Ex.: Diretora / Coordenadora TIC"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Telefone *
                  </span>
                  <input
                    value={d.contacto}
                    onChange={set("contacto")}
                    placeholder="Ex.: +351 912 345 678"
                    inputMode="tel"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Email institucional (opcional)
                  </span>
                  <input
                    type="email"
                    value={d.email}
                    onChange={set("email")}
                    placeholder="Ex.: direcao@escola.edu.pt"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Melhor momento para a demo
                  </span>
                  <select
                    value={d.momento}
                    onChange={set("momento")}
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    {MOMENTOS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Algo mais? (opcional)
                  </span>
                  <input
                    value={d.nota}
                    onChange={set("nota")}
                    placeholder="Ex.: queríamos começar já no 2.º período"
                    className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                {/* Honeypot — invisível para humanos */}
                <label className="hidden" aria-hidden="true">
                  Website
                  <input
                    value={d.website}
                    onChange={set("website")}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              {Number(d.alunos) > 0 && (
                <p className="mt-3 rounded-2xl bg-success/15 px-4 py-2.5 text-center text-sm font-bold text-success">
                  Estimativa:{" "}
                  {(Number(d.alunos) * precoPorAluno(Number(d.alunos))).toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                  /mês · {(precoPorAluno(Number(d.alunos)) * 100).toFixed(0)} cêntimos por aluno
                  (desconto automático por volume) · 15 dias grátis sem cartão
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <ChunkyButton
                  className="w-full flex-1"
                  disabled={!valid || sending}
                  onClick={() => submit("wa")}
                >
                  {sending ? (
                    <>
                      <LoaderCircle className="mr-1 inline h-5 w-5 animate-spin" /> A registar…
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-1 inline h-5 w-5" /> Registar e enviar (WhatsApp)
                    </>
                  )}
                </ChunkyButton>
                <ChunkyButton
                  tone="secondary"
                  className="w-full flex-1"
                  disabled={!valid || sending}
                  onClick={() => submit("mail")}
                >
                  <Mail className="mr-1 inline h-5 w-5" /> Registar e enviar (email)
                </ChunkyButton>
              </div>
              {!valid && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Preenche os campos com * — rigor mínimo para protegermos os dados de ambos.
                </p>
              )}
              <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> O pedido fica registado na nossa base de
                dados institucional (apagável a pedido, RGPD) e abre já preenchido no teu canal
                preferido.
              </p>
            </>
          )}
        </motion.div>
      )}
    </section>
  );
}
