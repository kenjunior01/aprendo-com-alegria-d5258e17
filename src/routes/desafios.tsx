import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Swords, Trophy, UserPlus, Check, X, Send, History as HistoryIcon } from "lucide-react";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import type { MascotId } from "@/lib/mascots";
import { SUBJECTS, getSubject } from "@/lib/curriculum";
import {
  listMyChallenges,
  getOrCreateDailyAiChallenge,
  getWeeklyRanking,
  listFriends,
  respondFriendship,
  requestFriendship,
  createPvpChallenge,
  type ChallengeRow,
} from "@/server/challenges.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/desafios")({
  head: () => ({
    meta: [
      { title: "Desafios e Ranking — Kidoz" },
      { name: "description", content: "Desafios diários da IA, batalhas com amigos e ranking semanal." },
    ],
  }),
  component: DesafiosPage,
});

function DesafiosPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myUserId, setMyUserId] = useState<string>("");
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [aiChallenge, setAiChallenge] = useState<ChallengeRow | null>(null);
  const [ranking, setRanking] = useState<Awaited<ReturnType<typeof getWeeklyRanking>>>({ ranking: [], me: null });
  const [friends, setFriends] = useState<Awaited<ReturnType<typeof listFriends>>["friends"]>([]);
  const [loading, setLoading] = useState(true);

  const fnList = useServerFn(listMyChallenges);
  const fnAi = useServerFn(getOrCreateDailyAiChallenge);
  const fnRank = useServerFn(getWeeklyRanking);
  const fnFriends = useServerFn(listFriends);
  const fnRespond = useServerFn(respondFriendship);
  const fnRequest = useServerFn(requestFriendship);
  const fnCreatePvp = useServerFn(createPvpChallenge);

  const refreshChallenges = async () => {
    const list = await fnList();
    setChallenges(list.challenges);
  };

  useEffect(() => {
    (async () => {
      try {
        const cloud = await pullProfileFromCloud();
        setProfile(cloud ?? loadProfile());
      } catch {
        setProfile(loadProfile());
      }
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? "";
      setMyUserId(uid);
      if (!uid) {
        // Não autenticado — não chama server fns (401). Mostra estado vazio.
        setLoading(false);
        return;
      }
      const settle = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
        try { return await p; } catch (e) { console.error(e); return fallback; }
      };
      const [list, ai, rank, fr] = await Promise.all([
        settle(fnList(), { challenges: [] as ChallengeRow[] }),
        settle(fnAi(), { challenge: null as ChallengeRow | null }),
        settle(fnRank(), { ranking: [], me: null } as Awaited<ReturnType<typeof getWeeklyRanking>>),
        settle(fnFriends(), { friends: [] as Awaited<ReturnType<typeof listFriends>>["friends"] }),
      ]);
      setChallenges(list.challenges ?? []);
      setAiChallenge(ai.challenge ?? null);
      setRanking(rank ?? { ranking: [], me: null });
      setFriends(fr.friends ?? []);
      setLoading(false);
    })();
  }, [fnList, fnAi, fnRank, fnFriends]);

  if (!profile) return null;

  return (
    <div className="min-h-[100dvh] bg-background pb-28 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky mb-5 rounded-3xl border-2 border-border bg-gradient-to-br from-primary/15 to-card p-4"
        >
          <div className="flex items-center gap-3">
            <Mascot id={profile.mascot} size="md" bouncing />
            <div>
              <h1 className="font-display text-2xl">Arena de Desafios</h1>
              <p className="text-sm text-muted-foreground">Joga, ganha moedas e sobe no ranking semanal!</p>
            </div>
          </div>
        </motion.div>

        {!myUserId && !loading && (
          <div className="card-chunky mb-4 rounded-2xl border-2 border-primary bg-primary/10 p-3 text-sm">
            🔐 Faz <Link to="/auth" className="font-display text-primary underline">login</Link> para participares em desafios PvP, IA e ranking semanal.
          </div>
        )}

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="ai" className="gap-1 px-1 text-xs sm:text-sm"><Sparkles className="h-4 w-4" />IA</TabsTrigger>
            <TabsTrigger value="pvp" className="gap-1 px-1 text-xs sm:text-sm"><Swords className="h-4 w-4" />PvP</TabsTrigger>
            <TabsTrigger value="historico" className="gap-1 px-1 text-xs sm:text-sm"><HistoryIcon className="h-4 w-4" />Histórico</TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1 px-1 text-xs sm:text-sm"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            {loading ? (
              <p className="text-center text-muted-foreground">A preparar o teu desafio…</p>
            ) : aiChallenge ? (
              <div className="card-chunky rounded-3xl border-2 border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg">Desafio do dia</h3>
                  <Badge variant="secondary" className="ml-auto">+{aiChallenge.coin_reward} 🪙</Badge>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  A IA escolheu para ti uma missão de <strong className="capitalize text-foreground">{aiChallenge.subject_id.replace("-", " ")}</strong> baseada nos teus pontos a melhorar.
                </p>
                <Button asChild className="w-full">
                  <Link
                    to="/licao/$subjectId/$lessonId"
                    params={{ subjectId: aiChallenge.subject_id, lessonId: aiChallenge.lesson_id }}
                    search={{ challenge: aiChallenge.id } as never}
                  >
                    Aceitar desafio →
                  </Link>
                </Button>
                {aiChallenge.status === "completed" && (
                  <p className="mt-2 text-center text-xs text-success">✅ Já concluído hoje — volta amanhã para um novo!</p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Faz algumas missões primeiro para a IA te conhecer.</p>
            )}
          </TabsContent>

          <TabsContent value="pvp">
            <FriendsBlock
              friends={friends}
              myUserId={myUserId}
              myGrade={profile.grade ?? 1}
              onRespond={async (id, accept) => {
                const r = await fnRespond({ data: { friendshipId: id, accept } });
                if (r.ok) {
                  toast.success(accept ? "Amigo adicionado!" : "Pedido recusado");
                  const fr = await fnFriends();
                  setFriends(fr.friends);
                } else toast.error(r.error);
              }}
              onAdd={async (id) => {
                const r = await fnRequest({ data: { addresseeId: id } });
                if (r.ok) {
                  toast.success("Pedido enviado!");
                  const fr = await fnFriends();
                  setFriends(fr.friends);
                } else toast.error(r.error);
              }}
              onChallenge={async (opponentId, subjectId, lessonId) => {
                const r = await fnCreatePvp({ data: { opponentId, subjectId, lessonId } });
                if (r.ok) {
                  toast.success("Desafio enviado! 🚀");
                  await refreshChallenges();
                } else toast.error(r.error);
              }}
            />

            <h3 className="mb-2 mt-6 font-display text-lg">Os meus desafios</h3>
            {challenges.filter((c) => c.kind === "pvp").length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há desafios PvP. Convida um amigo!</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 md:grid-cols-2">
                {challenges.filter((c) => c.kind === "pvp").map((c) => {
                  const myScore = c.creator_id === myUserId ? c.creator_score : c.opponent_score;
                  const oppScore = c.creator_id === myUserId ? c.opponent_score : c.creator_score;
                  const result = c.status === "completed"
                    ? c.winner_id === myUserId ? "🏆 Ganhaste!"
                      : c.winner_id == null ? "🤝 Empate"
                      : "💪 Tenta outra vez"
                    : "⏳ A decorrer";
                  return (
                    <li key={c.id} className="card-chunky flex flex-col gap-2 rounded-2xl border-2 border-border bg-card p-3">
                      <p className="font-display text-sm capitalize leading-tight">{c.subject_id.replace("-", " ")}</p>
                      <p className="text-[11px] text-muted-foreground">{result}</p>
                      <p className="text-[11px]">Tu: <strong>{myScore ?? "—"}</strong> · Adv: <strong>{oppScore ?? "—"}</strong></p>
                      {myScore == null && c.status !== "expired" && (
                        <Button size="sm" asChild className="mt-1 h-8 text-xs">
                          <Link
                            to="/licao/$subjectId/$lessonId"
                            params={{ subjectId: c.subject_id, lessonId: c.lesson_id }}
                            search={{ challenge: c.id } as never}
                          >
                            Jogar
                          </Link>
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="historico">
            <ChallengeHistory challenges={challenges} myUserId={myUserId} />
          </TabsContent>

          <TabsContent value="ranking">
            <div className="card-chunky rounded-3xl border-2 border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg">Ranking semanal</h3>
                {ranking.me?.rank && <Badge className="ml-auto">Estás em #{ranking.me.rank}</Badge>}
              </div>
              {ranking.ranking.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados desta semana ainda. Joga uma lição!</p>
              ) : (
                <ol className="grid grid-cols-2 gap-2 md:grid-cols-2">
                  {ranking.ranking.map((r, i) => (
                    <li key={r.userId} className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2">
                      <span className="w-5 text-center font-display text-base">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </span>
                      <Mascot id={r.mascot as MascotId} size="sm" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-display text-sm">{r.name}</span>
                        <span className="text-[11px] font-semibold text-primary">{r.xp} XP</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function FriendsBlock({
  friends, onRespond, onAdd, onChallenge, myUserId, myGrade,
}: {
  friends: Awaited<ReturnType<typeof listFriends>>["friends"];
  onRespond: (id: string, accept: boolean) => Promise<void>;
  onAdd: (userId: string) => Promise<void>;
  onChallenge: (opponentId: string, subjectId: string, lessonId: string) => Promise<void>;
  myUserId: string;
  myGrade: number;
}) {
  const [addId, setAddId] = useState("");
  const incoming = friends.filter((f) => f.incoming);
  const accepted = friends.filter((f) => f.status === "accepted");

  return (
    <div className="space-y-3">
      <div className="card-chunky rounded-2xl border-2 border-border bg-card p-3">
        <p className="mb-2 font-display text-sm">O teu código de amigo</p>
        <code className="block break-all rounded-md bg-muted px-2 py-1.5 text-xs">{myUserId}</code>
        <p className="mt-2 text-[11px] text-muted-foreground">Partilha-o com um amigo para vos ligarem.</p>
      </div>

      <div className="card-chunky rounded-2xl border-2 border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <input
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            placeholder="Cola aqui o código do amigo"
            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          />
          <Button size="sm" disabled={!addId} onClick={() => { onAdd(addId); setAddId(""); }}>
            <UserPlus className="mr-1 h-4 w-4" />Adicionar
          </Button>
        </div>
      </div>

      {incoming.length > 0 && (
        <div>
          <p className="mb-1 font-display text-sm">Pedidos recebidos</p>
          <ul className="grid grid-cols-2 gap-2">
            {incoming.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                <Mascot id={f.mascot as MascotId} size="sm" />
                <span className="flex-1 truncate font-display text-sm">{f.name}</span>
                <Button size="icon" variant="default" onClick={() => onRespond(f.friendshipId, true)}><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => onRespond(f.friendshipId, false)}><X className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          <p className="mb-1 font-display text-sm">Amigos · Desafia-os!</p>
          <ul className="grid grid-cols-2 gap-2">
            {accepted.map((f) => (
              <li key={f.friendshipId} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-2 text-center">
                <Mascot id={f.mascot as MascotId} size="sm" />
                <span className="line-clamp-1 w-full font-display text-sm">{f.name}</span>
                <ChallengeFriendDialog
                  friendName={f.name}
                  myGrade={myGrade}
                  onConfirm={(subjectId, lessonId) => onChallenge(f.userId, subjectId, lessonId)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChallengeFriendDialog({
  friendName, myGrade, onConfirm,
}: {
  friendName: string;
  myGrade: number;
  onConfirm: (subjectId: string, lessonId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<string>("portugues");
  const subject = useMemo(() => getSubject(subjectId), [subjectId]);
  const lessonsForGrade = useMemo(
    () => subject?.lessons.filter((l) => l.grade === myGrade) ?? subject?.lessons ?? [],
    [subject, myGrade],
  );
  const [lessonId, setLessonId] = useState<string>(lessonsForGrade[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLessonId(lessonsForGrade[0]?.id ?? "");
  }, [lessonsForGrade]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="h-8 w-full text-xs">
          <Swords className="mr-1 h-3.5 w-3.5" />Desafiar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Desafiar {friendName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Disciplina</label>
            <div className="grid grid-cols-3 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubjectId(s.id)}
                  className={`rounded-xl border-2 p-2 text-center text-xs transition ${
                    subjectId === s.id ? "border-primary bg-primary/10 font-display" : "border-border bg-card"
                  }`}
                >
                  <div className="text-lg">{s.emoji}</div>
                  <div className="leading-tight">{s.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Lição</label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
            >
              {lessonsForGrade.map((l) => (
                <option key={l.id} value={l.id}>{l.emoji} {l.title} ({l.grade}.º ano)</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={!lessonId || busy}
            onClick={async () => {
              setBusy(true);
              try { await onConfirm(subjectId, lessonId); setOpen(false); }
              finally { setBusy(false); }
            }}
          >
            <Send className="mr-1 h-4 w-4" />Enviar desafio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

function ChallengeHistory({
  challenges, myUserId,
}: {
  challenges: ChallengeRow[];
  myUserId: string;
}) {
  const open = challenges.filter((c) => {
    const my = c.creator_id === myUserId ? c.creator_score : c.opponent_score;
    return c.status === "open" && my == null;
  });
  const inProgress = challenges.filter((c) => {
    const my = c.creator_id === myUserId ? c.creator_score : c.opponent_score;
    return c.status === "open" && my != null;
  });
  const completed = challenges.filter((c) => c.status === "completed" || c.status === "expired");

  if (challenges.length === 0) {
    return (
      <div className="card-chunky rounded-3xl border-2 border-border bg-card p-6 text-center">
        <HistoryIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Ainda sem histórico — joga o desafio do dia ou convida um amigo!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Section title="🟢 Abertos" subtitle="Aguardam a tua jogada" items={open} myUserId={myUserId} action="play" />
      <Section title="⏳ Em andamento" subtitle="Adversário ainda joga" items={inProgress} myUserId={myUserId} />
      <Section title="🏁 Concluídos" subtitle="Resultados finais" items={completed} myUserId={myUserId} />
    </div>
  );
}

function Section({
  title, subtitle, items, myUserId, action,
}: {
  title: string;
  subtitle: string;
  items: ChallengeRow[];
  myUserId: string;
  action?: "play";
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="font-display text-base">{title}</h4>
        <span className="text-[11px] text-muted-foreground">{subtitle}</span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {items.map((c) => {
          const myScore = c.creator_id === myUserId ? c.creator_score : c.opponent_score;
          const oppScore = c.creator_id === myUserId ? c.opponent_score : c.creator_score;
          const won = c.winner_id === myUserId;
          const draw = c.status === "completed" && c.winner_id == null;
          const badgeClass = won ? "bg-success/15 text-success border-success" :
            draw ? "bg-muted text-muted-foreground border-border" :
            c.status === "completed" ? "bg-destructive/10 text-destructive border-destructive" :
            "bg-primary/10 text-primary border-primary";
          const result = won ? "🏆 Ganhaste" : draw ? "🤝 Empate" :
            c.status === "completed" ? "💪 Perdeste" :
            c.status === "expired" ? "⌛ Expirado" : "⏳ A decorrer";
          return (
            <li key={c.id} className="card-chunky flex flex-col gap-1.5 rounded-2xl border-2 border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm capitalize leading-tight">{c.subject_id.replace("-", " ")}</p>
                <Badge variant="outline" className="text-[10px]">{c.kind === "ai_daily" ? "IA" : "PvP"}</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{c.lesson_id}</p>
              <p className={`rounded-md border px-1.5 py-0.5 text-center text-[11px] font-display ${badgeClass}`}>{result}</p>
              <p className="text-[11px]">
                Tu: <strong>{myScore ?? "—"}</strong>
                {c.kind === "pvp" && <> · Adv: <strong>{oppScore ?? "—"}</strong></>}
              </p>
              <p className="text-[10px] text-muted-foreground">{fmtDate(c.created_at)}</p>
              {action === "play" && (
                <Button size="sm" asChild className="mt-1 h-8 text-xs">
                  <Link
                    to="/licao/$subjectId/$lessonId"
                    params={{ subjectId: c.subject_id, lessonId: c.lesson_id }}
                    search={{ challenge: c.id } as never}
                  >
                    Jogar
                  </Link>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
