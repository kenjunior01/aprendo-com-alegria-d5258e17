# Plano

## 1. Importação Open Trivia DB (PT-PT) com cache + fallback

**Edge function** `supabase/functions/trivia-import/index.ts`:
- Chama `https://opentdb.com/api.php?amount=50&category=...&type=multiple` (sem chave, free).
- Tradução para PT-PT via Lovable AI (`google/gemini-2.5-flash`) em batch (1 prompt por lote de 50).
- Devolve `{ questions: [...] }` normalizado para o formato do `triviaBank`.

**Tabela nova** `trivia_cache` (RLS: leitura autenticada, escrita só admin):
- `category text`, `difficulty text`, `lang text default 'pt-PT'`, `questions jsonb`, `fetched_at timestamptz`.
- TTL: 7 dias. Se `fetched_at` < 7d → devolve cache; senão → re-fetch.

**Cliente** `src/lib/triviaSource.ts`:
```ts
export async function getTrivia(category, count): Promise<TriviaQ[]> {
  try {
    const cached = await supabase.from('trivia_cache').select(...)...
    if (cached fresh) return pick(cached, count);
    const { data } = await supabase.functions.invoke('trivia-import', { body: { category, count } });
    return data.questions;
  } catch {
    return triviaBank.filter(q => q.category === category).slice(0, count); // fallback offline
  }
}
```

`GameTriviaJr` e usos do `triviaBank` passam por `getTrivia()`.

## 2. Mais 10+ mini-jogos Junior (com `subject` + `ageRange`)

Estendo `JuniorGame` em `src/lib/junior.ts` com `subject: SubjectId | 'logica' | 'musica'` e `ageRange: [min, max]` (anos: 6–10 → 1.º–4.º ano).

Novos jogos (`src/components/junior/JuniorGamesV4.tsx`, `V5.tsx`):

| # | Nome | Disciplina | Anos |
|---|------|-----------|------|
| 1 | Soma Rápida (flashes) | matematica | 1–2 |
| 2 | Tabuada Express | matematica | 3–4 |
| 3 | Frações Visuais (pizza) | matematica | 3–4 |
| 4 | Caça-Sílabas | portugues | 1–2 |
| 5 | Forma Frase (drag palavras) | portugues | 2–4 |
| 6 | Antónimos Pares | portugues | 2–4 |
| 7 | Mapa de Portugal (regiões) | estudo-meio | 3–4 |
| 8 | Ciclo da Água (ordenar) | ciencias | 2–4 |
| 9 | Animais & Habitats | ciencias | 1–3 |
| 10 | Bandeiras do Mundo | cidadania | 3–4 |
| 11 | Spelling EN (ouve & escreve) | ingles | 2–4 |
| 12 | Cores & Números EN | ingles | 1–2 |
| 13 | Memória Musical (Simon) | musica | 1–4 |
| 14 | Quebra-Cabeças Lógico | logica | 2–4 |

Cada jogo: componente React puro, sem deps novas, integra com `awardCoins`/`awardXp` existentes.

## 3. Admin: matérias/jogos on/off por idade + quantidade de perguntas

**Tabela** `content_settings` (singleton ou key/value, RLS: admin only):
- `key text primary key`, `value jsonb`.
- Chaves: `subjects.enabled` → `{ matematica: { enabled: true, ages: [6,10] }, ... }`, `games.enabled` → idem, `trivia.counts` → `{ animals: 20, space: 15, ... }`.

**Hook** `useContentSettings()` lê com cache TanStack Query e expõe helpers `isSubjectEnabled(id, age)`, `isGameEnabled(id, age)`, `triviaCount(cat)`.

**Aba nova** no Admin: `ContentSettingsTab` em `src/routes/admin.tsx`:
- Lista matérias com Switch + slider de idades (6–10).
- Lista jogos idem.
- Lista categorias trivia com input numérico (5–100) por categoria.
- Botão Guardar → upsert em `content_settings`.

`junior.tsx` e `curriculum.ts` filtram via `useContentSettings`.

## 4. Conta admin

Migration:
- INSERT em `auth.users` não é possível via SQL direto fiável → uso edge function `bootstrap-admin`:
  - Recebe `email`, `password`, `setupKey` (secret guardado).
  - Usa service role para `auth.admin.createUser({ email, password, email_confirm: true })`.
  - Insere `user_roles` com `role='admin'`.

Em alternativa **mais simples** (recomendado): a função `claim_first_admin()` já existe. Crio um **botão "Tornar-me admin"** na página `/admin` visível quando ainda não há admin, que chama `claim_first_admin()`. O utilizador só precisa de:
1. Registar-se normalmente em `/auth` (ou como já está autenticado).
2. Clicar no botão → vira admin.

**Credenciais sugeridas** (se quiser que crie já uma conta dedicada via edge function): peço-lhe email + password e crio na hora. Caso contrário usa a sua conta atual + claim.

## Arquivos

**Novos**: `supabase/functions/trivia-import/index.ts`, `src/lib/triviaSource.ts`, `src/components/junior/JuniorGamesV4.tsx`, `src/components/junior/JuniorGamesV5.tsx`, `src/hooks/useContentSettings.ts`, `src/components/admin/ContentSettingsTab.tsx`.

**Migrations**: tabela `trivia_cache`, tabela `content_settings`, política RLS.

**Editados**: `src/lib/junior.ts` (subject+ageRange + registo dos novos jogos), `src/routes/admin.tsx` (nova aba + claim admin button), `src/routes/junior.tsx` (filtro por settings).

## Perguntas

1. **Conta admin**: usar `claim_first_admin` (botão na UI, mais seguro) ou quer que crie uma conta dedicada via edge function (precisa email+password)?
2. **Tradução trivia**: confirmar uso do Lovable AI Gateway (já configurado, sem custo direto) — ok?
3. Faço **tudo numa só batch** (tabelas + função + 14 jogos + aba admin) ou divido em passos?
