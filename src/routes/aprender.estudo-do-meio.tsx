import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, Leaf, Map, Sparkles } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/aprender/estudo-do-meio")({
  head: () => ({
    meta: [
      { title: "Aprender Estudo do Meio — 1.º ciclo | Kidoz" },
      { name: "description", content: "Estudo do Meio para crianças do 1.º ciclo: corpo humano, natureza, história de Portugal, geografia e ciência. Lições gamificadas em pt-PT." },
      { property: "og:title", content: "Aprender Estudo do Meio — 1.º ciclo | Kidoz" },
      { property: "og:description", content: "Corpo humano, natureza, Portugal e ciência em lições curtas com mascotes e mascote tutor IA." },
      { property: "og:url", content: "https://kidoz.online/aprender/estudo-do-meio" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/aprender/estudo-do-meio" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Estudo do Meio — 1.º ciclo (Kidoz)",
        description: "Lições interativas de Estudo do Meio alinhadas com o programa do 1.º ciclo em Portugal.",
        provider: { "@type": "Organization", name: "Kidoz", url: "https://kidoz.online" },
        inLanguage: "pt-PT",
        educationalLevel: "Primary",
      }),
    }],
  }),
  component: EstudoDoMeioPage,
  errorComponent: RouteError,
});

const TOPICS = [
  { icon: Leaf, title: "Corpo e natureza", desc: "Sistemas do corpo, animais, plantas e o ciclo da água em lições visuais." },
  { icon: Map, title: "Portugal e o mundo", desc: "Distritos, rios, serras, países lusófonos e bandeiras." },
  { icon: Globe2, title: "Ciência do dia-a-dia", desc: "Estados da matéria, força e movimento, e experiências simples." },
  { icon: Sparkles, title: "História com aventura", desc: "Descobrimentos, símbolos nacionais e personagens marcantes." },
];

function EstudoDoMeioPage() {
  return (
    <main id="main-content" className="bg-sky-island min-h-[100dvh]">
      <article className="mx-auto max-w-[48rem] px-5 py-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Início</Link>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Descobrir o Estudo do Meio</h1>
        <p className="mt-3 text-base text-foreground/80">
          O Kidoz leva o programa de <strong>Estudo do Meio</strong> além do manual: as crianças
          exploram o corpo humano, a natureza e a história de Portugal com vídeos curtos, jogos de
          arrastar-e-largar e mini-quizzes. Em modo Premium, podem ver os mascotes em
          <strong> Realidade Aumentada</strong> a explicar conceitos no espaço real.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-pt-world" />
                  <p className="font-display text-lg">{t.title}</p>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{t.desc}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl bg-card/70 p-5">
          <h2 className="font-display text-2xl">Conteúdos abrangidos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            <li>Corpo humano: ossos, músculos, órgãos e sentidos.</li>
            <li>Natureza: animais vertebrados/invertebrados, plantas e habitats.</li>
            <li>Geografia de Portugal: continente, ilhas, distritos, rios, serras.</li>
            <li>História: símbolos nacionais, descobrimentos e factos marcantes.</li>
            <li>Ciência: estados da matéria, magnetismo, ciclo da água, sistema solar.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/comecar"><ChunkyButton>Começar agora <ArrowRight className="ml-1 inline h-4 w-4" /></ChunkyButton></Link>
          <Link to="/aprender/portugues"><ChunkyButton tone="secondary">Português</ChunkyButton></Link>
          <Link to="/aprender/matematica"><ChunkyButton tone="ghost">Matemática</ChunkyButton></Link>
        </div>
      </article>
    </main>
  );
}
