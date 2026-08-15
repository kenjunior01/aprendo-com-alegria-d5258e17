import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import {
  listActiveLeagues,
  joinWeeklyLeague,
  getLeagueLeaderboard,
  addLeagueScore,
  ageToGroup,
  type LeagueRow,
} from "@/lib/leagues.functions";
import {
  listJuniorChildren,
  getActiveJuniorChildId,
  type JuniorChild,
} from "@/lib/junior";
import { Trophy, Users, Plus, Ticket, Check, Share2, Swords, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  ageGroup?: string;
}

export function LigasPanel({ ageGroup: defaultAgeGroup = "mixed" }: Props) {
  const fnList = useServerFn(listActiveLeagues);
  const fnJoin = useServerFn(joinWeeklyLeague);
  const fnBoard = useServerFn(getLeagueLeaderboard);
  const fnAdd = useServerFn(addLeagueScore);

  // Crianças (perfis locais Júnior)
  const [children, setChildren] = useState<JuniorChild[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  useEffect(() => {
    setChildren(listJuniorChildren());
    setActiveChildId(getActiveJuniorChildId());
  }, []);
  const activeChild = useMemo(
    () => children.find((c) => c.id === activeChildId) ?? null,
    [children, activeChildId],
  );
  const ageGroup = activeChild ? ageToGroup(activeChild.age) : defaultAgeGroup;

  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [active, setActive] = useState<LeagueRow | null>(null);
  const [board, setBoard] = useState<Awaited<ReturnType<typeof getLeagueLeaderboard>>["leaderboard"]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getLeagueLeaderboard>>["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteInput, setInviteInput] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = async () => {
    const { leagues } = await fnList();
    setLeagues(leagues);
    if (leagues.length && !active) setActive(leagues[0]);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!active) return;
    void fnBoard({ data: { leagueId: active.id, childId: activeChild?.id } })
      .then((r) => { setBoard(r.leaderboard); setStats(r.stats); });
  }, [active, fnBoard, activeChild?.id]);

  const childPayload = activeChild
    ? { childId: activeChild.id, childName: activeChild.name, childAge: activeChild.age }
    : {};

  const join = async () => {
    if (!activeChild) return toast.error("Cria primeiro um perfil de criança.");
    const r = await fnJoin({ data: { ageGroup, ...childPayload } });
    if (!r.ok) return toast.error(r.error);
    toast.success(`${activeChild.name} entrou na liga ${ageGroup}!`);
    setActive(r.league);
    void refresh();
  };

  const joinByCode = async () => {
    if (!activeChild) return toast.error("Escolhe primeiro um perfil de criança.");
    const code = inviteInput.trim().toUpperCase();
    if (code.length < 4) return toast.error("Código demasiado curto.");
    const r = await fnJoin({ data: { inviteCode: code, ...childPayload } });
    if (!r.ok) return toast.error(r.error);
    toast.success(`Entraste na liga "${r.league.name}"!`);
    setActive(r.league);
    setInviteInput("");
    void refresh();
  };

  const copyShare = async () => {
    if (!active) return;
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/desafios?liga=${active.invite_code}`
      : active.invite_code;
    const text = `Junta-te à nossa liga semanal no Kidoz! Código: ${active.invite_code} ou abre: ${url}`;
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as any).share({ title: "Liga Kidoz", text, url });
        return;
      }
    } catch { /* fallback below */ }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Código copiado — partilha com os pais!");
    setTimeout(() => setCopied(false), 1500);
  };

  const train = async () => {
    if (!active) return;
    const points = 10 + Math.floor(Math.random() * 30);
    const r = await fnAdd({ data: { leagueId: active.id, points, childId: activeChild?.id } });
    if (!r.ok) return toast.error(r.error);
    toast.success(`+${points} pontos!`);
    const b = await fnBoard({ data: { leagueId: active.id, childId: activeChild?.id } });
    setBoard(b.leaderboard); setStats(b.stats);
  };

  // Pré-preenche código vindo do URL ?liga=XXXX
  useEffect(() => {
    if (typeof window === "undefined") return;
    const code = new URL(window.location.href).searchParams.get("liga");
    if (code) setInviteInput(code.toUpperCase());
  }, []);

  return (
    <div className="space-y-6">
      {/* High-Impact League Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] border-4 border-amber-200 bg-white p-6 shadow-xl">
        <div className="absolute -right-6 -top-6 text-amber-100 opacity-20">
          <Trophy className="h-40 w-40" />
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-display text-3xl font-black text-amber-900 leading-tight">Ligas Semanais</h3>
              <p className="text-sm font-medium text-amber-700/70 uppercase tracking-widest">Escalão: {ageGroup}</p>
            </div>
            <div className="rounded-2xl bg-amber-400 px-4 py-2 text-amber-950 font-black shadow-lg">
              <Trophy className="h-5 w-5 inline mr-1" /> RANKING VIVO
            </div>
          </div>

          {/* Selector de criança - More spectacular */}
          <div className="rounded-[2rem] border-2 border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Users className="h-4 w-4" /> Seleciona o Teu Campeão
            </p>
            {children.length === 0 ? (
              <p className="text-sm text-slate-500">Cria um perfil em <strong className="text-primary">Júnior</strong> para competir.</p>
            ) : (
              <div role="list" className="flex flex-wrap gap-3">
                {children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChildId(c.id)}
                    role="listitem"
                    className={cn(
                      "group relative flex items-center gap-2 rounded-2xl border-2 px-4 py-2 transition-all active:scale-95",
                      activeChildId === c.id
                        ? "border-primary bg-primary text-white shadow-lg"
                        : "border-slate-300 bg-white hover:border-primary/30"
                    )}
                  >
                    <span className="text-xl">🧒</span>
                    <span className="font-display font-bold">{c.name}</span>
                    {activeChildId === c.id && (
                       <motion.div layoutId="active-child" className="absolute -inset-1 rounded-2xl border-2 border-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={join}
              disabled={!activeChild}
              className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-lg font-black border-b-4 border-amber-700 active:border-b-0 transition-all shadow-xl"
            >
              <Plus className="mr-2 h-6 w-6" /> CRIAR MINHA LIGA
            </Button>

            <div className="flex flex-1 items-center gap-2 bg-white rounded-2xl border-2 border-slate-100 p-2 shadow-inner min-w-[200px]">
              <Ticket className="ml-2 h-5 w-5 text-slate-500" />
              <input
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="CÓDIGO"
                className="flex-1 bg-transparent text-center font-display text-xl font-bold tracking-[0.2em] outline-none placeholder:text-slate-200"
              />
              <Button onClick={joinByCode} disabled={!activeChild || inviteInput.length < 4} className="rounded-xl bg-slate-800">
                LIGAR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Spectacular Invitation Area */}
          <div className="rounded-[2.5rem] bg-indigo-900 p-8 text-white shadow-2xl relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full border-[20px] border-white/5"
            />

            <div className="relative z-10 text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300 mb-2">Convite da Tua Liga</p>
              <h2 className="font-display text-6xl font-black tracking-widest text-white mb-2">{active.invite_code}</h2>
              <p className="text-sm font-medium text-indigo-200 mb-6 italic">
                 Válida até {active.ends_on}
              </p>

              <div className="flex justify-center gap-3">
                <Button onClick={copyShare} size="lg" className="h-12 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 px-8">
                  {copied ? <><Check className="mr-2 h-5 w-5" /> COPIADO</> : <><Share2 className="mr-2 h-5 w-5" /> PARTILHAR</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Epic Leaderboard */}
          <section className="overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-xl">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b-2 border-slate-100">
               <h4 className="font-display text-xl font-bold text-slate-800">Classificação Atual</h4>
               {stats && <Badge className="bg-primary px-3 py-1 font-bold">#{stats.myRank} LUGAR</Badge>}
            </div>

            <div className="p-4">
              <ol className="space-y-3">
                {board.map((m, i) => {
                  const isTop3 = i < 3;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";

                  return (
                    <motion.li key={m.memberId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border-2 p-4 transition-all hover:scale-[1.01]",
                        m.isMe ? "border-primary bg-primary/5 shadow-md" : "border-slate-50 bg-white"
                      )}>
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={cn(
                          "w-8 text-center font-display text-2xl font-black",
                          i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-200"
                        )}>
                          {isTop3 ? medal : m.rank}
                        </span>
                        <div className="text-3xl">{m.isBot ? "🤖" : "🧒"}</div>
                        <div className="flex flex-col min-w-0">
                           <span className="truncate font-display text-lg font-bold text-slate-800">{m.name}</span>
                           <div className="flex items-center gap-1">
                             {m.isBot ? (
                               <Badge variant="outline" className="text-[9px] uppercase h-4 px-1">{m.difficulty}</Badge>
                             ) : (
                               <Badge className="bg-success text-white text-[9px] uppercase h-4 px-1">Lenda</Badge>
                             )}
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                           <p className="text-xl font-black text-slate-800 leading-none">{m.score}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase">Pontos</p>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
                {board.length === 0 && <p className="text-center py-8 text-slate-500">À espera dos primeiros competidores...</p>}
              </ol>
            </div>

            <div className="bg-slate-50 p-6 flex justify-center border-t-2 border-slate-100">
               <Button
                onClick={train}
                disabled={!activeChild}
                size="lg"
                className="h-14 rounded-2xl bg-success hover:bg-success/90 text-white font-black px-12 shadow-lg border-b-4 border-emerald-700 active:border-b-0 transition-all"
               >
                 TREINAR E SUBIR! 🚀
               </Button>
            </div>
          </section>

          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <ModernStat icon={<Swords className="text-primary" />} label="Batalhas" value={String(stats.myGames)} />
              <ModernStat icon={<Zap className="text-yellow-500" />} label="Distância Top" value={stats.gapToLeader != null ? String(stats.gapToLeader) : "0"} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function ModernStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className="font-display text-2xl font-black text-slate-800 leading-none">{value}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-xl">{value}</p>
    </div>
  );
}
