"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Receipt, ArrowRight, Loader2, Calendar, DollarSign } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { InvoiceStatusBadge } from "@/components/shared/InvoiceStatusBadge";
import type { InvoiceWithItems } from "@/lib/types/invoice";
import { toast } from "sonner";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InvoicesClient({ invoices }: { invoices: InvoiceWithItems[] }) {
  const [paying, setPayingId] = useState<string | null>(null);

  const handlePay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initiate payment");
      setPayingId(null);
    }
  };

  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const totalOwed = outstanding.reduce((sum, i) => sum + Number(i.total_amount), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
          <Receipt className="h-3 w-3 text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">Billing</span>
        </div>
        <h1 className="font-heading text-3xl font-bold text-cinema-text">
          <span className="text-gradient-gold">Invoices.</span>
        </h1>
        <p className="mt-1 text-cinema-subtle">Your billing history and outstanding balances.</p>
      </div>

      {/* Outstanding balance summary */}
      {totalOwed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gold/20 bg-gold/5 p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
              <DollarSign className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-cinema-subtle uppercase tracking-widest">Outstanding Balance</p>
              <p className="font-heading text-2xl font-bold text-gold">{formatCurrency(totalOwed)}</p>
            </div>
          </div>
          <p className="text-xs text-cinema-subtle">{outstanding.length} invoice{outstanding.length !== 1 ? "s" : ""} pending</p>
        </motion.div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cinema-border bg-cinema-surface/20">
            <Receipt className="h-8 w-8 text-cinema-subtle/20" />
          </div>
          <p className="text-cinema-subtle">No invoices yet.</p>
        </div>
      ) : (
        <StaggerContainer className="space-y-3">
          {invoices.map((invoice) => (
            <StaggerItem key={invoice.id}>
              <motion.div
                className="group relative overflow-hidden rounded-2xl border border-cinema-border glass p-5 hover:border-gold/20 transition-all"
                whileHover={{ x: 2 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-cinema-text truncate">{invoice.title}</h3>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    {invoice.due_date && (
                      <p className="text-xs text-cinema-subtle flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Due {formatDate(invoice.due_date)}
                      </p>
                    )}
                    {invoice.notes && (
                      <p className="mt-2 text-sm text-cinema-subtle line-clamp-2">{invoice.notes}</p>
                    )}
                    {invoice.paid_at && (
                      <p className="mt-1 text-xs text-emerald-400">Paid {formatDate(invoice.paid_at)}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="font-heading text-xl font-bold text-cinema-text">
                      {formatCurrency(Number(invoice.total_amount))}
                    </p>
                    {(invoice.status === "sent" || invoice.status === "overdue") && (
                      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                        <motion.button
                          onClick={() => handlePay(invoice.id)}
                          disabled={paying === invoice.id}
                          className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-cinema-bg hover:bg-gold-light transition-colors disabled:opacity-60"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {paying === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>Pay Now <ArrowRight className="h-3.5 w-3.5" /></>
                          )}
                        </motion.button>
                      ) : (
                        <p className="text-xs text-cinema-subtle text-right max-w-[120px]">
                          Contact us to arrange payment
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Line items preview */}
                {invoice.invoice_line_items && invoice.invoice_line_items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-cinema-border/50 space-y-1">
                    {invoice.invoice_line_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-cinema-subtle">
                        <span>{item.description}{item.quantity !== 1 ? ` × ${item.quantity}` : ""}</span>
                        <span>{formatCurrency(Number(item.amount))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
