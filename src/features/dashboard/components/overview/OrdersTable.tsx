import { RecentOrders } from "@/features/dashboard/components/RecentOrders";
import type { DashboardRecentOrder } from "@/types/api";

export function OrdersTable({
  orders,
  isLoading,
  className,
}: {
  orders: DashboardRecentOrder[];
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <RecentOrders orders={orders} isLoading={isLoading} className={className} />
  );
}
