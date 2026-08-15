import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, Swords, Trophy, UserPlus, Check, X, Send, History as HistoryIcon, MapPin, Zap, Flame } from "lucide-react";
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
} from "@/lib/challenges.functions";
import { toast } from "sonner";
import { LigasPanel } from "@/components/LigasPanel";
import { cn } from "@/lib/utils";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/desafios")({
  head: () => ({
    meta: [
      { title: "Arena de Desafios — Kidoz" },
      { name: "description", content: "Desafios diários da IA, batalhas épicas com amigos e ligas nacionais." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
  }),
  component: DesafiosPage,
  errorComponent: RouteError,
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

  if (!profile) return (
    <main id="main-content" className="flex min-h-[60dvh] items-center justify-center">
      <p className="animate-pulse font-display text-lg text-muted-foreground" role="status" aria-live="polite">A carregar…</p>
    </main>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-28 md:pb-12">
      <TopBar profile={profile} />

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-6">
        {/* Spectacular Arena Hero */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
        >
          {/* Animated Background Elements */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:text-left">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              <Mascot id={profile.mascot} size="lg" bouncing className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 -z-10 rounded-full bg-white/20 blur-xl"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">ARENA ÉPICA</h1>
              <p className="mt-2 text-lg font-medium text-white/80">Vence desafios, sobe de liga e torna-te uma lenda!</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge className="bg-white/20 text-white backdrop-blur-md">🏆 LIGA DE OURO</Badge>
                <Badge className="bg-yellow-400 text-amber-950 font-bold">🔥 {profile.streak} DIAS</Badge>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Global/Regional Mozambique Challenge Banner */}
        <Link to="/desafios/infinitos" className="group relative mb-8 flex items-center gap-4 overflow-hidden rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-4 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/4 opacity-10 group-hover:rotate-12 transition-transform">
             <MapPin className="h-32 w-32 text-emerald-600" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
            <MapPin className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-emerald-900 leading-tight">Grande Desafio Moçambicano 🇲🇿</h2>
            <p className="text-sm text-emerald-700/80">Explora as províncias e ganha prémios exclusivos de cultura geral.</p>
          </div>
          <div className="rounded-full bg-emerald-500 p-2 text-white shadow-md group-hover:translate-x-1 transition-transform">
            <Zap className="h-5 w-5 fill-current" />
          </div>
        </Link>

        {!myUserId && !loading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 rounded-3xl bg-amber-100 p-6 text-center border-b-4 border-amber-200"
          >
            <p className="font-display text-amber-900">Estás a jogar como convidado!</p>
            <p className="text-sm text-amber-800 mb-4">Cria conta para salvar as tuas medalhas na Arena.</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 border-b-4 border-amber-700 active:border-b-0 transition-all">
              <Link to="/auth">Criar Conta Grátis</Link>
            </Button>
          </motion.div>
        )}

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-5 h-16 bg-white p-2 rounded-2xl shadow-lg">
            <TabsTrigger value="ai" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2">
              <Sparkles className="h-4 w-4" /><span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="pvp" className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all gap-2">
              <Swords className="h-4 w-4" /><span className="hidden sm:inline">BATALHA</span>
            </TabsTrigger>
            <TabsTrigger value="ligas" className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all gap-2">
              <Trophy className="h-4 w-4" /><span className="hidden sm:inline">LIGAS</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all gap-2">
              <Flame className="h-4 w-4" /><span className="hidden sm:inline">RANK</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="rounded-xl data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all gap-2">
              <HistoryIcon className="h-4 w-4" /><span className="hidden sm:inline">HIST.</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="ai" key="ai">
              {loading ? (
                <div className="flex flex-col items-center py-12">
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                     <Sparkles className="h-12 w-12 text-primary/30" />
                   </motion.div>
                </div>
              ) : aiChallenge ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-[2rem] border-4 border-primary/20 bg-white p-8 shadow-xl"
                >
                  <div className="absolute -right-4 -top-4 text-primary opacity-5">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Zap className="h-8 w-8 fill-current" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold">Missão Diária</h2>
                        <p className="text-sm text-muted-foreground">Especialmente para ti</p>
                      </div>
                    </div>
                    <Badge className="bg-xp px-4 py-2 text-lg font-black shadow-lg">+{aiChallenge.coin_reward} 🪙</Badge>
                  </div>

                  <p className="mb-8 text-lg leading-relaxed text-slate-700">
                    Prepara-te! A tua missão de hoje é <span className="font-black text-primary uppercase underline decoration-primary/30 underline-offset-4">{aiChallenge.subject_id.replace("-", " ")}</span>. Estás pronto para o desafio?
                  </p>

                  <Button asChild size="lg" className="h-16 w-full rounded-2xl bg-primary text-xl font-black shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Link
                      to="/licao/$subjectId/$lessonId"
                      params={{ subjectId: aiChallenge.subject_id, lessonId: aiChallenge.lesson_id }}
                      search={{ challenge: aiChallenge.id } as never}
                    >
                      ACEITAR E JOGAR! 🚀
                    </Link>
                  </Button>

                  {aiChallenge.status === "completed" && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 flex items-center justify-center gap-2 text-success font-display">
                      <Check className="h-5 w-5" /> Missão cumprida com sucesso!
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <Mascot id="owl" size="md" className="mx-auto grayscale opacity-50 mb-4" />
                  <p className="text-slate-500 font-display">A IA ainda está a estudar o teu perfil...</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pvp" key="pvp">
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

              <h2 className="mb-4 mt-8 font-display text-2xl flex items-center gap-2">
                <Swords className="h-6 w-6 text-purple-600" /> Batalhas Ativas
              </h2>

              {challenges.filter((c) => c.kind === "pvp").length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
                  Sem batalhas de momento. Convida os teus amigos!
                </div>
              ) : (
                <div role="list" className="grid gap-4 sm:grid-cols-2">
                  {challenges.filter((c) => c.kind === "pvp").map((c) => {
                    const myScore = c.creator_id === myUserId ? c.creator_score : c.opponent_score;
                    const oppScore = c.creator_id === myUserId ? c.opponent_score : c.creator_score;
                    const result = c.status === "completed"
                      ? c.winner_id === myUserId ? "🏆 VITÓRIA!"
                        : c.winner_id == null ? "🤝 EMPATE"
                        : "💪 DERROTA"
                      : "⏳ BATALHA";

                    return (
                      <motion.div
                        key={c.id}
                        whileHover={{ y: -4 }}
                        role="listitem"
                        className="relative overflow-hidden rounded-[2rem] border-2 border-purple-200 bg-white p-5 shadow-lg"
                      >
                        <div className="mb-3 flex justify-between items-center">
                           <Badge className={cn(
                             "px-3 py-1",
                             result.includes("VITÓRIA") ? "bg-success" : "bg-purple-600"
                           )}>{result}</Badge>
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{c.subject_id}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4 py-4">
                           <div className="text-center flex-1">
                             <p className="text-2xl font-black text-slate-800">{myScore ?? "?"}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase">Tu</p>
                           </div>
                           <div className="text-purple-300 font-display text-xl font-black italic">VS</div>
                           <div className="text-center flex-1">
                             <p className="text-2xl font-black text-slate-800">{oppScore ?? "?"}</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase">Adversário</p>
                           </div>
                        </div>

                        {myScore == null && c.status !== "expired" && (
                          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg mt-2">
                            <Link
                              to="/licao/$subjectId/$lessonId"
                              params={{ subjectId: c.subject_id, lessonId: c.lesson_id }}
                              search={{ challenge: c.id } as never}
                            >
                              JOGAR AGORA!
                            </Link>
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ligas" key="ligas">
              <LigasPanel ageGroup={profile.grade ? `grade-${profile.grade}` : "mixed"} />
            </TabsContent>

            <TabsContent value="ranking" key="ranking">
               <RankingView ranking={ranking} />
            </TabsContent>

            <TabsContent value="historico" key="historico">
              <ChallengeHistory challenges={challenges} myUserId={myUserId} />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function RankingView({ ranking }: { ranking: Awaited<ReturnType<typeof getWeeklyRanking>> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[2rem] border-2 border-blue-100 bg-white shadow-xl"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" /> Melhores da Semana
          </h2>
          <p className="text-sm text-white/70">Top 10 aventureiros do Kidoz</p>
        </div>
        {ranking.me?.rank && (
          <div className="text-center bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/30">
            <p className="text-xs uppercase font-bold opacity-80 leading-none mb-1 text-blue-100">O Teu Rank</p>
            <p className="text-2xl font-black leading-none">#{ranking.me.rank}</p>
          </div>
        )}
      </div>

      <div className="p-4">
        {ranking.ranking.length === 0 ? (
          <p className="text-center py-12 text-slate-500">Joga uma lição para apareceres aqui!</p>
        ) : (
          <div role="list" aria-live="polite" className="space-y-2">
            {ranking.ranking.map((r, i) => {
               const isTop3 = i < 3;
               const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";

               return (
                <motion.div
                  key={r.userId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-b border-slate-100 p-4 transition-colors hover:bg-slate-50",
                    isTop3 && "bg-blue-50/30"
                  )}
                >
                  <span className={cn(
                    "w-8 text-center font-display text-xl font-black",
                    i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-300"
                  )}>
                    {isTop3 ? medal : i + 1}
                  </span>
                  <div className="relative">
                    <Mascot id={r.mascot as MascotId} size="sm" />
                    {i === 0 && <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 animate-pulse" />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-display text-base font-bold text-slate-800">{r.name}</span>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest leading-none">Rank Global</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800 leading-none">{r.xp}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">XP Total</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
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
    <div className="space-y-4">
      {/* Code Sharing Area */}
      <div className="rounded-[2rem] bg-indigo-900 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10">
          <UserPlus className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-lg font-bold mb-1">Convida os teus Amigos</h2>
          <p className="text-indigo-200 text-sm mb-4">Partilha o teu código único para batalharem.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl bg-white/10 border border-white/20 p-3 text-center font-mono text-base font-bold tracking-widest uppercase">
              {myUserId.slice(0, 8)}...
            </code>
            <Button
              size="icon"
              className="h-12 w-12 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50"
              onClick={() => {
                navigator.clipboard.writeText(myUserId);
                toast.success("Código copiado!");
              }}
            >
              <CopyIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Friend Input */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-md border border-slate-100">
        <input
          value={addId}
          onChange={(e) => setAddId(e.target.value)}
          placeholder="Cola o código de um amigo..."
          className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
        />
        <Button
          disabled={!addId}
          onClick={() => { onAdd(addId); setAddId(""); }}
          className="bg-indigo-600 rounded-xl"
        >
          Ligar
        </Button>
      </div>

      {incoming.length > 0 && (
        <div className="pt-4">
          <p className="mb-3 font-display text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Pedidos Pendentes</p>
          <div role="list" className="grid gap-2">
            {incoming.map((f) => (
              <motion.div
                layout
                key={f.friendshipId}
                role="listitem"
                className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 p-3 shadow-sm"
              >
                <Mascot id={f.mascot as MascotId} size="sm" />
                <span className="flex-1 font-display text-sm font-bold text-slate-700">{f.name}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-success hover:bg-success/10" onClick={() => onRespond(f.friendshipId, true)} aria-label="Aceitar"><Check className="h-5 w-5" /></Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => onRespond(f.friendshipId, false)} aria-label="Rejeitar"><X className="h-5 w-5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div className="pt-4">
          <p className="mb-3 font-display text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Lista de Amigos</p>
          <div role="list" className="grid grid-cols-2 gap-3">
            {accepted.map((f) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={f.friendshipId}
                role="listitem"
                className="flex flex-col items-center gap-3 rounded-[2rem] bg-white border border-slate-100 p-4 text-center shadow-md relative"
              >
                <div className="absolute top-2 right-2">
                   <div className="h-3 w-3 rounded-full bg-success ring-4 ring-white" />
                </div>
                <Mascot id={f.mascot as MascotId} size="md" />
                <span className="font-display text-base font-bold text-slate-800 line-clamp-1">{f.name}</span>
                <ChallengeFriendDialog
                  friendName={f.name}
                  myGrade={myGrade}
                  onConfirm={(subjectId, lessonId) => onChallenge(f.userId, subjectId, lessonId)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
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
        <Button size="sm" variant="secondary" className="h-10 w-full rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold">
          <Swords className="mr-1 h-4 w-4" />DESAFIAR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Desafiar {friendName}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Inicia um desafio PvP contra este amigo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div>
            <label className="mb-3 block text-xs font-black uppercase tracking-widest text-slate-500">Escolhe a Disciplina</label>
            <div className="grid grid-cols-3 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubjectId(s.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all",
                    subjectId === s.id
                      ? "border-indigo-600 bg-indigo-50 shadow-md scale-[1.05]"
                      : "border-slate-100 bg-slate-50 hover:bg-white"
                  )}
                >
                  <div className="text-3xl">{s.emoji}</div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-tight text-slate-800">{s.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Qual a Lição?</label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white"
            >
              {lessonsForGrade.map((l) => (
                <option key={l.id} value={l.id}>{l.emoji} {l.title} ({l.grade}.º ano)</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter className="pt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Voltar</Button>
          <Button
            disabled={!lessonId || busy}
            className="bg-indigo-600 h-12 rounded-xl px-8 font-black shadow-lg"
            onClick={async () => {
              setBusy(true);
              try { await onConfirm(subjectId, lessonId); setOpen(false); }
              finally { setBusy(false); }
            }}
          >
            LANÇAR DESAFIO!
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
      <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-lg border-2 border-slate-50">
        <HistoryIcon className="mx-auto mb-4 h-12 w-12 text-slate-200" />
        <p className="font-display text-lg text-slate-500">Ainda sem histórico...</p>
        <p className="text-sm text-slate-500 mt-1">Joga o desafio do dia para começar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Section title="Pendente" items={open} myUserId={myUserId} action="play" />
      <Section title="A decorrer" items={inProgress} myUserId={myUserId} />
      <Section title="Histórico" items={completed} myUserId={myUserId} />
    </div>
  );
}

function Section({
  title, items, myUserId, action,
}: {
  title: string;
  items: ChallengeRow[];
  myUserId: string;
  action?: "play";
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 font-display text-sm font-black uppercase tracking-[0.2em] text-slate-500 px-2">{title}</h3>
      <div role="list" className="grid gap-3 sm:grid-cols-2">
        {items.map((c) => {
          const myScore = c.creator_id === myUserId ? c.creator_score : c.opponent_score;
          const oppScore = c.creator_id === myUserId ? c.opponent_score : c.creator_score;
          const won = c.winner_id === myUserId;
          const draw = c.status === "completed" && c.winner_id == null;

          const resultText = won ? "VITÓRIA" : draw ? "EMPATE" :
            c.status === "completed" ? "DERROTA" :
            c.status === "expired" ? "EXPIRADO" : "PENDENTE";

          return (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.01 }}
              role="listitem"
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-sm font-bold capitalize text-slate-800">{c.subject_id.replace("-", " ")}</span>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full border",
                  won ? "border-success text-success bg-success/5" : "border-slate-300 text-slate-500"
                )}>{resultText}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{fmtDate(c.created_at)}</p>
                   <p className="text-sm font-black text-slate-700">Tu: {myScore ?? "?"} · Adv: {oppScore ?? "?"}</p>
                </div>
                {action === "play" && (
                  <Button asChild size="sm" className="rounded-lg bg-indigo-600 h-8 shadow-md">
                    <Link
                      to="/licao/$subjectId/$lessonId"
                      params={{ subjectId: c.subject_id, lessonId: c.lesson_id }}
                      search={{ challenge: c.id } as never}
                    >
                      JOGAR
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
