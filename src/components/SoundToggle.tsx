import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted } from "@/lib/audio";

export function SoundToggle({ className = "" }: { className?: string }) {
  const [muted, setMutedState] = useState(() => isMuted());
  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Ativar som" : "Desligar som"}
      title={muted ? "Ativar som" : "Desligar som"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform active:scale-90 ${className}`}
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
