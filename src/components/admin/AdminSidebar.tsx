"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Film,
  Calendar,
  Receipt,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/clients", label: "Clients", icon: Users, exact: false },
  { href: "/admin/projects", label: "Projects", icon: Film, exact: false },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar, exact: false },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-cinema-border bg-cinema-bg/80 backdrop-blur-xl lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
          <ShieldCheck className="h-5 w-5 text-gold" />
        </div>
        <div>
          <span className="font-heading text-lg font-bold text-cinema-text block leading-tight">
            Admin
          </span>
          <span className="text-[10px] text-cinema-subtle uppercase tracking-widest">
            Solo Films
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-gold"
                    : "text-cinema-subtle hover:text-cinema-text"
                )}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gold/8 border border-gold/10"
                    layoutId="adminActiveNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10 h-4.5 w-4.5" />
                <span className="relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Back to portal */}
      <div className="px-3 pb-2">
        <Link href="/dashboard">
          <motion.div
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cinema-subtle hover:text-cinema-text transition-colors"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Portal</span>
          </motion.div>
        </Link>
      </div>

      {/* Sign out */}
      <div className="border-t border-cinema-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-cinema-subtle transition-colors hover:text-rose"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
