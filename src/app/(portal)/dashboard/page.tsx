import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Calendar, Film } from "lucide-react";
import { motion } from "framer-motion";

export const metadata = {
  title: "Dashboard | Solo Films",
};

function GradientDivider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const [projectsResult, bookingsResult, deliverablesResult, notificationsResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("bookings")
        .select("id")
        .eq("client_id", user!.id)
        .gte("date", new Date().toISOString().split("T")[0])
        .eq("status", "confirmed"),
      supabase
        .from("deliverables")
        .select("id, projects!inner(client_id)")
        .eq("projects.client_id", user!.id),
      supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user!.id)
        .eq("is_read", false),
    ]);

  const projects = projectsResult.data ?? [];
  const stats = {
    activeProjects: projects.filter((p) => p.status !== "delivered").length,
    downloadsAvailable: deliverablesResult.data?.length ?? 0,
    upcomingShoots: bookingsResult.data?.length ?? 0,
    unreadNotifications: notificationsResult.data?.length ?? 0,
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Eyebrow badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                Client Portal
              </span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-cinema-text sm:text-4xl">
              Welcome back,{" "}
              <span className="text-gradient-gold">{firstName}.</span>
            </h1>
            <p className="mt-1 text-cinema-subtle">
              Here&apos;s where your work lives.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-2.5 text-sm font-medium text-gold transition-all hover:bg-gold/10"
            >
              <Calendar className="h-4 w-4" />
              Book a Shoot
            </Link>
          </div>
        </div>

        <GradientDivider />

        {/* Stats */}
        <StatsOverview stats={stats} />

        <GradientDivider />

        {/* Projects + Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Projects grid */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-surface/30 px-2.5 py-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">
                    Your Work
                  </span>
                </div>
                <h2 className="font-heading text-xl font-semibold text-cinema-text">
                  Recent Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-sm text-gold hover:underline"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {projects.length > 0 ? (
              <StaggerContainer className="grid gap-4 sm:grid-cols-2">
                {projects.map((project) => (
                  <StaggerItem key={project.id}>
                    <ProjectCard
                      id={project.id}
                      title={project.title}
                      genre={project.genre ?? ""}
                      status={project.status}
                      shootDate={project.shoot_date ?? ""}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cinema-border py-16 text-center">
                <Film className="mb-3 h-10 w-10 text-cinema-subtle/20" />
                <p className="text-sm text-cinema-subtle">Nothing in the can — yet.</p>
                <p className="mt-1 text-xs text-cinema-subtle/60">
                  Book your first shoot to get things rolling.
                </p>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div>
            <RecentActivity userId={user!.id} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
