import { motion } from "framer-motion";
import { AlertTriangle, Boxes, CheckCircle2, DollarSign, Package, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { fadeUp, hoverLift, staggerContainer } from "@/components/ui/motion";
import { formatCurrency, useCurrency } from "@/utils/format-currency";
import type { InventoryOverview } from "@/types/api";

type Props = {
  data?: InventoryOverview;
  isLoading?: boolean;
};

export function InventoryOverviewCards({ data, isLoading }: Props) {
  useCurrency();

  const totalAlerts = (data?.lowStockCount ?? 0) + (data?.outOfStockCount ?? 0);

  return (
    <motion.div
      variants={staggerContainer(0.08, 0.03)}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {/* 1. Total Inventory Valuation */}
      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
      >
        <Card className="group relative overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/30 p-1 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-200">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Inventory Valuation</span>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80 shadow-xs">
                <DollarSign className="size-4" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1">
            <div className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                <AnimatedNumber
                  value={data?.totalInventoryValue ?? 0}
                  format={(val) => formatCurrency(val)}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total estimated physical inventory value
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Total Stock Units */}
      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
      >
        <Card className="group relative overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 p-1 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Total Units in Stock</span>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100/80 shadow-xs">
                <Package className="size-4" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1">
            <div className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <AnimatedNumber value={data?.totalStockUnits ?? 0} />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {data?.totalProducts ?? 0} listed inventory items
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Catalog Status */}
      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
      >
        <Card className="group relative overflow-hidden rounded-2xl border border-purple-100/80 bg-gradient-to-br from-white via-white to-purple-50/30 p-1 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-purple-200">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Catalog Status</span>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100/80 shadow-xs">
                <Boxes className="size-4" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1">
            <div className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {isLoading ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span>{data?.activeProducts ?? 0}</span>
                  <span className="text-sm font-medium text-emerald-600">Active</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              <span>{data?.activeProducts ?? 0} live</span>
              <span>·</span>
              <span className="inline-block size-1.5 rounded-full bg-gray-300" />
              <span>{data?.inactiveProducts ?? 0} inactive</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Attention & Stock Alerts */}
      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
      >
        <Card
          className={`group relative overflow-hidden rounded-2xl border p-1 shadow-sm transition-all duration-300 hover:shadow-xl ${
            totalAlerts > 0
              ? "border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/40 hover:border-rose-300"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                totalAlerts > 0
                  ? "from-rose-500/10 to-amber-500/10"
                  : "from-emerald-500/10 to-teal-500/10"
              }`}
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Attention Needed</span>
              <span
                className={`inline-flex size-9 items-center justify-center rounded-xl shadow-xs ${
                  totalAlerts > 0
                    ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200/80"
                    : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80"
                }`}
              >
                {totalAlerts > 0 ? (
                  <ShieldAlert className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-1">
            <div
              className={`text-2xl font-bold tracking-tight sm:text-3xl ${
                totalAlerts > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <AnimatedNumber value={totalAlerts} />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {totalAlerts > 0 ? (
                <>
                  <span className="font-semibold text-rose-600">
                    {data?.outOfStockCount ?? 0} out
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-amber-600">
                    {data?.lowStockCount ?? 0} low stock
                  </span>
                </>
              ) : (
                <span className="text-emerald-600 font-medium">All stock levels optimal</span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
