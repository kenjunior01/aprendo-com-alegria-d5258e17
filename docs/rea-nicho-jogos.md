# REA aplicado ao nicho — engenharia reversa dos melhores jogos (out/2026)

> Metodologia **Reverse Engineer Anything (REA)** aplicada ao nicho kids-learning:
> *decompile → understand → recreate*. Não decompilamos binários — decompilámos as
> mecânicas dos líderes do nicho (documentação oficial, app stores, estudos de
> eficácia) e recriámos cada mecânica **melhorada** dentro da Kidoz, respeitando a
> nossa pedagogia honesta (anti-streak-anxiety, erro que ensina, sem paywall na
> criança). Cada linha abaixo é verificável no código.

## 1. O que foi "decompilado" dos concorrentes

| Concorrente | Mecânica decompilada | Evidência pública |
|---|---|---|
| **Khan Academy Kids** | Learning Path adaptativo que ajusta o nível ao desempenho; personagens que reagem | khanacademy.org/kids + FAQ oficial ("surfaces content at a level appropriate") |
| **Lingokids** | Sistemas modulares (a mesma mecânica serve matérias diferentes); celebração a cada conquista; relatórios aos pais | lingokids.com (Playlearning™, 650+ learning objectives) |
| **Duolingo** | Combo/XP únicos; ligas com pontos de jogo real; timers de urgência saudável | strivecloud.io (Duolingo gamification explained) |
| **Prodigy / Matific** | Motor adaptativo centrado no histórico de erros; variação de apresentação do mesmo conceito | modelo Prodigy adaptive engine; Matific concept variation |
| **Smartick** | Sessões curtas com rampa de dificuldade dentro da sessão; sobe/desce conforme desempenho | posicionamento público do método |

## 2. O que foi recriado (melhorado) na Kidoz — commits 4845e30…a4e1dc9

### Motor justo e correto (fix 4845e30)
- **Fisher–Yates em TODOS os baralhamentos** — eram 11 ficheiros com `sort(random)`
  enviesado (a resposta certa aparecia mais vezes nas mesmas posições — detetável
  por crianças mais velhas). Agora: `shuffled()` em `src/lib/utils.ts`.
- **Bugs reais corrigidos**: `estrelas-tap` nunca terminava (ronda cap); dupla
  contagem de progresso no Júnior ("Terminei!" gravava por cima do jogo);
  hiscore do arcade com hook hack; combo em inglês ("AMAZING!" → "ESPETACULAR!");
  subjectLink do jardim só conhecia 2 matérias.
- **8 jogos de Moçambique ficaram alcançáveis** (estavam no registry, invisíveis na UI).

### Juice universal (feat 3b45174)
- **Desafios Infinitos**: som + haptics + confetti no 3★ + badge de sequência 🔥 +
  erros na Revisão Mágica + tempo de erro 700ms → 2,4s (regra "erro dá tempo de ler").
- **Arcade**: confetti no fim, haptics, **moedas + XP integrados na economia global**
  (antes: pontos que não davam nada), **graduação por ano escolar** (1.º ano não recebe
  jogos de bebé; adaptação do `ageGroup` do registry que estava ignorado).
- **Jardim**: o momento "nasceu uma criatura!" agora existe — fanfarra + confetti +
  voz da mascote + banner (antes o desbloqueio era retroativo e invisível).
- **Mundo**: som ao comprar/colocar + merge offline seguro (antes a cloud podia
  apagar o que a criança acabou de fazer).
- **Leitura**: acerto com som+haptic, **+3 XP/+1 moeda por leitura** (antes: 0),
  **sobe de nível após 3 leituras perfeitas** (adaptativo à Smartick).

### Adaptatividade e justiça (feat fcc35df)
- **Mundo Premium (Portal)**: 2 derrotas seguidas no mesmo nível → perguntas 2 anos
  mais fáceis (invisível à criança — o padrão Prodigy/Matific); **sequência ×5 dá
  +3 cristais** (combo recompensado de verdade); combo visível durante o jogo.
- **Ligas**: pontos agora vêm de um Quiz Relâmpago real de 5 perguntas
  (0 acertos → 5 pts … 5 → 35). Antes: `10 + random*30` — sem pedagogia e
  trapaçável com cliques.
- **Duelo da Família**: relógio de 25s por pergunta (barra que fica vermelha nos
  últimos 5s) — fim das sessões bloqueadas; bónus de vitória sem o bug dos nomes
  (dois "Tomás" davam o bónus ao perfil errado).
- **Laboratório RA**: recompensa só na 1.ª conclusão (antes: farm infinito) e
  conclusões persistidas.

### Sistemas vivos (feat a4e1dc9)
- **O Júnior alimenta a app principal**: jogar no /junior dá XP/moedas ao perfil,
  acorda a energia da mascote e conta para a missão dos "10 minutos" — uma criança
  de 3 anos já progride nas missões diárias.
- **Sazonal cumpre o que o banner promete**: evento ativo = **dobro de Abracadinhos**
  nas missões (`seasonalCoinMultiplier()`).
- **A treinadora do Portal FALA** (voz pt-PT nas falas contextuais — intro, perigo,
  vitória, celebrações de combo).

## 3. O que NÃO copiámos (decisão própria — ver analise-competitiva.md §6)
- Corações que punem a prática curricular; catálogo infinito de minijogos soltos;
  paywall dentro do ecrã da criança; streaks que geram ansiedade (mantivemos o
  Escudo da Sequência); promessas de "melhores notas garantidas".

## 4. Próximas rondas sugeridas (prioridade por impacto)
1. Persistir o estado do Portal na cloud (coluna `portal_state` em `profiles`)
   — hoje 45 estrelas vivem só no dispositivo.
2. Handicap por irmão no Duelo "Misto" (cada jogador no seu ano escolar).
3. Anti-cheat server-side leve nos rankings (validação de plausibilidade de score).
4. Trivia remota (`getTrivia` já existe!) alimentada pelos jogos principais.
5. Conquistas do Júnior (hoje as 13 conquistas só contam lições).
