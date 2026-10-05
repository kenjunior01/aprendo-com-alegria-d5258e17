// TorneiosKit — "Copa Kidoz": torneios entre turmas ou equipas.
// O professor escolhe o formato (mata-mata 4/8 ou liga 4-6), dá nome às
// equipas e descarrega um PDF com o quadro imprimível, folha de registo e
// diplomas do pódio. Cada ronda joga-se no Modo Turma ao vivo ou com fichas
// — joga, regista, pódio. Nenhum concorrente oferece isto a escolas.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, LoaderCircle, Download, Plus, Minus, Trash2 } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generateTournament } from "@/lib/tournament.functions";

const PAISES_TORNEIO = [
  { id: "pt", flag: "🇵🇹", nome: "Portugal" },
  { id: "mz", flag: "🇲🇿", nome: "Moçambique" },
  { id: "ao", flag: "🇦🇴", nome: "Angola" },
  { id: "cv", flag: "🇨🇻", nome: "Cabo Verde" },
  { id: "br", flag: "🇧🇷", nome: "Brasil" },
] as const;

type PaisTorneio = (typeof PAISES_TORNEIO)[number]["id"];
type ModoId = "mata4" | "mata8" | "liga";

const MODOS: { id: ModoId; label: string; desc: string; qtd: number }[] = [
  {
    id: "mata4",
    label: "Mata-mata · 4",
    desc: "Semifinais + final — ideal para 2 turmas de cada ano",
    qtd: 4,
  },
  {
    id: "mata8",
    label: "Mata-mata · 8",
    desc: "Quartos + meias + final — para toda a escola",
    qtd: 8,
  },
  {
    id: "liga",
    label: "Liga · 4 a 6",
    desc: "Todos contra todos — quem soma mais pontos vence",
    qtd: 4,
  },
];

const nomesIniciais = ["3.º A", "3.º B", "4.º A", "4.º B"];

export function TorneiosKit() {
  const [nome, setNome] = useState("Copa Kidoz");
  const [modo, setModo] = useState<ModoId>("mata4");
  const [equipas, setEquipas] = useState<string[]>(nomesIniciais);
  const [ligaQtd, setLigaQtd] = useState(4);
  const [pais, setPais] = useState<PaisTorneio>("pt");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kidoz-pais")?.toLowerCase();
      if (saved && PAISES_TORNEIO.some((p) => p.id === saved)) setPais(saved as PaisTorneio);
    } catch {
      /* noop */
    }
  }, []);

  const escolherPais = (id: PaisTorneio) => {
    setPais(id);
    try {
      localStorage.setItem("kidoz-pais", id.toUpperCase());
    } catch {
      /* noop */
    }
  };

  // Quantidade alvo de equipas consoante o modo
  const qtdAlvo = modo === "mata4" ? 4 : modo === "mata8" ? 8 : ligaQtd;

  const mudarModo = (m: ModoId) => {
    setModo(m);
    const q = m === "mata4" ? 4 : m === "mata8" ? 8 : ligaQtd;
    setEquipas((prev) => {
      const next = [...prev];
      while (next.length < q) next.push(`Equipa ${next.length + 1}`);
      if (next.length > q) next.length = q;
      return next;
    });
  };

  const mudarLigaQtd = (delta: number) => {
    setLigaQtd((q) => {
      const nq = Math.min(6, Math.max(4, q + delta));
      setEquipas((prev) => {
        const next = [...prev];
        while (next.length < nq) next.push(`Equipa ${next.length + 1}`);
        if (next.length > nq) next.length = nq;
        return next;
      });
      return nq;
    });
  };

  const setEquipa = (i: number, v: string) => {
    setEquipas((prev) => prev.map((e, k) => (k === i ? v : e)));
  };

  const descarregar = async () => {
    setBusy(true);
    setErro(null);
    try {
      const r = await generateTournament({
        data: {
          nome: nome.trim() || "Copa Kidoz",
          modo,
          equipas: equipas.map((e) => e.trim()).filter(Boolean),
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
    <section className="card-chunky mt-8 rounded-3xl border-2 border-xp/40 bg-gradient-to-br from-xp/10 via-card to-secondary/10 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-xp/25">
          <Trophy className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Torneios entre turmas 🏆</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria a Copa da tua escola: mata-mata ou liga, quadro imprimível, folha de registo e
            diplomas do pódio. Cada ronda joga-se no Modo Turma ao vivo ou com fichas — joga,
            regista, pódio!
          </p>
        </div>
      </div>

      {/* Nome do torneio */}
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nome do torneio
        </span>
        <input
          type="text"
          maxLength={60}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Copa Kidoz 2026"
          className="mt-1 h-12 w-full max-w-md rounded-2xl border-2 border-border bg-background px-4 font-display text-sm outline-none focus:border-primary"
        />
      </label>

      {/* Modo */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {MODOS.map((m) => {
          const ativo = modo === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => mudarModo(m.id)}
              aria-pressed={ativo}
              className={`rounded-2xl border-2 p-3 text-left transition-colors ${
                ativo
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p className={`font-display text-sm ${ativo ? "text-primary" : ""}`}>{m.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Liga: controla nº de equipas */}
      {modo === "liga" && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-muted px-3 py-2">
          <span className="text-xs font-bold text-muted-foreground">Equipas:</span>
          <button
            type="button"
            aria-label="Menos equipas"
            onClick={() => mudarLigaQtd(-1)}
            disabled={ligaQtd <= 4}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-display font-bold">{ligaQtd}</span>
          <button
            type="button"
            aria-label="Mais equipas"
            onClick={() => mudarLigaQtd(1)}
            disabled={ligaQtd >= 6}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Equipas */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {equipas.map((e, i) => (
          <label key={i} className="relative">
            <span className="sr-only">{`Nome da equipa ${i + 1}`}</span>
            <input
              type="text"
              maxLength={24}
              value={e}
              onChange={(ev) => setEquipa(i, ev.target.value)}
              placeholder={`Equipa ${i + 1}`}
              className="h-11 w-full rounded-xl border-2 border-border bg-background px-3 pr-8 font-display text-sm outline-none focus:border-primary"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
              {i + 1}
            </span>
          </label>
        ))}
      </div>

      {/* País do torneio */}
      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="País do torneio"
      >
        {PAISES_TORNEIO.map((p) => {
          const ativo = pais === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => escolherPais(p.id)}
              aria-pressed={ativo}
              className={`rounded-full border px-3 py-1.5 font-display text-xs transition-colors ${
                ativo
                  ? "border-primary bg-primary/15 font-semibold text-primary"
                  : "border-border bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <span aria-hidden="true">{p.flag}</span> {p.nome}
            </button>
          );
        })}
      </div>

      {erro && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-destructive">
          {erro}
        </p>
      )}

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row">
        <ChunkyButton
          onClick={descarregar}
          disabled={busy}
          tone={ok > 0 && !busy ? "success" : "primary"}
          className="min-h-[54px] flex-1 text-base"
        >
          {busy ? (
            <>
              <LoaderCircle className="mr-1 inline h-5 w-5 animate-spin" /> A gerar…
            </>
          ) : ok > 0 ? (
            <>
              <Download className="mr-1 inline h-5 w-5" /> PDF pronto · gerar outra vez
            </>
          ) : (
            <>
              <Download className="mr-1 inline h-5 w-5" /> Descarregar torneio em PDF
            </>
          )}
        </ChunkyButton>
        <button
          type="button"
          onClick={() => setEquipas(nomesIniciais.slice(0, qtdAlvo))}
          className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-5 font-display text-sm hover:bg-muted"
        >
          <Trash2 className="h-4 w-4" />
          Restaurar turmas exemplo
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        O PDF sai com o quadro, as regras, a folha de registo e 3 diplomas — só falta imprimir e
        jogar.
        {ok > 0 && ` ${ok} ${ok === 1 ? "torneio gerado" : "torneios gerados"}.`}
      </p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-4 rounded-2xl bg-muted/60 px-4 py-3 text-center text-xs text-muted-foreground"
      >
        💡 Pontos sugeridos: 2 pontos por vitória no Modo Turma ao vivo · 1 ponto por exercício
        certo em fichas · desempate com uma ronda de sequências. Todos contra todos, todos a
        aprender.
      </motion.p>
    </section>
  );
}
