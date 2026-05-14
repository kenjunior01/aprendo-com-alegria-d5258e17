import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { VoiceReader } from "@/components/VoiceReader";
import { loadProfile, type Profile } from "@/lib/storage";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getAdaptiveRecommendation } from "@/server/ai.functions";
import { detectRegion } from "@/lib/region";

export const Route = createFileRoute("/leitura")({
  head: () => ({
    meta: [
      { title: "Leitura em voz alta — Kidoz" },
      { name: "description", content: "Pratica a leitura com reconhecimento de voz adaptado a crianças." },
      { property: "og:title", content: 'Leitura em voz alta — Kidoz' },
      { property: "og:description", content: 'Pratica a leitura com reconhecimento de voz adaptado a crianças.' },
      { property: "og:url", content: "https://kidoz.online/leitura" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/leitura" },
    ],
  }),
  component: ReadingPage,
});

const PHRASES_PT_PT: Record<number, string[]> = {
  1: ["O sol brilha no céu.", "A bola é vermelha.", "O gato bebe leite.", "A Mocha é uma coruja."],
  2: ["A borboleta voa pelo jardim colorido.", "Os meninos jogam à bola no parque.", "A galinha põe ovos no galinheiro."],
  3: ["O coelho saltou para dentro da floresta sombria.", "Lisboa fica junto ao rio Tejo, em Portugal.", "As estrelas brilham na noite de verão."],
  4: ["Os exploradores portugueses descobriram novos caminhos pelo mar.", "A reciclagem ajuda a proteger o nosso planeta azul.", "As frações representam partes iguais de um todo."],
};
const PHRASES_PT_BR: Record<number, string[]> = {
  1: ["O sol brilha no céu.", "A bola é vermelha.", "O gato toma leite.", "O sapo pula na lagoa."],
  2: ["A borboleta voa pelo jardim colorido.", "As crianças brincam de pique-esconde.", "A galinha bota ovos no galinheiro."],
  3: ["O coelho pulou para dentro da floresta escura.", "O Rio de Janeiro fica junto ao mar.", "As estrelas brilham na noite de verão."],
  4: ["Os bandeirantes exploraram o interior do Brasil.", "A reciclagem ajuda a proteger nosso planeta azul.", "As frações representam partes iguais de um todo."],
};
const PHRASES_EN: Record<number, string[]> = {
  1: ["The sun shines in the sky.", "The ball is red.", "The cat drinks milk.", "The owl is wise."],
  2: ["The butterfly flies through the garden.", "Children play in the park.", "The hen lays eggs in the coop."],
  3: ["The rabbit hopped into the dark forest.", "The stars shine bright at night.", "We learn something new every day."],
  4: ["Explorers discovered new paths across the seas.", "Recycling helps protect our blue planet.", "Fractions represent equal parts of a whole."],
};
function phrasesForRegion(): Record<number, string[]> {
  const r = detectRegion();
  if (r.language === "en") return PHRASES_EN;
  if (r.code === "BR") return PHRASES_PT_BR;
  return PHRASES_PT_PT;
}

function ReadingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
    // Try to fetch AI tip silently (only logged-in users)
    void getAdaptiveRecommendation()
      .then((r) => setTip(r.message))
      .catch(() => setTip(null));
  }, [navigate]);

  if (!profile) return null;

  const phrasesMap = phrasesForRegion();
  const phrases = phrasesMap[profile.grade] ?? phrasesMap[1];
  const phrase = phrases[phraseIndex % phrases.length];

  const handleResult = (matched: boolean) => {
    if (matched) {
      setScore((s) => s + 1);
      void import("@/lib/dailyMissions").then(({ applyProgress }) => {
        applyProgress({ subject: "leitura", readsDelta: 1 });
      });
    }
  };

  const next = () => setPhraseIndex((i) => i + 1);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link to="/app" className="mb-3 inline-flex items-center gap-1 text-sm font-display text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Aventura
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary/30 to-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <Mascot id={profile.mascot} size="md" equippedItemId={profile.equippedItem} />
            <div>
              <h1 className="font-display text-2xl">Hora de ler! 📖</h1>
              <p className="text-sm text-muted-foreground">Lê em voz alta — eu vou ouvir-te.</p>
            </div>
          </div>
          {tip && (
            <p className="mt-3 inline-flex items-center gap-1 rounded-2xl bg-card px-3 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> {tip}
            </p>
          )}
        </motion.section>

        <div className="mt-6">
          <VoiceReader expected={phrase} onResult={handleResult} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ChunkyButton tone="ghost" onClick={next} className="flex-1">Outra frase →</ChunkyButton>
          <Link to="/app" className="flex-1">
            <ChunkyButton tone="primary" className="w-full">Voltar à aventura</ChunkyButton>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ⭐ Lidas corretamente nesta sessão: <strong>{score}</strong>
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
