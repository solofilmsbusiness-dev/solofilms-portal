import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
        <CheckCircle className="h-10 w-10 text-emerald-400" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-cinema-text mb-2">Payment received.</h1>
      <p className="text-cinema-subtle max-w-sm mb-8">
        Your payment has been processed successfully. A confirmation has been sent to your account.
      </p>
      <Link
        href="/invoices"
        className="rounded-xl border border-gold/30 bg-gold/10 px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold/20 transition-colors"
      >
        Back to Invoices
      </Link>
    </div>
  );
}
