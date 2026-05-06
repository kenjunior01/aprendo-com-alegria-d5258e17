import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { ParentGate } from "@/components/ParentGate";
import { loadProfile, pullProfileFromCloud, updateProfile, type Profile } from "@/lib/storage";
import { getTodayMinutes } from "@/lib/usageTracker";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getMyChildren, createParentInvite, acceptParentInvite, getChildDashboard, type ParentDashboardData } from "@/server/parent.functions";
import { listChildren as listTutorChildren, type TutorHistory } from "@/lib/tutorHistory";
import { Copy, LogOut, Plus, BarChart3, Clock, Target, Flame, MessageCircle, ShieldCheck, Moon, Hourglass } from "lucide-react";

const GATE_KEY = "kidoz-parent-gate-ts";
const GATE_TTL_MIN = 30;

export const Route = createFileRoute("/pais")({
  head: () => ({
    meta: [
      { title: "Painel de Pais — Kidoz" },
      { name: "description", content: "Acompanha o progresso dos teus filhos: tempo de estudo, áreas fortes e fracas, recomendações." },
    ],
  }),
  component: ParentDashboard,
});

interface ChildSummary { id: string; name: string; mascot: string; grade: number; xp: number; streak: number }

function ParentDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<ParentDashboardData | null>(null);
  const [acceptCode, setAcceptCode] = useState("");
  const [acceptMsg, setAcceptMsg] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { mode: "parent" } as never });
      return;
    }
    void (async () => {
      const cloud = await pullProfileFromCloud();
      const p = cloud ?? loadProfile();
      if (!p) {
        // create minimal parent profile
        setProfile(updateProfile({ name: user.email?.split("@")[0] ?? "Encarregado", role: "parent" }));
      } else {
        if (p.role !== "parent") {
          setProfile(updateProfile({ role: "parent" }));
        } else {
          setProfile(p);
        }
      }
      const res = await getMyChildren();
      setChildren(res.children as ChildSummary[]);
      if (res.children.length > 0) setSelectedChild(res.children[0].id);
    })();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!selectedChild) return;
    void getChildDashboard({ data: { childId: selectedChild } }).then(setDashboard).catch(() => setDashboard(null));
  }, [selectedChild]);

  if (!user || !profile) return null;

  const generateInvite = async () => {
    try {
      const r = await createParentInvite();
      setPendingCode(r.invite_code);
    } catch {
      setPendingCode(null);
    }
  };

  const acceptInvite = async () => {
    setAcceptMsg(null);
    if (!acceptCode.trim()) return;
    const r = await acceptParentInvite({ data: { code: acceptCode } });
    if (r.ok) setAcceptMsg("✅ Conta ligada com sucesso!");
    else setAcceptMsg("❌ Código inválido ou já usado.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <p className="font-display text-lg">Painel de Pais</p>
          </div>
          <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="inline h-4 w-4" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Children selector or empty state */}
        {children.length === 0 ? (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-chunky rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h1 className="font-display text-2xl sm:text-3xl">Olá, {profile.name}! 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">Liga uma conta de criança para começar a acompanhar o progresso.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-accent/40 p-4">
                <p className="font-display text-base">🔗 Convidar uma criança</p>
                <p className="mt-1 text-xs text-muted-foreground">Gera um código e dá-o à criança para ela introduzir no perfil dela.</p>
                {pendingCode ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-card px-3 py-2 font-mono text-lg font-bold tracking-widest">
                    {pendingCode}
                    <button onClick={() => navigator.clipboard?.writeText(pendingCode)} className="ml-auto text-muted-foreground hover:text-foreground"><Copy className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <ChunkyButton onClick={generateInvite} className="mt-3 w-full"><Plus className="h-4 w-4" /> Gerar código</ChunkyButton>
                )}
              </div>
              <div className="rounded-2xl bg-secondary/30 p-4">
                <p className="font-display text-base">🧒 Já tens código?</p>
                <p className="mt-1 text-xs text-muted-foreground">Se um pai já gerou um código, introduz aqui (na conta da criança).</p>
                <input
                  value={acceptCode}
                  onChange={(e) => setAcceptCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={8}
                  className="mt-3 w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-center font-mono text-lg tracking-widest outline-none focus:border-primary"
                />
                <ChunkyButton tone="secondary" onClick={acceptInvite} className="mt-2 w-full">Ligar conta</ChunkyButton>
                {acceptMsg && <p className="mt-2 text-center text-xs">{acceptMsg}</p>}
              </div>
            </div>
          </motion.section>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChild(c.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-sm font-semibold transition-colors ${
                    selectedChild === c.id ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  <Mascot id={c.mascot as never} size="sm" />
                  {c.name}
                </button>
              ))}
              <button onClick={generateInvite} className="rounded-full bg-card px-3 py-1.5 font-display text-sm text-muted-foreground"><Plus className="inline h-4 w-4" /> Adicionar</button>
            </div>

            {pendingCode && (
              <div className="mb-4 rounded-2xl bg-accent/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">Novo código de convite:</p>
                <p className="font-mono text-2xl font-bold tracking-widest">{pendingCode}</p>
              </div>
            )}

            {dashboard && <DashboardView data={dashboard} />}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function DashboardView({ data }: { data: ParentDashboardData }) {
  const accuracy = data.totals.total ? Math.round((data.totals.correct / data.totals.total) * 100) : 0;
  const subjectName: Record<string, string> = {
    portugues: "Português",
    matematica: "Matemática",
    "estudo-do-meio": "Estudo do Meio",
  };
  const weekdayLabel = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="space-y-5">
      <div className="card-chunky rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Mascot id={data.child.mascot as never} size="md" />
          <div>
            <h2 className="font-display text-2xl">{data.child.name}</h2>
            <p className="text-sm text-muted-foreground">{data.child.grade}.º ano · ⭐ {data.child.xp} XP · 🔥 {data.child.streak}d</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI icon={<Target className="h-5 w-5 text-success" />} label="Precisão (14d)" value={`${accuracy}%`} />
        <KPI icon={<Clock className="h-5 w-5 text-secondary-foreground" />} label="Tempo total" value={`${data.totals.minutes}min`} />
        <KPI icon={<BarChart3 className="h-5 w-5 text-primary" />} label="Sessões" value={`${data.totals.sessions}`} />
        <KPI icon={<Flame className="h-5 w-5 text-streak" />} label="Sequência" value={`${data.child.streak}d`} />
      </div>

      {/* AI recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-chunky rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent/20 p-5"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-display text-base">{data.recommendation.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.recommendation.message}</p>
          </div>
        </div>
      </motion.div>

      {/* Predictive analysis */}
      {data.predictions.length > 0 && (
        <div className="card-chunky rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg">🔮 Análise preditiva</h3>
          <p className="mt-1 text-xs text-muted-foreground">Previsões baseadas no padrão recente.</p>
          <ul className="mt-3 space-y-2">
            {data.predictions.map((p, i) => (
              <li key={i} className={`rounded-xl px-3 py-2 text-sm ${
                p.risk === "alto" ? "bg-destructive/10" : p.risk === "medio" ? "bg-secondary/30" : "bg-success/10"
              }`}>
                <div className="flex items-center justify-between">
                  <strong className="font-display">{p.area}</strong>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.risk === "alto" ? "bg-destructive/20 text-destructive" :
                    p.risk === "medio" ? "bg-secondary/60" : "bg-success/20 text-success"
                  }`}>
                    Risco {p.risk}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Off-platform recommendations */}
      {data.offPlatform.length > 0 && (
        <div className="card-chunky rounded-3xl border border-border bg-gradient-to-br from-accent/30 to-card p-5">
          <h3 className="font-display text-lg">📚 Atividades fora do ecrã</h3>
          <p className="mt-1 text-xs text-muted-foreground">Sugestões para complementar a aprendizagem.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {data.offPlatform.map((rec, i) => (
              <div key={i} className="rounded-2xl bg-card p-3">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-display uppercase text-primary">
                  {rec.type}
                </span>
                <p className="mt-1 font-display text-sm">{rec.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.insights.length > 0 && (
        <div className="card-chunky rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg">Observações</h3>
          <ul className="mt-3 space-y-2">
            {data.insights.map((ins, i) => (
              <li key={i} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                ins.type === "good" ? "bg-success/10" : ins.type === "warn" ? "bg-destructive/10" : "bg-muted"
              }`}>
                <span>{ins.type === "good" ? "✅" : ins.type === "warn" ? "⚠️" : "ℹ️"}</span>
                <span>{ins.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Subjects */}
      <div className="card-chunky rounded-3xl border border-border bg-card p-5">
        <h3 className="font-display text-lg">Por disciplina</h3>
        <div className="mt-3 space-y-3">
          {data.bySubject.length === 0 && <p className="text-sm text-muted-foreground">Ainda sem dados.</p>}
          {data.bySubject.map((s) => {
            const acc = s.total ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={s.subject_id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-display">{subjectName[s.subject_id] ?? s.subject_id}</span>
                  <span className="text-muted-foreground">{acc}% · {s.correct}/{s.total} · {s.minutes}min</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all ${acc >= 80 ? "bg-success" : acc >= 60 ? "bg-primary" : "bg-destructive"}`} style={{ width: `${acc}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily activity */}
      <div className="card-chunky rounded-3xl border border-border bg-card p-5">
        <h3 className="font-display text-lg">Atividade diária (14 dias)</h3>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {data.byDay.map((d) => {
            const max = Math.max(1, ...data.byDay.map((x) => x.minutes));
            const h = (d.minutes / max) * 100;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.minutes}min`}>
                <div className="flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-md transition-all ${d.minutes > 0 ? "bg-primary" : "bg-muted"}`} style={{ height: `${Math.max(h, d.minutes > 0 ? 8 : 4)}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{d.date.slice(8)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By weekday */}
      <div className="card-chunky rounded-3xl border border-border bg-card p-5">
        <h3 className="font-display text-lg">Quando estuda mais</h3>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {data.byWeekday.map((w) => {
            const max = Math.max(1, ...data.byWeekday.map((x) => x.minutes));
            const h = (w.minutes / max) * 100;
            return (
              <div key={w.weekday} className="flex flex-col items-center gap-1">
                <div className="flex h-20 w-full items-end">
                  <div className="w-full rounded-md bg-secondary/60 transition-all" style={{ height: `${Math.max(h, w.minutes > 0 ? 10 : 4)}%` }} />
                </div>
                <span className="text-xs font-display">{weekdayLabel[w.weekday]}</span>
                <span className="text-[10px] text-muted-foreground">{w.minutes}m</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent achievements */}
      {data.achievements.length > 0 && (
        <div className="card-chunky rounded-3xl border border-border bg-card p-5">
          <h3 className="font-display text-lg">🏆 Conquistas recentes</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.achievements.map((a) => (
              <span key={a.code} className="rounded-full bg-accent/40 px-3 py-1 font-display text-xs">
                {a.code}
              </span>
            ))}
          </div>
        </div>
      )}

      <TutorHistorySection childName={data.child.name} />

      <Link to="/perfil"><ChunkyButton tone="ghost" className="w-full">Voltar ao perfil</ChunkyButton></Link>
    </div>
  );
}

function TutorHistorySection({ childName }: { childName: string }) {
  const [hist, setHist] = useState<TutorHistory | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const all = listTutorChildren();
    const match = all.find((h) => h.childKey.startsWith(childName.toLowerCase().trim() + "|"));
    setHist(match ?? null);
  }, [childName]);
  if (!hist || hist.messages.length === 0) {
    return (
      <div className="card-chunky rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg">Conversas com o Tutor</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Ainda sem conversas guardadas neste dispositivo.</p>
      </div>
    );
  }
  const recent = open ? hist.messages : hist.messages.slice(-6);
  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg">Conversas com o Tutor</h3>
        </div>
        <span className="font-display text-xs text-muted-foreground">{hist.messages.length} mensagens</span>
      </div>
      <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
        {recent.map((m, i) => (
          <div key={i} className={`rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary/10" : "bg-muted"}`}>
            <p className="font-display text-[10px] uppercase tracking-wide text-muted-foreground">
              {m.role === "user" ? "👧 Criança" : "🦉 Mocha"} · {new Date(m.ts).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
            </p>
            <p className="mt-0.5">{m.content}</p>
          </div>
        ))}
      </div>
      {hist.messages.length > 6 && (
        <button onClick={() => setOpen((o) => !o)} className="mt-2 text-xs font-display text-primary underline">
          {open ? "Ver menos" : `Ver todas (${hist.messages.length})`}
        </button>
      )}
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3 sm:p-4">
      <div className="flex items-center gap-2">{icon}<p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p></div>
      <p className="mt-1 font-display text-xl sm:text-2xl">{value}</p>
    </div>
  );
}
