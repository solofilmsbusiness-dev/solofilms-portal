"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/shared/PageTransition";
import { User, Mail, Phone, Building, Loader2, Check, Settings } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setFullName(data.full_name ?? "");
          setEmail(data.email ?? "");
          setPhone(data.phone ?? "");
          setCompany(data.company_name ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, companyName: company }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      toast.success("Profile saved!");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1">
            <Settings className="h-3 w-3 text-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
              Account
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-cinema-text">
            Your{" "}
            <span className="text-gradient-gold">Profile.</span>
          </h1>
          <p className="mt-1 text-cinema-subtle">
            Keep your details current so we always know how to reach you.
          </p>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="glass rounded-2xl border border-cinema-border p-6 sm:p-8">
          <div className="mb-6">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-cinema-border bg-cinema-surface/30 px-2.5 py-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-cinema-subtle">
                Profile Information
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cinema-subtle" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-cinema-subtle">
                  Full Name
                </label>
                <User className="absolute left-4 top-[42px] h-4 w-4 text-cinema-subtle" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-cinema w-full py-3 pl-11 pr-4 text-sm"
                />
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-cinema-subtle">
                  Email
                </label>
                <Mail className="absolute left-4 top-[42px] h-4 w-4 text-cinema-subtle" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="input-cinema w-full py-3 pl-11 pr-4 text-sm opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-cinema-subtle">
                  Phone
                </label>
                <Phone className="absolute left-4 top-[42px] h-4 w-4 text-cinema-subtle" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="input-cinema w-full py-3 pl-11 pr-4 text-sm"
                />
              </div>

              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-cinema-subtle">
                  Company / Brand
                </label>
                <Building className="absolute left-4 top-[42px] h-4 w-4 text-cinema-subtle" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company or brand name"
                  className="input-cinema w-full py-3 pl-11 pr-4 text-sm"
                />
              </div>

              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-cinema-bg transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <><Check className="h-4 w-4" /> Saved</>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
