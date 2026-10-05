// MuralEstrelas — poster A4 imprimível de estrelas da turma.
// O professor escolhe a turma e o número de alunos, descarrega o poster e
// cola na parede: cada aluno pinta uma estrela por conquista. Motivação
// offline diária — o Kidoz organiza o mesmo ritual digital no painel.

import { useEffect, useState } from "react";
import { Star, LoaderCircle, Download, Minus, Plus } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generateMural } from "@/lib/mural.functions";

const PAISES_MURAL = [
  { id: "pt", flag: "🇵🇹", nome: "Portugal" },
  { id: "mz", flag: "🇲🇿", nome: "Moçambique" },
  { id: "ao", flag: "🇦🇴", nome: "Angola" },
  { id: "cv", flag: "🇨🇻", nome: "Cabo Verde" },
  { id: "br", flag: "🇧🇷", nome: "Brasil" },
] as const;

type PaisMural = (typeof PAISES_MURAL)[number]["id"];

export function MuralEstrelas() {
  const [turma, setTurma] = useState("3.º A");
  const [alunos, setAlunos] = useState(24);
  const [pais, setPais] = useState<PaisMural>("pt");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kidoz-pais")?.toLowerCase();
      if (saved && PAISES_MURAL.some((p) => p.id === saved)) setPais(saved as PaisMural);
    } catch {
      /* noop */
    }
  }, []);

  const escolherPais = (id: PaisMural) => {
    setPais(id);
    try {
      localStorage.setItem("kidoz-pais", id.toUpperCase());
    } catch {
      /* noop */
    }
  };

  const descarregar = async () => {
    setBusy(true);
    setErro(null);
    try {
      const r = await generateMural({
        data: { turma: turma.trim() || "A minha turma", alunos, pais },
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
    <section className="card-chunky mt-8 rounded-3xl border-2 border-border bg-card p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/40">
          <Star className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Mural de Estrelas da turma ⭐</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Poster A4 imprimível com um espaço por aluno e 10 estrelas para pintar: cada conquista
            da semana vale uma estrela. A motivação mais antiga da escola, pronta em dois cliques —
            combina com os torneios e os desafios ao vivo.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nome da turma
          </span>
          <input
            type="text"
            maxLength={40}
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            className="mt-1 h-12 w-full rounded-2xl border-2 border-border bg-background px-4 font-display text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-muted px-3 py-2">
          <span className="text-xs font-bold text-muted-foreground">Alunos:</span>
          <button
            type="button"
            aria-label="Menos alunos"
            onClick={() => setAlunos((n) => Math.max(1, n - 1))}
            disabled={alunos <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center font-display font-bold">{alunos}</span>
          <button
            type="button"
            aria-label="Mais alunos"
            onClick={() => setAlunos((n) => Math.min(36, n + 1))}
            disabled={alunos >= 36}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="País do mural"
      >
        {PAISES_MURAL.map((p) => (
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

      {erro && (
        <p role="alert" className="mt-3 text-center text-sm font-semibold text-destructive">
          {erro}
        </p>
      )}

      <ChunkyButton
        onClick={descarregar}
        disabled={busy}
        tone={ok > 0 && !busy ? "success" : "primary"}
        className="mt-4 min-h-[54px] w-full text-base"
      >
        {busy ? (
          <>
            <LoaderCircle className="mr-1 inline h-5 w-5 animate-spin" /> A gerar…
          </>
        ) : ok > 0 ? (
          <>
            <Download className="mr-1 inline h-5 w-5" /> Poster pronto · gerar outra vez
          </>
        ) : (
          <>
            <Download className="mr-1 inline h-5 w-5" /> Descarregar mural em PDF (A4)
          </>
        )}
      </ChunkyButton>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Imprime em A4, escreve os nomes nos traços e cola na parede.
        {ok > 0 && ` ${ok} ${ok === 1 ? "mural gerado" : "murais gerados"}.`}
      </p>
    </section>
  );
}
