import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, Clock, FileBarChart, Target, TrendingUp } from "lucide-react";
import { dayGap, type LocalSession, type Profile } from "@/lib/storage";

// Relatório semanal aos pais — promessa dos planos Premium cumprida.
// Funciona SEM conta: usa o histórico local do dispositivo onde a criança joga
// (famílias partilham o mesmo tablet — é aí que os pais procuram o progresso).
// Dados sensíveis: nenhum. Só contagens de lições/acertos, guardados no aparelho.

const SUBJECTS: Record<string, { name: string; emoji: string }> = {
  portugues: { name: "Português", emoji: "📚" },
  matematica: { name: "Matemática", emoji: "➕" },
  "estudo-do-meio": { name: "Estudo do Meio", emoji: "🌍" },
  ingles: { name: "Inglês", emoji: "🗣️" },
  ciencias: { name: "Ciências", emoji: "🔬" },
  cidadania: { name: "Cidadania", emoji: "🌱" },
};

const subjectMeta = (id: string) => SUBJECTS[id] ?? { name: id, emoji: "📘" };

interface WeekStats {
  lessons: number;
  correct: number;
  total: number;
  minutes: number;
  accuracy: number;
}

const weekStats = (sessions: LocalSession[]): WeekStats => {
  const correct = sessions.reduce((s, x) => s + x.c, 0);
  const total = sessions.reduce((s, x) => s + x.t, 0);
  return {
    lessons: sessions.length,
    correct,
    total,
    minutes: sessions.reduce((s, x) => s + x.m, 0),
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
};

export function ParentWeeklyReport({ profile }: { profile: Profile }) {
  const data = useMemo(() => {
    const all = profile.sessionHistory ?? [];
    const last7 = all.filter((x) => dayGap(x.d) >= 0 && dayGap(x.d) < 7);
    const prev7 = all.filter((x) => dayGap(x.d) >= 7 && dayGap(x.d) < 14);
    const bySubject = new Map<string, { lessons: number; correct: number; total: number }>();
    for (const s of last7) {
      const cur = bySubject.get(s.s) ?? { lessons: 0, correct: 0, total: 0 };
      bySubject.set(s.s, {
        lessons: cur.lessons + 1,
        correct: cur.correct + s.c,
        total: cur.total + s.t,
      });
    }
    const now = weekStats(last7);
    const before = weekStats(prev7);
    const deltaLessons = before.lessons > 0 ? now.lessons - before.lessons : null;
    const deltaAccuracy = before.total > 0 && now.total > 0 ? now.accuracy - before.accuracy : null;
    return { now, before, deltaLessons, deltaAccuracy, subjects: Array.from(bySubject.entries()) };
  }, [profile.sessionHistory]);

  const firstName = profile.name || "a criança";

  // Mensagem construtiva — celebra competência, nunca acusa (lição da investigação)
  const insight = (() => {
    if (data.now.lessons === 0)
      return "Sem lições nos últimos 7 dias — uma aventura curta por dia faz toda a diferença!";
    if (data.now.accuracy >= 80)
      return `Excelente precisão — ${firstName} está a dominar o material desta semana!`;
    if (data.now.accuracy >= 60)
      return `Boa progressão! A Revisão Mágica ajuda a consolidar os erros que ficaram a faltar.`;
    return `Semana de aprendizagem difícil — os erros já estão na Revisão Mágica a esperar para serem treinados.`;
  })();

  return (
    <section
      className="card-chunky rounded-3xl border-2 border-border bg-gradient-to-br from-card to-accent/10 p-5"
      aria-labelledby="relatorio-semanal-title"
    >
      <div className="flex items-center gap-2">
        <FileBarChart className="h-5 w-5 text-primary" aria-hidden />
        <h2 id="relatorio-semanal-title" className="font-display text-lg sm:text-xl">
          Relatório da semana — {firstName}
        </h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Últimos 7 dias neste dispositivo · nenhum dado sai do aparelho
      </p>

      {data.now.lessons === 0 ? (
        <p className="mt-4 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {insight}
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <BarChart3 className="mx-auto h-4 w-4 text-primary" aria-hidden />
              <p className="mt-1 font-display text-xl font-bold tabular-nums">{data.now.lessons}</p>
              <p className="text-[11px] text-muted-foreground">lições</p>
              {data.deltaLessons !== null && data.deltaLessons !== 0 && (
                <p
                  className={`text-[10px] font-semibold ${data.deltaLessons > 0 ? "text-success" : "text-secondary-foreground"}`}
                >
                  {data.deltaLessons > 0 ? "+" : ""}
                  {data.deltaLessons} vs semana anterior
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <Target className="mx-auto h-4 w-4 text-success" aria-hidden />
              <p className="mt-1 font-display text-xl font-bold tabular-nums">
                {data.now.accuracy}%
              </p>
              <p className="text-[11px] text-muted-foreground">precisão</p>
              {data.deltaAccuracy !== null && data.deltaAccuracy !== 0 && (
                <p
                  className={`text-[10px] font-semibold ${data.deltaAccuracy > 0 ? "text-success" : "text-secondary-foreground"}`}
                >
                  {data.deltaAccuracy > 0 ? "+" : ""}
                  {data.deltaAccuracy}pp vs anterior
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <Clock className="mx-auto h-4 w-4 text-secondary-foreground" aria-hidden />
              <p className="mt-1 font-display text-xl font-bold tabular-nums">{data.now.minutes}</p>
              <p className="text-[11px] text-muted-foreground">minutos</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <CheckCircle2 className="mx-auto h-4 w-4 text-coins" aria-hidden />
              <p className="mt-1 font-display text-xl font-bold tabular-nums">{data.now.correct}</p>
              <p className="text-[11px] text-muted-foreground">acertos</p>
            </div>
          </div>

          {data.subjects.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {data.subjects
                .sort((a, b) => b[1].lessons - a[1].lessons)
                .map(([id, st]) => {
                  const acc = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
                  const meta = subjectMeta(id);
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span aria-hidden>{meta.emoji}</span>
                      <span className="font-display">{meta.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {st.lessons} {st.lessons === 1 ? "lição" : "lições"} · {acc}% de acerto
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}

          <p className="mt-3 flex items-start gap-1.5 rounded-2xl bg-primary/10 px-3 py-2 text-sm">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {insight}
          </p>
        </>
      )}

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Quer relatórios completos na cloud, relógio de tempo de ecrã e análise por turma?{" "}
        <Link to="/premium" className="font-semibold text-primary underline">
          Ver Kidoz Premium
        </Link>
      </p>
    </section>
  );
}
