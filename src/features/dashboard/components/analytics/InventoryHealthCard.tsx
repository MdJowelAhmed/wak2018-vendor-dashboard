import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, HeartPulse, Sparkles } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InventoryHealthRate, InventoryOverview } from "@/types/api";

type Props = {
  healthRate?: InventoryHealthRate;
  overview?: InventoryOverview;
  isLoading?: boolean;
};

export function InventoryHealthCard({ healthRate, overview, isLoading }: Props) {
  const inStockRate = healthRate?.inStockRate ?? 0;
  const lowStockRate = healthRate?.lowStockRate ?? 0;
  const outOfStockRate = healthRate?.outOfStockRate ?? 0;

  const inStockCount = overview?.inStockCount ?? 0;
  const lowStockCount = overview?.lowStockCount ?? 0;
  const outOfStockCount = overview?.outOfStockCount ?? 0;

  const pieData = [
    { name: "In Stock", value: inStockCount, rate: inStockRate, color: "#10b981" },
    { name: "Low Stock", value: lowStockCount, rate: lowStockRate, color: "#f59e0b" },
    { name: "Out of Stock", value: outOfStockCount, rate: outOfStockRate, color: "#ef4444" },
  ].filter((item) => item.value > 0 || item.rate > 0);

  // If no data, provide a fallback neutral item
  const displayPieData = pieData.length > 0 ? pieData : [{ name: "No Data", value: 1, rate: 100, color: "#e5e7eb" }];

  const healthScore = Math.round(inStockRate);
  const healthBadge =
    healthScore >= 80
      ? { label: "Excellent Health", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : healthScore >= 60
      ? { label: "Fair - Attention Needed", color: "bg-amber-50 text-amber-700 border-amber-200" }
      : { label: "Critical - Restock Urgently", color: "bg-rose-50 text-rose-700 border-rose-200" };

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute top-0 right-0 size-72 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700">
              <HeartPulse className="size-4" />
            </span>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Inventory Health Rate
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Availability ratios & stock replenishment health index
          </CardDescription>
        </div>
        {!isLoading && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${healthBadge.color}`}
          >
            <Sparkles className="size-3.5" />
            {healthBadge.label}
          </span>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="flex items-center justify-center md:col-span-5">
              <Skeleton className="size-48 rounded-full" />
            </div>
            <div className="space-y-4 md:col-span-7">
              <Skeleton className="h-6 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            {/* Donut chart visualization with center percentage */}
            <div className="relative flex flex-col items-center justify-center lg:col-span-5">
              <div className="relative size-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md">
                              <span className="font-semibold text-gray-800">{data.name}: </span>
                              <span className="font-bold text-gray-900">{data.value} items </span>
                              <span className="text-muted-foreground">({data.rate}%)</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center score */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                    {inStockRate.toFixed(0)}%
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    In Stock Rate
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Health Metrics & Segmented bar */}
            <div className="space-y-4 lg:col-span-7">
              {/* Stacked health visual bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Stock Distribution Bar</span>
                  <span>100% Catalog Capacity</span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 p-0.5 ring-1 ring-black/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(inStockRate, 0)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-l-full bg-emerald-500 shadow-xs"
                    title={`In Stock: ${inStockRate}%`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(lowStockRate, 0)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="h-full bg-amber-500 shadow-xs"
                    title={`Low Stock: ${lowStockRate}%`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(outOfStockRate, 0)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="h-full rounded-r-full bg-rose-500 shadow-xs"
                    title={`Out of Stock: ${outOfStockRate}%`}
                  />
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {/* In Stock */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 transition-all hover:bg-emerald-50/70">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>In Stock</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-gray-900">{inStockCount}</span>
                    <span className="text-xs font-bold text-emerald-700">{inStockRate.toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Healthy availability</p>
                </div>

                {/* Low Stock */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 transition-all hover:bg-amber-50/70">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="size-3.5 text-amber-600" />
                    <span>Low Stock</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-gray-900">{lowStockCount}</span>
                    <span className="text-xs font-bold text-amber-700">{lowStockRate.toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Reorder threshold</p>
                </div>

                {/* Out of Stock */}
                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3 transition-all hover:bg-rose-50/70">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                    <XCircle className="size-3.5 text-rose-600" />
                    <span>Out of Stock</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-bold text-rose-700">{outOfStockCount}</span>
                    <span className="text-xs font-bold text-rose-700">{outOfStockRate.toFixed(1)}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Lost sales risk</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
