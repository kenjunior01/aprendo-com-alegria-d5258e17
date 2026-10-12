// OfflineBanner — para a realidade de conectividade de MZ/AO/CV (P6 da
// auditoria): quando a internet cai, a criança vê um aviso calmo e
// persistente (o toast some ao fim de segundos) que diz a verdade —
// as lições e o progresso continuam a funcionar offline.

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState<boolean>(
    () => typeof navigator !== "undefined" && navigator.onLine === false,
  );

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-40"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="bg-amber-400/95 px-3 py-2 text-center text-amber-950 shadow-md backdrop-blur">
        <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          Estás offline — o teu progresso continua a ser guardado e as lições funcionam na mesma!
        </p>
      </div>
    </div>
  );
}
