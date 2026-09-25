import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-24 w-full rounded-md bg-paper px-3 py-2 text-sm text-ink shadow-border",
          "placeholder:text-muted-soft",
          "transition-[box-shadow] duration-(--motion-quick) ease-(--ease-out)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azhar/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        suppressHydrationWarning
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
