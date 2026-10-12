# Auditoria Crítica Pré-Lançamento — kidoz.online

**Data:** 12-10-2026 · **HEAD auditado:** `f197f71` · **Âmbito:** produto, conceito, pedagogia, gamificação, UX, técnica, negócio, legal, acessibilidade, performance, GTM.

> Contexto: antes desta auditoria entraram 3 commits do Lovable (`d1dced5`, `9c59c5e`, `f197f71`; +11.237/−1.865 linhas) que já resolveram pontos antigos: corações que ensinam (HeartRevive), Revisão Mágica como rota própria, país no onboarding, vocabulário BR/AO/MZ nas lições, pagamentos Stripe+PayPal server-side, painel de escola/pais e ferramentas de professor com backend real (fichas, relatórios, torneios, mural, planificador, certificados). Esta auditoria avalia o estado ATUAL.

---

## 1. O que já está sólido (contexto justo)

- **Pagamentos bem arquitetados**: montantes definidos no servidor, capture server-side no PayPal, webhook Stripe com verificação HMAC, anti open-redirect, IVA automático por país no Stripe (`paypal.functions.ts`, `stripe.server.ts`, `payments.functions.ts`).
- **Segurança base**: sem segredos no cliente, server fns com `requireSupabaseAuth`, migration de hardening do admin, robots.txt bloqueia /admin e /api.
- **Base de acessibilidade boa**: skip-link, `reducedMotion="user"`, focus-ring 3px, touch targets 48–75px, TTS com locale por região.
- **Performance base boa**: manualChunks, ~30 jogos Júnior em lazy, WebP leve, cache 1 ano, Service Worker, sitemap + JSON-LD.
- **Tutor IA com filtro de PII + rate limit** (`tutor-stream.ts`).
- **Integridade do conteúdo**: 68/68 missões mapeadas em 16 capítulos, 0 IDs órfãos, 0 duplicadas.

---

## 2. Resumo executivo — os 7 maiores riscos

1. **Conteúdo curto para a promessa**: 479 perguntas autoradas para 4 anos × 5 países. Com ~7 perguntas/aula, uma criança esgota o currículo em semanas.
2. **Consentimento parental/idade inexistente no registo** (RGPD art.º 8 / COPPA) — a política de privacidade promete algo que o produto não executa.
3. **Premium decidido no cliente**: `profile.isPremium` local é editável no dispositivo — gating por honra, não por enforcement.
4. **Economia fragmentada**: 6 pontuações/moedas, 3 streaks, 3 resets diários com fusos diferentes, campos mortos (`gems`, `rewardGardenItem`).
5. **Zero testes, zero CI, zero error tracking** — produção depende de sorte; push em main = deploy direto.
6. **Proposta "5 países" com execução real a ~2**: `culturaAtivo` só PT+MZ; VOCAB_CV vazio; VOCAB_AO com 2 termos.
7. **Negócio escolas com atrito**: ativação manual, faturas manuais, sem MBWay/referência Multibanco, leads sem base de dados.

---

## 3. Conceito & Proposta de Valor

- **C1 — Promessa "5 países" acima da execução.** O marketing mostra 5 países, mas `PaisesSection.tsx:30-90` marca `culturaAtivo: true` apenas para PT e MZ. VOCAB_CV está vazio (`region.ts:188-190`), VOCAB_AO tem 2 termos (`region.ts:148-151`), e várias entradas MZ são no-op ("escola"→"escola"). Risco de credibilidade com diretores de AO/CV/BR.
- **C2 — Mesmo currículo PT para todos os países.** O badge diz "Feito para o {currículo} em {país}" (`region.ts:120-126`), mas a cobertura é a mesma tabela PT para os 5. Não há alinhamento documentado aos programas de MZ/AO/CV/BR.
- **C3 — Superfície de produto demasiado larga para a idade-alvo e para a equipa.** Junior (2-5), portal premium, arcade, desafios, infinitos, expresso, torneios, ligas, jardim, quarto, bazar, RA, leitura, tutor, amigo… Para uma criança de 7 anos (e para um mantenedor) é muita coisa a competir com o loop central (lição → recompensa → revisão). O "Foco no que ensina" do Task 26 perde-se parcialmente.
- **C4 — Ferramentas de professor existem com backend real mas a descoberta na UI não está garantida.** Há funções server para fichas (worksheet.functions.ts, 1034 linhas), relatórios de turma, torneios, mural, planificador e certificados — mas não está claro que tudo é alcançável a partir de `/escola`. Superfície enorme de suportar a 0,99€/aluno/mês.
- **C5 — Junior (2-5 anos) é um produto inteiro dentro do produto** (modo próprio, economia própria, streak próprio) para o público com menor poder de decisão de compra.
- **C6 — Identidade legada no código**: prefixos `lusis-`, `alegria-`, `kidoz-` convivem em 40+ chaves localStorage; parte fora do wrapper de migração (`ThemeToggle.tsx:11-22`, `haptics.ts:21`, `world.ts:149`, `junior.ts:980`, `GameTutorial.tsx:26`, `triviaSource.ts:5`).

## 4. Conteúdo & Pedagogia

- **P1 — Volume insuficiente para o 1.º ciclo completo.** 68 lições / 479 perguntas no total. Tabela por matéria × ano:

  | Matéria | 1.º | 2.º | 3.º | 4.º | Total |
  |---|---|---|---|---|---|
  | Português | 3L/13Q | 3L/17Q | 5L/31Q | 3L/16Q | 14L/77Q |
  | Matemática | 4L/32Q | 5L/33Q | 4L/23Q | 4L/21Q | 17L/109Q |
  | Estudo do Meio | 2L/14Q | 5L/33Q | 3L/19Q | 3L/18Q | 13L/84Q |
  | Inglês | 4L/36Q | 4L/36Q | 3L/26Q | **1L/10Q** | 12L/108Q |
  | Ciências | **1L/10Q** | 2L/16Q | 3L/26Q | **1L/8Q** | 7L/60Q |
  | Cidadania | 2L/17Q | 2L/14Q | 1L/10Q | **0L/0Q** | 5L/41Q |
  | **Total** | 16L/122Q | 21L/149Q | 19L/135Q | 12L/73Q | **68L/479Q** |

- **P2 — Buracos evidentes**: Cidadania sem 4.º ano; Ciências com 1 lição no 1.º e 4.º ano; Inglês com 1 lição no 4.º ano; Estudo do Meio 1.º ano com só 2 lições.
- **P3 — Memorização em vez de aprendizagem**: as perguntas apresentam-se sempre na mesma ordem (`licao:166,445`); as opções MCQ nunca são embaralhadas; rejogar a aula = pergunta a pergunta idêntica. O único embaralhamento é das peças "order" (`questionDisplay.ts:17-29`).
- **P4 — Explicações pedagógicas escassas**: só 21/479 perguntas têm `explanation` ("Sabias?") e 16/479 têm `hint` próprio (a dica genérica por tipo + `hintFor.ts` compensa em aritmética, mas não em Português/EM).
- **P5 — Revisão Mágica não é repetição espaçada**: intervalo fixo de 1 dia (`reviewQueue.ts:68-73`), fila só no dispositivo (`kidoz-review-v1`, não vai para a cloud), cap 30, e perguntas "order" nem entram (`reviewQueue.ts:96-97`). Trocar de dispositivo perde a fila.
- **P6 — Sem modo offline explícito** para a realidade de conectividade de MZ/AO/CV (SW faz NetworkFirst genérico, mas não há "modo offline" consciente nem sincronização diferida garantida).
- **P7 — `grade: 0` (Junior) fora do modelo curricular**: `GradeLevel = 1|2|3|4` (`curriculum.ts:13`); Junior só jogos, sem qualquer trilha pedagógica.

## 5. Gamificação & Economia

- **G1 — 6 pontuações/moedas coexistentes**: Abracadinhos+XP do perfil (global ✅), Cristais ✦ do portal (`kidoz-portal-v1`), Pontos Júnior (`junior.ts:966`), hiscore Arcade (`arcade.tsx:48`), XP Infinito (`infiniteChallenges.ts:376`), e `Profile.gems` — **campo morto**, sincronizado mas nunca ganho nem gasto (`storage.ts:12`).
- **G2 — 3 streaks independentes**: perfil (`storage.ts:135-142`), portal (`portalDaily.ts:124`), júnior (`junior.ts:967`).
- **G3 — 3+ resets diários com "hoje" calculado de forma diferente**: Jardim usa UTC (`dailyMissions.ts:139-141`), Portal usa fuso local (`portalDaily.ts:129-134`), Desafio IA usa o servidor (`challenges.functions.ts:143-152`). Em MZ/AO (UTC+2/3) as missões do Jardim viram às 2h/3h locais.
- **G4 — Corações inconsistentes**: a lição decrementa corações só em memória (`licao:319`), nunca grava no perfil; o merge cloud faz `Math.max` de hearts (`storage.ts:344-390`) — gastar corações num dispositivo não sincroniza para baixo.
- **G5 — Duas lojas competem pela mesma carteira**: Loja dos Abracadinhos (50-400) e Quarto `/mundo` (10-200) gastam os mesmos coins e a mesma lista `ownedItems` (`loja.tsx:91`, `mundo.tsx:90-93`).
- **G6 — Campos/fluxos mortos**: `rewardGardenItem` declarado e nunca usado (`dailyMissions.ts:17`); `gems` sem qualquer fluxo; XP Infinito paralelo ao XP do perfil (confuso para a criança).
- **G7 — Ligas semanais não arrancam à segunda-feira**: `ends = adesão + 7 dias` (`leagues.functions.ts:135`) — cada criança tem a sua própria "semana".

## 6. UX & Harmonia

- **U1 — 8 motores de quiz + 4+ entradas de "desafio"** (lição, LightningQuiz, Reinos do Portal, Infinitos, Revisão, RA, Expresso, Júnior; entradas: /desafios, /desafios/infinitos, /desafio, /arcade). Fontes de pergunta e moedas pagas diferem entre motores — custo de manutenção e confusão de navegação.
- **U2 — Feedback certo/errado assinalado só por cor + animação** (`licao:699-706`): sem `aria-live`/`role="status"`, sem `aria-pressed`/`role="radio"` nas opções MCQ.
- **U3 — 40+ chaves localStorage com 3 prefixos e governança parcial** (ver C6).
- **U4 — Kits/Previews/Demos** (DiretorKit, TeacherPanelPreview, TurmaAoVivoDemo, HomeMiniDemo, CopiasCalc): útil para vendas, mas devem estar claramente rotulados como demonstração para não minar confiança B2B.

## 7. Técnica & Arquitetura

- **T1 — Zero testes**: nenhum `*.test.*`/`*.spec.*` em `src/`; sem vitest/jest no package.json.
- **T2 — Zero CI**: sem `.github/` — cada push em main vai direto para produção (Lovable).
- **T3 — Zero error tracking**: sem Sentry ou equivalente; só `errorComponent` por rota.
- **T4 — Monólitos**: `admin.tsx` 2.447 linhas; `ClassroomScene.tsx` ~1.131; `worksheet.functions.ts` 1.034.
- **T5 — Docs drift**: cabeçalho do `curriculumBoost.ts` diz "~210 perguntas" mas contém 230.
- **T6 — Merge cloud com `Math.max`** para xp/coins/gems/streak/hearts (`storage.ts:344-390`): aceitável para xp/coins, incorreto para hearts (ver G4) e máscara perdas.
- **T7 — Gating premium com dois caminhos**: local `isPremiumActive = profile.isPremium || premiumUntil` (`premium.ts:65-74`) e cloud `useSubscription`. O caminho local permite ativar Premium editando localStorage no dispositivo — o cloud existe mas nem todos os gates passam por ele.

## 8. Negócio & Monetização

- **N1 — Unit economics de 0,99€/aluno/mês**: com mínimo de 20 alunos, uma escola paga 19,80€/mês. Suporte, onboarding, faturação manual e infra estragam a margem a baixo volume. Estratégia de tração, não de sustentação — precisa de um plano para subir preço/mínimo ou reduzir serviço.
- **N2 — Ativação manual de escolas**: transferência + referência `KIDZ-XXXXX` + fatura por email + ativação "no mesmo dia útil 9h-17h" (`Pagamentos.tsx:335-339`) — depende de uma pessoa; nota ⚠️ para trocar credenciais em `payments.ts:4-9` precisa de confirmação de que foi feita.
- **N3 — Sem MBWay nem referência Multibanco** — para escolas PT é o meio de pagamento por omissão; só Stripe/PayPal/PayPal.Me/transferência.
- **N4 — Leads de escolas sem backend**: `SchoolLeadForm` valida local e envia por wa.me/mailto; "os dados não são guardados por nós" (`SchoolLeadForm.tsx:277`) — sem CRM, sem follow-up, leads perdidos.
- **N5 — Plano `vitalicio_lifetime` (79,99€) existe no backend** (`paypal.functions.ts:8`, `webhook.ts:92-99`) mas não é oferecido na UI (`premium.tsx:125-161`).
- **N6 — Convites que pagam Premium** (+140 boas-vindas, marcos +150/+600/+300, `referral.ts:191,224-231`): o mecanismo de verificação de convites legítimos precisa de auditoria anti-abuso (contas descartáveis → Premium grátis).
- **N7 — Pagamentos reais não testados ponta-a-ponta**: capture PayPal com credenciais live nunca executado; estado das chaves Stripe live por confirmar.
- **N8 — Emails institucionais por confirmar**: `escolas@kidoz.online`, `info@kidoz.online` — citados em privacidade/escolas.
- **N9 — Coerência de preços família vs escolas**: família 4,99€/mês ≈ o que uma escola paga por 5 alunos; o valor percebido família precisa de justificação (portal premium + relatórios).

## 9. Legal, Privacidade & Segurança

- **L1 (P0) — Sem fluxo de consentimento parental/idade no registo**: `/auth` só pede nome/email/password (`auth.tsx:39-62`); `/comecar` cria perfil de criança sem qualquer verificação; os termos exigem registo por responsável para <13 (`termos.tsx:52`) mas nada executa. A privacidade promete consentimento parental COPPA/RGPD art.º 8 (`privacidade.tsx:134`) — gap entre papel e produto.
- **L2 (P0) — Privacidade/termos desatualizados vs produto**: "Última atualização: 4 de março de 2025" — não refletem Stripe, Lovable AI Gateway, PayPal, ferramentas de escola, emails transacionais. Subresponsáveis listados: só Supabase UE (`privacidade.tsx:92`).
- **L3 — Cookie consent sem enforcement**: `kidoz_cookie_consent` guardado, flags expostas (`CookieConsent.tsx:99-105`), mas nenhum ficheiro as lê; Google Fonts carregadas de terceiros antes de qualquer consentimento.
- **L4 — PIN parental no objeto do perfil da criança**: `parentPin` vive em `kidoz-profile-v2` (legível/editável pela criança no dispositivo) e sincroniza para a cloud (`storage.ts:208-233`).
- **L5 — Dados da criança para a cloud sem verificação**: nome+idade+grade vão para `profiles` via `syncProfileToCloud` mesmo sem conta verificada de responsável.
- **Pontos positivos**: tutor IA trunca/sanitiza nome e filtra emails/telefones (`tutor-stream.ts:120-130,214-216`); sem analytics de terceiros; sem segredos no cliente.

## 10. Acessibilidade

- **A1** — Correção de resposta não anunciada a leitores de ecrã (sem `aria-live`, sem `role="status"`).
- **A2** — Opções MCQ sem semântica `radio`/`aria-pressed`.
- **A3** — Suporte de teclado esparsamente implementado (8 ocorrências de onKeyDown em 6 ficheiros).
- **A4** — Sem opção de fonte amigável à dislexia (relevante para uma plataforma de leitura para crianças).

## 11. Performance, SEO & Ops

- **O1** — Canonical ausente no root (só por rota); sitemap estático pode divergir do dinâmico.
- **O2** — `icon-512.png` 208KB (usado em installs PWA) — otimizável.
- **O3** — Sem ambiente de staging: push main = produção.
- **O4** — Sem qualquer analytics de produto (nem privacy-friendly): não há dados de uso para decidir prioridades — a auditoria de produto fica às cegas.

## 12. Plano Priorizado

### P0 — bloqueia lançamento
1. **Consentimento parental + idade** no `/comecar` e `/auth`: declaração de idade, email do responsável, checkbox de consentimento ligada à criação de perfis.
2. **Atualizar `/privacidade` e `/termos`**: Stripe, Lovable AI, PayPal, ferramentas de escola, retenção, subresponsáveis.
3. **Testar E2E PayPal real** + confirmar chaves Stripe live + troca de credenciais do `payments.ts`.
4. **Premium enforcement cloud**: gates a passarem por `useSubscription`/server; `isPremium` local passa a hint, não fonte de verdade.
5. **Anti-abuso de convites** (verificar/limitar recompensas por conta verificada).

### P1 — primeiras semanas
6. **Conteúdo**: preencher buracos (Cidadania g4; Ciências g1/g4; Inglês g4; EM g1), subir coverage de `explanation`/`hint`, embaralhar perguntas e opções MCQ.
7. **Unificar economia**: 1 moeda real (coins), 1 streak, 1 "hoje" (fuso local), matar `gems`/XP Infinito ou fundi-los; 1 fila de revisão com repetição espaçada sincronizada.
8. **Ops mínima**: Sentry (ou GlitchTip), CI (tsc+eslint+build), smoke tests das rotas críticas.
9. **MBWay/referência Multibanco** + captura de leads em base de dados (tabela `school_leads`).
10. **Corações persistidos** + merge correto.

### P2 — depois do lançamento
11. Decisão i18n: EN fica (traduzir) ou sai (remover regiões US/ZA/GB).
12. Cultura AO/CV/BR real (vocabulário completo, `culturaAtivo`, exemplos nas perguntas de matemática).
13. A11y: `aria-live` no feedback, roles de rádio, opção dislexia.
14. Refactor de monólitos; podar/rotular Kits e Demos; consolidar entradas de desafio.

## 13. Decisões de produto a tomar

- Qual é o ÚNICO loop central a destacar na home? (sugestão: lição → revisão → missão do dia)
- Cristais do portal: mantêm-se como economia premium isolada ou convertem-se em coins?
- Junior: fica dentro do produto principal ou separa-se num subdomínio/app?
- A população EN (US/ZA/GB) é mercado real ou ruído da deteção por timezone?
