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

export function RevenueChart({
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
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <CardTitle>Revenue & growth</CardTitle>
          <CardDescription>Revenue and orders/jobs over time.</CardDescription>
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
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - 5 + i,
              ).map((y) => (
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
          <div className="h-72 w-full min-h-[280px] rounded-xl border border-border/60 bg-background/40 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/30">
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
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                  }}
                  formatter={(v: any, name: any) => {
                    const n = String(name ?? "");
                    if (n === "Revenue") {
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
                  name="Revenue"
                  dataKey="revenue"
                  stroke="#895129"
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  name="Orders/Jobs"
                  dataKey="ordersJobs"
                  stroke="#0d9488"
                  strokeWidth={2.25}
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
            revenue ·{" "}
            <span className="text-foreground font-medium">
              {hovered.ordersJobs}
            </span>{" "}
            orders/jobs
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
