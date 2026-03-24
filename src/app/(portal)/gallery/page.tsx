import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { DeliverableCard } from "@/components/projects/DeliverableCard";
import { createClient } from "@/lib/supabase/server";
import { Images, Film } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Gallery | Solo Films" };

export default async function GalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, deliverables(*)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const allProjects = (projects ?? []).filter(
    (p) => p.deliverables && p.deliverables.length > 0
  );

  const totalDeliverables = allProjects.reduce(
    (sum, p) => sum + (p.deliverables?.length ?? 0),
    0
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
              Deliverables
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-cinema-text">
            The{" "}
            <span className="text-gradient-gold">Gallery.</span>
          </h1>
          <p className="mt-1 text-cinema-subtle">
            All your files, across every project — ready to download.
          </p>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {totalDeliverables > 0 ? (
          <StaggerContainer className="space-y-10">
            {allProjects.map((project) => (
              <StaggerItem key={project.id}>
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                      <Film className="h-4 w-4 text-gold" />
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-heading text-lg font-semibold text-cinema-text hover:text-gold transition-colors"
                    >
                      {project.title}
                    </Link>
                    <span className="ml-auto text-xs text-cinema-subtle">
                      {project.deliverables.length}{" "}
                      {project.deliverables.length === 1 ? "file" : "files"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {project.deliverables.map(
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
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cinema-border py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cinema-border bg-cinema-surface/30">
              <Images className="h-8 w-8 text-cinema-subtle/30" />
            </div>
            <p className="text-cinema-subtle">No deliverables yet.</p>
            <p className="mt-1 text-sm text-cinema-subtle/60">
              Files will appear here once your project is in post-production.
            </p>
            <Link
              href="/projects"
              className="mt-6 rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-cinema-bg hover:opacity-90 transition-opacity"
            >
              View Projects
            </Link>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
