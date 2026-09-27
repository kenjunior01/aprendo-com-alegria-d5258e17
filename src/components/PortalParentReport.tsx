// PortalParentReport — "Mundo Premium" no Painel de Pais.
// Mostra aos pais o que o filho anda a fazer no Mundo Kidoz Premium
// (/portal): estrelas por reino, streak de missões, cristais, criaturas
// e títulos — com nota pedagógica por reino, para o valor ficar óbvio.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, Sparkles } from "lucide-react";
import { loadProfile, type Profile } from "@/lib/storage";
import { isPremiumActive, premiumDaysLeft } from "@/lib/premium";
import { REALMS, loadPortalState, type PortalState } from "@/lib/premiumWorld";
import { loadPortalDaily } from "@/lib/portalDaily";

/** Nota pedagógica por reino — o que cada um treina, em linguagem de pais. */
const REALM_PEDAGOGY: Record<string, string> = {
  vulcao: "Cálculo mental e tabuadas sob pressão — a lava sobe a cada erro.",
  galaxia: "Ciências, geografia e história numa viagem espacial.",
  lab: "Curiosidade científica: poções = perguntas de natureza e experimentação.",
  castelo: "Gramática e ortografia — acertar acende as janelas do castelo.",
  dragao: "Desafio final transversal: matemática, português, ciência e mundo.",
};

function StarPips({ stars }: { stars: number[] }) {
  return (
    <div className="flex gap-1" aria-label={`${stars.reduce((a, b) => a + b, 0)} de 9 estrelas`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className={`inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-[10px] font-bold ${
            s > 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {s === 0 ? "☆" : "★".repeat(s)}
        </span>
      ))}
    </div>
  );
}

export function PortalParentReport() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState<PortalState | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setProfile(loadProfile());
    const ps = loadPortalState();
    setState(ps);
    setStreak(loadPortalDaily().streak);
  }, []);

  if (!profile) return null;

  const starsTotal = REALMS.reduce(
    (sum, r) => sum + (state?.stars[r.id] ?? [0, 0, 0]).reduce((a, b) => a + b, 0),
    0,
  );
  const creatures = state?.creatures.length ?? 0;
  const hasActivity =
    starsTotal > 0 ||
    creatures > 0 ||
    (state?.crystals ?? 0) > 0 ||
    (state?.dragonSlain ?? 0) > 0 ||
    (state?.lastPlayed ?? null) !== null;

  const premiumActive = isPremiumActive(profile);
  const daysLeft = premiumDaysLeft(profile);
  const invitePremium = !profile.isPremium && premiumActive;

  return (
    <section className="card-chunky rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Mundo Premium
        </h2>
        {premiumActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            <Crown className="h-3.5 w-3.5" />
            {invitePremium
              ? `Convite — ${daysLeft} dia${daysLeft === 1 ? "" : "s"} restantes`
              : "Premium Família ativo"}
          </span>
        ) : (
          <Link
            to="/premium"
            className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Plano Grátis — ver Premium
          </Link>
        )}
      </div>

      {!hasActivity ? (
        <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Ainda sem aventuras no Mundo Premium 🗺️</p>
          <p className="mt-1">
            O Mundo Premium é o modo aventura do Kidoz: 5 reinos que treinam cálculo mental,
            leitura, ciências e raciocínio — com estrelas, criaturas e missões diárias que criam o
            hábito de estudar todos os dias.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            O modo aventura exclusivo: cada reino transforma matérias escolares num jogo com
            objetivos, recompensas e missões diárias.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-center">
              <div className="font-display text-2xl text-amber-600">⭐ {starsTotal}</div>
              <div className="text-[11px] font-medium text-muted-foreground">de 45 estrelas</div>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-center">
              <div className="font-display text-2xl text-orange-600">🔥 {streak}</div>
              <div className="text-[11px] font-medium text-muted-foreground">
                dias de missões seguidas
              </div>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-center">
              <div className="font-display text-2xl text-sky-600">✦ {state?.crystals ?? 0}</div>
              <div className="text-[11px] font-medium text-muted-foreground">
                cristais ganhos a estudar
              </div>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3 text-center">
              <div className="font-display text-2xl text-violet-600">🐾 {creatures}/6</div>
              <div className="text-[11px] font-medium text-muted-foreground">
                criaturas colecionadas
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {REALMS.map((r) => {
              const stars = state?.stars[r.id] ?? [0, 0, 0];
              const done = stars.reduce((a, b) => a + b, 0) > 0;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">
                      {r.emoji} {r.name}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {REALM_PEDAGOGY[r.id]}
                    </div>
                  </div>
                  <StarPips stars={done ? stars : [0, 0, 0]} />
                </div>
              );
            })}
          </div>

          {(state?.titles.length ?? 0) > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              🏅 Títulos de Lenda: {state?.titles.join(" · ")}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            💡 Cada estrela representa uma partida com 60%+ de respostas certas — o Mundo premia
            precisão, não tempo de ecrã.
          </p>
        </>
      )}
    </section>
  );
}
