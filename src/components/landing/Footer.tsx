import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cinema-border bg-cinema-bg/80 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <Film className="h-5 w-5 text-gold" />
          </div>
          <span className="font-heading text-xl font-bold text-cinema-text">
            Solo Films
          </span>
        </div>

        <p className="text-sm text-cinema-subtle">
          &copy; {new Date().getFullYear()} Solo Films. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm text-cinema-subtle">
          <a href="#" className="transition-colors hover:text-gold">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-gold">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-gold">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
