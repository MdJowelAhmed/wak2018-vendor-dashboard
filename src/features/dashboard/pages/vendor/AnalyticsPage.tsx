import { useMemo, useState } from "react";
import {
  useGetDashboardOverviewQuery,
  useGetMonthlyRevenueQuery,
} from "@/features/dashboard";
import { useGetProfileQuery } from "@/services/userApi";
import type { AnalyticsRangeKey, AnalyticsRevenuePoint } from "@/types/api";
import { AnalyticsKPI } from "@/features/dashboard/components/analytics/AnalyticsKPI";
import { RevenueChart } from "@/features/dashboard/components/analytics/RevenueChart";

function roleKey(role: string | undefined): "vendor" | "service" {
  return role === "service" ? "service" : "vendor";
}

export function AnalyticsPage() {
  const { data: profile } = useGetProfileQuery();
  const role = useMemo(() => roleKey(profile?.role), [profile?.role]);

  const [range, setRange] = useState<AnalyticsRangeKey>("7d");
  const year = new Date().getFullYear();

  const overviewQ = useGetDashboardOverviewQuery();
  const monthlyRevenueQ = useGetMonthlyRevenueQuery({ year });

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
          Business dashboard with KPIs, trends, and performance insights.
        </p>
      </div>
      {overviewQ.isError ? (
        <p className="text-destructive text-sm">Failed to load analytics.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsKPI
          title="Total Revenue"
          value={overviewQ.data?.totalRevenue}
          loading={overviewQ.isLoading}
          format="currency"
        />
        <AnalyticsKPI
          title={role === "vendor" ? "Total Orders" : "Total Jobs"}
          value={overviewQ.data?.totalOrders}
          loading={overviewQ.isLoading}
        />
        <AnalyticsKPI
          title="Total Products"
          value={overviewQ.data?.products?.total}
          loading={overviewQ.isLoading}
        />
        <AnalyticsKPI
          title="Active Deliveries"
          value={overviewQ.data?.activeDeliveries}
          loading={overviewQ.isLoading}
        />
      </div>

      <RevenueChart
        range={range}
        onChangeRange={setRange}
        points={chartPoints}
        isLoading={monthlyRevenueQ.isLoading}
      />
    </div>
  );
}
