// JoinClassCard.tsx — Entrada do aluno numa turma da escola por código.
// Usado em /escolas: fecha o ciclo institucional (o professor cria a turma
// e partilha o código; o aluno entra aqui e passa a contar nos relatórios).
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChunkyButton } from "@/components/ChunkyButton";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/hooks/useAuth";
import { joinClassByCode } from "@/lib/school.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

export function JoinClassCard() {
  const { user, loading } = useAuth();
  const fnJoin = useServerFn(joinClassByCode);
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) {
      toast.error("Escreve o código que a tua escola te deu!");
      return;
    }
    setBusy(true);
    haptic("tap");
    try {
      const r = await fnJoin({ data: { code: c } });
      if (r?.ok) {
        setJoined(r.className);
        haptic("celebrate");
        toast.success(`🎓 Entraste na turma ${r.className}!`);
      } else {
        haptic("error");
        toast.error(r?.error ?? "Código inválido — confere com o teu professor.");
      }
    } catch {
      // 401 → sem sessão iniciada
      haptic("error");
      toast.info("Entra primeiro na tua conta para juntares à turma.");
      setBusy(false);
      return;
    }
    setBusy(false);
  };

  if (joined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-chunky mt-8 rounded-3xl border-2 border-success/50 bg-success/10 p-6 text-center"
      >
        <span className="text-5xl">🎓</span>
        <h2 className="mt-2 font-display text-xl">Estás na turma {joined}!</h2>
        <p className="mx-auto mt-1 max-w-[30rem] text-sm text-muted-foreground">
          As tuas jogadas contam agora para os relatórios da tua turma. Continua a jogar e a
          aprender — o teu professor vai ver o teu progresso!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky mt-8 rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-secondary/15 p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-lg">És aluno? Entra na tua turma 🎓</h2>
          <p className="text-sm text-muted-foreground">
            Escreve o código que a tua escola/professor partilhou contigo.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 12))}
          placeholder="Código da turma (ex.: abc123)"
          aria-label="Código da turma"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy && user) void join();
          }}
          className="h-14 flex-1 rounded-2xl border-2 border-border bg-background px-4 font-display text-lg uppercase tracking-[0.2em] outline-none focus:border-primary"
        />
        {user ? (
          <ChunkyButton onClick={() => void join()} disabled={busy} className="min-h-[56px]">
            {busy ? "A entrar…" : "Entrar na turma"}
          </ChunkyButton>
        ) : (
          <Link to="/auth">
            <ChunkyButton tone="secondary" className="min-h-[56px]">
              {loading ? "…" : "Entrar na conta primeiro"}
            </ChunkyButton>
          </Link>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Sem conta?{" "}
        <Link to="/auth" className="underline underline-offset-2">
          Cria a tua conta grátis
        </Link>{" "}
        e volta aqui com o código.
      </p>
    </motion.section>
  );
}
