import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Building2, Film } from "lucide-react";

export default async function AdminClientsPage() {
  const admin = createAdminClient();

  const { data: clients } = await admin
    .from("profiles")
    .select("id, full_name, company_name, phone, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  // Get project counts
  const { data: projectRows } = await admin.from("projects").select("client_id");
  const countMap: Record<string, number> = {};
  projectRows?.forEach((p) => { countMap[p.client_id] = (countMap[p.client_id] || 0) + 1; });

  // Get emails
  const { data: authData } = await admin.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  authData?.users?.forEach((u) => { emailMap[u.id] = u.email ?? ""; });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Clients
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
          All <span className="text-gradient-gold">Clients</span>
        </h1>
        <p className="text-cinema-subtle mt-1">{clients?.length ?? 0} registered clients.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {clients && clients.length > 0 ? (
          <div className="divide-y divide-cinema-border">
            {clients.map((client: any) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <div className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet/10 text-violet font-heading text-lg">
                    {(client.full_name || "?")[0].toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cinema-text group-hover:text-gold transition-colors">
                      {client.full_name || "Unnamed"}
                    </div>
                    <div className="text-xs text-cinema-subtle truncate">{emailMap[client.id] || "—"}</div>
                  </div>
                  {/* Company */}
                  {client.company_name && (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-cinema-subtle">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company_name}
                    </div>
                  )}
                  {/* Projects */}
                  <div className="flex items-center gap-1.5 text-xs text-cinema-subtle">
                    <Film className="h-3.5 w-3.5" />
                    {countMap[client.id] ?? 0} project{(countMap[client.id] ?? 0) !== 1 ? "s" : ""}
                  </div>
                  {/* Joined */}
                  <div className="hidden lg:block text-xs text-cinema-subtle">
                    Joined {new Date(client.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                  <span className="text-cinema-subtle text-xs">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-cinema-subtle mx-auto mb-3" />
            <p className="text-cinema-subtle">No clients yet. They&apos;ll appear here after signing up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
