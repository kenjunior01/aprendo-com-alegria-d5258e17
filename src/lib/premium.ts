// Estrutura Freemium — sem pagamentos reais ainda.
// Marca features/conteúdos como premium e expõe helpers para verificar acesso.
// Suporta Premium temporário (ganho por convites de amigos) via premiumUntil.

import { loadProfile, updateProfile, type Profile } from "./storage";

export interface PremiumPlan {
  id: "free" | "family" | "school";
  name: string;
  price: string;
  priceLabel: string;
  highlight?: boolean;
  perks: string[];
  cta: string;
}

export const PLANS: PremiumPlan[] = [
  {
    id: "free",
    name: "Grátis",
    price: "0€",
    priceLabel: "para sempre",
    perks: [
      "Aventura completa do 1.º ao 4.º ano",
      "5 mascotes e gamificação",
      "Painel de pais básico",
      "Conquistas e medalhas",
    ],
    cta: "Já estás no plano grátis",
  },
  {
    id: "family",
    name: "Família Premium",
    price: "4,99€",
    priceLabel: "/mês",
    highlight: true,
    perks: [
      "🚀 Itens premium na loja (fato astronauta, castelo…)",
      "🥽 Realidade Aumentada com mascotes",
      "🤖 Tutor IA com explicações detalhadas",
      "📊 Relatórios semanais por email aos pais",
      "👨‍👩‍👧 Até 3 perfis de criança",
      "Sem limites diários de leitura por voz",
    ],
    cta: "Tornar-me Premium",
  },
  {
    id: "school",
    name: "Escolas",
    price: "Sob consulta",
    priceLabel: "por turma",
    perks: [
      "Painel de turma para professores",
      "Relatórios por aluno e exportação",
      "Currículo alinhado com as Aprendizagens Essenciais",
      "Suporte dedicado",
    ],
    cta: "Falar connosco",
  },
];

export const isPremium = (p?: Profile | null): boolean => Boolean(p?.isPremium);

/** Premium permanente OU temporário (prémio de convites) ainda válido. */
export const isPremiumActive = (p?: Profile | null): boolean => {
  if (!p) return false;
  if (p.isPremium) return true;
  if (!p.premiumUntil) return false;
  try {
    return new Date(p.premiumUntil).getTime() > Date.now();
  } catch {
    return false;
  }
};

/** Dias restantes do Premium temporário (0 se não aplicável). */
export const premiumDaysLeft = (p?: Profile | null): number => {
  if (!p?.premiumUntil) return 0;
  try {
    const ms = new Date(p.premiumUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  } catch {
    return 0;
  }
};

/** Oferece N dias de Premium (convites, eventos, prémios). Não encolhe o prazo atual. */
export const grantPremiumDays = (days: number): Profile => {
  const current = loadProfile();
  if (!current) return updateProfile({ isPremium: true });
  const base =
    current.premiumUntil && new Date(current.premiumUntil).getTime() > Date.now()
      ? new Date(current.premiumUntil).getTime()
      : Date.now();
  const until = new Date(base + days * 86_400_000).toISOString();
  return updateProfile({ premiumUntil: until });
};

/** Atalho para o hook de gating em toda a app. */
export const hasPremiumAccess = (): boolean => isPremiumActive(loadProfile());

// Activa a assinatura simulada (sem pagamento real).
// Em produção, isto seria feito por um webhook do Paddle/Stripe.
export const startTrialPremium = (): Profile => {
  return updateProfile({ isPremium: true });
};

export const cancelPremium = (): Profile => {
  return updateProfile({ isPremium: false });
};
