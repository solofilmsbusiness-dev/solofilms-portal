import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArrowLeft, Mail, Phone, Building2, Film, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: profile }, { data: projects }, { data: bookings }, { data: authUser }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).single(),
    admin.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    admin.from("bookings").select("*").eq("client_id", id).order("date", { ascending: false }),
    admin.auth.admin.getUserById(id),
  ]);

  if (!profile) notFound();

  const email = authUser?.user?.email ?? "";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-cinema-subtle hover:text-gold transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Clients
        </Link>
        <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
          <span className="text-gradient-gold">{profile.full_name || "Unnamed Client"}</span>
        </h1>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Client Info
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-cinema-subtle shrink-0" />
            <div>
              <div className="text-xs text-cinema-subtle">Email</div>
              <div className="text-sm text-cinema-text">{email || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-cinema-subtle shrink-0" />
            <div>
              <div className="text-xs text-cinema-subtle">Phone</div>
              <div className="text-sm text-cinema-text">{profile.phone || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-cinema-subtle shrink-0" />
            <div>
              <div className="text-xs text-cinema-subtle">Company</div>
              <div className="text-sm text-cinema-text">{profile.company_name || "—"}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-cinema-subtle">Member since</div>
            <div className="text-sm text-cinema-text">
              {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest">
            <Film className="h-3.5 w-3.5" />
            Projects ({projects?.length ?? 0})
          </div>
          <Link href={`/admin/projects/new?client_id=${id}`} className="text-xs text-gold border border-gold/20 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors">
            + New Project
          </Link>
        </div>
        {projects && projects.length > 0 ? (
          <div className="space-y-2">
            {projects.map((p: any) => (
              <Link key={p.id} href={`/admin/projects/${p.id}`}>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div>
                    <div className="text-sm text-cinema-text group-hover:text-gold transition-colors">{p.title}</div>
                    <div className="text-xs text-cinema-subtle">{p.genre ?? "—"} · {p.shoot_date ? new Date(p.shoot_date).toLocaleDateString() : "No date"}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-cinema-subtle text-sm py-4 text-center">No projects yet.</p>
        )}
      </div>

      {/* Bookings */}
      <div className="glass rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest mb-4">
          <Calendar className="h-3.5 w-3.5" />
          Bookings ({bookings?.length ?? 0})
        </div>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-2">
            {bookings.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02]">
                <div>
                  <div className="text-sm text-cinema-text">
                    {new Date(b.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="text-xs text-cinema-subtle">{b.start_time} – {b.end_time} · {b.shoot_type ?? "General"}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  b.status === "confirmed" ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10" :
                  b.status === "cancelled" ? "text-rose border-rose/20 bg-rose/10" :
                  b.status === "completed" ? "text-cyan border-cyan/20 bg-cyan/10" :
                  "text-gold border-gold/20 bg-gold/10"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-cinema-subtle text-sm py-4 text-center">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
