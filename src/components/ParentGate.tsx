import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";

/**
 * Parent-only gate. Verifies via PIN if set, otherwise via a math challenge
 * (multiplication that a young child wouldn't solve quickly), as recommended
 * by the design proposal.
 */
export function ParentGate({
  expectedPin,
  onPass,
  onCancel,
}: {
  expectedPin?: string | null;
  onPass: () => void;
  onCancel?: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Stable math challenge per mount: 2-digit × 1-digit
  const challenge = useMemo(() => {
    const a = 11 + Math.floor(Math.random() * 88); // 11..98
    const b = 3 + Math.floor(Math.random() * 7); // 3..9
    return { a, b, answer: a * b };
  }, []);
  const [mathInput, setMathInput] = useState("");

  useEffect(() => setError(null), [pin, mathInput]);

  const verify = () => {
    if (expectedPin && expectedPin.length >= 4) {
      if (pin === expectedPin) {
        onPass();
      } else {
        setError("PIN incorreto. Tenta de novo.");
      }
      return;
    }
    if (Number(mathInput) === challenge.answer) onPass();
    else setError("Resposta incorreta.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card-chunky w-full max-w-md rounded-3xl border-2 border-border bg-card p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl">Área dos pais</h2>
            <p className="text-sm text-muted-foreground">Confirma que és um adulto.</p>
          </div>
        </div>

        {expectedPin && expectedPin.length >= 4 ? (
          <div className="mt-6">
            <label className="font-display text-sm">Introduz o PIN de 4 dígitos</label>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              className="mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-center font-mono text-3xl tracking-[0.6em] outline-none focus:border-primary"
              placeholder="••••"
            />
          </div>
        ) : (
          <div className="mt-6">
            <p className="font-display text-sm">Quanto é {challenge.a} × {challenge.b}?</p>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              className="mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-center font-display text-2xl outline-none focus:border-primary"
              placeholder="?"
            />
          </div>
        )}

        {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}

        <div className="mt-5 flex gap-2">
          {onCancel && (
            <ChunkyButton tone="ghost" onClick={onCancel} className="flex-1">Cancelar</ChunkyButton>
          )}
          <ChunkyButton onClick={verify} className="flex-1">Entrar</ChunkyButton>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          {expectedPin ? "Esqueceste o PIN? Termina sessão e entra de novo como encarregado." : "Define um PIN no painel para acesso mais rápido."}
        </p>
      </motion.div>
    </div>
  );
}
