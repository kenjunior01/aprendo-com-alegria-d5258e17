import { useEffect, useRef, useState } from "react";
import { Moon, Hourglass } from "lucide-react";
import { loadProfile, pullProfileFromCloud } from "@/lib/storage";
import { addUsageSeconds, isBedtime, isOverLimit, getTodayMinutes } from "@/lib/usageTracker";
import { ChunkyButton } from "./ChunkyButton";
import { ParentGate } from "./ParentGate";

/**
 * Tracks active app usage and enforces parental time-limits and bedtime.
 * Renders a blocking overlay when limits are hit; parents can unlock via the
 * standard parent gate. Pulls fresh profile from cloud periodically so changes
 * made by a parent on another device propagate to the child's device.
 */
export function UsageGuard() {
  const [profile, setProfile] = useState(typeof window !== "undefined" ? loadProfile() : null);
  const [tick, setTick] = useState(0);
  const [overrideUntil, setOverrideUntil] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const lastActiveRef = useRef<number>(Date.now());

  // Refresh profile: cheap local read every 30s, full cloud pull every 5 min.
  useEffect(() => {
    const localId = setInterval(() => setProfile(loadProfile()), 30_000);
    const cloudId = setInterval(() => {
      void pullProfileFromCloud().then((p) => { if (p) setProfile(p); });
    }, 5 * 60_000);
    // Initial cloud sync shortly after mount
    const t = setTimeout(() => { void pullProfileFromCloud().then((p) => { if (p) setProfile(p); }); }, 1500);
    return () => { clearInterval(localId); clearInterval(cloudId); clearTimeout(t); };
  }, []);

  // Heartbeat: every 15s, if document is visible, count usage and re-render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const heartbeat = () => {
      const now = Date.now();
      if (document.visibilityState === "visible") {
        const delta = Math.min(20, (now - lastActiveRef.current) / 1000);
        addUsageSeconds(delta);
      }
      lastActiveRef.current = now;
      setTick((t) => t + 1);
    };
    const id = setInterval(heartbeat, 15_000);
    const onVis = () => { lastActiveRef.current = Date.now(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  if (!profile || profile.role !== "child") return null;
  void tick; // re-render

  const bed = isBedtime(profile.bedtimeHour);
  const over = isOverLimit(profile.dailyLimitMin);
  const blocked = (bed || over) && Date.now() > overrideUntil;
  if (!blocked) return null;

  if (showGate) {
    return (
      <ParentGate
        expectedPin={profile.parentPin ?? null}
        onPass={() => { setOverrideUntil(Date.now() + 15 * 60_000); setShowGate(false); }}
        onCancel={() => setShowGate(false)}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={bed ? "Hora de descansar" : "Tempo de hoje terminou"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6 text-center backdrop-blur"
    >
      <div className="card-chunky w-full max-w-[24rem] rounded-3xl border-2 border-border bg-card p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          {bed ? <Moon className="h-8 w-8" /> : <Hourglass className="h-8 w-8" />}
        </div>
        <h2 className="mt-4 font-display text-2xl">
          {bed ? "Hora de descansar 😴" : "Tempo de hoje terminou ⏰"}
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          {bed
            ? "Os teus pais pediram para parares de jogar a esta hora. Vemo-nos amanhã!"
            : `Já estudaste ${getTodayMinutes()} minutos hoje. Bom trabalho!`}
        </p>
        <ChunkyButton tone="ghost" onClick={() => setShowGate(true)} className="mt-5 w-full">
          Adulto a desbloquear
        </ChunkyButton>
      </div>
    </div>
  );
}
