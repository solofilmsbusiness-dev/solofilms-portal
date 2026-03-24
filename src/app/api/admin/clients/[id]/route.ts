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

  const [{ data: profile }, { data: projects }, { data: bookings }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).single(),
    admin.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    admin.from("bookings").select("*").eq("client_id", id).order("date", { ascending: false }),
  ]);

  // Get email from auth
  const { data: authUser } = await admin.auth.admin.getUserById(id);

  return NextResponse.json({
    profile: { ...profile, email: authUser?.user?.email ?? "" },
    projects: projects ?? [],
    bookings: bookings ?? [],
  });
}
