import * as React from "react";
import { cn } from "@/utils/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-input placeholder:text-muted-foreground min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
