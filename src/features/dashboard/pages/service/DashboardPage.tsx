import { useMemo, useState } from "react";
import { Banknote, CalendarDays, Timer, Wrench } from "lucide-react";
import {
  StatsCards,
  type StatCard,
} from "@/features/dashboard/components/overview/StatsCards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/utils/format-currency";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Range = "weekly" | "monthly";

type OverviewPoint = {
  label: string;
  earnings: number;
  bookings: number;
};

type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

type BookingRow = {
  id: string;
  serviceName: string;
  customer: string;
  status: BookingStatus;
  amount: number;
  date: string;
};

type UpcomingBooking = {
  id: string;
  client: string;
  service: string;
  time: string;
  status: "scheduled" | "in_progress" | "confirmed";
};

type TopServiceRow = {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
};

const DEMO_WEEKLY: OverviewPoint[] = [
  { label: "Mon", earnings: 4200, bookings: 6 },
  { label: "Tue", earnings: 5100, bookings: 7 },
  { label: "Wed", earnings: 3800, bookings: 5 },
  { label: "Thu", earnings: 6400, bookings: 9 },
  { label: "Fri", earnings: 7200, bookings: 10 },
  { label: "Sat", earnings: 5600, bookings: 8 },
  { label: "Sun", earnings: 3000, bookings: 4 },
];

const DEMO_MONTHLY: OverviewPoint[] = [
  { label: "W1", earnings: 18600, bookings: 24 },
  { label: "W2", earnings: 21400, bookings: 29 },
  { label: "W3", earnings: 19800, bookings: 26 },
  { label: "W4", earnings: 23200, bookings: 31 },
];

const DEMO_RECENT: BookingRow[] = [
  {
    id: "BK-10291",
    serviceName: "AC Servicing",
    customer: "Nusrat Jahan",
    status: "completed",
    amount: 1800,
    date: "2026-04-26",
  },
  {
    id: "BK-10286",
    serviceName: "Deep Cleaning",
    customer: "Rahim Uddin",
    status: "in_progress",
    amount: 2500,
    date: "2026-04-26",
  },
  {
    id: "BK-10280",
    serviceName: "Plumbing Fix",
    customer: "Amina Khatun",
    status: "confirmed",
    amount: 1200,
    date: "2026-04-25",
  },
  {
    id: "BK-10277",
    serviceName: "Electrical Check",
    customer: "Tanjil Hasan",
    status: "pending",
    amount: 900,
    date: "2026-04-25",
  },
  {
    id: "BK-10271",
    serviceName: "AC Servicing",
    customer: "Sabbir Ahmed",
    status: "completed",
    amount: 1800,
    date: "2026-04-24",
  },
];

const DEMO_UPCOMING: UpcomingBooking[] = [
  {
    id: "UP-551",
    client: "Shirin Akter",
    service: "Deep Cleaning",
    time: "Today · 3:30 PM",
    status: "confirmed",
  },
  {
    id: "UP-548",
    client: "Mehedi Hasan",
    service: "AC Servicing",
    time: "Tomorrow · 10:00 AM",
    status: "scheduled",
  },
  {
    id: "UP-540",
    client: "Sakib Khan",
    service: "Plumbing Fix",
    time: "Tomorrow · 6:00 PM",
    status: "scheduled",
  },
];

const DEMO_TOP_SERVICES: TopServiceRow[] = [
  { name: "AC Servicing", bookings: 46, revenue: 82800, rating: 4.8 },
  { name: "Deep Cleaning", bookings: 31, revenue: 77500, rating: 4.7 },
  { name: "Plumbing Fix", bookings: 22, revenue: 26400, rating: 4.6 },
  { name: "Electrical Check", bookings: 18, revenue: 16200, rating: 4.5 },
];

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    confirmed: {
      label: "Confirmed",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    in_progress: {
      label: "In progress",
      className: "border-teal-200 bg-teal-50 text-teal-700",
    },
    completed: {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={cn("capitalize", m.className)}>
      {m.label}
    </Badge>
  );
}

function UpcomingStatusBadge({
  status,
}: {
  status: UpcomingBooking["status"];
}) {
  const map: Record<
    UpcomingBooking["status"],
    { label: string; className: string }
  > = {
    scheduled: {
      label: "Scheduled",
      className: "border-zinc-200 bg-zinc-50 text-zinc-700",
    },
    confirmed: {
      label: "Confirmed",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    in_progress: {
      label: "In progress",
      className: "border-teal-200 bg-teal-50 text-teal-700",
    },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={cn(m.className)}>
      {m.label}
    </Badge>
  );
}

export function DashboardPage() {
  const [range, setRange] = useState<Range>("weekly");
  const points = range === "weekly" ? DEMO_WEEKLY : DEMO_MONTHLY;

  const totals = useMemo(() => {
    const totalEarnings = DEMO_MONTHLY.reduce((acc, p) => acc + p.earnings, 0);
    const totalBookings = DEMO_MONTHLY.reduce((acc, p) => acc + p.bookings, 0);
    const activeServices = 6;
    const pendingRequests = DEMO_RECENT.filter(
      (b) => b.status === "pending",
    ).length;
    return { totalEarnings, totalBookings, activeServices, pendingRequests };
  }, []);

  const stats: StatCard[] = [
    {
      key: "earn",
      label: "Total Earnings",
      value: formatCurrency(totals.totalEarnings),
      sub: "all time",
      icon: Banknote,
    },
    {
      key: "book",
      label: "Total Bookings",
      value: String(totals.totalBookings),
      sub: "bookings",
      icon: CalendarDays,
    },
    {
      key: "srv",
      label: "Active Services",
      value: String(totals.activeServices),
      sub: "listed",
      icon: Wrench,
    },
    {
      key: "pend",
      label: "Pending Requests",
      value: String(totals.pendingRequests),
      sub: "awaiting action",
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

      {/* Section 1: Top stats */}
      <StatsCards items={stats} />

      {/* Section 2: Chart */}
      <Card className="bg-card text-card-foreground border-border/60 rounded-xl border shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Bookings &amp; Earnings Overview</CardTitle>
            <CardDescription>
              Compare bookings and earnings across time
            </CardDescription>
          </div>
          <div className="bg-muted inline-flex rounded-lg p-1">
            {(["weekly", "monthly"] as const).map((r) => (
              <Button
                key={r}
                type="button"
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setRange(r)}
              >
                {r === "weekly" ? "Weekly" : "Monthly"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full min-h-[280px]">
            <ResponsiveContainer>
              <LineChart
                data={points}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="label" tickLine={false} className="text-xs" />
                <YAxis
                  yAxisId="left"
                  className="text-xs"
                  width={48}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  width={36}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(214.3 31.8% 91.4%)",
                    background: "hsl(0 0% 100%)",
                  }}
                  formatter={(value: unknown, name?: string | number) => {
                    const key = String(name ?? "");
                    if (key === "earnings" && typeof value === "number")
                      return [formatCurrency(value), "Earnings"];
                    if (key === "bookings" && typeof value === "number")
                      return [String(value), "Bookings"];
                    return [String(value), key];
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  name="earnings"
                  dataKey="earnings"
                  stroke="#895129"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  name="bookings"
                  dataKey="bookings"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Section 3: Recent bookings */}
        <Card className="bg-card text-card-foreground border-border/60 rounded-xl border shadow-sm">
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Latest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_RECENT.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-sm">{b.id}</TableCell>
                    <TableCell className="font-medium">
                      {b.serviceName}
                    </TableCell>
                    <TableCell>{b.customer}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(b.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {b.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          {/* Section 4: Upcoming bookings */}
          <Card className="bg-card text-card-foreground border-border/60 rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming bookings</CardTitle>
              <CardDescription>Next scheduled jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEMO_UPCOMING.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {u.client}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.service}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {u.time}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <UpcomingStatusBadge status={u.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Top services */}
          <Card className="bg-card text-card-foreground border-border/60 rounded-xl border shadow-sm">
            <CardHeader>
              <CardTitle>Top services</CardTitle>
              <CardDescription>Most booked services</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {DEMO_TOP_SERVICES.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.bookings}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(s.revenue)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.rating.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
