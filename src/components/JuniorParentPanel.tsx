import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Compass, Heart } from "lucide-react";
import { loadJuniorProgress, GAMES, type JuniorProgress } from "@/lib/junior";

const TIPS = [
  "💡 Lê 5 minutos com a tua criança ao deitar — refoça vocabulário.",
  "🎨 Pinta com lápis grossos: ajuda a coordenação fina.",
  "🎶 Canta canções com gestos — desenvolve linguagem e ritmo.",
  "🧩 Faz puzzles de 4-6 peças juntos.",
  "🌳 Conta objetos durante o passeio ao parque.",
];

export function JuniorParentPanel() {
  const [progress, setProgress] = useState<JuniorProgress | null>(null);
  const [tip, setTip] = useState("");

  useEffect(() => {
    setProgress(loadJuniorProgress());
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  if (!progress) return null;
  const totalGames = GAMES.length;
  const playedCount = progress.playedGames.length;
  const pct = Math.round((playedCount / totalGames) * 100);

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
          <h2 className="font-display text-xl sm:text-2xl">Kidoz Júnior · Jornada de Descoberta</h2>
          <p className="text-sm text-muted-foreground">Atividades para os 2-5 anos. Acompanha em tempo real.</p>
        </div>
        <Link
          to="/junior"
          className="hidden rounded-full bg-primary px-3 py-1 font-display text-xs text-primary-foreground sm:inline-block"
        >
          Abrir Júnior →
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat icon={<Compass className="h-5 w-5 text-primary" />} label="Jogos descobertos" value={`${playedCount}/${totalGames}`} />
        <Stat icon={<Sparkles className="h-5 w-5 text-xp" />} label="Sessões totais" value={String(progress.totalSessions)} />
        <Stat icon={<Heart className="h-5 w-5 text-destructive" />} label="Última atividade" value={progress.lastPlayedAt ? new Date(progress.lastPlayedAt).toLocaleDateString("pt-PT") : "—"} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso global</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-xp to-success"
          />
        </div>
      </div>

      {progress.highlights.length > 0 && (
        <div className="mt-5">
          <h3 className="font-display text-sm">Momentos mágicos recentes</h3>
          <ul className="mt-2 space-y-1.5">
            {progress.highlights.slice(0, 4).map((h) => {
              const game = GAMES.find((g) => g.id === h.gameId);
              return (
                <li key={h.at} className="flex items-center gap-2 rounded-xl bg-card/70 px-3 py-2 text-sm">
                  <span className="text-xl">{game?.emoji ?? "✨"}</span>
                  <span className="flex-1">{h.note}</span>
                  <span className="text-xs text-muted-foreground">{new Date(h.at).toLocaleDateString("pt-PT")}</span>
                </li>
              );
            })}
          </ul>
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

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card/80 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}
