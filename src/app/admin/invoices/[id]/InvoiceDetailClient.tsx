"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, AlertCircle, Trash2, Loader2, CheckCircle } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/shared/InvoiceStatusBadge";
import type { InvoiceWithItems, InvoiceStatus } from "@/lib/types/invoice";
import { toast } from "sonner";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InvoiceDetailClient({ invoice: initial }: { invoice: InvoiceWithItems }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: InvoiceStatus, label: string) => {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoice((prev) => ({ ...prev, status }));
      toast.success(`Invoice ${label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this draft invoice? This cannot be undone.")) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Invoice deleted");
      router.push("/admin/invoices");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
      setLoading(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientName = (invoice.profiles as any)?.full_name ?? "Unknown client";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientCompany = (invoice.profiles as any)?.company_name;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/invoices")} className="text-cinema-subtle hover:text-cinema-text transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-cinema-text">{invoice.title}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-cinema-subtle">{clientName}{clientCompany ? ` — ${clientCompany}` : ""}</p>
        </div>
      </div>

      {/* Invoice card */}
      <div className="rounded-2xl border border-cinema-border bg-cinema-surface/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cinema-border/50 flex justify-between items-start">
          <div>
            <p className="text-xs text-cinema-subtle uppercase tracking-wider mb-1">Invoice date</p>
            <p className="text-sm text-cinema-text">{formatDate(invoice.created_at)}</p>
          </div>
          {invoice.due_date && (
            <div className="text-right">
              <p className="text-xs text-cinema-subtle uppercase tracking-wider mb-1">Due date</p>
              <p className="text-sm text-cinema-text">{formatDate(invoice.due_date)}</p>
            </div>
          )}
          {invoice.paid_at && (
            <div className="text-right">
              <p className="text-xs text-cinema-subtle uppercase tracking-wider mb-1">Paid</p>
              <p className="text-sm text-emerald-400">{formatDate(invoice.paid_at)}</p>
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-cinema-subtle uppercase tracking-wider">
                <th className="text-left pb-3">Description</th>
                <th className="text-center pb-3">Qty</th>
                <th className="text-right pb-3">Unit Price</th>
                <th className="text-right pb-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-border/30">
              {invoice.invoice_line_items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-cinema-text">{item.description}</td>
                  <td className="py-3 text-center text-cinema-subtle">{item.quantity}</td>
                  <td className="py-3 text-right text-cinema-subtle">{formatCurrency(Number(item.unit_price))}</td>
                  <td className="py-3 text-right font-medium text-cinema-text">{formatCurrency(Number(item.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t border-cinema-border/50 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-cinema-subtle uppercase tracking-wider">Total</p>
              <p className="font-heading text-2xl font-bold text-gold">{formatCurrency(Number(invoice.total_amount))}</p>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="px-6 pb-6">
            <p className="text-xs text-cinema-subtle uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-cinema-subtle">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {invoice.status === "draft" && (
          <>
            <motion.button
              onClick={() => updateStatus("sent", "sent to client")}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-cinema-bg hover:bg-gold-light transition-colors disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading === "sent" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send to Client
            </motion.button>
            <motion.button
              onClick={handleDelete}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-xl border border-rose/30 px-5 py-2.5 text-sm font-semibold text-rose hover:bg-rose/10 transition-colors disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </motion.button>
          </>
        )}
        {(invoice.status === "sent" || invoice.status === "overdue") && (
          <>
            <motion.button
              onClick={() => updateStatus("paid", "marked as paid")}
              disabled={loading !== null}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading === "paid" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Mark as Paid
            </motion.button>
            {invoice.status === "sent" && (
              <motion.button
                onClick={() => updateStatus("overdue", "marked overdue")}
                disabled={loading !== null}
                className="flex items-center gap-2 rounded-xl border border-rose/30 px-5 py-2.5 text-sm font-semibold text-rose hover:bg-rose/10 transition-colors disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading === "overdue" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                Mark Overdue
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
