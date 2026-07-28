// Geração de certificado digital em PDF.
// Usa pdf-lib (compatível com Cloudflare Workers / TanStack Start server).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  childName: z.string().min(1).max(60),
  grade: z.number().int().min(1).max(7),
  mascotEmoji: z.string().max(8).optional(),
  region: z.string().max(2).optional(),
});

export const generateCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }) => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
    const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

    // Borda dourada
    page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: rgb(0.86, 0.65, 0.13), borderWidth: 4 });
    page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: rgb(0.95, 0.82, 0.36), borderWidth: 1 });

    // Título
    const title = "Certificado de Conquista";
    const tw = titleFont.widthOfTextAtSize(title, 36);
    page.drawText(title, { x: (width - tw) / 2, y: height - 100, size: 36, font: titleFont, color: rgb(0.18, 0.16, 0.32) });

    // Subtítulo Kidoz
    const sub = "Kidoz.online";
    const sw = bodyFont.widthOfTextAtSize(sub, 16);
    page.drawText(sub, { x: (width - sw) / 2, y: height - 130, size: 16, font: bodyFont, color: rgb(0.45, 0.4, 0.55) });

    // Texto principal
    const intro = "Certificamos que";
    const introW = italic.widthOfTextAtSize(intro, 16);
    page.drawText(intro, { x: (width - introW) / 2, y: height - 200, size: 16, font: italic, color: rgb(0.3, 0.3, 0.3) });

    const name = data.childName;
    const nameSize = 44;
    const nameW = titleFont.widthOfTextAtSize(name, nameSize);
    page.drawText(name, { x: (width - nameW) / 2, y: height - 260, size: nameSize, font: titleFont, color: rgb(0.13, 0.45, 0.78) });

    const desc = `concluiu com sucesso o ${data.grade}.\u00ba ano na Kidoz`;
    const descW = bodyFont.widthOfTextAtSize(desc, 18);
    page.drawText(desc, { x: (width - descW) / 2, y: height - 305, size: 18, font: bodyFont, color: rgb(0.2, 0.2, 0.2) });

    // Mascote
    if (data.mascotEmoji) {
      const m = data.mascotEmoji;
      const mw = titleFont.widthOfTextAtSize(m, 60);
      try {
        page.drawText(m, { x: (width - mw) / 2, y: 160, size: 60, font: titleFont });
      } catch {
        // emojis podem não renderizar — ignora
      }
    }

    // Rodapé com data + assinatura mascote
    const date = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
    page.drawText(`Emitido em ${date}`, { x: 60, y: 60, size: 12, font: bodyFont, color: rgb(0.4, 0.4, 0.4) });

    const sig = "Assinado pela tua mascote ✨";
    const sigW = italic.widthOfTextAtSize(sig, 12);
    page.drawText(sig, { x: width - 60 - sigW, y: 60, size: 12, font: italic, color: rgb(0.4, 0.4, 0.4) });

    const bytes = await pdf.save();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
    return { pdfBase64: base64, fileName: `certificado-kidoz-${data.grade}ano.pdf` };
  });
