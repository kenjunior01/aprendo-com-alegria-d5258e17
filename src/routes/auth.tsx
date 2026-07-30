import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { pullProfileFromCloud, pushFullProfile } from "@/lib/storage";
import { Mail, Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Alegria" },
      { name: "description", content: "Entra na tua conta para guardar o teu progresso em todos os dispositivos." },
      { property: "og:title", content: 'Entrar — Alegria' },
      { property: "og:description", content: 'Entra na tua conta para guardar o teu progresso em todos os dispositivos.' },
      { property: "og:url", content: "https://alegria.online/auth" },
    ],
    links: [
      { rel: "canonical", href: "https://alegria.online/auth" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { name: name.trim() || email.split("@")[0] },
          },
        });
        if (err) throw err;
        await pushFullProfile();
        await pullProfileFromCloud();
        navigate({ to: "/app" });
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await pullProfileFromCloud();
        navigate({ to: "/app" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo correu mal";
      // mensagens amigáveis
      if (msg.includes("Invalid login")) setError("Email ou palavra-passe incorretos.");
      else if (msg.includes("already registered")) setError("Este email já está registado. Tenta entrar.");
      else if (msg.includes("Password")) setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) {
        setError(`Não foi possível entrar com ${provider === "google" ? "Google" : "Apple"}. Tenta outra vez.`);
        return;
      }
      if (result.redirected) return;
      await pullProfileFromCloud();
      navigate({ to: "/app" });
    } catch {
      setError(`Não foi possível entrar com ${provider === "google" ? "Google" : "Apple"}.`);
    }
  };

  return (
    <main className="bg-paper relative min-h-[100dvh] overflow-hidden px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <AlegriaLogo priority className="mb-2 h-14 w-auto" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Mascot id="owl" size="lg" bouncing />
        </motion.div>
        <h1 className="mt-2 text-center font-display text-3xl">
          {mode === "signup" ? "Cria a tua conta" : "Bem-vindo de volta!"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Guarda o teu progresso em todos os dispositivos.
        </p>

        <div className="card-chunky mt-6 w-full rounded-3xl border border-border bg-card p-5">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="btn-chunky flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card px-5 py-3.5 font-display text-base font-semibold transition-transform hover:-translate-y-0.5"
          >
            <GoogleIcon />
            Continuar com Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            className="btn-chunky mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-foreground px-5 py-3.5 font-display text-base font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            <AppleIcon />
            Continuar com Apple
          </button>

          <div className="my-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <Field
                label="Nome (opcional)"
                value={name}
                onChange={setName}
                placeholder="Como te chamas?"
                type="text"
              />
            )}
            <Field
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={setEmail}
              placeholder="email@exemplo.com"
              type="email"
              required
              autoComplete="email"
            />
            <Field
              label="Palavra-passe"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <ChunkyButton type="submit" disabled={loading} className="w-full">
              {loading ? "Aguarda…" : mode === "signup" ? "Criar conta 🎉" : "Entrar →"}
            </ChunkyButton>
          </form>

          <p className="mt-4 text-center text-sm">
            {mode === "signup" ? "Já tens conta? " : "Ainda não tens conta? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError(null);
              }}
              className="font-display font-semibold text-primary underline"
            >
              {mode === "signup" ? "Entrar" : "Criar agora"}
            </button>
          </p>
        </div>

        <Link to="/app" className="mt-5 text-sm text-muted-foreground underline">
          Continuar sem conta
        </Link>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

function Field({ label, icon, value, onChange, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 focus-within:border-primary">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM256.6 100.5c25.7-30.5 23.4-58.3 22.6-68.5-22.7 1.3-49 15.4-64 32.8-16.5 18.6-26.2 41.6-24.1 67.9 24.5 1.9 46.9-10.7 65.5-32.2z"/>
    </svg>
  );
}
