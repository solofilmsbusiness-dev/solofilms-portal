"use client";

import { motion } from "framer-motion";
import { Film, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProjectStatus } from "@/lib/constants";
import Link from "next/link";

interface ProjectCardProps {
  id: string;
  title: string;
  genre: string;
  status: ProjectStatus;
  shootDate?: string;
  thumbnailUrl?: string;
}

export function ProjectCard({
  id,
  title,
  genre,
  status,
  shootDate,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl border border-cinema-border glass transition-all hover:border-gold/30"
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Thumbnail placeholder */}
        <div className="relative h-44 overflow-hidden bg-cinema-muted/20">
          {/* Gradient overlay on thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet/5 via-transparent to-gold/5" />
          <div className="flex h-full items-center justify-center">
            <Film className="h-12 w-12 text-cinema-subtle/20" />
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-cinema-bg/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-gold">
              View Project <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-heading truncate font-semibold text-cinema-text transition-colors group-hover:text-gold">
                {title}
              </h3>
              <p className="mt-1 text-xs capitalize text-cinema-subtle">
                {genre.replace(/_/g, " ")}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>
          {shootDate && (
            <p className="text-xs text-cinema-subtle/70">
              Shoot:{" "}
              {new Date(shootDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Corner glow — strengthened */}
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-gold/10 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />
        {/* Top-left accent glow */}
        <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-violet/10 opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-100" />
      </motion.div>
    </Link>
  );
}
