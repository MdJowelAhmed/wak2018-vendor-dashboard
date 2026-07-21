import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/utils";

type DashboardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[min(92vw,28rem)] gap-0 overflow-hidden rounded-xl border-border/60 bg-[#FFFFFF] p-0 shadow-lg",
          className,
        )}
      >
        <DialogHeader className="space-y-1 border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-foreground">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className={cn("px-5 py-4", contentClassName)}>{children}</div>
        {footer ? (
          <DialogFooter className="border-t border-border/60 px-5 py-4 sm:justify-end">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
