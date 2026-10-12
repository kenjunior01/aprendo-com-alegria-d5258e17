import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { isPremiumActive, referralPremiumActive } from "@/lib/premium";
import type { Profile } from "@/lib/storage";

/**
 * Fonte de verdade do acesso Premium nos GATES duros (portal, RA, trilhas
 * premium, loja).
 *
 * - Com conta: assinatura/trial/admin validados na cloud (tabela subscriptions;
 *   só o servidor escreve, via webhook Stripe / capture PayPal). O isPremium
 *   local é apenas um reflexo da cloud e nunca desbloqueia por si só
 *   (anti-tamper: editar localStorage não dá Premium).
 * - Sem conta: apenas o Premium temporário de convites (premiumUntil local,
 *   de curta duração).
 */
export function usePremiumAccess(profile: Profile | null | undefined): boolean {
  const { user } = useAuth();
  const { isActive, loading } = useSubscription();
  if (!user) return referralPremiumActive(profile);
  // Enquanto a cloud responde, usa o reflexo local (preenchido no sign-in pelo pull).
  if (loading) return isPremiumActive(profile);
  return isActive || referralPremiumActive(profile);
}
