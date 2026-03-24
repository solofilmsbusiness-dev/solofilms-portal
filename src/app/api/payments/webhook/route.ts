import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any;
    const invoiceId = session.metadata?.invoice_id;

    if (invoiceId) {
      const admin = createAdminClient();

      const { data: invoice } = await admin
        .from("invoices")
        .select("client_id, title")
        .eq("id", invoiceId)
        .single();

      if (invoice) {
        await admin
          .from("invoices")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_checkout_session_id: session.id,
          })
          .eq("id", invoiceId);

        await admin.from("notifications").insert({
          user_id: invoice.client_id,
          title: "Payment confirmed",
          message: `Your payment for "${invoice.title}" has been received. Thank you.`,
          type: "payment",
          link: `/invoices/${invoiceId}`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
