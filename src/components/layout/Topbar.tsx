"use client";

import { motion } from "framer-motion";
import { Bell, Menu, Film } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface TopbarProps {
  userName?: string;
  unreadCount?: number;
  onMenuClick?: () => void;
}

export function Topbar({
  userName = "Client",
  unreadCount = 0,
  onMenuClick,
}: TopbarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cinema-border bg-cinema-bg/60 px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile menu + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-cinema-subtle hover:text-cinema-text lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Film className="h-5 w-5 text-gold" />
          <span className="font-heading text-base font-bold">Solo Films</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link href="/notifications">
          <motion.button
            className="relative rounded-xl border border-cinema-border bg-cinema-surface/50 p-2.5 text-cinema-subtle transition-colors hover:text-cinema-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-cinema-bg">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>
        </Link>

        {/* Avatar */}
        <Link href="/settings">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="h-9 w-9 border border-cinema-border">
              <AvatarFallback className="bg-gold/10 text-xs font-semibold text-gold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </Link>
      </div>
    </header>
  );
}
