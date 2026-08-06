import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { fadeUp, hoverLift, staggerContainer } from "@/components/ui/motion";

type Props = {
  total: number;
  lowStockCount: number;
  topName: string;
  topSales?: number;
  isLoading?: boolean;
  className?: string;
};

export function ProductsOverview({
  total,
  lowStockCount,
  topName,
  topSales,
  isLoading,
  className,
}: Props) {
  return (
    <motion.div
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}
      variants={staggerContainer(0.06, 0.02)}
      initial="hidden"
      animate="show"
    >
      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
        className="h-full"
      >
        <Card className="flex h-full flex-col group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm text-gray-500">
              Total products
            </CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums text-gray-900 truncate">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <AnimatedNumber value={total} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-auto">
            <p className="text-xs text-muted-foreground">
              All listed inventory
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
        className="h-full"
      >
        <Card
          className={cn(
            "flex h-full flex-col group relative overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-300 hover:shadow-xl",
            lowStockCount > 0
              ? "border-rose-200 bg-rose-50/50"
              : "border-gray-100 bg-white/80",
          )}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                lowStockCount > 0
                  ? "from-rose-500/10 to-purple-500/10"
                  : "from-primary/10 to-purple-500/10",
              )}
            />
          </div>
          <CardHeader className="pb-2">
            <CardDescription
              className={cn(
                "text-sm",
                lowStockCount > 0 ? "text-rose-600" : "text-gray-500",
              )}
            >
              Low stock items
            </CardDescription>
            <CardTitle
              className={cn(
                "text-2xl font-bold tabular-nums truncate",
                lowStockCount > 0 ? "text-rose-700" : "text-gray-900",
              )}
            >
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <AnimatedNumber value={lowStockCount} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-auto">
            {lowStockCount > 0 ? (
              <p className="text-xs text-rose-700/80">Review inventory soon</p>
            ) : (
              <p className="text-xs text-muted-foreground">Stock is healthy</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
        className="h-full"
      >
        <Card className="flex h-full flex-col group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm text-gray-500">
              Top product
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 truncate">
              {isLoading ? <Skeleton className="h-8 w-40" /> : topName || "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-auto">
            {isLoading ? (
              <Skeleton className="mt-1 h-3 w-20" />
            ) : topSales !== undefined ? (
              <p className="text-xs text-muted-foreground">
                Units sold: {topSales}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Not enough data</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
