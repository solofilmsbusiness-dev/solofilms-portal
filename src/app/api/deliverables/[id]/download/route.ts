import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the deliverable belongs to a project owned by this user
  const { data: deliverable, error } = await supabase
    .from("deliverables")
    .select("*, projects!inner(client_id)")
    .eq("id", id)
    .eq("projects.client_id", user.id)
    .single();

  if (error || !deliverable)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate a signed URL (5 minute expiry) using service role
  const admin = createAdminClient();
  const { data: signed, error: urlError } = await admin.storage
    .from("deliverables")
    .createSignedUrl(deliverable.file_path, 300);

  if (urlError || !signed)
    return NextResponse.json(
      { error: "Could not generate download link" },
      { status: 500 }
    );

  return NextResponse.json({ url: signed.signedUrl, fileName: deliverable.file_name });
}
