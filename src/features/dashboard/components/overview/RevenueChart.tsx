import { RevenueChart as BaseRevenueChart } from "@/features/dashboard/components/DashboardOverviewRevenueChart";
import type { RevenueChartPoint } from "@/types/api";

export function RevenueChart({
  weekly,
  monthly,
  mode,
  isLoading,
  className,
}: {
  weekly: RevenueChartPoint[];
  monthly: RevenueChartPoint[];
  mode?: "product" | "service" | "both";
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <BaseRevenueChart
      weekly={weekly}
      monthly={monthly}
      mode={mode}
      isLoading={isLoading}
      className={className}
    />
  );
}
