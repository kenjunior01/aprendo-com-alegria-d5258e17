// ParentPremiumCard — cartão de conversão no Painel de Pais.
// Os pais são quem paga: este cartão traduz as funcionalidades premium
// em benefícios que eles valorizam (relatórios, controlo, currículo),
// com o plano Família em destaque e o caminho "convitar" como alternativa.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Crown, Gift } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { isPremiumActive, premiumDaysLeft } from "@/lib/premium";
import { loadProfile } from "@/lib/storage";

export function ParentPremiumCard() {
  const [premium, setPremium] = useState<boolean | null>(null);
  const [invite, setInvite] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const p = loadProfile();
    const active = isPremiumActive(p);
    setPremium(active);
    setInvite(Boolean(p && !p.isPremium && active));
    setDaysLeft(premiumDaysLeft(p));
  }, []);

  // null = ainda a carregar; true = já é premium (nada a mostrar)
  if (premium === null || premium) return null;

  if (invite) {
    return (
      <section className="card-chunky rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/15 to-orange-400/10 p-5">
        <div className="flex items-start gap-3">
          <Gift className="mt-0.5 h-7 w-7 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg">
              Premium de convite — {daysLeft} dia{daysLeft === 1 ? "" : "s"} restantes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Este acesso chegou pelos convites do seu filho. Para não perder o Mundo Premium e os
              relatórios semanais, pode subscrever — ou continuar a convidar: cada 3 amigos = +7
              dias.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link to="/premium" className="flex-1">
                <ChunkyButton className="w-full">
                  <Crown className="mr-1 inline h-4 w-4" /> Garantir 4,99€/mês
                </ChunkyButton>
              </Link>
              <Link to="/convites" className="flex-1">
                <ChunkyButton tone="secondary" className="w-full">
                  <Gift className="mr-1 inline h-4 w-4" /> Convidar mais
                </ChunkyButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card-chunky rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/15 p-5">
      <div className="flex items-start gap-3">
        <Crown className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg">Kidoz Família Premium — 4,99€/mês</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O que o seu filho ganha (e o que você controla) com o plano completo:
          </p>
          <ul className="mt-2.5 space-y-1.5 text-sm">
            {[
              "🌀 O Mundo Premium: 5 reinos com missões diárias e progresso real",
              "📊 Relatórios semanais de precisão, minutos e disciplinas",
              "⏱️ Limites de tempo e hora de dormir, geridos com PIN",
              "👨‍👩‍👧 Até 4 crianças · 🥽 Realidade Aumentada · 🤖 Tutor IA detalhado",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Anual: 39,99€ (poupa 33%) · Sem anúncios · Cancela quando quiser
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Link to="/premium" className="flex-1">
              <ChunkyButton className="w-full">Ver planos e subscrever</ChunkyButton>
            </Link>
            <Link to="/convites" className="flex-1">
              <ChunkyButton tone="secondary" className="w-full">
                <Gift className="mr-1 inline h-4 w-4" /> Ou ganhar com convites
              </ChunkyButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
