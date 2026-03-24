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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: projectId } = await params;
  const admin = createAdminClient();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${projectId}/${timestamp}_${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("deliverables")
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await admin
    .from("deliverables")
    .insert({
      project_id: projectId,
      file_name: file.name,
      file_path: storagePath,
      file_size_bytes: file.size,
      file_type: file.type,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify client
  const { data: project } = await admin.from("projects").select("client_id, title").eq("id", projectId).single();
  if (project) {
    await admin.from("notifications").insert({
      user_id: project.client_id,
      title: "New deliverable available",
      message: `"${file.name}" is ready for download on your project "${project.title}".`,
      type: "deliverable",
      link: `/projects/${projectId}`,
    });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: projectId } = await params;
  const { deliverable_id, file_path } = await req.json();

  const admin = createAdminClient();

  // Remove from storage
  if (file_path) {
    await admin.storage.from("deliverables").remove([file_path]);
  }

  const { error } = await admin.from("deliverables").delete().eq("id", deliverable_id).eq("project_id", projectId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
