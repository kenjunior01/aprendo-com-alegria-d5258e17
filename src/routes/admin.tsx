import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Shield, Users, CreditCard, Trophy, ShoppingBag, GraduationCap,
  Swords, BarChart3, Search, Crown, UserCog, Loader2, RefreshCw,
  Calendar, Sparkles, ArrowLeft,
} from "lucide-react";

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

type SubRow = {
  id: string;
  user_id: string;
  status: string;
  price_id: string;
  environment: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  created_at: string;
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

  if (!isAdmin) {
    return <BootstrapOrDeny userId={user!.id} />;
  }

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
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-1" /> Sair
              </Link>
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-1" />Visão geral</TabsTrigger>
              <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Utilizadores</TabsTrigger>
              <TabsTrigger value="subs"><CreditCard className="h-4 w-4 mr-1" />Subscrições</TabsTrigger>
              <TabsTrigger value="challenges"><Swords className="h-4 w-4 mr-1" />Desafios</TabsTrigger>
              <TabsTrigger value="schools"><GraduationCap className="h-4 w-4 mr-1" />Escolas</TabsTrigger>
              <TabsTrigger value="shop"><ShoppingBag className="h-4 w-4 mr-1" />Loja</TabsTrigger>
              <TabsTrigger value="achievements"><Trophy className="h-4 w-4 mr-1" />Conquistas</TabsTrigger>
              <TabsTrigger value="roles"><UserCog className="h-4 w-4 mr-1" />Funções</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
            <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
            <TabsContent value="subs" className="mt-6"><SubsTab /></TabsContent>
            <TabsContent value="challenges" className="mt-6"><ChallengesTab /></TabsContent>
            <TabsContent value="schools" className="mt-6"><SchoolsTab /></TabsContent>
            <TabsContent value="shop" className="mt-6"><ShopTab /></TabsContent>
            <TabsContent value="achievements" className="mt-6"><AchievementsTab /></TabsContent>
            <TabsContent value="roles" className="mt-6"><RolesTab /></TabsContent>
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
      trialActive,
      activeSubs,
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
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
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

/* ───────────────── Users ───────────────── */
function UsersTab() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, role, grade, age, mascot, xp, coins, gems, streak, is_premium, trial_until, created_at, last_played")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (!term) return true;
      return r.name?.toLowerCase().includes(term) || r.id.toLowerCase().includes(term);
    });
  }, [rows, q, roleFilter]);

  const grantTrial = async (id: string, days: number) => {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from("profiles").update({ trial_until: until, is_premium: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Trial de ${days} dias atribuído`);
    load();
  };

  const revokeTrial = async (id: string) => {
    const { error } = await supabase.from("profiles").update({ trial_until: null, is_premium: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Trial removido");
    load();
  };

  const togglePremium = async (id: string, current: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_premium: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "Premium ativado" : "Premium desativado");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome ou ID..." className="pl-9" />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {["all", "child", "parent", "teacher"].map((r) => (
            <Button key={r} size="sm" variant={roleFilter === r ? "default" : "outline"} onClick={() => setRoleFilter(r)}>
              {r === "all" ? "Todos" : r}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{filtered.length} de {rows.length} utilizadores</p>
          {filtered.map((p) => {
            const trialActive = p.trial_until && new Date(p.trial_until) > new Date();
            return (
              <Card key={p.id} className="p-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => grantTrial(p.id, 30)}>
                          <Calendar className="h-3 w-3 mr-1" /> +30d
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Atribuir 30 dias premium grátis</TooltipContent>
                    </Tooltip>
                    <Button size="sm" variant="outline" onClick={() => grantTrial(p.id, 365)}>+1 ano</Button>
                    {trialActive && (
                      <Button size="sm" variant="ghost" onClick={() => revokeTrial(p.id)}>Remover trial</Button>
                    )}
                    <Button size="sm" variant={p.is_premium ? "secondary" : "default"} onClick={() => togglePremium(p.id, p.is_premium)}>
                      <Crown className="h-3 w-3 mr-1" /> {p.is_premium ? "Tirar" : "Dar"} premium
                    </Button>
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
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(200);
    setRows((data as any) ?? []);
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

/* ───────────────── Shop ───────────────── */
function ShopTab() {
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("shop_items").select("*").order("sort_order");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const togglePremium = async (id: string, current: boolean) => {
    const { error } = await supabase.from("shop_items").update({ premium: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
    load();
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Loja ({rows.length} itens)</h2>
      {rows.map((it) => (
        <Card key={it.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{it.emoji}</span>
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-muted-foreground">{it.type} · {it.price}🪙{it.mascot ? ` · ${it.mascot}` : ""}</div>
            </div>
          </div>
          <Button size="sm" variant={it.premium ? "default" : "outline"} onClick={() => togglePremium(it.id, it.premium)}>
            <Crown className="h-3 w-3 mr-1" /> {it.premium ? "Premium" : "Grátis"}
          </Button>
        </Card>
      ))}
    </div>
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
    toast.success(`Função ${role} atribuída`);
    setUserId("");
    load();
  };
  const revoke = async (id: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Função removida");
    load();
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
