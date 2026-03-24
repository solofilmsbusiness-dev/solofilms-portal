import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { InvoiceDetailClient } from "./InvoiceDetailClient";

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: invoice } = await admin
    .from("invoices")
    .select("*, invoice_line_items(*), profiles(full_name, company_name)")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  return <InvoiceDetailClient invoice={invoice} />;
}
