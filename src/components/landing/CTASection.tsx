"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/5 blur-[150px]" />
      </div>

      <motion.div
        className="relative mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl font-bold text-cinema-text sm:text-5xl md:text-6xl">
          The Frame
          <br />
          <span className="text-gradient-gold">Starts Here.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-cinema-subtle">
          Your productions. Your deliverables. Your release strategy — all
          behind one portal.
        </p>

        <motion.div className="mt-10" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 rounded-xl bg-gold px-10 py-5 text-lg font-semibold text-cinema-bg transition-all hover:shadow-[0_0_40px_rgba(212,168,83,0.3)]"
          >
            Enter the Portal
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-cinema-subtle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Free to Join
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Lifetime Access to Deliverables
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Instant Download
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
