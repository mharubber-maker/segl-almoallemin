import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md bg-paper px-3 py-2 text-sm text-ink shadow-border",
          "placeholder:text-muted-soft",
          "transition-[box-shadow] duration-(--motion-quick) ease-(--ease-out)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azhar/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        suppressHydrationWarning
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
