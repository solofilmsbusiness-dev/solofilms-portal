export const PROJECT_STATUSES = [
  { key: "booked", label: "Booked", color: "violet", icon: "Calendar" },
  { key: "pre_production", label: "Pre-Production", color: "cyan", icon: "Clapperboard" },
  { key: "filming", label: "Filming", color: "amber", icon: "Video" },
  { key: "editing", label: "Editing", color: "rose", icon: "Film" },
  { key: "review", label: "Review", color: "blue", icon: "Eye" },
  { key: "delivered", label: "Delivered", color: "green", icon: "CheckCircle" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["key"];

export const GENRES = [
  { key: "music_video", label: "Music Video" },
  { key: "commercial", label: "Commercial" },
  { key: "wedding", label: "Wedding" },
  { key: "documentary", label: "Documentary" },
  { key: "short_film", label: "Short Film" },
  { key: "social_content", label: "Social Content" },
  { key: "corporate", label: "Corporate" },
  { key: "event", label: "Event" },
] as const;

export const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "#E1306C" },
  { key: "tiktok", label: "TikTok", color: "#00f2ea" },
  { key: "youtube", label: "YouTube", color: "#FF0000" },
  { key: "twitter", label: "X / Twitter", color: "#1DA1F2" },
  { key: "facebook", label: "Facebook", color: "#1877F2" },
] as const;

export const SHOOT_TYPES = [
  { key: "music_video", label: "Music Video", duration: "4-8 hours", price: "Starting at $2,500" },
  { key: "commercial", label: "Commercial", duration: "2-6 hours", price: "Starting at $3,000" },
  { key: "wedding", label: "Wedding", duration: "6-12 hours", price: "Starting at $4,000" },
  { key: "documentary", label: "Documentary", duration: "Varies", price: "Starting at $5,000" },
  { key: "social_content", label: "Social Content", duration: "2-4 hours", price: "Starting at $1,000" },
  { key: "event", label: "Event Coverage", duration: "3-8 hours", price: "Starting at $1,500" },
] as const;

export const INVOICE_STATUSES = [
  { key: "draft", label: "Draft", color: "muted" },
  { key: "sent", label: "Sent", color: "gold" },
  { key: "paid", label: "Paid", color: "green" },
  { key: "overdue", label: "Overdue", color: "rose" },
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]["key"];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/projects", label: "Projects", icon: "Film" },
  { href: "/bookings", label: "Book a Shoot", icon: "Calendar" },
  { href: "/social-hub", label: "Social Hub", icon: "TrendingUp" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;
