## Plano

### Parte 1 — AuditTab: reordenar colunas com drag & drop

**Onde:** `src/routes/admin.tsx` (componente `AuditTab`).

- Adicionar `dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) — biblioteca leve, acessível, suporta touch.
- Substituir o array fixo `COLS` por estado `colOrder: string[]` persistido em `localStorage` (chave nova `admin.audit.cols.order.v1`, mantendo `admin.audit.cols.v1` para visibilidade).
- No popover "Colunas":
  - Cada item da lista passa a ser um `SortableItem` com handle (ícone `GripVertical` do lucide) + checkbox de visibilidade já existente.
  - `DndContext` + `SortableContext` (estratégia vertical) com sensores Pointer e Keyboard (acessível).
- A renderização das células (header e linhas) passa a iterar `colOrder.filter(showCol)` em vez da ordem hardcoded.
- Migração: se `localStorage` não tiver `colOrder`, usa a ordem default; ao receber colunas novas no futuro, faz merge (append das novas no fim).
- Botão "Repor ordem" no popover para limpar a preferência.

### Parte 2 — Expandir jogos, desafios e conteúdo (versão free, em massa)

**Estratégia:** gerar conteúdo em larga escala usando o **Lovable AI Gateway** (já configurado, sem API key extra, gratuito dentro da quota do projeto) — modelo `google/gemini-2.5-flash` para volume e `gemini-2.5-pro` para validação. Tudo gerado **em build-time** (script offline) e guardado como JSON estático no repositório, para não consumir créditos em runtime.

**APIs externas opcionais (todas gratuitas, sem cartão):**
- **Open Trivia DB** (`opentdb.com/api.php`) — milhares de perguntas multi-categoria, multi-dificuldade, free, sem chave.
- **Numbers API** (`numbersapi.com`) — factos matemáticos para mini-jogos de curiosidades, free, sem chave.
- **REST Countries** (`restcountries.com`) — dados de países (bandeiras, capitais) para Estudo do Meio / geografia, free.
- **Wikipedia REST API** — resumos para "sabias que…", free, sem chave.
- **PoetryDB** (`poetrydb.org`) — para mini-jogos de leitura/rima em PT/EN, free.
- (Opcional, se quiseres conteúdo PT-PT específico) **DBnomics** / **INE open data** para curiosidades regionais.

Para todas as APIs externas usadas, faço fetch **uma única vez no script de geração**, traduzo/adapto para PT-PT via Lovable AI, e guardo o resultado como JSON no repo. Em runtime a app **não chama nada** — tudo continua offline-first, free, sem custos recorrentes.

**O que vou gerar (alvo: muito conteúdo, todas as idades 3–12, todas as categorias):**

1. **`src/lib/curriculum.ts`** (atualmente ~30 lições) → expandir para **120+ lições**:
   - Português, Matemática, Estudo do Meio, **+ Inglês, + Ciências, + Cidadania, + Arte/Música**.
   - 1.º ao 4.º ano (idades 6–10) com 4–6 lições por matéria/ano.
   - Cada lição com **8–12 perguntas** (vs 3–4 atuais) com hints.

2. **`src/lib/juniorContent.ts`** (novo) para idades 3–5 (Junior):
   - 60+ mini-jogos: cores, formas, sons de animais, contar até 10, vogais, opostos, padrões, memória, sombras, primeiro-último, etc.
   - JuniorGamesV2/Extra ganham 8–10 modos novos (puzzle de arrastar, encontra-o-igual, sequência, jogo da memória com mais cartas, labirinto simples, ditado de cores, ritmo, etc.).

3. **`src/lib/infiniteChallenges.ts`** → banco com **500+ desafios** infinitos por faixa etária e tema (cálculo mental, ortografia, lógica, padrões, geografia, ciências, inglês básico).

4. **`src/lib/dailyMissions.ts`** + **`src/lib/labMissions.ts`** → pools com 100+ missões cada, rotativas por dia/estação.

5. **`src/lib/chapters.ts`** → +10 capítulos de história/aventura com 5–8 cenas cada (modo leitura interativa).

6. **`src/lib/triviaBank.ts`** (novo) → 1000+ perguntas de trivia categorizadas (animais, espaço, Portugal, mundo, desporto, arte, música), por faixa etária.

7. **`src/lib/funFacts.ts`** (novo) → 500+ "Sabias que…" curtos para mostrar em loading/recompensas.

**Pipeline de geração (one-off, offline):**
- Script `scripts/generate-content.ts` que:
  1. Faz fetch das APIs públicas listadas.
  2. Para cada item, chama Lovable AI para traduzir/adaptar para PT-PT, ajustar idade, criar 4 opções, marcar resposta certa, adicionar hint.
  3. Valida com schema Zod (descarta inválidos).
  4. Escreve JSON em `src/data/*.json`.
- O script corre uma vez (eu corro-o por ti); o conteúdo fica versionado no repo. **Zero custo em runtime, zero APIs externas no cliente.**

**UI/Jogos novos no Junior (componentes React):**
- `JuniorMemoryGame` (cartas viradas, 3 níveis de dificuldade).
- `JuniorPatternGame` (completa o padrão).
- `JuniorMazeGame` (labirinto SVG simples).
- `JuniorRhythmGame` (toca a sequência).
- `JuniorShadowMatch` (associa sombra ao animal).
- `JuniorCountingGame` (arrasta n objetos).
- Integrados no `JuniorGamesV2` com seletor.

### Detalhes técnicos

- Persistência de ordem das colunas: `localStorage["admin.audit.cols.order.v1"] = JSON.stringify(string[])`.
- `dnd-kit` instalado via `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
- Geração de conteúdo: `bun run scripts/generate-content.ts` usando `LOVABLE_API_KEY` do ambiente; output em `src/data/`.
- Tipos partilhados em `src/lib/contentTypes.ts` para validar JSON em build.

### Confirmações que preciso

1. **Avanço com este pipeline (Lovable AI + APIs free) sem pedires nada extra?** As APIs listadas são todas free e sem chave — nada para configurares.
2. **Volume**: confirmas alvo de **~120 lições + ~500 desafios infinitos + ~1000 trivia + 6 jogos novos no Junior** num só lote? (A geração demora alguns minutos mas corre uma vez só.)
3. **Idiomas**: tudo em **PT-PT**, com módulo de Inglês básico à parte? Ou também queres versão EN completa?
