import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { getAdaptiveRecommendation } from "@/server/ai.functions";
import { useAuth } from "@/hooks/useAuth";

interface Reco {
  title: string;
  message: string;
  focusSubject: string;
  difficulty: string;
}

const SUBJECT_LABEL: Record<string, string> = {
  portugues: "Português",
  matematica: "Matemática",
  "estudo-do-meio": "Estudo do Meio",
  geral: "Aventura",
};

export function AdaptiveTip() {
  const { user } = useAuth();
  const [reco, setReco] = useState<Reco | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getAdaptiveRecommendation()
      .then((r) => { if (!cancelled) setReco(r); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-chunky mb-5 rounded-3xl border-2 border-dashed border-border bg-card/70 p-4 text-sm text-muted-foreground"
      >
        💡 Cria uma conta para receberes dicas personalizadas do teu tutor mágico.
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="card-chunky mb-5 flex items-center gap-3 rounded-3xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        A pensar na próxima missão para ti…
      </div>
    );
  }

  if (!reco) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky mb-5 overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide text-primary">
              Tutor mágico
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {SUBJECT_LABEL[reco.focusSubject] ?? reco.focusSubject}
            </span>
          </div>
          <h3 className="mt-1 font-display text-base sm:text-lg">{reco.title}</h3>
          <p className="text-xs leading-snug text-muted-foreground sm:text-sm">{reco.message}</p>
        </div>
      </div>
    </motion.div>
  );
}
