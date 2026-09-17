import { Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Delivery } from "@/types/api";
import { OrderStatusBadge } from "@/components/status-badge";
import { DeliveryItemsPreview } from "./DeliveryCard";
import { VendorOrderStatusControl } from "@/features/orders/components/VendorOrderStatusControl";

function orderLabel(orderId?: string) {
  if (!orderId) return "—";
  return orderId.startsWith("#") ? orderId : `#${orderId}`;
}

export function ShipmentCard({
  delivery,
  onViewDetails,
}: {
  delivery: Delivery;
  onViewDetails: (d: Delivery) => void;
}) {
  const isPickup = delivery.deliveryOption === "pickup";
  const trackingHref = delivery.trackingUrl;

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 space-y-2">
          <CardTitle className="text-base">{orderLabel(delivery.orderId)}</CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            {delivery.orderStatus ? (
              <OrderStatusBadge status={delivery.orderStatus} />
            ) : null}
            {delivery.paymentStatus ? (
              <OrderStatusBadge status={delivery.paymentStatus} />
            ) : null}
            {delivery.trackingStatus ? (
              <OrderStatusBadge status={delivery.trackingStatus} />
            ) : null}
            <Badge variant="outline" className="capitalize">
              International · {delivery.deliveryOption || "delivery"}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button asChild type="button" variant="outline" size="sm" className="rounded-xl">
            <Link to={`/vendor/orders/${delivery.id}`}>
              <ExternalLink className="mr-2 size-4" />
              Order
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => onViewDetails(delivery)}
          >
            Details
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 text-sm">
        <DeliveryItemsPreview delivery={delivery} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
            <div className="text-muted-foreground text-xs">Customer</div>
            <div className="mt-0.5 font-medium">{delivery.orderCustomerName || "—"}</div>
            {delivery.orderCustomerPhone ? (
              <div className="text-muted-foreground mt-0.5 text-xs">
                {delivery.orderCustomerPhone}
              </div>
            ) : null}
          </div>
          <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
            <div className="text-muted-foreground text-xs">Carrier</div>
            <div className="mt-0.5 font-medium capitalize">
              {delivery.courier || "Not assigned"}
            </div>
            <div className="mt-0.5 font-mono text-xs">
              {delivery.trackingId || "No tracking ID"}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
          <div className="text-muted-foreground text-xs">
            {isPickup ? "Pickup" : "Ship to"}
          </div>
          <div className="mt-0.5 font-medium break-words">
            {isPickup ? "Customer pickup" : delivery.dropLocation || "—"}
          </div>
        </div>

        {delivery.labelUrl || delivery.commercialInvoiceUrl || trackingHref ? (
          <div className="flex flex-wrap gap-2">
            {trackingHref ? (
              <Button asChild type="button" variant="outline" size="sm" className="rounded-xl">
                <a href={trackingHref} target="_blank" rel="noreferrer">
                  Track shipment
                </a>
              </Button>
            ) : null}
            {delivery.labelUrl ? (
              <Button asChild type="button" variant="outline" size="sm" className="rounded-xl">
                <a href={delivery.labelUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 size-3.5" />
                  Label
                </a>
              </Button>
            ) : null}
            {delivery.commercialInvoiceUrl ? (
              <Button asChild type="button" variant="outline" size="sm" className="rounded-xl">
                <a href={delivery.commercialInvoiceUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 size-3.5" />
                  Invoice
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}

        {isPickup ? (
          <VendorOrderStatusControl
            compact
            orderId={delivery.id}
            status={delivery.orderStatus || "confirmed"}
            deliveryType={delivery.type}
            deliveryOption={delivery.deliveryOption}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
