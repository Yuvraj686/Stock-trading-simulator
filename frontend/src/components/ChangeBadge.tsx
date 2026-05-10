import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/marketData";

interface ChangeBadgeProps {
  value: number;          // percent
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function ChangeBadge({ value, className, showIcon = true, size = "sm" }: ChangeBadgeProps) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "ticker-pill",
        positive ? "bg-bull-soft text-bull" : "bg-bear-soft text-bear",
        size === "md" && "text-sm px-3 py-1.5",
        className
      )}
    >
      {showIcon && (positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
      {fmtPct(value)}
    </span>
  );
}
