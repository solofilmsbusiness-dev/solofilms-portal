"use client";

import { motion } from "framer-motion";
import { Calendar, Clapperboard, Video, Film, Eye, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/constants";

const stages: {
  key: ProjectStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  trackColor: string;
}[] = [
  { key: "booked", label: "Booked", icon: Calendar, color: "bg-violet", glowColor: "shadow-violet/50", trackColor: "bg-violet" },
  { key: "pre_production", label: "Pre-Prod", icon: Clapperboard, color: "bg-cyan", glowColor: "shadow-cyan/50", trackColor: "bg-cyan" },
  { key: "filming", label: "Filming", icon: Video, color: "bg-amber-500", glowColor: "shadow-amber-500/50", trackColor: "bg-amber-500" },
  { key: "editing", label: "Editing", icon: Film, color: "bg-rose", glowColor: "shadow-rose/50", trackColor: "bg-rose" },
  { key: "review", label: "Review", icon: Eye, color: "bg-blue-500", glowColor: "shadow-blue-500/50", trackColor: "bg-blue-500" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, color: "bg-emerald-500", glowColor: "shadow-emerald-500/50", trackColor: "bg-emerald-500" },
];

interface StatusTimelineProps {
  currentStatus: ProjectStatus;
  statusHistory?: { status: ProjectStatus; reached_at: string }[];
}

export function StatusTimeline({ currentStatus, statusHistory = [] }: StatusTimelineProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStatus);

  return (
    <div className="glass rounded-2xl border border-cinema-border p-6 sm:p-8">
      {/* Eyebrow badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
          Production Timeline
        </span>
      </div>

      {/* Gradient divider */}
      <motion.div
        className="mb-8 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative">
        {/* Background track */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-cinema-muted/30" />

        <div className="flex items-start justify-between">
          {stages.map((stage, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const historyEntry = statusHistory.find((h) => h.status === stage.key);

            return (
              <div key={stage.key} className="relative flex flex-1 flex-col items-center">
                {/* Connecting line (filled portion) */}
                {i > 0 && (
                  <div className="absolute top-5 right-1/2 left-[-50%] h-0.5">
                    <motion.div
                      className={cn("h-full origin-left", i <= currentIndex ? stage.trackColor : "bg-transparent")}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                    />
                  </div>
                )}

                {/* Node */}
                <motion.div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted
                      ? `${stage.color} border-transparent text-white`
                      : "border-cinema-muted bg-cinema-bg text-cinema-muted",
                    isCurrent && `shadow-[0_0_24px] ${stage.glowColor}`
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: i * 0.15 }}
                >
                  <stage.icon className="h-4 w-4" />

                  {/* Active pulse ring */}
                  {isCurrent && (
                    <motion.div
                      className={`absolute inset-0 rounded-full ${stage.color} opacity-25`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <motion.div
                  className="mt-3 text-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 + 0.2 }}
                >
                  <p
                    className={cn(
                      "text-xs font-medium sm:text-sm",
                      isCurrent ? "text-gold" : isCompleted ? "text-cinema-text" : "text-cinema-muted"
                    )}
                  >
                    {stage.label}
                  </p>
                  {historyEntry && (
                    <p className="mt-0.5 text-[10px] text-cinema-subtle/60">
                      {new Date(historyEntry.reached_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
