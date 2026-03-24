import { createAdminClient } from "@/lib/supabase/admin";
import { BookingsClient } from "./BookingsClient";

export default async function AdminBookingsPage() {
  const admin = createAdminClient();
  const { data: bookings } = await admin
    .from("bookings")
    .select("*, profiles(full_name, company_name)")
    .order("date", { ascending: false });

  return <BookingsClient initialBookings={bookings ?? []} />;
}
