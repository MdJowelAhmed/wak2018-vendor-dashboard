import * as React from "react";
import { cn } from "@/utils/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-hidden file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
