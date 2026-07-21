import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import { cn } from "@/utils/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm font-medium leading-4 select-none", className)}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
