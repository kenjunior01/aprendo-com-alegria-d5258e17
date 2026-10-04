// Relatório de Turma em PDF — para conselhos de turma e reuniões de professores.
// Usa pdf-lib (compatível com Cloudflare Workers / TanStack Start server),
// seguindo o padrão de certificate.functions.ts.
// Verifica a posse da turma (teacher_id) antes de gerar — sem IDOR.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Input = z.object({
  classId: z.string().uuid(),
  days: z.number().int().min(7).max(180).optional(),
});

/** Remove caracteres fora de WinAnsi (emojis etc.) para não rebentar com Helvetica. */
function sanitize(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u2013|\u2014/g, "-")

    .replace(/[^\u0020-\u00FF]/g, "")
    .trim();
}

interface Row {
  name: string;
  sessions: number;
  accuracy: number;
  minutes: number;
  xp: number;
  streak: number;
  atRisk: boolean;
}

export const generateClassReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const days = data.days ?? 30;

    // Turma tem de pertencer ao professor autenticado
    const { data: cls } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tabela fora do schema gerado
      .from("classes" as any)
      .select("id, name, grade, school_id")
      .eq("id", data.classId)
      .eq("teacher_id", userId)
      .maybeSingle();
    const klass = cls as unknown as {
      id: string;
      name: string;
      grade: number;
      school_id: string;
    } | null;
    if (!klass) return { error: "Turma não encontrada." as const };

    const { data: school } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tabela fora do schema gerado
      .from("schools" as any)
      .select("name")
      .eq("id", klass.school_id)
      .maybeSingle();
    const schoolName = (school as unknown as { name: string } | null)?.name ?? "";

    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const { data: members } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tabela fora do schema gerado
      .from("class_members" as any)
      .select("student_id")
      .eq("class_id", klass.id);
    const ids = ((members ?? []) as unknown as Array<{ student_id: string }>).map(
      (m) => m.student_id,
    );

    const rows: Row[] = [];
    let totalSessions = 0;
    let totalMinutes = 0;

    if (ids.length > 0) {
      const [{ data: profs }, { data: sess }] = await Promise.all([
        supabase.from("profiles").select("id, name, xp, streak").in("id", ids),
        supabase
          .from("practice_sessions")
          .select("user_id, correct, total, duration_seconds")
          .in("user_id", ids)
          .gte("created_at", since),
      ]);

      const agg: Record<string, { c: number; t: number; sec: number; n: number }> = {};
      for (const s of sess ?? []) {
        const a = agg[s.user_id] ?? { c: 0, t: 0, sec: 0, n: 0 };
        a.c += s.correct;
        a.t += s.total;
        a.sec += s.duration_seconds;
        a.n += 1;
        agg[s.user_id] = a;
      }

      for (const p of profs ?? []) {
        const a = agg[p.id] ?? { c: 0, t: 0, sec: 0, n: 0 };
        const accuracy = a.t ? Math.round((a.c / a.t) * 100) : 0;
        const minutes = Math.round(a.sec / 60);
        const streak = p.streak ?? 0;
        const atRisk = (a.n >= 3 && accuracy < 60) || (a.n === 0 && (p.xp ?? 0) > 0);
        rows.push({
          name: sanitize(p.name ?? "Aluno") || "Aluno",
          sessions: a.n,
          accuracy,
          minutes,
          xp: p.xp ?? 0,
          streak,
          atRisk,
        });
        totalSessions += a.n;
        totalMinutes += minutes;
      }
    }

    rows.sort((a, b) => b.xp - a.xp);

    // ─── PDF ────────────────────────────────────────────────────────────
    const pdf = await PDFDocument.create();
    const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
    const dark = rgb(0.18, 0.16, 0.32);
    const muted = rgb(0.45, 0.4, 0.55);
    const primary = rgb(0.85, 0.35, 0.1);
    const risk = rgb(0.75, 0.2, 0.2);
    const line = rgb(0.85, 0.85, 0.9);
    const zebra = rgb(0.96, 0.96, 0.98);

    const W = 595;
    const H = 842;
    const M = 48;
    const page0 = pdf.addPage([W, H]);

    let page = page0;
    let y = H - M;

    const drawHeader = (p: import("pdf-lib").PDFPage) => {
      p.drawText("Relatorio de Turma", {
        x: M,
        y: H - M - 24,
        size: 22,
        font: titleFont,
        color: dark,
      });
      p.drawText("Kidoz - aprender com alegria", {
        x: M,
        y: H - M - 44,
        size: 10,
        font: bodyFont,
        color: muted,
      });
    };

    drawHeader(page);
    y = H - M - 72;

    const period = `${new Date(Date.now() - days * 86400_000).toLocaleDateString("pt-PT")} - ${new Date().toLocaleDateString("pt-PT")}`;
    const metaLines = [
      `Turma: ${sanitize(klass.name)} (${klass.grade}.o ano)`,
      schoolName ? `Escola: ${sanitize(schoolName)}` : null,
      `Periodo: ${period}`,
    ].filter(Boolean) as string[];
    for (const l of metaLines) {
      page.drawText(l, { x: M, y, size: 11, font: bodyFont, color: dark });
      y -= 16;
    }

    // Resumo
    y -= 8;
    page.drawRectangle({
      x: M,
      y: y - 54,
      width: W - M * 2,
      height: 58,
      color: rgb(0.96, 0.93, 0.9),
      borderColor: rgb(0.9, 0.82, 0.72),
      borderWidth: 1,
    });
    const avgAcc = rows.length
      ? Math.round(
          rows.reduce((s, r) => s + r.accuracy * r.sessions, 0) /
            Math.max(
              rows.reduce((s, r) => s + r.sessions, 0),
              1,
            ),
        )
      : 0;
    const summary = [
      ["Alunos", String(rows.length)],
      ["Sessoes", String(totalSessions)],
      ["Precisao media", `${avgAcc}%`],
      ["Minutos totais", String(totalMinutes)],
    ];
    summary.forEach(([label, value], i) => {
      const x = M + 16 + i * ((W - M * 2) / 4);
      page.drawText(value, { x, y: y - 22, size: 18, font: titleFont, color: primary });
      page.drawText(label, { x, y: y - 40, size: 8, font: bodyFont, color: muted });
    });
    y -= 78;

    // Cabeçalho da tabela
    const drawTableHead = (p: import("pdf-lib").PDFPage, yPos: number) => {
      const cols = ["Aluno", "Sessoes", "Precisao", "Minutos", "XP", "Dias seg."];
      const xs = [M + 6, 300, 366, 432, 490, 540];
      p.drawRectangle({
        x: M,
        y: yPos - 6,
        width: W - M * 2,
        height: 22,
        color: rgb(0.92, 0.9, 0.95),
      });
      cols.forEach((c, i) => {
        const alignRight = i > 0;
        const w = alignRight ? bodyFont.widthOfTextAtSize(c, 9) : 0;
        p.drawText(c, {
          x: alignRight ? xs[i] + 52 - w : xs[i],
          y: yPos,
          size: 9,
          font: titleFont,
          color: dark,
        });
      });
      return yPos - 24;
    };

    y = drawTableHead(page, y);

    const riskRows: string[] = [];
    rows.forEach((r, idx) => {
      if (y < M + 90) {
        page = pdf.addPage([W, H]);
        drawHeader(page);
        y = drawTableHead(page, H - M - 72);
      }
      if (idx % 2 === 1) {
        page.drawRectangle({
          x: M,
          y: y - 5,
          width: W - M * 2,
          height: 20,
          color: zebra,
        });
      }
      const name = r.name.length > 30 ? `${r.name.slice(0, 29)}.` : r.name;
      page.drawText(name, { x: M + 6, y, size: 10, font: bodyFont, color: r.atRisk ? risk : dark });
      const cells = [
        String(r.sessions),
        `${r.accuracy}%`,
        String(r.minutes),
        String(r.xp),
        String(r.streak),
      ];
      const xs = [300, 366, 432, 490, 540];
      cells.forEach((c, i) => {
        const w = bodyFont.widthOfTextAtSize(c, 10);
        page.drawText(c, { x: xs[i] + 52 - w, y, size: 10, font: bodyFont, color: dark });
      });
      if (r.atRisk) riskRows.push(r.name);
      y -= 20;
    });

    // Legenda + risco
    y -= 16;
    if (y < M + 120) {
      page = pdf.addPage([W, H]);
      drawHeader(page);
      y = H - M - 90;
    }
    if (riskRows.length > 0) {
      page.drawText("Alunos que precisam de apoio:", {
        x: M,
        y,
        size: 11,
        font: titleFont,
        color: risk,
      });
      y -= 18;
      page.drawText(riskRows.slice(0, 12).join(", "), {
        x: M,
        y,
        size: 10,
        font: bodyFont,
        color: dark,
      });
      y -= 18;
    }
    page.drawText(
      "Aluno a vermelho: precisao abaixo de 60% (3+ sessoes) ou inativo no periodo. A vermelho = apoios precoces.",
      { x: M, y, size: 8, font: bodyFont, color: muted },
    );
    y -= 24;

    page.drawText("Gerado por Kidoz - kidoz.online", {
      x: M,
      y: M,
      size: 9,
      font: bodyFont,
      color: muted,
    });
    page.drawLine({
      start: { x: M, y: M + 12 },
      end: { x: W - M, y: M + 12 },
      color: line,
      thickness: 1,
    });

    const pdfBase64 = await pdf.saveAsBase64();
    const fileName = `kidoz-turma-${sanitize(klass.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${days}d.pdf`;
    return { pdfBase64, fileName };
  });
