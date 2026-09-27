// PremiumUpsell — cartão de conversão no fim de lição (momento de pico).
// Aparece só para quem NÃO é premium, depois de 2+ lições completas
// (já provou o produto) e no máximo 1× por dia — não incomoda, mas
// transforma entusiasmo em subscrição ou em convites (loop viral).

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Crown, Gift } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { isPremiumActive, premiumDaysLeft } from "@/lib/premium";
import { loadProfile } from "@/lib/storage";

const LAST_SHOWN_KEY = "kidoz-upsell-lesson-last";

function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  const p = loadProfile();
  if (!p) return false;
  if (isPremiumActive(p)) return false;
  // Só depois de provar o produto: 2+ lições completas.
  if (p.completedLessons.length < 2) return false;
  try {
    const last = localStorage.getItem(LAST_SHOWN_KEY);
    const today = new Date().toISOString().slice(0, 10);
    if (last === today) return false;
    return true;
  } catch {
    return false;
  }
}

function markShown() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    /* noop */
  }
}

export function PremiumUpsell() {
  const [visible, setVisible] = useState(false);
  const [inviteOnly, setInviteOnly] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (!shouldShow()) return;
    const p = loadProfile();
    const invite = Boolean(p && !p.isPremium && isPremiumActive(p));
    setInviteOnly(invite);
    setDaysLeft(premiumDaysLeft(p));
    markShown();
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.6 }}
      className="relative w-full max-w-[28rem] overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/15 to-amber-400/25 p-5 text-center"
    >
      <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">
        desbloqueia o próximo nível
      </p>
      <h2 className="mt-1 font-display text-xl">O Mundo Premium espera por ti 🌀</h2>
      {inviteOnly ? (
        <p className="mx-auto mt-1.5 max-w-[26rem] text-sm text-muted-foreground">
          O teu prémio de convites acaba em{" "}
          <b className="text-amber-600">
            {daysLeft} dia{daysLeft === 1 ? "" : "s"}
          </b>
          . Convida mais amigos e continua a jogar os 5 reinos sem parar!
        </p>
      ) : (
        <p className="mx-auto mt-1.5 max-w-[26rem] text-sm text-muted-foreground">
          5 reinos mágicos, criaturas colecionáveis, Bazar dos Cristais e missões diárias com streak
          🔥 — só no Premium, desde <b>3,33€/mês</b>.
        </p>
      )}
      <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {inviteOnly ? (
          <Link to="/convites" className="w-full sm:w-auto">
            <ChunkyButton className="w-full min-h-[50px] sm:w-auto">
              <Gift className="mr-1 inline h-5 w-5" /> Convidar & ganhar dias
            </ChunkyButton>
          </Link>
        ) : (
          <>
            <Link to="/premium" className="w-full sm:w-auto">
              <ChunkyButton className="w-full min-h-[50px] sm:w-auto">
                <Crown className="mr-1 inline h-5 w-5" /> Ver planos Premium
              </ChunkyButton>
            </Link>
            <Link to="/convites" className="w-full sm:w-auto">
              <ChunkyButton tone="secondary" className="w-full min-h-[50px] sm:w-auto">
                <Gift className="mr-1 inline h-5 w-5" /> Ou convita 3 amigos 🎁
              </ChunkyButton>
            </Link>
          </>
        )}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        👨‍👩‍👧 Decisão dos pais · cancela quando quiseres · sem anúncios
      </p>
    </motion.section>
  );
}
