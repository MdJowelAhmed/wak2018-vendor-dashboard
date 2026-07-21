import { useMemo, useState } from "react";
import {
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
} from "@/features/dashboard";
import { useGetProfileQuery } from "@/features/auth";
import type { AnalyticsRangeKey } from "@/types/api";
import { AnalyticsKPI } from "@/features/dashboard/components/analytics/AnalyticsKPI";
import { RevenueChart } from "@/features/dashboard/components/analytics/RevenueChart";

function roleKey(role: string | undefined): "vendor" | "service" {
  return role === "service" ? "service" : "vendor";
}

export function AnalyticsPage() {
  const { data: profile } = useGetProfileQuery();
  const role = useMemo(() => roleKey(profile?.role), [profile?.role]);

  const [range, setRange] = useState<AnalyticsRangeKey>("7d");

  const statsQ = useGetDashboardStatsQuery({ role });
  const chartQ = useGetRevenueChartQuery({ role, range });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Business dashboard with KPIs, trends, and performance insights.
        </p>
      </div>
      {statsQ.isError ? (
        <p className="text-destructive text-sm">Failed to load analytics.</p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsKPI
          title="Total Revenue"
          value={statsQ.data?.totalRevenue.value}
          changePct={statsQ.data?.totalRevenue.trend.pct}
          loading={statsQ.isLoading}
          format="currency"
        />
        <AnalyticsKPI
          title={role === "vendor" ? "Total Orders" : "Total Jobs"}
          value={statsQ.data?.totalOrdersJobs.value}
          changePct={statsQ.data?.totalOrdersJobs.trend.pct}
          loading={statsQ.isLoading}
        />
        <AnalyticsKPI
          title="Conversion Rate"
          value={statsQ.data?.conversionRate.value}
          changePct={statsQ.data?.conversionRate.trend.pct}
          loading={statsQ.isLoading}
          format="percent"
        />
        <AnalyticsKPI
          title="Average Order Value (AOV)"
          value={statsQ.data?.aov.value}
          changePct={statsQ.data?.aov.trend.pct}
          loading={statsQ.isLoading}
          format="currency"
        />
        {role === "vendor" ? (
          <AnalyticsKPI
            title="Active Deliveries"
            value={statsQ.data?.activeDeliveries?.value}
            changePct={statsQ.data?.activeDeliveries?.trend.pct}
            loading={statsQ.isLoading}
          />
        ) : (
          <AnalyticsKPI
            title="Completion Rate"
            value={statsQ.data?.completionRate?.value}
            changePct={statsQ.data?.completionRate?.trend.pct}
            loading={statsQ.isLoading}
            format="percent"
          />
        )}
        {/* 6th KPI slot: mirror role-specific operational KPI */}
        {role === "vendor" ? (
          <AnalyticsKPI
            title="Delivery Health"
            value={statsQ.data?.activeDeliveries?.value}
            changePct={statsQ.data?.activeDeliveries?.trend.pct}
            loading={statsQ.isLoading}
            suffix=""
          />
        ) : (
          <AnalyticsKPI
            title="Job Health"
            value={statsQ.data?.totalOrdersJobs.value}
            changePct={statsQ.data?.totalOrdersJobs.trend.pct}
            loading={statsQ.isLoading}
          />
        )}
      </div>

      <RevenueChart
        range={range}
        onChangeRange={setRange}
        points={chartQ.data?.points}
        isLoading={chartQ.isLoading}
      />
    </div>
  );
}
