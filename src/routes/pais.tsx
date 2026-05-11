import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { ParentGate } from "@/components/ParentGate";
import { loadProfile, pullProfileFromCloud, updateProfile, type Profile } from "@/lib/storage";
import { getTodayMinutes } from "@/lib/usageTracker";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getMyChildren, createParentInvite, acceptParentInvite, getChildDashboard, getChildControls, setChildControls, type ParentDashboardData } from "@/server/parent.functions";
import { listChildren as listTutorChildren, type TutorHistory } from "@/lib/tutorHistory";
import { Copy, LogOut, Plus, BarChart3, Clock, Target, Flame, MessageCircle, ShieldCheck, Moon, Hourglass, UserPlus, Home, Swords, Baby, Activity, ShoppingBag, School, Menu, X, Search, ChevronUp, Filter } from "lucide-react";
import { PurchaseHistoryPanel } from "@/components/PurchaseHistoryPanel";
import { QuickChildSignup } from "@/components/QuickChildSignup";
import { JuniorParentPanel } from "@/components/JuniorParentPanel";
import { JuniorParentReport } from "@/components/JuniorParentReport";
import { ParentRealtimeFeed } from "@/components/ParentRealtimeFeed";
import { FamilyChallengePanel } from "@/components/FamilyChallengePanel";
import { ChildChallengesPanel } from "@/components/ChildChallengesPanel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const GATE_KEY = "kidoz-parent-gate-ts";
const GATE_TTL_MIN = 30;
const SEEN_KEY = "kidoz-parent-tab-seen";
type TabId = "resumo" | "controlos" | "desafios" | "junior" | "atividade" | "compras";
type SeenMap = Partial<Record<TabId, number>>;

function loadSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") as SeenMap; } catch { return {}; }
}
function saveSeen(m: SeenMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_KEY, JSON.stringify(m));
}

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
  const [unlocked, setUnlocked] = useState(false);
  const [showQuickSignup, setShowQuickSignup] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("resumo");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [seen, setSeen] = useState<SeenMap>(() => loadSeen());
  const [badges, setBadges] = useState<Partial<Record<TabId, number>>>({});
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const tabContentRef = useRef<HTMLDivElement | null>(null);

  const reloadChildren = async () => {
    try {
      const res = await getMyChildren();
      const list = (res?.children ?? []) as ChildSummary[];
      setChildren(list);
      if (list.length > 0 && !selectedChild) setSelectedChild(list[0].id);
    } catch { /* noop */ }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ts = Number(sessionStorage.getItem(GATE_KEY) ?? 0);
    if (ts && Date.now() - ts < GATE_TTL_MIN * 60_000) setUnlocked(true);
  }, []);

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
      try {
        const res = await getMyChildren();
        const list = (res?.children ?? []) as ChildSummary[];
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].id);
      } catch (err) {
        console.warn("getMyChildren failed", err);
        setChildren([]);
      }
    })();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!selectedChild) return;
    void getChildDashboard({ data: { childId: selectedChild } }).then(setDashboard).catch(() => setDashboard(null));
  }, [selectedChild]);

  // Compute badges (counters/alerts) for tabs based on Supabase data + last-seen timestamps.
  useEffect(() => {
    if (children.length === 0) return;
    const childIds = children.map((c) => c.id);
    let cancelled = false;
    void (async () => {
      const next: Partial<Record<TabId, number>> = {};
      const sinceResumo = new Date(seen.resumo ?? 0).toISOString();
      const sinceDesafios = new Date(seen.desafios ?? 0).toISOString();
      const sinceAtividade = new Date(seen.atividade ?? 0).toISOString();
      const sinceCompras = new Date(seen.compras ?? 0).toISOString();
      try {
        const [practiceNew, infiniteNew, sessionsToday, subsNew, pendingLinks] = await Promise.all([
          supabase.from("practice_sessions").select("id", { count: "exact", head: true })
            .in("user_id", childIds).gt("created_at", sinceResumo),
          supabase.from("infinite_scores").select("id", { count: "exact", head: true })
            .in("user_id", childIds).gt("created_at", sinceDesafios),
          supabase.from("practice_sessions").select("id", { count: "exact", head: true })
            .in("user_id", childIds).gt("created_at", sinceAtividade),
          supabase.from("subscriptions").select("id", { count: "exact", head: true })
            .gt("updated_at", sinceCompras),
          supabase.from("parent_links").select("id", { count: "exact", head: true })
            .eq("parent_id", user!.id).eq("status", "pending"),
        ]);
        if (cancelled) return;
        next.resumo = practiceNew.count ?? 0;
        next.desafios = infiniteNew.count ?? 0;
        next.atividade = sessionsToday.count ?? 0;
        next.compras = subsNew.count ?? 0;
        next.controlos = pendingLinks.count ?? 0;
        setBadges(next);
      } catch { /* noop */ }
    })();
    return () => { cancelled = true; };
  }, [children, seen, user]);

  // Mark current tab as seen + smooth scroll to content.
  useEffect(() => {
    setSeen((prev) => {
      const updated = { ...prev, [activeTab]: Date.now() };
      saveSeen(updated);
      return updated;
    });
    setBadges((prev) => ({ ...prev, [activeTab]: 0 }));
    if (typeof window !== "undefined" && tabContentRef.current) {
      const top = tabContentRef.current.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [activeTab]);

  // Filter + search children (must run before any early return — Rules of Hooks)
  const filteredChildren = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return children.filter((c) => {
      if (gradeFilter !== "all" && c.grade !== gradeFilter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [children, searchQuery, gradeFilter]);

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
    window.location.href = "/";
  };

  if (!unlocked) {
    return (
      <ParentGate
        expectedPin={profile.parentPin ?? null}
        onPass={() => {
          if (typeof window !== "undefined") sessionStorage.setItem(GATE_KEY, String(Date.now()));
          setUnlocked(true);
        }}
      />
    );
  }

  const selectedChildName = children.find((c) => c.id === selectedChild)?.name ?? "";
  const tabs: { id: TabId; label: string; icon: typeof Home; tone?: string }[] = [
    { id: "resumo", label: "Resumo", icon: Home },
    { id: "controlos", label: "Controlos", icon: ShieldCheck, tone: "warn" },
    { id: "desafios", label: "Desafios", icon: Swords },
    { id: "junior", label: "Júnior", icon: Baby },
    { id: "atividade", label: "Atividade", icon: Activity },
    { id: "compras", label: "Compras", icon: ShoppingBag },
  ];
  const activeTabMeta = tabs.find((t) => t.id === activeTab)!;
  const totalAlerts = Object.values(badges).reduce<number>((s, n) => s + (n ?? 0), 0);

  // Filter + search children
  const availableGrades = Array.from(new Set(children.map((c) => c.grade))).sort((a, b) => a - b);
  const filteredChildren = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return children.filter((c) => {
      if (gradeFilter !== "all" && c.grade !== gradeFilter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [children, searchQuery, gradeFilter]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background to-muted/30 pb-28 md:pb-12">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md sm:h-10 sm:w-10">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base leading-tight sm:text-lg">Painel de Pais</p>
              <p className="truncate text-[11px] text-muted-foreground">Olá, {profile.name} 👋</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/escola" className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-display hover:bg-muted">
              <School className="h-4 w-4" /> Escola
            </Link>
            <Link to="/perfil" className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-display hover:bg-muted">Perfil</Link>
            <button onClick={signOut} className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
          <button onClick={() => setMenuOpen((v) => !v)} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-card md:hidden" aria-label="Menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-card/95 px-3 py-2 md:hidden">
            <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
              <Link to="/escola" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background px-2 py-2.5 text-xs font-display">
                <School className="h-4 w-4" /> Escola
              </Link>
              <Link to="/perfil" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background px-2 py-2.5 text-xs font-display">
                <UserPlus className="h-4 w-4" /> Perfil
              </Link>
              <button onClick={signOut} className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background px-2 py-2.5 text-xs font-display text-muted-foreground">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
        {children.length === 0 ? (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-chunky rounded-3xl border border-border bg-card p-5 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-3xl">👨‍👩‍👧</div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl">Bem-vindo(a), {profile.name}!</h1>
                <p className="mt-1 text-sm text-muted-foreground">Cria um perfil para a tua criança em poucos segundos e começa a acompanhar a aprendizagem.</p>
              </div>
            </div>
            <div className="mt-5">
              {showQuickSignup ? (
                <QuickChildSignup
                  onClose={() => setShowQuickSignup(false)}
                  onCreated={async ({ childId }) => { setShowQuickSignup(false); setSelectedChild(childId); await reloadChildren(); }}
                />
              ) : (
                <ChunkyButton onClick={() => setShowQuickSignup(true)} className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4" /> Criar perfil de criança
                </ChunkyButton>
              )}
            </div>
            <details className="mt-5 rounded-2xl bg-muted/40 p-3">
              <summary className="cursor-pointer font-display text-sm">Tenho um código de convite</summary>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Introduz aqui o código que te foi dado (na conta da criança).</p>
                <input value={acceptCode} onChange={(e) => setAcceptCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={8} className="mt-2 w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-center font-mono text-lg tracking-widest outline-none focus:border-primary" />
                <ChunkyButton tone="secondary" onClick={acceptInvite} className="mt-2 w-full">Ligar conta</ChunkyButton>
                {acceptMsg && <p className="mt-2 text-center text-xs">{acceptMsg}</p>}
              </div>
            </details>
          </motion.section>
        ) : (
          <>
            {/* Search + grade filter */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procurar criança…"
                  className="w-full rounded-2xl border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {availableGrades.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <button onClick={() => setGradeFilter("all")} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-display ${gradeFilter === "all" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>Todos</button>
                  {availableGrades.map((g) => (
                    <button key={g} onClick={() => setGradeFilter(g)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-display ${gradeFilter === g ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>{g}.º</button>
                  ))}
                </div>
              )}
            </div>

            {/* Children chips (filtered) */}
            <div className="-mx-3 mb-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
              <div className="flex w-max min-w-full items-center gap-2 pb-1 sm:flex-wrap">
                {filteredChildren.length === 0 && (
                  <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma criança corresponde aos filtros.</p>
                )}
                {filteredChildren.map((c) => {
                  const active = selectedChild === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChild(c.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-2xl border-2 px-3 py-2 font-display text-sm transition-all ${
                        active ? "scale-[1.02] border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <Mascot id={c.mascot as never} size="sm" />
                      <span className="text-left leading-tight">
                        <span className="block">{c.name}</span>
                        <span className={`block text-[10px] font-normal ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{c.grade}.º · ⭐{c.xp} · 🔥{c.streak}d</span>
                      </span>
                    </button>
                  );
                })}
                <button onClick={() => setShowQuickSignup(true)} className="flex shrink-0 items-center gap-1.5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-2 font-display text-sm text-primary">
                  <UserPlus className="h-4 w-4" /> Novo
                </button>
                <button onClick={() => setShowInviteCode((v) => !v)} className="flex shrink-0 items-center gap-1.5 rounded-2xl border-2 border-border bg-card px-3 py-2 font-display text-sm text-muted-foreground">
                  <Plus className="h-4 w-4" /> Código
                </button>
              </div>
            </div>

            {showQuickSignup && (
              <div className="mb-4">
                <QuickChildSignup onClose={() => setShowQuickSignup(false)} onCreated={async ({ childId }) => { setShowQuickSignup(false); setSelectedChild(childId); await reloadChildren(); }} />
              </div>
            )}
            {showInviteCode && (
              <div className="mb-4 rounded-2xl border border-border bg-accent/40 p-3">
                <p className="text-xs text-muted-foreground">Gera um código para ligar uma conta de criança já existente:</p>
                {pendingCode ? (
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-card px-3 py-2 font-mono text-lg font-bold tracking-widest">
                    {pendingCode}
                    <button onClick={() => navigator.clipboard?.writeText(pendingCode)} className="ml-auto text-muted-foreground hover:text-foreground"><Copy className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <ChunkyButton onClick={generateInvite} className="mt-2 w-full sm:w-auto"><Plus className="h-4 w-4" /> Gerar código</ChunkyButton>
                )}
              </div>
            )}

            {/* SECTION TABS — desktop only with badges + animated indicator */}
            <nav className="mb-5 sticky top-[68px] z-20 hidden rounded-2xl border border-border bg-card p-1.5 shadow-sm md:block">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  const count = badges[t.id] ?? 0;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-display text-sm transition-all ${
                        active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                      {count > 0 && (
                        <span className={`ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-primary-foreground text-primary" : "animate-pulse bg-destructive text-destructive-foreground"}`}>
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Mobile active-tab indicator pill */}
            <div className="mb-3 flex items-center justify-between md:hidden">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-display text-sm text-primary">
                <activeTabMeta.icon className="h-4 w-4" />
                {activeTabMeta.label}
                {(badges[activeTab] ?? 0) > 0 && (
                  <span className="rounded-full bg-destructive px-1.5 text-[10px] text-destructive-foreground">{badges[activeTab]}</span>
                )}
              </div>
              <button onClick={() => setBottomSheetOpen(true)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-display text-muted-foreground">Trocar secção</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                ref={tabContentRef}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="scroll-mt-32"
              >
                {activeTab === "resumo" && (
                  <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                      {dashboard ? <DashboardView data={dashboard} /> : <SkeletonCard />}
                    </div>
                    <aside className="space-y-5">
                      {selectedChild && <ChildChallengesPanel childId={selectedChild} childName={selectedChildName} />}
                      <FamilyChallengePanel lastSubject={dashboard?.bySubject?.[0]?.subject_id} childName={selectedChildName} />
                    </aside>
                  </div>
                )}
                {activeTab === "controlos" && selectedChild && (
                  <ChildControlsCard childId={selectedChild} childName={selectedChildName} />
                )}
                {activeTab === "desafios" && selectedChild && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <ChildChallengesPanel childId={selectedChild} childName={selectedChildName} />
                    <FamilyChallengePanel lastSubject={dashboard?.bySubject?.[0]?.subject_id} childName={selectedChildName} />
                  </div>
                )}
                {activeTab === "junior" && (
                  <div className="space-y-5">
                    <JuniorParentPanel />
                    <section>
                      <h3 className="mb-3 font-display text-xl">🧸 Atividade Kidoz Júnior (2-5 anos)</h3>
                      <JuniorParentReport />
                    </section>
                  </div>
                )}
                {activeTab === "atividade" && (
                  <ParentRealtimeFeed childList={children.map((c) => ({ id: c.id, name: c.name }))} />
                )}
                {activeTab === "compras" && <PurchaseHistoryPanel />}
              </motion.div>
            </AnimatePresence>


            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              ✨ A personalização (país e interesses) é definida pela criança em <strong>/perfil</strong>.
            </p>
          </>
        )}
      </main>

      {children.length > 0 && (
        <Sheet open={bottomSheetOpen} onOpenChange={setBottomSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-display text-sm text-primary-foreground shadow-2xl ring-4 ring-primary/20 md:hidden"
              aria-label="Trocar secção"
            >
              <activeTabMeta.icon className="h-5 w-5" />
              <span>{activeTabMeta.label}</span>
              {totalAlerts > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                  {totalAlerts > 99 ? "99+" : totalAlerts}
                </span>
              )}
              <ChevronUp className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl border-t-2 px-4 pb-8 pt-5">
            <SheetHeader className="mb-3">
              <SheetTitle className="font-display">Secções do painel</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                const count = badges[t.id] ?? 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setBottomSheetOpen(false); }}
                    className={`relative flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left font-display transition-all ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                    }`}
                  >
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-primary-foreground/20" : "bg-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm leading-tight">{t.label}</span>
                    {count > 0 && (
                      <span className={`absolute right-2 top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-primary-foreground text-primary" : "animate-pulse bg-destructive text-destructive-foreground"}`}>
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}

      <BottomNav />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-chunky animate-pulse rounded-3xl border border-border bg-card p-6">
      <div className="h-6 w-1/3 rounded bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted" />)}
      </div>
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

      {/* Daily activity — detailed minutes + accuracy + streak */}
      <div className="card-chunky rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg">Tempo de estudo (14 dias)</h3>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> minutos</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-success" /> precisão</span>
          </div>
        </div>
        {(() => {
          const maxMin = Math.max(1, ...data.byDay.map((x) => x.minutes));
          const activeDays = data.byDay.filter((d) => d.minutes > 0).length;
          // Current streak = trailing consecutive days with minutes>0
          let curStreak = 0;
          for (let i = data.byDay.length - 1; i >= 0; i--) {
            if (data.byDay[i].minutes > 0) curStreak++; else break;
          }
          // Best streak in window
          let best = 0, run = 0;
          for (const d of data.byDay) { if (d.minutes > 0) { run++; best = Math.max(best, run); } else { run = 0; } }
          const totalMin = data.byDay.reduce((s, d) => s + d.minutes, 0);
          const avgMin = activeDays ? Math.round(totalMin / activeDays) : 0;
          return (
            <>
              <div className="mt-4 flex h-40 items-end gap-1.5">
                {data.byDay.map((d) => {
                  const h = (d.minutes / maxMin) * 100;
                  const acc = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                  return (
                    <div key={d.date} className="group relative flex flex-1 flex-col items-center gap-1" title={`${d.date}\n${d.minutes} min\n${acc}% precisão (${d.correct}/${d.total})`}>
                      <div className="relative flex w-full flex-1 items-end">
                        <div className={`w-full rounded-t-md transition-all ${d.minutes > 0 ? "bg-primary" : "bg-muted"}`} style={{ height: `${Math.max(h, d.minutes > 0 ? 8 : 4)}%` }} />
                        {d.total > 0 && (
                          <div className="absolute inset-x-0 bottom-0 mx-auto h-1 rounded-full bg-success" style={{ width: `${Math.max(10, acc)}%` }} />
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground">{d.date.slice(8)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Total" value={`${totalMin} min`} />
                <MiniStat label="Média / dia ativo" value={`${avgMin} min`} />
                <MiniStat label="Sequência atual" value={`🔥 ${curStreak}d`} />
                <MiniStat label="Melhor (14d)" value={`⭐ ${best}d`} />
              </div>
            </>
          );
        })()}
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg">{value}</p>
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

function ChildControlsCard({ childId, childName }: { childId: string; childName: string }) {
  const [pin, setPin] = useState("");
  const [limit, setLimit] = useState<number | "">("");
  const [bedtime, setBedtime] = useState<number | "">("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current cloud-stored controls for this child whenever the selection changes.
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void getChildControls({ data: { childId } })
      .then((c) => {
        if (cancelled) return;
        setPin(c.parentPin ?? "");
        setLimit(c.dailyLimitMin ?? "");
        setBedtime(c.bedtimeHour ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => { cancelled = true; };
  }, [childId]);

  const save = async () => {
    setSaving(true);
    setSavedMsg(null);
    const r = await setChildControls({
      data: {
        childId,
        parentPin: pin.length === 4 ? pin : null,
        dailyLimitMin: typeof limit === "number" && limit > 0 ? limit : null,
        bedtimeHour: typeof bedtime === "number" ? bedtime : null,
      },
    });
    setSaving(false);
    setSavedMsg(r.ok ? "✅ Sincronizado em todos os dispositivos" : "❌ Não foi possível guardar");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <motion.div
      key={childId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky mb-5 rounded-3xl border-2 border-border bg-gradient-to-br from-secondary/20 to-card p-5"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg">Controlos parentais — {childName}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Estas definições aplicam-se ao dispositivo desta criança e sincronizam automaticamente.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="flex items-center gap-1.5 font-display text-sm">
            <ShieldCheck className="h-4 w-4" /> PIN (4 dígitos)
          </span>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            disabled={!loaded}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Sem PIN"
            className="mt-2 w-full rounded-xl border-2 border-border bg-card px-3 py-3 text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-primary disabled:opacity-50"
          />
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 font-display text-sm">
            <Hourglass className="h-4 w-4" /> Limite diário (min)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={240}
            value={limit}
            disabled={!loaded}
            onChange={(e) => setLimit(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Sem limite"
            className="mt-2 w-full rounded-xl border-2 border-border bg-card px-3 py-3 text-center font-display text-lg outline-none focus:border-primary disabled:opacity-50"
          />
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 font-display text-sm">
            <Moon className="h-4 w-4" /> Hora de dormir
          </span>
          <select
            value={bedtime === "" ? "" : String(bedtime)}
            disabled={!loaded}
            onChange={(e) => setBedtime(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-2 w-full rounded-xl border-2 border-border bg-card px-3 py-3 text-center font-display text-lg outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="">Sem bloqueio</option>
            {[18, 19, 20, 21, 22].map((h) => (
              <option key={h} value={h}>{h}h00</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ChunkyButton onClick={save} disabled={!loaded || saving}>
          {saving ? "A guardar…" : "Guardar definições"}
        </ChunkyButton>
        {savedMsg && <span className="text-sm">{savedMsg}</span>}
      </div>
    </motion.div>
  );
}

