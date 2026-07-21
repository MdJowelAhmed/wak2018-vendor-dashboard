import { ActiveDeliveries } from "@/features/dashboard/components/ActiveDeliveries";
import type { DashboardActiveDelivery } from "@/types/api";

export function DeliveriesCard({
  items,
  isLoading,
  className,
}: {
  items: DashboardActiveDelivery[];
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <ActiveDeliveries
      items={items}
      isLoading={isLoading}
      className={className}
    />
  );
}
