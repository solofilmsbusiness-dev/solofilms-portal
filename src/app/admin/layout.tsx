import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ScrollProgressBar } from "@/components/shared/ScrollProgressBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cinema-bg">
      <ScrollProgressBar />

      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-white/[0.02]"
              style={{ top: `${(i + 1) * 5}%` }}
            />
          ))}
        </div>
      </div>

      <AdminSidebar />
      <div className="relative z-10 lg:pl-[260px]">
        <main className="min-h-screen p-4 pb-20 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
