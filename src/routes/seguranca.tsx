import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/seguranca")({
  head: () => ({
    meta: [
      { title: "Porque somos seguros — Kidoz" },
      {
        name: "description",
        content:
          "Segurança e privacidade no Kidoz, em linguagem simples: sem anúncios, sem venda de dados, consentimento parental e cancelamento fácil.",
      },
      { property: "og:title", content: "Porque somos seguros — Kidoz" },
      {
        property: "og:description",
        content:
          "Segurança e privacidade no Kidoz, em linguagem simples: sem anúncios, sem venda de dados, consentimento parental e cancelamento fácil.",
      },
      { property: "og:url", content: "https://kidoz.online/seguranca" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/seguranca" }],
  }),
  component: SegurancaPage,
  errorComponent: RouteError,
});

const PILLARS: { emoji: string; title: string; text: string }[] = [
  {
    emoji: "🚫",
    title: "Sem anúncios. Nunca.",
    text: "Não temos banners, vídeos patrocinados nem rastreadores de publicidade. O único objetivo do ecrã é a criança aprender — não é prender a atenção para vender nada. Isto também significa que a app abre rápido e gasta menos internet.",
  },
  {
    emoji: "🔒",
    title: "Não vendemos dados. Nem daríamos.",
    text: "O modelo de negócio é simples: as famílias e as escolas pagam a subscrição — ponto. Não existe nenhum outro caminho de dinheiro que exija dados das crianças. Não partilhamos, não vendemos e não usamos dados para publicidade.",
  },
  {
    emoji: "👪",
    title: "O adulto decide. Sempre.",
    text: "A conta de uma criança só é criada depois de um adulto dar o seu consentimento (com o seu email registado), conforme o RGPD (art.º 8) e a lei europeia de proteção de menores. Os pais podem apagar tudo a qualquer momento no painel de pais.",
  },
  {
    emoji: "💳",
    title: "Cancelar tem de ser fácil — e é.",
    text: "Cancelamento em 2 cliques no painel da família, sem chamadas telefónicas, sem emails de retenção intermináveis, sem letras miudinhas. A renovação está sempre visível no painel, com a data exata.",
  },
  {
    emoji: "🇪🇺",
    title: "Dados na União Europeia",
    text: "A infraestrutura (Supabase) fica em servidores na UE. Os pagamentos são processados pela Stripe e pela PayPal — o número do cartão nunca passa pela plataforma. Sem ferramentas de publicidade ou analítica de terceiros.",
  },
  {
    emoji: "🧒",
    title: "Feito para crianças pequenas",
    text: "Sem chat com estranhos, sem links para fora da app, sem compras dentro do ecrã da criança e sem mecânicas que punem quem falha. As lições são curtas (10–15 min) e o regresso depois de uns dias ausentes é celebrado, não castigado.",
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Que dados recolhem da minha criança?",
    a: "O mínimo possível: um nome (pode ser fictício), o ano escolar, o país e o desempenho nas lições (acertos/erros) para adaptar a dificuldade. Se criar conta de família, juntamos o seu email. Pode ver e apagar tudo no painel de pais.",
  },
  {
    q: "A criança pode gastar dinheiro dentro da app?",
    a: "Não. Não existem compras dentro do ecrã da criança — tudo o que se ganha no jogo (moedas, XP, itens) é jogável e gratuito. As subscrições só podem ser geridas pelo adulto, com PIN.",
  },
  {
    q: "Onde posso ver o progresso do meu filho?",
    a: "No painel de pais (/pais): lições da semana, precisão, minutos, matérias e controlos de tempo. Funciona mesmo sem criar conta — o dispositivo onde a criança joga mostra o relatório da semana.",
  },
  {
    q: "E se quiser apagar tudo?",
    a: "No painel de pais tem uma zona de conta com eliminação total. Sem contacto, sem espera — os dados são removidos.",
  },
];

function SegurancaPage() {
  return (
    <main id="main-content" className="min-h-[100dvh] bg-background pb-16 pt-6">
      <div className="mx-auto max-w-[56rem] px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Confiança em linguagem simples
        </p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">Porque somos seguros</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
          As políticas de privacidade são importantes mas difíceis de ler — por isso, aqui está a
          nossa promessa em palavras simples. A versão jurídica completa está na{" "}
          <Link to="/privacidade" className="text-primary underline">
            Política de Privacidade
          </Link>{" "}
          e nos{" "}
          <Link to="/termos" className="text-primary underline">
            Termos
          </Link>
          .
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
          {PILLARS.map((p) => (
            <section
              key={p.title}
              className="card-chunky rounded-3xl border-2 border-border bg-card p-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {p.emoji}
                </span>
                <h2 className="font-display text-lg">{p.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{p.text}</p>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Perguntas diretas dos pais</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="rounded-2xl border border-border bg-card px-4 py-3 open:border-primary/40"
              >
                <summary className="cursor-pointer font-display text-sm sm:text-base">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="card-chunky mt-10 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/10 p-5 text-center sm:p-6">
          <h2 className="font-display text-xl">Ainda com dúvidas?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Escreva-nos para{" "}
            <a href="mailto:info@kidoz.online" className="text-primary underline">
              info@kidoz.online
            </a>{" "}
            — uma pessoa responde, não um robô.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/comecar">
              <span className="inline-block rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground">
                Começar a aventura
              </span>
            </Link>
            <Link to="/pais">
              <span className="inline-block rounded-full border-2 border-border bg-card px-5 py-2.5 font-display text-sm font-bold">
                Painel de pais
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
