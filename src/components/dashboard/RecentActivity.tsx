"use client";

import { motion } from "framer-motion";
import { Bell, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
}

function typeColor(type: string) {
  switch (type) {
    case "deliverable": return "text-cyan";
    case "status": return "text-emerald-400";
    case "booking": return "text-gold";
    case "review": return "text-violet";
    default: return "text-cinema-subtle";
  }
}

function typeDotColor(type: string) {
  switch (type) {
    case "deliverable": return "bg-cyan";
    case "status": return "bg-emerald-400";
    case "booking": return "bg-gold";
    case "review": return "bg-violet";
    default: return "bg-cinema-subtle";
  }
}

export function RecentActivity({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data.slice(0, 5));
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div className="glass rounded-2xl border border-cinema-border p-6">
      {/* Eyebrow badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
          Recent Activity
        </span>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              {/* Colored dot indicator */}
              <div className="mt-1.5 flex-shrink-0">
                <span className={`block h-2 w-2 rounded-full ${typeDotColor(n.type)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${typeColor(n.type)} font-medium`}>{n.title}</p>
                <p className="mt-0.5 text-xs text-cinema-subtle line-clamp-2">{n.message}</p>
                <p className="mt-1 text-[10px] text-cinema-subtle/60">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="mb-2 h-8 w-8 text-cinema-subtle/20" />
          <p className="text-sm text-cinema-subtle">No signals yet.</p>
        </div>
      )}
    </div>
  );
}
