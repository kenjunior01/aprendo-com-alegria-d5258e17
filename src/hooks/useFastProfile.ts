// Hook de perfil local-first: render instantâneo com cache local e
// reconciliação com a cloud em background (stale-while-revalidate).
//
// - Com perfil local: renderiza já (loading=false de imediato) e a cloud
//   atualiza o estado quando chegar (timeout 3,5s no pior caso).
// - Sem perfil local (utilizador novo / outro dispositivo): espera pela cloud.

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/storage";
import { localProfile, refreshProfile } from "@/lib/profileFast";

export function useFastProfile(): { profile: Profile | null; loading: boolean } {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const local = localProfile();
    if (local) {
      setProfile(local);
      setLoading(false);
      void refreshProfile().then((cloud) => {
        if (!cancelled && cloud) setProfile(cloud);
      });
    } else {
      void refreshProfile().then((cloud) => {
        if (cancelled) return;
        if (cloud) setProfile(cloud);
        setLoading(false);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading };
}
