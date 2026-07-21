import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { cn } from "@/utils/utils";
import { fadeUp, hoverLift } from "@/components/ui/motion";

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function fmtPct(n: number) {
  const v = Math.abs(n);
  const s = v >= 10 ? v.toFixed(0) : v.toFixed(1);
  return `${n >= 0 ? "+" : "-"}${s}%`;
}

export function AnalyticsKPI({
  title,
  value,
  changePct,
  loading,
  format = "number",
  suffix,
}: {
  title: string;
  value: number | undefined;
  changePct: number | undefined;
  loading?: boolean;
  format?: "number" | "currency" | "percent";
  suffix?: string;
}) {
  const up = (changePct ?? 0) >= 0;
  const TrendIcon = up ? TrendingUp : TrendingDown;

  const fmtValue = (n: number) => {
    if (format === "currency") return fmtMoney(n);
    if (format === "percent") return `${n.toFixed(1)}%`;
    return `${new Intl.NumberFormat().format(n)}${suffix ?? ""}`;
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={hoverLift.whileHover}
      transition={hoverLift.transition}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3 text-sm font-medium text-gray-500">
            <span className="truncate">{title}</span>
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100">
              <Activity className="size-4 text-primary/80" />
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <Skeleton className="h-9 w-28" />
          ) : value === undefined ? (
            <div className="text-3xl font-bold tracking-tight text-gray-900">
              —
            </div>
          ) : (
            <div className="text-3xl font-bold tracking-tight text-gray-900">
              <AnimatedNumber value={value} format={fmtValue} />
            </div>
          )}

          {loading ? (
            <Skeleton className="h-5 w-32 rounded-full" />
          ) : changePct === undefined ? (
            <div className="text-xs text-gray-500">—</div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ring-1",
                  up
                    ? "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20"
                    : "bg-rose-500/10 text-rose-700 ring-rose-600/20",
                )}
              >
                <TrendIcon className="size-4" />
                <span>{fmtPct(changePct)}</span>
              </span>
              <span className="text-gray-500">vs previous</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
