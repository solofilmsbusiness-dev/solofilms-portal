"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

const titleWords = ["THE", "FUTURE", "OF", "MEDIA"];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full bg-gold/6 blur-[150px]"
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-violet/8 blur-[130px]"
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan/5 blur-[100px]"
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 60, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Horizontal lines decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-white"
            style={{ top: `${(i + 1) * 5}%` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-sm text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Client Portal
          </span>
        </motion.div>

        {/* Brand name above title */}
        <motion.p
          className="mb-1 font-heading text-3xl font-bold uppercase tracking-[0.25em] text-gradient-gold sm:text-4xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Solo Films
        </motion.p>

        {/* Title - staggered word reveal */}
        <h1 className="mb-8 font-heading text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              className={`inline-block ${
                word === "FUTURE" || word === "MEDIA" ? "text-gradient-gold" : "text-cinema-text"
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {i < titleWords.length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mb-12 max-w-2xl text-lg text-cinema-subtle sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          One portal. Every production. From the first booking to the final cut
          — with a release playbook built in.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Link href="/sign-up">
            <motion.button
              className="group relative flex items-center gap-3 rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-cinema-bg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play className="h-5 w-5" />
              Enter the Portal
              <motion.span
                className="absolute inset-0 rounded-xl bg-white/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.button>
          </Link>
          <Link href="/sign-in">
            <motion.button
              className="group flex items-center gap-3 rounded-xl border border-cinema-border bg-cinema-surface/50 px-8 py-4 text-lg font-semibold text-cinema-text transition-all hover:border-gold/30 hover:bg-cinema-surface"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative bottom fade line */}
        <motion.div
          className="mx-auto mt-20 h-px w-full max-w-lg bg-gradient-to-r from-transparent via-gold/30 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-cinema-subtle"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-cinema-subtle to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
