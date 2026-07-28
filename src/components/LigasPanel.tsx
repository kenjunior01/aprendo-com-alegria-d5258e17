import { Trophy } from "lucide-react";

export function LigasPanel({ ageGroup = "mixed" }: { ageGroup?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
      <Trophy className="h-12 w-12 text-amber-400" />
      <h3 className="font-display text-2xl font-bold text-amber-800">Ligas Semanais</h3>
      <p className="text-sm text-amber-600">Em breve! Compete com outros campeões.</p>
      <span className="text-xs text-amber-500/60">Escalão: {ageGroup}</span>
    </div>
  );
}
