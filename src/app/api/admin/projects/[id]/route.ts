import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: project }, { data: deliverables }, { data: statusHistory }] = await Promise.all([
    admin.from("projects").select("*, profiles(full_name, company_name)").eq("id", id).single(),
    admin.from("deliverables").select("*").eq("project_id", id).order("uploaded_at", { ascending: false }),
    admin.from("project_status_history").select("*").eq("project_id", id).order("reached_at", { ascending: true }),
  ]);

  return NextResponse.json({ project, deliverables: deliverables ?? [], statusHistory: statusHistory ?? [] });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const admin = createAdminClient();

  // Get current project to check if status changed
  const { data: current } = await admin.from("projects").select("status, client_id, title").eq("id", id).single();

  const { data, error } = await admin
    .from("projects")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If status changed, add history entry and notify client
  if (body.status && current && body.status !== current.status) {
    await admin.from("project_status_history").insert({
      project_id: id,
      status: body.status,
      note: body.status_note ?? null,
    });

    const statusLabels: Record<string, string> = {
      pre_production: "Pre-Production",
      filming: "Filming",
      editing: "Editing",
      review: "Review — Ready for feedback",
      delivered: "Delivered",
    };

    await admin.from("notifications").insert({
      user_id: current.client_id,
      title: "Project status updated",
      message: `"${current.title}" is now in ${statusLabels[body.status] ?? body.status}.`,
      type: "status",
      link: `/projects/${id}`,
    });
  }

  return NextResponse.json(data);
}
