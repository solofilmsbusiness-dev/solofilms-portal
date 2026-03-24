"use client";

import { motion } from "framer-motion";
import { Film, Download, Calendar, TrendingUp, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Film,
    title: "Project Tracking",
    description:
      "Watch your project evolve from booking to delivery with our visual timeline. Know exactly where your video stands at every stage.",
    color: "violet",
    gradient: "from-violet/20 to-transparent",
  },
  {
    icon: Download,
    title: "Instant Downloads",
    description:
      "Your deliverables are always available. Download your final cuts, raw footage, and bonus content anytime — forever.",
    color: "cyan",
    gradient: "from-cyan/20 to-transparent",
  },
  {
    icon: Calendar,
    title: "Book Your Shoot",
    description:
      "Browse available dates, pick your time slot, and lock in your next production. No back-and-forth emails needed.",
    color: "gold",
    gradient: "from-gold/20 to-transparent",
  },
  {
    icon: TrendingUp,
    title: "Social Media Hub",
    description:
      "Get trending tips, posting strategies, and genre-specific advice to maximize the impact of your content across all platforms.",
    color: "rose",
    gradient: "from-rose/20 to-transparent",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your content is protected with enterprise-grade security. Only you can access your deliverables and project details.",
    color: "amber",
    gradient: "from-amber/20 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Creative Value",
    description:
      "More than a portal — it's a creative toolkit. Social tips, trend insights, and resources designed for visionaries like you.",
    color: "violet",
    gradient: "from-violet/20 to-transparent",
  },
];

const iconColorMap: Record<string, string> = {
  violet: "text-violet",
  cyan: "text-cyan",
  gold: "text-gold",
  rose: "text-rose",
  amber: "text-amber",
};

const borderColorMap: Record<string, string> = {
  violet: "group-hover:border-violet/30",
  cyan: "group-hover:border-cyan/30",
  gold: "group-hover:border-gold/30",
  rose: "group-hover:border-rose/30",
  amber: "group-hover:border-amber/30",
};

export function FeaturesSection() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-gold">
            Everything You Need
          </span>
          <h2 className="font-heading text-4xl font-bold text-cinema-text sm:text-5xl md:text-6xl">
            Built for Creatives
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-cinema-border bg-cinema-surface/50 p-8 transition-all duration-300 hover:bg-cinema-surface ${borderColorMap[feature.color]}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className="relative">
                <div
                  className={`mb-6 inline-flex rounded-xl bg-cinema-muted/50 p-3 ${iconColorMap[feature.color]}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-cinema-text">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-cinema-subtle">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
