import { motion } from "framer-motion";
import { getMascot, type MascotId } from "@/lib/mascots";
import { cn } from "@/lib/utils";

interface Props {
  id: MascotId;
  size?: "sm" | "md" | "lg" | "xl";
  bouncing?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-16 w-16",
  md: "h-28 w-28",
  lg: "h-40 w-40",
  xl: "h-56 w-56",
};

export function Mascot({ id, size = "md", bouncing = false, className }: Props) {
  const m = getMascot(id);
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
      className={cn("inline-flex", className)}
    >
      <img
        src={m.image}
        alt={m.name}
        width={300}
        height={300}
        loading="lazy"
        className={cn(
          sizeMap[size],
          "object-contain drop-shadow-md",
          bouncing && "animate-bounce-soft",
        )}
      />
    </motion.div>
  );
}
