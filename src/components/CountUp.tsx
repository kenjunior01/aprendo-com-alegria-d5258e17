import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** Valor final (número real da plataforma — nunca inventado). */
  to: number;
  /** Sufixo apresentado a seguir ao número (ex.: "+"). */
  suffix?: string;
  /** Duração da contagem em segundos. */
  duration?: number;
  className?: string;
}

/**
 * Contador animado que arranca quando entra no ecrã.
 * Dados reais por trás (lições, perguntas, países) — a alegria é a
 * apresentação, não o número. Respeita prefers-reduced-motion
 * (mostra o valor final imediatamente, sem contar).
 */
export function CountUp({ to, suffix = "", duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {val.toLocaleString("pt-PT")}
      {suffix}
    </span>
  );
}
