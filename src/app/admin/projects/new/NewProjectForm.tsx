"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { GENRES, PROJECT_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

interface Client {
  id: string;
  full_name: string | null;
  company_name: string | null;
}

export function NewProjectForm({ clients, defaultClientId }: { clients: Client[]; defaultClientId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_id: defaultClientId ?? "",
    title: "",
    description: "",
    genre: "",
    shoot_date: "",
    location: "",
    notes: "",
    status: "booked",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.title) {
      toast.error("Client and project title are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Project created!");
      router.push(`/admin/projects/${data.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create project");
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl bg-cinema-surface/50 border border-cinema-border px-4 py-2.5 text-sm text-cinema-text placeholder:text-cinema-subtle/50 focus:outline-none focus:border-gold/40 transition-colors";
  const labelClass = "block text-xs text-cinema-subtle uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-cinema-subtle hover:text-gold transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3 ml-0 block">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse inline-block" />
          New Project
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
          Create <span className="text-gradient-gold">Project</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
        {/* Client */}
        <div>
          <label className={labelClass}>Client *</label>
          <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass} required>
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name || "Unnamed"}{c.company_name ? ` — ${c.company_name}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>Project Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Summer Music Video" className={inputClass} required />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief overview of the project…" rows={3} className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Genre */}
          <div>
            <label className={labelClass}>Genre</label>
            <select name="genre" value={form.genre} onChange={handleChange} className={inputClass}>
              <option value="">Select genre…</option>
              {GENRES.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Initial Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              {PROJECT_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          {/* Shoot Date */}
          <div>
            <label className={labelClass}>Shoot Date</label>
            <input type="date" name="shoot_date" value={form.shoot_date} onChange={handleChange} className={inputClass} />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Downtown LA" className={inputClass} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Internal Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes visible to the client…" rows={2} className={inputClass} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold text-cinema-bg px-6 py-3 text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating…" : "Create Project"}
        </button>
      </form>
    </div>
  );
}
