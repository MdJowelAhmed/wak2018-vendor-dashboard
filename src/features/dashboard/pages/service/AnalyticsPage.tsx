import { useMemo, useState } from "react";
import type { AnalyticsRangeKey, AnalyticsRevenuePoint } from "@/types/api";
import { AnalyticsKPI } from "@/features/dashboard/components/analytics/AnalyticsKPI";
import { ServiceRevenueChart } from "@/features/dashboard/components/analytics/ServiceRevenueChart";

type Booking = {
  id: number;
  service: string;
  amount: number;
  status: "Completed" | "Ongoing" | "Pending";
  customerApproved: boolean;
  date: string; // YYYY-MM-DD
};

const bookings: Booking[] = [
  {
    id: 1,
    service: "Web Development",
    amount: 250,
    status: "Completed",
    customerApproved: true,
    date: "2026-04-26",
  },
  {
    id: 2,
    service: "API Integration",
    amount: 150,
    status: "Completed",
    customerApproved: false,
    date: "2026-04-27",
  },
];

function toDateOnly(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysForRange(range: AnalyticsRangeKey) {
  return range === "7d" ? 7 : range === "30d" ? 30 : 90;
}

function parseDate(s: string) {
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function keyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function labelOf(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function safePct(current: number, previous: number) {
  const delta = current - previous;
  const pct =
    previous === 0 ? (current === 0 ? 0 : 100) : (delta / previous) * 100;
  return Number.isFinite(pct) ? pct : 0;
}

export function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRangeKey>("7d");

  const { filtered, prevFiltered } = useMemo(() => {
    const days = daysForRange(range);
    const end = toDateOnly(new Date());
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    const prevEnd = new Date(start);
    prevEnd.setDate(start.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - (days - 1));

    const inRange = (b: Booking, s: Date, e: Date) => {
      const d = parseDate(b.date);
      if (!d) return false;
      return d >= s && d <= e;
    };

    return {
      filtered: bookings.filter((b) => inRange(b, start, end)),
      prevFiltered: bookings.filter((b) => inRange(b, prevStart, prevEnd)),
    };
  }, [range]);

  const calc = (rows: Booking[]) => {
    const completed = rows.filter((b) => b.status === "Completed");
    const completedApproved = completed.filter((b) => b.customerApproved);

    const totalRevenue = completedApproved.reduce(
      (sum, b) => sum + b.amount,
      0,
    );
    const totalOrders = rows.length;
    const completedCount = completed.length;
    const conversionRate = totalOrders
      ? (completedCount / totalOrders) * 100
      : 0;
    const aov = completedApproved.length
      ? totalRevenue / completedApproved.length
      : 0;
    const activeDeliveries = rows.filter((b) => b.status === "Ongoing").length;
    const deliveryHealth = completedApproved.length;

    return {
      totalRevenue,
      totalOrders,
      conversionRate,
      aov,
      activeDeliveries,
      deliveryHealth,
    };
  };

  const cur = useMemo(() => calc(filtered), [filtered]);
  const prev = useMemo(() => calc(prevFiltered), [prevFiltered]);

  const chartPoints: AnalyticsRevenuePoint[] = useMemo(() => {
    const days = daysForRange(range);
    const end = toDateOnly(new Date());
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    const map = new Map<string, { revenue: number; ordersJobs: number }>();
    for (const b of filtered) {
      const d = parseDate(b.date);
      if (!d) continue;
      const k = keyOf(d);
      const prevVal = map.get(k) ?? { revenue: 0, ordersJobs: 0 };
      prevVal.ordersJobs += 1;
      if (b.status === "Completed" && b.customerApproved) {
        prevVal.revenue += b.amount;
      }
      map.set(k, prevVal);
    }

    const out: AnalyticsRevenuePoint[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const k = keyOf(d);
      const v = map.get(k) ?? { revenue: 0, ordersJobs: 0 };
      out.push({
        label: labelOf(d),
        revenue: v.revenue,
        ordersJobs: v.ordersJobs,
      });
    }
    return out;
  }, [filtered, range]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Service dashboard with KPIs, trends, and performance insights.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AnalyticsKPI
          title="Service Earnings"
          value={cur.totalRevenue}
          changePct={safePct(cur.totalRevenue, prev.totalRevenue)}
          loading={false}
          format="currency"
        />
        <AnalyticsKPI
          title="Total Bookings"
          value={cur.totalOrders}
          changePct={safePct(cur.totalOrders, prev.totalOrders)}
          loading={false}
        />
        <AnalyticsKPI
          title="Conversion Rate"
          value={cur.conversionRate}
          changePct={safePct(cur.conversionRate, prev.conversionRate)}
          loading={false}
          format="percent"
        />
        <AnalyticsKPI
          title="Average Order Value (AOV)"
          value={cur.aov}
          changePct={safePct(cur.aov, prev.aov)}
          loading={false}
          format="currency"
        />
        <AnalyticsKPI
          title="Active Deliveries"
          value={cur.activeDeliveries}
          changePct={safePct(cur.activeDeliveries, prev.activeDeliveries)}
          loading={false}
        />
        <AnalyticsKPI
          title="Delivery Health"
          value={cur.deliveryHealth}
          changePct={safePct(cur.deliveryHealth, prev.deliveryHealth)}
          loading={false}
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
