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

export async function GET(req: Request) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");

  const admin = createAdminClient();
  let query = admin
    .from("invoices")
    .select("*, invoice_line_items(*), profiles(full_name, company_name)")
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const user = await verifyAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { client_id, title, notes, due_date, project_id, line_items } = body;

  if (!client_id || !title || !Array.isArray(line_items) || line_items.length === 0) {
    return NextResponse.json({ error: "client_id, title, and at least one line item are required" }, { status: 400 });
  }

  const total_amount = line_items.reduce(
    (sum: number, item: { quantity: number; unit_price: number }) =>
      sum + item.quantity * item.unit_price,
    0
  );

  const admin = createAdminClient();

  const { data: invoice, error: invoiceError } = await admin
    .from("invoices")
    .insert({ client_id, title, notes, due_date, project_id: project_id || null, total_amount, status: "draft" })
    .select()
    .single();

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  const { error: itemsError } = await admin.from("invoice_line_items").insert(
    line_items.map((item: { description: string; quantity: number; unit_price: number }) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  );

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json(invoice, { status: 201 });
}
