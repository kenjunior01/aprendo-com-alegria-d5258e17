import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Trash2 } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { ChunkyButton } from "@/components/ChunkyButton";
import { MASCOTS, type MascotId } from "@/lib/mascots";
import {
  listJuniorChildren, addJuniorChild, removeJuniorChild,
  getActiveJuniorChildId, setActiveJuniorChild,
  type JuniorChild,
} from "@/lib/junior";
import { scheduleJuniorCloudPush } from "@/lib/juniorCloud";

interface Props {
  onChange?: (childId: string | null) => void;
}

export function JuniorChildSwitcher({ onChange }: Props) {
  const [children, setChildren] = useState<JuniorChild[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState(4);
  const [mascot, setMascot] = useState<MascotId>("fox");

  useEffect(() => {
    const list = listJuniorChildren();
    setChildren(list);
    const a = getActiveJuniorChildId();
    setActiveId(a);
    if (list.length === 0) setCreating(true);
  }, []);

  const refresh = () => {
    const list = listJuniorChildren();
    setChildren(list);
    const a = getActiveJuniorChildId();
    setActiveId(a);
    onChange?.(a);
  };

  const select = (id: string) => {
    setActiveJuniorChild(id);
    setActiveId(id);
    onChange?.(id);
  };

  const create = () => {
    if (!name.trim()) return;
    const c = addJuniorChild({ name, age, mascot });
    setName(""); setAge(4); setMascot("fox");
    setCreating(false);
    setActiveId(c.id);
    refresh();
  };

  const remove = (id: string) => {
    if (!confirm("Remover este perfil e o seu progresso?")) return;
    removeJuniorChild(id);
    refresh();
  };

  return (
    <section className="card-chunky rounded-3xl border-2 border-border bg-card/80 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg">👧 Quem está a brincar?</h3>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="touch-target inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-display text-primary"
          >
            <Plus className="h-4 w-4" /> Novo perfil
          </button>
        )}
      </div>

      {children.length > 0 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {children.map((c) => {
            const active = c.id === activeId;
            return (
              <motion.button
                key={c.id}
                onClick={() => select(c.id)}
                whileTap={{ scale: 0.96 }}
                className={`relative shrink-0 rounded-3xl border-2 p-3 text-center transition-colors ${
                  active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
                }`}
                style={{ minWidth: 110 }}
              >
                {active && (
                  <span className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <Mascot id={c.mascot} size="md" />
                <p className="mt-1 font-display text-sm leading-tight">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.age} anos</p>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); remove(c.id); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); remove(c.id); } }}
                  className="absolute -left-1 -top-1 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
                  aria-label="Remover perfil"
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {creating && (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-card p-4">
          <p className="font-display text-sm">Criar perfil júnior</p>
          <label className="mt-3 block">
            <span className="text-xs text-muted-foreground">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="Ex: Tomás"
              className="mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2 font-display outline-none focus:border-primary"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs text-muted-foreground">Idade: {age} anos</span>
            <input type="range" min={2} max={5} value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-1 w-full accent-primary" />
          </label>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">Mascote</span>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {MASCOTS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMascot(m.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 ${
                    mascot === m.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <Mascot id={m.id} size="sm" />
                  <span className="text-[10px] font-display">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <ChunkyButton onClick={create} className="flex-1">Criar ✨</ChunkyButton>
            {children.length > 0 && (
              <ChunkyButton tone="ghost" onClick={() => setCreating(false)}>Cancelar</ChunkyButton>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
