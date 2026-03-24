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

export async function GET() {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*, profiles(full_name, company_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { client_id, title, description, genre, shoot_date, location, notes, status } = body;

  if (!client_id || !title) {
    return NextResponse.json({ error: "client_id and title are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert({ client_id, title, description, genre, shoot_date, location, notes, status: status ?? "booked" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Add initial status history
  await admin.from("project_status_history").insert({
    project_id: data.id,
    status: status ?? "booked",
    note: "Project created",
  });

  // Notify client
  await admin.from("notifications").insert({
    user_id: client_id,
    title: "New project created",
    message: `Your project "${title}" has been created and is now in progress.`,
    type: "status",
    link: `/projects/${data.id}`,
  });

  return NextResponse.json(data, { status: 201 });
}
