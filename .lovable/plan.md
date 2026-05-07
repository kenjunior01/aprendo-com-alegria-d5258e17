# Roteiro de implementação — Proposta Kidoz Mobile

Já está feito: **deteção automática da região** (PT/BR/MZ/AO/CV/US/ZA/GB) no badge da homepage, com currículo correspondente.

A proposta do PDF é grande. Para não partir o que já funciona (Cloud, painel de Pais, mapa de aprendizagem) vamos por **4 fases independentes**, cada uma entregue e testada antes da seguinte.

---

## Fase 1 — Mundo Persistente & Economia Virtual *(menor risco, alto impacto kid)*

**O que entrego:**
- Nova rota `/mundo` (entrada pela Tab Bar): quarto virtual da criança.
- Catálogo de itens decorativos (móveis, plantas, posters, fundos) comprados com **Abracadinhos**.
- Drag-and-drop simples para colocar itens na sala (grelha).
- Persistência cloud na tabela `profiles` (campo `world_state jsonb`) + tabela `world_items`.
- Reaproveita o sistema de coins/shop existente.

**Ficheiros novos:** `src/routes/mundo.tsx`, `src/lib/world.ts`, `src/components/WorldCanvas.tsx`, migração SQL.

---

## Fase 2 — Feedback Fonético (leitura em voz alta)

**O que entrego:**
- Nova atividade "Lê em voz alta" dentro de Português.
- Usa Web Speech API (`SpeechRecognition`, `pt-PT` / `pt-BR` conforme região).
- Texto realça a verde palavra a palavra à medida que a criança lê; vermelho com sugestão se errar.
- Pontuação de fluência (palavras/min + precisão).
- Fallback para dispositivos sem suporte (modo "ouvir apenas").

**Ficheiros novos:** `src/components/PhonicReader.tsx`, `src/lib/speechRecognition.ts`, integração em `src/routes/leitura.tsx`.

---

## Fase 3 — PvP, Rankings & Desafios da IA

**O que entrego:**
- Tabela `challenges` (criador, oponente, disciplina, tópico, estado, pontuação).
- Tabela `friendships` com gate parental (PIN para aceitar amigo).
- Rota `/desafios` com 3 separadores: Amigos · Global · Da Mascote.
- Ranking semanal (top XP dos últimos 7 dias) com filtro Amigos/Global/País.
- Recompensas semanais automáticas (cron via `/api/public/weekly-rewards`).
- Mascote propõe 1 desafio diário baseado em pontos fracos do aluno (já temos `practice_sessions`).

**Ficheiros:** migração SQL, `src/routes/desafios.tsx`, `src/server/challenges.functions.ts`, atualizar `BottomNav`.

---

## Fase 4 — Painel Institucional (Escolas/Professores) *(maior, faz por último)*

**O que entrego:**
- Novo `role = 'teacher'` em `profiles`, mais tabelas `schools`, `classes`, `class_members`.
- Login de professor com código de escola.
- Rota `/escola` (gated por role): lista de turmas, alunos, atribuir lições, ver progresso, criar desafios de turma, ranking interno.
- Personalização institucional (logo da escola, currículo selecionado).
- Exportação CSV de relatórios.

**Ficheiros:** migrações SQL pesadas, `src/routes/escola.*.tsx`, `src/server/school.functions.ts`, RLS para professores verem apenas a sua escola.

---

## Ordem sugerida e porquê

1. **Mundo Persistente** primeiro — é puramente frontend + 1 tabela, dá retorno visual imediato e usa peças que já existem (coins, shop).
2. **Feedback Fonético** — independente, sem DB, alto valor pedagógico.
3. **PvP/Rankings** — exige novo schema social mas isolado.
4. **Painel Institucional** — maior mudança de modelo de dados (multi-tenant escolar), feito por último para não bloquear o resto.

**Não incluído nesta versão** (podes pedir depois se quiseres): conteúdo bilingue PT/EN com alternância em tempo real, insights preditivos de IA no painel de pais, sistema de mensagens professor↔pai.

---

## Confirma:
- Avançar com a **Fase 1 (Mundo Persistente)** já a seguir?
- Ou queres ajustar a ordem / cortar alguma fase?