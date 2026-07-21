import type { Delivery } from "@/types/api";
import { DeliveryCard } from "./DeliveryCard";

export function LocalDeliveryList({
  deliveries,
  isDriver,
  onViewDetails,
  onAccept,
  onReject,
  onStep,
  busy,
}: {
  deliveries: Delivery[];
  isDriver: boolean;
  onViewDetails: (d: Delivery) => void;
  onAccept: (d: Delivery) => void;
  onReject: (d: Delivery) => void;
  onStep: (d: Delivery) => void;
  busy?: boolean;
}) {
  if (!deliveries.length) {
    return (
      <div className="text-muted-foreground text-sm py-8 text-center">
        No local deliveries yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {deliveries.map((d) => (
        <DeliveryCard
          key={d.id}
          delivery={d}
          isDriver={isDriver}
          onViewDetails={onViewDetails}
          onAccept={onAccept}
          onReject={onReject}
          onStep={onStep}
          busy={busy}
        />
      ))}
    </div>
  );
}
