import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Mic, Pencil, Sparkles } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/aprender/portugues")({
  head: () => ({
    meta: [
      { title: "Aprender Português — 1.º ciclo | Kidoz" },
      { name: "description", content: "Lições interativas de Português para crianças do 1.º ciclo: leitura, escrita, gramática, vocabulário e ortografia. Alinhado com o programa nacional português." },
      { property: "og:title", content: "Aprender Português — 1.º ciclo | Kidoz" },
      { property: "og:description", content: "Leitura, escrita, gramática e vocabulário em lições curtas e gamificadas para crianças do 1.º ciclo." },
      { property: "og:url", content: "https://kidoz.online/aprender/portugues" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/aprender/portugues" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Course",
        name: "Português — 1.º ciclo (Kidoz)",
        description: "Lições interativas de Português alinhadas com o programa do 1.º ciclo em Portugal.",
        provider: { "@type": "Organization", name: "Kidoz", url: "https://kidoz.online" },
        inLanguage: "pt-PT",
        educationalLevel: "Primary",
      }),
    }],
  }),
  component: PortuguesPage,
  errorComponent: RouteError,
});

const TOPICS = [
  { icon: BookOpen, title: "Leitura compreensiva", desc: "Pequenos textos com perguntas e mascotes que ajudam a entender o significado." },
  { icon: Pencil, title: "Ortografia e escrita", desc: "Treina sílabas, plurais, acentos e palavras com regras do programa nacional." },
  { icon: Mic, title: "Vocabulário guiado", desc: "Sinónimos, antónimos e famílias de palavras com áudio em português europeu." },
  { icon: Sparkles, title: "Gramática divertida", desc: "Nomes, verbos, adjetivos e classes de palavras com jogos rápidos." },
];

function PortuguesPage() {
  return (
    <main id="main-content" className="bg-sky-island min-h-[100dvh]">
      <article className="mx-auto max-w-[48rem] px-5 py-10">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Início</Link>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">Aprender Português a brincar</h1>
        <p className="mt-3 text-base text-foreground/80">
          O Kidoz transforma o programa de <strong>Português do 1.º ciclo</strong> numa aventura em lições
          curtas de 3 a 5 minutos. As mascotes leem em voz alta com pronúncia <strong>pt-PT</strong>,
          ajudam quando a criança erra, e celebram cada conquista — para que aprender pareça brincar.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-pt-portuguese" />
                  <p className="font-display text-lg">{t.title}</p>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{t.desc}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl bg-card/70 p-5">
          <h2 className="font-display text-2xl">O que a criança aprende</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/85">
            <li>Ler e interpretar textos curtos adequados à idade.</li>
            <li>Escrever frases com regras de ortografia (ç, ss, rr, nh, lh).</li>
            <li>Identificar classes de palavras: nomes, verbos, adjetivos, pronomes.</li>
            <li>Construir vocabulário com sinónimos, antónimos e campos lexicais.</li>
            <li>Treinar leitura em voz alta com modelo nativo em pt-PT.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/comecar"><ChunkyButton>Começar agora <ArrowRight className="ml-1 inline h-4 w-4" /></ChunkyButton></Link>
          <Link to="/aprender/matematica"><ChunkyButton tone="secondary">Matemática</ChunkyButton></Link>
          <Link to="/aprender/estudo-do-meio"><ChunkyButton tone="ghost">Estudo do Meio</ChunkyButton></Link>
        </div>
      </article>
    </main>
  );
}
