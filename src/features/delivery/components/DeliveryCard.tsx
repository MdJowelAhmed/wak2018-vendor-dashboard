import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Delivery } from "@/types/api";
import { OrderStatusBadge } from "@/components/status-badge";
import { VendorOrderStatusControl } from "@/features/orders/components/VendorOrderStatusControl";
import { fadeUp, hoverLift } from "@/components/ui/motion";
import { getImageUrl } from "@/utils/utils";
import { formatCurrency, useCurrency } from "@/utils/format-currency";

function orderLabel(orderId?: string) {
  if (!orderId) return "—";
  return orderId.startsWith("#") ? orderId : `#${orderId}`;
}

export function DeliveryItemsPreview({ delivery }: { delivery: Delivery }) {
  useCurrency();
  const items = delivery.items ?? [];
  if (!items.length) {
    return (
      <div className="text-muted-foreground text-sm">
        {delivery.orderLineItemName ?? "No items"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 3).map((item, idx) => {
        const image = item.product?.images?.[0];
        return (
          <div key={`${item.product?._id ?? idx}`} className="flex items-center gap-3">
            <div className="bg-muted size-11 shrink-0 overflow-hidden rounded-lg border border-gray-100">
              {image ? (
                <img src={getImageUrl(image)} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {item.product?.name ?? "Item"}
              </div>
              <div className="text-muted-foreground text-xs">
                Qty {item.quantity} × {formatCurrency(item.unitPrice)}
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatCurrency(item.unitTotal)}
            </div>
          </div>
        );
      })}
      {items.length > 3 ? (
        <div className="text-muted-foreground text-xs">+{items.length - 3} more</div>
      ) : null}
    </div>
  );
}

export function DeliveryCard({
  delivery,
  isDriver,
  onViewDetails,
  onAccept,
  onReject,
  onStep,
  busy,
}: {
  delivery: Delivery;
  isDriver: boolean;
  onViewDetails: (d: Delivery) => void;
  onAccept: (d: Delivery) => void;
  onReject: (d: Delivery) => void;
  onStep: (d: Delivery) => void;
  busy?: boolean;
}) {
  const canAccept = isDriver && delivery.driverStatus === "requested";
  const rider = delivery.localDelivery?.assignedRider;
  const hasRider = Boolean(rider?.name);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={hoverLift.whileHover}
      transition={hoverLift.transition}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="min-w-0 space-y-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              {orderLabel(delivery.orderId)}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              {delivery.orderStatus ? (
                <OrderStatusBadge status={delivery.orderStatus} />
              ) : null}
              {delivery.paymentStatus ? (
                <OrderStatusBadge status={delivery.paymentStatus} />
              ) : null}
              <Badge variant="outline" className="capitalize">
                Local · {delivery.deliveryOption || "delivery"}
              </Badge>
              {delivery.localDeliveryStatus ? (
                <OrderStatusBadge status={delivery.localDeliveryStatus} />
              ) : null}
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
              <div className="text-xs text-gray-500">Customer</div>
              <div className="mt-0.5 font-medium text-gray-900">
                {delivery.orderCustomerName || "—"}
              </div>
              {delivery.orderCustomerPhone ? (
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {delivery.orderCustomerPhone}
                </div>
              ) : null}
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Rider</div>
              <div className="mt-0.5 font-medium text-gray-900">
                {hasRider ? rider?.name : "Not assigned"}
              </div>
              {hasRider && rider?.phone ? (
                <div className="text-muted-foreground mt-0.5 text-xs">{rider.phone}</div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Pickup</div>
              <div className="mt-0.5 font-medium break-words text-gray-900">
                {delivery.pickupLocation || "—"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Drop</div>
              <div className="mt-0.5 font-medium break-words text-gray-900">
                {delivery.dropLocation || "—"}
              </div>
            </div>
          </div>

          <VendorOrderStatusControl
            compact
            orderId={delivery.id}
            status={delivery.orderStatus || "confirmed"}
            deliveryType={delivery.type}
            deliveryOption={delivery.deliveryOption}
          />

          {delivery.courier || delivery.trackingId ? (
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Courier tracking</div>
              <div className="mt-0.5 font-medium capitalize">
                {delivery.courier || "—"}
              </div>
              {delivery.trackingId ? (
                <div className="mt-0.5 font-mono text-xs">{delivery.trackingId}</div>
              ) : null}
              {delivery.trackingUrl ? (
                <a
                  href={delivery.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-xs font-medium text-[#895129] hover:underline"
                >
                  Track shipment
                </a>
              ) : null}
            </div>
          ) : null}

          {isDriver && canAccept ? (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={busy}
                onClick={() => onAccept(delivery)}
              >
                Accept
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={busy}
                onClick={() => onReject(delivery)}
              >
                Reject
              </Button>
            </div>
          ) : isDriver ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="ml-auto rounded-xl"
              disabled={busy}
              onClick={() => onStep(delivery)}
            >
              Update status
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
