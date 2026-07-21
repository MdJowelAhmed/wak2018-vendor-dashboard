import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueChartPoint } from "@/types/api";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/utils/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/motion";

function sumForMode(
  p: RevenueChartPoint,
  mode: "product" | "service" | "both",
) {
  if (mode === "product") return p.product;
  if (mode === "service") return p.service;
  return p.product + p.service;
}

function niceTick(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

export function RevenueStatsModal({
  open,
  onOpenChange,
  monthly,
  mode = "both",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthly: RevenueChartPoint[];
  mode?: "product" | "service" | "both";
}) {
  const [period, setPeriod] = useState<"yearly">("yearly");

  const points = useMemo(() => {
    // Expect 12 points (Jan–Dec) from caller; fall back safely if not.
    const base = monthly?.slice(0, 12) ?? [];
    return base.map((p) => ({
      label: p.label,
      value: sumForMode(p, mode),
    }));
  }, [monthly, mode]);

  const { avg, last, prev, changePct } = useMemo(() => {
    const vals = points.map((p) => p.value).filter((n) => Number.isFinite(n));
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = vals.length ? sum / vals.length : 0;
    const last = vals.at(-1) ?? 0;
    const prev = vals.length >= 2 ? vals.at(-2)! : 0;
    const changePct = prev ? ((last - prev) / prev) * 100 : 0;
    return { avg, last, prev, changePct };
  }, [points]);

  const maxIndex = useMemo(() => {
    let idx = 0;
    let best = -Infinity;
    for (let i = 0; i < points.length; i++) {
      const v = points[i]!.value;
      if (v > best) {
        best = v;
        idx = i;
      }
    }
    return idx;
  }, [points]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(92vw,72rem)] rounded-2xl border border-gray-100 bg-white/95 p-0 shadow-xl backdrop-blur">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid gap-0 md:grid-cols-[320px_1fr]"
        >
          {/* Left stats panel */}
          <div className="border-b border-gray-100 p-6 md:border-b-0 md:border-r">
            <div className="text-lg font-semibold text-gray-900">
              Revenue stats
            </div>
            <div className="mt-6 space-y-2">
              <div className="text-sm text-gray-500">
                Average monthly revenue
              </div>
              <div className="text-3xl font-bold tracking-tight text-gray-900">
                {formatCurrency(avg)}
              </div>
              <div className="text-xs text-gray-500">
                m/m: {formatCurrency(last - prev)}{" "}
                <span
                  className={cn(
                    "font-medium",
                    changePct >= 0 ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  ({changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-1 text-sm text-gray-600">
              <div>
                Staking rewards:{" "}
                <span className="font-medium text-gray-900">
                  {formatCurrency(86.05)}
                </span>
              </div>
              <div>2 upcoming airdrops</div>
              <div>
                Transactions:{" "}
                <span className="font-medium text-gray-900">4</span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                type="button"
                variant="ghost"
                className="h-9 justify-start gap-2 rounded-xl px-3 text-primary hover:bg-primary/10"
                onClick={() => {
                  // UI-only placeholder; keeps existing functionality intact.
                  // Implement report generation later if desired.
                }}
              >
                <Download className="size-4" />
                Download PDF report
              </Button>
            </div>
          </div>

          {/* Right chart panel */}
          <div className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-lg font-semibold text-gray-900">
                Revenue stats
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Select
                  value={period}
                  onValueChange={(v) => setPeriod(v as "yearly")}
                >
                  <SelectTrigger className="h-9 rounded-xl border-gray-200 bg-white/80">
                    <SelectValue placeholder="Yearly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-gray-200 bg-white/80"
                  onClick={() => {
                    // UI-only placeholder
                  }}
                >
                  <SlidersHorizontal className="mr-2 size-4" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="mt-4 h-72 w-full rounded-2xl border border-gray-100 bg-white/70 p-2">
              <ResponsiveContainer>
                <BarChart
                  data={points}
                  margin={{ top: 10, right: 12, bottom: 6, left: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-gray-100"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs fill-gray-500"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={niceTick}
                    className="text-xs fill-gray-500"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(137,81,41,0.06)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const v = Number(payload[0]?.value ?? 0);
                      return (
                        <div className="rounded-2xl border border-gray-100 bg-gray-900 px-3 py-2 text-white shadow-lg">
                          <div className="text-xs opacity-80">
                            {String(label ?? "")}
                          </div>
                          <div className="text-base font-semibold">
                            {formatCurrency(v)}
                          </div>
                        </div>
                      );
                    }}
                  />

                  <Bar
                    dataKey="value"
                    radius={[10, 10, 10, 10]}
                    barSize={28}
                    isAnimationActive
                    animationDuration={700}
                  >
                    {points.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === maxIndex ? "#895129" : "rgba(137,81,41,0.25)"
                        }
                        stroke={
                          i === maxIndex ? "#895129" : "rgba(137,81,41,0.18)"
                        }
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
