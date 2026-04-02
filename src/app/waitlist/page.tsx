"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WaitlistForm() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "direct";

  const [count, setCount] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ position: number; duplicate: boolean } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something broke. Try again.");
        return;
      }

      setResult({ position: data.position, duplicate: data.duplicate });
      if (!data.duplicate) {
        setCount((prev) => (prev !== null ? prev + 1 : null));
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gold/10 border border-gold/20 mx-auto">
          <span className="text-4xl">🎓</span>
        </div>

        <div>
          <p className="text-cinema-subtle text-sm uppercase tracking-widest mb-2">
            {result.duplicate ? "Already on the list" : "You're in."}
          </p>
          <p className="font-heading text-5xl sm:text-6xl text-gradient-gold">
            #{result.position}
          </p>
          <p className="text-cinema-subtle mt-2">
            {result.duplicate
              ? "You already locked in your spot."
              : "in line. Don't sleep on it."}
          </p>
        </div>

        <div className="glass rounded-2xl p-5 text-left space-y-2 max-w-sm mx-auto">
          <p className="text-cinema-text text-sm font-medium">Move up the list →</p>
          <p className="text-cinema-subtle text-sm">
            Share this with other filmmakers who need to stop babying their camera work.
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText("https://hoodtorialsuniversity.com/waitlist");
            }}
            className="w-full mt-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-2.5 text-sm text-gold hover:bg-gold/10 transition-colors"
          >
            Copy waitlist link
          </button>
        </div>

        <p className="text-cinema-subtle text-xs">
          We'll hit you when we launch.{" "}
          <a
            href="https://instagram.com/hoodtorials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            Follow @hoodtorials
          </a>{" "}
          for updates.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {count !== null && (
        <p className="text-center text-cinema-subtle text-sm">
          <span className="text-gold font-medium">{count.toLocaleString()}</span>{" "}
          {count === 1 ? "person" : "people"} already on the waitlist
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-cinema-subtle uppercase tracking-widest mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-cinema-border bg-cinema-surface px-4 py-3 text-cinema-text placeholder:text-cinema-subtle/50 focus:border-gold/40 focus:outline-none focus:ring-0 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-cinema-subtle uppercase tracking-widest mb-1.5">
            Email <span className="text-gold">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-xl border border-cinema-border bg-cinema-surface px-4 py-3 text-cinema-text placeholder:text-cinema-subtle/50 focus:border-gold/40 focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-rose text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full rounded-xl bg-gold px-6 py-3.5 font-heading text-lg tracking-wide text-black hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Locking you in..." : "Get Early Access →"}
      </button>

      <p className="text-center text-cinema-subtle text-xs">
        No spam. Just the real stuff when we launch.
      </p>
    </form>
  );
}

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-text">
      {/* Film grain */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-[400px] w-[400px] rounded-full bg-violet/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold uppercase tracking-widest mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Hoodtorial University
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl leading-none mb-4">
            Film school,
            <br />
            <span className="text-gradient-gold">but make it hood.</span>
          </h1>

          <p className="max-w-lg mx-auto text-cinema-subtle text-base sm:text-lg leading-relaxed">
            Learn cinematography, camera technique, and post-production —
            no babying, no corporate nonsense. Just the real stuff.
          </p>
        </div>

        {/* Value props */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
          {[
            { emoji: "🎥", text: "Camera technique that actually works" },
            { emoji: "🔥", text: "No fluff, no filler — just results" },
            { emoji: "🎓", text: "Built for self-taught filmmakers" },
          ].map((item) => (
            <div
              key={item.text}
              className="glass rounded-xl p-3 text-center"
            >
              <span className="text-xl">{item.emoji}</span>
              <p className="text-cinema-subtle text-xs mt-1 leading-snug">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="w-full max-w-md glass rounded-2xl p-6 sm:p-8 border border-cinema-border">
          <Suspense fallback={
            <div className="h-48 flex items-center justify-center text-cinema-subtle text-sm">
              Loading...
            </div>
          }>
            <WaitlistForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center gap-4 text-cinema-subtle text-xs">
          <a
            href="https://youtube.com/@hoodtorials"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            YouTube
          </a>
          <span>·</span>
          <a
            href="https://instagram.com/hoodtorials"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            Instagram
          </a>
          <span>·</span>
          <a
            href="https://tiktok.com/@hoodtorials"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            TikTok
          </a>
        </div>
      </div>
    </div>
  );
}
