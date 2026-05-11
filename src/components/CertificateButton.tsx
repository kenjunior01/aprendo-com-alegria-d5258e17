import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { generateCertificate } from "@/lib/certificate.functions";
import type { MascotId } from "@/lib/mascots";
import { toast } from "sonner";

interface Props {
  childName: string;
  grade: number;
  mascot: MascotId;
}

const MASCOT_EMOJI: Record<string, string> = {
  fox: "🦊", owl: "🦉", bear: "🐻", cat: "🐱", dragon: "🐲", unicorn: "🦄",
};

export function CertificateButton({ childName, grade, mascot }: Props) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const { pdfBase64, fileName } = await generateCertificate({
        data: { childName, grade, mascotEmoji: MASCOT_EMOJI[mascot] ?? "✨" },
      });
      const bin = atob(pdfBase64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Certificado pronto! 🎉");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar agora. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChunkyButton tone="primary" onClick={download} className="w-full gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
      Descarregar certificado do {grade}.º ano
    </ChunkyButton>
  );
}
