import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bird, Trophy } from "lucide-react";
import type { Profile } from "@/lib/storage";
import { getNextMission } from "@/lib/nextMission";
import { getMascot } from "@/lib/mascots";
import { haptic } from "@/lib/haptics";
import { playCorrect, playTap } from "@/lib/audio";
import { getRandomFact } from "@/lib/funFacts";
import { getMozambiqueFact } from "@/lib/region";
import { cn } from "@/lib/utils";

/**
 * Sala de Aula Mágica — cenário vivo estilo "My Talking Tom" × Duolingo.
 * A sala reage à hora real do dia, tem objetos interativos e
 * todas as animações usam apenas transform/opacity (performance APK).
 */

type DayPhase = "dawn" | "day" | "sunset" | "night";

interface Palette {
  wallTop: string;
  wallBottom: string;
  floor: string;
  sky: string;
  orb: string;
  orbGlow: string;
  isNight: boolean;
}

const PALETTES: Record<DayPhase, Palette> = {
  dawn: {
    wallTop: "#fdebd9",
    wallBottom: "#f6d3ae",
    floor: "#b97b4b",
    sky: "linear-gradient(180deg,#ff9e6d 0%,#ffd3a3 55%,#bfe3f5 100%)",
    orb: "#ffd166",
    orbGlow: "#ffb703",
    isNight: false,
  },
  day: {
    wallTop: "#eef6fc",
    wallBottom: "#d5e9f7",
    floor: "#c98a55",
    sky: "linear-gradient(180deg,#6ec3f0 0%,#aadcf7 60%,#e3f4fd 100%)",
    orb: "#ffd93b",
    orbGlow: "#ffe27a",
    isNight: false,
  },
  sunset: {
    wallTop: "#fbe3d0",
    wallBottom: "#efbf9f",
    floor: "#a86a3d",
    sky: "linear-gradient(180deg,#ff8f5e 0%,#ffb27a 45%,#b7a6e0 100%)",
    orb: "#ff9e4f",
    orbGlow: "#ff7b39",
    isNight: false,
  },
  night: {
    wallTop: "#2e3560",
    wallBottom: "#3c4370",
    floor: "#5d4630",
    sky: "linear-gradient(180deg,#141b3d 0%,#2a3670 60%,#43518c 100%)",
    orb: "#eef3ff",
    orbGlow: "#c9d6ff",
    isNight: true,
  },
};

function getPhase(hour: number): DayPhase {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "sunset";
  return "night";
}

const FLAG_COLORS = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#f78c6b"];

const BOOKS = [
  { to: "/aprender/portugues", label: "Português", short: "P", color: "#e05252" },
  { to: "/aprender/matematica", label: "Matemática", short: "M", color: "#4a7fe0" },
  { to: "/aprender/estudo-do-meio", label: "Estudo do Meio", short: "E", color: "#3fa66a" },
  { to: "/leitura", label: "Leitura", short: "L", color: "#f0b429" },
] as const;

interface Props {
  profile: Profile;
}

/**
 * Camada com parallax — desloca-se suavemente conforme o ponteiro (desktop)
 * ou o giroscópio (telemóvel). Depth = sensação de profundidade em px.
 */
function ParallaxLayer({
  depth,
  sx,
  sy,
  className,
  children,
}: {
  depth: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  className?: string;
  children: ReactNode;
}) {
  const x = useTransform(sx, (v) => v * depth);
  const y = useTransform(sy, (v) => v * depth * 0.55);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

export function ClassroomScene({ profile }: Props) {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [lampOn, setLampOn] = useState(false);
  const [spin, setSpin] = useState(0);

  const mascot = getMascot(profile.mascot);
  const next = useMemo(
    () => getNextMission(profile.completedLessons, profile.grade),
    [profile.completedLessons, profile.grade],
  );

  // Relógio real: atualiza a cada 30 s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Candil acende sozinho à noite
  useEffect(() => {
    if (PALETTES[getPhase(new Date().getHours())].isNight) setLampOn(true);
  }, []);

  // ── Parallax imersivo: ponteiro (desktop) + giroscópio (telemóvel) ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const psx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.7 });
  const psy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.7 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const DOE = window.DeviceOrientationEvent as unknown as
      | {
          requestPermission?: () => Promise<string>;
        }
      | undefined;
    let enabled = false;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      mx.set(Math.max(-1, Math.min(1, e.gamma / 22)));
      my.set(Math.max(-1, Math.min(1, (e.beta - 45) / 26)));
    };
    const enable = () => {
      if (enabled) return;
      if (typeof DOE?.requestPermission === "function") {
        // iOS exige pedido por gesto — falha silenciosamente se negado
        DOE.requestPermission()
          .then((r) => {
            if (r === "granted") {
              enabled = true;
              window.addEventListener("deviceorientation", onOrient, true);
            }
          })
          .catch(() => {});
      } else {
        enabled = true;
        window.addEventListener("deviceorientation", onOrient, true);
      }
    };
    window.addEventListener("pointerdown", enable, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("deviceorientation", onOrient, true);
    };
  }, [mx, my]);

  const phase = getPhase(now.getHours());
  const p = PALETTES[phase];
  const minDeg = now.getMinutes() * 6;
  const hrDeg = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;

  const openNextMission = () => {
    haptic("tap");
    playTap();
    if (next) {
      navigate({
        to: "/licao/$subjectId/$lessonId",
        params: { subjectId: next.mission.subjectId, lessonId: next.mission.lessonId },
        search: {},
      });
    } else {
      navigate({ to: "/app" });
    }
  };

  const openBook = (to: (typeof BOOKS)[number]["to"]) => {
    haptic("tap");
    playTap();
    navigate({ to });
  };

  const spinGlobe = () => {
    haptic("tap");
    playCorrect();
    setSpin((s) => s + 1);
    const fact = profile.region === "MZ" ? getMozambiqueFact() : getRandomFact();
    toast(fact, { icon: "🌍", duration: 5000 });
  };

  const toggleLamp = () => {
    haptic("tap");
    playTap();
    setLampOn((v) => !v);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* ═══ Parede ═══ */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ background: `linear-gradient(180deg, ${p.wallTop} 0%, ${p.wallBottom} 100%)` }}
      />
      {/* Lambril (wainscot) */}
      <div
        className="absolute inset-x-0 bottom-[24%] h-[10%] border-t-4 border-white/60 bg-white/35"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0 10px, transparent 10px 36px)",
        }}
      />
      {/* Chão de madeira */}
      <div
        className="absolute inset-x-0 bottom-0 h-[24%]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.09) 0 2px, transparent 2px 52px), linear-gradient(180deg, ${p.floor} 0%, color-mix(in oklab, ${p.floor} 70%, black) 100%)`,
        }}
      />
      {/* Rodapé */}
      <div className="absolute inset-x-0 bottom-[24%] h-2.5 bg-white/75 shadow-sm" />

      {/* ═══ Bandeirinhas ═══ */}
      <ParallaxLayer depth={4} sx={psx} sy={psy} className="absolute inset-x-0 top-0">
        <div className="border-t-[3px] border-amber-800/50">
          <div className="flex justify-between px-[4%]">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "mt-0 h-0 w-0 border-x-[11px] border-t-[18px] border-x-transparent scene-flag-wave",
                )}
                style={{
                  borderTopColor: FLAG_COLORS[i % FLAG_COLORS.length],
                  animationDelay: `${i * 0.22}s`,
                }}
              />
            ))}
          </div>
        </div>
      </ParallaxLayer>

      {/* ═══ Janela com céu real ═══ */}
      <ParallaxLayer
        depth={14}
        sx={psx}
        sy={psy}
        className="absolute left-[3%] top-[8%] h-[34%] w-[21%] min-w-[96px] max-w-[190px] sm:left-[5%] sm:top-[9%]"
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-lg border-[6px] border-white/95 shadow-xl"
          style={{ background: p.sky }}
        >
          {/* Sol / Lua */}
          {p.isNight ? (
            <div className="absolute right-[12%] top-[10%]">
              <div
                className="h-7 w-7 rounded-full bg-[#f4f6ff]"
                style={{
                  boxShadow: "inset -7px 3px 0 0 #b9c4e8, 0 0 14px 4px rgba(233,240,255,0.45)",
                }}
              />
            </div>
          ) : (
            <div
              className="absolute right-[12%] top-[10%] h-8 w-8 rounded-full"
              style={{ background: p.orb, boxShadow: `0 0 18px 6px ${p.orbGlow}` }}
            />
          )}
          {/* Estrelas (só à noite) */}
          {p.isNight &&
            [
              { l: "18%", t: "14%", d: "0s" },
              { l: "42%", t: "8%", d: "0.7s" },
              { l: "64%", t: "30%", d: "1.3s" },
              { l: "26%", t: "44%", d: "1.9s" },
              { l: "78%", t: "52%", d: "0.4s" },
            ].map((s, i) => (
              <span
                key={i}
                className="scene-twinkle absolute h-1 w-1 rounded-full bg-white"
                style={{ left: s.l, top: s.t, animationDelay: s.d }}
              />
            ))}
          {/* Nuvens à deriva */}
          {!p.isNight && (
            <>
              <div
                className="scene-drift-x absolute top-[22%]"
                style={{ "--dur": "34s", animationDelay: "-6s" } as CSSProperties}
              >
                <div className="relative h-4 w-14 rounded-full bg-white/90">
                  <div className="absolute -top-2 left-3 h-5 w-5 rounded-full bg-white/90" />
                </div>
              </div>
              <div
                className="scene-drift-x absolute top-[52%] opacity-80"
                style={{ "--dur": "48s", animationDelay: "-28s" } as CSSProperties}
              >
                <div className="h-3 w-10 rounded-full bg-white/80" />
              </div>
            </>
          )}
          {/* Passarinho (dia) */}
          {!p.isNight && (
            <Bird
              className="scene-bird absolute top-[36%] h-4 w-4 text-slate-700"
              style={{ animationDelay: "3.5s" }}
            />
          )}
          {/* Barras da janela */}
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-white/95" />
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-white/95" />
        </div>
        {/* Peitoril */}
        <div className="absolute -bottom-2 -ml-[7%] h-2.5 w-[114%] rounded bg-white/95 shadow" />
        {/* Cortinas */}
        <div className="absolute -left-2 -top-1 h-[104%] w-3.5 rounded-b-full bg-rose-300/85 shadow-sm" />
        <div className="absolute -right-2 -top-1 h-[104%] w-3.5 rounded-b-full bg-rose-300/85 shadow-sm" />
      </ParallaxLayer>

      {/* ═══ Relógio de parede (hora real) ═══ */}
      <ParallaxLayer
        depth={18}
        sx={psx}
        sy={psy}
        className="absolute right-[3%] top-[13%] sm:right-[5%] sm:top-[14%]"
      >
        <div
          role="img"
          aria-label={`Relógio da sala: ${now.getHours()} horas e ${now.getMinutes()} minutos`}
          className="h-12 w-12 rounded-full border-4 border-amber-800 bg-white shadow-lg sm:h-16 sm:w-16"
        >
          <span className="absolute left-1/2 top-[8%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-500" />
          <span className="absolute bottom-[8%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-500" />
          <span className="absolute left-[8%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-500" />
          <span className="absolute right-[8%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-500" />
          <div className="absolute inset-0" style={{ transform: `rotate(${hrDeg}deg)` }}>
            <div className="absolute bottom-1/2 left-1/2 h-[26%] w-[3px] -translate-x-1/2 rounded-full bg-slate-700" />
          </div>
          <div className="absolute inset-0" style={{ transform: `rotate(${minDeg}deg)` }}>
            <div className="absolute bottom-1/2 left-1/2 h-[37%] w-[2px] -translate-x-1/2 rounded-full bg-slate-900" />
          </div>
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600" />
        </div>
      </ParallaxLayer>

      {/* ═══ Quadro interativo ═══ */}
      <ParallaxLayer
        depth={6}
        sx={psx}
        sy={psy}
        className="absolute left-[56%] top-[11%] h-[33%] max-h-[300px] min-h-[150px] w-[44%] min-w-[220px] max-w-[540px] -translate-x-1/2 md:left-1/2 md:w-[46%]"
      >
        <button
          type="button"
          onClick={openNextMission}
          aria-label={
            next ? `Abrir a missão de hoje: ${next.mission.title}` : "Ver o caminho de aprendizagem"
          }
          className="group pointer-events-auto block h-full w-full"
        >
          {/* Moldura de madeira */}
          <div className="h-full w-full rounded-xl border-[10px] border-amber-800 bg-[#2f5d50] shadow-2xl transition-transform group-active:scale-[0.98] sm:border-[12px]">
            {/* Textura do quadro */}
            <div className="relative flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-sm pt-[7%]">
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, #fff 0.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, #fff 0.5px, transparent 1.5px), radial-gradient(circle at 45% 80%, #fff 0.5px, transparent 1.5px)",
                  backgroundSize: "90px 70px",
                }}
              />
              {/* Rabiscos de giz animados */}
              <span
                className="scene-bob absolute left-[6%] top-[10%] font-display text-lg text-white/50"
                style={{ "--tilt": "-6deg" } as CSSProperties}
              >
                A
              </span>
              <span
                className="scene-bob absolute left-[16%] top-[30%] font-display text-sm text-white/40"
                style={{ "--tilt": "4deg", animationDelay: "0.6s" } as CSSProperties}
              >
                b
              </span>
              <span
                className="scene-bob absolute right-[8%] top-[14%] font-display text-base text-white/50"
                style={{ "--tilt": "5deg", animationDelay: "1.2s" } as CSSProperties}
              >
                1·2·3
              </span>
              <span
                className="scene-bob absolute bottom-[12%] left-[10%] text-white/45"
                style={{ animationDelay: "1.8s" }}
              >
                ★
              </span>
              <span
                className="scene-bob absolute bottom-[10%] right-[12%] font-display text-sm text-white/40"
                style={{ "--tilt": "-4deg", animationDelay: "2.4s" } as CSSProperties}
              >
                π ≈ 3,14
              </span>

              <p
                className="scene-chalk-in font-display text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 sm:text-xs"
                style={{ animationDelay: "0.1s" }}
              >
                ✦ Sala de Aula Mágica ✦
              </p>
              <p
                className="scene-chalk-in mt-1 font-display text-lg text-white/95 sm:text-2xl md:text-3xl"
                style={{
                  animationDelay: "0.35s",
                  textShadow: "0 0 6px rgba(255,255,255,0.35)",
                  transform: "rotate(-1deg)",
                }}
              >
                Olá, {profile.name}!
              </p>
              {next && (
                <p
                  className="scene-chalk-in mt-1.5 max-w-[92%] truncate rounded bg-white/10 px-2 py-0.5 font-display text-xs text-amber-200 sm:text-sm"
                  style={{ animationDelay: "0.65s" }}
                >
                  Hoje: {next.mission.emoji} {next.mission.title}
                </p>
              )}
              <p
                className="scene-chalk-in mt-1.5 font-display text-[10px] text-white/70 sm:text-xs"
                style={{ animationDelay: "0.9s" }}
              >
                🔥 {profile.streak} {profile.streak === 1 ? "dia" : "dias"} · ⭐ {profile.xp} XP
              </p>
            </div>
          </div>
          {/* Tabuleiro do giz */}
          <div className="absolute -bottom-3 left-1/2 h-3 w-[86%] -translate-x-1/2 rounded-b-md bg-amber-700 shadow-md">
            <span className="absolute bottom-1 left-[12%] h-1.5 w-7 rounded-full bg-white/90" />
            <span className="absolute bottom-1 left-[30%] h-1.5 w-5 rounded-full bg-amber-200" />
            <span className="absolute bottom-0.5 right-[14%] h-2.5 w-9 rounded-sm bg-slate-700/90" />
          </div>
        </button>
      </ParallaxLayer>

      {/* ═══ Cartazes (sm+) ═══ */}
      <ParallaxLayer
        depth={10}
        sx={psx}
        sy={psy}
        className="absolute right-[5%] top-[30%] hidden h-[15%] w-[8%] min-w-[56px] max-w-[80px] sm:block"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.9, rotate: -4 }}
          onClick={() => {
            haptic("tap");
            playTap();
          }}
          aria-label="Cartaz do alfabeto"
          className="pointer-events-auto block h-full w-full rotate-3 rounded-md border-4 border-white bg-white/95 p-1 shadow-lg"
        >
          <span className="flex h-full w-full items-center justify-center gap-0.5 font-display text-sm font-black">
            <span className="text-rose-500">A</span>
            <span className="text-sky-500">B</span>
            <span className="text-emerald-500">C</span>
          </span>
          <span className="absolute inset-x-2 top-1 h-1 rounded bg-rose-200" />
        </motion.button>
      </ParallaxLayer>

      {/* ═══ Estante de livros + globo ═══ */}
      <ParallaxLayer
        depth={12}
        sx={psx}
        sy={psy}
        className="absolute bottom-[30%] right-[2%] w-[26%] min-w-[150px] max-w-[220px] sm:right-[4%]"
      >
        <div>
          {/* Prateleira de cima: troféu + globo */}
          <div className="flex items-end justify-between px-1">
            <Trophy
              className="mb-1 h-6 w-6 text-amber-500 drop-shadow sm:h-7 sm:w-7"
              aria-label="Troféu"
            />
            <motion.button
              type="button"
              onClick={spinGlobe}
              animate={{ rotate: spin * 360 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              aria-label="Rodar globo e descobrir um facto"
              className="pointer-events-auto relative mb-0.5 h-9 w-9 sm:h-11 sm:w-11"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-sky-600 shadow-md">
                <motion.span
                  animate={{ rotate: spin * 360 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <span className="absolute left-[15%] top-[20%] h-3 w-4 rounded-[60%] bg-emerald-400" />
                  <span className="absolute right-[12%] top-[45%] h-2.5 w-3.5 rounded-[60%] bg-emerald-400" />
                  <span className="absolute bottom-[12%] left-[35%] h-2 w-3 rounded-[60%] bg-emerald-300" />
                </motion.span>
              </span>
              <span className="absolute inset-x-[-3px] top-1/2 h-[2px] -translate-y-1/2 rotate-[18deg] rounded bg-white/60" />
              <span className="absolute -bottom-1.5 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-full bg-amber-700" />
            </motion.button>
          </div>
          <div className="h-2 rounded-sm bg-amber-800 shadow" />
          {/* Livros interativos */}
          <div className="flex items-end gap-1 px-1 pt-1.5 pb-1">
            {BOOKS.map((b) => (
              <button
                key={b.to}
                type="button"
                onClick={() => openBook(b.to)}
                aria-label={`Abrir ${b.label}`}
                className="pointer-events-auto flex h-12 w-7 items-center justify-center rounded-sm rounded-t-md shadow-sm transition-transform hover:-translate-y-1 active:scale-95 sm:h-14 sm:w-8"
                style={{ backgroundColor: b.color }}
              >
                <span className="[writing-mode:vertical-rl] font-display text-[9px] font-bold text-white sm:text-[10px]">
                  {b.label}
                </span>
              </button>
            ))}
          </div>
          <div className="h-2.5 rounded-sm bg-amber-800 shadow" />
          {/* Pés da estante */}
          <div className="flex justify-between px-3">
            <span className="h-3 w-1.5 rounded-b bg-amber-900" />
            <span className="h-3 w-1.5 rounded-b bg-amber-900" />
          </div>
        </div>
      </ParallaxLayer>

      {/* ═══ Planta ═══ */}
      <ParallaxLayer
        depth={16}
        sx={psx}
        sy={psy}
        className="absolute bottom-[26%] left-[3%] sm:left-[5%]"
      >
        <div className="scene-sway relative h-12 w-12 sm:h-14 sm:w-14">
          <span
            className="absolute bottom-4 left-1/2 h-9 w-2.5 -translate-x-1/2 rounded-full bg-emerald-500"
            style={{ rotate: "-14deg" }}
          />
          <span className="absolute bottom-4 left-1/2 h-10 w-2.5 -translate-x-1/2 rounded-full bg-emerald-600" />
          <span
            className="absolute bottom-4 left-1/2 h-8 w-2.5 -translate-x-1/2 rounded-full bg-emerald-500"
            style={{ rotate: "14deg" }}
          />
        </div>
        <div
          className="mx-auto h-6 w-10 rounded-b-xl bg-orange-400 shadow-md"
          style={{ clipPath: "polygon(8% 0, 92% 0, 78% 100%, 22% 100%)" }}
        />
      </ParallaxLayer>

      {/* ═══ Avião de papel ═══ */}
      <ParallaxLayer depth={9} sx={psx} sy={psy} className="absolute top-[20%] inset-x-0">
        <span className="scene-plane block text-2xl opacity-0" aria-hidden>
          ✈️
        </span>
      </ParallaxLayer>

      {/* ═══ Partículas de poeira mágica ═══ */}
      {[
        { l: "12%", b: "30%", d: "0s" },
        { l: "30%", b: "24%", d: "2.2s" },
        { l: "55%", b: "28%", d: "4.1s" },
        { l: "74%", b: "22%", d: "1.3s" },
        { l: "88%", b: "32%", d: "3.4s" },
      ].map((m, i) => (
        <span
          key={i}
          className="scene-mote absolute h-1.5 w-1.5 rounded-full bg-amber-200/70"
          style={{ left: m.l, bottom: m.b, animationDelay: m.d }}
        />
      ))}

      {/* ═══ Candil de pé (interruptor da luz) ═══ */}
      <ParallaxLayer depth={12} sx={psx} sy={psy} className="absolute bottom-[21%] right-[4%]">
        <button
          type="button"
          onClick={toggleLamp}
          aria-label={lampOn ? "Apagar a luz" : "Acender a luz"}
          aria-pressed={lampOn}
          className="pointer-events-auto flex flex-col items-center transition-transform active:scale-90"
        >
          <span
            className={cn(
              "h-4 w-10 rounded-t-md transition-colors",
              lampOn ? "bg-amber-300 shadow-[0_0_18px_8px_rgba(255,200,90,0.55)]" : "bg-slate-500",
            )}
            style={{ clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)" }}
          />
          <span className="h-14 w-1.5 bg-slate-500" />
          <span className="h-2 w-10 rounded-full bg-slate-600" />
        </button>
      </ParallaxLayer>

      {/* ═══ Secretária ═══ */}
      <ParallaxLayer
        depth={8}
        sx={psx}
        sy={psy}
        className="absolute bottom-[13%] left-1/2 w-[68%] max-w-[440px] -translate-x-1/2"
      >
        <div>
          {/* Objetos sobre a mesa */}
          <div className="relative">
            {/* Caderno */}
            <div className="absolute -top-7 left-[12%] h-6 w-12 -rotate-3 rounded-sm bg-white shadow-sm">
              <span className="absolute inset-x-1 top-1 h-px bg-sky-300" />
              <span className="absolute inset-x-1 top-2.5 h-px bg-sky-300" />
              <span className="absolute inset-x-1 top-4 h-px bg-sky-300" />
            </div>
            {/* Lápis */}
            <div className="absolute -top-5 left-[42%] h-1.5 w-12 rotate-6 rounded-full bg-amber-400 shadow-sm">
              <span className="absolute -right-1.5 top-0 h-0 w-0 border-y-[3px] border-l-[6px] border-y-transparent border-l-amber-200" />
            </div>
            {/* Maçã */}
            <div className="absolute -top-6 right-[20%] h-5 w-5 rounded-full bg-red-500 shadow-sm">
              <span className="absolute -top-1 left-1/2 h-2 w-0.5 -translate-x-1/2 rounded bg-amber-800" />
            </div>
          </div>
          {/* Tampo */}
          <div className="relative h-4 rounded-t-lg bg-amber-700 shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-amber-500/70" />
          </div>
          {/* Frente */}
          <div className="relative h-12 rounded-b-lg bg-amber-800/95 sm:h-14">
            <span className="absolute left-[28%] top-1/2 h-1.5 w-8 -translate-y-1/2 rounded-full bg-amber-950/40" />
            <span className="absolute right-[28%] top-1/2 h-1.5 w-8 -translate-y-1/2 rounded-full bg-amber-950/40" />
          </div>
        </div>
      </ParallaxLayer>

      {/* ═══ Tapete ═══ */}
      <div className="absolute bottom-[3%] left-1/2 h-[9%] w-[64%] -translate-x-1/2 rounded-[100%] bg-rose-400/30 blur-[2px]" />
      <div className="absolute bottom-[4.5%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-[100%] border-2 border-white/40 bg-rose-300/25" />

      {/* ═══ Luz do candil (sobreposição ambiente) ═══ */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle at 56% 66%, rgba(255,196,86,0.30), rgba(255,196,86,0.10) 42%, transparent 72%)",
          opacity: lampOn ? 1 : 0,
        }}
      />
      {/* Escurecer à noite com candil apagado */}
      <div
        className="absolute inset-0 bg-indigo-950/30 transition-opacity duration-700"
        style={{ opacity: p.isNight && !lampOn ? 1 : 0 }}
      />
    </div>
  );
}
