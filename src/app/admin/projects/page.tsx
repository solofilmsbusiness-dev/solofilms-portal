import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Film, Plus } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

const STATUS_ORDER = ["booked", "pre_production", "filming", "editing", "review", "delivered"];

export default async function AdminProjectsPage() {
  const admin = createAdminClient();
  const { data: projects } = await admin
    .from("projects")
    .select("*, profiles(full_name, company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Projects
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
            All <span className="text-gradient-gold">Projects</span>
          </h1>
          <p className="text-cinema-subtle mt-1">{projects?.length ?? 0} total projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 rounded-xl bg-gold text-cinema-bg px-4 py-2.5 text-sm font-medium hover:bg-gold/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {projects && projects.length > 0 ? (
          <div className="divide-y divide-cinema-border">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs text-cinema-subtle uppercase tracking-wider">
              <div className="col-span-4">Project</div>
              <div className="col-span-3">Client</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Shoot Date</div>
              <div className="col-span-1" />
            </div>
            {projects.map((p: any) => (
              <Link key={p.id} href={`/admin/projects/${p.id}`}>
                <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-white/5 transition-colors group">
                  <div className="col-span-4">
                    <div className="text-sm font-medium text-cinema-text group-hover:text-gold transition-colors line-clamp-1">{p.title}</div>
                    <div className="text-xs text-cinema-subtle">{p.genre ?? "—"}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm text-cinema-text">{p.profiles?.full_name ?? "—"}</div>
                    {p.profiles?.company_name && <div className="text-xs text-cinema-subtle">{p.profiles.company_name}</div>}
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="col-span-2 text-sm text-cinema-subtle">
                    {p.shoot_date ? new Date(p.shoot_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </div>
                  <div className="col-span-1 text-right text-cinema-subtle text-xs">→</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Film className="h-10 w-10 text-cinema-subtle mx-auto mb-3" />
            <p className="text-cinema-subtle mb-4">No projects yet.</p>
            <Link href="/admin/projects/new" className="text-sm text-gold hover:underline">Create the first project →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
