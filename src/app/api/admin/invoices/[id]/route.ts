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
  const { data, error } = await admin
    .from("invoices")
    .select("*, invoice_line_items(*), profiles(full_name, company_name, email:id)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const admin = createAdminClient();

  // Fetch current invoice
  const { data: invoice } = await admin.from("invoices").select("*, profiles(full_name)").eq("id", id).single();
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await admin
    .from("invoices")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify client when invoice is sent
  if (body.status === "sent" && invoice.status === "draft") {
    await admin.from("notifications").insert({
      user_id: invoice.client_id,
      title: "New invoice ready",
      message: `Invoice "${invoice.title}" is ready for payment.`,
      type: "payment",
      link: `/invoices/${id}`,
    });
  }

  // Notify client when admin manually marks paid
  if (body.status === "paid" && invoice.status !== "paid") {
    await admin.from("notifications").insert({
      user_id: invoice.client_id,
      title: "Payment confirmed",
      message: `Your payment for "${invoice.title}" has been received. Thank you.`,
      type: "payment",
      link: `/invoices/${id}`,
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: invoice } = await admin.from("invoices").select("status").eq("id", id).single();
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status !== "draft") {
    return NextResponse.json({ error: "Only draft invoices can be deleted" }, { status: 400 });
  }

  const { error } = await admin.from("invoices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
