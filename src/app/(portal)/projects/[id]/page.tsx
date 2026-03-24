import { PageTransition } from "@/components/shared/PageTransition";
import { StatusTimeline } from "@/components/projects/StatusTimeline";
import { DeliverableCard } from "@/components/projects/DeliverableCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar, MapPin, Film, Package, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ProjectStatus } from "@/lib/constants";

export const metadata = { title: "Project Detail | Solo Films" };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project, error } = await supabase
    .from("projects")
    .select(`*, deliverables(*), project_status_history(*)`)
    .eq("id", id)
    .eq("client_id", user!.id)
    .single();

  if (error || !project) notFound();

  const deliverables = project.deliverables ?? [];
  const statusHistory = (project.project_status_history ?? []).sort(
    (a: { reached_at: string }, b: { reached_at: string }) =>
      new Date(a.reached_at).getTime() - new Date(b.reached_at).getTime()
  );

  const hasThumbnail = !!project.thumbnail_url;

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-cinema-subtle hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* ═══ CINEMATIC HERO WINDOW ═══ */}
        <div className="relative overflow-hidden rounded-2xl border border-cinema-border">
          {/* Hero background */}
          <div className="relative h-64 sm:h-80">
            {hasThumbnail ? (
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              /* Cinematic gradient mesh fallback */
              <div className="absolute inset-0 bg-gradient-to-br from-violet/10 via-cinema-surface to-gold/10">
                {/* Decorative grid lines */}
                <div className="absolute inset-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-white/[0.02]"
                      style={{ top: `${(i + 1) * 12.5}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Decorative play button (centered) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="glass flex h-20 w-20 items-center justify-center rounded-full border border-white/10 shadow-[0_0_40px_rgba(212,168,83,0.15)]">
                <Play className="h-8 w-8 text-gold ml-1" />
              </div>
            </div>

            {/* Status badge (top-right) */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <StatusBadge status={project.status as ProjectStatus} size="md" />
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-cinema-bg via-cinema-bg/80 to-transparent" />

            {/* Hero content (positioned at bottom) */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              {/* Eyebrow badge */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                  Project Detail
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
                <span className="text-gradient-gold">{project.title}</span>
              </h1>

              {/* Metadata row */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-cinema-subtle">
                {project.genre && (
                  <span className="flex items-center gap-1.5">
                    <Film className="h-4 w-4 text-gold/60" />
                    <span className="capitalize">{project.genre.replace(/_/g, " ")}</span>
                  </span>
                )}
                {project.shoot_date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gold/60" />
                    Shot{" "}
                    {new Date(project.shoot_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {project.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gold/60" />
                    {project.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {/* Description */}
        {(project.description || project.estimated_delivery) && (
          <div className="glass rounded-2xl border border-cinema-border p-6">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-cinema-border bg-cinema-surface/30 px-2.5 py-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">
                Project Brief
              </span>
            </div>
            {project.description && (
              <p className="mt-3 leading-relaxed text-cinema-text">
                {project.description}
              </p>
            )}
            {project.estimated_delivery && (
              <div className="mt-4 text-sm text-cinema-subtle">
                Est. Delivery:{" "}
                <span className="text-gold">
                  {new Date(project.estimated_delivery).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status Timeline */}
        <StatusTimeline
          currentStatus={project.status as ProjectStatus}
          statusHistory={statusHistory.map(
            (h: { status: string; reached_at: string }) => ({
              status: h.status as ProjectStatus,
              reached_at: h.reached_at,
            })
          )}
        />

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {/* Deliverables */}
        <div>
          <div className="mb-5">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-surface/30 px-2.5 py-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">
                Files
              </span>
            </div>
            <h2 className="font-heading text-xl font-semibold text-cinema-text">
              Deliverables{" "}
              <span className="text-base font-normal text-cinema-subtle">
                ({deliverables.length})
              </span>
            </h2>
          </div>
          {deliverables.length > 0 ? (
            <div className="space-y-3">
              {deliverables.map(
                (d: {
                  id: string;
                  file_name: string;
                  file_type: string;
                  file_size_bytes: number;
                  version: number;
                  is_final: boolean;
                }) => (
                  <DeliverableCard
                    key={d.id}
                    id={d.id}
                    fileName={d.file_name}
                    fileType={d.file_type ?? ""}
                    fileSize={d.file_size_bytes ?? 0}
                    version={d.version ?? 1}
                    isFinal={d.is_final ?? false}
                  />
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cinema-border py-12 text-center">
              <Package className="mb-3 h-8 w-8 text-cinema-subtle/20" />
              <p className="text-sm text-cinema-subtle">No deliverables yet.</p>
              <p className="mt-1 text-xs text-cinema-subtle/60">
                Files will appear here as they&apos;re ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
