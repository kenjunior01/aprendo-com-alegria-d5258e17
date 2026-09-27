import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, CreditCard, Truck, RotateCcw, MessageCircle } from "lucide-react";
import { loadProfile, type Profile } from "@/lib/storage";
import { isPremiumActive } from "@/lib/premium";

/**
 * Banner de vantagens Premium para as rotas da loja (/merch, /produto).
 * Membro: reforça o benefício (itens exclusivos mensais).
 * Não membro: oportunidade de conversão — o Premium inclui itens exclusivos.
 */
export function MerchPremiumPerk({ className = "" }: { className?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const premium = isPremiumActive(profile);

  return (
    <aside
      aria-label="Vantagens Premium na loja"
      className={`card-chunky flex flex-col items-center gap-3 rounded-3xl border-2 p-4 sm:flex-row sm:text-left ${
        premium
          ? "border-primary/50 bg-gradient-to-br from-primary/15 to-accent/10"
          : "border-amber-400/50 bg-gradient-to-br from-amber-400/15 to-yellow-300/10"
      } ${className}`}
    >
      <Crown className={`h-8 w-8 shrink-0 ${premium ? "text-primary" : "text-amber-500"}`} />
      {premium ? (
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display text-base leading-snug">Vantagem de membro Premium 👑</p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Tens direito a itens exclusivos da loja todos os meses e acesso antecipado a novos
            artigos. Boa escolha!
          </p>
        </div>
      ) : (
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display text-base leading-snug">
            Os membros Kidoz Premium ganham itens exclusivos da loja 🎁
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            O plano Família inclui um item especial todos os meses — para além do Mundo Premium, do
            Tutor IA e dos Desafios Infinitos.
          </p>
        </div>
      )}
      {!premium && (
        <Link
          to="/premium"
          className="shrink-0 rounded-2xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Ver planos desde 3,33€/mês
        </Link>
      )}
    </aside>
  );
}

const TRUST_ITEMS = [
  { icon: CreditCard, label: "Pagamento seguro" },
  { icon: Truck, label: "Envio Portugal & PALOP" },
  { icon: RotateCcw, label: "Devolução 14 dias" },
  { icon: MessageCircle, label: "Suporte em português" },
];

/** Faixa de confiança para a loja — reduz hesitação na primeira compra. */
export function MerchTrustStrip({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Confiança na loja"
      className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`}
    >
      {TRUST_ITEMS.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 px-3 py-2.5 text-center"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-display text-xs sm:text-sm">{t.label}</span>
          </div>
        );
      })}
    </section>
  );
}
