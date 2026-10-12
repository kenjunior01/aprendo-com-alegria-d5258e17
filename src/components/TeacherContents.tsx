// TeacherContents — "Estúdio do Professor": criar, editar e carregar exercícios
// que os alunos da turma jogam dentro do Kidoz (funcionalidade Premium).
//
// Três formas de conteúdo:
//  1. Editor guiado (escolha múltipla, verdadeiro/falso, ordenar)
//  2. Upload CSV (folha do professor → exercícios em segundos)
//  3. Modelo CSV para descarregar (a folha certa na primeira tentativa)
//
// Anti-concorrente: IXL/Matific só deixam professores atribuir conteúdo deles;
// aqui o professor escreve o SEU — a escola torna-se dona do conteúdo.

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  FileDown,
  Sparkles,
  LoaderCircle,
  BookOpenCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChunkyButton } from "@/components/ChunkyButton";
import {
  listTeacherLessons,
  saveTeacherLesson,
  deleteTeacherLesson,
  type TeacherLessonRow,
  type TeacherQuestion,
  TEACHER_SUBJECTS,
  MAX_QUESTIONS_PER_LESSON,
} from "@/lib/teacherContent.functions";
import { listClasses } from "@/lib/school.functions";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const GRADES = [1, 2, 3, 4] as const;

interface ClassLite {
  id: string;
  name: string;
  grade: number;
}

interface DraftQuestion extends TeacherQuestion {
  // estado local: sempre com kind definido
  kind: "mcq" | "truefalse" | "order";
}

const emptyQuestion = (): DraftQuestion => ({
  prompt: "",
  kind: "mcq",
  options: ["", "", "", ""],
  answerIndex: 0,
  hint: "",
  explanation: "",
});

const emptyLesson = (classId: string) => ({
  id: undefined as string | undefined,
  classId,
  subjectId: TEACHER_SUBJECTS[0].id as string,
  title: "",
  emoji: "📗",
  grade: 1,
  questions: [emptyQuestion()] as DraftQuestion[],
});

/** CSV mínimo mas robusto: ; ou , com aspas; BOM; deteta separador. */
export function parseExercisesCsv(text: string): { questions: DraftQuestion[]; errors: string[] } {
  const clean = text.replace(/^\uFEFF/, "").trim();
  if (!clean) return { questions: [], errors: ["Ficheiro vazio."] };
  const firstLine = clean.split(/\r?\n/)[0];
  const sep =
    (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows: string[][] = [];
  let field = "",
    row: string[] = [],
    inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === sep) {
      row.push(field.trim());
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(field.trim());
      field = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field.trim());
  if (row.some((c) => c !== "")) rows.push(row);

  // Cabeçalho opcional: ignora linhas que não têm pelo menos 3 colunas úteis
  const errors: string[] = [];
  const questions: DraftQuestion[] = [];
  rows.forEach((cols, idx) => {
    const [tipo, pergunta, o1, o2, o3, o4, correta, dica, explicacao] = cols;
    if (idx === 0 && /tipo|format/i.test(tipo)) return; // header
    if (!pergunta || (!o1 && !o2)) return;
    const isTF = /v\/f|verdadeiro/i.test(tipo ?? "");
    const isOrder = /orden/i.test(tipo ?? "");
    if (isOrder) {
      const seq = [o1, o2, o3, o4].filter(Boolean);
      if (seq.length >= 2) {
        questions.push({
          prompt: pergunta,
          kind: "order",
          sequence: seq,
          hint: dica || "",
          explanation: explicacao || "",
        });
      } else errors.push(`Linha ${idx + 1}: ordenar precisa de 2+ itens.`);
      return;
    }
    const options = isTF ? ["Verdadeiro", "Falso"] : [o1, o2, o3, o4].filter(Boolean);
    let answerIndex = 0;
    if (isTF) {
      answerIndex = /^v|1|verdadeiro/i.test(correta ?? "v") ? 0 : 1;
    } else {
      const n = Number((correta ?? "").replace(/[^\d]/g, ""));
      answerIndex = Number.isFinite(n) && n >= 1 && n <= options.length ? n - 1 : 0;
    }
    if (options.length < 2) {
      errors.push(`Linha ${idx + 1}: precisa de 2+ opções.`);
      return;
    }
    questions.push({
      prompt: pergunta,
      kind: isTF ? "truefalse" : "mcq",
      options,
      answerIndex,
      hint: dica || "",
      explanation: explicacao || "",
    });
  });
  return { questions, errors };
}

export const CSV_TEMPLATE = `tipo;pergunta;opcao1;opcao2;opcao3;opcao4;correta;dica;explicacao
mcq;Quanto é 7 + 5?;11;12;13;10;2;soma as unidades primeiro;7+5=12 — soma 7+3=10 e depois +2
mcq;Qual é o plural de 'pão'?;pãos;pães;pões;pãoes;2;terminações em -ão;Pão → pães (irregular)
v/f;O sol é uma estrela.;verdadeiro;;;;verdadeiro;;O Sol é a estrela do nosso sistema solar.
mcq;Capital de Portugal?;Porto;Braga;Lisboa;Faro;3;fica junto ao Tejo;Lisboa é a capital e a maior cidade.
orden;Ordena os dias:;segunda-feira;terça-feira;quarta-feira;quinta-feira;;pensa na semana;A semana começa na segunda-feira.`;

// ---------------------------------------------------------------------------

export function TeacherContents() {
  const { user } = useAuth();
  const { isActive, isTrial, trialUntil, loading: subLoading } = useSubscription();
  const [classes, setClasses] = useState<ClassLite[]>([]);
  const [lessons, setLessons] = useState<TeacherLessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ReturnType<typeof emptyLesson> | null>(null);
  const [saving, setSaving] = useState(false);
  const premium = isActive; // inclui subscrição + trial + admin

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ lessons: ls }, { classes: cs }] = await Promise.all([
      listTeacherLessons(),
      listClasses({}),
    ]);
    setLessons(ls);
    setClasses((cs ?? []).map((c) => ({ id: c.id, name: c.name, grade: c.grade })));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const premiumGate = !subLoading && !premium;

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Dá um título à lição.");
      return;
    }
    const validQs = draft.questions.filter((q) => q.prompt.trim());
    if (validQs.length === 0) {
      toast.error("Escreve pelo menos 1 pergunta.");
      return;
    }
    const badQ = validQs.findIndex(
      (q) => q.kind !== "order" && (!q.options || q.options.filter(Boolean).length < 2),
    );
    if (badQ >= 0) {
      toast.error(`Pergunta ${badQ + 1}: preenche pelo menos 2 opções.`);
      return;
    }
    setSaving(true);
    const r = await saveTeacherLesson({
      data: {
        id: draft.id,
        classId: draft.classId,
        subjectId: draft.subjectId,
        title: draft.title.trim(),
        emoji: draft.emoji,
        grade: draft.grade,
        questions: validQs.map((q) => ({
          prompt: q.prompt.trim(),
          kind: q.kind,
          ...(q.kind === "order"
            ? { sequence: (q.sequence ?? []).filter(Boolean) }
            : {
                options: (q.options ?? []).filter(Boolean),
                answerIndex: q.answerIndex ?? 0,
              }),
          ...(q.hint?.trim() ? { hint: q.hint.trim() } : {}),
          ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
        })),
      },
    });
    setSaving(false);
    if (r.ok) {
      toast.success(draft.id ? "Lição atualizada!" : "Lição enviada para a turma! 🎉");
      setDraft(null);
      refresh();
    } else if (r.error === "premium") {
      toast.error(r.message ?? "Funcionalidade Premium.");
    } else {
      toast.error(r.message ?? "Não foi possível guardar.");
    }
  };

  const removeLesson = async (id: string, title: string) => {
    if (!confirm(`Apagar "${title}"? Os alunos deixam de a ver.`)) return;
    const r = await deleteTeacherLesson({ data: { id } });
    if (r.ok) {
      toast.success("Lição apagada");
      refresh();
    } else toast.error(r.error ?? "Erro");
  };

  const editLesson = (l: TeacherLessonRow) => {
    setDraft({
      id: l.id,
      classId: l.class_id,
      subjectId: l.subject_id,
      title: l.title,
      emoji: l.emoji,
      grade: l.grade,
      questions: (l.questions ?? []).map((q) => ({
        ...q,
        kind: (q.kind ?? "mcq") as DraftQuestion["kind"],
        options: q.options ?? ["", "", "", ""],
      })),
    });
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const { questions, errors } = parseExercisesCsv(text);
    if (questions.length === 0) {
      toast.error(errors[0] ?? "Nenhum exercício válido encontrado no CSV.");
      return;
    }
    setDraft((d) => d ?? emptyLesson(classes[0]?.id ?? ""));
    setDraft((d) =>
      d
        ? {
            ...d,
            questions: [...d.questions.filter((q) => q.prompt.trim()), ...questions].slice(
              0,
              MAX_QUESTIONS_PER_LESSON,
            ),
          }
        : d,
    );
    toast.success(
      `${questions.length} exercícios carregados${errors.length ? ` · ${errors.length} linhas ignoradas` : ""} — revê e envia.`,
    );
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kidoz-modelo-exercicios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(
    () => ({
      total: lessons.length,
      questions: lessons.reduce((acc, l) => acc + (l.questions?.length ?? 0), 0),
    }),
    [lessons],
  );

  return (
    <div className="space-y-4">
      {/* Cabeçalho do estúdio */}
      <div className="card-chunky rounded-2xl border-2 border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-lg">Estúdio do Professor</p>
              <p className="text-xs text-muted-foreground">
                {stats.total} lição(ões) autorais · {stats.questions} exercícios para as tuas turmas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <FileDown className="mr-1 h-4 w-4" /> Modelo CSV
            </Button>
            <Button
              size="sm"
              disabled={premiumGate || classes.length === 0}
              onClick={() => setDraft(emptyLesson(classes[0]?.id ?? ""))}
            >
              <Plus className="mr-1 h-4 w-4" /> Nova lição
            </Button>
          </div>
        </div>
        {classes.length === 0 && !loading && (
          <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Cria primeiro uma <strong>turma</strong> no separador “Turmas” — as lições autorais são
            enviadas para uma turma concreta.
          </p>
        )}
      </div>

      {/* Gate premium — honesto, com caminho claro */}
      {premiumGate && (
        <div className="rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/15 to-card p-4">
          <div className="flex items-start gap-3">
            <Crown className="mt-1 h-6 w-6 shrink-0 text-amber-500" />
            <div>
              <p className="font-display text-base">O Estúdio do Professor é Premium</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cria lições à tua medida, carrega os teus exercícios em CSV e envia-os para a turma
                — os alunos jogam-nos dentro do Kidoz, no telemóvel ou no tablet da escola.
                {isTrial === false && trialUntil === null
                  ? " Tens 15 dias grátis à tua espera, sem cartão."
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de lições */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : lessons.length === 0 && !draft ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-2 font-display">Ainda não tens lições autorais</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Começa pelo modelo CSV (5 exercícios de exemplo) ou cria uma lição do zero. Os alunos
            veem-nas na secção “Lições da turma” da app.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={downloadTemplate}
            disabled={!premium}
          >
            <FileDown className="mr-1 h-4 w-4" /> Descarregar modelo CSV
          </Button>
        </div>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {lessons.map((l) => {
            const cls = classes.find((c) => c.id === l.class_id);
            const subject = TEACHER_SUBJECTS.find((s) => s.id === l.subject_id);
            return (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-chunky flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3"
              >
                <span className="text-2xl" aria-hidden="true">
                  {l.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm">{l.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {subject?.name ?? l.subject_id} · {l.grade}º ano · {l.questions?.length ?? 0}{" "}
                    perguntas · {cls?.name ?? "turma removida"}
                  </p>
                </div>
                {!l.active && <Badge variant="secondary">inativa</Badge>}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Editar ${l.title}`}
                  onClick={() => editLesson(l)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Apagar ${l.title}`}
                  onClick={() => removeLesson(l.id, l.title)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {/* Editor */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-chunky space-y-4 rounded-2xl border-2 border-primary/40 bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-lg">
              {draft.id ? "Editar lição" : "Nova lição autoral"}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Título *
              </span>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Ex.: Frações na feira"
                maxLength={80}
                className="mt-1 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Turma *
              </span>
              <select
                value={draft.classId}
                onChange={(e) => setDraft({ ...draft, classId: e.target.value })}
                className="mt-1 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 outline-none focus:border-primary"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade}º ano)
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Disciplina
              </span>
              <select
                value={draft.subjectId}
                onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}
                className="mt-1 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 outline-none focus:border-primary"
              >
                {TEACHER_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Ano
                </span>
                <select
                  value={draft.grade}
                  onChange={(e) => setDraft({ ...draft, grade: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 outline-none focus:border-primary"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}º ano
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Ícone
                </span>
                <input
                  value={draft.emoji}
                  onChange={(e) => setDraft({ ...draft, emoji: e.target.value.slice(0, 4) })}
                  className="mt-1 w-full rounded-2xl border-2 border-border bg-background px-3 py-2 text-center text-xl outline-none focus:border-primary"
                  aria-label="Emoji da lição"
                />
              </label>
            </div>
          </div>

          {/* Upload CSV */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Upload className="h-4 w-4" />
              Carregar exercícios de um CSV (Excel/Sheets) — junta aos que já estão aqui
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importCsv(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {/* Perguntas */}
          <div className="space-y-3">
            {draft.questions.map((q, qi) => (
              <div key={qi} className="rounded-2xl border-2 border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {(["mcq", "truefalse", "order"] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            questions: draft.questions.map((x, i) =>
                              i === qi ? { ...x, kind: k } : x,
                            ),
                          })
                        }
                        aria-pressed={q.kind === k}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          q.kind === k
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {k === "mcq" ? "Escolha" : k === "truefalse" ? "V/F" : "Ordenar"}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remover pergunta ${qi + 1}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        questions: draft.questions.filter((_, i) => i !== qi),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <input
                  value={q.prompt}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      questions: draft.questions.map((x, i) =>
                        i === qi ? { ...x, prompt: e.target.value } : x,
                      ),
                    })
                  }
                  placeholder={`Pergunta ${qi + 1} — ex.: Quanto é 3 + 4?`}
                  maxLength={400}
                  className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />

                {q.kind === "order" ? (
                  <input
                    value={(q.sequence ?? []).join(" → ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        questions: draft.questions.map((x, i) =>
                          i === qi
                            ? { ...x, sequence: e.target.value.split("→").map((s) => s.trim()) }
                            : x,
                        ),
                      })
                    }
                    placeholder="item 1 → item 2 → item 3 (pela ordem certa)"
                    className="mt-2 w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {(q.kind === "truefalse" ? ["Verdadeiro", "Falso"] : (q.options ?? [])).map(
                      (opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correta-${qi}`}
                            checked={q.answerIndex === oi}
                            onChange={() =>
                              setDraft({
                                ...draft,
                                questions: draft.questions.map((x, i) =>
                                  i === qi ? { ...x, answerIndex: oi } : x,
                                ),
                              })
                            }
                            aria-label={`Marcar opção ${oi + 1} como correta`}
                            className="h-4 w-4 accent-[var(--primary)]"
                          />
                          <input
                            value={opt}
                            disabled={q.kind === "truefalse"}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                questions: draft.questions.map((x, i) =>
                                  i === qi
                                    ? {
                                        ...x,
                                        options: (x.options ?? ["", "", "", ""]).map((o, j) =>
                                          j === oi ? e.target.value : o,
                                        ),
                                      }
                                    : x,
                                ),
                              })
                            }
                            placeholder={`Opção ${oi + 1}`}
                            maxLength={200}
                            className="flex-1 rounded-xl border-2 border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-60"
                          />
                        </div>
                      ),
                    )}
                  </div>
                )}

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    value={q.hint ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        questions: draft.questions.map((x, i) =>
                          i === qi ? { ...x, hint: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Dica (opcional)"
                    maxLength={240}
                    className="rounded-xl border-2 border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    value={q.explanation ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        questions: draft.questions.map((x, i) =>
                          i === qi ? { ...x, explanation: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Explicação mostrada ao responder (opcional)"
                    maxLength={600}
                    className="rounded-xl border-2 border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={draft.questions.length >= MAX_QUESTIONS_PER_LESSON}
              onClick={() =>
                setDraft({ ...draft, questions: [...draft.questions, emptyQuestion()] })
              }
            >
              <Plus className="mr-1 h-4 w-4" /> Pergunta ({draft.questions.length}/
              {MAX_QUESTIONS_PER_LESSON})
            </Button>
            <ChunkyButton onClick={save} disabled={saving} className="min-h-[48px]">
              {saving ? (
                <>
                  <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> A enviar…
                </>
              ) : draft.id ? (
                "Guardar alterações"
              ) : (
                "Enviar para a turma 🚀"
              )}
            </ChunkyButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}
