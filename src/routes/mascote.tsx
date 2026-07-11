import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MascotRoom } from "@/components/MascotRoom";
import { loadProfile, pullProfileFromCloud, type Profile } from "@/lib/storage";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/mascote")({
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
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with back button */}
      <div className="absolute left-4 top-4 z-10">
        <Link
          to="/app"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 shadow-md backdrop-blur-sm transition-transform active:scale-90"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <MascotRoom profile={profile} />
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
