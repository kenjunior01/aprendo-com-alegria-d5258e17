// MascotIcon — Inline SVG mascot icons for use in learning path nodes,
// badges, and other small contexts where PNGs are too heavy.
// These are simplified, recognizable versions of the 4 mascots.
import React from "react";
import { cn } from "@/lib/utils";
import type { MascotId } from "@/lib/mascots";

interface MascotIconProps {
  id: MascotId;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function MascotIcon({ id, size = 40, className, animated = false }: MascotIconProps) {
  const sharedProps = {
    width: size,
    height: size,
    viewBox: "0 0 100 100",
    className: cn(animated && "animate-bounce-soft", className),
    "aria-hidden": true as const,
  };

  switch (id) {
    case "fox":
      return <FoxSVG {...sharedProps} />;
    case "owl":
      return <OwlSVG {...sharedProps} />;
    case "bunny":
      return <BunnySVG {...sharedProps} />;
    case "turtle":
      return <TurtleSVG {...sharedProps} />;
    default:
      return <FoxSVG {...sharedProps} />;
  }
}

// ─── Fox (Faísca) — Orange, energetic, pointy ears ───
function FoxSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none">
      {/* Ears */}
      <path d="M25 50 L15 15 L40 38 Z" fill="#E8732A" />
      <path d="M75 50 L85 15 L60 38 Z" fill="#E8732A" />
      <path d="M28 45 L20 22 L38 38 Z" fill="#FFB87A" />
      <path d="M72 45 L80 22 L62 38 Z" fill="#FFB87A" />
      {/* Head */}
      <ellipse cx="50" cy="55" rx="32" ry="28" fill="#E8732A" />
      {/* Face mask */}
      <ellipse cx="50" cy="62" rx="22" ry="18" fill="#FFB87A" />
      {/* Eyes */}
      <ellipse cx="38" cy="50" rx="5" ry="6" fill="#2D1B0E" />
      <ellipse cx="62" cy="50" rx="5" ry="6" fill="#2D1B0E" />
      <ellipse cx="40" cy="48" rx="2" ry="2.5" fill="white" />
      <ellipse cx="64" cy="48" rx="2" ry="2.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="4" ry="3" fill="#2D1B0E" />
      {/* Smile */}
      <path d="M44 65 Q50 72 56 65" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="32" cy="62" rx="5" ry="3" fill="#FF9B9B" opacity="0.5" />
      <ellipse cx="68" cy="62" rx="5" ry="3" fill="#FF9B9B" opacity="0.5" />
    </svg>
  );
}

// ─── Owl (Mocha) — Purple, wise, round ───
function OwlSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none">
      {/* Ear tufts */}
      <path d="M28 35 L20 10 L38 28 Z" fill="#8B5CF6" />
      <path d="M72 35 L80 10 L62 28 Z" fill="#8B5CF6" />
      {/* Body/Head */}
      <ellipse cx="50" cy="58" rx="34" ry="32" fill="#8B5CF6" />
      {/* Face disc */}
      <ellipse cx="50" cy="55" rx="26" ry="24" fill="#C4B5FD" />
      {/* Eye circles */}
      <circle cx="38" cy="50" r="12" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" />
      <circle cx="62" cy="50" r="12" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" />
      {/* Pupils */}
      <circle cx="38" cy="50" r="6" fill="#2D1B0E" />
      <circle cx="62" cy="50" r="6" fill="#2D1B0E" />
      <circle cx="40" cy="48" r="2.5" fill="white" />
      <circle cx="64" cy="48" r="2.5" fill="white" />
      {/* Beak */}
      <path d="M47 58 L50 65 L53 58 Z" fill="#F59E0B" />
      {/* Wings */}
      <path d="M16 55 Q10 65 20 75 Q25 60 16 55 Z" fill="#7C3AED" />
      <path d="M84 55 Q90 65 80 75 Q75 60 84 55 Z" fill="#7C3AED" />
      {/* Belly pattern */}
      <path d="M42 68 Q50 78 58 68" stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M44 73 Q50 80 56 73" stroke="#7C3AED" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  );
}

// ─── Bunny (Pipoca) — Pink, fluffy, long ears ───
function BunnySVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none">
      {/* Ears */}
      <ellipse cx="35" cy="22" rx="8" ry="24" fill="#F9A8D4" />
      <ellipse cx="65" cy="22" rx="8" ry="24" fill="#F9A8D4" />
      <ellipse cx="35" cy="22" rx="5" ry="18" fill="#FDF2F8" />
      <ellipse cx="65" cy="22" rx="5" ry="18" fill="#FDF2F8" />
      {/* Head */}
      <circle cx="50" cy="58" r="28" fill="#F9A8D4" />
      {/* Face */}
      <ellipse cx="50" cy="62" rx="18" ry="14" fill="#FDF2F8" />
      {/* Eyes */}
      <ellipse cx="40" cy="52" rx="4.5" ry="5.5" fill="#2D1B0E" />
      <ellipse cx="60" cy="52" rx="4.5" ry="5.5" fill="#2D1B0E" />
      <ellipse cx="42" cy="50" rx="2" ry="2.5" fill="white" />
      <ellipse cx="62" cy="50" rx="2" ry="2.5" fill="white" />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="3" ry="2.5" fill="#EC4899" />
      {/* Whiskers */}
      <line x1="30" y1="60" x2="44" y2="62" stroke="#D1D5DB" strokeWidth="1" />
      <line x1="30" y1="65" x2="44" y2="64" stroke="#D1D5DB" strokeWidth="1" />
      <line x1="70" y1="60" x2="56" y2="62" stroke="#D1D5DB" strokeWidth="1" />
      <line x1="70" y1="65" x2="56" y2="64" stroke="#D1D5DB" strokeWidth="1" />
      {/* Mouth */}
      <path d="M46 64 Q50 69 54 64" stroke="#2D1B0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="32" cy="62" rx="5" ry="3" fill="#FF9B9B" opacity="0.4" />
      <ellipse cx="68" cy="62" rx="5" ry="3" fill="#FF9B9B" opacity="0.4" />
    </svg>
  );
}

// ─── Turtle (Tito) — Green, calm, shell ───
function TurtleSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none">
      {/* Shell */}
      <ellipse cx="50" cy="55" rx="30" ry="28" fill="#34D399" />
      {/* Shell pattern */}
      <path d="M50 30 L35 55 L50 80 L65 55 Z" fill="#10B981" opacity="0.5" />
      <path d="M25 50 L50 55 L75 50" stroke="#059669" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M30 65 L50 55 L70 65" stroke="#059669" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Head */}
      <circle cx="50" cy="30" r="16" fill="#6EE7B7" />
      {/* Eyes */}
      <circle cx="43" cy="27" r="4" fill="#2D1B0E" />
      <circle cx="57" cy="27" r="4" fill="#2D1B0E" />
      <circle cx="44.5" cy="25.5" r="1.5" fill="white" />
      <circle cx="58.5" cy="25.5" r="1.5" fill="white" />
      {/* Smile */}
      <path d="M44 35 Q50 40 56 35" stroke="#2D1B0E" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="36" cy="33" rx="4" ry="3" fill="#FF9B9B" opacity="0.4" />
      <ellipse cx="64" cy="33" rx="4" ry="3" fill="#FF9B9B" opacity="0.4" />
      {/* Legs */}
      <ellipse cx="25" cy="72" rx="8" ry="6" fill="#6EE7B7" />
      <ellipse cx="75" cy="72" rx="8" ry="6" fill="#6EE7B7" />
      {/* Tail */}
      <path d="M50 80 Q48 88 45 85" stroke="#6EE7B7" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
