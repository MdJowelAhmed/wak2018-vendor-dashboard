import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsRevenuePoint } from "@/types/api";
import { cn } from "@/utils/utils";

export function ServiceRevenueChart({
  points,
  isLoading,
  year,
  onChangeYear,
  className,
}: {
  points: AnalyticsRevenuePoint[] | undefined;
  isLoading?: boolean;
  year: number;
  onChangeYear: (y: number) => void;
  className?: string;
}) {
  const data = useMemo(() => points ?? [], [points]);
  const has = data.length > 0;

  const [hovered, setHovered] = useState<AnalyticsRevenuePoint | null>(null);

  return (
    <Card className={cn("rounded-xl border-border/60 shadow-sm", className)}>
      <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <CardTitle>Service earnings &amp; growth</CardTitle>
          <CardDescription>
            Service earnings (approved only) and bookings over time.
          </CardDescription>
        </div>
        <div className="inline-flex">
          <Select
            value={String(year)}
            onValueChange={(v) => onChangeYear(Number(v))}
          >
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : has ? (
          <div className="h-72 w-full min-h-[280px]">
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                onMouseMove={(s) => {
                  const p = (s as any)?.activePayload?.[0]?.payload as
                    | AnalyticsRevenuePoint
                    | undefined;
                  if (p) setHovered(p);
                }}
                onMouseLeave={() => setHovered(null)}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="label" tickLine={false} className="text-xs" />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  className="text-xs"
                  width={56}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  className="text-xs"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid hsl(214.3 31.8% 91.4%)",
                    background: "hsl(0 0% 100%)",
                  }}
                  formatter={(v: any, name: any) => {
                    const n = String(name ?? "");
                    if (n === "Service Earnings") {
                      return [
                        new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(v ?? 0)),
                        n,
                      ];
                    }
                    return [v, n];
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  name="Service Earnings"
                  dataKey="revenue"
                  stroke="#895129"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  name="Bookings"
                  dataKey="ordersJobs"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No chart data available.
          </p>
        )}

        {hovered ? (
          <div className="text-muted-foreground mt-3 text-xs">
            {hovered.label} ·{" "}
            <span className="text-foreground font-medium">
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: "USD",
              }).format(hovered.revenue)}
            </span>{" "}
            service earnings ·{" "}
            <span className="text-foreground font-medium">
              {hovered.ordersJobs}
            </span>{" "}
            bookings
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
