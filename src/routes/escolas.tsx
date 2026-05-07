import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadProfile, type Profile } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Check,
  School as SchoolIcon,
  Users,
  BarChart3,
  ShieldCheck,
  Headphones,
  Minus,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/escolas")({
  head: () => ({
    meta: [
      { title: "Plano Escolas Kidoz — 0,99€ por aluno/mês" },
      {
        name: "description",
        content:
          "Plano dedicado para escolas e instituições: 0,99€ por aluno/mês, mínimo 20 alunos. Painel de turmas, relatórios de progresso e suporte dedicado.",
      },
    ],
  }),
  component: EscolasPage,
});

const MIN_STUDENTS = 20;
const MAX_STUDENTS = 5000;
const PRICE_PER_STUDENT = 0.99;
const PRICE_ID = "escola_aluno_mensal";

const FEATURES: { icon: typeof SchoolIcon; title: string; desc: string }[] = [
  {
    icon: Users,
    title: "Gestão de turmas",
    desc: "Criar turmas, adicionar alunos por código, organizar por ano/turma.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de progresso",
    desc: "Métricas por aluno, por disciplina, evolução semanal e ranking interno.",
  },
  {
    icon: ShieldCheck,
    title: "Conteúdo regional",
    desc: "Currículo adaptado ao 1.º ciclo (1.ª–7.ª classe), com variantes PT/MZ/AO/CV/BR.",
  },
  {
    icon: Headphones,
    title: "Suporte dedicado",
    desc: "Onboarding com a tua equipa, formação inicial e canal direto para escolas.",
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

      <main className="mx-auto max-w-5xl px-5 py-6 sm:py-10">
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
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Kidoz para Escolas
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Uma plataforma de aprendizagem lúdica para a tua escola, adaptada à
            realidade dos países lusófonos. Paga apenas pelos alunos que usam.
          </p>
          <div className="mt-5 inline-flex items-baseline gap-2">
            <span className="font-display text-5xl text-primary">0,99€</span>
            <span className="text-base text-muted-foreground">/ aluno · mês</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Mínimo {MIN_STUDENTS} alunos · faturação mensal · IVA incluído
          </p>
        </motion.section>

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
                <h3 className="mt-3 font-display text-lg">{f.title}</h3>
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total mensal
              </p>
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
            <ChunkyButton
              onClick={handleSubscribe}
              className="min-h-[56px] flex-1 text-base"
            >
              Subscrever {students} alunos
            </ChunkyButton>
            <a
              href="mailto:escolas@kidoz.online?subject=Pedido%20de%20demonstra%C3%A7%C3%A3o%20Kidoz%20Escolas"
              className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border-2 border-border bg-card px-5 font-display text-base hover:bg-muted"
            >
              Falar com vendas
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            🔒 Pagamento seguro processado pela Stripe. IVA calculado automaticamente
            por país. Para pagamento por transferência bancária, fala connosco.
          </p>
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Subscrição Escolas — {students} alunos
            </DialogTitle>
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
