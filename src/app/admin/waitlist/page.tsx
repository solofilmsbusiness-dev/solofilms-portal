import { createAdminClient } from "@/lib/supabase/admin";
import { WaitlistAdminClient } from "./WaitlistAdminClient";

export default async function AdminWaitlistPage() {
  const admin = createAdminClient();

  const { data: signups, count } = await admin
    .from("waitlist")
    .select("id, email, name, source, signed_up_at, status", { count: "exact" })
    .order("signed_up_at", { ascending: false });

  // Source breakdown
  const sourceBreakdown: Record<string, number> = {};
  (signups ?? []).forEach((s) => {
    const src = s.source || "direct";
    sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
  });

  return (
    <WaitlistAdminClient
      signups={signups ?? []}
      total={count ?? 0}
      sourceBreakdown={sourceBreakdown}
    />
  );
}
