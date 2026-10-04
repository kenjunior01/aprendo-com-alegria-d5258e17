// HomeMiniDemo — mini-experimento interativo na landing, sem registo.
// A prova nº1 de que o conteúdo é "do meu país": as perguntas mudam com o
// seletor de país — dinheiro com a moeda local e sílabas com palavras da
// realidade de cada um (telemóvel PT, capulana MZ, candongueiro AO,
// coladeira CV, ônibus BR). Estilo Duolingo: errar não pune, só convida
// a tentar outra vez — e no fim, o CTA natural para criar perfil.

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChunkyButton } from "@/components/ChunkyButton";
import { Link } from "@tanstack/react-router";

type PaisDemo = "PT" | "MZ" | "AO" | "CV" | "BR";

// Palavra local (com nº de sílabas) + símbolo da moeda, por país.
const LOCAL: Record<PaisDemo, { moeda: string; palavra: string; silabas: number }> = {
  PT: { moeda: "€", palavra: "telemóvel", silabas: 4 },
  MZ: { moeda: "MT", palavra: "capulana", silabas: 4 },
  AO: { moeda: "Kz", palavra: "candongueiro", silabas: 4 },
  CV: { moeda: "Esc", palavra: "coladeira", silabas: 4 },
  BR: { moeda: "R$", palavra: "ônibus", silabas: 3 },
};

type Pergunta = {
  disc: "Matemática" | "Português";
  tema: string;
  texto: string;
  opcoes: string[];
  correta: number; // índice da opção certa
};

function perguntasDe(pais: PaisDemo): Pergunta[] {
  const { moeda, palavra, silabas } = LOCAL[pais];
  return [
    {
      disc: "Matemática",
      tema: "Dinheiro",
      texto: `Maria tem 3 ${moeda} e o pai dá-lhe mais 2. Quantos ${moeda} tem agora?`,
      opcoes: ["4", "5", "6"],
      correta: 1,
    },
    {
      disc: "Português",
      tema: "Sílabas",
      texto: `Quantas sílabas tem «${palavra}»?`,
      opcoes: [String(silabas - 1), String(silabas), String(silabas + 1)],
      correta: 1,
    },
    {
      disc: "Matemática",
      tema: "Sequências",
      texto: "Continua a sequência: 2, 4, 6, …",
      opcoes: ["7", "8", "10"],
      correta: 1,
    },
    {
      disc: "Português",
      tema: "Sílabas",
      texto: "«bo-la» tem quantas sílabas?",
      opcoes: ["1", "2", "3"],
      correta: 1,
    },
    {
      disc: "Matemática",
      tema: "Troco",
      texto: `Pagas 5 ${moeda} por um brinquedo de 3 ${moeda}. O troco é…`,
      opcoes: ["1", "2", "3"],
      correta: 1,
    },
  ];
}

export function HomeMiniDemo({ pais }: { pais: string }) {
  // A região detetada pode não ser um dos 5 países suportados (ex.: US) — fallback PT.
  const p: PaisDemo = pais in LOCAL ? (pais as PaisDemo) : "PT";
  const perguntas = useMemo(() => perguntasDe(p), [p]);
  const [idx, setIdx] = useState(0);
  const [erradas, setErradas] = useState<number[]>([]);
  const [acertou, setAcertou] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const q = perguntas[idx];

  const responder = (i: number) => {
    if (acertou || erradas.includes(i)) return;
    if (i === q.correta) {
      setAcertou(true);
      setEstrelas((s) => s + 1);
      setTimeout(() => {
        if (idx + 1 >= perguntas.length) {
          setTerminado(true);
        } else {
          setIdx((n) => n + 1);
          setErradas([]);
          setAcertou(false);
        }
      }, 950);
    } else {
      setErradas((e) => [...e, i]);
    }
  };

  const recomecar = () => {
    setIdx(0);
    setErradas([]);
    setAcertou(false);
    setEstrelas(0);
    setTerminado(false);
  };

  return (
    <section
      aria-labelledby="demo-heading"
      className="card-chunky mt-12 w-full rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-secondary/15 p-5 sm:mt-16 sm:p-8"
    >
      <div className="text-center">
        <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
          Experimenta agora · sem registo
        </p>
        <h2 id="demo-heading" className="mt-1 font-display text-2xl sm:text-3xl">
          Tenta uma perguntinha 🧪
        </h2>
        <p className="mx-auto mt-2 max-w-[34rem] text-sm text-muted-foreground sm:text-base">
          Tal como na app: perguntas curtas, estrelas e zero pressão. Repara — o dinheiro e as
          palavras são do <span className="font-semibold text-foreground">teu país</span>.
        </p>
      </div>

      {/* Progresso: uma estrelinha por pergunta acertada */}
      <div
        className="mt-4 flex items-center justify-center gap-1.5"
        role="status"
        aria-label={`${estrelas} de ${perguntas.length} perguntas concluídas`}
      >
        {perguntas.map((_, i) => (
          <motion.span
            key={i}
            animate={i < estrelas ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`text-lg ${i < estrelas ? "opacity-100" : "opacity-25 grayscale"}`}
            aria-hidden
          >
            ⭐
          </motion.span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {terminado ? (
          <motion.div
            key="fim"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 text-center"
          >
            <p className="font-display text-3xl">
              {estrelas === perguntas.length ? "🌟🌟🌟" : "🎉"}
            </p>
            <p className="mt-2 font-display text-xl sm:text-2xl">
              {estrelas} de {perguntas.length} — muito bem!
            </p>
            <p className="mx-auto mt-1 max-w-[32rem] text-sm text-muted-foreground">
              Isto foi só uma amostrinha: na app há centenas de lições com mascotes, som e
              recompensas — ao ritmo de 5 minutos por dia.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Link to="/comecar" className="w-full sm:w-auto">
                <ChunkyButton tone="primary" className="min-h-[54px] w-full text-base sm:w-auto">
                  Quero continuar a aventura 🚀
                </ChunkyButton>
              </Link>
              <ChunkyButton
                onClick={recomecar}
                tone="ghost"
                className="min-h-[54px] w-full text-base sm:w-auto"
              >
                Jogar outra vez
              </ChunkyButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`${pais}-${idx}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-5 max-w-[30rem]"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2.5 py-1 font-display text-[11px] font-bold ${
                  q.disc === "Matemática"
                    ? "bg-secondary/40 text-secondary-foreground"
                    : "bg-accent/40 text-accent-foreground"
                }`}
              >
                {q.disc === "Matemática" ? "➕" : "📖"} {q.disc} · {q.tema}
              </span>
              <span className="text-xs text-muted-foreground">
                {idx + 1}/{perguntas.length}
              </span>
            </div>
            <p className="mt-3 text-center font-display text-lg leading-snug sm:text-xl">
              {q.texto}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Respostas">
              {q.opcoes.map((op, i) => {
                const errada = erradas.includes(i);
                const certa = acertou && i === q.correta;
                return (
                  <motion.button
                    key={`${idx}-${i}`}
                    type="button"
                    onClick={() => responder(i)}
                    disabled={errada || acertou}
                    animate={certa ? { scale: [1, 1.12, 1] } : errada ? { x: [0, -5, 5, 0] } : {}}
                    transition={{ duration: 0.35 }}
                    className={`rounded-2xl border-2 px-2 py-3 font-display text-lg transition-colors ${
                      certa
                        ? "border-success bg-success/20 text-success"
                        : errada
                          ? "border-border bg-muted/50 text-muted-foreground opacity-50"
                          : "border-border bg-card hover:border-primary/60 hover:bg-primary/5 active:scale-95"
                    }`}
                    aria-label={certa ? "Resposta certa!" : undefined}
                  >
                    {op}
                    {certa && " ⭐"}
                  </motion.button>
                );
              })}
            </div>
            <p aria-live="polite" className="mt-3 min-h-[1.5rem] text-center text-sm font-semibold">
              {acertou ? (
                <span className="text-success">Isso! +1 ⭐</span>
              ) : erradas.length > 0 ? (
                <span className="text-muted-foreground">Quase! Tenta outra vez 💪</span>
              ) : (
                ""
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
