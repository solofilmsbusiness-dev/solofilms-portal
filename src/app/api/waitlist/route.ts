import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, source } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check for duplicate
    const { data: existing } = await admin
      .from("waitlist")
      .select("id, signed_up_at")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      // Return their existing position
      const { count } = await admin
        .from("waitlist")
        .select("id", { count: "exact", head: true })
        .lt("signed_up_at", existing.signed_up_at);

      return NextResponse.json({
        success: true,
        duplicate: true,
        position: (count ?? 0) + 1,
      });
    }

    // Insert new signup
    const { data: inserted, error } = await admin
      .from("waitlist")
      .insert({
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        source: source || "direct",
      })
      .select("id, signed_up_at")
      .single();

    if (error) {
      // Handle race condition duplicate
      if (error.code === "23505") {
        return NextResponse.json({ success: true, duplicate: true, position: 1 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get position (count of people who signed up before them)
    const { count } = await admin
      .from("waitlist")
      .select("id", { count: "exact", head: true })
      .lt("signed_up_at", inserted.signed_up_at);

    return NextResponse.json({
      success: true,
      duplicate: false,
      position: (count ?? 0) + 1,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
