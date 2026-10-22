-- ═══════════════════════════════════════════════════════════════════════════
-- CONQUISTAS DO JÚNIOR — 12 medalhas novas (7 de jogos + 5 novos patamares)
-- Roadmap §4 item 5: as conquistas deixam de contar só lições.
--
-- Como aplicar: Lovable → SQL Editor → colar tudo → Run. Podes correr
-- quantas vezes quiseres (ON CONFLICT atualiza o catálogo sem duplicar).
--
-- Avaliação dos requisitos é 100% client-side (src/lib/achievements.ts):
-- tipos novos quiz_pais_levels / quiz_pais_perfect / quiz_pais_countries /
-- quiz_pais_records leem o progresso do Quiz do Meu País (localStorage) —
-- nenhum gatilho ou função nova no servidor. Clientes antigos ignoram
-- tipos desconhecidos (nunca desbloqueiam por engano).
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.achievements
  (code, title, description, icon, category, requirement_type, requirement_value, coin_reward, xp_reward, sort_order)
VALUES
  -- ── Novos patamares das categorias existentes ──
  ('lessons_60',        'Maratonista',            'Completa 60 lições',                                        'book-open',   'progresso',    'lessons_completed',     60,   150, 120, 5),
  ('streak_14',         'Duas Semanas',           'Mantém uma sequência de 14 dias',                           'flame',       'consistencia', 'streak',                14,   100,  60, 13),
  ('xp_2500',           'Vulcão de XP',           'Alcança 2500 XP',                                           'zap',         'xp',           'xp',                  2500,   250,   0, 23),
  ('coins_500',         'Cofrinho Cheio',         'Junta 500 Abracadinhos',                                    'coins',       'economia',     'coins_total',          500,    60,   0, 32),
  ('perfect_lessons_10','Cérebro de Ouro',        'Termina 10 lições com 100% de acerto',                      'target',      'precisao',     'perfect_lessons',       10,    80,  50, 41),
  -- ── Jogos: Quiz do Meu País ──
  ('pais_primeiro_quiz','Primeira Rodada',        'Joga a tua primeira rodada do Quiz do Meu País',            'map',         'jogos',        'quiz_pais_records',      1,    20,  10, 50),
  ('pais_medio',        'Rumo ao Médio',          'Desbloqueia o nível Médio no Quiz do Meu País',             'gamepad-2',   'jogos',        'quiz_pais_levels',       2,    25,  15, 51),
  ('pais_campeao',      'Campeão do País',        'Desbloqueia o nível Campeão no Quiz do Meu País',           'trophy',      'jogos',        'quiz_pais_levels',       3,    60,  30, 52),
  ('pais_perfeito',     'Rodada Perfeita',        'Acerta 5 em 5 numa rodada do Quiz do Meu País',             'target',      'jogos',        'quiz_pais_perfect',      1,    30,  20, 53),
  ('pais_explorador',   'Explorador da CPLP',     'Joga o quiz de 3 países diferentes',                        'globe',       'jogos',        'quiz_pais_countries',    3,    40,  20, 54),
  ('pais_globo',        'Volta ao Mundo',         'Joga o quiz dos 5 países (MZ, AO, BR, PT e CV)',            'globe',       'jogos',        'quiz_pais_countries',    5,    80,  40, 55),
  ('pais_cinco_vezes',  'Colecionador de Recordes','Marca recordes em 6 desafios país + nível',                'medal',       'jogos',        'quiz_pais_records',      6,    50,  25, 56)
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

-- Verificação rápida (opcional): deve devolver 25 linhas (13 antigas + 12 novas)
-- SELECT code, category, requirement_type, requirement_value
--   FROM public.achievements ORDER BY sort_order;
