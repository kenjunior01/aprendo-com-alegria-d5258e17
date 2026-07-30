import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mascot } from "@/components/Mascot";
import { Download, Plus, School, Users, Pencil, Trash2, Filter, Trophy, LineChart as LineChartIcon, UserMinus, Bell, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import {
  becomeTeacher,
  listMySchools,
  createSchool,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  getClassDashboard,
  getSubjectRanking,
  getClassTimeline,
  removeClassMember,
  getStudentDetails,
  getTeacherAlerts,
  type SchoolRow,
  type ClassRow,
  type ClassStudentStats,
  type SubjectRankingEntry,
  type WeeklyPoint,
  type StudentDetails,
  type TeacherAlert,
} from "@/lib/school.functions";
import type { MascotId } from "@/lib/mascots";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/escola")({
  head: () => ({
    meta: [
      { title: "Painel da Escola — Alegria" },
      { name: "description", content: "Painel para professores: turmas, métricas dos alunos e exportação CSV." },
      { property: "og:title", content: 'Painel da Escola — Alegria' },
      { property: "og:description", content: 'Painel para professores: turmas, métricas dos alunos e exportação CSV.' },
      { property: "og:url", content: "https://alegria.online/escola" },
    ],
    links: [
      { rel: "canonical", href: "https://alegria.online/escola" },
    ],
  }),
  component: EscolaPage,
});

const SUBJECT_LABELS: Record<string, string> = {
  portugues: "Português",
  matematica: "Matemática",
  "estudo-do-meio": "Estudo do Meio",
};

function EscolaPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<ClassStudentStats[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [ranking, setRanking] = useState<SubjectRankingEntry[]>([]);
  const [rankingAll, setRankingAll] = useState<SubjectRankingEntry[]>([]);
  const [timeline, setTimeline] = useState<WeeklyPoint[]>([]);
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [openStudent, setOpenStudent] = useState<StudentDetails | null>(null);
  const [alerts, setAlerts] = useState<TeacherAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fnBecome = useServerFn(becomeTeacher);
  const fnSchools = useServerFn(listMySchools);
  const fnCreateSchool = useServerFn(createSchool);
  const fnClasses = useServerFn(listClasses);
  const fnCreateClass = useServerFn(createClass);
  const fnUpdateClass = useServerFn(updateClass);
  const fnDeleteClass = useServerFn(deleteClass);
  const fnDash = useServerFn(getClassDashboard);
  const fnRanking = useServerFn(getSubjectRanking);
  const fnTimeline = useServerFn(getClassTimeline);
  const fnRemoveMember = useServerFn(removeClassMember);
  const fnStudent = useServerFn(getStudentDetails);
  const fnAlerts = useServerFn(getTeacherAlerts);

  useEffect(() => {
    (async () => {
      const cloud = await pullProfileFromCloud();
      const p = cloud ?? loadProfile();
      if (!p) { navigate({ to: "/auth" }); return; }
      setProfile(p);
      const s = await fnSchools();
      setSchools(s.schools);
      const c = await fnClasses({ data: {} });
      setClasses(c.classes);
      setLoading(false);
    })();
  }, [navigate, fnSchools, fnClasses]);

  const refresh = async () => {
    const s = await fnSchools(); setSchools(s.schools);
    const c = await fnClasses({ data: {} }); setClasses(c.classes);
  };

  const reloadAll = async (cls = selectedClass, subject = subjectFilter, days = daysFilter, student = studentFilter) => {
    if (!cls) return;
    const args = { classId: cls.id, subjectId: subject || undefined, days };
    const [d, rk, tl, al] = await Promise.all([
      fnDash({ data: args }),
      fnRanking({ data: args }),
      fnTimeline({ data: { ...args, studentId: student || undefined } }),
      fnAlerts({ data: { classId: cls.id, subjectId: subject || undefined } }),
    ]);
    setStudents(d.students);
    setSubjects(d.subjects);
    setRanking(rk.top);
    setRankingAll((rk as any).all ?? rk.top);
    setTimeline(tl.points);
    setAlerts(al.alerts);
  };

  const reloadDashboard = (cls = selectedClass, subject = subjectFilter, days = daysFilter) => reloadAll(cls, subject, days, studentFilter);

  const openClass = async (cls: ClassRow) => {
    setSelectedClass(cls);
    setSubjectFilter("");
    setStudentFilter("");
    await reloadAll(cls, "", daysFilter, "");
  };

  const resetFilters = () => {
    setSubjectFilter("");
    setStudentFilter("");
    setDaysFilter(30);
    reloadAll(selectedClass, "", 30, "");
  };

  const openStudentDetails = async (studentId: string) => {
    if (!selectedClass) return;
    const r = await fnStudent({ data: { classId: selectedClass.id, studentId, subjectId: subjectFilter || undefined, days: daysFilter } });
    if (r.details) setOpenStudent(r.details);
  };

  const exportCsv = () => {
    if (!selectedClass) return;
    const subjCols = subjectFilter ? [subjectFilter] : subjects;
    const subjHeaders = subjCols.flatMap((s) => [`${SUBJECT_LABELS[s] ?? s} sessões`, `${SUBJECT_LABELS[s] ?? s} precisão %`, `${SUBJECT_LABELS[s] ?? s} min`]);
    const header = ["Nome", "Ano", "XP", "Streak", "Sessões", "Precisão %", "Minutos", ...subjHeaders].join(",");
    const rows = students.map((s) => {
      const base = [s.name, s.grade, s.xp, s.streak, s.sessions, s.accuracy, s.minutes];
      const subj = subjCols.flatMap((sid) => {
        const v = s.bySubject[sid];
        return v ? [v.sessions, v.accuracy, v.minutes] : [0, 0, 0];
      });
      return [...base, ...subj].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    const blob = new Blob(["\uFEFF" + header + "\n" + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `turma-${selectedClass.name}-${subjectFilter || "todas"}-${daysFilter}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportRankingCsv = () => {
    if (!selectedClass || rankingAll.length === 0) return;
    const header = ["Posição", "Nome", "XP", "Precisão %", "Minutos", "Sessões", "Top 10"].join(",");
    const rows = rankingAll.map((e, i) => {
      const cells = [i + 1, e.name, e.xp, e.accuracy, e.minutes, e.sessions, i < 10 ? "sim" : "não"];
      return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    const blob = new Blob(["\uFEFF" + header + "\n" + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ranking-${selectedClass.name}-${subjectFilter || "geral"}-${daysFilter}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    if (students.length === 0) return null;
    const totalMin = students.reduce((a, s) => a + s.minutes, 0);
    const totalSess = students.reduce((a, s) => a + s.sessions, 0);
    const avgAcc = Math.round(students.reduce((a, s) => a + s.accuracy, 0) / students.length);
    const active = students.filter((s) => s.sessions > 0).length;
    return { totalMin, totalSess, avgAcc, active };
  }, [students]);

  if (!profile) return null;
  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <TopBar profile={profile} />
        <p className="p-8 text-center text-muted-foreground">A carregar painel da escola…</p>
      </div>
    );
  }

  const isTeacher = (profile.role as string) === "teacher";

  return (
    <div className="min-h-[100dvh] bg-background pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3">
          <School className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl">Painel da Escola</h1>
            <p className="text-sm text-muted-foreground">Gere turmas, acompanha progresso por disciplina e exporta relatórios.</p>
          </div>
        </header>

        {!isTeacher && (
          <div className="card-chunky mb-6 rounded-2xl border-2 border-border bg-accent/20 p-4">
            <p className="mb-3 text-sm">Estás identificado como conta de família. Queres também ativar funcionalidades de professor?</p>
            <Button onClick={async () => {
              const r = await fnBecome();
              if (r.ok) { toast.success("Conta de professor ativada!"); location.reload(); }
              else toast.error(r.error);
            }}>Ativar modo professor</Button>
          </div>
        )}

        <Tabs defaultValue="schools">
          <TabsList className="mb-4">
            <TabsTrigger value="schools">Escolas</TabsTrigger>
            <TabsTrigger value="classes">Turmas</TabsTrigger>
            {selectedClass && <TabsTrigger value="dash">Relatório · {selectedClass.name}</TabsTrigger>}
          </TabsList>

          <TabsContent value="schools">
            <NewSchool onCreate={async (name) => {
              const r = await fnCreateSchool({ data: { name } });
              if (r.ok) { toast.success("Escola criada"); refresh(); }
              else toast.error(r.error);
            }} />
            <div className="mt-4 space-y-4">
              {schools.map((s) => {
                const schoolClasses = classes.filter((c) => c.school_id === s.id);
                return (
                  <section key={s.id} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-display text-lg">{s.name}</p>
                        <p className="text-xs text-muted-foreground">Convite: <code className="rounded bg-muted px-1">{s.invite_code}</code></p>
                      </div>
                      <Badge variant="secondary">{schoolClasses.length} turma(s)</Badge>
                    </div>
                    <NewClass
                      schoolId={s.id}
                      onCreate={async (data) => {
                        const r = await fnCreateClass({ data });
                        if (r.ok) { toast.success("Turma criada"); refresh(); }
                        else toast.error(r.error);
                      }}
                    />
                    {schoolClasses.length > 0 && (
                      <ul className="mt-3 grid gap-2 md:grid-cols-2">
                        {schoolClasses.map((c) => (
                          <ClassCard
                            key={c.id}
                            cls={c}
                            onOpen={() => openClass(c)}
                            onSave={async (patch) => {
                              const r = await fnUpdateClass({ data: { classId: c.id, ...patch } });
                              if (r.ok) { toast.success("Turma atualizada"); refresh(); }
                              else toast.error(r.error);
                            }}
                            onDelete={async () => {
                              if (!confirm(`Apagar turma "${c.name}"? Esta ação não pode ser desfeita.`)) return;
                              const r = await fnDeleteClass({ data: { classId: c.id } });
                              if (r.ok) {
                                toast.success("Turma apagada");
                                if (selectedClass?.id === c.id) setSelectedClass(null);
                                refresh();
                              } else toast.error(r.error);
                            }}
                          />
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
              {schools.length === 0 && <p className="text-sm text-muted-foreground">Ainda não tens escolas. Cria a primeira acima.</p>}
            </div>
          </TabsContent>

          <TabsContent value="classes">
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem turmas. Cria turmas a partir da aba Escolas.</p>
            ) : (
              <ul className="grid gap-2 md:grid-cols-2">
                {classes.map((c) => {
                  const sc = schools.find((s) => s.id === c.school_id);
                  return (
                    <li key={c.id}>
                      <button onClick={() => openClass(c)} className="card-chunky w-full rounded-2xl border-2 border-border bg-card p-4 text-left transition-transform active:scale-[0.98]">
                        <div className="flex items-center justify-between">
                          <p className="font-display text-lg">{c.name}</p>
                          <Badge variant="secondary">Ano {c.grade}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{sc?.name} · Código: <code className="rounded bg-muted px-1">{c.invite_code}</code></p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>

          {selectedClass && (
            <TabsContent value="dash">
              <div className="card-chunky mb-4 rounded-2xl border-2 border-border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-xl">{selectedClass.name}</h2>
                  </div>
                  <div className="ml-auto flex flex-wrap items-end gap-2">
                    <div>
                      <Label className="text-xs"><Filter className="mr-1 inline h-3 w-3" />Disciplina</Label>
                      <select
                        className="h-9 w-44 rounded-md border border-border bg-background px-2 text-sm"
                        value={subjectFilter}
                        onChange={(e) => { setSubjectFilter(e.target.value); reloadDashboard(selectedClass, e.target.value, daysFilter); }}
                      >
                        <option value="">Todas</option>
                        {subjects.map((s) => <option key={s} value={s}>{SUBJECT_LABELS[s] ?? s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Período</Label>
                      <select
                        className="h-9 w-36 rounded-md border border-border bg-background px-2 text-sm"
                        value={daysFilter}
                        onChange={(e) => { const d = Number(e.target.value); setDaysFilter(d); reloadDashboard(selectedClass, subjectFilter, d); }}
                      >
                        <option value={7}>7 dias</option>
                        <option value={30}>30 dias</option>
                        <option value={28}>4 semanas</option>
                        <option value={56}>8 semanas</option>
                        <option value={84}>12 semanas</option>
                        <option value={90}>90 dias</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Aluno</Label>
                      <select
                        className="h-9 w-44 rounded-md border border-border bg-background px-2 text-sm"
                        value={studentFilter}
                        onChange={(e) => { setStudentFilter(e.target.value); reloadAll(selectedClass, subjectFilter, daysFilter, e.target.value); }}
                      >
                        <option value="">Toda a turma</option>
                        {students.map((s) => <option key={s.studentId} value={s.studentId}>{s.name}</option>)}
                      </select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetFilters} title="Limpar filtros">
                      <RotateCcw className="mr-1 h-4 w-4" />Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCsv}>
                      <Download className="mr-1 h-4 w-4" />CSV turma
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportRankingCsv}>
                      <Download className="mr-1 h-4 w-4" />CSV ranking
                    </Button>
                  </div>
                </div>

                {/* Teacher alerts */}
                {alerts.filter((a) => !dismissedAlerts.has(`${a.studentId}:${a.kind}`)).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {alerts.filter((a) => !dismissedAlerts.has(`${a.studentId}:${a.kind}`)).map((a) => {
                      const key = `${a.studentId}:${a.kind}`;
                      return (
                        <div key={key} className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1.5 text-xs">
                          <Bell className="h-4 w-4 text-primary" />
                          <Mascot id={a.mascot as MascotId} size="sm" />
                          <span className="font-display">{a.name}</span>
                          <span className="text-muted-foreground">{a.kind === "accuracy_up" ? "📈" : "⏱️"} {a.detail}</span>
                          <button
                            className="ml-auto text-muted-foreground hover:text-foreground"
                            onClick={() => setDismissedAlerts((s) => new Set(s).add(key))}
                            aria-label="Descartar"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {summary && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Stat label="Alunos ativos" value={`${summary.active}/${students.length}`} />
                    <Stat label="Sessões" value={String(summary.totalSess)} />
                    <Stat label="Minutos" value={String(summary.totalMin)} />
                    <Stat label="Precisão média" value={`${summary.avgAcc}%`} />
                  </div>
                )}
              </div>

              {students.length === 0 ? (
                <div className="card-chunky rounded-2xl border-2 border-border bg-card p-6 text-center">
                  <p className="mb-2">Ainda sem alunos ou sem atividade neste período.</p>
                  <p className="text-sm text-muted-foreground">Partilha o código <code className="rounded bg-muted px-1">{selectedClass.invite_code}</code> para se juntarem.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border-2 border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 font-display">
                      <tr>
                        <th className="p-2 text-left">Aluno</th>
                        <th className="p-2 text-right">XP</th>
                        <th className="p-2 text-right">🔥</th>
                        <th className="p-2 text-right">Sessões</th>
                        <th className="p-2 text-right">Precisão</th>
                        <th className="p-2 text-right">Min.</th>
                        {(subjectFilter ? [subjectFilter] : subjects).map((s) => (
                          <th key={s} className="p-2 text-right">{SUBJECT_LABELS[s] ?? s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.studentId} className="border-t border-border">
                          <td className="p-2">
                            <button onClick={() => openStudentDetails(s.studentId)} className="flex items-center gap-2 hover:underline">
                              <Mascot id={s.mascot as MascotId} size="sm" />
                              <span className="font-display">{s.name}</span>
                            </button>
                          </td>
                          <td className="p-2 text-right font-mono">{s.xp}</td>
                          <td className="p-2 text-right">{s.streak}</td>
                          <td className="p-2 text-right">{s.sessions}</td>
                          <td className="p-2 text-right">{s.accuracy}%</td>
                          <td className="p-2 text-right">{s.minutes}</td>
                          {(subjectFilter ? [subjectFilter] : subjects).map((sid) => {
                            const v = s.bySubject[sid];
                            return (
                              <td key={sid} className="p-2 text-right">
                                {v ? <span><strong>{v.accuracy}%</strong> <span className="text-xs text-muted-foreground">· {v.minutes}m</span></span> : <span className="text-xs text-muted-foreground">—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Timeline chart */}
              <section className="card-chunky mt-4 rounded-2xl border-2 border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg">Evolução semanal</h3>
                  <span className="text-xs text-muted-foreground">
                    {subjectFilter ? SUBJECT_LABELS[subjectFilter] ?? subjectFilter : "Todas as disciplinas"} · {daysFilter} dias
                  </span>
                </div>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados para o período selecionado.</p>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeline} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="m" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="a" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="m" type="monotone" dataKey="minutes" name="Minutos" stroke="hsl(var(--primary))" strokeWidth={2} />
                        <Line yAxisId="a" type="monotone" dataKey="accuracy" name="Precisão %" stroke="hsl(var(--accent-foreground))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              {/* Ranking by subject */}
              <section className="card-chunky mt-4 rounded-2xl border-2 border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg">Top 10 — {subjectFilter ? SUBJECT_LABELS[subjectFilter] ?? subjectFilter : "Geral"}</h3>
                </div>
                {ranking.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados de ranking.</p>
                ) : (
                  <ol className="space-y-1">
                    {ranking.map((e, i) => (
                      <li key={e.studentId} className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5 text-sm">
                        <span className={`w-6 text-center font-display ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
                        <Mascot id={e.mascot as MascotId} size="sm" />
                        <span className="flex-1 font-display">{e.name}</span>
                        <span className="font-mono text-xs">{e.xp} XP</span>
                        <span className="text-xs text-muted-foreground">{e.accuracy}% · {e.minutes}m</span>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">A posição de cada aluno é mostrada também na tabela de relatório.</p>
              </section>

              {/* Members list with remove */}
              <section className="card-chunky mt-4 rounded-2xl border-2 border-border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg">Alunos da turma ({students.length})</h3>
                </div>
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ainda sem alunos inscritos.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {students.map((s) => {
                      const pos = ranking.findIndex((r) => r.studentId === s.studentId);
                      return (
                        <li key={s.studentId} className="flex items-center gap-2 py-2">
                          <button onClick={() => openStudentDetails(s.studentId)} className="flex flex-1 items-center gap-2 text-left hover:underline">
                            <Mascot id={s.mascot as MascotId} size="sm" />
                            <div className="flex-1">
                              <p className="font-display text-sm">{s.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {pos >= 0 ? `Posição #${pos + 1}` : "Sem ranking"} · {s.xp} XP · {s.accuracy}% precisão
                              </p>
                            </div>
                          </button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              if (!confirm(`Remover ${s.name} da turma?`)) return;
                              const r = await fnRemoveMember({ data: { classId: selectedClass.id, studentId: s.studentId } });
                              if (r.ok) { toast.success("Aluno removido"); reloadAll(); }
                              else toast.error(r.error);
                            }}
                          >
                            <UserMinus className="mr-1 h-4 w-4 text-destructive" />Remover
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {openStudent && (
                <section className="card-chunky mt-4 rounded-2xl border-2 border-primary/40 bg-card p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <Mascot id={openStudent.mascot as MascotId} size="md" />
                    <div className="flex-1">
                      <h3 className="font-display text-lg">Detalhes — {openStudent.name}</h3>
                      <p className="text-xs text-muted-foreground">{openStudent.grade}.º ano · 🔥 {openStudent.streak} · {openStudent.xp} XP totais</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setOpenStudent(null)} aria-label="Fechar"><X className="h-4 w-4" /></Button>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Stat label="Sessões" value={String(openStudent.totals.sessions)} />
                    <Stat label="Precisão" value={`${openStudent.totals.accuracy}%`} />
                    <Stat label="Minutos" value={String(openStudent.totals.minutes)} />
                    <Stat label="Moedas" value={String(openStudent.totals.coins)} />
                  </div>
                  {Object.keys(openStudent.bySubject).length > 0 && (
                    <div className="mb-3 grid gap-1 sm:grid-cols-3">
                      {Object.entries(openStudent.bySubject).map(([sid, v]) => (
                        <div key={sid} className="rounded-lg bg-muted/40 p-2 text-xs">
                          <p className="font-display">{SUBJECT_LABELS[sid] ?? sid}</p>
                          <p className="text-muted-foreground">{v.sessions} sessões · {v.accuracy}% · {v.minutes}m</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mb-2 font-display text-sm">Últimos exercícios</p>
                  {openStudent.recent.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem registos no período.</p>
                  ) : (
                    <ul className="divide-y divide-border text-xs">
                      {openStudent.recent.map((r) => (
                        <li key={r.id} className="flex items-center gap-2 py-1.5">
                          <span className="w-24 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })}</span>
                          <span className="flex-1 font-display">{SUBJECT_LABELS[r.subject_id] ?? r.subject_id} <span className="text-muted-foreground">· {r.lesson_id}</span></span>
                          <span>{r.correct}/{r.total}</span>
                          <span className="text-muted-foreground">{Math.round(r.duration_seconds / 60)}m</span>
                          <span className="font-mono text-primary">+{r.xp_earned}xp</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-accent/30 p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-lg">{value}</p>
    </div>
  );
}

function NewSchool({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onCreate(name.trim()); setName(""); } }}
      className="card-chunky flex items-end gap-2 rounded-2xl border-2 border-border bg-card p-3"
    >
      <div className="flex-1">
        <Label htmlFor="school-name">Nome da escola</Label>
        <Input id="school-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: EB Sol Nascente" />
      </div>
      <Button type="submit" disabled={!name.trim()}><Plus className="mr-1 h-4 w-4" />Criar</Button>
    </form>
  );
}

function NewClass({ schoolId, onCreate }: { schoolId: string; onCreate: (data: { schoolId: string; name: string; grade: number }) => void }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(1);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onCreate({ schoolId, name: name.trim(), grade }); setName(""); } }}
      className="flex flex-wrap items-end gap-2 rounded-xl bg-muted/40 p-2"
    >
      <div className="flex-1 min-w-[140px]">
        <Label className="text-xs">Nova turma</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: 2.º A" className="h-9" />
      </div>
      <div>
        <Label className="text-xs">Ano</Label>
        <select className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
          {[1,2,3,4].map((g) => <option key={g} value={g}>{g}.º</option>)}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={!name.trim()}><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
    </form>
  );
}

function ClassCard({
  cls, onOpen, onSave, onDelete,
}: {
  cls: ClassRow;
  onOpen: () => void;
  onSave: (patch: { name?: string; grade?: number }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cls.name);
  const [grade, setGrade] = useState(cls.grade);

  if (editing) {
    return (
      <li className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-end gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 flex-1" />
          <select className="h-9 w-20 rounded-md border border-border bg-background px-2 text-sm" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
            {[1,2,3,4].map((g) => <option key={g} value={g}>{g}.º</option>)}
          </select>
          <Button size="sm" onClick={async () => { await onSave({ name: name.trim(), grade }); setEditing(false); }}>Guardar</Button>
          <Button size="sm" variant="outline" onClick={() => { setName(cls.name); setGrade(cls.grade); setEditing(false); }}>Cancelar</Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
      <button onClick={onOpen} className="flex-1 text-left">
        <p className="font-display">{cls.name} <span className="text-xs text-muted-foreground">· {cls.grade}.º ano</span></p>
        <p className="text-xs text-muted-foreground">Código: <code className="rounded bg-muted px-1">{cls.invite_code}</code></p>
      </button>
      <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Apagar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
    </li>
  );
}
