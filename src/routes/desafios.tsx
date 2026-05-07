import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Swords, Trophy, UserPlus, Check, X, Crown } from "lucide-react";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import {
  listMyChallenges,
  getOrCreateDailyAiChallenge,
  getWeeklyRanking,
  listFriends,
  respondFriendship,
  requestFriendship,
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

  useEffect(() => {
    (async () => {
      const cloud = await pullProfileFromCloud();
      setProfile(cloud ?? loadProfile());
      try {
        const [list, ai, rank, fr] = await Promise.all([
          fnList(),
          fnAi(),
          fnRank(),
          fnFriends(),
        ]);
        setChallenges(list.challenges);
        setAiChallenge(ai.challenge);
        setRanking(rank);
        setFriends(fr.friends);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="ai" className="gap-1"><Sparkles className="h-4 w-4" />IA</TabsTrigger>
            <TabsTrigger value="pvp" className="gap-1"><Swords className="h-4 w-4" />PvP</TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>
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
                  <Link to="/licao/$subjectId/$lessonId" params={{ subjectId: aiChallenge.subject_id, lessonId: aiChallenge.lesson_id }}>
                    Aceitar desafio →
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Faz algumas missões primeiro para a IA te conhecer.</p>
            )}
          </TabsContent>

          <TabsContent value="pvp">
            <FriendsBlock
              friends={friends}
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
              myUserId={profile.id ?? ""}
            />

            <h3 className="mb-2 mt-6 font-display text-lg">Os meus desafios</h3>
            {challenges.filter((c) => c.kind === "pvp").length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há desafios PvP. Convida um amigo!</p>
            ) : (
              <ul className="space-y-2">
                {challenges.filter((c) => c.kind === "pvp").map((c) => (
                  <li key={c.id} className="card-chunky flex items-center justify-between rounded-2xl border-2 border-border bg-card p-3">
                    <div>
                      <p className="font-display capitalize">{c.subject_id.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground">{c.status === "completed" ? (c.winner_id ? "✅ Concluído" : "🤝 Empate") : "⏳ A decorrer"}</p>
                    </div>
                    {c.status === "open" && (
                      <Button size="sm" asChild>
                        <Link to="/licao/$subjectId/$lessonId" params={{ subjectId: c.subject_id, lessonId: c.lesson_id }}>Jogar</Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
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
                <ol className="space-y-2">
                  {ranking.ranking.map((r, i) => (
                    <li key={r.userId} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-2">
                      <span className="w-6 text-center font-display text-lg">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </span>
                      <Mascot id={r.mascot} size="sm" />
                      <span className="flex-1 truncate font-display">{r.name}</span>
                      <span className="font-display text-primary">{r.xp} XP</span>
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
  friends,
  onRespond,
  onAdd,
  myUserId,
}: {
  friends: Awaited<ReturnType<typeof listFriends>>["friends"];
  onRespond: (id: string, accept: boolean) => Promise<void>;
  onAdd: (userId: string) => Promise<void>;
  myUserId: string;
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
          <ul className="space-y-2">
            {incoming.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                <Mascot id={f.mascot} size="sm" />
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
          <p className="mb-1 font-display text-sm">Amigos</p>
          <ul className="grid grid-cols-2 gap-2">
            {accepted.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
                <Mascot id={f.mascot} size="sm" />
                <span className="truncate font-display text-sm">{f.name}</span>
                <Crown className="ml-auto h-3 w-3 text-primary" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
