// MerchComingSoon — estado vazio da loja convertido em captura de leads.
// Enquanto a Shopify não tem produtos, mostra teasers da coleção e um
// formulário "avisa-me" (padrão SchoolLeadForm: deep-links WhatsApp/email,
// zero backend). Substitui a antiga mensagem de dev visível ao público.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, Mail, MessageCircle, Package } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";

const TEASERS = [
  {
    emoji: "📕",
    name: "Caderno de Atividades",
    note: "Exercícios com a Faísca e a Mocha, para levar para qualquer lado",
  },
  {
    emoji: "🦉",
    name: "Peluche da Mocha",
    note: "A coruja sabichona em versão abraçável",
  },
  {
    emoji: "👕",
    name: "T-shirt Kidoz",
    note: "Para os pequenos campeões mostrarem o orgulho",
  },
  {
    emoji: "🃏",
    name: "Cartas de Desafios",
    note: "Aprender em família, longe do ecrã",
  },
] as const;

const EMAIL_RE = /\S+@\S+\.\S+/;

export function MerchComingSoon() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const valid = useMemo(() => EMAIL_RE.test(email.trim()), [email]);

  const message = [
    "🎁 *Quero ser avisado quando a Loja Kidoz abrir!*",
    "",
    `Email: ${email.trim()}`,
    "",
    "Avisem-me sobre a primeira coleção (caderno de atividades, peluche da Mocha, t-shirt e cartas de desafios).",
  ].join("\n");

  const mailHref = `mailto:loja@kidoz.online?subject=${encodeURIComponent(
    "Avisa-me quando a Loja Kidoz abrir",
  )}&body=${encodeURIComponent(message)}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-6 flex flex-col items-center">
      {/* Teasers da coleção */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEASERS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="card-chunky relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-card to-accent/20 p-5 text-center"
          >
            <span className="absolute right-3 top-3 rounded-full bg-amber-400/20 px-2 py-0.5 font-display text-[10px] font-bold text-amber-700">
              EM BREVE
            </span>
            <span aria-hidden className="text-5xl">
              {t.emoji}
            </span>
            <h4 className="mt-3 font-display text-base font-semibold leading-tight">{t.name}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
          </motion.div>
        ))}
      </div>

      {/* Captura de lead */}
      <div className="mt-8 w-full max-w-xl rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/20 p-6 text-center shadow-sm">
        {sent ? (
          <div role="status" className="flex flex-col items-center gap-2 py-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h4 className="font-display text-xl font-bold">Estás dentro! 🎉</h4>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Enviámos o teu pedido — serás dos primeiros a saber quando a coleção abrir, com
              <b className="text-foreground"> desconto de lançamento</b> para quem chegou cedo.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <Bell className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <h4 className="mt-3 font-display text-xl font-bold">Sê dos primeiros a saber 🎁</h4>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              A primeira coleção está quase a chegar. Deixa o teu email e avisamos-te no dia do
              lançamento — quem chega cedo ganha{" "}
              <b className="text-foreground">desconto de lançamento</b>.
            </p>

            <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
              <label htmlFor="merch-lead-email" className="sr-only">
                O teu email
              </label>
              <input
                id="merch-lead-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="pais@exemplo.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 flex-1 rounded-2xl border-2 border-border bg-card px-4 font-display text-sm outline-none transition-colors focus:border-primary"
              />
              <a
                href={mailHref}
                onClick={() => valid && setSent(true)}
                aria-disabled={!valid}
                className={valid ? "" : "pointer-events-none opacity-50"}
              >
                <ChunkyButton tone="primary" type="button" className="w-full sm:w-auto">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" aria-hidden /> Avisar-me
                  </span>
                </ChunkyButton>
              </a>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Prefiro ser avisado por WhatsApp
            </a>
          </>
        )}
      </div>

      {/* Nota de contexto para quem procura produtos agora */}
      <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Package className="h-3.5 w-3.5" aria-hidden />
        Entretanto, continua a aprender — as moedas ganhas no jogo vão poder ser trocadas por
        prémios da loja.
      </p>
    </div>
  );
}
