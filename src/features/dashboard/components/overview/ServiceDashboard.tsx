import { Banknote, CheckCircle2, Timer, Wrench } from "lucide-react";
import type { DashboardOverview } from "@/types/api";
import { ServicesOverview } from "@/features/dashboard/components/ServicesOverview";
import { formatCurrency } from "@/utils/format-currency";
import { StatsCards, type StatCard } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { OrdersTable } from "./OrdersTable";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function ServiceDashboard({
  data,
  meta,
}: {
  data: DashboardOverview;
  meta: {
    productOrdersCount: number;
    serviceOrdersCount: number;
    serviceCompletedCount: number;
  };
}) {
  const totalJobs = meta.serviceOrdersCount;
  const completionRate = totalJobs ? meta.serviceCompletedCount / totalJobs : 0;
  const inProgress = Math.max(0, totalJobs - meta.serviceCompletedCount);

  const stats: StatCard[] = [
    {
      key: "rev",
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: Banknote,
    },
    {
      key: "jobs",
      label: "Total Jobs",
      value: String(totalJobs),
      sub: "jobs",
      icon: Wrench,
    },
    {
      key: "active",
      label: "In Progress",
      value: String(inProgress),
      sub: "jobs",
      icon: Timer,
    },
    {
      key: "rate",
      label: "Completion Rate",
      value: pct(completionRate),
      sub: "completed",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="w-full space-y-6">
      <StatsCards items={stats} />

      <div className="w-full">
        <RevenueChart
          weekly={data.revenueWeekly}
          monthly={data.revenueMonthly}
          mode="service"
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <OrdersTable
          orders={data.recentOrders.filter((o) => o.type === "service")}
          className="min-w-0"
        />
        <section className="min-w-0 space-y-3">
          <h2 className="text-foreground text-lg font-semibold">
            Service performance
          </h2>
          <ServicesOverview
            total={data.services.total}
            active={data.services.active}
            topName={data.services.topService.name}
            topSales={data.services.topService.sales}
          />
        </section>
      </div>
    </div>
  );
}
