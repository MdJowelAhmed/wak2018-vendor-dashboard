import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueChartPoint } from "@/types/api";
import { cn } from "@/utils/utils";
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fadeUp, hoverLift } from "@/components/ui/motion";
import { RevenueStatsModal } from "@/features/dashboard/components/RevenueStatsModal";

type Range = "weekly" | "monthly";

type Props = {
  weekly: RevenueChartPoint[];
  monthly: RevenueChartPoint[];
  mode?: "product" | "service" | "both";
  isLoading?: boolean;
  className?: string;
};

const WEEK_LABELS = ["W1", "W2", "W3", "W4"] as const;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseDateLabel(label: string) {
  const d = new Date(label);
  return Number.isNaN(d.getTime()) ? null : d;
}

function looksLikeDailySeries(points: RevenueChartPoint[]) {
  if (points.length < 14) return false;
  const sample = points.slice(0, 6);
  const ok = sample.filter((p) => parseDateLabel(p.label) != null).length;
  return ok >= 3;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateToCount(
  source: RevenueChartPoint[],
  count: number,
  labels: string[],
) {
  if (!source.length) {
    return labels
      .slice(0, count)
      .map((label) => ({ label, product: 0, service: 0 }));
  }
  if (source.length === 1) {
    const p = source[0];
    return labels
      .slice(0, count)
      .map((label) => ({ label, product: p.product, service: p.service }));
  }

  return labels.slice(0, count).map((label, i) => {
    const pos = (i / Math.max(1, count - 1)) * (source.length - 1);
    const idx = Math.floor(pos);
    const t = pos - idx;
    const a = source[idx]!;
    const b = source[Math.min(idx + 1, source.length - 1)]!;
    return {
      label,
      product: lerp(a.product, b.product, t),
      service: lerp(a.service, b.service, t),
    };
  });
}

function sumPoint(
  a: RevenueChartPoint,
  b: RevenueChartPoint,
): RevenueChartPoint {
  return {
    label: a.label,
    product: a.product + b.product,
    service: a.service + b.service,
  };
}

function aggregateIntoBuckets(
  source: RevenueChartPoint[],
  bucketCount: number,
  labels: string[],
) {
  if (!source.length)
    return labels
      .slice(0, bucketCount)
      .map((label) => ({ label, product: 0, service: 0 }));
  const buckets: RevenueChartPoint[] = labels
    .slice(0, bucketCount)
    .map((label) => ({ label, product: 0, service: 0 }));
  for (let i = 0; i < source.length; i++) {
    const bi = Math.min(
      bucketCount - 1,
      Math.floor((i / Math.max(1, source.length)) * bucketCount),
    );
    buckets[bi] = sumPoint(buckets[bi]!, source[i]!);
  }
  return buckets;
}

function MoneyTick(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: unknown;
    name?: unknown;
    value?: unknown;
    color?: unknown;
  }>;
  label?: unknown;
}) {
  if (!active || !payload?.length) return null;

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(n);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      <div className="text-xs font-medium text-gray-700">
        {String(label ?? "")}
      </div>
      <div className="mt-1 space-y-1">
        {payload
          .filter((p) => typeof p.value === "number")
          .map((p) => (
            <div
              key={String(p.dataKey ?? p.name ?? "")}
              className="flex items-center justify-between gap-6 text-xs"
            >
              <span className="flex items-center gap-2 text-gray-600">
                <span
                  className="size-2 rounded-full"
                  style={{ background: String(p.color ?? "#4f46e5") }}
                />
                {String(p.name ?? p.dataKey ?? "")}
              </span>
              <span className="font-semibold tabular-nums text-gray-900">
                {fmtMoney(Number(p.value ?? 0))}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function RevenueChart({
  weekly,
  monthly,
  mode = "both",
  isLoading,
  className,
}: Props) {
  const [range, setRange] = useState<Range>("weekly");
  const [openStats, setOpenStats] = useState(false);

  const data = useMemo<RevenueChartPoint[]>(() => {
    if (range === "weekly") {
      // expected: 4 weeks (W1–W4)
      if (weekly.length === 4) return weekly;
      if (weekly.length > 4 && !looksLikeDailySeries(weekly))
        return weekly
          .slice(-4)
          .map((p, i) => ({ ...p, label: WEEK_LABELS[i] }));

      // if we got daily series, aggregate to 4 buckets (last 28 days, or all if shorter)
      const base = weekly.length > 28 ? weekly.slice(-28) : weekly;
      if (looksLikeDailySeries(base))
        return aggregateIntoBuckets(base, 4, [...WEEK_LABELS]);

      // fallback: interpolate to 4
      return interpolateToCount(weekly, 4, [...WEEK_LABELS]);
    }

    // expected: 12 months (Jan–Dec)
    if (monthly.length === 12) return monthly;
    if (monthly.length > 12)
      return monthly
        .slice(-12)
        .map((p, i) => ({ ...p, label: MONTH_LABELS[i] }));

    // If weekly is actually a daily series, aggregate the last ~12 months is not possible without dates;
    // so we map whatever we have into 12 buckets with month labels.
    const seed = monthly.length ? monthly : weekly;
    if (looksLikeDailySeries(seed)) {
      // if it's daily, take up to last 365 points and bucket to 12
      const base = seed.length > 365 ? seed.slice(-365) : seed;
      return aggregateIntoBuckets(base, 12, [...MONTH_LABELS]);
    }

    // fallback for demo monthly (e.g. Jan–Apr): interpolate to 12
    return interpolateToCount(seed, 12, [...MONTH_LABELS]);
  }, [monthly, range, weekly]);

  const has = data.length > 0;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={hoverLift.whileHover}
      transition={hoverLift.transition}
    >
      <Card
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
        </div>

        <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-xl font-semibold">Revenue</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {mode === "product"
                ? "Product revenue over time (toggle period)"
                : mode === "service"
                  ? "Service revenue over time (toggle period)"
                  : "Product vs service (toggle period)"}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-gray-200 bg-white/70"
              onClick={() => setOpenStats(true)}
            >
              Revenue stats
            </Button>

            <div className="inline-flex rounded-xl bg-gray-50/80 p-1 ring-1 ring-gray-100 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              {(["weekly", "monthly"] as const).map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 rounded-lg px-3 transition-colors",
                    range === r
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "bg-transparent text-gray-700 hover:bg-white",
                  )}
                  onClick={() => setRange(r)}
                >
                  {r === "weekly" ? "Weekly" : "Monthly"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-2xl" />
          ) : has ? (
            <div className="h-72 w-full min-h-[280px] rounded-2xl border border-gray-100 bg-white/60 p-2 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-white/50">
              <ResponsiveContainer>
                <LineChart
                  data={data}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revPrimaryStroke"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#895129" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a56a3a" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient
                      id="revPrimaryFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#895129"
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="65%"
                        stopColor="#a56a3a"
                        stopOpacity={0.08}
                      />
                      <stop offset="100%" stopColor="#a56a3a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="revPurpleFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.16}
                      />
                      <stop
                        offset="70%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.06}
                      />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-gray-100"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-gray-500"
                    dy={6}
                  />
                  <YAxis
                    className="text-xs fill-gray-500"
                    width={56}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={MoneyTick}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(137,81,41,0.25)", strokeWidth: 1 }}
                    content={<RevenueTooltip />}
                  />
                  {mode === "both" ? (
                    <Legend
                      wrapperStyle={{ paddingTop: 8 }}
                      formatter={(value) => (
                        <span className="text-xs font-medium text-gray-600">
                          {String(value)}
                        </span>
                      )}
                    />
                  ) : null}

                  {mode !== "service" ? (
                    <>
                      <Area
                        type="monotone"
                        name="Product revenue"
                        dataKey="product"
                        fill="url(#revPrimaryFill)"
                        stroke="none"
                        isAnimationActive
                        animationDuration={900}
                      />
                      <Line
                        type="monotone"
                        name="Product revenue"
                        dataKey="product"
                        stroke="url(#revPrimaryStroke)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                          r: 4,
                          stroke: "#895129",
                          strokeWidth: 2,
                          fill: "#ffffff",
                        }}
                        isAnimationActive
                        animationDuration={900}
                      />
                    </>
                  ) : null}
                  {mode !== "product" ? (
                    <>
                      <Area
                        type="monotone"
                        name="Service revenue"
                        dataKey="service"
                        fill="url(#revPurpleFill)"
                        stroke="none"
                        isAnimationActive
                        animationDuration={900}
                      />
                      <Line
                        type="monotone"
                        name="Service revenue"
                        dataKey="service"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                          r: 4,
                          stroke: "#8b5cf6",
                          strokeWidth: 2,
                          fill: "#ffffff",
                        }}
                        isAnimationActive
                        animationDuration={900}
                      />
                    </>
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              No chart data (connect analytics or enable demo).
            </p>
          )}
        </CardContent>
      </Card>

      <RevenueStatsModal
        open={openStats}
        onOpenChange={setOpenStats}
        monthly={monthly}
        mode={mode}
      />
    </motion.div>
  );
}
