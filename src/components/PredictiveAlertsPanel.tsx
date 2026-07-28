import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  childId: string;
  childName: string;
}

interface SubjectStat {
  subject_id: string;
  total: number;
  correct: number;
  accuracy: number;
  sessions: number;
}

const SUBJECT_LABEL: Record<string, string> = {
  portugues: "Português",
  matematica: "Matemática",
  "estudo-do-meio": "Estudo do Meio",
};

const SUBJECT_TIP: Record<string, string> = {
  portugues: "Recomenda 10 minutos de leitura em voz alta antes de dormir.",
  matematica: "Pratiquem a tabuada do dia em jogos rápidos durante o pequeno-almoço.",
  "estudo-do-meio": "Vejam juntos um vídeo curto sobre o tema e conversem 2 minutos.",
};

export function PredictiveAlertsPanel({ childId, childName }: Props) {
  const [stats, setStats] = useState<SubjectStat[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("practice_sessions")
        .select("subject_id, correct, total")
        .eq("user_id", childId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (cancelled) return;
      const agg: Record<string, SubjectStat> = {};
      (data ?? []).forEach((s) => {
        const k = String(s.subject_id);
        if (!agg[k]) agg[k] = { subject_id: k, total: 0, correct: 0, accuracy: 0, sessions: 0 };
        agg[k].total += Number(s.total ?? 0);
        agg[k].correct += Number(s.correct ?? 0);
        agg[k].sessions += 1;
      });
      Object.values(agg).forEach((s) => {
        s.accuracy = s.total ? s.correct / s.total : 0;
      });
      setStats(Object.values(agg).sort((a, b) => a.accuracy - b.accuracy));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  const weakest = useMemo(() => stats?.[0] ?? null, [stats]);
  const strongest = useMemo(() => (stats && stats.length > 0 ? stats[stats.length - 1] : null), [stats]);

  if (loading) {
    return (
      <section className="card-chunky rounded-3xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">A analisar padrões de aprendizagem…</p>
      </section>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <section className="card-chunky rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-display text-base">Sinais de alerta</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Ainda não há dados suficientes para {childName}. Volta aqui assim que houver algumas missões feitas.
        </p>
      </section>
    );
  }

  const weakPct = weakest ? Math.round(weakest.accuracy * 100) : 0;
  const isAtRisk = weakest && weakest.accuracy < 0.6 && weakest.sessions >= 2;

  return (
    <section className="card-chunky rounded-3xl border-2 border-border bg-gradient-to-br from-card to-accent/15 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-2xl ${isAtRisk ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
          {isAtRisk ? <AlertTriangle className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-display text-base sm:text-lg">Sinais de alerta</h3>
          <p className="text-[11px] text-muted-foreground">Baseado nas últimas 30 sessões</p>
        </div>
      </div>

      {weakest && (
        <div className={`rounded-2xl border p-3 ${isAtRisk ? "border-destructive/40 bg-destructive/10" : "border-border bg-muted/30"}`}>
          <div className="flex items-start gap-2">
            <TrendingDown className={`mt-0.5 h-4 w-4 shrink-0 ${isAtRisk ? "text-destructive" : "text-muted-foreground"}`} />
            <div className="min-w-0">
              <p className="text-xs font-display uppercase tracking-wide text-muted-foreground">A precisar de reforço</p>
              <p className="font-display text-base">
                {SUBJECT_LABEL[weakest.subject_id] ?? weakest.subject_id}
                <span className={`ml-2 text-sm font-bold ${isAtRisk ? "text-destructive" : "text-foreground/80"}`}>{weakPct}%</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isAtRisk
                  ? `${childName} pode beneficiar de prática extra. ${SUBJECT_TIP[weakest.subject_id] ?? ""}`
                  : `Bom nível, mas vale a pena praticar mais. ${SUBJECT_TIP[weakest.subject_id] ?? ""}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {strongest && strongest.subject_id !== weakest?.subject_id && (
        <div className="mt-2 rounded-2xl border border-success/40 bg-success/10 p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="min-w-0">
              <p className="text-xs font-display uppercase tracking-wide text-muted-foreground">Ponto forte</p>
              <p className="font-display text-base">
                {SUBJECT_LABEL[strongest.subject_id] ?? strongest.subject_id}
                <span className="ml-2 text-sm font-bold text-success">{Math.round(strongest.accuracy * 100)}%</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Continua a aproveitar este interesse — celebra com {childName}!
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
