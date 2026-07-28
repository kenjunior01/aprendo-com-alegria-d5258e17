import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedItem {
  id: string;
  childId: string;
  childName: string;
  kind: "lesson" | "achievement";
  text: string;
  emoji: string;
  at: string;
}

interface ChildSummary { id: string; name: string }

const SUBJECT_EMOJI: Record<string, string> = {
  portugues: "📖",
  matematica: "🧮",
  "estudo-do-meio": "🌍",
};

export function ParentRealtimeFeed({ childList }: { childList: ChildSummary[] }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!childList.length) return;
    const childMap = new Map(childList.map((c) => [c.id, c.name]));
    const childIds = childList.map((c) => c.id);

    const ch = supabase
      .channel("parent-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "practice_sessions" },
        (payload) => {
          const row = payload.new as { id: string; user_id: string; subject_id: string; correct: number; total: number; created_at: string };
          if (!childIds.includes(row.user_id)) return;
          const name = childMap.get(row.user_id) ?? "Criança";
          const acc = row.total ? Math.round((row.correct / row.total) * 100) : 0;
          push({
            id: row.id,
            childId: row.user_id,
            childName: name,
            kind: "lesson",
            emoji: SUBJECT_EMOJI[row.subject_id] ?? "✨",
            text: `${name} terminou uma lição de ${labelSubject(row.subject_id)} — ${acc}% de acertos!`,
            at: row.created_at,
          });
          notify(`${name} concluiu uma lição 🎉`, `${labelSubject(row.subject_id)} · ${acc}%`);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_achievements" },
        (payload) => {
          const row = payload.new as { id: string; user_id: string; achievement_code: string; unlocked_at: string };
          if (!childIds.includes(row.user_id)) return;
          const name = childMap.get(row.user_id) ?? "Criança";
          push({
            id: row.id,
            childId: row.user_id,
            childName: name,
            kind: "achievement",
            emoji: "🏆",
            text: `${name} desbloqueou a conquista “${row.achievement_code}”!`,
            at: row.unlocked_at,
          });
          notify(`Conquista nova! 🏆`, `${name} desbloqueou ${row.achievement_code}`);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setEnabled(true);
      });

    return () => {
      void supabase.removeChannel(ch);
    };
    function push(it: FeedItem) {
      setItems((prev) => [it, ...prev].slice(0, 20));
    }
  }, [childList]);

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") await Notification.requestPermission();
  };

  return (
    <section className="card-chunky rounded-3xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-lg">
          <Bell className="h-5 w-5 text-primary" /> Notificações em tempo real
          <span className={`ml-2 inline-block h-2 w-2 rounded-full ${enabled ? "bg-success" : "bg-muted-foreground"}`} />
        </h3>
        <button
          onClick={requestNotif}
          className="rounded-full bg-muted px-3 py-1 text-xs font-display text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          Ativar avisos
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          <Sparkles className="mr-1 inline h-4 w-4" />
          Quando o teu filho terminar uma lição ou desbloquear uma conquista, aparece aqui.
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((it) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-3 rounded-2xl px-3 py-2 text-sm ${
                  it.kind === "achievement" ? "bg-xp/15" : "bg-success/10"
                }`}
              >
                <span className="text-xl">{it.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="leading-tight">{it.text}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(it.at).toLocaleString("pt-PT")}</p>
                </div>
                {it.kind === "achievement" && <Trophy className="h-4 w-4 text-xp" />}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

function labelSubject(id: string) {
  if (id === "portugues") return "Português";
  if (id === "matematica") return "Matemática";
  if (id === "estudo-do-meio") return "Estudo do Meio";
  return id;
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    try { new Notification(title, { body, icon: "/favicon-192.png" }); } catch { /* noop */ }
  }
}
