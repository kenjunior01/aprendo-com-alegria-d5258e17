// pvpStats.ts — Estatísticas cumulativas dos jogos de PvP (Duelo da Família e
// Quiz Relâmpago), fonte única das conquistas de duelo (achievements.ts).
//
// Porquê contadores próprios (e não o sessionHistory do perfil): o histórico
// é capado a 120 entradas e o Relâmpago não escreve lá — as conquistas pedem
// totais que nunca "esquecem". Fica no dispositivo, como o resto do progresso
// de jogos (kidoz-quiz-pais-v1, kidoz-perfect-lessons): sem PII, sem colunas
// novas na cloud.
//
// Filosofia do hot-seat (ver duelo.ts): o perfil pertence ao DISPOSITIVO, não
// a um dos jogadores — atribuir "vitórias" ao perfil local seria injusto quando
// os dois jogadores são filhos do mesmo tablet. Por isso NÃO existe contador de
// vitórias: celebramos participar e acertar ("participar já é treinar").
export interface PvpStats {
  dueloRounds: number; // duelos completos
  dueloCorrect: number; // acertos acumulados dos dois jogadores
  relampagoRounds: number; // rodadas do Quiz Relâmpago terminadas
  relampagoCorrect: number; // acertos acumulados
  relampagoPerfect: number; // rodadas sem falhar (5/5, 6/6…)
}

const LS_KEY = "kidoz-pvp-stats-v1";

const emptyStats = (): PvpStats => ({
  dueloRounds: 0,
  dueloCorrect: 0,
  relampagoRounds: 0,
  relampagoCorrect: 0,
  relampagoPerfect: 0,
});

export function loadPvpStats(): PvpStats {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return emptyStats();
    const p = JSON.parse(raw) as Partial<PvpStats>;
    // Nunca negativo nem NaN — valores inválidos caem no default 0.
    const num = (v: unknown) =>
      Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0;
    return {
      dueloRounds: num(p.dueloRounds),
      dueloCorrect: num(p.dueloCorrect),
      relampagoRounds: num(p.relampagoRounds),
      relampagoCorrect: num(p.relampagoCorrect),
      relampagoPerfect: num(p.relampagoPerfect),
    };
  } catch {
    return emptyStats();
  }
}

/** Registra um duelo terminado. `correctTotal` = acertos dos DOIS jogadores. */
export function recordDueloResult(correctTotal: number): PvpStats {
  const s = loadPvpStats();
  const next: PvpStats = {
    ...s,
    dueloRounds: s.dueloRounds + 1,
    dueloCorrect: s.dueloCorrect + Math.max(0, correctTotal),
  };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    // storage cheio — contagem fica só em memória nesta sessão
  }
  return next;
}

/** Registra uma rodada do Quiz Relâmpago. Perfeita se acertou todas. */
export function recordRelampagoResult(correct: number, total: number): PvpStats {
  const s = loadPvpStats();
  const next: PvpStats = {
    ...s,
    relampagoRounds: s.relampagoRounds + 1,
    relampagoCorrect: s.relampagoCorrect + Math.max(0, correct),
    relampagoPerfect: total > 0 && correct >= total ? s.relampagoPerfect + 1 : s.relampagoPerfect,
  };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    // storage cheio — contagem fica só em memória nesta sessão
  }
  return next;
}
