import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { createClient } from "@/lib/supabase/server";
import { Film } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Projects | Solo Films" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const allProjects = projects ?? [];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          {/* Eyebrow badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
              Your Work
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-cinema-text">
            The{" "}
            <span className="text-gradient-gold">Work.</span>
          </h1>
          <p className="mt-1 text-cinema-subtle">
            Every production. Every frame. Every deliverable — in one place.
          </p>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {allProjects.length > 0 ? (
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allProjects.map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard
                  id={project.id}
                  title={project.title}
                  genre={project.genre ?? ""}
                  status={project.status}
                  shootDate={project.shoot_date ?? ""}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cinema-border py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cinema-border bg-cinema-surface/30">
              <Film className="h-8 w-8 text-cinema-subtle/30" />
            </div>
            <p className="text-cinema-subtle">No projects in the archive.</p>
            <p className="mt-1 text-sm text-cinema-subtle/60">
              Once we roll, your productions will live here.
            </p>
            <Link
              href="/bookings"
              className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-cinema-bg hover:opacity-90 transition-opacity"
            >
              Book Your First Shoot
            </Link>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
