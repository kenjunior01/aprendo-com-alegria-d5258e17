import { motion } from "framer-motion";
import { getMascot, type MascotId } from "@/lib/mascots";
import { getItem } from "@/lib/shop";
import { cn } from "@/lib/utils";

interface Props {
  id: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  bouncing?: boolean;
  className?: string;
  equippedItemId?: string | null;
  growthScale?: number;
}

const sizeMap = {
  sm: "h-16 w-16",
  md: "h-28 w-28",
  lg: "h-40 w-40",
  xl: "h-56 w-56",
};

const itemSize = {
  sm: { hat: "text-xl -top-2 -right-1", outfit: "text-base bottom-0 -right-1", badge: "text-sm -bottom-1 -left-1" },
  md: { hat: "text-3xl -top-3 -right-2", outfit: "text-2xl bottom-0 -right-2", badge: "text-xl -bottom-1 -left-2" },
  lg: { hat: "text-5xl -top-4 -right-3", outfit: "text-4xl bottom-1 -right-3", badge: "text-3xl -bottom-1 -left-3" },
  xl: { hat: "text-6xl -top-5 -right-4", outfit: "text-5xl bottom-2 -right-4", badge: "text-4xl -bottom-2 -left-4" },
};

export function Mascot({ id, size = "md", bouncing = false, className, equippedItemId, growthScale = 1 }: Props) {
  const m = getMascot(id);
  const item = getItem(equippedItemId);
  const isWearable = item && (item.type === "hat" || item.type === "outfit" || item.type === "badge");
  const itemPos = isWearable ? itemSize[size][item.type as "hat" | "outfit" | "badge"] : "";

  return (
    <motion.div
      initial={{ scale: 0.85 * growthScale, opacity: 0 }}
      animate={{ scale: growthScale, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
      className={cn("relative inline-flex", className)}
    >
      <img
        src={m.image}
        alt={`Mascote ${m.name} do Alegria`}
        width={300}
        height={300}
        loading="lazy"
        className={cn(
          sizeMap[size],
          "object-contain drop-shadow-md",
          bouncing && "animate-bounce-soft",
        )}
      />
      {isWearable && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute select-none drop-shadow-md", itemPos)}
          style={{ transform: `scale(${1 / growthScale})` }}
        >
          {item.emoji}
        </span>
      )}
    </motion.div>
  );
}
