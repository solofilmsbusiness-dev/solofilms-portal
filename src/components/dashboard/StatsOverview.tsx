"use client";

import { motion } from "framer-motion";
import { Film, Download, Calendar, Bell } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsProps {
  stats: {
    activeProjects: number;
    downloadsAvailable: number;
    upcomingShoots: number;
    unreadNotifications: number;
  };
}

function AnimatedNumber({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export function StatsOverview({ stats }: StatsProps) {
  const items = [
    {
      label: "Active Projects",
      value: stats.activeProjects,
      icon: Film,
      color: "text-violet",
      bgColor: "bg-violet/10",
      borderColor: "border-violet/20",
      glowColor: "bg-violet",
    },
    {
      label: "Downloads Available",
      value: stats.downloadsAvailable,
      icon: Download,
      color: "text-cyan",
      bgColor: "bg-cyan/10",
      borderColor: "border-cyan/20",
      glowColor: "bg-cyan",
    },
    {
      label: "Upcoming Shoots",
      value: stats.upcomingShoots,
      icon: Calendar,
      color: "text-gold",
      bgColor: "bg-gold/10",
      borderColor: "border-gold/20",
      glowColor: "bg-gold",
    },
    {
      label: "Notifications",
      value: stats.unreadNotifications,
      icon: Bell,
      color: "text-rose",
      bgColor: "bg-rose/10",
      borderColor: "border-rose/20",
      glowColor: "bg-rose",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat, i) => (
        <motion.div
          key={stat.label}
          className={`group relative overflow-hidden rounded-2xl border ${stat.borderColor} glass p-5 transition-all hover:border-opacity-40`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          whileHover={{ y: -3, scale: 1.02 }}
        >
          {/* Inner glow overlay on hover */}
          <div
            className={`pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full ${stat.glowColor}/20 opacity-0 blur-[40px] transition-opacity duration-500 group-hover:opacity-100`}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-cinema-subtle">{stat.label}</p>
              <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
                <AnimatedNumber value={stat.value} />
              </p>
            </div>
            <div className={`rounded-xl ${stat.bgColor} p-2.5`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
