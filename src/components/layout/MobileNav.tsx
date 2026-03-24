"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Film, Calendar, TrendingUp, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Film },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/bookings", label: "Book", icon: Calendar },
  { href: "/social-hub", label: "Social", icon: TrendingUp },
];

export function MobileNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cinema-border bg-cinema-bg/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge = item.href === "/dashboard" && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-gold" : "text-cinema-subtle"
              )}
            >
              {isActive && (
                <motion.div
                  className="absolute -top-2 h-0.5 w-8 rounded-full bg-gold"
                  layoutId="mobileActive"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold animate-pulse" />
                )}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
