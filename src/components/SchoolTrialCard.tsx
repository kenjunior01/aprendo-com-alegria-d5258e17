// SchoolTrialCard — 15 dias grátis do modo Escola, uma vez por conta.
// A ativação honra as regras do servidor: precisa de escola/turma criada e
// só pode ser usada uma vez (trial_until + trigger de proteção na BD).

import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarClock, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChunkyButton } from "@/components/ChunkyButton";
import { startSchoolTrial, getTrialStatus } from "@/lib/teacherContent.functions";
import { useAuth } from "@/hooks/useAuth";

interface TrialInfo {
  used: boolean;
  active: boolean;
  daysLeft: number;
}

export function SchoolTrialCard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const fnStart = useServerFn(startSchoolTrial);
  const fnStatus = useServerFn(getTrialStatus);
  const [info, setInfo] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fnStatus()
      .then((r) => setInfo(r))
      .catch(() => {});
  }, [user, fnStatus]);

  if (!user) {
    return compact ? null : (
      <div className="rounded-2xl border-2 border-primary/40 bg-primary/10 p-4 text-center">
        <p className="font-display text-base">15 dias grátis para a tua instituição 🎁</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cria a conta, monta a escola e a turma — os 15 dias de Premium ativam em 1 clique, sem
          cartão.
        </p>
        <ChunkyButton className="mt-3" onClick={() => (window.location.href = "/auth?mode=signup")}>
          Criar conta de escola
        </ChunkyButton>
      </div>
    );
  }

  if (info?.active) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border-2 border-success/40 bg-success/10 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <p className="text-sm">
          <strong>Trial ativo</strong> — {info.daysLeft} dia(s) restantes de Premium Escola.
          Aproveita para montar tudo sem pressa.
        </p>
      </div>
    );
  }

  if (info?.used) return null; // já usou — nada a mostrar (caminho: subscrever)

  return (
    <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-400/15 via-card to-secondary/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/25">
          <CalendarClock className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="font-display text-base">15 dias grátis, sem cartão 🎁</p>
          <p className="text-sm text-muted-foreground">
            Premium completo da escola para experimentares com a tua turma real: relatórios, alertas
            e o Estúdio do Professor. Uma vez por conta, sem renovação automática — quando acaba,
            basta subscrever se gostares.
          </p>
        </div>
      </div>
      <Button
        className="mt-3 w-full sm:w-auto"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const r = await fnStart({});
            if (r.ok) {
              toast.success(r.message ?? "Trial ativado! 🎉");
              setInfo({ used: true, active: true, daysLeft: r.daysLeft ?? 15 });
              setTimeout(() => location.reload(), 900);
            } else {
              toast.info(r.message ?? "Cria primeiro a tua escola e uma turma.");
            }
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading && <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />}
        Ativar 15 dias grátis
      </Button>
    </div>
  );
}
