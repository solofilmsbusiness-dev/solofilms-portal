import { cn } from "@/lib/utils";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const colorMap: Record<string, string> = {
  violet: "bg-violet/20 text-violet border-violet/30",
  cyan: "bg-cyan/20 text-cyan border-cyan/30",
  amber: "bg-amber/20 text-amber border-amber/30",
  rose: "bg-rose/20 text-rose border-rose/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const statusConfig = PROJECT_STATUSES.find((s) => s.key === status);
  if (!statusConfig) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colorMap[statusConfig.color],
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {statusConfig.label}
    </span>
  );
}
