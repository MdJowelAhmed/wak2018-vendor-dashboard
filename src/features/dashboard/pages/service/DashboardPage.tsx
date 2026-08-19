import { useMemo, useState } from "react";
import { Banknote, CalendarDays, Timer, Wrench } from "lucide-react";
import {
  useGetDashboardOverviewQuery,
  useGetMonthlyRevenueQuery,
} from "@/features/dashboard";
import {
  StatsCards,
  type StatCard,
} from "@/features/dashboard/components/overview/StatsCards";
import { ServiceRevenueChart } from "@/features/dashboard/components/analytics/ServiceRevenueChart";
import { formatCurrency } from "@/utils/format-currency";
import type { AnalyticsRevenuePoint } from "@/types/api";

export function DashboardPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const overviewQ = useGetDashboardOverviewQuery({ role: "service" });
  const monthlyRevenueQ = useGetMonthlyRevenueQuery({ year, role: "service" });

  const chartPoints = useMemo<AnalyticsRevenuePoint[]>(() => {
    if (!monthlyRevenueQ.data) return [];
    return monthlyRevenueQ.data.map((d) => ({
      label: d.month,
      revenue: d.revenue,
      ordersJobs: 0,
    }));
  }, [monthlyRevenueQ.data]);

  const stats: StatCard[] = [
    {
      key: "earn",
      label: "Total Earnings",
      value: overviewQ.isLoading
        ? "..."
        : formatCurrency(overviewQ.data?.totalRevenue ?? 0),
      sub: "all time",
      icon: Banknote,
    },
    {
      key: "book",
      label: "Total Jobs",
      value: overviewQ.isLoading ? "..." : String(overviewQ.data?.totalOrders ?? 0),
      sub: "jobs",
      icon: CalendarDays,
    },
    {
      key: "srv",
      label: "Active Services",
      value: overviewQ.isLoading
        ? "..."
        : String(
            overviewQ.data?.services?.total ?? overviewQ.data?.activeServices ?? 0,
          ),
      sub: "listed",
      icon: Wrench,
    },
    {
      key: "pend",
      label: "Active Deliveries",
      value: overviewQ.isLoading
        ? "..."
        : String(overviewQ.data?.activeDeliveries ?? 0),
      sub: "in progress",
      icon: Timer,
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Service dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Bookings, services, and earnings at a glance.
        </p>
      </div>

      {overviewQ.isError ? (
        <p className="text-destructive text-sm">
          Failed to load dashboard overview.
        </p>
      ) : null}

      {/* Top Stats Cards */}
      <StatsCards items={stats} />

      {/* Service Revenue Chart */}
      <ServiceRevenueChart
        year={year}
        onChangeYear={setYear}
        points={chartPoints}
        isLoading={monthlyRevenueQ.isLoading}
      />
    </div>
  );
}
