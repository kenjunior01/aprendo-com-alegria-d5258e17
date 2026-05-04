import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { loadProfile, resetProfile, updateProfile, type Profile } from "@/lib/storage";
import { SUBJECTS } from "@/lib/curriculum";

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

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.name) {
      navigate({ to: "/comecar" });
      return;
    }
    setProfile(p);
  }, [navigate]);

  if (!profile) return null;

  const totalLessons = SUBJECTS.reduce((s, sub) => s + sub.lessons.length, 0);
  const completed = profile.completedLessons.length;

  const changeMascot = (id: MascotId) => {
    setProfile(updateProfile({ mascot: id }));
  };

  const reset = () => {
    if (confirm("Tens a certeza que queres recomeçar? Perdes todo o progresso.")) {
      resetProfile();
      navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <TopBar profile={profile} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="card-chunky rounded-3xl border border-border bg-card p-6 text-center">
          <Mascot id={profile.mascot} size="xl" bouncing />
          <h1 className="mt-2 font-display text-3xl">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.age} anos</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Box label="🔥 Sequência" value={`${profile.streak}d`} />
            <Box label="⭐ XP" value={`${profile.xp}`} />
            <Box label="📘 Lições" value={`${completed}/${totalLessons}`} />
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-display text-2xl">Mudar de mascote</h2>
          <div className="grid grid-cols-4 gap-3">
            {MASCOTS.map((m) => (
              <button
                key={m.id}
                onClick={() => changeMascot(m.id)}
                className={`card-chunky rounded-2xl border-2 bg-card p-2 transition-transform hover:-translate-y-0.5 ${
                  profile.mascot === m.id ? "border-primary ring-4 ring-primary/30" : "border-border"
                }`}
              >
                <Mascot id={m.id} size="sm" />
                <p className="mt-1 text-center font-display text-xs">{m.name}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/app" className="flex-1">
            <ChunkyButton className="w-full">← Voltar à jornada</ChunkyButton>
          </Link>
          <ChunkyButton tone="danger" onClick={reset}>Recomeçar</ChunkyButton>
        </section>
      </main>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
