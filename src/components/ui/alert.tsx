import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm has-[>svg]:grid has-[>svg]:grid-cols-[calc(1.25rem+1ch)_1fr] has-[>svg]:items-start has-[>svg]:gap-x-2 has-[>svg]:gap-y-0.5 has-[>svg]:[&>svg]:h-4 has-[>svg]:[&>svg]:w-4 has-[>svg]:[&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground",
        destructive:
          "border-destructive/30 text-destructive bg-destructive/5 [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      className={cn(
        "line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      data-slot="alert-description"
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
