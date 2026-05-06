import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { loadProfile, type Profile } from "@/lib/storage";
import { appendMessages, getHistory } from "@/lib/tutorHistory";
import { ArrowLeft, Send, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tutor")({
  head: () => ({
    meta: [
      { title: "Mocha, o teu tutor — Lusis" },
      { name: "description", content: "Conversa com o Mocha, o teu tutor IA. Faz perguntas, aprende e diverte-te." },
    ],
  }),
  component: TutorChat,
});

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "Conta-me uma adivinha 🤔",
  "Ajuda-me com a tabuada do 7",
  "O que é um adjetivo?",
  "Conta-me sobre os planetas 🪐",
];

function TutorChat() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) { navigate({ to: "/comecar" }); return; }
    setProfile(p);
    setMessages([{
      role: "assistant",
      content: `Olá, ${p.name}! 👋 Sou o Mocha, o teu tutor. Podes perguntar-me o que quiseres — sobre matemática, leitura, animais, planetas… ou pede uma adivinha!`,
    }]);
  }, [navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await chatWithTutor({ data: {
        messages: next,
        childName: profile?.name,
        childGrade: profile?.grade,
      }});
      if (r.error) {
        setError(r.error);
      } else {
        setMessages([...next, { role: "assistant", content: r.reply }]);
      }
    } catch {
      setError("Não consegui responder agora. Tenta outra vez.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-[100dvh] bg-sky-island pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto flex max-w-2xl flex-col px-4 py-4" style={{ minHeight: "calc(100dvh - 4rem)" }}>
        <Link to="/app" className="mb-2 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Aventura
        </Link>

        <div className="card-chunky mb-3 flex items-center gap-3 rounded-3xl border border-border bg-card/90 p-4 backdrop-blur">
          <Mascot id="owl" size="md" bouncing />
          <div className="flex-1">
            <h1 className="font-display text-xl">Mocha 🦉</h1>
            <p className="text-xs text-muted-foreground">O teu tutor pessoal · sempre disponível</p>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <div ref={scrollRef} className="card-chunky flex-1 overflow-y-auto rounded-3xl border border-border bg-card/95 p-4 backdrop-blur" style={{ maxHeight: "60vh", minHeight: 320 }}>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:text-base",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm",
                  )}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">{error}</div>
            )}
          </div>
        </div>

        {messages.length <= 1 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-display backdrop-blur transition-colors hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mt-3 flex items-center gap-2 rounded-full border-2 border-border bg-card p-1.5 shadow-lg"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunta o que quiseres ao Mocha…"
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-base outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-chunky inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
