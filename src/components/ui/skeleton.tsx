import * as React from "react";
import { cn } from "@/utils/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-muted rounded-md", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
