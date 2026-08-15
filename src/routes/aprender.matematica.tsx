import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, Hash, Ruler, Sparkles } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/aprender/matematica")({
  head: () => ({
    meta: [
      { title: "Aprender Matemática — 1.º ciclo | Kidoz" },
      { name: "description", content: "Matemática para crianças do 1.º ciclo: números, operações, frações, geometria e resolução de problemas. Lições gamificadas alinhadas com o programa português." },
      { property: "og:title", content: "Aprender Matemática — 1.º ciclo | Kidoz" },
      { property: "og:description", content: "Números, operações, frações e geometria em lições curtas e divertidas para crianças." },
      { property: "og:url", content: "https://kidoz.online/aprender/matematica" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/aprender/matematica" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Matemática — 1.º ciclo (Kidoz)",
        description: "Lições interativas de Matemática alinhadas com o programa do 1.º ciclo em Portugal.",
        provider: { "@type": "Organization", name: "Kidoz", url: "https://kidoz.online" },
        inLanguage: "pt-PT",
        educationalLevel: "Primary",
      }),
    }],
  }),
  component: MatematicaPage,
  errorComponent: RouteError,
});

const TOPICS = [
  { icon: Hash, title: "Números e contagem", desc: "Do 1 ao 1000, comparação, sequências, pares e ímpares — com manipulativos visuais." },
  { icon: Calculator, title: "Operações básicas", desc: "Soma, subtração, multiplicação e divisão com explicação passo-a-passo." },
  { icon: Ruler, title: "Geometria e medida", desc: "Formas, perímetros, áreas e unidades de medida com exercícios práticos." },
  { icon: Sparkles, title: "Frações e decimais", desc: "Introduzidas com pizzas, barras e exemplos do dia-a-dia." },
];

function MatematicaPage() {
  return (
    <main id="main-content" className="bg-sky-island min-h-[100dvh]">
      <article className="mx-auto max-w-3xl px-5 py-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Início</Link>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Matemática que sabe a aventura</h1>
        <p className="mt-3 text-base text-foreground/80">
          Aprender <strong>Matemática no 1.º ciclo</strong> com o Kidoz é resolver pequenos desafios
          ao lado das mascotes. Cada conceito é introduzido com manipulativos visuais e progressão
          adaptativa: se a criança erra, o exercício seguinte é mais fácil; se acerta, sobe de nível.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-pt-math" />
                  <p className="font-display text-lg">{t.title}</p>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{t.desc}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl bg-card/70 p-5">
          <h2 className="font-display text-2xl">Tópicos cobertos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            <li>Numeração e sistema decimal até ao milhar.</li>
            <li>Tabuada do 2 ao 10 com treino espaçado e revisão automática.</li>
            <li>Frações próprias, equivalentes e comparação visual.</li>
            <li>Perímetro, área e unidades do sistema métrico.</li>
            <li>Resolução de problemas com pistas progressivas do tutor Mocha.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/comecar"><ChunkyButton>Começar agora <ArrowRight className="ml-1 inline h-4 w-4" /></ChunkyButton></Link>
          <Link to="/aprender/portugues"><ChunkyButton tone="secondary">Português</ChunkyButton></Link>
          <Link to="/aprender/estudo-do-meio"><ChunkyButton tone="ghost">Estudo do Meio</ChunkyButton></Link>
        </div>
      </article>
    </main>
  );
}
