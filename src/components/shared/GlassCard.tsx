"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  glow?: "gold" | "violet" | "cyan" | "rose" | "amber";
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass rounded-2xl p-6",
        hover && "glass-hover glass-gold cursor-pointer",
        glow === "gold" && "glow-gold",
        glow === "violet" && "glow-violet",
        glow === "cyan" && "glow-cyan",
        glow === "rose" && "glow-rose",
        glow === "amber" && "glow-amber",
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
