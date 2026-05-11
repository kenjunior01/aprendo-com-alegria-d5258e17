// Componente para painel de pais — sugere uma atividade offline em família
// baseada na lição mais recente da criança.

import { Lightbulb, Heart } from "lucide-react";

interface Props {
  lastSubject?: string | null;
  childName?: string;
}

const IDEAS: Record<string, { title: string; body: string; emoji: string }[]> = {
  matematica: [
    { emoji: "🍕", title: "Frações na pizza", body: "Cortem a pizza do jantar em 8 fatias e perguntem: 'Que fração comeste?' É a mesma matemática que praticou hoje." },
    { emoji: "🛒", title: "Trocos no supermercado", body: "Dêem-lhe 2€ e deixem que pague o pão. Contem juntos o troco." },
    { emoji: "🧸", title: "Caça aos pares", body: "Procurem 5 objetos pares pela casa (sapatos, meias, mãos…)" },
  ],
  portugues: [
    { emoji: "📖", title: "Conto antes de dormir", body: "Peçam para ler em voz alta uma página do livro favorito. Filmem e celebrem." },
    { emoji: "✉️", title: "Bilhete secreto", body: "Escondam um bilhete com 3 palavras novas para descobrir e desenhar." },
  ],
  "estudo-do-meio": [
    { emoji: "🌱", title: "Mini-horta na janela", body: "Plantem feijões num copo. Anotem o crescimento durante a semana." },
    { emoji: "🗺️", title: "Mapa da rua", body: "Desenhem juntos o caminho da escola até casa." },
  ],
  ciencia: [
    { emoji: "🔬", title: "Experiência da água", body: "Coloquem clipes a flutuar ou afundar e expliquem a densidade." },
  ],
  geral: [
    { emoji: "🎨", title: "Diário criativo", body: "Peçam para desenhar a parte favorita da aprendizagem de hoje." },
    { emoji: "🚶", title: "Caminhada de perguntas", body: "Façam um passeio onde a criança faz 3 perguntas sobre o que vê." },
  ],
};

function pickIdea(subject?: string | null) {
  const k = (subject ?? "geral") as keyof typeof IDEAS;
  const list = IDEAS[k] ?? IDEAS.geral;
  // determinismo simples baseado no dia
  const i = new Date().getDate() % list.length;
  return list[i];
}

export function FamilyChallengePanel({ lastSubject, childName }: Props) {
  const idea = pickIdea(lastSubject);
  return (
    <section className="card-chunky rounded-3xl border-2 border-secondary/40 bg-gradient-to-br from-secondary/10 via-card to-primary/10 p-4 sm:p-5">
      <header className="mb-2 flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <h2 className="font-display text-lg sm:text-xl">Desafio em Família</h2>
      </header>
      <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
        Liga a aprendizagem digital à vida real. Sugestão de hoje{childName ? ` para ${childName}` : ""}:
      </p>
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-3">
        <span className="text-3xl">{idea.emoji}</span>
        <div className="min-w-0">
          <p className="font-display text-base">{idea.title}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">{idea.body}</p>
        </div>
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Lightbulb className="h-3 w-3" /> Atualiza-se conforme a última matéria praticada.
      </p>
    </section>
  );
}
