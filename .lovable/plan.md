# Kidoz Interactive 2.0 — Plano de Entrega

Excluídos a pedido: AR, Multiplayer tempo real, Wearables/Análise emocional por câmara, NFTs/Marketplace.

Muito do plano estratégico **já existe** na app (XP, streaks, missões diárias, ligas, IA Tutor em `/tutor`, painel de pais com realtime, certificados, voz com `MascotVoiceTutor`, energia da mascote). Foco em fechar as lacunas com maior impacto visual e pedagógico.

## Blocos a entregar

### 1. Mascote Talking Tom 2.0 — humores e expressões reativas
- Novo componente `MascotExpression` que sobrepõe expressão (`happy`, `thinking`, `sad`, `celebrate`, `tired`) por cima do `Mascot` existente, com SVGs simples (olhos/boca).
- Hook `useMascotReaction(eventType)` que dispara expressão + frase + haptic + opcional speech synthesis em PT-PT em resposta a: `correct`, `wrong`, `levelUp`, `streakSave`, `idleLong`.
- Liga ao fluxo existente em `licao.$subjectId.$lessonId.tsx` (acertos/erros) e `CelebrationBurst`.
- "Mascote chama pelo nome" — usa `profile.name` nas frases.

### 2. Cenários imersivos por disciplina
- Novo `LessonScene` que aplica background temático full-bleed à lição:
  - Português → Biblioteca Encantada (gradiente quente + partículas livro)
  - Matemática → Planeta dos Números (gradiente cósmico + dígitos a flutuar)
  - Estudo do Meio → Museu Vivo (gradiente verde + folhas)
- Implementado só com CSS tokens + `framer-motion` (sem WebGL) para manter performance.
- Toggle automático claro/escuro pela hora do dia.

### 3. Feedback inteligente com IA quando a criança erra
- Nova server function `explainMistake` em `src/lib/ai.functions.ts` (ou estender a existente) que recebe `{ question, childAnswer, correctAnswer, subject, grade }` e devolve uma explicação curta, encorajadora, em PT-PT, com analogia.
- Usa Lovable AI Gateway (`google/gemini-3-flash-preview`).
- Mostrada como balão da mascote dentro da lição apenas após 2 tentativas erradas (evita custo desnecessário).

### 4. Narrativa por capítulo
- Nova lib `chapterStories.ts` com intro/outro escritos por capítulo ("Faísca foi raptada pelo Dragão Matemático…").
- `capitulo.$chapterId.tsx` ganha cartão de intro animado quando entra; outro de vitória quando todas as missões ficam concluídas.

### 5. Combos & multiplicadores de XP
- Em `licao.$subjectId.$lessonId.tsx`: tracker local de respostas consecutivas certas → banner "Combo x3!" que multiplica XP da próxima resposta.
- Bónus de primeira tentativa (+50%) e velocidade (+20%) visíveis no resumo final da lição.

### 6. Partilha social das conquistas
- Novo `AchievementShareCard` que gera cartão visual (badge + nome + nível) e usa Web Share API quando disponível, fallback para copy-to-clipboard.
- Botão "Partilhar" em `conquistas.tsx` e no fim de cada capítulo concluído.

### 7. Painel de pais — análise preditiva leve
- Em `pais.tsx`: nova secção "Sinais de alerta" derivada de dados já existentes (`completedLessons`, erros por disciplina) — destaca conceito mais errado e recomenda lição de reforço. Sem novas tabelas; cálculo no cliente sobre o que já vem do Supabase.

## Detalhes técnicos

- Toda a UI usa tokens semânticos em `src/styles.css` (sem cores cruas).
- Server functions ficam em `src/lib/*.functions.ts` (regra import-protection já aprendida em iterações anteriores).
- AI usa `createLovableAiGatewayProvider` + `LOVABLE_API_KEY` (já existe nos secrets).
- Sem novas tabelas Supabase — todos os dados de combos/streaks ficam derivados ou no `profiles` existente.
- Realtime da energia da mascote (entregue na iteração anterior) é reaproveitado.

## Fora deste sprint (entregar depois se pedires)

- Modo offline reforçado (PWA já existe — sw.js)
- Podcast / audiobooks (requer biblioteca de áudio + storage bucket)
- Criador de conteúdo drag-and-drop para professores (UI grande dedicada)
- Comunidade global cross-país (requer moderação + i18n)
- Certificações reconhecidas por escolas (parcerias offline)

Posso começar? Se quiseres remover ou re-priorizar algum dos 7 blocos diz já — caso contrário arranco pela ordem acima.
