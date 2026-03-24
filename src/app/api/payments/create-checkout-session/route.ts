import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoice_id } = await req.json();
  if (!invoice_id) return NextResponse.json({ error: "invoice_id required" }, { status: 400 });

  const admin = createAdminClient();
  const { data: invoice } = await admin
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", invoice_id)
    .eq("client_id", user.id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status !== "sent" && invoice.status !== "overdue") {
    return NextResponse.json({ error: "Invoice is not payable" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: invoice.invoice_line_items.map((item: { description: string; unit_price: number; quantity: number }) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.description },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: { invoice_id: invoice.id },
    success_url: `${appUrl}/invoices/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/invoices/cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
