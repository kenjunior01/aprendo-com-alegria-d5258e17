import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Sparkles, Zap } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import type { MascotId } from "@/lib/mascots";
import { getMascot } from "@/lib/mascots";
import { haptic } from "@/lib/haptics";
import { isMuted } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { computeMascotEnergy } from "@/lib/mascotEnergy";
import type { Profile } from "@/lib/storage";

interface Props {
  mascotId: MascotId;
  equippedItemId?: string | null;
  className?: string;
  /** Quando passado, mostra a Energia da Mascote (derivada do progresso). */
  profile?: Pick<Profile, "xp" | "streak" | "lastPlayed" | "completedLessons">;
}

const TAP_PHRASES = [
  "Estás a ir muito bem! ✨",
  "Vamos aprender mais?",
  "Boa! Continua assim!",
  "Olá amiguinho! 👋",
  "Tu consegues!",
  "Que orgulho de ti!",
];

// Pitch shift via playbackRate on a recorded blob (leve, sem libs externas)
export function MascotVoiceTutor({ mascotId, equippedItemId, className }: Props) {
  const m = getMascot(mascotId);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(0); // 0..1 mic volume
  const [bubble, setBubble] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const acRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (acRef.current && acRef.current.state !== "closed") {
      acRef.current.close().catch(() => {});
    }
    acRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  };

  useEffect(() => () => stopAll(), []);

  const showBubble = (text: string, ms = 2400) => {
    setBubble(text);
    window.setTimeout(() => setBubble((b) => (b === text ? null : b)), ms);
  };

  const onMascotTap = () => {
    haptic("tap");
    const phrase = TAP_PHRASES[Math.floor(Math.random() * TAP_PHRASES.length)];
    showBubble(phrase);
    // micro speech — usa a voz do dispositivo se não estiver muted
    if (!isMuted() && typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const u = new SpeechSynthesisUtterance(phrase.replace(/[^\p{L}\p{N}\s!?.,]/gu, ""));
        u.lang = "pt-PT";
        u.pitch = 1.4;
        u.rate = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch { /* noop */ }
    }
  };

  const startRecording = async () => {
    setError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microfone não disponível neste browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ac: AudioContext = new AC();
      acRef.current = ac;
      const source = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 3));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = 1.55; // efeito "Talking Tom" — agudo + rápido
        audio.preservesPitch = false;
        (audio as any).mozPreservesPitch = false;
        (audio as any).webkitPreservesPitch = false;
        audioElRef.current = audio;
        setPlaying(true);
        showBubble("A repetir o que disseste! 🎤", 1800);
        audio.onended = () => {
          setPlaying(false);
          URL.revokeObjectURL(url);
        };
        audio.play().catch(() => setPlaying(false));
      };
      mediaRecRef.current = rec;
      rec.start();
      setRecording(true);
      haptic("tap");
    } catch (e) {
      setError(e instanceof Error && e.name === "NotAllowedError" ? "Permite o microfone para a mascote falar." : "Não consegui aceder ao microfone.");
    }
  };

  const stopRecording = () => {
    try { mediaRecRef.current?.stop(); } catch { /* noop */ }
    setRecording(false);
    stopAll();
    haptic("success");
  };

  const toggle = () => (recording ? stopRecording() : startRecording());

  const scale = playing ? 1.08 + Math.sin(Date.now() / 90) * 0.04 : 1 + level * 0.18;

  return (
    <div className={cn("relative flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <motion.button
          type="button"
          onClick={onMascotTap}
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 220, damping: 12 }}
          whileTap={{ scale: 0.92 }}
          className="rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          aria-label={`Tocar na mascote ${m.name}`}
        >
          <Mascot id={mascotId} size="lg" equippedItemId={equippedItemId} />
        </motion.button>

        {/* halo when listening */}
        {recording && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.6 + level }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="pointer-events-none absolute inset-0 rounded-full border-4 border-primary/60"
          />
        )}

        <AnimatePresence>
          {bubble && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-2xl border-2 border-border bg-card px-3 py-2 text-sm font-medium shadow-md"
            >
              {bubble}
              <span className="absolute left-1/2 top-full -translate-x-1/2 -mt-px h-3 w-3 rotate-45 border-b-2 border-r-2 border-border bg-card" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-full border-2 border-border px-5 font-display text-sm shadow-sm transition-transform active:scale-95",
            recording ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground",
          )}
          aria-pressed={recording}
        >
          {recording ? <><Square className="h-4 w-4" /> Parar</> : <><Mic className="h-4 w-4" /> Fala com o {m.name}</>}
        </button>
        {playing && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3" /> A falar…
          </span>
        )}
      </div>

      {error && <p className="text-center text-xs text-destructive">{error}</p>}
      <p className="text-center text-[11px] text-muted-foreground">
        🔒 O áudio fica no teu dispositivo — nada é guardado.
      </p>
    </div>
  );
}
