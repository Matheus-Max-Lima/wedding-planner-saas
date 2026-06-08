import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800",
        "focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-all appearance-none",
        "disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
