import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import { Mascot } from "@/components/Mascot";
import { createChildProfile } from "@/lib/parent.functions";

interface Props {
  onCreated: (info: { childId: string; name: string }) => void;
  onClose?: () => void;
}

export function QuickChildSignup({ onCreated, onClose }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(7);
  const [mascot, setMascot] = useState<MascotId>("fox");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grade = Math.max(1, Math.min(7, age - 5));

  const submit = async () => {
    setError(null);
    if (!name.trim()) { setError("Escreve o nome da criança."); return; }
    setBusy(true);
    try {
      const r = await createChildProfile({ data: { name: name.trim(), age, mascot, grade } });
      onCreated({ childId: r.childId, name: r.name });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro a criar perfil.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="card-chunky relative rounded-3xl border-2 border-border bg-gradient-to-br from-secondary/30 to-card p-5"
    >
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
      )}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg">Criar perfil da criança</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Sem email nem palavra-passe — gerimos a conta por ti. Demora 10 segundos.
      </p>

      <label className="mt-4 block">
        <span className="font-display text-sm">Nome</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder="Ex: Mariana"
          autoFocus
          className="mt-1 w-full rounded-xl border-2 border-border bg-card px-3 py-3 font-display text-lg outline-none focus:border-primary"
        />
      </label>

      <label className="mt-3 block">
        <span className="font-display text-sm">Idade ({grade}.º ano)</span>
        <input
          type="range" min={3} max={16} value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
        <div className="mt-1 text-center font-display text-2xl">{age} anos</div>
      </label>

      <div className="mt-3">
        <span className="font-display text-sm">Mascote</span>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {MASCOTS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMascot(m.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-colors ${
                mascot === m.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
              }`}
            >
              <Mascot id={m.id} size="md" />
              <span className="text-[10px] font-display">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 rounded-xl bg-destructive/10 p-2 text-center text-sm text-destructive">{error}</p>}

      <ChunkyButton onClick={submit} disabled={busy} className="mt-4 w-full">
        {busy ? "A criar…" : "Criar perfil ✨"}
      </ChunkyButton>
    </motion.div>
  );
}
