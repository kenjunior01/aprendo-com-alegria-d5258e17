// /tutorial — Tutoriais por tipo de cadastro.
// Três caminhos distintos com o mesmo objetivo: a primeira vitória em minutos.
// O modo Instituição é o mais detalhado — é a porta de entrada B2B e exige
// mais rigor (códigos de turma, verificação da direção, trial de 15 dias).

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { RouteError } from "@/components/RouteError";
import { loadProfile, type Profile } from "@/lib/storage";
import { useEffect } from "react";
import {
  Heart,
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  Upload,
  KeyRound,
  Users,
  BarChart3,
  FileDown,
  ShieldCheck,
  Gift,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutoriais — Família, Professor e Instituição | Kidoz" },
      {
        name: "description",
        content:
          "Guias passo a passo do Kidoz: cadastro de família em 1 minuto, cadastro de professor com turmas e códigos, e guia institucional completo com trial de 15 dias e Estúdio do Professor.",
      },
      { property: "og:title", content: "Tutoriais do Kidoz — começa bem, no teu modo" },
      { property: "og:url", content: "https://kidoz.online/tutorial" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "robots", content: "index" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/tutorial" }],
  }),
  component: TutorialPage,
  errorComponent: RouteError,
});

type Modo = "familia" | "professor" | "instituicao";

const MODOS: {
  id: Modo;
  label: string;
  emoji: string;
  sub: string;
  tempo: string;
}[] = [
  {
    id: "familia",
    label: "Família",
    emoji: "👪",
    sub: "Pais e crianças em casa",
    tempo: "1 minuto",
  },
  { id: "professor", label: "Professor", emoji: "🧑‍🏫", sub: "Turmas e códigos", tempo: "5 minutos" },
  {
    id: "instituicao",
    label: "Instituição",
    emoji: "🏫",
    sub: "Direção / escola inteira",
    tempo: "10 minutos",
  },
];

interface Passo {
  titulo: string;
  detalhe: string;
  icone?: typeof Heart;
  dica?: string;
}

const PASSOS: Record<Modo, Passo[]> = {
  familia: [
    {
      titulo: "Entra em kidoz.online e toca em “Começar”",
      detalhe:
        "Sem downloads: funciona no telemóvel, tablet ou computador. Se gostares, podes instalar como app (ícone “Adicionar ao ecrã principal”) — é um PWA oficial.",
    },
    {
      titulo: "Escolhe o trilho: Júnior (2–5), Criança (6–10) ou Pai/Mãe",
      detalhe:
        "O Júnior é pré-leitura com vozes; o trilho Criança segue o 1.º ciclo; o trilho de pais abre o painel de acompanhamento.",
      icone: Heart,
    },
    {
      titulo: "Nome, idade, ano e país da criança",
      detalhe:
        "O vocabulário e as moedas das fichas adaptam-se ao país (PT 🇵🇹, MZ 🇲🇿, AO 🇦🇴, CV 🇨🇻, BR 🇧🇷). Consentimento parental pedido no ecrã — é lei (RGPD/COPPA) e levamos isso a sério.",
    },
    {
      titulo: "Escolhe a mascote — e já está!",
      detalhe:
        "A Missão do Dia aparece logo. 5–10 minutos por dia é o suficiente: é assim que as crianças voltam sozinhas.",
      dica: "Cria a conta de adulto em /auth para guardar o progresso na cloud e ligar os relatórios.",
    },
  ],
  professor: [
    {
      titulo: "Cria a conta de adulto em /auth (email + palavra-passe)",
      detalhe:
        "A conta serve para o painel — os alunos NUNCA precisam de email. 30 segundos, com consentimento e termos claros.",
      icone: KeyRound,
    },
    {
      titulo: "Abre /escola e ativa o modo professor",
      detalhe:
        "É um clique na conta existente — não precisas de segunda conta. O painel da escola abre com um checklist que se auto-preenche.",
    },
    {
      titulo: "Cria a escola e a turma (nome + ano)",
      detalhe:
        "Cada turma gera um código de 6 caracteres (ex.: a7f3k9). Podes criar quantas turmas quiseres — uma por classe ou por turno.",
      icone: Users,
    },
    {
      titulo: "Partilha o código com os alunos",
      detalhe:
        "Os alunos entram em kidoz.online/escolas → “Entrar numa turma” → código → criam perfil com mascote. Feito: já aparecem no teu painel.",
      dica: "Há um botão de partilha por WhatsApp no painel, com o código já escrito.",
    },
    {
      titulo: "Ativa os 15 dias grátis (sem cartão)",
      detalhe:
        "No painel, o cartão “15 dias grátis” ativa o Premium da escola: relatórios avançados, alertas e o Estúdio do Professor. Uma vez por conta, sem renovação automática.",
      icone: Gift,
    },
    {
      titulo: "Explora o Estúdio do Professor (Premium)",
      detalhe:
        "Cria lições à tua medida (escolha múltipla, V/F, ordenar) ou carrega um CSV do Excel/Sheets com os teus exercícios. Os alunos veem-nas na app em “Lições da turma”.",
      icone: Upload,
    },
    {
      titulo: "Relatórios: PDF de turma, CSV e ponte com os pais",
      detalhe:
        "Um clique gera o PDF para o conselho de turma; o CSV sai para o Excel; cada aluno tem resumo pronto para WhatsApp ao encarregado.",
      icone: BarChart3,
    },
  ],
  instituicao: [
    {
      titulo: "Passo 1 — A direção pede a proposta institucional",
      detalhe:
        "Em /escolas, o formulário formal (instituição, tipo, alunos, NIF opcional) fica registado na nossa base de dados institucional e chega por WhatsApp/email. Respondemos no mesmo dia útil com proposta e fatura com NIF.",
      icone: Building2,
      dica: "Direções com pressa: os 15 dias grátis podem começar já no dia da demo.",
    },
    {
      titulo: "Passo 2 — Um coordenador cria a conta e a “escola”",
      detalhe:
        "Em /auth cria a conta (uma só) e em /escola → “Criar escola”. O nome deve ser o oficial da instituição — é ele que aparece nos relatórios e na fatura.",
      icone: KeyRound,
    },
    {
      titulo: "Passo 3 — Cria as turmas por classe/turno",
      detalhe:
        "Ex.: “2.º A — manhã”, “2.º B — manhã”, “3.º C — tarde”. Cada turma tem o seu código de 6 caracteres. Professores diferentes podem gerir turmas diferentes na mesma escola.",
      icone: Users,
    },
    {
      titulo: "Passo 4 — Ativa o trial de 15 dias e monta tudo sem pressa",
      detalhe:
        "O cartão de trial no painel ativa o Premium completo para toda a gestão: relatórios, alertas, exports e Estúdio do Professor. Sem cartão, sem renovação escondida — acabou, acabou.",
      icone: Gift,
    },
    {
      titulo: "Passo 5 — Os alunos entram com os códigos",
      detalhe:
        " Tablets partilhados, sala de informática ou telemóveis: cada aluno usa o código da turma e cria o perfil. Sem emails, sem passwords para 7 anos de idade. Funciona offline — a rede fraca não para a aula.",
      dica: "Segurança: os dados das crianças ficam protegidos (RGPD), sem anúncios nem chat entre estranhos, e os pais podem pedir eliminação a qualquer momento.",
      icone: ShieldCheck,
    },
    {
      titulo: "Passo 6 — Professores criam e enviam os próprios exercícios",
      detalhe:
        "No Estúdio do Professor: lições guiadas ou upload de CSV (há modelo para descarregar). O conteúdo da escola torna-se propriedade da escola — visível só para as turmas dela.",
      icone: Upload,
    },
    {
      titulo: "Passo 7 — Mede, partilha e decide com dados",
      detalhe:
        "Evolução semanal em gráfico, alunos em risco sinalizados automaticamente, PDF de turma em 1 clique para o conselho pedagógico e resumos por WhatsApp aos pais.",
      icone: BarChart3,
    },
    {
      titulo: "Passo 8 — Subscrição com condições transparentes",
      detalhe:
        "Desconto automático por volume (2,49€ → 1,19€ conforme o nº de alunos), fatura com NIF, cartão/PayPal/transferência e cancelamento em 2 cliques. Programa Fundador: primeiras 20 instituições têm 50% no 1.º ano.",
      icone: FileDown,
    },
  ],
};

function TutorialPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modo, setModo] = useState<Modo>("professor");

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      {profile && <TopBar profile={profile} />}

      <main id="main-content" className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky rounded-3xl border-2 border-border bg-gradient-to-br from-primary/10 via-card to-accent/20 p-6 text-center sm:p-8"
        >
          <GraduationCap className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Tutoriais do Kidoz</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Um guia para cada modo — com o mesmo objetivo: a primeira vitória em minutos. Escolhe o
            teu e segue os passos; cada um usa o estado real do produto, sem promessas vagas.
          </p>
        </motion.section>

        {/* Seletor de modo */}
        <div
          className="mt-6 grid gap-2 sm:grid-cols-3"
          role="tablist"
          aria-label="Escolher o tutorial"
        >
          {MODOS.map((m) => {
            const ativo = modo === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setModo(m.id)}
                className={`card-chunky rounded-2xl border-2 p-4 text-center transition-colors ${
                  ativo ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <p aria-hidden="true" className="text-3xl">
                  {m.emoji}
                </p>
                <p className="mt-1 font-display text-base">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                  ⏱ {m.tempo}
                </p>
              </button>
            );
          })}
        </div>

        {/* Passos */}
        <motion.ol
          key={modo}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-2.5"
        >
          {PASSOS[modo].map((p, i) => {
            const Icon = p.icone;
            return (
              <li
                key={p.titulo}
                className="card-chunky flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-black text-primary-foreground shadow">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base">
                    {Icon && <Icon className="mr-1.5 inline h-4 w-4 text-primary" />}
                    {p.titulo}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.detalhe}</p>
                  {p.dica && (
                    <p className="mt-2 rounded-xl bg-accent/30 px-3 py-1.5 text-xs">💡 {p.dica}</p>
                  )}
                </div>
              </li>
            );
          })}
        </motion.ol>

        {/* CTAs finais por modo */}
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {modo === "familia" && (
            <Link to="/comecar" className="sm:col-span-3">
              <ChunkyButton className="w-full">
                Começar agora (1 minuto) <ArrowRight className="ml-1 inline h-5 w-5" />
              </ChunkyButton>
            </Link>
          )}
          {modo === "professor" && (
            <>
              <Link to="/auth">
                <ChunkyButton className="w-full">
                  Criar conta de professor <ArrowRight className="ml-1 inline h-5 w-5" />
                </ChunkyButton>
              </Link>
              <Link to="/escola">
                <ChunkyButton tone="secondary" className="w-full">
                  Já tenho conta — abrir painel
                </ChunkyButton>
              </Link>
              <Link to="/escolas">
                <ChunkyButton tone="secondary" className="w-full">
                  Ver o plano para escolas
                </ChunkyButton>
              </Link>
            </>
          )}
          {modo === "instituicao" && (
            <>
              <Link to="/escolas">
                <ChunkyButton className="w-full">
                  Pedir proposta institucional <ArrowRight className="ml-1 inline h-5 w-5" />
                </ChunkyButton>
              </Link>
              <Link to="/auth">
                <ChunkyButton tone="secondary" className="w-full">
                  Criar conta da direção
                </ChunkyButton>
              </Link>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  "Olá! Sou da direção de uma instituição e quero agendar a demo do Kidoz. Chamamo-nos…",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-success/50 bg-success/15 px-5 font-display text-base text-success hover:bg-success/25"
              >
                <MessageCircle className="h-5 w-5" /> Falar com a equipa
              </a>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          🔒 Sem anúncios · 🚫 Sem venda de dados · 💳 Cancela quando quiseres · 👪 Conforme RGPD e
          COPPA
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
