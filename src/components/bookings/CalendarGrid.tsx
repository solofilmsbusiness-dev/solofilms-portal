"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  bookedDates?: Date[];
  blockedDates?: string[];
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  selectedDate,
  onDateSelect,
  bookedDates = [],
  blockedDates = [],
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const today = startOfDay(new Date());

  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-cinema-border p-6 sm:p-8">
      {/* Top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gold/[0.04] via-transparent to-transparent" />

      {/* Month navigation */}
      <div className="relative mb-8 flex items-center justify-between">
        <motion.button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-xl border border-cinema-border bg-cinema-muted/20 p-2.5 text-cinema-subtle transition-all hover:border-gold/30 hover:text-gold hover:shadow-[0_0_12px_rgba(212,168,83,0.15)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <div className="text-center">
          <h3 className="font-heading text-2xl font-semibold sm:text-3xl">
            <span className="text-gradient-gold">
              {format(currentMonth, "MMMM")}
            </span>{" "}
            <span className="text-cinema-subtle font-light">
              {format(currentMonth, "yyyy")}
            </span>
          </h3>
        </div>

        <motion.button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-xl border border-cinema-border bg-cinema-muted/20 p-2.5 text-cinema-subtle transition-all hover:border-gold/30 hover:text-gold hover:shadow-[0_0_12px_rgba(212,168,83,0.15)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Gradient divider */}
      <div className="mb-5 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Weekday headers */}
      <div className="mb-3 grid grid-cols-7 text-center">
        {weekDays.map((day) => (
          <div
            key={day}
            className="pb-3 text-xs font-semibold uppercase tracking-widest text-cinema-subtle/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Separator under weekday headers */}
      <div className="mb-3 h-px bg-cinema-border/50" />

      {/* Day grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentMonth, "yyyy-MM")}
          className="grid grid-cols-7 gap-1.5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {days.map((day) => {
            const inMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isPast = isBefore(day, today);
            const isBlocked = blockedDates.some(
              (d) => isSameDay(new Date(d + "T00:00:00"), day)
            );
            const isBooked = bookedDates.some((d) => isSameDay(d, day));
            const disabled = !inMonth || isPast || isBlocked;
            const isTodayDate = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                onClick={() => !disabled && onDateSelect(day)}
                disabled={disabled}
                className={cn(
                  "relative flex h-12 items-center justify-center rounded-xl text-base transition-all sm:h-14",
                  !inMonth && "text-cinema-muted/20",
                  inMonth && !disabled && "text-cinema-text hover:bg-gold/10 hover:text-gold",
                  isPast && inMonth && "text-cinema-muted/30",
                  isBlocked && "text-cinema-muted/20 line-through",
                  isSelected &&
                    "bg-gold text-cinema-bg font-bold shadow-[0_0_25px_rgba(212,168,83,0.5)] scale-105",
                  isTodayDate && !isSelected && "font-bold text-gold ring-2 ring-gold/30 animate-pulse-gold",
                  isBooked && !isSelected && "ring-1 ring-violet/40"
                )}
                whileHover={!disabled ? { scale: 1.12 } : undefined}
                whileTap={!disabled ? { scale: 0.9 } : undefined}
              >
                {format(day, "d")}
                {isTodayDate && !isSelected && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-gold" />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
