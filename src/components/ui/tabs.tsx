import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "@/utils/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-2", className)}
      data-slot="tabs"
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1",
        className,
      )}
      data-slot="tabs-list"
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:shadow-sm",
        className,
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "focus-visible:outline-hidden focus-visible:ring-2",
        className,
      )}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
