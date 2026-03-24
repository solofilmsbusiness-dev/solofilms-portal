import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Film, Calendar, FileVideo, Clock, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const [
    { count: clientCount },
    { count: projectCount },
    { count: pendingCount },
    { count: deliverableCount },
    { data: recentProjects },
    { data: recentBookings },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
    admin.from("projects").select("id", { count: "exact", head: true }),
    admin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("deliverables").select("id", { count: "exact", head: true }),
    admin.from("projects").select("id, title, status, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
    admin.from("bookings").select("id, date, start_time, shoot_type, status, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Clients", value: clientCount ?? 0, icon: Users, color: "text-violet", bg: "bg-violet/10", href: "/admin/clients" },
    { label: "Projects", value: projectCount ?? 0, icon: Film, color: "text-gold", bg: "bg-gold/10", href: "/admin/projects" },
    { label: "Pending Bookings", value: pendingCount ?? 0, icon: Clock, color: "text-rose", bg: "bg-rose/10", href: "/admin/bookings" },
    { label: "Deliverables", value: deliverableCount ?? 0, icon: FileVideo, color: "text-cyan", bg: "bg-cyan/10", href: "/admin/projects" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Admin Panel
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
          <span className="text-gradient-gold">Studio</span> Overview
        </h1>
        <p className="text-cinema-subtle mt-1">Active clients, open productions, pending shoots — the full picture.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="glass rounded-2xl p-5 hover:border-gold/20 transition-colors group cursor-pointer">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-heading text-cinema-text group-hover:text-gold transition-colors">
                {stat.value}
              </div>
              <div className="text-xs text-cinema-subtle mt-0.5">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              On the Board
            </div>
            <Link href="/admin/projects" className="text-xs text-cinema-subtle hover:text-gold transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((p: any) => (
                <Link key={p.id} href={`/admin/projects/${p.id}`}>
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div>
                      <div className="text-sm text-cinema-text group-hover:text-gold transition-colors font-medium">{p.title}</div>
                      <div className="text-xs text-cinema-subtle">{p.profiles?.full_name ?? "Unknown client"}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-cinema-subtle text-sm py-4 text-center">Nothing on the board yet.</p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Incoming Shoots
            </div>
            <Link href="/admin/bookings" className="text-xs text-cinema-subtle hover:text-gold transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <div className="text-sm text-cinema-text font-medium">{b.profiles?.full_name ?? "Unknown"}</div>
                    <div className="text-xs text-cinema-subtle">
                      {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {b.shoot_type ?? "General"}
                    </div>
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
              ))
            ) : (
              <p className="text-cinema-subtle text-sm py-4 text-center">No shoots scheduled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
