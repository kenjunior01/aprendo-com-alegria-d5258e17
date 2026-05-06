import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { loadProfile, pullProfileFromCloud, resetProfile, updateProfile, type Profile } from "@/lib/storage";
import { totalMissions } from "@/lib/chapters";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ParentLinkPanel } from "@/components/ParentLinkPanel";
import { Cloud, CloudOff, LogOut } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Lusis" },
      { name: "description", content: "Vê o teu progresso e troca de mascote." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useAuth();

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

  const total = totalMissions();
  const completed = profile.completedLessons.length;

  const changeMascot = (id: MascotId) => {
    setProfile(updateProfile({ mascot: id }));
  };

  const changeGrade = (g: number) => {
    setProfile(updateProfile({ grade: g }));
  };

  const reset = () => {
    if (confirm("Tens a certeza que queres recomeçar? Perdes todo o progresso (apenas neste dispositivo).")) {
      resetProfile();
      navigate({ to: "/" });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 md:pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <div className="card-chunky rounded-3xl border border-border bg-card p-5 text-center sm:p-6">
          <Mascot id={profile.mascot} size="xl" bouncing equippedItemId={profile.equippedItem} />
          <h1 className="mt-2 font-display text-2xl sm:text-3xl">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.age} anos · {profile.grade}.º ano</p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <Box label="🔥 Sequência" value={`${profile.streak}d`} />
            <Box label="⭐ XP" value={`${profile.xp}`} />
            <Box label="🪙 Moedas" value={`${profile.coins}`} />
            <Box label="📘 Missões" value={`${completed}/${total}`} />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {user ? (
              <>
                <Cloud className="h-4 w-4 text-success" />
                <span>Sincronizado · {user.email}</span>
              </>
            ) : (
              <>
                <CloudOff className="h-4 w-4" />
                <span>Apenas neste dispositivo</span>
              </>
            )}
          </div>

          {!user && (
            <Link to="/auth" className="mt-3 inline-block">
              <ChunkyButton tone="secondary" className="text-sm">☁️ Guardar na cloud</ChunkyButton>
            </Link>
          )}
        </div>

        {/* Grade selector */}
        <section className="mt-6 sm:mt-8">
          <h2 className="mb-3 font-display text-xl sm:text-2xl">Ano escolar</h2>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                onClick={() => changeGrade(g)}
                className={`card-chunky rounded-2xl border-2 bg-card py-3 font-display text-sm transition-transform active:scale-95 ${
                  profile.grade === g ? "border-primary bg-accent text-accent-foreground" : "border-border"
                }`}
              >
                {g}.º ano
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 sm:mt-8">
          <h2 className="mb-3 font-display text-xl sm:text-2xl">Mudar de mascote</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MASCOTS.map((m) => (
              <button
                key={m.id}
                onClick={() => changeMascot(m.id)}
                className={`card-chunky rounded-2xl border-2 bg-card p-2 transition-transform active:scale-95 ${
                  profile.mascot === m.id ? "border-primary ring-4 ring-primary/30" : "border-border"
                }`}
              >
                <Mascot id={m.id} size="sm" equippedItemId={profile.mascot === m.id ? profile.equippedItem : null} />
                <p className="mt-1 text-center font-display text-xs sm:text-sm">{m.name}</p>
              </button>
            ))}
          </div>
        </section>

        {user && (
          <section className="mt-6 sm:mt-8">
            <ParentLinkPanel profile={profile} />
          </section>
        )}

        <section className="mt-8 flex flex-col gap-3">
          <Link to="/app">
            <ChunkyButton className="w-full">← Voltar à aventura</ChunkyButton>
          </Link>
          <Link to="/leitura">
            <ChunkyButton tone="secondary" className="w-full">🎤 Praticar leitura em voz</ChunkyButton>
          </Link>
          <Link to="/ra">
            <ChunkyButton tone="secondary" className="w-full">🥽 Mascote em Realidade Aumentada</ChunkyButton>
          </Link>
          <Link to="/conquistas">
            <ChunkyButton tone="secondary" className="w-full">🏆 Ver conquistas</ChunkyButton>
          </Link>
          <Link to="/loja">
            <ChunkyButton tone="secondary" className="w-full">🛍️ Ir à loja</ChunkyButton>
          </Link>
          <Link to="/premium">
            <ChunkyButton tone="primary" className="w-full">{profile.isPremium ? "💎 Gerir Premium" : "💎 Conhecer o Premium"}</ChunkyButton>
          </Link>
          {user && (
            <ChunkyButton tone="ghost" onClick={signOut} className="w-full">
              <LogOut className="mr-1 h-4 w-4" /> Sair da conta
            </ChunkyButton>
          )}
          <ChunkyButton tone="danger" onClick={reset} className="w-full">Recomeçar progresso</ChunkyButton>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-2 py-3 sm:px-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
      <p className="mt-0.5 font-display text-lg sm:text-2xl">{value}</p>
    </div>
  );
}
