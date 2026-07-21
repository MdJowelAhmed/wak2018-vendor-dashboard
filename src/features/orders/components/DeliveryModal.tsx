import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Order } from "@/types/api";
import {
  useCreateInternationalShipmentMutation,
  useRequestLocalDeliveryMutation,
} from "@/features/delivery";
import { useUpdateProductOrderStatusMutation } from "@/features/orders";
import { useGetProfileQuery } from "@/features/auth";
import { cn } from "@/utils/utils";
import {
  DeliveryTypeSelector,
  type DeliveryType,
} from "@/features/orders/components/DeliveryTypeSelector";
import { LocalDeliveryForm } from "@/features/orders/components/LocalDeliveryForm";
import {
  InternationalDeliveryForm,
  type CourierKey,
} from "@/features/orders/components/InternationalDeliveryForm";

export function DeliveryModal({
  open,
  onOpenChange,
  order,
  disabled,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: Order;
  disabled?: boolean;
  onDone?: () => void;
}) {
  const { data: profile } = useGetProfileQuery();
  const vendorId =
    profile?.id ?? localStorage.getItem("vendor_id") ?? "demo-vendor";
  const vendorPickup =
    localStorage.getItem("vendor_pickup_address") ??
    "Demo vendor pickup address";

  const [type, setType] = useState<DeliveryType>("local");
  const [pickup, setPickup] = useState(vendorPickup);
  const [drop, setDrop] = useState(order.customer?.address ?? "");

  const [courier, setCourier] = useState<CourierKey>("dhl");
  const [weight, setWeight] = useState("1");
  const [dimensions, setDimensions] = useState("");

  const [requestLocal, { isLoading: localLoading }] =
    useRequestLocalDeliveryMutation();
  const [createIntl, { isLoading: intlLoading }] =
    useCreateInternationalShipmentMutation();
  const [updateOrder] = useUpdateProductOrderStatusMutation();

  const busy = localLoading || intlLoading;
  const canSubmit = useMemo(() => {
    if (!pickup.trim() || !drop.trim()) return false;
    if (type === "international") {
      const w = Number(weight);
      if (!Number.isFinite(w) || w <= 0) return false;
      if (!dimensions.trim()) return false;
    }
    return true;
  }, [pickup, drop, type, weight, dimensions]);

  async function submit() {
    if (!canSubmit) {
      toast.error(
        type === "international"
          ? "Fill courier, weight, dimensions, and addresses."
          : "Add pickup and drop addresses.",
      );
      return;
    }

    try {
      if (type === "local") {
        await requestLocal({
          order_id: order.id,
          type: "local",
          pickup_location: pickup.trim(),
          drop_location: drop.trim(),
          vendor_id: vendorId,
        }).unwrap();
        if (order.type === "product") {
          try {
            await updateOrder({
              id: order.id,
              status: "delivery_requested",
            }).unwrap();
          } catch {
            // ignore
          }
        }
        toast.success("Driver requested");
      } else {
        await createIntl({
          order_id: order.id,
          type: "international",
          courier,
          weight: Number(weight),
          dimensions: dimensions.trim(),
          pickup_location: pickup.trim(),
          drop_location: drop.trim(),
          vendor_id: vendorId,
        }).unwrap();
        if (order.type === "product") {
          try {
            await updateOrder({
              id: order.id,
              status: "shipment_created",
            }).unwrap();
          } catch {
            // ignore
          }
        }
        toast.success("Shipment created");
      }
      onOpenChange(false);
      onDone?.();
    } catch {
      toast.error("Delivery action failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Arrange Delivery</DialogTitle>
          <DialogDescription>
            Order <span className="font-medium">#{order.id}</span> ·{" "}
            {order.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <DeliveryTypeSelector value={type} onChange={setType} />

          {type === "local" ? (
            <LocalDeliveryForm
              pickup={pickup}
              drop={drop}
              onChangePickup={setPickup}
              onChangeDrop={setDrop}
            />
          ) : (
            <InternationalDeliveryForm
              courier={courier}
              weight={weight}
              dimensions={dimensions}
              pickup={pickup}
              drop={drop}
              onChangeCourier={setCourier}
              onChangeWeight={setWeight}
              onChangeDimensions={setDimensions}
              onChangePickup={setPickup}
              onChangeDrop={setDrop}
            />
          )}
        </div>

        <DialogFooter className={cn("gap-2", disabled && "opacity-70")}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#895129] hover:bg-[#7b4723]"
            onClick={() => void submit()}
            disabled={disabled || busy}
          >
            {busy
              ? "Submitting…"
              : type === "local"
                ? "Request Driver"
                : "Create Shipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
