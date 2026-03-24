import { createAdminClient } from "@/lib/supabase/admin";
import { NewInvoiceForm } from "./NewInvoiceForm";

export default async function AdminNewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string }>;
}) {
  const { client_id } = await searchParams;
  const admin = createAdminClient();

  const { data: clients } = await admin
    .from("profiles")
    .select("id, full_name, company_name")
    .eq("role", "client")
    .order("full_name");

  const { data: projects } = await admin
    .from("projects")
    .select("id, title, client_id")
    .order("created_at", { ascending: false });

  return <NewInvoiceForm clients={clients ?? []} projects={projects ?? []} defaultClientId={client_id} />;
}
