import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 resize-none",
        "focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-all",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
