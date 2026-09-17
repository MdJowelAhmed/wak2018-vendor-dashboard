import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/status-badge";
import { orderDetailsStatusBadgeVariants } from "@/features/orders/motion/order-details-variants";
import type { ProductOrderStatus, ServiceOrderStatus } from "@/types/api";

const deliveryFlow = [
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

const pickupFlow = ["confirmed", "ready_for_pickup", "delivered"] as const;

const serviceFlow = [
  "pending",
  "accepted",
  "in_progress",
  "completed",
] as const;

const productLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready: "Ready",
  ready_for_pickup: "Ready For Pickup",
  delivery_requested: "Delivery Requested",
  shipment_created: "Shipment Created",
  shipped: "Shipped",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const serviceLabels: Record<ServiceOrderStatus, string> = {
  pending: "Pending",
  accepted: "Confirmed",
  in_progress: "Processing",
  completed: "Delivered",
};

const lockedProductStatuses = new Set([
  "pending",
  "delivered",
  "cancelled",
  "refunded",
]);

export function getProductStatusFlow(deliveryOption?: string | null) {
  return deliveryOption === "pickup" ? pickupFlow : deliveryFlow;
}

function nextProductStatus(current: string, deliveryOption?: string | null) {
  const flow = getProductStatusFlow(deliveryOption);
  const idx = flow.indexOf(current as (typeof flow)[number]);
  if (idx >= 0) return flow[idx + 1] ?? null;

  if (["ready", "delivery_requested", "shipment_created"].includes(current)) {
    return deliveryOption === "pickup" ? "ready_for_pickup" : "shipped";
  }
  return null;
}

export function StatusDropdown({
  kind,
  value,
  deliveryOption,
  disabled,
  hint,
  compact,
  onChange,
}: {
  kind: "product" | "service";
  value: ProductOrderStatus | ServiceOrderStatus;
  deliveryOption?: string | null;
  disabled?: boolean;
  hint?: string;
  compact?: boolean;
  onChange: (next: string) => void;
}) {
  const current = String(value);
  const labels = (kind === "product" ? productLabels : serviceLabels) as Record<
    string,
    string
  >;

  const next =
    kind === "product"
      ? nextProductStatus(current, deliveryOption)
      : (() => {
          const idx = serviceFlow.indexOf(
            current as (typeof serviceFlow)[number],
          );
          return idx >= 0 ? (serviceFlow[idx + 1] ?? null) : null;
        })();

  const locked =
    disabled ||
    (kind === "product" && lockedProductStatuses.has(current)) ||
    !next;

  const options = Array.from(new Set([current, ...(next ? [next] : [])]));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Select
          value={current}
          onValueChange={(nextValue) => {
            if (nextValue === current || locked) return;
            onChange(nextValue);
          }}
          disabled={locked}
        >
          <SelectTrigger className={compact ? "h-8 w-[11.5rem] text-xs" : "w-[12rem]"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((s) => (
              <SelectItem
                key={s}
                value={s}
                disabled={s === "confirmed" || s === current || s !== next}
              >
                {labels[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <motion.div
          key={current}
          variants={orderDetailsStatusBadgeVariants}
          initial="initial"
          animate="animate"
          className="inline-flex"
        >
          <OrderStatusBadge status={current} />
        </motion.div>
      </div>
      {hint ? <p className="text-muted-foreground max-w-[16rem] text-xs">{hint}</p> : null}
    </div>
  );
}
