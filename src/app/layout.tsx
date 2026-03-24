import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Solo Films | Client Portal",
  description:
    "Your creative hub for video production. Track projects, download deliverables, book shoots, and elevate your content.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Film grain overlay */}
        <div className="film-grain" />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#13131a",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e2e2f0",
            },
          }}
        />
      </body>
    </html>
  );
}
