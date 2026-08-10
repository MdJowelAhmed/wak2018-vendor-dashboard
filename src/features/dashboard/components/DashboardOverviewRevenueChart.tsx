import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGetMonthlyRevenueQuery } from "@/features/dashboard/services/analyticsApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
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

type Props = {
  weekly?: RevenueChartPoint[]; // Kept for backwards compatibility if needed elsewhere
  monthly?: RevenueChartPoint[];
  mode?: "product" | "service" | "both";
  isLoading?: boolean;
  className?: string;
};

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

export function RevenueChart({ mode = "both", isLoading, className }: Props) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [openStats, setOpenStats] = useState(false);

  const { data: monthlyData, isLoading: isFetching } =
    useGetMonthlyRevenueQuery({ year });

  const data = useMemo<RevenueChartPoint[]>(() => {
    if (!monthlyData) return [];
    return monthlyData.map((d) => ({
      label: d.month,
      product: mode !== "service" ? d.revenue : 0,
      service: mode !== "product" ? d.revenue : 0,
    }));
  }, [monthlyData, mode]);

  const has = data.length > 0;
  const isDataLoading = isLoading || isFetching;

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
                ? "Product revenue over time"
                : mode === "service"
                  ? "Service revenue over time"
                  : "Product vs service"}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-gray-200 bg-white/70"
              onClick={() => setOpenStats(true)}
            >
              Revenue stats
            </Button> */}

            <div className="inline-flex rounded-xl bg-gray-50/80 p-1 ring-1 ring-gray-100 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-8 rounded-lg bg-transparent px-2 text-sm text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-primary/20"
              >
                {[
                  currentYear,
                  currentYear - 1,
                  currentYear - 2,
                  currentYear - 3,
                ].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isDataLoading ? (
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
        monthly={data}
        mode={mode}
      />
    </motion.div>
  );
}
