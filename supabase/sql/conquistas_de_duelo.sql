-- ═══════════════════════════════════════════════════════════════════════════
-- CONQUISTAS DE DUELO — 8 medalhas novas de PvP (Duelo da Família + Relâmpago)
-- As conquistas deixam de ser só de lições e Quiz do País: agora os duelos
-- de irmãos e as rodadas relâmpago também dão medalhas.
--
-- Como aplicar: Lovable → SQL Editor → colar tudo → Run. Podes correr
-- quantas vezes quiseres (ON CONFLICT atualiza o catálogo sem duplicar).
--
-- Avaliação dos requisitos é 100% client-side (src/lib/achievements.ts):
-- tipos novos duelo_rounds / duelo_correct / relampago_rounds /
-- relampago_perfect leem os contadores cumulativos do dispositivo
-- (src/lib/pvpStats.ts, localStorage) — nenhum gatilho ou função nova no
-- servidor. Clientes antigos ignoram tipos desconhecidos (nunca desbloqueiam
-- por engano). Sem contador de "vitórias": o duelo é hot-seat e o perfil
-- pertence ao dispositivo — celebramos participar e acertar.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.achievements
  (code, title, description, icon, category, requirement_type, requirement_value, coin_reward, xp_reward, sort_order)
VALUES
  -- ── Duelo da Família ──
  ('duelo_primeiro',       'Primeiro Duelo',        'Joga o teu primeiro Duelo da Família',             'swords', 'jogos', 'duelo_rounds',       1,  20, 10, 57),
  ('duelo_cinco',          'Guerreiro da Família',  'Joga 5 Duelos da Família',                         'swords', 'jogos', 'duelo_rounds',       5,  40, 20, 58),
  ('duelo_vinte',          'Mestre da Arena',       'Joga 20 Duelos da Família',                        'crown',  'jogos', 'duelo_rounds',      20,  80, 40, 59),
  ('duelo_acertos',        'Cérebro em Duelo',      'Acerta 50 perguntas em Duelos',                    'brain',  'jogos', 'duelo_correct',     50,  60, 30, 60),
  -- ── Quiz Relâmpago ──
  ('relampago_primeiro',   'Primeira Faísca',       'Completa a tua primeira rodada do Quiz Relâmpago', 'zap',    'jogos', 'relampago_rounds',   1,  20, 10, 61),
  ('relampago_dez',        'Trovão Rápido',         'Completa 10 rodadas do Quiz Relâmpago',            'zap',    'jogos', 'relampago_rounds',  10,  50, 25, 62),
  ('relampago_perfeito',   'Relâmpago Perfeito',    'Completa uma rodada do Quiz Relâmpago sem falhar', 'target', 'jogos', 'relampago_perfect',  1,  30, 20, 63),
  ('relampago_perfeito_10','Tempestade Perfeita',   'Completa 10 rodadas do Quiz Relâmpago sem falhar', 'target', 'jogos', 'relampago_perfect', 10,  90, 45, 64)
ON CONFLICT (code) DO UPDATE SET
  title             = EXCLUDED.title,
  description       = EXCLUDED.description,
  icon              = EXCLUDED.icon,
  category          = EXCLUDED.category,
  requirement_type  = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value,
  coin_reward       = EXCLUDED.coin_reward,
  xp_reward         = EXCLUDED.xp_reward,
  sort_order        = EXCLUDED.sort_order;

-- Verificação rápida (opcional): deve devolver 33 linhas
-- (25 já existentes + 8 novas desta migração)
-- SELECT code, requirement_type, requirement_value
--   FROM public.achievements WHERE category = 'jogos' ORDER BY sort_order;
