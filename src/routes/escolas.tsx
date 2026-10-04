import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { loadProfile, type Profile } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { JoinClassCard } from "@/components/JoinClassCard";
import { SchoolLeadForm } from "@/components/SchoolLeadForm";
import { RouteError } from "@/components/RouteError";
import {
  ArrowLeft,
  Check,
  School as SchoolIcon,
  Users,
  ShieldCheck,
  Headphones,
  Minus,
  Plus,
  MessageCircle,
  Sparkles,
  WifiOff,
  FileText,
  BadgeCheck,
} from "lucide-react";

export const Route = createFileRoute("/escolas")({
  head: () => ({
    meta: [
      { title: "Kidoz para Escolas — 0,99€/aluno/mês, funciona offline" },
      {
        name: "description",
        content:
          "Plano dedicado para escolas e instituições: 0,99€ por aluno/mês, mínimo 20 alunos. Funciona com internet instável, relatórios em PDF para conselhos de turma e ponte com famílias por WhatsApp.",
      },
      {
        property: "og:title",
        content: "Kidoz para Escolas — aprendizagem sem depender da internet",
      },
      {
        property: "og:description",
        content:
          "Plano dedicado para escolas e instituições, painel de turmas e relatórios de progresso.",
      },
      { property: "og:url", content: "https://kidoz.online/escolas" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/escolas" }],
  }),
  component: EscolasPage,
  errorComponent: RouteError,
});

const MIN_STUDENTS = 20;
const MAX_STUDENTS = 5000;
const PRICE_PER_STUDENT = 0.99;
const PRICE_ID = "escola_aluno_mensal";

const FEATURES: { icon: typeof SchoolIcon; title: string; desc: string }[] = [
  {
    icon: Users,
    title: "Gestão de turmas",
    desc: "Criar turmas, adicionar alunos por código, organizar por ano/turma — em 2 minutos.",
  },
  {
    icon: WifiOff,
    title: "Funciona com internet instável",
    desc: "Lições e jogos continuam offline e sincronizam quando houver rede. Feito para a realidade das nossas escolas.",
  },
  {
    icon: FileText,
    title: "Relatórios em PDF",
    desc: "Um clique gera o relatório de turma com precisão, minutos e alunos que precisam de apoio — pronto para conselhos de turma.",
  },
  {
    icon: MessageCircle,
    title: "Ponte com as famílias",
    desc: "Envia o resumo de cada aluno ao encarregado de educação por WhatsApp, sem sair do painel.",
  },
  {
    icon: ShieldCheck,
    title: "Conteúdo regional",
    desc: "Currículo do 1.º ciclo (1.ª–7.ª classe) com variantes PT/MZ/AO/CV/BR e vozes em português.",
  },
  {
    icon: Headphones,
    title: "Suporte dedicado",
    desc: "Onboarding com a tua equipa, formação inicial e canal direto para escolas.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Cria a escola e as turmas",
    desc: "Em 2 minutos tens o painel pronto: escolas, turmas e códigos de convite.",
  },
  {
    n: "2",
    title: "Os alunos entram com um código",
    desc: "Sem emails nem passwords complicadas: cada aluno usa o código da turma e escolhe a mascote.",
  },
  {
    n: "3",
    title: "Acompanha, imprime e partilha",
    desc: "Vê precisão, minutos e evolução semanal. Exporta CSV, gera PDF para o conselho de turma e envia resumos aos pais.",
  },
];

const SCHOOL_FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Os alunos precisam de telemóvel próprio?",
    a: "Não. Funciona em tablets partilhados, computadores da sala ou telemóveis — o progresso fica guardado na conta de cada aluno.",
  },
  {
    q: "Funciona sem internet na escola?",
    a: "Sim — é um dos nossos maiores diferenciais. As lições e jogos funcionam offline e sincronizam automaticamente quando houver ligação. Funciona bem em tablets partilhados, computadores antigos e redes instáveis.",
  },
  {
    q: "Que disciplinas estão incluídas?",
    a: "Português, Matemática e Estudo do Meio do 1.º ao 4.º ano (expansão até à 7.ª classe), mais Desafios Infinitos e o modo Júnior (2–5 anos) para pré-escolar.",
  },
  {
    q: "Podemos pagar por transferência bancária ou processo administrativo?",
    a: "Sim. Fala connosco em escolas@kidoz.online e enviamos proposta com referência Multibanco/transferência e fatura com NIF da instituição.",
  },
  {
    q: "Os dados dos alunos estão protegidos?",
    a: "Sim. Sem anúncios, sem partilha com terceiros, painel com PIN e conformidade RGPD. Os pais podem ver e apagar dados a qualquer momento.",
  },
  {
    q: "Como funciona o Programa de Escolas Fundadoras?",
    a: "As primeiras 20 instituições recebem 50% de desconto no 1.º ano (aplicado na fatura, sem checkout), certificado de Escola Fundadora e voto no roteiro. Candidata-te pelo formulário ou WhatsApp desta página.",
  },
  {
    q: "Que relatórios recebe o professor?",
    a: "Painel com precisão, minutos, XP e sequência por aluno; evolução semanal em gráfico; alertas de alunos em risco; exportação CSV; e um relatório de turma em PDF de um clique, pronto para conselhos de turma e reuniões de pais.",
  },
];

function EscolasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<number>(MIN_STUDENTS);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
  }, []);

  const monthly = useMemo(() => students * PRICE_PER_STUDENT, [students]);
  const yearly = useMemo(() => monthly * 12, [monthly]);

  const adjust = (delta: number) => {
    setStudents((n) => {
      const next = n + delta;
      if (next < MIN_STUDENTS) return MIN_STUDENTS;
      if (next > MAX_STUDENTS) return MAX_STUDENTS;
      return next;
    });
  };

  const handleSubscribe = () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <PaymentTestModeBanner />
      {profile && <TopBar profile={profile} />}

      <main id="main-content" className="mx-auto max-w-5xl px-5 py-6 sm:py-10">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Início
        </Link>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-secondary/40 via-accent/30 to-primary/20 p-6 sm:p-10 text-center"
        >
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-elegant">
            <SchoolIcon className="h-7 w-7" />
          </div>
          <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
            Kidoz para Escolas
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">
            A escola inteira a aprender — mesmo com internet fraca
          </h1>
          <p className="mx-auto mt-3 max-w-[48rem] text-base text-muted-foreground sm:text-lg">
            Lições adaptativas prontas para o 1.º ciclo, painel do professor e relatórios para os
            pais. Funciona em tablets partilhados e continua offline quando a rede falha. Pagas
            apenas pelos alunos que usam.
          </p>
          <div className="mt-5 inline-flex items-baseline gap-2">
            <span className="font-display text-5xl text-primary">0,99€</span>
            <span className="text-base text-muted-foreground">/ aluno · mês</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Mínimo {MIN_STUDENTS} alunos · faturação mensal · IVA incluído · menos de 5 cêntimos por
            dia útil por aluno
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { n: "300+", l: "exercícios" },
              { n: "∞", l: "desafios" },
              { n: "5", l: "mascotes vivas" },
              { n: "CSV", l: "exportação" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/40 bg-card/60 p-2">
                <p className="font-display text-xl text-primary">{s.n}</p>
                <p className="text-[11px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Entrada do aluno na turma (fecha o ciclo institucional) */}
        <JoinClassCard />

        {/* Programa de Escolas Fundadoras — urgência honesta, sem inventar números */}
        <section className="mt-8 overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-400/15 via-card to-secondary/20 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/25">
              <BadgeCheck className="h-7 w-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-display text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">
                Edição limitada — primeiras 20 instituições
              </p>
              <h2 className="mt-1 font-display text-2xl">Programa de Escolas Fundadoras 🏅</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                As instituições que entram primeiro moldam o produto — e travam condições especiais.
              </p>
            </div>
          </div>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "50% de desconto no 1.º ano, aplicado diretamente na fatura da escola",
              "Certificado digital de Escola Fundadora Kidoz para a recepção",
              "Voto direto no roteiro: novas matérias, relatórios e idiomas",
              "Formação inicial e onboarding gratuitos para os professores",
            ].map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a
              href="#fundador"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-6 font-display text-base font-semibold text-primary-foreground shadow-lg transition-transform active:scale-95"
            >
              Quero ser Escola Fundadora →
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                "Olá! Somos uma instituição de ensino e queremos candidatar-nos ao Programa de Escolas Fundadoras do Kidoz. Chamamo-nos…",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-success/50 bg-success/15 px-6 font-display text-base text-success hover:bg-success/25"
            >
              <MessageCircle className="h-5 w-5" />
              Candidatar por WhatsApp
            </a>
          </div>
        </section>

        {/* Como funciona */}
        <section className="mt-8">
          <h2 className="text-center font-display text-2xl">Como funciona</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Da inscrição ao primeiro relatório em menos de uma semana.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s) => (
              <motion.div
                key={s.n}
                whileHover={{ y: -3 }}
                className="card-chunky relative rounded-2xl border-2 border-border bg-card p-4"
              >
                <span className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-black text-primary-foreground shadow">
                  {s.n}
                </span>
                <p className="font-display text-base">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-chunky rounded-2xl border-2 border-border bg-card p-5"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-3 font-display text-lg">{f.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Calculator */}
        <section className="mt-8 card-chunky rounded-3xl border-2 border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl">Calcula o teu plano</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajusta o número de alunos e vê o investimento mensal.
          </p>

          <div className="mt-5 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Menos alunos"
                onClick={() => adjust(-10)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-border bg-muted text-foreground active:scale-95"
              >
                <Minus className="h-5 w-5" />
              </button>
              <input
                type="number"
                min={MIN_STUDENTS}
                max={MAX_STUDENTS}
                value={students}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) {
                    setStudents(Math.min(MAX_STUDENTS, Math.max(MIN_STUDENTS, v)));
                  }
                }}
                className="h-14 w-28 rounded-2xl border-2 border-border bg-background text-center font-display text-2xl"
                aria-label="Número de alunos"
              />
              <button
                type="button"
                aria-label="Mais alunos"
                onClick={() => adjust(10)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-border bg-muted text-foreground active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 rounded-2xl bg-muted/60 p-4 text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total mensal</p>
              <p className="font-display text-3xl text-primary">
                {monthly.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ≈{" "}
                {yearly.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}{" "}
                por ano
              </p>
            </div>
          </div>

          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Acesso completo para todos os alunos da licença",
              "Painel de professor com métricas e exportação CSV",
              "Conteúdo até à 7.ª classe (em expansão)",
              "Cancela a qualquer momento",
            ].map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row">
            <ChunkyButton onClick={handleSubscribe} className="min-h-[56px] flex-1 text-base">
              Subscrever {students} alunos
            </ChunkyButton>
            <a
              href="mailto:escolas@kidoz.online?subject=Pedido%20de%20demonstra%C3%A7%C3%A3o%20Kidoz%20Escolas"
              className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border-2 border-border bg-card px-5 font-display text-base hover:bg-muted"
            >
              Falar com vendas
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                "Olá! Tenho interesse no plano Kidoz para Escolas (0,99€/aluno/mês). A minha instituição chama-se…",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-success/50 bg-success/15 px-5 font-display text-base text-success hover:bg-success/25"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            🔒 Pagamento seguro processado pela Stripe. IVA calculado automaticamente por país. Para
            pagamento por transferência bancária, fala connosco.
          </p>
        </section>

        {/* Lead capture estruturado (B2B) */}
        <SchoolLeadForm />

        {/* Demo / valor para os pais */}
        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="card-chunky rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-accent/15 p-5">
            <Sparkles className="h-7 w-7 text-primary" />
            <p className="mt-2 font-display text-lg">Experimenta antes de decidir</p>
            <p className="text-sm text-foreground/80">
              Cria um perfil de teste em 1 minuto: joga uma lição, vê o painel e percebe porque é
              que as crianças voltam todos os dias.
            </p>
            <Link
              to="/comecar"
              className="mt-3 inline-block font-display text-sm text-primary underline underline-offset-2 hover:underline"
            >
              Criar perfil de demonstração →
            </Link>
          </div>
          <div className="card-chunky rounded-3xl border-2 border-secondary/50 bg-gradient-to-br from-secondary/15 to-primary/10 p-5">
            <ShieldCheck className="h-7 w-7 text-pt-world" />
            <p className="mt-2 font-display text-lg">Que os pais também aprovam</p>
            <p className="text-sm text-foreground/80">
              Relatórios claros, controlo de tempo de ecrã, sem anúncios e dados protegidos — a
              escola ganha a confiança das famílias.
            </p>
            <Link
              to="/pais"
              className="mt-3 inline-block font-display text-sm text-primary underline underline-offset-2 hover:underline"
            >
              Ver o painel de pais →
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-8">
          <h2 className="font-display text-2xl">Perguntas frequentes das escolas</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SCHOOL_FAQS.map((f) => (
              <details
                key={f.q}
                className="card-chunky rounded-2xl border-2 border-border bg-card p-4"
              >
                <summary className="cursor-pointer font-display text-base">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Already a teacher */}
        <section className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
          <p className="text-sm">
            Já tens conta de professor?{" "}
            <Link to="/escola" className="font-display text-primary underline">
              Ir para o painel da escola →
            </Link>
          </p>
        </section>
      </main>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-h-[90vh] max-w-[48rem] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscrição Escolas — {students} alunos</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Checkout seguro para a subscrição do plano Escolas.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <StripeEmbeddedCheckout
              priceId={PRICE_ID}
              quantity={students}
              customerEmail={user.email ?? undefined}
              userId={user.id}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
