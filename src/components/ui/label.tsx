import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-stone-700 mb-1", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
