import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProjectEditClient } from "./ProjectEditClient";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: project }, { data: deliverables }, { data: statusHistory }] = await Promise.all([
    admin.from("projects").select("*, profiles(full_name, company_name)").eq("id", id).single(),
    admin.from("deliverables").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
    admin.from("project_status_history").select("*").eq("project_id", id).order("reached_at", { ascending: true }),
  ]);

  if (!project) notFound();

  return (
    <ProjectEditClient
      project={project}
      deliverables={deliverables ?? []}
      statusHistory={statusHistory ?? []}
    />
  );
}
