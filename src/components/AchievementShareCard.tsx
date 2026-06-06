import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  childName: string;
  xp: number;
  streak: number;
  unlockedCount: number;
  totalCount: number;
  className?: string;
}

export function AchievementShareCard({ childName, xp, streak, unlockedCount, totalCount, className }: Props) {
  const [copied, setCopied] = useState(false);

  const text = `🌟 ${childName} no Kidoz!\n` +
    `🏅 ${unlockedCount}/${totalCount} medalhas conquistadas\n` +
    `⭐ ${xp} XP · 🔥 ${streak} dias seguidos\n` +
    `Aprende a brincar em https://kidoz.online`;

  const handle = async () => {
    const data = { title: "Kidoz — As minhas conquistas", text, url: "https://kidoz.online" };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share(data);
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-border bg-gradient-to-r from-primary to-secondary px-4 py-2 font-display text-sm text-primary-foreground shadow-sm transition-transform active:scale-95",
        className,
      )}
      aria-label="Partilhar as minhas conquistas"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copiado!" : "Partilhar conquistas"}
      {!copied && <Copy className="h-3.5 w-3.5 opacity-70" />}
    </button>
  );
}
