import { Check, Circle } from "lucide-react";
import type { Delivery, DeliveryDriverStatus } from "@/types/api";
import { cn } from "@/utils/utils";
import { getSteps } from "../utils/deliveryStatusUi";

function rank(status: DeliveryDriverStatus): number {
  const flow: DeliveryDriverStatus[] = [
    "requested",
    "accepted",
    "picked_up",
    "in_transit",
    "delivered",
  ];
  return Math.max(0, flow.indexOf(status));
}

export function DeliveryTimeline({ delivery }: { delivery: Delivery }) {
  const steps = getSteps(delivery.type);
  const current = rank(delivery.deliveryStatus);

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-4">
        {steps.map((s, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={s.key} className="flex items-start gap-3">
              <div
                className={cn(
                  "relative z-10 mt-0.5 flex size-6 items-center justify-center rounded-full border bg-background",
                  done && "border-green-600",
                  active && "border-[#895129]",
                )}
              >
                {done ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Circle
                    className={cn(
                      "size-3",
                      active ? "text-[#895129]" : "text-muted-foreground",
                    )}
                  />
                )}
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium",
                    done
                      ? "text-foreground"
                      : active
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </div>
                {delivery.timelineAt?.[s.key] ? (
                  <div className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                    {new Date(delivery.timelineAt[s.key]!).toLocaleString()}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
