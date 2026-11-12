import { useState } from "react";
import { toast } from "sonner";
import { StatusDropdown } from "@/features/orders/components/StatusDropdown";
import { CourierTrackingDialog } from "@/features/orders/components/CourierTrackingDialog";
import { useUpdateProductOrderStatusMutation } from "@/features/orders";
import type { ProductOrderStatus } from "@/types/api";

export function isPickupOrder(deliveryOption?: string | null) {
  return deliveryOption === "pickup";
}

export function isLocalDeliveryOrder(
  deliveryType?: string | null,
  deliveryOption?: string | null,
) {
  return deliveryType === "local" && deliveryOption !== "pickup";
}

export function canVendorUpdateProductStatus(
  deliveryType?: string | null,
  deliveryOption?: string | null,
) {
  return (
    isPickupOrder(deliveryOption) ||
    isLocalDeliveryOrder(deliveryType, deliveryOption)
  );
}

export function VendorOrderStatusControl({
  orderId,
  status,
  deliveryType,
  deliveryOption,
  compact,
  onUpdated,
}: {
  orderId: string;
  status: string;
  deliveryType?: string | null;
  deliveryOption?: string | null;
  compact?: boolean;
  onUpdated?: () => void;
}) {
  const [updateStatus, { isLoading }] = useUpdateProductOrderStatusMutation();
  const [trackingOpen, setTrackingOpen] = useState(false);

  const canUpdate = canVendorUpdateProductStatus(deliveryType, deliveryOption);
  const needsCourierTracking = isLocalDeliveryOrder(
    deliveryType,
    deliveryOption,
  );

  if (!canUpdate) {
    return (
      <p className="text-muted-foreground max-w-[16rem] text-xs">
        International delivery status is updated by the courier.
      </p>
    );
  }

  async function applyStatus(
    next: string,
    tracking?: { carrier: string; trackingId: string; trackingUrl?: string },
  ) {
    await updateStatus({
      id: orderId,
      orderStatus: next as ProductOrderStatus,
      carrier: tracking?.carrier,
      trackingId: tracking?.trackingId,
      trackingUrl: tracking?.trackingUrl,
    }).unwrap();
    toast.success(
      next === "shipped" && tracking
        ? "Order marked as shipped"
        : "Status updated",
    );
    onUpdated?.();
  }

  return (
    <>
      <StatusDropdown
        kind="product"
        value={status as ProductOrderStatus}
        deliveryOption={deliveryOption}
        compact={compact}
        disabled={status === "pending" || isLoading}
        hint={
          status === "pending"
            ? "Confirmed after payment succeeds. Payment status updates automatically."
            : isPickupOrder(deliveryOption)
              ? "Pickup: confirmed → ready for pickup → delivered"
              : "Local delivery: confirmed → processing → shipped → out for delivery → delivered"
        }
        onChange={async (next) => {
          try {
            if (next === "shipped" && needsCourierTracking) {
              setTrackingOpen(true);
              return;
            }
            await applyStatus(next);
          } catch {
            toast.error("Update failed");
          }
        }}
      />
      {needsCourierTracking ? (
        <CourierTrackingDialog
          open={trackingOpen}
          onOpenChange={setTrackingOpen}
          isSubmitting={isLoading}
          onSubmit={async (tracking) => {
            try {
              await applyStatus("shipped", tracking);
              setTrackingOpen(false);
            } catch {
              toast.error("Update failed");
              throw new Error("Update failed");
            }
          }}
        />
      ) : null}
    </>
  );
}
