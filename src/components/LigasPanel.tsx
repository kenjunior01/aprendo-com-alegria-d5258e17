// Painel de Ligas — escolhe a criança, junta-te à liga semanal por escalão,
// partilha o código de convite e vê estatísticas simples.
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Trophy, Bot, UserCheck, Plus, Copy, Check, Share2, Users, BarChart3, Ticket } from "lucide-react";
import {
  listActiveLeagues, joinWeeklyLeague, getLeagueLeaderboard, addLeagueScore,
  ageToGroup, type LeagueRow,
} from "@/server/leagues.functions";
import { ChunkyButton } from "@/components/ChunkyButton";
import { toast } from "sonner";
import { listJuniorChildren, getActiveJuniorChildId, type JuniorChild } from "@/lib/junior";

interface Props {
  /** Escalão por defeito quando não há criança ativa (legacy). */
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
    toast.success(`Entraste na liga “${r.league.name}”!`);
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
    <section className="card-chunky rounded-3xl border-2 border-border bg-card p-5 space-y-4">
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display text-2xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-xp" /> Ligas Semanais
        </h3>
        <span className="rounded-full bg-muted px-3 py-1 text-xs">Escalão: <strong>{ageGroup}</strong></span>
      </header>

      {/* Selector de criança */}
      <div className="rounded-2xl border border-border bg-muted/40 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Quem vai jogar
        </p>
        {children.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cria um perfil em <strong>Júnior</strong> para entrar na liga.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChildId(c.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  activeChildId === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span>🧒</span>
                <span className="font-display">{c.name}</span>
                <span className="opacity-70">· {c.age}a</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChunkyButton tone="primary" onClick={join} disabled={!activeChild}>
          <Plus className="mr-1 h-4 w-4" /> Entrar na liga ({ageGroup})
        </ChunkyButton>
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <input
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value.toUpperCase().slice(0, 8))}
            placeholder="CÓDIGO"
            className="w-28 rounded-full border border-border bg-background px-3 py-1.5 text-center font-display tracking-widest outline-none focus:border-primary"
          />
          <ChunkyButton tone="secondary" onClick={joinByCode} disabled={!activeChild || inviteInput.length < 4}>
            Juntar
          </ChunkyButton>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">A carregar…</p> : null}

      {leagues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {leagues.map((l) => (
            <button key={l.id}
              onClick={() => setActive(l)}
              className={`rounded-full border px-3 py-1 text-xs ${active?.id === l.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {l.name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          {/* Convite partilhável */}
          <div className="rounded-2xl border-2 border-dashed border-primary/60 bg-primary/5 p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Código da liga</p>
                <p className="font-display text-3xl tracking-[0.3em] text-primary">{active.invite_code}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {active.starts_on} → {active.ends_on}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyShare}
                  className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-2 text-xs font-semibold shadow-sm hover:bg-muted"
                >
                  {copied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Share2 className="h-3.5 w-3.5" /> Partilhar</>}
                </button>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(active.invite_code);
                    toast.success("Código copiado!");
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-2 text-xs font-semibold shadow-sm hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" /> Código
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="A minha posição" value={stats.myRank ? `#${stats.myRank}` : "—"} />
              <Stat label="Os meus pontos" value={String(stats.myScore)} />
              <Stat label="Jogos" value={String(stats.myGames)} />
              <Stat label="Distância ao 1.º" value={stats.gapToLeader != null ? String(stats.gapToLeader) : "—"} />
            </div>
          )}
          {stats && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              {stats.participants} participantes ({stats.realPlayers} crianças, {stats.bots} bots) · média {stats.avgScore} pts · {stats.totalGames} jogos no total
            </p>
          )}

          {/* Ranking */}
          <ol className="space-y-2">
            {board.map((m) => (
              <motion.li key={m.memberId}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${m.isMe ? "border-primary bg-primary/10" : "bg-muted/40"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 text-center font-display">{m.rank}</span>
                  <span className="text-2xl">{m.isBot ? "🤖" : "🧒"}</span>
                  <span className="truncate font-display">{m.name}</span>
                  {m.isBot
                    ? <Bot className="h-3 w-3 shrink-0 text-muted-foreground" aria-label={`Bot ${m.difficulty ?? "medium"}`} />
                    : <UserCheck className="h-3 w-3 shrink-0 text-success" />}
                  {m.isBot && m.difficulty && (
                    <span className="rounded-full bg-card px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {m.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {m.gamesPlayed > 0 && (
                    <span className="text-[10px] text-muted-foreground">{m.gamesPlayed} jogos</span>
                  )}
                  <span className="font-display text-lg">{m.score}</span>
                </div>
              </motion.li>
            ))}
            {board.length === 0 && <p className="text-sm text-muted-foreground">Ainda sem participantes.</p>}
          </ol>

          <div className="text-right">
            <ChunkyButton tone="success" onClick={train} disabled={!activeChild}>Treinar (+pontos)</ChunkyButton>
          </div>
        </>
      )}

      {!loading && leagues.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Ainda não há ligas. Carrega em <strong>Entrar na liga</strong> para criar a tua e desafiar bots e amigos!
        </p>
      )}
    </section>
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
