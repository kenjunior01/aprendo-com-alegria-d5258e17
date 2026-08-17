import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";

/**
 * Parent-only gate. Verifies via PIN if set, otherwise via a math challenge
 * (multiplication that a young child wouldn't solve quickly), as recommended
 * by the design proposal.
 *
 * Accessibility: role="dialog", aria-modal, focus trap, Escape to cancel.
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
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // Escape key closes the dialog
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    },
    [onCancel]
  );

  // Focus trap: keep Tab cycling within the dialog
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    overlay.addEventListener("keydown", handleTab);
    return () => overlay.removeEventListener("keydown", handleTab);
  }, []);

  // Auto-focus the input when the dialog mounts
  useEffect(() => {
    const t = setTimeout(() => {
      const input = overlayRef.current?.querySelector<HTMLInputElement>("input");
      input?.focus();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const errorId = "parent-gate-error";
  const pinInputId = "parent-gate-pin";
  const mathInputId = "parent-gate-math";

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Área dos pais"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card-chunky w-full max-w-[28rem] rounded-3xl border-2 border-border bg-card p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl">Área dos pais</h2>
            <p className="text-sm text-muted-foreground">Confirma que és um adulto.</p>
          </div>
        </div>

        {expectedPin && expectedPin.length >= 4 ? (
          <div className="mt-6">
            <label htmlFor={pinInputId} className="font-display text-sm">
              Introduz o PIN de 4 dígitos
            </label>
            <input
              id={pinInputId}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              aria-invalid={error ? "true" : undefined}
              aria-errormessage={error ? errorId : undefined}
              className="mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-center font-mono text-3xl tracking-[0.6em] outline-none focus:border-primary"
              placeholder="••••"
            />
          </div>
        ) : (
          <div className="mt-6">
            <label htmlFor={mathInputId} className="font-display text-sm">
              Quanto é {challenge.a} × {challenge.b}?
            </label>
            <input
              id={mathInputId}
              type="number"
              inputMode="numeric"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              aria-invalid={error ? "true" : undefined}
              aria-errormessage={error ? errorId : undefined}
              className="mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-center font-display text-2xl outline-none focus:border-primary"
              placeholder="?"
            />
          </div>
        )}

        {error && (
          <p id={errorId} role="alert" aria-live="assertive" className="mt-3 text-center text-sm text-destructive">
            {error}
          </p>
        )}

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
