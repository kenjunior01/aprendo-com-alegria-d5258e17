## Sync GitHub — kenjunior01/aprendo-com-alegria-d5258e17 (2026-11-25)

As duas linhas de trabalho (local: NVIDIA NIM + auditoria runtime + lint zero; remoto: O Meu País + core neutro + design-pro 1-3) estão reunidas. O sandbox foi reciclado a meio (perdeu 99d1f26/8ad0203 — lint zero e 10 fixes de runtime — e o merge 20f74ff), por isso o trabalho foi refeito: fetch+merge 4e7d28d, lint 3.589→0 outra vez (commit 8789add) com os hooks dos jogos do Júnior corrigidos de novo (rules-of-hooks em JuniorGames/Extra/V2/GameTutorial).

O remoto foi sincronizado via API GitHub (sem credenciais git no sandbox, `git push` CLI falha; os pushes usam o MCP autenticado como kenjunior01): 10 commits — NVIDIA provider chain (d167cf7), remoção de .env e .env.development (57f0398, 4e6be2a), GameTutorial+sitemap (a8b726b), cartStore+previewAuthStorage (916a643), emails auth (271c546), fila de emails (3c2c802), JuniorGamesV2 (27fd01b), JuniorGamesExtra (f4e15db), JuniorGames com appy] restaurado (b394921). Os 15 ficheiros semanticamente alterados foram verificados byte-a-byte contra raw.githubusercontent — todos idênticos. Smoke test final: dev server 200 + tutor-stream SSE a responder em pt-PT com escada de dicas.

Pendente por design: admin.tsx (typing-only, ~70KB) e ~120 ficheiros só-prettier (~1.6MB) não synced via API — código funcionalmente idêntico no remoto; um `git push` com PAT do utilizador alinharia o resto.

## Push prioritário dos hooks do Júnior (2026-11-28)

A pedido do utilizador ("usa api nvapi-... e coloca já"): chave NVIDIA confirmada ATIVA — teste ao vivo `scripts/nim_live_check.py` (nemotron-3.5-lightning, 1.4 s, reasoning desligado, escada de pistas correta em pt-PT para "52+39, 3.º ano"). Push via API do commit hooks: 83a0ba2 — GameTutorial, JuniorGames, JuniorGamesExtra, JuniorGamesV2 — verificados por blob SHA (git hash-object local vs ls-tree remoto: 4/4 OK). Conferido também que NENHUM ficheiro no remoto importa os 5 módulos novos locais (celebrations, progression, button-variants, toggle-variants, RouterErrorFallback) — o build remoto mantém-se íntegro sem eles.

Pendente (comportamento idêntico, só tipagem/prettier/deps): ~133 ficheiros (~1.1MB) + admin.tsx typing — sincronizáveis por lotes via API ou nativamente com um PAT do utilizador. package-lock.json: remoto já tem @ai-sdk/openai — sem diferença relevante. Novos scripts: nim_live_check.py (prova da chave a qualquer hora), make_push_chunks.py (gera lotes de sync).
