import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda — Kidoz" },
      { name: "description", content: "Página de ajuda do Kidoz: perguntas frequentes, contacto e links úteis para pais, mães e educadores." },
      { property: "og:title", content: "Ajuda — Kidoz" },
      { property: "og:description", content: "Página de ajuda do Kidoz: perguntas frequentes, contacto e links úteis para pais, mães e educadores." },
      { property: "og:url", content: "https://kidoz.online/ajuda" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/ajuda" },
    ],
  }),
  component: AjudaPage,
  errorComponent: RouteError,
});

/* ─── FAQ Data ─── */

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Como começar a usar o Kidoz?",
    answer:
      "Aceda a kidoz.online e clique em «Começar a aventura». Crie um perfil de responsável familiar e, em seguida, adicione o perfil da criança com o nome, idade e ano escolar. A mascote dá as boas-vindas e a primeira missão fica disponível de imediato!",
  },
  {
    question: "O Kidoz é gratuito?",
    answer:
      "Sim! O Kidoz oferece um plano gratuito com acesso a lições essenciais de Português, Matemática e Estudo do Meio. O plano Premium desbloqueia missões ilimitadas, o Tutor Mocha IA, realidade aumentada, modo família e relatórios detalhados para pais.",
  },
  {
    question: "O conteúdo está alinhado com o currículo português?",
    answer:
      "Sim. Todo o conteúdo educativo segue o currículo do 1.º ciclo do ensino básico definido pelo Ministério da Educação de Portugal. As missões estão organizadas por ano escolar (1.º ao 4.º) e adaptam-se automaticamente ao nível da criança.",
  },
  {
    question: "Os dados do meu filho/a estão seguros?",
    answer:
      "Absolutamente. O Kidoz cumpre o RGPD europeu e a COPPA. Não recolhemos mais dados do que o estritamente necessário, não vendemos dados a terceiros, não exibimos publicidade e todos os dados são encriptados. O consentimento parental é obrigatório para menores de 13 anos.",
  },
  {
    question: "Posso usar o Kidoz offline?",
    answer:
      "Sim. Com o plano Premium, as lições e desafios ficam disponíveis offline após a primeira sincronização. O progresso é guardado localmente e sincronizado quando a ligação à internet é restabelecida.",
  },
  {
    question: "Posso ter várias crianças na mesma conta?",
    answer:
      "Sim! Com o plano Família (Premium), pode criar até 4 perfis de crianças na mesma conta. Cada criança tem o seu próprio mascote, progresso, sequência e configurações individuais. O painel de pais mostra o progresso de todas as crianças.",
  },
];

/* ─── FAQ Accordion ─── */

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-2xl border-2 border-border bg-card overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center gap-3 p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex-1 font-display text-sm sm:text-base">
                {item.question}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */

function AjudaPage() {
  return (
    <main id="main-content" className="min-h-[100dvh] bg-background pb-12 pt-6">
      <div className="mx-auto max-w-[56rem] px-4 sm:px-6">
        <h1 className="font-display text-3xl sm:text-4xl">Ajuda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Encontre aqui as respostas às perguntas mais frequentes sobre o Kidoz.
        </p>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl sm:text-2xl">Perguntas frequentes</h2>
          <FAQAccordion />
        </section>

        {/* Contact */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl sm:text-2xl">Contacto</h2>
          <div className="rounded-2xl border-2 border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-base">Precisa de ajuda?</h3>
                <p className="text-sm text-muted-foreground">
                  Escreva-nos e respondemos em até 48 horas.
                </p>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="font-semibold">E-mail:</span>
              <a href="mailto:info@kidoz.online" className="text-primary underline">
                info@kidoz.online
              </a>
            </p>
          </div>
        </section>

        {/* Useful Links */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-xl sm:text-2xl">Links úteis</h2>
          <div className="space-y-2">
            <Link
              to="/privacidade"
              className="block rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              <span className="font-display text-sm sm:text-base">
                Política de Privacidade
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Como recolhemos, tratamos e protegemos os seus dados.
              </p>
            </Link>
            <Link
              to="/termos"
              className="block rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:bg-card/80"
            >
              <span className="font-display text-sm sm:text-base">
                Termos de Utilização
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Condições de uso, registo e propriedade intelectual.
              </p>
            </Link>
          </div>
        </section>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>
          {" · "}
          <Link to="/termos" className="text-primary underline">Termos de Utilização</Link>
          {" · "}
          <Link to="/app" className="text-primary underline">Voltar ao Kidoz</Link>
        </div>
      </div>
    </main>
  );
}
