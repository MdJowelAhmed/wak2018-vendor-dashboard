import { useMemo, useState } from "react";
import { Banknote, CalendarDays, Timer, Wrench } from "lucide-react";
import {
  useGetDashboardOverviewQuery,
  useGetMonthlyRevenueQuery,
  useGetServiceRecentBookingsQuery,
  useGetServiceTopServicesQuery,
} from "@/features/dashboard";
import {
  StatsCards,
  type StatCard,
} from "@/features/dashboard/components/overview/StatsCards";
import { ServiceRevenueChart } from "@/features/dashboard/components/analytics/ServiceRevenueChart";
import { formatCurrency } from "@/utils/format-currency";
import type { AnalyticsRevenuePoint } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/utils";

function ServiceOrderStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "pending";
  const map: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    in_progress: {
      label: "In Progress",
      className: "border-teal-200 bg-teal-50 text-teal-700",
    },
    completed: {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    },
  };
  const m = map[s] || {
    label: s,
    className: "border-gray-200 bg-gray-50 text-gray-700",
  };
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", m.className)}>
      {m.label}
    </Badge>
  );
}

export function DashboardPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const overviewQ = useGetDashboardOverviewQuery({ role: "service" });
  const monthlyRevenueQ = useGetMonthlyRevenueQuery({ year, role: "service" });
  const recentBookingsQ = useGetServiceRecentBookingsQuery();
  const topServicesQ = useGetServiceTopServicesQuery();

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

  const recentBookings = recentBookingsQ.data || [];
  const topServices = topServicesQ.data || [];

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

      {/* Bottom Section: Recent Bookings & Top Services */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="bg-card text-card-foreground border-border/60 rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Latest activity and requested bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookingsQ.isLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                Loading recent bookings...
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((b: any) => (
                      <TableRow key={b._id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {b.orderId || b._id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {b.service?.name || "Service"}
                        </TableCell>
                        <TableCell>{b.customer?.name || "Customer"}</TableCell>
                        <TableCell>
                          <ServiceOrderStatusBadge status={b.orderStatus} />
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(b.price ?? b.netAmount ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No recent bookings found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="bg-card text-card-foreground border-border/60 rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle>Top services</CardTitle>
            <CardDescription>Most booked services and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {topServicesQ.isLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                Loading top services...
              </div>
            ) : topServices.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service name</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topServices.map((s: any) => (
                      <TableRow key={s._id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {s.bookingCount ?? 0}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(s.revenue ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-amber-600">
                          ⭐ {(s.averageRating ?? 0).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No top services data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
