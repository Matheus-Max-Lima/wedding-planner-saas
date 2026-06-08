import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function Progress({ value, max = 100, className, barClassName }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full bg-stone-100 rounded-full overflow-hidden", className)} style={{ height: "6px" }}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName || "bg-rose-500")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
