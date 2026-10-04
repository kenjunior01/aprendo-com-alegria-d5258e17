// TeacherPanelPreview — demonstração interativa do painel do professor
// embutida na landing /escolas. Mostra EXATAMENTE as funcionalidades que
// existem no painel real (/escola): KPIs de turma, gráfico semanal, tabela
// de alunos com alunos em risco, detalhe por aluno e a amostra do relatório
// em PDF. Usa dados de exemplo claramente marcados — zero backend, honesto.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChunkyButton } from "@/components/ChunkyButton";
import {
  LineChart as LineChartIcon,
  Users,
  FileText,
  AlertTriangle,
  Flame,
  ChevronDown,
  Check,
} from "lucide-react";

type Tab = "visao" | "alunos" | "relatorio";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "visao", label: "Visão geral", icon: LineChartIcon },
  { id: "alunos", label: "Alunos", icon: Users },
  { id: "relatorio", label: "Relatório PDF", icon: FileText },
];

const KPIS = [
  { label: "Precisão média", value: "84%", hint: "todas as matérias" },
  { label: "Minutos", value: "312", hint: "últimos 30 dias" },
  { label: "XP da turma", value: "4 850", hint: "esforço acumulado" },
  { label: "Sessões", value: "87", hint: "5 a 10 min por dia" },
];

const WEEK = [
  { day: "Seg", min: 38 },
  { day: "Ter", min: 42 },
  { day: "Qua", min: 35 },
  { day: "Qui", min: 48 },
  { day: "Sex", min: 55 },
];

interface DemoStudent {
  name: string;
  xp: number;
  acc: number;
  min: number;
  streak: number;
  risk?: "precisao" | "inativo";
}

const STUDENTS: DemoStudent[] = [
  { name: "Alice M.", xp: 1240, acc: 92, min: 86, streak: 12 },
  { name: "Tomás R.", xp: 980, acc: 88, min: 64, streak: 8 },
  { name: "Beatriz C.", xp: 720, acc: 85, min: 51, streak: 6 },
  { name: "Duarte F.", xp: 640, acc: 79, min: 47, streak: 5 },
  { name: "Elisa P.", xp: 510, acc: 71, min: 33, streak: 3 },
  { name: "Francisco G.", xp: 280, acc: 58, min: 21, streak: 0, risk: "precisao" },
  { name: "Gabriela S.", xp: 95, acc: 63, min: 6, streak: 0, risk: "inativo" },
];

const ALERTS: { student: DemoStudent; text: string }[] = [
  {
    student: STUDENTS[5],
    text: "Precisão abaixo de 60% ao longo de 4+ sessões — pode precisar de apoio na matéria.",
  },
  {
    student: STUDENTS[6],
    text: "Está há 5 dias sem jogar — um empurrãozinho pode reativar a sequência.",
  },
];

function guardianMessage(s: DemoStudent): string {
  return [
    "• Precisão: " + s.acc + "%",
    "• Minutos de aprendizagem: " + s.min,
    "• Sequência atual: " + s.streak + " dia(s) seguidos",
    "",
    "Acompanha em casa no kidoz.online — 5 a 10 minutos por dia fazem toda a diferença! 🚀",
  ].join("\n");
}

const MAX_MIN = Math.max(...WEEK.map((w) => w.min));

export function TeacherPanelPreview() {
  const [tab, setTab] = useState<Tab>("visao");
  const [openStudent, setOpenStudent] = useState<string | null>(null);

  return (
    <section className="mt-8">
      <div className="text-center">
        <p className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
          Painel do professor
        </p>
        <h2 className="mt-1 font-display text-2xl">Vê o painel agora — sem criar conta</h2>
        <p className="mx-auto mt-1 max-w-[42rem] text-sm text-muted-foreground">
          Isto é uma demonstração interativa com dados de exemplo. O painel real usa os dados dos
          teus alunos, em tempo real.
        </p>
      </div>

      {/* Janela do produto */}
      <div className="card-chunky mt-4 overflow-hidden rounded-3xl border-2 border-border bg-card">
        {/* chrome da janela */}
        <div className="flex items-center gap-2 border-b-2 border-border bg-muted/70 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-400/70" />
          <span className="h-3 w-3 rounded-full bg-success/60" />
          <span className="ml-2 rounded-lg bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground">
            kidoz.online/escola — Turma 2.º A
          </span>
          <span className="ml-auto hidden rounded-full bg-primary/15 px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-primary sm:inline">
            Demonstração
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-2" role="tablist" aria-label="Secções do painel de demonstração">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 font-display text-xs transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* VISÃO GERAL */}
            {tab === "visao" && (
              <motion.div
                key="visao"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mt-4"
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {KPIS.map((k) => (
                    <div
                      key={k.label}
                      className="rounded-2xl border-2 border-border bg-background p-3"
                    >
                      <p className="font-display text-2xl text-primary">{k.value}</p>
                      <p className="text-[11px] font-bold">{k.label}</p>
                      <p className="text-[10px] text-muted-foreground">{k.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Gráfico semanal de minutos */}
                <div className="mt-4 rounded-2xl border-2 border-border bg-background p-4">
                  <p className="font-display text-sm">Minutos de prática por dia</p>
                  <div className="mt-3 flex h-24 items-end gap-3">
                    {WEEK.map((w) => (
                      <div
                        key={w.day}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                      >
                        <span className="text-[10px] font-bold text-primary">{w.min}</span>
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          style={{ height: `${(w.min / MAX_MIN) * 100}%` }}
                          className="w-full origin-bottom rounded-t-lg bg-gradient-to-t from-primary/70 to-primary"
                        >
                          <span className="sr-only">{w.min} minutos</span>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-3">
                    {WEEK.map((w) => (
                      <span
                        key={w.day}
                        className="flex-1 text-center text-[10px] text-muted-foreground"
                      >
                        {w.day}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Cada dia ativo da turma soma para o relatório semanal — sem trabalho extra para
                    o professor.
                  </p>
                </div>

                {/* Alertas */}
                <div className="mt-4 space-y-2">
                  {ALERTS.map((a) => (
                    <div
                      key={a.student.name}
                      className="flex items-start gap-2 rounded-2xl border-2 border-amber-400/50 bg-amber-400/10 p-3"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-xs sm:text-sm">
                        <span className="font-bold">{a.student.name}</span> — {a.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ALUNOS */}
            {tab === "alunos" && (
              <motion.div
                key="alunos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mt-4"
              >
                <div className="overflow-x-auto rounded-2xl border-2 border-border bg-background">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="p-2.5">Aluno</th>
                        <th className="p-2.5 text-right">XP</th>
                        <th className="p-2.5 text-right">Precisão</th>
                        <th className="hidden p-2.5 text-right sm:table-cell">Minutos</th>
                        <th className="hidden p-2.5 text-right sm:table-cell">Sequência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STUDENTS.map((s) => {
                        const open = openStudent === s.name;
                        return (
                          <tr
                            key={s.name}
                            className={`border-b border-border/60 last:border-0 ${
                              s.risk ? "bg-amber-400/5" : ""
                            }`}
                          >
                            <td className="p-2.5">
                              <button
                                type="button"
                                onClick={() => setOpenStudent(open ? null : s.name)}
                                aria-expanded={open}
                                className="inline-flex items-center gap-1.5 text-left font-medium hover:text-primary"
                              >
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                                />
                                {s.name}
                                {s.risk && (
                                  <span className="rounded-full bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700">
                                    Atenção
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="p-2.5 text-right font-mono text-xs">{s.xp}</td>
                            <td
                              className={`p-2.5 text-right font-mono text-xs ${
                                s.acc < 60 ? "font-bold text-destructive" : ""
                              }`}
                            >
                              {s.acc}%
                            </td>
                            <td className="hidden p-2.5 text-right font-mono text-xs sm:table-cell">
                              {s.min}
                            </td>
                            <td className="hidden p-2.5 text-right font-mono text-xs sm:table-cell">
                              {s.streak > 0 ? (
                                <span className="inline-flex items-center gap-0.5">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  {s.streak}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Toca num nome para ver o que o professor consegue fazer com um clique.
                </p>

                {/* Detalhe do aluno selecionado */}
                <AnimatePresence>
                  {openStudent && (
                    <motion.div
                      key={openStudent}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {(() => {
                        const s = STUDENTS.find((x) => x.name === openStudent);
                        if (!s) return null;
                        return (
                          <div className="mt-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-display text-sm">
                                {s.name} · 2.º ano · {s.xp} XP
                              </p>
                              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                                Painel real: exporta CSV, gera PDF e vê detalhes por matéria
                              </span>
                            </div>
                            <div className="mt-3 rounded-xl border border-border bg-card p-3">
                              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                Mensagem que o encarregado recebe (por WhatsApp, com um toque)
                              </p>
                              <pre className="mt-1.5 whitespace-pre-wrap font-sans text-xs text-foreground/85">
                                {guardianMessage(s)}
                              </pre>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* RELATÓRIO PDF */}
            {tab === "relatorio" && (
              <motion.div
                key="relatorio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mt-4"
              >
                {/* amostra da página A4 */}
                <div className="mx-auto max-w-md rounded-xl border-2 border-border bg-white p-5 text-[#111827] shadow-lg">
                  <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                    <div>
                      <p className="font-display text-sm font-bold">Relatório de Turma — 2.º A</p>
                      <p className="text-[10px] text-gray-500">
                        EB1 de São Pedro · últimos 30 dias · kidoz.online
                      </p>
                    </div>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-500">
                      AMOSTRA
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5 text-center">
                    {[
                      ["24", "alunos"],
                      ["87", "sessões"],
                      ["84%", "precisão"],
                      ["312", "minutos"],
                    ].map(([n, l]) => (
                      <div key={l} className="rounded bg-gray-50 py-1.5">
                        <p className="font-display text-sm font-bold">{n}</p>
                        <p className="text-[9px] text-gray-500">{l}</p>
                      </div>
                    ))}
                  </div>
                  <table className="mt-3 w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-1">Aluno</th>
                        <th className="py-1 text-right">XP</th>
                        <th className="py-1 text-right">Precisão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STUDENTS.slice(0, 5).map((s) => (
                        <tr key={s.name} className="border-b border-gray-100">
                          <td className="py-1">{s.name}</td>
                          <td className="py-1 text-right font-mono">{s.xp}</td>
                          <td className="py-1 text-right font-mono">{s.acc}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-3 rounded bg-red-50 p-2">
                    <p className="text-[10px] font-bold text-red-700">Alunos em risco</p>
                    <p className="text-[9px] text-red-600">
                      Francisco G. — precisão 58% · Gabriela S. — 5 dias sem atividade
                    </p>
                  </div>
                </div>
                <ul className="mx-auto mt-4 max-w-md space-y-1.5">
                  {[
                    "Gerado com um clique — pronto para conselhos de turma",
                    "Alunos em risco destacados em vermelho, com contexto",
                    "Ponte com as famílias: envia o resumo por WhatsApp",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 text-center">
        <a href="#fundador">
          <ChunkyButton className="min-h-[52px] px-8">
            Quero este painel na minha escola →
          </ChunkyButton>
        </a>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Demonstração com dados fictícios — nenhum dado real é mostrado aqui.
        </p>
      </div>
    </section>
  );
}
