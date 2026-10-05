// DesafiosTurmas — desafios relâmpago entre DUAS turmas, com código
// partilhável, Placar ao Vivo (modo projetor) e folha de registo imprimível.
// O professor cria o desafio, partilha o código pelo WhatsApp com o outro
// professor, cada ronda soma pontos no Placar ao Vivo e a folha PDF fica de
// reserva para os dias sem internet. Nenhum concorrente oferece isto a
// escolas do 1.º ciclo — e não precisa de backend: tudo no navegador.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  Download,
  X,
  RotateCcw,
  Copy,
  Check,
  MessageCircle,
  LoaderCircle,
  Maximize,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generateDesafio } from "@/lib/desafio.functions";

const PAISES_DESAFIO = [
  { id: "pt", flag: "🇵🇹", nome: "Portugal" },
  { id: "mz", flag: "🇲🇿", nome: "Moçambique" },
  { id: "ao", flag: "🇦🇴", nome: "Angola" },
  { id: "cv", flag: "🇨🇻", nome: "Cabo Verde" },
  { id: "br", flag: "🇧🇷", nome: "Brasil" },
] as const;

type PaisDesafio = (typeof PAISES_DESAFIO)[number]["id"];
type DiscId = "mat" | "port" | "em";

const DISCIPLINAS: { id: DiscId; label: string; emoji: string }[] = [
  { id: "mat", label: "Matemática", emoji: "🧮" },
  { id: "port", label: "Português", emoji: "📖" },
  { id: "em", label: "Estudo do Meio", emoji: "🌍" },
];

const RONDAS: { n: number; label: string }[] = [
  { n: 1, label: "Duelo único" },
  { n: 3, label: "Melhor de 3" },
  { n: 5, label: "Grande final" },
];

const ABC_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gerarCodigo(): string {
  let s = "";
  for (let i = 0; i < 3; i++) s += ABC_CODIGO[Math.floor(Math.random() * ABC_CODIGO.length)];
  const nn = String(Math.floor(Math.random() * 90) + 10);
  return `KD-${s}-${nn}`;
}

interface PlacarProps {
  nome: string;
  codigo: string;
  turmaA: string;
  turmaB: string;
  rondas: number;
  onClose: () => void;
}

// Placar ao Vivo — ecrã cheio para o projetor da sala: duas turmas, pontos
// gigantes e barra de vantagem animada. Tudo local: zero rede, zero registo.
function Placar({ nome, codigo, turmaA, turmaB, rondas, onClose }: PlacarProps) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [celebrar, setCelebrar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const total = a + b;
  const pct = total === 0 ? 50 : Math.round((a / total) * 100);
  const vencedor = a === b ? null : a > b ? "A" : "B";

  const pedirTelaCheia = () => {
    try {
      void ref.current?.requestFullscreen?.();
    } catch {
      /* navegador recusou — segue sem tela cheia */
    }
  };

  const burst = useRef(
    [...Array(14)].map(() => ({
      x: Math.random() * 260 - 130,
      y: -(Math.random() * 160 + 60),
      r: Math.random() * 120 - 60,
      e: ["⭐", "🎉", "🏆", "✨", "🌟"][Math.floor(Math.random() * 5)],
      d: Math.random() * 0.3,
    })),
  ).current;

  const painel = (lado: "A" | "B") => {
    const nomeTurma = lado === "A" ? turmaA : turmaB;
    const pontos = lado === "A" ? a : b;
    const set = lado === "A" ? setA : setB;
    const ativo = vencedor === lado;
    return (
      <div
        className={`flex min-h-0 flex-1 flex-col items-center justify-center rounded-3xl border-4 p-4 sm:p-8 ${
          ativo
            ? lado === "A"
              ? "border-amber-400 bg-amber-400/25"
              : "border-sky-400 bg-sky-400/25"
            : lado === "A"
              ? "border-amber-400/50 bg-amber-400/10"
              : "border-sky-400/50 bg-sky-400/10"
        }`}
      >
        <p className="max-w-full truncate text-center font-display text-xl sm:text-3xl">
          {nomeTurma}
        </p>
        <motion.p
          key={pontos}
          initial={{ scale: 1.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="pointer-events-none font-display text-8xl font-black leading-none tabular-nums sm:text-[9rem]"
        >
          {pontos}
        </motion.p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[1, 2, 3, 5].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set((v) => v + p)}
              className="h-14 w-14 rounded-2xl border-2 border-border bg-card font-display text-xl font-black shadow-[0_4px_0_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-0.5 sm:h-16 sm:w-16"
            >
              +{p}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-background p-4 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-secondary/20 via-transparent to-amber-400/10"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-base sm:text-xl">{nome}</p>
          <p className="text-xs text-muted-foreground">
            Placar ao Vivo · código {codigo} ·{" "}
            {rondas === 1 ? "duelo único" : `melhor de ${rondas} rondas`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={pedirTelaCheia}
            aria-label="Tela cheia"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border bg-card"
          >
            <Maximize className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar placar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border bg-card"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-[60vh] flex-1 flex-col items-stretch justify-center gap-3 py-3 sm:flex-row sm:items-center">
        {painel("A")}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span className="font-display text-3xl text-muted-foreground sm:text-5xl">VS</span>
          <div className="relative hidden h-48 w-3 overflow-hidden rounded-full bg-muted sm:block">
            <motion.div
              initial={{ height: "50%" }}
              animate={{ height: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="absolute bottom-0 w-full rounded-full bg-amber-400"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {pct}% · {100 - pct}%
          </p>
        </div>
        {painel("B")}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setA(0);
            setB(0);
            setCelebrar(false);
          }}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 border-border bg-card px-4 font-display text-sm"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
        <ChunkyButton
          onClick={() => setCelebrar(true)}
          tone="success"
          className="min-h-[48px] text-base"
        >
          <Trophy className="mr-1 inline h-5 w-5" /> Terminar e celebrar
        </ChunkyButton>
        <p className="w-full text-center text-[11px] text-muted-foreground">
          Soma aqui os pontos de cada ronda. Podes também apontar na folha do desafio em papel.
        </p>
      </div>

      <AnimatePresence>
        {celebrar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background p-6 text-center"
          >
            <div className="relative">
              <p className="text-6xl">{vencedor === null ? "🤝" : "🏆"}</p>
              {burst.map((b, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  animate={{ opacity: 0, x: b.x, y: b.y, rotate: b.r }}
                  transition={{ duration: 1.4, delay: b.d, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl"
                >
                  {b.e}
                </motion.span>
              ))}
            </div>
            <h3 className="mt-4 font-display text-3xl sm:text-5xl">
              {vencedor === null
                ? "Empate histórico!"
                : `${vencedor === "A" ? turmaA : turmaB} vence!`}
            </h3>
            <p className="mt-2 font-display text-xl text-muted-foreground">
              {a} — {b}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {a === b
                ? "Duas turmas gigantes. Ronda de desempate?"
                : "Turma com mais pontos no fim — parabéns!"}
            </p>
            <div className="mt-6 flex gap-2">
              <ChunkyButton onClick={() => setCelebrar(false)} tone="secondary">
                Voltar ao placar
              </ChunkyButton>
              <ChunkyButton onClick={onClose} tone="ghost">
                Fechar placar
              </ChunkyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DesafiosTurmas() {
  const [nome, setNome] = useState("Desafio Relâmpago");
  const [turmaA, setTurmaA] = useState("3.º A");
  const [turmaB, setTurmaB] = useState("4.º B");
  const [disc, setDisc] = useState<DiscId>("mat");
  const [rondas, setRondas] = useState(3);
  const [pais, setPais] = useState<PaisDesafio>("pt");
  // Código gerado só no cliente (Math.random no SSR causava hydration mismatch).
  const [codigo, setCodigo] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [placar, setPlacar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const codigoSeguro = codigo || "KD-···-··";

  useEffect(() => {
    setCodigo(gerarCodigo());
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kidoz-pais")?.toLowerCase();
      if (saved && PAISES_DESAFIO.some((p) => p.id === saved)) setPais(saved as PaisDesafio);
    } catch {
      /* noop */
    }
  }, []);

  const escolherPais = (id: PaisDesafio) => {
    setPais(id);
    try {
      localStorage.setItem("kidoz-pais", id.toUpperCase());
    } catch {
      /* noop */
    }
  };

  const copiarCodigo = useCallback(async () => {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponível — o código continua visível para copiar à mão */
    }
  }, [codigo]);

  const discLabel = DISCIPLINAS.find((d) => d.id === disc)?.label ?? "Matemática";

  const partilhaMsg = `⚡ Desafio Relâmpago Kidoz — ${nome.trim() || "Desafio Relâmpago"}
${turmaA.trim() || "Turma A"} vs ${turmaB.trim() || "Turma B"} · ${discLabel} · ${rondas === 1 ? "duelo único" : `melhor de ${rondas} rondas`}
Código do desafio: ${codigoSeguro}
Cada turma joga no Modo Turma ao vivo (kidoz.online) ou com fichas imprimíveis e soma os pontos. A turma com mais pontos no fim ganha! 🏆`;

  const waHref = `https://wa.me/?text=${encodeURIComponent(partilhaMsg)}`;

  const descarregar = async () => {
    setBusy(true);
    setErro(null);
    try {
      // Se o utilizador chegou aqui antes do efeito gerar o código, gera agora.
      const cod = codigo || gerarCodigo();
      if (!codigo) setCodigo(cod);
      const r = await generateDesafio({
        data: {
          nome: nome.trim() || "Desafio Relâmpago",
          turmaA: turmaA.trim() || "Turma A",
          turmaB: turmaB.trim() || "Turma B",
          disciplina: disc,
          rondas,
          codigo: cod,
          pais,
        },
      });
      if ("error" in r && r.error) {
        setErro(r.error);
        return;
      }
      if (!r.pdfBase64) {
        setErro("Não foi possível gerar o PDF — tenta outra vez.");
        return;
      }
      const bin = atob(r.pdfBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOk((n) => n + 1);
    } catch {
      setErro("Não foi possível gerar o PDF — tenta outra vez.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-chunky mt-8 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-400/15 via-card to-sky-400/10 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/30">
          <Zap className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Desafios relâmpago entre turmas ⚡</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria um desafio direto entre duas turmas, partilha o código pelo WhatsApp e projeta o{" "}
            <strong>Placar ao Vivo</strong> na sala — pontos gigantes, barra de vantagem e
            celebração no fim. Com folha de registo para os dias sem internet.
          </p>
        </div>
      </div>

      {/* Nome do desafio */}
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nome do desafio
        </span>
        <input
          type="text"
          maxLength={60}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Duelo das Estações"
          className="mt-1 h-12 w-full max-w-md rounded-2xl border-2 border-border bg-background px-4 font-display text-sm outline-none focus:border-primary"
        />
      </label>

      {/* Turmas */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Turma A
          </span>
          <input
            type="text"
            maxLength={24}
            value={turmaA}
            onChange={(e) => setTurmaA(e.target.value)}
            className="mt-1 h-12 w-full rounded-2xl border-2 border-amber-400/50 bg-background px-4 font-display text-sm outline-none focus:border-amber-500"
          />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Turma B
          </span>
          <input
            type="text"
            maxLength={24}
            value={turmaB}
            onChange={(e) => setTurmaB(e.target.value)}
            className="mt-1 h-12 w-full rounded-2xl border-2 border-sky-400/50 bg-background px-4 font-display text-sm outline-none focus:border-sky-500"
          />
        </label>
      </div>

      {/* Disciplina */}
      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Disciplina"
      >
        {DISCIPLINAS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDisc(d.id)}
            aria-pressed={disc === d.id}
            className={`rounded-full border px-3 py-1.5 font-display text-xs transition-colors ${
              disc === d.id
                ? "border-primary bg-primary/15 font-semibold text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span aria-hidden="true">{d.emoji}</span> {d.label}
          </button>
        ))}
      </div>

      {/* Rondas */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Rondas">
        {RONDAS.map((r) => (
          <button
            key={r.n}
            type="button"
            onClick={() => setRondas(r.n)}
            aria-pressed={rondas === r.n}
            className={`rounded-full border px-3 py-1.5 font-display text-xs transition-colors ${
              rondas === r.n
                ? "border-primary bg-primary/15 font-semibold text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* País */}
      <div
        className="mt-2 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="País do desafio"
      >
        {PAISES_DESAFIO.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => escolherPais(p.id)}
            aria-pressed={pais === p.id}
            className={`rounded-full border px-3 py-1.5 font-display text-xs transition-colors ${
              pais === p.id
                ? "border-primary bg-primary/15 font-semibold text-primary"
                : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span aria-hidden="true">{p.flag}</span> {p.nome}
          </button>
        ))}
      </div>

      {/* Código do desafio */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-400/10 p-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Código
        </span>
        <span className="font-display text-2xl font-black tracking-widest text-primary">
          {codigoSeguro}
        </span>
        <button
          type="button"
          onClick={copiarCodigo}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-border bg-card px-3 font-display text-xs"
        >
          {copiado ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copiar
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setCodigo(gerarCodigo())}
          aria-label="Gerar outro código"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-border bg-card px-3 font-display text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Outro
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-destructive">
          {erro}
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <ChunkyButton
          onClick={() => setPlacar(true)}
          tone="primary"
          className="min-h-[54px] text-base"
        >
          <Zap className="mr-1 inline h-5 w-5" /> Abrir Placar ao Vivo
        </ChunkyButton>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 font-display text-sm hover:bg-muted"
        >
          <MessageCircle className="h-5 w-5" /> Partilhar código no WhatsApp
        </a>
        <ChunkyButton
          onClick={descarregar}
          disabled={busy}
          tone={ok > 0 && !busy ? "success" : "secondary"}
          className="min-h-[54px] text-base sm:col-span-2"
        >
          {busy ? (
            <>
              <LoaderCircle className="mr-1 inline h-5 w-5 animate-spin" /> A gerar…
            </>
          ) : ok > 0 ? (
            <>
              <Download className="mr-1 inline h-5 w-5" /> Folha pronta · gerar outra vez
            </>
          ) : (
            <>
              <Download className="mr-1 inline h-5 w-5" /> Descarregar folha do desafio (PDF)
            </>
          )}
        </ChunkyButton>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        {ok > 0 && `${ok} ${ok === 1 ? "folha gerada" : "folhas geradas"}. `}A folha sai com o
        código, as regras e o registo de pontos por ronda — imprime e joga.
      </p>

      <AnimatePresence>
        {placar && (
          <Placar
            nome={nome.trim() || "Desafio Relâmpago"}
            codigo={codigoSeguro}
            turmaA={turmaA.trim() || "Turma A"}
            turmaB={turmaB.trim() || "Turma B"}
            rondas={rondas}
            onClose={() => setPlacar(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
