"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; full_name: string | null; company_name: string | null; }
interface Project { id: string; title: string; client_id: string; }
interface LineItem { description: string; quantity: number; unit_price: number; }

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function NewInvoiceForm({
  clients,
  projects,
  defaultClientId,
}: {
  clients: Client[];
  projects: Project[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  const clientProjects = projects.filter((p) => p.client_id === clientId);
  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const addItem = () => setLineItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title || lineItems.some((i) => !i.description)) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          project_id: projectId || null,
          title,
          notes,
          due_date: dueDate || null,
          line_items: lineItems,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Invoice created");
      router.push(`/admin/invoices/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invoice");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-cinema-subtle hover:text-cinema-text transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-cinema-text">New Invoice</h1>
          <p className="text-sm text-cinema-subtle">Create an invoice for a client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client + Project */}
        <div className="rounded-2xl border border-cinema-border bg-cinema-surface/10 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cinema-text uppercase tracking-wider">Client</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-cinema-subtle mb-1.5">Client *</label>
              <select
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setProjectId(""); }}
                className="input-cinema w-full px-3 py-2.5 text-sm"
                required
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name ?? c.id}{c.company_name ? ` — ${c.company_name}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-cinema-subtle mb-1.5">Project (optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="input-cinema w-full px-3 py-2.5 text-sm"
                disabled={!clientId || clientProjects.length === 0}
              >
                <option value="">None</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoice details */}
        <div className="rounded-2xl border border-cinema-border bg-cinema-surface/10 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cinema-text uppercase tracking-wider">Details</h2>
          <div>
            <label className="block text-xs text-cinema-subtle mb-1.5">Invoice Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Music Video Production — March 2026"
              className="input-cinema w-full px-3 py-2.5 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-cinema-subtle mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-cinema w-full px-3 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-cinema-subtle mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Payment terms, bank details, or any additional info..."
              className="input-cinema w-full px-3 py-2.5 text-sm resize-none"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-2xl border border-cinema-border bg-cinema-surface/10 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cinema-text uppercase tracking-wider">Line Items</h2>
          <div className="space-y-2">
            {lineItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder="Description"
                  className="input-cinema flex-1 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 1)}
                  min={0.01}
                  step="0.01"
                  className="input-cinema w-16 px-2 py-2 text-sm text-center"
                  title="Qty"
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  className="input-cinema w-28 px-3 py-2 text-sm"
                  title="Unit price"
                />
                <span className="w-20 text-right text-sm text-cinema-subtle shrink-0">
                  {formatCurrency(item.quantity * item.unit_price)}
                </span>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-cinema-subtle hover:text-rose transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm text-cinema-subtle hover:text-gold transition-colors"
          >
            <Plus className="h-4 w-4" /> Add item
          </button>

          <div className="flex justify-end pt-2 border-t border-cinema-border/50">
            <div className="text-right">
              <p className="text-xs text-cinema-subtle uppercase tracking-wider">Total</p>
              <p className="font-heading text-2xl font-bold text-gold">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-cinema-bg hover:bg-gold-light transition-colors disabled:opacity-60"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Invoice"}
        </motion.button>
      </form>
    </div>
  );
}
