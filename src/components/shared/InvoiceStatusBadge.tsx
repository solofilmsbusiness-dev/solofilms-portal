import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/types/invoice";

const styles: Record<InvoiceStatus, string> = {
  draft: "border-cinema-border text-cinema-subtle bg-cinema-surface/20",
  sent: "border-gold/30 text-gold bg-gold/10",
  paid: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  overdue: "border-rose/30 text-rose bg-rose/10",
};

const labels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Awaiting Payment",
  paid: "Paid",
  overdue: "Overdue",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
