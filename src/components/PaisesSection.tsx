// PaisesSection — «Um só produto, cinco realidades» em /escolas.
// Mostra COMO o Kidoz se adapta a cada país (sistema de ensino, naming das
// classes, moeda local nos exercícios, cultura) com uma amostra de ficha por
// país. Honesto: o que já está ativo e o que está a chegar — fundadoras de
// cada país votam nas prioridades do roteiro.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Coins, MapPin, TrendingUp } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";

type PaisId = "pt" | "mz" | "ao" | "cv" | "br";

interface PaisInfo {
  flag: string;
  nome: string;
  sistema: string;
  expansao: string;
  moeda: string;
  exemplo: string;
  exemploRes: string;
  exemploPort: string;
  exemploPortRes: string;
  cultura: string;
  culturaAtivo: boolean;
}

const PAISES: Record<PaisId, PaisInfo> = {
  pt: {
    flag: "🇵🇹",
    nome: "Portugal",
    sistema: "1.º ciclo — 1.º a 4.º ano",
    expansao: "a expandir até ao 6.º ano",
    moeda: "€ (euro)",
    exemplo: "3 € + 4 € =",
    exemploRes: "7 €",
    exemploPort: "telemóvel",
    exemploPortRes: "te-le-mó-vel",
    cultura: "Termos e contexto português em todos os exercícios",
    culturaAtivo: true,
  },
  mz: {
    flag: "🇲🇿",
    nome: "Moçambique",
    sistema: "Ensino primário — 1.ª a 4.ª classe",
    expansao: "a expandir até à 7.ª classe",
    moeda: "MT (metical)",
    exemplo: "5 MT + 4 MT =",
    exemploRes: "9 MT",
    exemploPort: "capulana",
    exemploPortRes: "ca-pu-la-na",
    cultura: "50+ perguntas de cultura moçambicana nos Desafios",
    culturaAtivo: true,
  },
  ao: {
    flag: "🇦🇴",
    nome: "Angola",
    sistema: "Ensino primário — 1.ª a 4.ª classe",
    expansao: "a expandir até à 6.ª classe",
    moeda: "Kz (kwanza)",
    exemplo: "10 Kz + 15 Kz =",
    exemploRes: "25 Kz",
    exemploPort: "candongueiro",
    exemploPortRes: "can-don-guei-ro",
    cultura: "Contexto angolano nos exercícios e desafios",
    culturaAtivo: false,
  },
  cv: {
    flag: "🇨🇻",
    nome: "Cabo Verde",
    sistema: "Ensino básico — 1.º a 4.º ano",
    expansao: "a expandir gradualmente",
    moeda: "Esc (escudo)",
    exemplo: "100 Esc + 50 Esc =",
    exemploRes: "150 Esc",
    exemploPort: "coladeira",
    exemploPortRes: "co-la-dei-ra",
    cultura: "Contexto cabo-verdiano nos exercícios e desafios",
    culturaAtivo: false,
  },
  br: {
    flag: "🇧🇷",
    nome: "Brasil",
    sistema: "Fundamental I — 1.º a 4.º ano",
    expansao: "a expandir até ao 5.º ano",
    moeda: "R$ (real)",
    exemplo: "R$ 4 + R$ 3 =",
    exemploRes: "R$ 7",
    exemploPort: "ônibus",
    exemploPortRes: "ô-ni-bus",
    cultura: "Contexto brasileiro nos exercícios e desafios",
    culturaAtivo: false,
  },
};

const IDS = Object.keys(PAISES) as PaisId[];

export function PaisesSection() {
  const [pais, setPais] = useState<PaisId>("pt");
  const p = PAISES[pais];

  return (
    <section className="mt-8">
      <div className="text-center">
        <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
          Feito para cada país
        </p>
        <h2 className="mt-1 font-display text-2xl">Um só produto, cinco realidades</h2>
        <p className="mx-auto mt-1 max-w-[42rem] text-sm text-muted-foreground">
          O Kidoz adapta-se ao sistema de ensino, à moeda, às palavras e à cultura de cada país — as
          fichas acima já saem com a realidade da tua escola. Escolhe e vê como.
        </p>
      </div>

      <div className="card-chunky mt-4 rounded-3xl border-2 border-border bg-card p-4 sm:p-6">
        {/* Tabs de país */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Escolher país"
        >
          {IDS.map((id) => {
            const c = PAISES[id];
            const active = pais === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPais(id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 font-display text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                <span aria-hidden>{c.flag}</span>
                <span className="hidden sm:inline">{c.nome}</span>
                <span className="sm:hidden">{id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pais}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mt-5 grid gap-4 sm:grid-cols-[1fr_14rem]"
          >
            {/* Informação do país */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 rounded-2xl border-2 border-border bg-background p-3.5">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-bold">
                    {p.flag} {p.nome} · {p.sistema}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 inline h-3 w-3" />
                    {p.expansao} — Escolas Fundadoras do país votam nas prioridades.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border-2 border-border bg-background p-3.5">
                <Coins className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-bold">Moeda local: {p.moeda}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Exercícios e fichas de dinheiro usam preços reais do dia a dia das crianças.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border-2 border-border bg-background p-3.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-bold">
                    Cultura no conteúdo{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        p.culturaAtivo
                          ? "bg-success/15 text-success"
                          : "bg-amber-400/20 text-amber-700"
                      }`}
                    >
                      {p.culturaAtivo ? "Ativo" : "A chegar"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.cultura}</p>
                </div>
              </div>
            </div>

            {/* Amostras de fichas (dinheiro + português) */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-full max-w-[13rem] rounded-xl border-2 border-border bg-white p-3.5 text-[#111827] shadow-md">
                <p className="text-[9px] font-bold text-gray-500">AMOSTRA · FICHA DE DINHEIRO</p>
                <p className="mt-0.5 text-[9px] text-gray-500">{p.nome} · kidoz.online</p>
                <div className="mt-2 rounded-lg border border-gray-300 p-3 text-center">
                  <p className="font-display text-lg font-bold">{p.exemplo}</p>
                  <div className="mt-3 border-b border-gray-400" />
                  <p className="mt-1 text-right text-[9px] text-gray-400">
                    solução: {p.exemploRes}
                  </p>
                </div>
                <p className="mt-2 text-center text-[8px] text-gray-400">
                  20 exercícios por ficha · soluções incluídas
                </p>
              </div>
              <div className="w-full max-w-[13rem] rounded-xl border-2 border-border bg-white p-3.5 text-[#111827] shadow-md">
                <p className="text-[9px] font-bold text-gray-500">AMOSTRA · FICHA DE PORTUGUÊS</p>
                <p className="mt-0.5 text-[9px] text-gray-500">Sílabas · {p.nome}</p>
                <div className="mt-2 rounded-lg border border-gray-300 p-3 text-center">
                  <p className="font-display text-lg font-bold">{p.exemploPort}</p>
                  <div className="mt-3 border-b border-gray-400" />
                  <p className="mt-1 text-right text-[9px] text-gray-400">
                    solução: {p.exemploPortRes}
                  </p>
                </div>
                <p className="mt-2 text-center text-[8px] text-gray-400">
                  Palavras da rua do teu país nas fichas
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Preço único em todos os países:{" "}
          <span className="font-bold text-primary">0,99 € por aluno/mês</span>. Outros países
          (Guiné-Bissau, São Tomé, Timor)? Fala connosco — abrimos por procura das escolas.
        </p>
      </div>

      <div className="mt-4 text-center">
        <a href="#fundador">
          <ChunkyButton className="min-h-[52px] px-8">Quero o Kidoz na minha escola →</ChunkyButton>
        </a>
      </div>
    </section>
  );
}
