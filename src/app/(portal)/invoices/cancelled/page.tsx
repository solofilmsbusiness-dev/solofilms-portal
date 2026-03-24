import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-rose/30 bg-rose/10">
        <XCircle className="h-10 w-10 text-rose" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-cinema-text mb-2">Payment cancelled.</h1>
      <p className="text-cinema-subtle max-w-sm mb-8">
        No charge was made. You can return to your invoices and try again when you&apos;re ready.
      </p>
      <Link
        href="/invoices"
        className="rounded-xl border border-cinema-border bg-cinema-surface/20 px-6 py-2.5 text-sm font-semibold text-cinema-text hover:border-gold/30 transition-colors"
      >
        Back to Invoices
      </Link>
    </div>
  );
}
