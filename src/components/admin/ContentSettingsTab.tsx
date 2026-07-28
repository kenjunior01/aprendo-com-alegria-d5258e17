// Aba do Admin: ativar/desativar matérias e jogos por idade + ajustar nº de perguntas trivia.
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContentSettings } from "@/hooks/useContentSettings";
import { SUBJECTS } from "@/lib/curriculum";
import { GAMES } from "@/lib/junior";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

const TRIVIA_CATEGORIES = [
  "general","books","film","music","science","computers","math",
  "mythology","sports","geography","history","animals","vehicles",
];

export function ContentSettingsTab() {
  const { settings, save, loading, reload } = useContentSettings();
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(settings); }, [settings]);

  const setSubj = (id: string, patch: any) => setDraft({
    ...draft,
    subjects: { ...draft.subjects, [id]: { ...{ enabled: true, minAge: 6, maxAge: 12 }, ...draft.subjects[id], ...patch } },
  });
  const setGame = (id: string, patch: any) => setDraft({
    ...draft,
    games: { ...draft.games, [id]: { ...{ enabled: true, minAge: 2, maxAge: 12 }, ...draft.games[id], ...patch } },
  });
  const setCount = (cat: string, n: number) => setDraft({
    ...draft, triviaCounts: { ...draft.triviaCounts, [cat]: n },
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await save(draft);
    setSaving(false);
    if (error) toast.error("Erro a guardar: " + error.message);
    else toast.success("Definições guardadas ✅");
  };

  if (loading) return <div className="p-6 text-center"><Loader2 className="mx-auto animate-spin"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Conteúdo & Idades</h2>
          <p className="text-sm text-muted-foreground">Ativa/desativa matérias e jogos por faixa etária; ajusta perguntas por categoria.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reload}>Recarregar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
            Guardar
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="font-display text-lg">Matérias do currículo</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {SUBJECTS.map(s => {
            const v = draft.subjects[s.id] ?? { enabled: true, minAge: 6, maxAge: 12 };
            return (
              <div key={s.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display">{s.emoji} {s.name}</div>
                  <Switch checked={v.enabled} onCheckedChange={(c)=>setSubj(s.id,{enabled:c})}/>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Idade min.</Label>
                    <Input type="number" min={2} max={18} value={v.minAge}
                      onChange={e=>setSubj(s.id,{minAge:Number(e.target.value)})}/>
                  </div>
                  <div>
                    <Label className="text-xs">Idade máx.</Label>
                    <Input type="number" min={2} max={18} value={v.maxAge}
                      onChange={e=>setSubj(s.id,{maxAge:Number(e.target.value)})}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-display text-lg">Jogos Júnior</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {GAMES.map(g => {
            const v = draft.games[g.id] ?? { enabled: true, minAge: 2, maxAge: 12 };
            return (
              <div key={g.id} className="rounded-xl border p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{g.emoji} {g.title} <span className="text-xs text-muted-foreground">({g.age})</span></span>
                  <Switch checked={v.enabled} onCheckedChange={(c)=>setGame(g.id,{enabled:c})}/>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <Input type="number" min={2} max={18} value={v.minAge} className="h-7 text-xs"
                    onChange={e=>setGame(g.id,{minAge:Number(e.target.value)})}/>
                  <Input type="number" min={2} max={18} value={v.maxAge} className="h-7 text-xs"
                    onChange={e=>setGame(g.id,{maxAge:Number(e.target.value)})}/>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-display text-lg">Perguntas de Trivia por categoria</h3>
        <p className="text-xs text-muted-foreground">Quantas perguntas pedir por sessão (5–50). A primeira chamada vai à Open Trivia DB e fica em cache 7 dias.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 md:grid-cols-4">
          {TRIVIA_CATEGORIES.map(cat => (
            <div key={cat}>
              <Label className="text-xs capitalize">{cat}</Label>
              <Input type="number" min={5} max={50} value={draft.triviaCounts[cat] ?? 10}
                onChange={e=>setCount(cat, Number(e.target.value))}/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
