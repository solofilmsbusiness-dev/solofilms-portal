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

  // Get all clients with their project count
  const { data: clients, error } = await admin
    .from("profiles")
    .select("id, full_name, company_name, phone, created_at, role")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get project counts per client
  const { data: projectCounts } = await admin
    .from("projects")
    .select("client_id");

  const countMap: Record<string, number> = {};
  projectCounts?.forEach((p) => {
    countMap[p.client_id] = (countMap[p.client_id] || 0) + 1;
  });

  // Get auth user emails
  const { data: authData } = await admin.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  authData?.users?.forEach((u) => {
    emailMap[u.id] = u.email ?? "";
  });

  const result = (clients ?? []).map((c) => ({
    ...c,
    email: emailMap[c.id] ?? "",
    project_count: countMap[c.id] ?? 0,
  }));

  return NextResponse.json(result);
}
