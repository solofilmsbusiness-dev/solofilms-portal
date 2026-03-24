"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Film,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Film },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/bookings", label: "Book a Shoot", icon: Calendar },
  { href: "/social-hub", label: "Social Hub", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
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
      <Link href="/" className="flex h-16 items-center gap-3 px-6 hover:opacity-80 transition-opacity">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10">
          <Film className="h-5 w-5 text-gold" />
        </div>
        <span className="font-heading text-lg font-bold text-cinema-text">
          Solo Films
        </span>
      </Link>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
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
                    layoutId="activeNav"
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

      {/* Admin panel link */}
      {isAdmin && (
        <div className="px-3 pb-1">
          <Link href="/admin">
            <motion.div
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gold/70 hover:text-gold transition-colors border border-gold/10 bg-gold/5"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Admin Panel</span>
            </motion.div>
          </Link>
        </div>
      )}

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
