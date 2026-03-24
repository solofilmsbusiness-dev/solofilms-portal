import { createAdminClient } from "@/lib/supabase/admin";
import { NewProjectForm } from "./NewProjectForm";

export default async function AdminNewProjectPage({
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

  return <NewProjectForm clients={clients ?? []} defaultClientId={client_id} />;
}
