// SchoolLeadForm — captura de leads B2B em /escolas.
// Substitui o link genérico de WhatsApp por um formulário estruturado:
// a instituição preenche 5 campos e a mensagem chega pronta ao WhatsApp
// (ou email) da equipa de vendas — leads qualificados, zero backend.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, ChevronDown } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";

const TIPOS = [
  "Escola (1.º ciclo)",
  "Creche / Jardim de infância",
  "ATL / Centro de atividades",
  "Outro",
] as const;

// Momento preferido para a demo — qualifica o lead e poupa um ciclo de emails.
const MOMENTOS = ["Qualquer momento", "Manhã (9h–12h)", "Tarde (14h–17h)"] as const;

interface LeadData {
  inst: string;
  tipo: string;
  alunos: string;
  responsavel: string;
  contacto: string;
  momento: string;
  nota: string;
}

const EMPTY: LeadData = {
  inst: "",
  tipo: TIPOS[0],
  alunos: "",
  responsavel: "",
  contacto: "",
  momento: MOMENTOS[0],
  nota: "",
};

function buildMessage(d: LeadData): string {
  const lines = [
    "🏫 *Pedido de proposta — Kidoz para Instituições*",
    "",
    `• Instituição: ${d.inst}`,
    `• Tipo: ${d.tipo}`,
    `• N.º de alunos: ${d.alunos}`,
    d.responsavel ? `• Responsável: ${d.responsavel}` : null,
    `• Contacto: ${d.contacto}`,
    d.momento !== MOMENTOS[0] ? `• Melhor momento para a demo: ${d.momento}` : null,
    d.nota ? `• Nota: ${d.nota}` : null,
    "",
    `Custo estimado: ${(Number(d.alunos) * 0.99).toLocaleString("pt-PT", {
      style: "currency",
      currency: "EUR",
    })}/mês (0,99€ × ${d.alunos} alunos).`,
    "Quero saber mais sobre o painel de professor e a demo gratuita!",
  ].filter(Boolean);
  return lines.join("\n");
}

export function SchoolLeadForm() {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<LeadData>(EMPTY);
  const [sent, setSent] = useState(false);

  const valid = useMemo(
    () => d.inst.trim().length >= 2 && Number(d.alunos) > 0 && d.contacto.trim().length >= 5,
    [d],
  );

  const set = (k: keyof LeadData) => (e: { target: { value: string } }) =>
    setD((prev) => ({ ...prev, [k]: e.target.value }));

  const message = buildMessage(d);
  const waHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:escolas@kidoz.online?subject=${encodeURIComponent(
    `Pedido de proposta — ${d.inst || "Instituição"}`,
  )}&body=${encodeURIComponent(message)}`;

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
          <p className="font-display text-lg">🏫 Pedir proposta para a minha instituição</p>
          <p className="text-sm text-muted-foreground">
            5 campos, 30 segundos — recebemos tudo e respondemos no mesmo dia com demo incluída.
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Nome da instituição *
              </span>
              <input
                value={d.inst}
                onChange={set("inst")}
                placeholder="Ex.: EB1 de São Pedro"
                className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Tipo
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
                N.º de alunos *
              </span>
              <input
                type="number"
                min={1}
                max={2000}
                value={d.alunos}
                onChange={set("alunos")}
                placeholder="Ex.: 120"
                className="mt-1 w-full rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Responsável
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
                Telefone ou email *
              </span>
              <input
                value={d.contacto}
                onChange={set("contacto")}
                placeholder="Ex.: 912 345 678"
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
          </div>

          {Number(d.alunos) > 0 && (
            <p className="mt-3 rounded-2xl bg-success/15 px-4 py-2.5 text-center text-sm font-bold text-success">
              Estimativa:{" "}
              {(Number(d.alunos) * 0.99).toLocaleString("pt-PT", {
                style: "currency",
                currency: "EUR",
              })}
              /mês · 0,99€ × {d.alunos} alunos · descontos a partir de 200 alunos
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={valid ? waHref : undefined}
              onClick={(e) => {
                if (!valid) e.preventDefault();
                else setSent(true);
              }}
              aria-disabled={!valid}
              className={`flex-1 ${!valid ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChunkyButton className="w-full">
                <MessageCircle className="mr-1 inline h-5 w-5" /> Enviar por WhatsApp
              </ChunkyButton>
            </a>
            <a
              href={valid ? mailHref : undefined}
              onClick={(e) => {
                if (!valid) e.preventDefault();
                else setSent(true);
              }}
              aria-disabled={!valid}
              className={`flex-1 ${!valid ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChunkyButton tone="secondary" className="w-full">
                <Mail className="mr-1 inline h-5 w-5" /> Enviar por email
              </ChunkyButton>
            </a>
          </div>
          {!valid && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Preenche os campos com * para enviar.
            </p>
          )}
          {sent && (
            <p className="mt-2 text-center text-xs font-bold text-success">
              ✅ Mensagem pronta — só falta carregares em enviar no WhatsApp/email!
            </p>
          )}
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            🔒 Os dados não são guardados por nós: a mensagem abre já preenchida no teu WhatsApp ou
            email.
          </p>
        </motion.div>
      )}
    </section>
  );
}
