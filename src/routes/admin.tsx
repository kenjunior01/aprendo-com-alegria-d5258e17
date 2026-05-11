import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Shield, Users, CreditCard, Trophy, ShoppingBag, GraduationCap,
  Swords, BarChart3, Search, Crown, UserCog, Loader2, RefreshCw,
  Calendar, Sparkles, ArrowLeft, FileText, Plus, Trash2, Save, Eye,
  History, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip as RTooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kidoz" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Profile = {
  id: string;
  name: string;
  role: string;
  grade: number;
  age: number;
  mascot: string;
  xp: number;
  coins: number;
  gems: number;
  streak: number;
  is_premium: boolean;
  trial_until: string | null;
  created_at: string;
  last_played: string | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <BootstrapOrDeny userId={user!.id} />;
  return <AdminDashboard />;
}

function BootstrapOrDeny({ userId }: { userId: string }) {
  const [claiming, setClaiming] = useState(false);
  const claim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data) {
      toast.success("És agora administrador. A recarregar...");
      setTimeout(() => window.location.reload(), 800);
    } else {
      toast.error("Já existe um admin. Pede a um admin para te promover.");
    }
  };
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <Card className="max-w-md p-8 text-center space-y-4">
        <Shield className="h-10 w-10 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="text-muted-foreground">
          Esta área é exclusiva para administradores. Se ainda não existe nenhum admin nesta plataforma,
          podes reivindicar o primeiro acesso de admin com a tua conta.
        </p>
        <p className="text-xs text-muted-foreground font-mono break-all">{userId}</p>
        <div className="flex flex-col gap-2">
          <Button onClick={claim} disabled={claiming}>
            {claiming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Reivindicar primeiro admin
          </Button>
          <Button asChild variant="ghost"><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Link></Button>
        </div>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold leading-tight">Painel Admin</h1>
                <p className="text-xs text-muted-foreground">Kidoz · gestão da plataforma</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Sair</Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" />Visão geral</TabsTrigger>
              <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" />Analytics</TabsTrigger>
              <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Utilizadores</TabsTrigger>
              <TabsTrigger value="subs"><CreditCard className="h-4 w-4 mr-1" />Subscrições</TabsTrigger>
              <TabsTrigger value="content"><FileText className="h-4 w-4 mr-1" />Conteúdos</TabsTrigger>
              <TabsTrigger value="challenges"><Swords className="h-4 w-4 mr-1" />Desafios</TabsTrigger>
              <TabsTrigger value="schools"><GraduationCap className="h-4 w-4 mr-1" />Escolas</TabsTrigger>
              <TabsTrigger value="shop"><ShoppingBag className="h-4 w-4 mr-1" />Loja</TabsTrigger>
              <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-1" />Conquistas</TabsTrigger>
              <TabsTrigger value="roles"><UserCog className="h-4 w-4 mr-1" />Funções</TabsTrigger>
              <TabsTrigger value="audit"><History className="h-4 w-4 mr-1" />Auditoria</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
            <TabsContent value="analytics" className="mt-6"><AnalyticsTab /></TabsContent>
            <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
            <TabsContent value="subs" className="mt-6"><SubsTab /></TabsContent>
            <TabsContent value="content" className="mt-6"><ContentTab /></TabsContent>
            <TabsContent value="challenges" className="mt-6"><ChallengesTab /></TabsContent>
            <TabsContent value="schools" className="mt-6"><SchoolsTab /></TabsContent>
            <TabsContent value="shop" className="mt-6"><ShopTab /></TabsContent>
            <TabsContent value="achievements" className="mt-6"><AchievementsTab /></TabsContent>
            <TabsContent value="roles" className="mt-6"><RolesTab /></TabsContent>
            <TabsContent value="audit" className="mt-6"><AuditTab /></TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}

/* ───────────────── Overview ───────────────── */
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [profiles, subs, sessions, challenges, schools, scores] = await Promise.all([
      supabase.from("profiles").select("id, role, is_premium, trial_until, created_at", { count: "exact" }),
      supabase.from("subscriptions").select("id, status, environment", { count: "exact" }),
      supabase.from("practice_sessions").select("id, xp_earned, created_at").gte("created_at", since),
      supabase.from("challenges").select("id, status", { count: "exact" }),
      supabase.from("schools").select("id", { count: "exact" }),
      supabase.from("infinite_scores").select("id", { count: "exact" }),
    ]);
    const totalUsers = profiles.count ?? 0;
    const trialActive = (profiles.data ?? []).filter((p: any) => p.trial_until && new Date(p.trial_until) > new Date()).length;
    const activeSubs = (subs.data ?? []).filter((s: any) => s.status === "active" || s.status === "trialing").length;
    const xp7d = (sessions.data ?? []).reduce((a: number, s: any) => a + (s.xp_earned ?? 0), 0);
    setStats({
      totalUsers,
      newUsers7d: (profiles.data ?? []).filter((p: any) => new Date(p.created_at) > new Date(since)).length,
      trialActive, activeSubs,
      sessions7d: (sessions.data ?? []).length,
      xp7d,
      challenges: challenges.count ?? 0,
      schools: schools.count ?? 0,
      scores: scores.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  const cards = [
    { label: "Utilizadores totais", value: stats.totalUsers, icon: Users, hint: `+${stats.newUsers7d} nos últimos 7 dias` },
    { label: "Subscrições ativas", value: stats.activeSubs, icon: CreditCard },
    { label: "Trials a decorrer", value: stats.trialActive, icon: Sparkles },
    { label: "Sessões (7 dias)", value: stats.sessions7d, icon: BarChart3, hint: `${stats.xp7d.toLocaleString("pt-PT")} XP ganho` },
    { label: "Desafios PvP", value: stats.challenges, icon: Swords },
    { label: "Escolas", value: stats.schools, icon: GraduationCap },
    { label: "Scores Infinitos", value: stats.scores, icon: Trophy },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visão geral</h2>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" /> Atualizar</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs">{c.label}</span>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold mt-1">{c.value.toLocaleString("pt-PT")}</div>
            {c.hint && <div className="text-xs text-muted-foreground mt-1">{c.hint}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Analytics ───────────────── */
function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    daily: { date: string; sessions: number; xp: number; activeUsers: number }[];
    weekly: { week: string; sessions: number }[];
    bySchool: { name: string; xp: number }[];
    funnel: { trials: number; converted: number; rate: number };
    retention: { day: string; pct: number }[];
  } | null>(null);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sinceIso = since.toISOString();

    const [sessRes, profRes, subRes, schoolsRes, classMembersRes] = await Promise.all([
      supabase.from("practice_sessions").select("user_id, xp_earned, created_at").gte("created_at", sinceIso).limit(5000),
      supabase.from("profiles").select("id, created_at, trial_until").limit(5000),
      supabase.from("subscriptions").select("user_id, status, created_at").limit(2000),
      supabase.from("schools").select("id, name"),
      supabase.from("class_members").select("student_id, class_id, classes(school_id)").limit(5000),
    ]);

    const sessions = sessRes.data ?? [];

    // Daily series
    const dayMap: Record<string, { sessions: number; xp: number; users: Set<string> }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const k = d.toISOString().slice(0, 10);
      dayMap[k] = { sessions: 0, xp: 0, users: new Set() };
    }
    sessions.forEach((s: any) => {
      const k = (s.created_at as string).slice(0, 10);
      if (!dayMap[k]) dayMap[k] = { sessions: 0, xp: 0, users: new Set() };
      dayMap[k].sessions++;
      dayMap[k].xp += s.xp_earned ?? 0;
      dayMap[k].users.add(s.user_id);
    });
    const daily = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date: date.slice(5), sessions: v.sessions, xp: v.xp, activeUsers: v.users.size }));

    // Weekly aggregation
    const weekMap: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const d = new Date(s.created_at);
      const dayOfWeek = (d.getDay() + 6) % 7;
      const weekStart = new Date(d.getTime() - dayOfWeek * 86400000).toISOString().slice(0, 10);
      weekMap[weekStart] = (weekMap[weekStart] ?? 0) + 1;
    });
    const weekly = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b)).map(([week, sessionsCount]) => ({ week: week.slice(5), sessions: sessionsCount }));

    // XP by school
    const schoolByStudent: Record<string, string> = {};
    (classMembersRes.data ?? []).forEach((cm: any) => {
      if (cm.classes?.school_id) schoolByStudent[cm.student_id] = cm.classes.school_id;
    });
    const schoolNames: Record<string, string> = {};
    (schoolsRes.data ?? []).forEach((s: any) => { schoolNames[s.id] = s.name; });
    const xpBySchool: Record<string, number> = {};
    sessions.forEach((s: any) => {
      const sid = schoolByStudent[s.user_id];
      if (!sid) return;
      xpBySchool[sid] = (xpBySchool[sid] ?? 0) + (s.xp_earned ?? 0);
    });
    const bySchool = Object.entries(xpBySchool)
      .map(([sid, xp]) => ({ name: schoolNames[sid] ?? sid.slice(0, 6), xp }))
      .sort((a, b) => b.xp - a.xp).slice(0, 10);

    // Trial → Premium funnel
    const profiles = profRes.data ?? [];
    const trialUsers = new Set(profiles.filter((p: any) => p.trial_until).map((p: any) => p.id));
    const subUsers = new Set((subRes.data ?? []).filter((s: any) => s.status === "active").map((s: any) => s.user_id));
    const converted = [...trialUsers].filter((u) => subUsers.has(u as string)).length;
    const trials = trialUsers.size;
    const funnel = { trials, converted, rate: trials > 0 ? Math.round((converted / trials) * 100) : 0 };

    // Retention: % of new users from N days ago who returned in the last 7 days
    const cohorts = [1, 7, 14, 30].filter((n) => n <= days);
    const recent7 = new Date(Date.now() - 7 * 86400000);
    const returnedUsers = new Set(sessions.filter((s: any) => new Date(s.created_at) > recent7).map((s: any) => s.user_id));
    const retention = cohorts.map((n) => {
      const cohortStart = new Date(Date.now() - n * 86400000);
      const cohortEnd = new Date(Date.now() - (n - 1) * 86400000);
      const cohort = profiles.filter((p: any) => {
        const c = new Date(p.created_at);
        return c >= cohortStart && c < cohortEnd;
      });
      const returned = cohort.filter((p: any) => returnedUsers.has(p.id)).length;
      return { day: `D-${n}`, pct: cohort.length > 0 ? Math.round((returned / cohort.length) * 100) : 0 };
    });

    setData({ daily, weekly, bySchool, funnel, retention });
    setLoading(false);
  };

  useEffect(() => { load(); }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <div className="flex gap-1">
          {[7, 30, 90].map((n) => (
            <Button key={n} size="sm" variant={days === n ? "default" : "outline"} onClick={() => setDays(n)}>{n}d</Button>
          ))}
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading || !data ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <>
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Trials → Premium</div>
              <div className="text-2xl font-bold">{data.funnel.rate}%</div>
              <div className="text-xs text-muted-foreground">{data.funnel.converted} de {data.funnel.trials}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">Sessões no período</div>
              <div className="text-2xl font-bold">{data.daily.reduce((a, d) => a + d.sessions, 0).toLocaleString("pt-PT")}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-muted-foreground">XP total</div>
              <div className="text-2xl font-bold">{data.daily.reduce((a, d) => a + d.xp, 0).toLocaleString("pt-PT")}</div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Sessões diárias e utilizadores ativos</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" name="Sessões" />
                  <Line type="monotone" dataKey="activeUsers" stroke="hsl(var(--accent))" name="Ativos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-2">Sessões semanais</h3>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={data.weekly}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="week" fontSize={11} />
                  <YAxis fontSize={11} />
                  <RTooltip />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">XP por escola (top 10)</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={data.bySchool} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={11} />
                    <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                    <RTooltip />
                    <Bar dataKey="xp" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {data.bySchool.length === 0 && <p className="text-xs text-muted-foreground">Sem dados por escola.</p>}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Retenção de novos utilizadores</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={data.retention}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} unit="%" />
                    <RTooltip />
                    <Bar dataKey="pct" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground">% que voltou nos últimos 7 dias.</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────── Users (with bulk actions + filters) ───────────────── */
function UsersTab() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [classMap, setClassMap] = useState<Record<string, { classId: string; schoolId: string | null }>>({});
  const [classes, setClasses] = useState<{ id: string; name: string; school_id: string | null }[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [premiumFilter, setPremiumFilter] = useState<"all" | "premium" | "trial" | "free">("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const [profRes, clsRes, schRes, memRes] = await Promise.all([
      supabase.from("profiles").select("id, name, role, grade, age, mascot, xp, coins, gems, streak, is_premium, trial_until, created_at, last_played").order("created_at", { ascending: false }).limit(1000),
      supabase.from("classes").select("id, name, school_id"),
      supabase.from("schools").select("id, name"),
      supabase.from("class_members").select("student_id, class_id, classes(school_id)").limit(5000),
    ]);
    setRows((profRes.data as any) ?? []);
    setClasses((clsRes.data as any) ?? []);
    setSchools((schRes.data as any) ?? []);
    const map: Record<string, { classId: string; schoolId: string | null }> = {};
    (memRes.data ?? []).forEach((cm: any) => {
      map[cm.student_id] = { classId: cm.class_id, schoolId: cm.classes?.school_id ?? null };
    });
    setClassMap(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filteredClasses = useMemo(() =>
    schoolFilter === "all" ? classes : classes.filter((c) => c.school_id === schoolFilter)
  , [classes, schoolFilter]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      const trialActive = r.trial_until && new Date(r.trial_until) > new Date();
      if (premiumFilter === "premium" && !r.is_premium) return false;
      if (premiumFilter === "trial" && !trialActive) return false;
      if (premiumFilter === "free" && (r.is_premium || trialActive)) return false;
      const m = classMap[r.id];
      if (schoolFilter !== "all" && m?.schoolId !== schoolFilter) return false;
      if (classFilter !== "all" && m?.classId !== classFilter) return false;
      if (!term) return true;
      return r.name?.toLowerCase().includes(term) || r.id.toLowerCase().includes(term);
    });
  }, [rows, q, roleFilter, premiumFilter, schoolFilter, classFilter, classMap]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const s = new Set(selected);
    if (allSelected) filtered.forEach((r) => s.delete(r.id));
    else filtered.forEach((r) => s.add(r.id));
    setSelected(s);
  };
  const toggleOne = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const [results, setResults] = useState<{ id: string; name: string; ok: boolean; error?: string }[] | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const runBulk = async (mode: "grant" | "revoke", days?: number) => {
    if (selected.size === 0) return toast.error("Seleciona pelo menos um utilizador");
    setBusy(true);
    setResults(null);
    const ids = [...selected];
    const nameById = new Map(rows.map((r) => [r.id, r.name || "(sem nome)"]));
    const update = mode === "grant"
      ? { trial_until: new Date(Date.now() + (days ?? 30) * 86400000).toISOString(), is_premium: true }
      : { trial_until: null, is_premium: false };

    const out: { id: string; name: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
      const { error } = await supabase.from("profiles").update(update).eq("id", id);
      out.push({ id, name: nameById.get(id) ?? id, ok: !error, error: error?.message });
    }
    setBusy(false);
    setResults(out);
    const okCount = out.filter((r) => r.ok).length;
    const failCount = out.length - okCount;
    if (failCount === 0) toast.success(`${okCount} utilizadores atualizados`);
    else toast.warning(`${okCount} ok · ${failCount} falharam`);
    if (okCount > 0) setSelected(new Set());
    load();
  };

  const bulkGrant = (days: number) => runBulk("grant", days);
  const bulkRevoke = () => runBulk("revoke");

  const grantTrial = async (id: string, days: number) => {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await supabase.from("profiles").update({ trial_until: until, is_premium: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Trial de ${days} dias atribuído`); load();
  };
  const revokeTrial = async (id: string) => {
    const { error } = await supabase.from("profiles").update({ trial_until: null, is_premium: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Trial removido"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome ou ID..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Papel:</span>
        {["all", "child", "parent", "teacher"].map((r) => (
          <Button key={r} size="sm" variant={roleFilter === r ? "default" : "outline"} onClick={() => setRoleFilter(r)}>
            {r === "all" ? "Todos" : r}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">Premium:</span>
        {(["all", "premium", "trial", "free"] as const).map((p) => (
          <Button key={p} size="sm" variant={premiumFilter === p ? "default" : "outline"} onClick={() => setPremiumFilter(p)}>
            {p === "all" ? "Todos" : p}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Escola:</span>
        <select className="h-9 rounded-md border bg-background px-2 text-sm" value={schoolFilter}
          onChange={(e) => { setSchoolFilter(e.target.value); setClassFilter("all"); }}>
          <option value="all">Todas</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">Turma:</span>
        <select className="h-9 rounded-md border bg-background px-2 text-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">Todas</option>
          {filteredClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Card className="p-3 bg-muted/40">
        <div className="flex flex-wrap items-center gap-2">
          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
          <span className="text-sm font-medium">{selected.size} seleccionados</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" disabled={busy || selected.size === 0} onClick={() => bulkGrant(30)}>
              <Calendar className="h-3 w-3 mr-1" /> Atribuir +30d trial
            </Button>
            <Button size="sm" variant="outline" disabled={busy || selected.size === 0} onClick={() => bulkGrant(365)}>+1 ano</Button>
            <Button size="sm" variant="ghost" disabled={busy || selected.size === 0} onClick={() => setConfirmRevoke(true)}>
              <Trash2 className="h-3 w-3 mr-1" /> Remover trial
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remover trial em massa?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vais remover o trial e o estado premium de <strong>{selected.size}</strong> utilizadores.
              Esta ação fica registada na auditoria e não pode ser desfeita automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmRevoke(false); bulkRevoke(); }}>
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {results && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Resultado da operação · {results.filter((r) => r.ok).length} ok · {results.filter((r) => !r.ok).length} falhas
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setResults(null)}>Fechar</Button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {results.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-xs">
                {r.ok ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-destructive" />}
                <span className="font-medium truncate">{r.name}</span>
                <span className="text-muted-foreground font-mono truncate">{r.id.slice(0, 8)}</span>
                {r.error && <span className="text-destructive truncate">— {r.error}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{filtered.length} de {rows.length} utilizadores</p>
          {filtered.map((p) => {
            const trialActive = p.trial_until && new Date(p.trial_until) > new Date();
            return (
              <Card key={p.id} className="p-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{p.name || "(sem nome)"}</span>
                      <Badge variant="secondary" className="text-xs">{p.role}</Badge>
                      {p.is_premium && <Badge className="text-xs"><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
                      {trialActive && <Badge variant="outline" className="text-xs">Trial até {new Date(p.trial_until!).toLocaleDateString("pt-PT")}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {p.id} · {p.age}a · {p.grade}.º · XP {p.xp} · {p.coins}🪙 · 🔥{p.streak}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => grantTrial(p.id, 30)}>+30d</Button>
                    <Button size="sm" variant="outline" onClick={() => grantTrial(p.id, 365)}>+1 ano</Button>
                    {trialActive && <Button size="sm" variant="ghost" onClick={() => revokeTrial(p.id)}>Remover</Button>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Subscriptions ───────────────── */
function SubsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(200);
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Subscrições ({rows.length})</h2>
        <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : rows.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground text-sm">Sem subscrições registadas.</Card>
      ) : rows.map((s) => (
        <Card key={s.id} className="p-3 text-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-medium">{s.price_id}</div>
              <div className="text-xs text-muted-foreground">user {s.user_id.slice(0, 8)} · {s.environment}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={s.status === "active" || s.status === "trialing" ? "default" : "secondary"}>{s.status}</Badge>
              {s.current_period_end && (
                <span className="text-xs text-muted-foreground">até {new Date(s.current_period_end).toLocaleDateString("pt-PT")}</span>
              )}
              {s.cancel_at_period_end && <Badge variant="outline">cancela no fim</Badge>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ───────────────── Content (lessons, exercises, etc.) ───────────────── */
type ContentItem = {
  id: string; type: string; subject_id: string | null; lesson_id: string | null;
  title: string; body: any; grade: number | null; active: boolean; sort_order: number;
};
function ContentTab() {
  const [rows, setRows] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Partial<ContentItem> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("content_items" as any).select("*").order("sort_order");
    if (error) toast.error(error.message);
    setRows(((data as any) ?? []) as ContentItem[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEdit({ type: "lesson", title: "", subject_id: "", lesson_id: "", body: {}, grade: 1, active: true, sort_order: 0 });
    setOpen(true);
  };
  const startEdit = (it: ContentItem) => { setEdit({ ...it }); setOpen(true); };
  const remove = async (id: string) => {
    if (!confirm("Apagar este conteúdo?")) return;
    const { error } = await supabase.from("content_items" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Apagado"); load();
  };
  const toggleActive = async (it: ContentItem) => {
    const { error } = await supabase.from("content_items" as any).update({ active: !it.active }).eq("id", it.id);
    if (error) return toast.error(error.message);
    load();
  };

  const filtered = typeFilter === "all" ? rows : rows.filter((r) => r.type === typeFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Conteúdos infantis ({rows.length})</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" /> Novo</Button>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {["all", "lesson", "level", "exercise", "challenge", "text"].map((t) => (
          <Button key={t} size="sm" variant={typeFilter === t ? "default" : "outline"} onClick={() => setTypeFilter(t)}>{t === "all" ? "Todos" : t}</Button>
        ))}
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : filtered.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground text-sm">Sem conteúdos. Cria o primeiro com "Novo".</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => (
            <Card key={it.id} className="p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{it.type}</Badge>
                    <span className="font-medium truncate">{it.title}</span>
                    {!it.active && <Badge variant="outline" className="text-xs">inativo</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {it.subject_id || "—"} · {it.lesson_id || "—"} · {it.grade ? `${it.grade}.º` : "todos"} · ordem {it.sort_order}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={it.active} onCheckedChange={() => toggleActive(it)} />
                  <Button size="sm" variant="outline" onClick={() => startEdit(it)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ContentDialog open={open} onOpenChange={setOpen} value={edit} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function ContentDialog({ open, onOpenChange, value, onSaved }: {
  open: boolean; onOpenChange: (b: boolean) => void; value: Partial<ContentItem> | null; onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Partial<ContentItem>>({});
  const [bodyText, setBodyText] = useState("{}");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (value) {
      setDraft(value);
      setBodyText(JSON.stringify(value.body ?? {}, null, 2));
    }
  }, [value]);

  const save = async () => {
    if (!draft.title?.trim()) return toast.error("Título obrigatório");
    if (!draft.type) return toast.error("Tipo obrigatório");
    let body: any;
    try { body = JSON.parse(bodyText || "{}"); } catch { return toast.error("Body não é JSON válido"); }

    setBusy(true);
    const payload = {
      type: draft.type,
      title: draft.title.trim(),
      subject_id: draft.subject_id || null,
      lesson_id: draft.lesson_id || null,
      grade: draft.grade ?? null,
      active: draft.active ?? true,
      sort_order: draft.sort_order ?? 0,
      body,
    };
    const res = draft.id
      ? await supabase.from("content_items" as any).update(payload).eq("id", draft.id)
      : await supabase.from("content_items" as any).insert(payload);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Guardado");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{draft.id ? "Editar conteúdo" : "Novo conteúdo"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">Tipo
              <select className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={draft.type ?? "lesson"} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                {["lesson", "level", "exercise", "challenge", "text"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm">Ano
              <Input type="number" value={draft.grade ?? ""} onChange={(e) => setDraft({ ...draft, grade: e.target.value ? Number(e.target.value) : null })} />
            </label>
          </div>
          <label className="text-sm block">Título
            <Input value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">Subject ID
              <Input value={draft.subject_id ?? ""} onChange={(e) => setDraft({ ...draft, subject_id: e.target.value })} />
            </label>
            <label className="text-sm">Lesson ID
              <Input value={draft.lesson_id ?? ""} onChange={(e) => setDraft({ ...draft, lesson_id: e.target.value })} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-sm">Ordem
              <Input type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
            </label>
            <label className="text-sm flex items-center gap-2 mt-5">
              <Switch checked={draft.active ?? true} onCheckedChange={(c) => setDraft({ ...draft, active: c })} /> Ativo
            </label>
          </div>
          <label className="text-sm block">Body (JSON — perguntas, opções, conteúdo)
            <Textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} className="font-mono text-xs h-40" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────── Challenges ───────────────── */
function ChallengesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("challenges").select("*").order("created_at", { ascending: false }).limit(100);
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Desafios ({rows.length})</h2>
        <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : rows.map((c) => (
        <Card key={c.id} className="p-3 text-sm flex items-center justify-between">
          <div>
            <div className="font-medium">{c.subject_id} · {c.lesson_id}</div>
            <div className="text-xs text-muted-foreground">{c.kind} · {new Date(c.created_at).toLocaleString("pt-PT")}</div>
          </div>
          <Badge variant={c.status === "completed" ? "default" : "secondary"}>{c.status}</Badge>
        </Card>
      ))}
    </div>
  );
}

/* ───────────────── Schools ───────────────── */
function SchoolsTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("schools").select("*, classes(id, name, grade)").order("created_at", { ascending: false });
    setRows(data ?? []);
  })(); }, []);
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Escolas ({rows.length})</h2>
      {rows.map((s) => (
        <Card key={s.id} className="p-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">código: {s.invite_code} · {s.classes?.length ?? 0} turmas</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ───────────────── Shop (full edit + preview) ───────────────── */
type ShopRow = {
  id: string; name: string; type: string; price: number; emoji: string;
  premium: boolean; mascot: string | null; sort_order: number;
  period: string | null; active: boolean;
};
function ShopTab() {
  const [rows, setRows] = useState<ShopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Partial<ShopRow> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shop_items").select("*").order("sort_order");
    setRows(((data as any) ?? []) as ShopRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const togglePremium = async (id: string, current: boolean) => {
    const { error } = await supabase.from("shop_items").update({ premium: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado"); load();
  };
  const toggleActive = async (it: ShopRow) => {
    const { error } = await supabase.from("shop_items").update({ active: !it.active } as any).eq("id", it.id);
    if (error) return toast.error(error.message);
    load();
  };
  const startNew = () => { setEdit({ id: "", name: "", type: "hat", price: 0, emoji: "🎁", premium: false, mascot: null, sort_order: 0, period: null, active: true }); setOpen(true); };
  const startEdit = (it: ShopRow) => { setEdit({ ...it }); setOpen(true); };
  const remove = async (id: string) => {
    if (!confirm("Apagar este item?")) return;
    const { error } = await supabase.from("shop_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Apagado"); load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Loja ({rows.length} itens)</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" /> Novo item</Button>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : rows.map((it) => (
        <Card key={it.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{it.emoji}</span>
            <div>
              <div className="font-medium flex items-center gap-2">
                {it.name} {!it.active && <Badge variant="outline" className="text-xs">inativo</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">
                {it.type} · {it.price}🪙{it.period ? ` / ${it.period}` : ""}{it.mascot ? ` · ${it.mascot}` : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Switch checked={it.active} onCheckedChange={() => toggleActive(it)} />
            <Button size="sm" variant={it.premium ? "default" : "outline"} onClick={() => togglePremium(it.id, it.premium)}>
              <Crown className="h-3 w-3 mr-1" /> {it.premium ? "Premium" : "Grátis"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => startEdit(it)}>Editar</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </Card>
      ))}
      <ShopDialog open={open} onOpenChange={setOpen} value={edit} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function ShopDialog({ open, onOpenChange, value, onSaved }: {
  open: boolean; onOpenChange: (b: boolean) => void; value: Partial<ShopRow> | null; onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Partial<ShopRow>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const isNew = !value?.id;

  useEffect(() => { if (value) { setDraft(value); setShowPreview(false); } }, [value]);

  const errors: string[] = [];
  if (!draft.id?.trim()) errors.push("ID obrigatório");
  if (!draft.name?.trim()) errors.push("Nome obrigatório");
  if (!draft.type) errors.push("Tipo obrigatório");
  if ((draft.price ?? -1) < 0) errors.push("Preço deve ser ≥ 0");
  if (!draft.emoji?.trim()) errors.push("Emoji obrigatório");

  const save = async () => {
    if (errors.length) return toast.error(errors[0]);
    setBusy(true);
    const payload: any = {
      id: draft.id, name: draft.name, type: draft.type, price: draft.price,
      emoji: draft.emoji, premium: draft.premium ?? false, mascot: draft.mascot || null,
      sort_order: draft.sort_order ?? 0, period: draft.period || null, active: draft.active ?? true,
    };
    const res = isNew
      ? await supabase.from("shop_items").insert(payload)
      : await supabase.from("shop_items").update(payload).eq("id", draft.id!);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(isNew ? "Item criado" : "Item atualizado");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "Novo item da loja" : "Editar item"}</DialogTitle></DialogHeader>
        {showPreview ? (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="text-center space-y-2">
              <div className="text-6xl">{draft.emoji}</div>
              <div className="font-bold text-lg">{draft.name}</div>
              <Badge variant="secondary">{draft.type}</Badge>
              <div className="text-2xl font-bold">{draft.price}🪙{draft.period ? <span className="text-sm font-normal"> / {draft.period}</span> : ""}</div>
              {draft.premium && <Badge><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
              {!draft.active && <Badge variant="outline">Inativo</Badge>}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-sm">ID
                <Input value={draft.id ?? ""} disabled={!isNew} onChange={(e) => setDraft({ ...draft, id: e.target.value })} />
              </label>
              <label className="text-sm">Tipo
                <select className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  value={draft.type ?? "hat"} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                  {["hat", "outfit", "scene", "badge"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>
            <label className="text-sm block">Nome
              <Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="text-sm">Emoji
                <Input value={draft.emoji ?? ""} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} />
              </label>
              <label className="text-sm">Preço (moedas)
                <Input type="number" value={draft.price ?? 0} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
              </label>
              <label className="text-sm">Periodicidade
                <select className="mt-1 w-full h-9 rounded-md border bg-background px-2 text-sm"
                  value={draft.period ?? ""} onChange={(e) => setDraft({ ...draft, period: e.target.value || null })}>
                  <option value="">única</option>
                  <option value="day">por dia</option>
                  <option value="week">por semana</option>
                  <option value="month">por mês</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <label className="text-sm">Ordem
                <Input type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
              </label>
              <label className="text-sm flex items-center gap-2 mt-5">
                <Switch checked={draft.premium ?? false} onCheckedChange={(c) => setDraft({ ...draft, premium: c })} /> Premium
              </label>
              <label className="text-sm flex items-center gap-2 mt-5">
                <Switch checked={draft.active ?? true} onCheckedChange={(c) => setDraft({ ...draft, active: c })} /> Ativo
              </label>
            </div>
            {errors.length > 0 && (
              <div className="text-xs text-destructive space-y-1">
                {errors.map((e) => <div key={e}>• {e}</div>)}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-1" /> {showPreview ? "Editar" : "Pré-visualizar"}
          </Button>
          <Button onClick={save} disabled={busy || errors.length > 0}>
            {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Publicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────── Achievements ───────────────── */
function AchievementsTab() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("achievements").select("*").order("sort_order");
    setRows(data ?? []);
  })(); }, []);
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Conquistas ({rows.length})</h2>
      <div className="grid sm:grid-cols-2 gap-2">
        {rows.map((a) => (
          <Card key={a.id} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{a.title}</div>
              <Badge variant="secondary" className="text-xs">{a.category}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{a.description}</div>
            <div className="text-xs mt-1">+{a.coin_reward}🪙 +{a.xp_reward} XP · {a.requirement_type} ≥ {a.requirement_value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Roles ───────────────── */
function RolesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const load = async () => {
    const { data } = await supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const grant = async (role: "admin" | "moderator") => {
    if (!userId.trim()) return toast.error("Coloca um user_id");
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role });
    if (error) return toast.error(error.message);
    toast.success(`Função ${role} atribuída`); setUserId(""); load();
  };
  const revoke = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Função removida"); load();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <h3 className="font-semibold">Atribuir função</h3>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="user_id (uuid)" value={userId} onChange={(e) => setUserId(e.target.value)} className="flex-1 min-w-[260px]" />
          <Button onClick={() => grant("admin")}><Shield className="h-4 w-4 mr-1" />Admin</Button>
          <Button variant="outline" onClick={() => grant("moderator")}>Moderador</Button>
        </div>
        <p className="text-xs text-muted-foreground">Dica: o user_id está na aba Utilizadores.</p>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold">Funções atribuídas ({rows.length})</h3>
        {rows.map((r) => (
          <Card key={r.id} className="p-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-mono text-xs">{r.user_id}</div>
              <Badge className="mt-1">{r.role}</Badge>
            </div>
            <Button size="sm" variant="ghost" onClick={() => revoke(r.id)}>Remover</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Audit ───────────────── */
type AuditRow = {
  id: string;
  actor_id: string | null;
  entity: string;
  entity_id: string | null;
  action: string;
  before: any;
  after: any;
  created_at: string;
};
type AuditCursor = { created_at: string; id: string } | null;

function AuditTab() {
  // 1) ALL hooks declared unconditionally and in stable order
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [actors, setActors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Stack of cursors: cursors[i] = cursor used to fetch page i (index 0 = first page = null)
  const [cursors, setCursors] = useState<AuditCursor[]>([null]);
  const [reloadTick, setReloadTick] = useState(0);
  const [detail, setDetail] = useState<AuditRow | null>(null);
  const PAGE_SIZE = 25;

  // Column visibility (persisted)
  const COLS: { key: string; label: string }[] = [
    { key: "entity", label: "Entidade" },
    { key: "action", label: "Ação" },
    { key: "actor", label: "Admin" },
    { key: "summary", label: "Resumo" },
    { key: "entity_id", label: "Entity ID" },
    { key: "audit_id", label: "Audit ID" },
    { key: "created_at", label: "Data" },
  ];
  const COLS_KEY = "admin.audit.cols.v1";
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return Object.fromEntries(COLS.map((c) => [c.key, c.key !== "audit_id"]));
    try {
      const raw = localStorage.getItem(COLS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return Object.fromEntries(COLS.map((c) => [c.key, c.key !== "audit_id"]));
  });
  useEffect(() => {
    try { localStorage.setItem(COLS_KEY, JSON.stringify(visibleCols)); } catch {}
  }, [visibleCols]);
  const toggleCol = (k: string) => setVisibleCols((v) => ({ ...v, [k]: !v[k] }));
  const showCol = (k: string) => visibleCols[k] !== false;

  // Debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset cursor stack whenever filters/search change
  useEffect(() => { setCursors([null]); }, [entityFilter, actionFilter, debouncedSearch]);

  const currentCursor = cursors[cursors.length - 1] ?? null;
  const pageNumber = cursors.length;

  // Server-side keyset (cursor) pagination
  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmin) { setLoading(false); return; }

    let cancelled = false;
    (async () => {
      setLoading(true);

      let q = supabase
        .from("audit_log" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(PAGE_SIZE + 1);

      if (entityFilter !== "all") q = q.eq("entity", entityFilter);
      if (actionFilter !== "all") q = q.eq("action", actionFilter);

      if (currentCursor) {
        // Keyset: (created_at, id) < (cursor.created_at, cursor.id)
        q = q.or(
          `created_at.lt.${currentCursor.created_at},and(created_at.eq.${currentCursor.created_at},id.lt.${currentCursor.id})`,
        );
      }

      if (debouncedSearch) {
        const s = debouncedSearch.replace(/[%,()]/g, "");
        const like = `%${s}%`;
        q = q.or(
          [
            `entity.ilike.${like}`,
            `action.ilike.${like}`,
            `entity_id.ilike.${like}`,
            `actor_id::text.ilike.${like}`,
            `before::text.ilike.${like}`,
            `after::text.ilike.${like}`,
          ].join(","),
        );
      }

      const { data, error } = await q;
      if (cancelled) return;

      if (error) {
        toast.error(error.message);
        setRows([]);
        setHasNext(false);
        setLoading(false);
        return;
      }
      const list = ((data as any) ?? []) as AuditRow[];
      const more = list.length > PAGE_SIZE;
      const pageRows = more ? list.slice(0, PAGE_SIZE) : list;
      setRows(pageRows);
      setHasNext(more);

      const ids = [...new Set(pageRows.map((r) => r.actor_id).filter(Boolean))] as string[];
      if (ids.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, name").in("id", ids);
        if (cancelled) return;
        setActors((prev) => {
          const map = { ...prev };
          (profs ?? []).forEach((p: any) => { map[p.id] = p.name || p.id.slice(0, 8); });
          return map;
        });
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, isAdmin, cursors, entityFilter, actionFilter, debouncedSearch, reloadTick]);

  const goNext = () => {
    if (!hasNext || rows.length === 0) return;
    const last = rows[rows.length - 1];
    setCursors((cs) => [...cs, { created_at: last.created_at, id: last.id }]);
  };
  const goPrev = () => {
    setCursors((cs) => (cs.length > 1 ? cs.slice(0, -1) : cs));
  };
  const reload = () => { setCursors([null]); setReloadTick((t) => t + 1); };

  const summarize = (r: AuditRow): string => {
    if (r.entity === "profile_trial") {
      const b = r.before ?? {}; const a = r.after ?? {};
      const trial = b.trial_until !== a.trial_until
        ? `trial: ${b.trial_until ? new Date(b.trial_until).toLocaleDateString("pt-PT") : "—"} → ${a.trial_until ? new Date(a.trial_until).toLocaleDateString("pt-PT") : "—"}`
        : "";
      const prem = b.is_premium !== a.is_premium ? `premium: ${b.is_premium} → ${a.is_premium}` : "";
      return [trial, prem].filter(Boolean).join(" · ");
    }
    if (r.action === "insert") return `criado: ${r.after?.name ?? r.after?.title ?? r.entity_id}`;
    if (r.action === "delete") return `apagado: ${r.before?.name ?? r.before?.title ?? r.entity_id}`;
    if (r.action === "update") {
      const changes: string[] = [];
      const b = r.before ?? {}; const a = r.after ?? {};
      Object.keys(a).forEach((k) => {
        if (k === "updated_at" || k === "created_at") return;
        if (JSON.stringify(b[k]) !== JSON.stringify(a[k])) {
          changes.push(`${k}: ${JSON.stringify(b[k])} → ${JSON.stringify(a[k])}`);
        }
      });
      return changes.slice(0, 3).join(" · ") || "(sem alterações)";
    }
    return "";
  };

  const entityLabel: Record<string, string> = {
    profile_trial: "Trial",
    shop_item: "Loja",
    content_item: "Conteúdo",
  };

  // 2) Early returns AFTER all hooks
  if (roleLoading) {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }
  if (!isAdmin) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        Acesso restrito: apenas administradores podem ver o registo de auditoria.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Registo de auditoria</h2>
        <Button size="sm" variant="outline" onClick={reload}><RefreshCw className="h-4 w-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Entidade:</span>
        {["all", "profile_trial", "shop_item", "content_item"].map((e) => (
          <Button key={e} size="sm" variant={entityFilter === e ? "default" : "outline"} onClick={() => setEntityFilter(e)}>
            {e === "all" ? "Todas" : entityLabel[e] ?? e}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">Ação:</span>
        {["all", "insert", "update", "delete"].map((a) => (
          <Button key={a} size="sm" variant={actionFilter === a ? "default" : "outline"} onClick={() => setActionFilter(a)}>
            {a === "all" ? "Todas" : a}
          </Button>
        ))}
      </div>
      <Input
        placeholder="Procurar por entidade, ID, admin ou valor alterado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : rows.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground text-sm">Sem registos.</Card>
      ) : (
        <>
          <div className="space-y-2">
            {rows.map((r) => (
              <Card
                key={r.id}
                className="p-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setDetail(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetail(r); } }}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{entityLabel[r.entity] ?? r.entity}</Badge>
                      <Badge variant="outline" className="text-xs">{r.action}</Badge>
                      <span className="text-xs text-muted-foreground">
                        por {r.actor_id ? (actors[r.actor_id] ?? r.actor_id.slice(0, 8)) : "sistema"}
                      </span>
                    </div>
                    <div className="text-xs mt-1 break-all">{summarize(r)}</div>
                    {r.entity_id && <div className="text-[10px] text-muted-foreground font-mono mt-1">{r.entity_id}</div>}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("pt-PT")}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-xs text-muted-foreground">
              Página {pageNumber} · {rows.length} resultado{rows.length === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={pageNumber <= 1} onClick={goPrev}>Anterior</Button>
              <Button size="sm" variant="outline" disabled={!hasNext} onClick={goNext}>Seguinte</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe do registo</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary">{entityLabel[detail.entity] ?? detail.entity}</Badge>
                <Badge variant="outline">{detail.action}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(detail.created_at).toLocaleString("pt-PT")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Admin:</span> {detail.actor_id ? (actors[detail.actor_id] ?? detail.actor_id) : "sistema"}</div>
                <div className="break-all"><span className="text-muted-foreground">Entity ID:</span> <span className="font-mono">{detail.entity_id ?? "—"}</span></div>
                <div className="break-all sm:col-span-2"><span className="text-muted-foreground">Audit ID:</span> <span className="font-mono">{detail.id}</span></div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1">Resumo</div>
                <div className="text-xs break-all">{summarize(detail) || "—"}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold mb-1">Antes (before)</div>
                  <pre className="text-[11px] bg-muted/50 rounded p-2 overflow-x-auto max-h-72 whitespace-pre-wrap break-all">
{detail.before ? JSON.stringify(detail.before, null, 2) : "—"}
                  </pre>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1">Depois (after)</div>
                  <pre className="text-[11px] bg-muted/50 rounded p-2 overflow-x-auto max-h-72 whitespace-pre-wrap break-all">
{detail.after ? JSON.stringify(detail.after, null, 2) : "—"}
                  </pre>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1">Payload completo</div>
                <pre className="text-[11px] bg-muted/50 rounded p-2 overflow-x-auto max-h-72 whitespace-pre-wrap break-all">
{JSON.stringify(detail, null, 2)}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
