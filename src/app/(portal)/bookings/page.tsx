"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/shared/PageTransition";
import { CalendarGrid } from "@/components/bookings/CalendarGrid";
import { SHOOT_TYPES } from "@/lib/constants";
import { format, addHours, parse } from "date-fns";
import { Clock, MapPin, FileText, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

function toSupabaseTime(timeStr: string): string {
  const d = parse(timeStr, "h:mm aa", new Date());
  return format(d, "HH:mm:ss");
}

export default function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/bookings/available-slots")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBlockedDates(data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedType) return;
    setSubmitting(true);
    try {
      const startTime = toSupabaseTime(selectedTime);
      const startDate = parse(selectedTime, "h:mm aa", selectedDate);
      const endTime = format(addHours(startDate, 2), "HH:mm:ss");

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: format(selectedDate, "yyyy-MM-dd"),
          startTime,
          endTime,
          shootType: selectedType,
          location,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Booking failed");
      }
      setSubmitted(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = selectedDate && selectedTime && selectedType;

  if (submitted) {
    return (
      <PageTransition>
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center">
          {/* Animated success glow */}
          <div className="relative mb-6">
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Check className="h-10 w-10 text-emerald-400" />
            </motion.div>
            {/* Radial glow */}
            <div className="absolute inset-0 -z-10 h-24 w-24 rounded-full bg-emerald-500/20 blur-[40px]" />
          </div>

          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
              Booking Requested
            </span>
          </div>

          <h2 className="mt-4 font-heading text-3xl font-bold text-cinema-text">
            It&apos;s on the{" "}
            <span className="text-gradient-gold">Calendar.</span>
          </h2>
          <p className="mt-3 text-cinema-subtle">
            Your {selectedType?.replace(/_/g, " ")} shoot has been locked in for{" "}
            <span className="text-gold font-medium">
              {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </span>{" "}
            at{" "}
            <span className="text-gold font-medium">{selectedTime}</span>.
          </p>
          <p className="mt-2 text-sm text-cinema-subtle/70">
            We&apos;ll review it and confirm your slot.
          </p>
          <motion.button
            onClick={() => {
              setSubmitted(false);
              setSelectedDate(null);
              setSelectedTime(null);
              setSelectedType(null);
              setLocation("");
              setNotes("");
            }}
            className="mt-8 rounded-xl border border-cinema-border glass px-6 py-3 text-sm font-medium text-cinema-text hover:border-gold/30 hover:text-gold transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Another Shoot
          </motion.button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
              Schedule
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-cinema-text">
            Book a{" "}
            <span className="text-gradient-gold">Shoot</span>
          </h1>
          <p className="mt-1 text-cinema-subtle">
            Choose your date, set your vision, and lock it in.
          </p>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarGrid
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              blockedDates={blockedDates}
            />
          </div>

          {/* Booking form */}
          <div className="space-y-4 lg:col-span-1">
            {/* Selected date display */}
            {selectedDate && (
              <motion.div
                className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-center backdrop-blur-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-cinema-subtle">
                  Selected Date
                </p>
                <p className="mt-1 font-heading text-2xl font-bold text-gold">
                  {format(selectedDate, "EEEE, MMMM d")}
                </p>
              </motion.div>
            )}

            {/* Time slots */}
            {selectedDate && (
              <motion.div
                className="glass rounded-2xl border border-cinema-border p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cinema-text">
                  <Clock className="h-4 w-4 text-gold" /> Pick a Time
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <motion.button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        selectedTime === time
                          ? "border-gold bg-gold/10 text-gold shadow-[0_0_12px_rgba(212,168,83,0.2)]"
                          : "border-cinema-border text-cinema-subtle hover:border-gold/30 hover:text-gold"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Shoot type */}
            {selectedTime && (
              <motion.div
                className="glass rounded-2xl border border-cinema-border p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-cinema-text">
                  <FileText className="h-4 w-4 text-gold" /> Shoot Type
                </h3>
                <div className="space-y-2">
                  {SHOOT_TYPES.map((type) => (
                    <motion.button
                      key={type.key}
                      onClick={() => setSelectedType(type.key)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        selectedType === type.key
                          ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(212,168,83,0.1)]"
                          : "border-cinema-border hover:border-gold/30"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <p className={`text-sm font-medium ${selectedType === type.key ? "text-gold" : "text-cinema-text"}`}>
                        {type.label}
                      </p>
                      <p className="mt-0.5 text-xs text-cinema-subtle">
                        {type.duration} &middot; {type.price}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Location & notes */}
            {selectedType && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-cinema-subtle" />
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-cinema w-full py-3 pl-11 pr-4 text-sm"
                  />
                </div>
                <textarea
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input-cinema w-full p-4 text-sm"
                />

                <motion.button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="w-full rounded-xl bg-gold py-3.5 text-sm font-semibold text-cinema-bg transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    "Lock It In"
                  )}
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
