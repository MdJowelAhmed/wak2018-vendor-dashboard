import { toast } from "sonner";
import { ExternalLink, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Delivery } from "@/types/api";
import { badgeClassFor, labelFor } from "../utils/deliveryStatusUi";

export function ShipmentCard({
  delivery,
  onViewDetails,
}: {
  delivery: Delivery;
  onViewDetails: (d: Delivery) => void;
}) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base">
            Order <span className="font-mono">#{delivery.orderId}</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={badgeClassFor(
                "international",
                delivery.deliveryStatus,
              )}
            >
              {delivery.trackingStatus ??
                labelFor("international", delivery.deliveryStatus)}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {delivery.courier ?? "Courier"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              toast.message("Tracking", {
                description: delivery.trackingId
                  ? `Tracking ID: ${delivery.trackingId}`
                  : "No tracking ID yet.",
              });
            }}
          >
            <LocateFixed className="mr-2 size-4" />
            Track Shipment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(delivery)}
          >
            <ExternalLink className="mr-2 size-4" />
            View details
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 text-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Courier</div>
            <div className="font-medium">{delivery.courier ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Tracking ID</div>
            <div className="font-medium font-mono text-xs">
              {delivery.trackingId ?? "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Pickup</div>
            <div className="font-medium whitespace-pre-wrap break-words">
              {delivery.pickupLocation}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Delivery</div>
            <div className="font-medium whitespace-pre-wrap break-words">
              {delivery.dropLocation}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
