import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Compass, Heart } from "lucide-react";
import {
  loadJuniorProgress, listJuniorChildren, GAMES,
  type JuniorProgress, type JuniorChild,
} from "@/lib/junior";
import { Mascot } from "@/components/Mascot";

const TIPS = [
  "💡 Lê 5 minutos com a tua criança ao deitar — reforça vocabulário.",
  "🎨 Pinta com lápis grossos: ajuda a coordenação fina.",
  "🎶 Canta canções com gestos — desenvolve linguagem e ritmo.",
  "🧩 Faz puzzles de 4-6 peças juntos.",
  "🌳 Conta objetos durante o passeio ao parque.",
];

export function JuniorParentPanel() {
  const [children, setChildren] = useState<JuniorChild[]>([]);
  const [tip, setTip] = useState("");

  useEffect(() => {
    setChildren(listJuniorChildren());
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky rounded-3xl border-2 border-border bg-gradient-to-br from-secondary/30 via-accent/20 to-primary/10 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl sm:text-2xl">Kidoz Júnior · Jornada por criança</h2>
          <p className="text-sm text-muted-foreground">2-5 anos · progresso individual de cada perfil.</p>
        </div>
        <Link
          to="/junior"
          className="hidden rounded-full bg-primary px-3 py-1 font-display text-xs text-primary-foreground sm:inline-block"
        >
          Abrir Júnior →
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-border bg-card/70 p-5 text-center text-sm">
          Ainda não criaste perfis júnior.{" "}
          <Link to="/junior" className="font-display text-primary underline">Criar agora</Link>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {children.map((c) => <ChildCard key={c.id} child={c} />)}
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-accent/40 p-3 text-sm">
        <p className="font-display text-xs uppercase tracking-wide text-muted-foreground">Dica de hoje</p>
        <p className="mt-1">{tip}</p>
      </div>

      <Link
        to="/junior"
        className="mt-4 inline-block w-full rounded-2xl bg-primary px-4 py-3 text-center font-display text-primary-foreground sm:hidden"
      >
        Abrir Kidoz Júnior →
      </Link>
    </motion.section>
  );
}

function ChildCard({ child }: { child: JuniorChild }) {
  const [progress, setProgress] = useState<JuniorProgress | null>(null);
  useEffect(() => { setProgress(loadJuniorProgress(child.id)); }, [child.id]);
  if (!progress) return null;

  const totalGames = GAMES.length;
  const playedCount = progress.playedGames.length;
  const pct = Math.round((playedCount / totalGames) * 100);

  return (
    <div className="rounded-3xl border-2 border-border bg-card/80 p-4">
      <div className="flex items-center gap-3">
        <Mascot id={child.mascot} size="sm" />
        <div className="flex-1">
          <p className="font-display text-lg leading-tight">{child.name}</p>
          <p className="text-xs text-muted-foreground">{child.age} anos</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Stat icon={<Compass className="h-4 w-4 text-primary" />} label="Jogos" value={`${playedCount}/${totalGames}`} />
        <Stat icon={<Sparkles className="h-4 w-4 text-xp" />} label="Sessões" value={String(progress.totalSessions)} />
        <Stat icon={<Heart className="h-4 w-4 text-destructive" />} label="Última" value={progress.lastPlayedAt ? new Date(progress.lastPlayedAt).toLocaleDateString("pt-PT") : "—"} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso</span><span>{pct}%</span>
        </div>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-xp to-success" />
        </div>
      </div>

      {progress.highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {progress.highlights.slice(0, 3).map((h) => {
            const game = GAMES.find((g) => g.id === h.gameId);
            return (
              <li key={h.at} className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-1.5 text-xs">
                <span className="text-base">{game?.emoji ?? "✨"}</span>
                <span className="flex-1">{h.note}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(h.at).toLocaleDateString("pt-PT")}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/70 p-2">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">{icon}{label}</div>
      <p className="mt-0.5 font-display text-lg">{value}</p>
    </div>
  );
}
