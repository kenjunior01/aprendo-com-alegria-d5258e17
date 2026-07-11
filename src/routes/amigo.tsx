import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MascotRoom } from "@/components/MascotRoom";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/amigo")({
  head: () => ({
    meta: [
      { title: "O Meu Amigo — Kidoz" },
    ],
  }),
  component: MascoteMode,
});

function MascoteMode() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const cloud = await pullProfileFromCloud();
      if (cancelled) return;
      const p = cloud ?? loadProfile();
      if (!p || !p.name) {
        navigate({ to: "/comecar" });
        return;
      }
      setProfile(p);
    };
    init();
    return () => { cancelled = true; };
  }, [navigate]);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-background touch-none select-none">
      {/* HUD Header - Floating Back Button */}
      <div className="absolute left-6 top-6 z-[60]">
        <Link
          to="/app"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/20 shadow-xl backdrop-blur-xl transition-all active:scale-90 hover:bg-white/30"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" strokeWidth={3} />
        </Link>
      </div>

      <div className="flex-1">
        <MascotRoom profile={profile} />
      </div>
    </div>
  );
}
