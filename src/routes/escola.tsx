import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mascot } from "@/components/Mascot";
import { Download, Plus, School, Users } from "lucide-react";
import { toast } from "sonner";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import {
  becomeTeacher,
  listMySchools,
  createSchool,
  listClasses,
  createClass,
  getClassDashboard,
  type SchoolRow,
  type ClassRow,
  type ClassStudentStats,
} from "@/server/school.functions";
import type { MascotId } from "@/lib/mascots";

export const Route = createFileRoute("/escola")({
  head: () => ({
    meta: [
      { title: "Painel da Escola — Kidoz" },
      { name: "description", content: "Painel para professores: turmas, métricas dos alunos e exportação CSV." },
    ],
  }),
  component: EscolaPage,
});

function EscolaPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<ClassStudentStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fnBecome = useServerFn(becomeTeacher);
  const fnSchools = useServerFn(listMySchools);
  const fnCreateSchool = useServerFn(createSchool);
  const fnClasses = useServerFn(listClasses);
  const fnCreateClass = useServerFn(createClass);
  const fnDash = useServerFn(getClassDashboard);

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

  const openClass = async (cls: ClassRow) => {
    setSelectedClass(cls);
    const r = await fnDash({ data: { classId: cls.id } });
    setStudents(r.students);
  };

  const exportCsv = () => {
    if (!selectedClass) return;
    const header = "Nome,Ano,XP,Streak,Sessões,Precisão %,Minutos\n";
    const rows = students.map((s) => `${s.name},${s.grade},${s.xp},${s.streak},${s.sessions},${s.accuracy},${s.minutes}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `turma-${selectedClass.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!profile) return null;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <TopBar profile={profile} />
        <p className="p-8 text-center text-muted-foreground">A carregar painel da escola…</p>
      </div>
    );
  }

  if (profile.role !== "parent" && profile.role !== "child" && (profile.role as string) !== "teacher") {
    // fallback unknown role
  }

  // First-time onboarding: not a teacher and no schools
  const isTeacher = (profile.role as string) === "teacher";

  return (
    <div className="min-h-[100dvh] bg-background pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3">
          <School className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-display text-3xl">Painel da Escola</h1>
            <p className="text-sm text-muted-foreground">Gere turmas, acompanha o progresso e exporta resultados.</p>
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
            {selectedClass && <TabsTrigger value="dash">{selectedClass.name}</TabsTrigger>}
          </TabsList>

          <TabsContent value="schools">
            <NewSchool onCreate={async (name) => {
              const r = await fnCreateSchool({ data: { name } });
              if (r.ok) { toast.success("Escola criada"); refresh(); }
              else toast.error(r.error);
            }} />
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {schools.map((s) => (
                <li key={s.id} className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
                  <p className="font-display text-lg">{s.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Código de convite: <code className="rounded bg-muted px-1">{s.invite_code}</code></p>
                </li>
              ))}
              {schools.length === 0 && <p className="text-sm text-muted-foreground">Ainda não tens escolas. Cria a primeira acima.</p>}
            </ul>
          </TabsContent>

          <TabsContent value="classes">
            <NewClass schools={schools} onCreate={async (data) => {
              const r = await fnCreateClass({ data });
              if (r.ok) { toast.success("Turma criada"); refresh(); }
              else toast.error(r.error);
            }} />
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {classes.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => openClass(c)}
                    className="card-chunky w-full rounded-2xl border-2 border-border bg-card p-4 text-left transition-transform active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg">{c.name}</p>
                      <Badge variant="secondary">Ano {c.grade}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Código alunos: <code className="rounded bg-muted px-1">{c.invite_code}</code>
                    </p>
                  </button>
                </li>
              ))}
              {classes.length === 0 && <p className="text-sm text-muted-foreground">Sem turmas. Cria uma para começar.</p>}
            </ul>
          </TabsContent>

          {selectedClass && (
            <TabsContent value="dash">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl">{selectedClass.name} · {students.length} alunos</h2>
                </div>
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="mr-1 h-4 w-4" />Exportar CSV
                </Button>
              </div>
              {students.length === 0 ? (
                <div className="card-chunky rounded-2xl border-2 border-border bg-card p-6 text-center">
                  <p className="mb-2">Ainda sem alunos.</p>
                  <p className="text-sm text-muted-foreground">Partilha o código <code className="rounded bg-muted px-1">{selectedClass.invite_code}</code> para se juntarem.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border-2 border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 font-display">
                      <tr>
                        <th className="p-2 text-left">Aluno</th>
                        <th className="p-2 text-right">XP</th>
                        <th className="p-2 text-right">🔥</th>
                        <th className="p-2 text-right">Sessões</th>
                        <th className="p-2 text-right">Precisão</th>
                        <th className="p-2 text-right">Min.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.studentId} className="border-t border-border">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Mascot id={s.mascot as MascotId} size="sm" />
                              <span className="font-display">{s.name}</span>
                            </div>
                          </td>
                          <td className="p-2 text-right font-mono">{s.xp}</td>
                          <td className="p-2 text-right">{s.streak}</td>
                          <td className="p-2 text-right">{s.sessions}</td>
                          <td className="p-2 text-right">{s.accuracy}%</td>
                          <td className="p-2 text-right">{s.minutes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
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

function NewClass({ schools, onCreate }: { schools: SchoolRow[]; onCreate: (data: { schoolId: string; name: string; grade: number }) => void }) {
  const [schoolId, setSchoolId] = useState<string>("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(1);
  if (schools.length === 0) return <p className="text-sm text-muted-foreground">Cria primeiro uma escola.</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim() && (schoolId || schools[0])) onCreate({ schoolId: schoolId || schools[0].id, name: name.trim(), grade });
        setName("");
      }}
      className="card-chunky grid gap-2 rounded-2xl border-2 border-border bg-card p-3 md:grid-cols-4"
    >
      <div>
        <Label>Escola</Label>
        <select className="h-10 w-full rounded-md border border-border bg-background px-2" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <Label>Nome da turma</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: 2.º A" />
      </div>
      <div>
        <Label>Ano</Label>
        <select className="h-10 w-full rounded-md border border-border bg-background px-2" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
          {[1,2,3,4].map((g) => <option key={g} value={g}>{g}.º ano</option>)}
        </select>
      </div>
      <div className="md:col-span-4 flex justify-end">
        <Button type="submit" disabled={!name.trim()}><Plus className="mr-1 h-4 w-4" />Criar turma</Button>
      </div>
    </form>
  );
}
