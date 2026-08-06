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

const productFlow = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "delivery_requested",
  "shipment_created",
  "delivered",
] as const;
const serviceFlow = [
  "pending",
  "accepted",
  "in_progress",
  "completed",
] as const;

const productLabels: Record<ProductOrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready: "Ready",
  delivery_requested: "Delivery Requested",
  shipment_created: "Shipment Created",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const serviceLabels: Record<ServiceOrderStatus, string> = {
  pending: "Pending",
  accepted: "Confirmed",
  in_progress: "Processing",
  completed: "Delivered",
};

export function StatusDropdown({
  kind,
  value,
  onChange,
}: {
  kind: "product" | "service";
  value: ProductOrderStatus | ServiceOrderStatus;
  onChange: (next: string) => void;
}) {
  const flow = (
    kind === "product" ? productFlow : serviceFlow
  ) as readonly string[];
  const labels = (kind === "product" ? productLabels : serviceLabels) as Record<
    string,
    string
  >;
  const idx = flow.indexOf(String(value));

  // cannot skip steps: allow current and next only
  const allowed = idx >= 0 ? flow.slice(0, idx + 2) : flow;

  return (
    <div className="flex items-center gap-2">
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-[12rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {flow.map((s) => (
            <SelectItem key={s} value={s} disabled={!allowed.includes(s)}>
              {labels[s as keyof typeof labels]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <motion.div
        key={String(value)}
        variants={orderDetailsStatusBadgeVariants}
        initial="initial"
        animate="animate"
        className="inline-flex"
      >
        <OrderStatusBadge status={value as never} />
      </motion.div>
    </div>
  );
}
