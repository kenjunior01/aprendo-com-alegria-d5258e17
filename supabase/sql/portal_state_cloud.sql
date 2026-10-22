-- ═══════════════════════════════════════════════════════════════════
-- Kidoz · Estado do Portal (Mundo Premium) na cloud
-- Idempotente: pode correr quantas vezes quiser no SQL Editor do Lovable.
--
-- O estado do Portal (cristais ✦, 45 estrelas, criaturas, títulos,
-- power-ups) vivia só no dispositivo. Esta coluna guarda um snapshot
-- jsonb { v, state, savedAt } por perfil — o cliente faz pull no /portal
-- e push debounced após cada escrita (merge "cloud só se mais recente").
-- RLS existente de `profiles` continua a valer (cada linha só é escrita
-- pelo próprio utilizador autenticado).
-- ═══════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists portal_state jsonb;

comment on column public.profiles.portal_state is
  'Snapshot do estado do Portal (cristais, estrelas, criaturas, títulos, power-ups) — {v, state, savedAt}';
