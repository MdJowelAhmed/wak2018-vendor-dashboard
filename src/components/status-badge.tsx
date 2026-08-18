import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "border-transparent bg-amber-400 text-white",
  },
  confirmed: {
    label: "Confirmed",
    className: "border-transparent bg-sky-600 text-white",
  },
  processing: {
    label: "Processing",
    className: "border-transparent bg-blue-600 text-white",
  },
  shipped: {
    label: "Shipped",
    className: "border-transparent bg-indigo-600 text-white",
  },
  out_for_delivery: {
    label: "Out For Delivery",
    className: "border-transparent bg-purple-600 text-white",
  },
  delivered: {
    label: "Delivered",
    className: "border-transparent bg-emerald-600 text-white",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-transparent bg-rose-600 text-white",
  },
  refunded: {
    label: "Refunded",
    className: "border-transparent bg-gray-600 text-white",
  },
  ready_for_pickup: {
    label: "Ready For Pickup",
    className: "border-transparent bg-teal-600 text-white",
  },
  ready: {
    label: "Ready",
    className: "border-transparent bg-violet-600 text-white",
  },
  delivery_requested: {
    label: "Requested",
    className: "border-transparent bg-orange-600 text-white",
  },
  shipment_created: {
    label: "Shipment Created",
    className: "border-transparent bg-orange-600 text-white",
  },
  accepted: {
    label: "Accepted",
    className: "border-transparent bg-teal-600 text-white",
  },
  in_progress: {
    label: "In Progress",
    className: "border-transparent bg-[#895129] text-white",
  },
  completed: {
    label: "Completed",
    className: "border-transparent bg-emerald-600 text-white",
  },
  requested: {
    label: "Requested",
    className: "border-transparent bg-orange-500 text-white",
  },
  picked_up: {
    label: "Picked Up",
    className: "border-transparent bg-amber-700 text-white",
  },
  in_transit: {
    label: "In Transit",
    className: "border-transparent bg-[#895129] text-white",
  },
};

type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function OrderStatusBadge({ status, className }: StatusBadgeProps) {
  const s = statusStyles[status] ?? {
    label: status,
    className: "border-border bg-secondary text-foreground",
  };
  return (
    <Badge className={cn("capitalize", s.className, className)}>
      {s.label}
    </Badge>
  );
}

export function getOrderStatusOptions(isProduct: boolean) {
  if (isProduct) {
    return [
      { value: "pending" as const, label: "Pending" },
      { value: "confirmed" as const, label: "Confirmed" },
      { value: "processing" as const, label: "Processing" },
      { value: "ready" as const, label: "Ready" },
      { value: "delivery_requested" as const, label: "Delivery requested" },
      { value: "shipment_created" as const, label: "Shipment created" },
      { value: "delivered" as const, label: "Delivered" },
    ];
  }
  return [
    { value: "pending" as const, label: "Pending" },
    { value: "accepted" as const, label: "Accepted" },
    { value: "in_progress" as const, label: "In progress" },
    { value: "completed" as const, label: "Completed" },
  ];
}
