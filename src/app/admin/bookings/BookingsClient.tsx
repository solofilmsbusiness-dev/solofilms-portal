"use client";

import { useState } from "react";
import { Calendar, Check, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  shoot_type: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  client_id: string;
  profiles?: { full_name: string | null; company_name: string | null } | null;
}

const STATUS_FILTERS = ["all", "pending", "confirmed", "cancelled", "completed"] as const;

export function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      toast.success(`Booking ${status}.`);
    } catch (err: any) {
      toast.error(err.message ?? "Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
      case "cancelled": return "text-rose border-rose/20 bg-rose/10";
      case "completed": return "text-cyan border-cyan/20 bg-cyan/10";
      default: return "text-gold border-gold/20 bg-gold/10";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Bookings
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl text-cinema-text">
          All <span className="text-gradient-gold">Bookings</span>
        </h1>
        <p className="text-cinema-subtle mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium border transition-all capitalize",
              filter === s
                ? "bg-gold text-cinema-bg border-gold"
                : "border-cinema-border text-cinema-subtle hover:border-gold/30 hover:text-cinema-text"
            )}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1.5 opacity-60">
                {bookings.filter((b) => b.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-cinema-border">
            {filtered.map((booking) => {
              const isLoading = loadingId === booking.id;
              return (
                <div key={booking.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-cinema-text">
                          {booking.profiles?.full_name ?? "Unknown"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-xs text-cinema-subtle">
                        {new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        {" · "}{booking.start_time} – {booking.end_time}
                        {booking.shoot_type && ` · ${booking.shoot_type.replace(/_/g, " ")}`}
                      </div>
                      {booking.location && (
                        <div className="text-xs text-cinema-subtle mt-0.5">{booking.location}</div>
                      )}
                      {booking.notes && (
                        <div className="text-xs text-cinema-subtle/70 mt-1 italic line-clamp-1">"{booking.notes}"</div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {booking.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 text-xs hover:bg-emerald-500/20 transition-colors disabled:opacity-60"
                        >
                          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 rounded-xl bg-rose/10 border border-rose/20 text-rose px-3 py-1.5 text-xs hover:bg-rose/20 transition-colors disabled:opacity-60"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(booking.id, "completed")}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan/10 border border-cyan/20 text-cyan px-3 py-1.5 text-xs hover:bg-cyan/20 transition-colors disabled:opacity-60 shrink-0"
                      >
                        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Calendar className="h-10 w-10 text-cinema-subtle mx-auto mb-3" />
            <p className="text-cinema-subtle">No {filter !== "all" ? filter : ""} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
