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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("*, profiles(full_name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify client of booking status change
  const statusMessages: Record<string, string> = {
    confirmed: "Your booking has been confirmed!",
    cancelled: "Your booking has been cancelled.",
    completed: "Your booking is marked as completed.",
  };

  if (statusMessages[status]) {
    await admin.from("notifications").insert({
      user_id: data.client_id,
      title: `Booking ${status}`,
      message: statusMessages[status],
      type: "booking",
      link: "/bookings",
    });
  }

  return NextResponse.json(data);
}
