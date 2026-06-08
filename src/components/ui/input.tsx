import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400",
        "focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-all",
        "disabled:opacity-50 disabled:bg-stone-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
