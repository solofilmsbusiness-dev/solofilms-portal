"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, Trash2, Download, FileVideo, CheckCircle } from "lucide-react";
import { GENRES, PROJECT_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  genre: string | null;
  shoot_date: string | null;
  location: string | null;
  notes: string | null;
  client_id: string;
  profiles?: { full_name: string | null; company_name: string | null } | null;
}

interface Deliverable {
  id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  file_type: string | null;
  uploaded_at: string;
}

interface StatusHistory {
  id: string;
  status: string;
  reached_at: string;
  note: string | null;
}

export function ProjectEditClient({
  project: initialProject,
  deliverables: initialDeliverables,
  statusHistory,
}: {
  project: Project;
  deliverables: Deliverable[];
  statusHistory: StatusHistory[];
}) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProject((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStatusClick = (status: string) => {
    setProject((prev) => ({ ...prev, status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          status: project.status,
          genre: project.genre,
          shoot_date: project.shoot_date || null,
          location: project.location,
          notes: project.notes,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Project saved!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/projects/${project.id}/deliverables`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeliverables((prev) => [data, ...prev]);
      toast.success(`"${file.name}" uploaded!`);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (deliverable: Deliverable) => {
    if (!confirm(`Delete "${deliverable.file_name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/deliverables`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverable_id: deliverable.id, file_path: deliverable.file_path }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDeliverables((prev) => prev.filter((d) => d.id !== deliverable.id));
      toast.success("Deliverable deleted.");
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed");
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const inputClass = "w-full rounded-xl bg-cinema-surface/50 border border-cinema-border px-4 py-2.5 text-sm text-cinema-text placeholder:text-cinema-subtle/50 focus:outline-none focus:border-gold/40 transition-colors";
  const labelClass = "block text-xs text-cinema-subtle uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-cinema-subtle hover:text-gold transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3 block">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse inline-block" />
          {project.profiles?.full_name ?? "Client"}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
          <span className="text-gradient-gold">{project.title}</span>
        </h1>
      </div>

      {/* Status Pipeline */}
      <div className="glass rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Project Status
        </div>
        <div className="flex flex-wrap gap-2">
          {PROJECT_STATUSES.map((s) => {
            const isActive = project.status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleStatusClick(s.key)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-medium transition-all border",
                  isActive
                    ? "bg-gold text-cinema-bg border-gold shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                    : "bg-cinema-surface/50 text-cinema-subtle border-cinema-border hover:border-gold/30 hover:text-cinema-text"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Details */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Project Details
        </div>

        <div>
          <label className={labelClass}>Title</label>
          <input name="title" value={project.title} onChange={handleChange} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" value={project.description ?? ""} onChange={handleChange} rows={3} className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Genre</label>
            <select name="genre" value={project.genre ?? ""} onChange={handleChange} className={inputClass}>
              <option value="">Select genre…</option>
              {GENRES.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Shoot Date</label>
            <input type="date" name="shoot_date" value={project.shoot_date ?? ""} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input name="location" value={project.location ?? ""} onChange={handleChange} placeholder="e.g. Downtown LA" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" value={project.notes ?? ""} onChange={handleChange} rows={2} className={inputClass} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gold text-cinema-bg px-6 py-2.5 text-sm font-medium hover:bg-gold/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Deliverables */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 text-xs text-gold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Deliverables ({deliverables.length})
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-2 text-xs text-gold hover:bg-gold/10 transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Upload File"}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        </div>

        {deliverables.length > 0 ? (
          <div className="space-y-2">
            {deliverables.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cinema-surface/30 border border-cinema-border hover:border-gold/20 transition-colors group">
                <FileVideo className="h-5 w-5 text-cinema-subtle shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-cinema-text truncate">{d.file_name}</div>
                  <div className="text-xs text-cinema-subtle">{formatBytes(d.file_size_bytes)} · {new Date(d.uploaded_at).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleDelete(d)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose/10 text-cinema-subtle hover:text-rose transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <FileVideo className="h-8 w-8 text-cinema-subtle mx-auto mb-2" />
            <p className="text-cinema-subtle text-sm">No deliverables yet. Upload files for the client to download.</p>
          </div>
        )}
      </div>
    </div>
  );
}
