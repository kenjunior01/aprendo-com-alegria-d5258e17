// Painel de Ligas — junta-se à liga semanal, vê ranking e desafia bots.
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Trophy, Bot, UserCheck, Plus } from "lucide-react";
import {
  listActiveLeagues, joinWeeklyLeague, getLeagueLeaderboard, addLeagueScore,
  type LeagueRow,
} from "@/server/leagues.functions";
import { ChunkyButton } from "@/components/ChunkyButton";
import { toast } from "sonner";

export function LigasPanel({ ageGroup = "mixed" }: { ageGroup?: string }) {
  const fnList = useServerFn(listActiveLeagues);
  const fnJoin = useServerFn(joinWeeklyLeague);
  const fnBoard = useServerFn(getLeagueLeaderboard);
  const fnAdd = useServerFn(addLeagueScore);

  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [active, setActive] = useState<LeagueRow | null>(null);
  const [board, setBoard] = useState<Awaited<ReturnType<typeof getLeagueLeaderboard>>["leaderboard"]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { leagues } = await fnList();
    setLeagues(leagues);
    if (leagues.length && !active) setActive(leagues[0]);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!active) return;
    void fnBoard({ data: { leagueId: active.id } }).then((r) => setBoard(r.leaderboard));
  }, [active, fnBoard]);

  const join = async () => {
    const r = await fnJoin({ data: { ageGroup } });
    if (!r.ok) return toast.error(r.error);
    toast.success("Entraste na liga! Os bots já estão prontos para competir.");
    setActive(r.league);
    void refresh();
  };

  const train = async () => {
    if (!active) return;
    const points = 10 + Math.floor(Math.random() * 30);
    const r = await fnAdd({ data: { leagueId: active.id, points } });
    if (!r.ok) return toast.error(r.error);
    toast.success(`+${points} pontos!`);
    const b = await fnBoard({ data: { leagueId: active.id } });
    setBoard(b.leaderboard);
  };

  return (
    <section className="card-chunky rounded-3xl border-2 border-border bg-card p-5">
      <header className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-display text-2xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-xp" /> Ligas Semanais
        </h3>
        <ChunkyButton tone="primary" onClick={join}>
          <Plus className="mr-1 h-4 w-4" /> Entrar na liga ({ageGroup})
        </ChunkyButton>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">A carregar…</p> : null}

      {leagues.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
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
          <p className="text-xs text-muted-foreground">
            {active.starts_on} → {active.ends_on}
          </p>
          <ol className="mt-3 space-y-2">
            {board.map((m) => (
              <motion.li key={m.memberId}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${m.isMe ? "border-primary bg-primary/10" : "bg-muted/40"}`}>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center font-display">{m.rank}</span>
                  <span className="text-2xl">{m.isBot ? "🤖" : "🧒"}</span>
                  <span className="font-display">{m.name}</span>
                  {m.isBot ? <Bot className="h-3 w-3 text-muted-foreground" /> : <UserCheck className="h-3 w-3 text-success" />}
                </div>
                <span className="font-display text-lg">{m.score}</span>
              </motion.li>
            ))}
            {board.length === 0 && <p className="text-sm text-muted-foreground">Ainda sem participantes.</p>}
          </ol>
          <div className="mt-3 text-right">
            <ChunkyButton tone="success" onClick={train}>Treinar (+pontos)</ChunkyButton>
          </div>
        </>
      )}

      {!loading && leagues.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Ainda não há ligas. Carrega em <strong>Entrar na liga</strong> para criar a tua e desafiar bots!
        </p>
      )}
    </section>
  );
}
