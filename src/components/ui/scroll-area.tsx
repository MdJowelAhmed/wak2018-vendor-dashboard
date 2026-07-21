import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";
import { cn } from "@/utils/utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative overflow-hidden", className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] [scrollbar-gutter:stable]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "bg-muted flex touch-none select-none p-px transition-colors data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col",
        className,
      )}
      data-slot="scroll-area-scrollbar"
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
