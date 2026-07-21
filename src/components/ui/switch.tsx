import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "@/utils/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-sm transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "bg-background pointer-events-none block h-4 w-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
