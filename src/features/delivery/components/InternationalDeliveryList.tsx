import type { Delivery } from "@/types/api";
import { ShipmentCard } from "./ShipmentCard";

export function InternationalDeliveryList({
  deliveries,
  onViewDetails,
}: {
  deliveries: Delivery[];
  onViewDetails: (d: Delivery) => void;
}) {
  if (!deliveries.length) {
    return (
      <div className="text-muted-foreground text-sm py-8 text-center">
        No international shipments yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {deliveries.map((d) => (
        <ShipmentCard key={d.id} delivery={d} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}
