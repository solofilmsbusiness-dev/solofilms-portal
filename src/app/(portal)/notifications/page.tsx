"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/shared/PageTransition";
import { Bell, CheckCircle, Upload, Calendar, MessageSquare, Download, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
}

function typeIcon(type: string) {
  switch (type) {
    case "deliverable": return Upload;
    case "status": return CheckCircle;
    case "booking": return Calendar;
    case "review": return MessageSquare;
    case "download": return Download;
    case "payment": return CreditCard;
    default: return Bell;
  }
}

function typeColor(type: string) {
  switch (type) {
    case "deliverable": return "text-cyan";
    case "status": return "text-emerald-400";
    case "booking": return "text-gold";
    case "review": return "text-violet";
    case "download": return "text-rose";
    case "payment": return "text-emerald-400";
    default: return "text-cinema-subtle";
  }
}

function typeGlow(type: string) {
  switch (type) {
    case "deliverable": return "bg-cyan";
    case "status": return "bg-emerald-400";
    case "booking": return "bg-gold";
    case "review": return "bg-violet";
    case "download": return "bg-rose";
    case "payment": return "bg-emerald-400";
    default: return "bg-cinema-subtle";
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  return "Just now";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data); })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
              <Bell className="h-3 w-3 text-gold" />
              {unreadCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-cinema-bg">
                  {unreadCount}
                </span>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                Updates
              </span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-cinema-text">
              <span className="text-gradient-gold">Signals.</span>
            </h1>
            <p className="mt-1 text-cinema-subtle">
              Everything happening across your projects and bookings.
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.button
              onClick={markAllRead}
              className="rounded-xl border border-cinema-border glass px-4 py-2 text-sm text-cinema-subtle hover:border-gold/30 hover:text-gold transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cinema-subtle" />
          </div>
        ) : notifications.length > 0 ? (
          <StaggerContainer className="space-y-2">
            {notifications.map((n) => {
              const Icon = typeIcon(n.type);
              return (
                <StaggerItem key={n.id}>
                  <motion.div
                    className={cn(
                      "group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-5 transition-all",
                      n.is_read
                        ? "border-cinema-border/30 bg-cinema-surface/10"
                        : "border-cinema-border glass hover:border-gold/20"
                    )}
                    whileHover={{ x: 4 }}
                  >
                    {/* Inner glow on hover (unread only) */}
                    {!n.is_read && (
                      <div
                        className={`pointer-events-none absolute -top-4 -left-4 h-16 w-16 rounded-full ${typeGlow(n.type)}/10 opacity-0 blur-[30px] transition-opacity duration-300 group-hover:opacity-100`}
                      />
                    )}

                    <div className={`relative mt-0.5 shrink-0 ${typeColor(n.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            n.is_read ? "text-cinema-subtle" : "text-cinema-text"
                          )}
                        >
                          {n.title}
                        </h3>
                        {!n.is_read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-cinema-subtle">{n.message}</p>
                      <p className="mt-2 text-[11px] text-cinema-subtle/60">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cinema-border bg-cinema-surface/20">
              <Bell className="h-8 w-8 text-cinema-subtle/20" />
            </div>
            <p className="text-cinema-subtle">All quiet.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
