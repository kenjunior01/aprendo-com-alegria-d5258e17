import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { ChunkyButton } from "@/components/ChunkyButton";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import {
  HelpCircle, BookOpen, Gamepad2, GraduationCap, Camera,
  Mail, Accessibility, ChevronDown, ChevronUp, MessageCircle,
  Lightbulb, Shield, Eye, Volume2, Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda — Alegria" },
      { name: "description", content: "Página de ajuda do Alegria: perguntas frequentes, como usar cada funcionalidade e informação de acessibilidade." },
      { property: "og:title", content: "Ajuda — Alegria" },
      { property: "og:description", content: "Perguntas frequentes, como usar cada funcionalidade e informação de acessibilidade." },
      { property: "og:url", content: "https://alegria.online/ajuda" },
    ],
    links: [
      { rel: "canonical", href: "https://alegria.online/ajuda" },
    ],
  }),
  component: AjudaPage,
});

/* ─── FAQ Data ─── */

interface FAQItem {
  question: string;
  answer: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const FAQ_CHILDREN: FAQItem[] = [
  {
    question: "Como começam as missões?",
    answer: "No caminho de aventura (página Início), cada bolinha colorida é uma missão. A bolinha que está a piscar é a missão atual — carrega nela para começar! As missões bloqueadas abrem-se quando completas as anteriores.",
    icon: Gamepad2,
  },
  {
    question: "O que são Abracadinhos?",
    answer: "Abracadinhos são as moedas do Alegria! Ganhas 3 Abracadinhos por cada resposta certa, e 10 bónus se completas uma missão sem erros. Usa-os na Loja para comprar chapéus, fatos e cenários para a tua mascote.",
    icon: Lightbulb,
  },
  {
    question: "Como funciona o Tutor?",
    answer: "O Tutor é a tua mascote que te ajuda a entender melhor. Quando erras uma resposta, o Tutor explica-te o porquê de forma simples. Também pode pedir ao Tutor para te ajudar com temas específicos, como a tabuada ou as vogais.",
    icon: GraduationCap,
  },
  {
    question: "Como leio em voz alta?",
    answer: "Na página Ler, escolhe um texto do teu ano escolar. O Alegria lê primeiro, e depois é a tua vez! Carrega no botão do microfone para gravar a tua leitura. A mascote vai dar-te feedback e celebrar quando lês bem.",
    icon: BookOpen,
  },
  {
    question: "O que é a Realidade Aumentada?",
    answer: "Com a Realidade Aumentada (RA), podes ver a tua mascote no mundo real! Carrega no botão RA e a mascote aparece na câmara do teu dispositivo, como se estivesse ali com vocês. Pode tirar fotos e partilhar com a família!",
    icon: Camera,
  },
  {
    question: "O que significa a sequência (🔥)?",
    answer: "A sequência mostra quantos dias seguidos jogaste no Alegria. Se jogares todos os dias, a sequência aumenta! Quanto maior a sequência, mais forte fica a tua mascote. Não quebras a sequência — jogas pelo menos uma missão por dia!",
  },
  {
    question: "Como brinco com a mascote?",
    answer: "Carrega em 'O Meu Amigo' na barra de navegação para entrar no Quarto da mascote. Podes dar-lhe comida, brincar, ensinar e conversar. A mascote precisa de tua atenção — quando está feliz, cresce e fica mais forte!",
    icon: MessageCircle,
  },
  {
    question: "Perdi um coração, como recupero?",
    answer: "Quando erras uma resposta, perdes um coração. Mas não te preocupes! Completa uma missão e ganhas um coração de volta. Se completas uma missão sem erros, recuperas dois. O máximo de corações é 5.",
  },
];

const FAQ_PARENTS: FAQItem[] = [
  {
    question: "Como acedo ao painel de pais?",
    answer: "Cria uma conta de pai/mãe na página de autenticação. Depois, acede ao Painel de Pais onde puedes ver o progresso do teu filho/a, configurar limites de tempo diário, hora de dormir e proteger com PIN. Também pode conectar-se a várias crianças.",
    icon: Shield,
  },
  {
    question: "O que é o Premium?",
    answer: "O Premium Alegria dá acesso a conteúdo extra: mais missões, cenários exclusivos para a mascote, relatórios detalhados para pais, e realidade aumentada sem limites. O Premium ajuda a manter a plataforma livre de publicidade para todas as crianças.",
    icon: GraduationCap,
  },
  {
    question: "Como configurar limites de tempo?",
    answer: "No Painel de Pais, acede às 'Controles Parentais'. Podes definir o tempo máximo de uso por dia (ex.: 30 min) e a hora de dormir, quando o Alegria bloqueia automaticamente. O PIN parental impede que a criança altere estas configurações.",
  },
  {
    question: "Os dados do meu filho/a estão seguros?",
    answer: "Sim! O Alegria segue as melhores práticas de proteção de dados para crianças. Não recolhemos dados pessoais além do nome e idade (necessários para adaptar o conteúdo). Não há publicidade, não há partilha com terceiros, e todos os dados são encriptados. Cumprimos o RGPD europeu.",
    icon: Shield,
  },
  {
    question: "O Alegria está adaptado ao currículo português?",
    answer: "Sim! Todo o conteúdo segue o currículo do 1.º ciclo do ensino básico em Portugal (Português, Matemática e Estudo do Meio). As missões estão organizadas por ano escolar (1.º ao 4.º) e adaptam-se ao nível da criança.",
    icon: BookOpen,
  },
];

/* ─── Accessibility Info ─── */

const ACCESSIBILITY_ITEMS = [
  { icon: Eye, title: "Alto Contraste", desc: "O Alegria usa cores vibrantes e contrasto elevado para facilitar a leitura. Podes ajustar o tamanho do texto nas configurações do teu dispositivo." },
  { icon: Volume2, title: "Leitura em Voz Alta", desc: "Todos os textos podem ser lidos pela mascote em português de Portugal. Carrega no ícone de som para ativar/desativar." },
  { icon: Keyboard, title: "Navegação por Teclado", desc: "Todas as funcionalidades do Alegria podem ser acessadas usando apenas o teclado. Usa Tab para navegar e Enter para seleccionar." },
  { icon: Accessibility, title: "Etiquetas de Acessibilidade", desc: "Todos os ícones e botões têm etiquetas descritivas (aria-label) para leitores de screen. As imagens decorativas são marcadas como aria-hidden." },
];

/* ─── FAQ Accordion ─── */

function FAQAccordion({ items, title }: { items: FAQItem[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mb-8">
      <h2 className="mb-4 font-display text-xl sm:text-2xl">{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              className="card-chunky rounded-2xl border-2 border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
                aria-expanded={isOpen}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
                <span className="flex-1 font-display text-sm sm:text-base">{item.question}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
              </button>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 pb-4"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Main Page ─── */

function AjudaPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      setProfile(p);
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Use a guest-style fallback if no profile yet
  const displayProfile = profile ?? {
    name: "amigo",
    age: 7,
    grade: 1,
    mascot: "owl" as const,
    xp: 0,
    coins: 0,
    gems: 0,
    streak: 0,
    hearts: 5,
    lastPlayed: "",
    completedLessons: [],
    ownedItems: [],
    equippedItem: null,
    isPremium: false,
    role: "child" as const,
    createdAt: new Date().toISOString(),
    hunger: 80,
    energy: 100,
    fun: 90,
    knowledge: 50,
    unlockedStickers: [],
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={displayProfile} />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <HelpCircle className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Ajuda</h1>
          <p className="text-muted-foreground">
            Encontras aqui as respostas às tuas perguntas sobre o Alegria ✨
          </p>
        </motion.header>

        {/* FAQ for Children */}
        <FAQAccordion items={FAQ_CHILDREN} title="🧒 Perguntas para crianças" />

        {/* FAQ for Parents */}
        <FAQAccordion items={FAQ_PARENTS} title="👨‍👩‍👧 Perguntas para pais e mães" />

        {/* How to use each feature */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-display text-xl sm:text-2xl">🎮 Como usar cada funcionalidade</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { emoji: "🗺️", title: "Missões", desc: "Completa missões no caminho de aventura para ganhar XP, Abracadinhos e corações.", to: "/app" },
              { emoji: "🧑‍🏫", title: "Tutor", desc: "Pede ajuda à mascote sobre qualquer tema — ela explica de forma simples e divertida.", to: "/tutor" },
              { emoji: "📖", title: "Leitura", desc: "Pratica leitura em voz alta com textos adaptados ao teu ano escolar.", to: "/leitura" },
              { emoji: "🥽", title: "Realidade Aumentada", desc: "Vê a mascote no mundo real através da câmara do teu dispositivo!", to: "/ra" },
              { emoji: "🛍️", title: "Loja", desc: "Usa Abracadinhos para personalizar a tua mascote com chapéus e fatos.", to: "/loja" },
              { emoji: "🏠", title: "Quarto da Mascote", desc: "Interage com a mascote: dá comida, brinca e conversa!", to: "/amigo" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="card-chunky rounded-2xl border-2 border-border bg-card p-4 transition-transform active:scale-[0.97]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-display text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Accessibility */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-display text-xl sm:text-2xl">♿ Acessibilidade</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            O Alegria está construído para ser acessível a todas as crianças. Aqui estão as funcionalidades que tornam a experiência mais inclusiva:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACCESSIBILITY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm sm:text-base">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-display text-xl sm:text-2xl">📬 Contacto</h2>
          <div className="card-chunky rounded-2xl border-2 border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display text-base">Precisas de ajuda?</h3>
                <p className="text-sm text-muted-foreground">Escreve-nos e respondemos em até 48 horas.</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-semibold">E-mail geral:</span>
                <a href="mailto:creches@alegria.online" className="text-primary underline">creches@alegria.online</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="font-semibold">E-mail suporte:</span>
                <a href="mailto:suporte@alegria.online" className="text-primary underline">suporte@alegria.online</a>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Back button */}
        <div className="mt-6">
          <Link to="/app">
            <ChunkyButton className="w-full">← Voltar à aventura</ChunkyButton>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
