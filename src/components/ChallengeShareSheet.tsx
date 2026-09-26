// ChallengeShareSheet — diálogo de partilha de Desafios Expressos.
// Botões: WhatsApp (verde), Copiar link, Partilhar (nativo, se existir).
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Link2, MessageCircle, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { challengeLink, copyLink, openWhatsApp, type ChallengePayload } from "@/lib/challengeShare";
import { haptic } from "@/lib/haptics";

interface Props {
  open: boolean;
  onClose: () => void;
  payload: ChallengePayload | null;
  /** Pré-visualização do título (ex: "Matemática · Somas até 20") */
  title?: string;
}

export function ChallengeShareSheet({ open, onClose, payload, title }: Props) {
  const [copied, setCopied] = useState(false);

  if (!payload) return null;

  const doWhatsApp = () => {
    haptic("tap");
    const link = challengeLink(payload);
    const msg = buildMsg(payload);
    if (openWhatsApp(`${msg}\n\n▶️ Jogar: ${link}`)) {
      toast.success("A abrir o WhatsApp…", { icon: "💬" });
      onClose();
    }
  };

  const doCopy = async () => {
    haptic("tap");
    const link = challengeLink(payload);
    const res = await copyLink(link);
    if (res === "copied") {
      setCopied(true);
      toast.success("Link copiado! Cola onde quiseres 💚");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Não consegui copiar — tenta partilhar nativo");
    }
  };

  const doNative = async () => {
    haptic("tap");
    try {
      await navigator.share({
        title: "Desafio Kidoz ⚡",
        text: buildMsg(payload),
        url: challengeLink(payload),
      });
      onClose();
    } catch {
      /* cancelado */
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 60, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-5 pb-7 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold">⚡ Desafio criado!</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {title ?? "Envia o link a um amigo pelo WhatsApp"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-full bg-muted p-1.5 text-muted-foreground transition hover:bg-muted/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pré-visualização da mensagem */}
            <div className="mt-3 rounded-2xl bg-[#dcf8c6] p-3 text-xs leading-relaxed text-slate-800 shadow-inner">
              <p className="font-bold">🏆 {payload.n} desafiou-te no Kidoz!</p>
              {title && <p>{title}</p>}
              <p className="text-slate-600 underline">▶️ Jogar: kidoz.online/desafio…</p>
            </div>

            <div className="mt-4 grid gap-2.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={doWhatsApp}
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 font-display text-base font-bold text-white shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar pelo WhatsApp
              </motion.button>
              <div className="grid grid-cols-2 gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={doCopy}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background py-3 font-display text-sm font-bold"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copiado!" : "Copiar link"}
                </motion.button>
                {"share" in navigator ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={doNative}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background py-3 font-display text-sm font-bold"
                  >
                    <Share2 className="h-4 w-4" />
                    Partilhar
                  </motion.button>
                ) : (
                  <a
                    href={challengeLink(payload)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background py-3 font-display text-sm font-bold"
                  >
                    <Link2 className="h-4 w-4" />
                    Abrir link
                  </a>
                )}
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              O desafio vive no link — o teu amigo joga sem precisar de conta! 🎉
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildMsg(p: ChallengePayload): string {
  if (p.k === "lesson") {
    return p.c !== undefined ? `🎯 Pontuação a bater: ${p.c}%` : "🎯 Consegues ganhar-me?";
  }
  return p.s !== undefined ? `⭐ Estrelas a bater: ${p.s}` : "⭐ Consegues 3 estrelas?";
}
