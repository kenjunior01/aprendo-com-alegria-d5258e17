// Carregamento rápido de perfil — estratégia local-first (stale-while-revalidate).
//
// Problema: as rotas esperavam 2 round-trips de rede (auth.getUser + query à
// tabela profiles) ANTES de renderizar qualquer coisa. Em redes lentas (3G/PALOP)
// isto eram 2–4s de spinner só para mostrar um perfil que já estava em cache.
//
// Solução:
//  1. localProfile()  — leitura síncrona do localStorage (0ms, sem rede).
//  2. refreshProfile() — cloud com TIMEOUT, para nunca pendurar a UI;
//     reconcilia em background e a rota atualiza o estado quando chegar.

import { loadProfile, pullProfileFromCloud, type Profile } from "./storage";

const CLOUD_TIMEOUT_MS = 3500;

/** Perfil local imediato (sem rede). null se não existir ou estiver vazio. */
export function localProfile(): Profile | null {
  try {
    const p = loadProfile();
    return p && p.name ? p : null;
  } catch {
    return null;
  }
}

/** Cloud com timeout — devolve null em erro ou se demorar mais de maxMs. */
export async function refreshProfile(maxMs = CLOUD_TIMEOUT_MS): Promise<Profile | null> {
  try {
    return await Promise.race([
      pullProfileFromCloud(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), maxMs)),
    ]);
  } catch {
    return null;
  }
}
