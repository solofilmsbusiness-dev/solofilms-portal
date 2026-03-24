import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/shared/InvoiceStatusBadge";
import type { InvoiceStatus } from "@/lib/types/invoice";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminInvoicesPage() {
  const admin = createAdminClient();
  const { data: invoices } = await admin
    .from("invoices")
    .select("*, profiles(full_name, company_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <Receipt className="h-3 w-3 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">Finance</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-cinema-text">Invoices.</h1>
          <p className="mt-1 text-cinema-subtle">Manage client invoices and track payments.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-cinema-bg hover:bg-gold-light transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      <div className="rounded-2xl border border-cinema-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cinema-border bg-cinema-surface/30">
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-cinema-subtle">Client</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-cinema-subtle">Invoice</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-cinema-subtle">Amount</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-cinema-subtle">Due</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-cinema-subtle">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cinema-border/50">
            {(invoices ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-cinema-subtle">
                  No invoices yet. Create your first invoice.
                </td>
              </tr>
            ) : (
              (invoices ?? []).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-cinema-surface/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-cinema-text">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(invoice.profiles as any)?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-cinema-subtle">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(invoice.profiles as any)?.company_name ?? ""}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-cinema-text">{invoice.title}</td>
                  <td className="px-5 py-4 font-semibold text-cinema-text">{formatCurrency(Number(invoice.total_amount))}</td>
                  <td className="px-5 py-4 text-cinema-subtle">
                    {invoice.due_date ? formatDate(invoice.due_date) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/invoices/${invoice.id}`}
                      className="text-xs font-medium text-gold hover:text-gold-light transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
