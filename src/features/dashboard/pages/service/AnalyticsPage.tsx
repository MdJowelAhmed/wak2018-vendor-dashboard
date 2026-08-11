import { useMemo, useState } from "react";
import {
  useGetDashboardOverviewQuery,
  useGetMonthlyRevenueQuery,
} from "@/features/dashboard";
import type { AnalyticsRangeKey, AnalyticsRevenuePoint } from "@/types/api";
import { AnalyticsKPI } from "@/features/dashboard/components/analytics/AnalyticsKPI";
import { ServiceRevenueChart } from "@/features/dashboard/components/analytics/ServiceRevenueChart";

export function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRangeKey>("7d");
  const year = new Date().getFullYear();

  const overviewQ = useGetDashboardOverviewQuery({ role: 'service' });
  const monthlyRevenueQ = useGetMonthlyRevenueQuery({ year, role: 'service' });

  const chartPoints = useMemo<AnalyticsRevenuePoint[]>(() => {
    if (!monthlyRevenueQ.data) return [];
    return monthlyRevenueQ.data.map((d) => ({
      label: d.month,
      revenue: d.revenue,
      ordersJobs: 0,
    }));
  }, [monthlyRevenueQ.data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Track service bookings, completion rates, and earnings.
        </p>
      </div>

      {overviewQ.isError ? (
        <p className="text-destructive text-sm">Failed to load analytics.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsKPI
          title="Total Earnings"
          value={overviewQ.data?.totalRevenue}
          loading={overviewQ.isLoading}
          format="currency"
        />
        <AnalyticsKPI
          title="Total Jobs"
          value={overviewQ.data?.totalOrders}
          loading={overviewQ.isLoading}
        />
        <AnalyticsKPI
          title="Total Services"
          value={overviewQ.data?.products?.total}
          loading={overviewQ.isLoading}
        />
      </div>

      <ServiceRevenueChart
        range={range}
        onChangeRange={setRange}
        points={chartPoints}
        isLoading={false}
      />
    </div>
  );
}
