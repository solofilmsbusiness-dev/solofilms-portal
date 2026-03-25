"use client";

import { Users, Download } from "lucide-react";
import { format } from "date-fns";

type Signup = {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  signed_up_at: string;
  status: string;
};

const SOURCE_COLORS: Record<string, string> = {
  youtube: "text-rose bg-rose/10",
  instagram: "text-violet bg-violet/10",
  tiktok: "text-cyan bg-cyan/10",
  twitter: "text-sky-400 bg-sky-400/10",
  direct: "text-gold bg-gold/10",
};

const SOURCE_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter",
  direct: "Direct",
};

export function WaitlistAdminClient({
  signups,
  total,
  sourceBreakdown,
}: {
  signups: Signup[];
  total: number;
  sourceBreakdown: Record<string, number>;
}) {
  const handleExportCSV = () => {
    const headers = ["#", "Name", "Email", "Source", "Status", "Signed Up"];
    const rows = signups.map((s, i) => [
      i + 1,
      s.name || "",
      s.email,
      s.source || "direct",
      s.status,
      format(new Date(s.signed_up_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoodtorial-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Hoodtorial University
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
            <span className="text-gradient-gold">Waitlist</span>
          </h1>
          <p className="text-cinema-subtle mt-1">
            {total.toLocaleString()} {total === 1 ? "person" : "people"} waiting for launch
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl border border-cinema-border bg-cinema-surface px-4 py-2.5 text-sm text-cinema-text hover:border-gold/20 hover:text-gold transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(SOURCE_LABELS).map(([key, label]) => {
          const n = sourceBreakdown[key] ?? 0;
          return (
            <div key={key} className="glass rounded-2xl p-4">
              <p className="text-cinema-subtle text-xs uppercase tracking-widest mb-1">{label}</p>
              <p className="font-heading text-3xl text-cinema-text">{n.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {signups.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="h-10 w-10 text-cinema-subtle mx-auto mb-3" />
          <p className="text-cinema-subtle">No signups yet. Share the waitlist link.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cinema-border">
                  <th className="px-4 py-3 text-left text-xs text-cinema-subtle uppercase tracking-widest">#</th>
                  <th className="px-4 py-3 text-left text-xs text-cinema-subtle uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-left text-xs text-cinema-subtle uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-left text-xs text-cinema-subtle uppercase tracking-widest">Source</th>
                  <th className="px-4 py-3 text-left text-xs text-cinema-subtle uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-cinema-subtle uppercase tracking-widest">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((s, i) => {
                  const src = s.source || "direct";
                  const colorClass = SOURCE_COLORS[src] ?? "text-cinema-subtle bg-cinema-surface";
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-cinema-border/50 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-cinema-subtle tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3 text-cinema-text font-medium">
                        {s.name || <span className="text-cinema-subtle italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-cinema-text">{s.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                          {SOURCE_LABELS[src] ?? src}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "enrolled"
                            ? "text-emerald-400 bg-emerald-400/10"
                            : s.status === "notified"
                            ? "text-gold bg-gold/10"
                            : "text-cinema-subtle bg-cinema-surface"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cinema-subtle tabular-nums">
                        {format(new Date(s.signed_up_at), "MMM d, yyyy")}
                        <span className="text-cinema-subtle/50 ml-1 text-xs">
                          {format(new Date(s.signed_up_at), "h:mm a")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
