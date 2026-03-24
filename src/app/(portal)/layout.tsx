import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ScrollProgressBar } from "@/components/shared/ScrollProgressBar";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.full_name || user?.email || "Client";

  // Fetch unread notification count + role in parallel
  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("is_read", false),
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single(),
  ]);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-cinema-bg">
      {/* Scroll progress bar */}
      <ScrollProgressBar />

      {/* Animated gradient mesh background — fixed behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedBackground />
        {/* Subtle horizontal grid lines */}
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

      <Sidebar isAdmin={isAdmin} />
      <div className="relative z-10 lg:pl-[260px]">
        <Topbar userName={userName} unreadCount={count ?? 0} />
        <main className="min-h-[calc(100vh-4rem)] p-4 pb-20 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav unreadCount={count ?? 0} />
    </div>
  );
}
