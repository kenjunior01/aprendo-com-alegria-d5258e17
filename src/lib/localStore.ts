// Utilitário para chaves localStorage da plataforma.
//
// Auditoria (unificação de marca): as chaves antigas usavam prefixos
// "lusis-*" e "alegria-*". Passámos tudo para "kidoz-*". Estas funções
// garantem leitura retrocompatível e migração transparente (uma escrita).

const PREFIX = "kidoz-";
const LEGACY_PREFIXES = ["lusis-", "alegria-"];

/** Lê `key` (com prefixo kidoz-); se não existir, tenta as chaves legadas e migra. */
export function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  const full = key.startsWith(PREFIX) ? key : PREFIX + key;
  try {
    const current = localStorage.getItem(full);
    if (current !== null) return current;
    // Migração: procura por prefixos antigos
    const shortKey = full.slice(PREFIX.length);
    for (const legacy of LEGACY_PREFIXES) {
      const legacyKey = legacy + shortKey;
      const v = localStorage.getItem(legacyKey);
      if (v !== null) {
        // migra para a chave nova (não removemos a antiga: preserva sessões noutras tabs)
        try {
          localStorage.setItem(full, v);
        } catch {
          /* quota */
        }
        return v;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Escreve `key` (com prefixo kidoz-) e remove variantes legadas. */
export function lsSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  const full = key.startsWith(PREFIX) ? key : PREFIX + key;
  try {
    localStorage.setItem(full, value);
    const shortKey = full.slice(PREFIX.length);
    for (const legacy of LEGACY_PREFIXES) {
      localStorage.removeItem(legacy + shortKey);
    }
  } catch {
    /* quota cheia — ignorar silenciosamente */
  }
}

/** Remove `key` e todas as variantes legadas. */
export function lsRemove(key: string): void {
  if (typeof window === "undefined") return;
  const full = key.startsWith(PREFIX) ? key : PREFIX + key;
  try {
    localStorage.removeItem(full);
    const shortKey = full.slice(PREFIX.length);
    for (const legacy of LEGACY_PREFIXES) {
      localStorage.removeItem(legacy + shortKey);
    }
  } catch {
    /* noop */
  }
}

/** Lê um objeto JSON de `key` com fallback legado; devolve fallback em caso de erro. */
export function lsGetJSON<T>(key: string, fallback: T): T {
  const raw = lsGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Escreve um objeto JSON em `key` (com limpeza de chaves legadas). */
export function lsSetJSON(key: string, value: unknown): void {
  try {
    lsSet(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}
