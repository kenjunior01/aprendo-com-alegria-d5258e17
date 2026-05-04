import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props extends Omit<HTMLMotionProps<"button">, "ref"> {
  tone?: "primary" | "success" | "secondary" | "danger" | "ghost";
}

export function ChunkyButton({ tone = "primary", className, children, ...props }: Props) {
  const tones: Record<string, string> = {
    primary: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    danger: "bg-destructive text-destructive-foreground",
    ghost: "bg-card text-foreground",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        "btn-chunky inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-display text-base font-semibold uppercase tracking-wide disabled:opacity-50 disabled:pointer-events-none",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
