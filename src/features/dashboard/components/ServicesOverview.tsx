import {
  Card,
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
  active: number;
  topName: string;
  topSales?: number;
  isLoading?: boolean;
  className?: string;
};

export function ServicesOverview({
  total,
  active,
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
      >
        <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 py-0 shadow-sm transition-shadow duration-300 hover:shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
          </div>
          <CardHeader>
            <CardDescription className="text-sm text-gray-500">
              Total services
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-gray-900">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <AnimatedNumber value={total} />
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
      >
        <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 py-0 shadow-sm transition-shadow duration-300 hover:shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
          </div>
          <CardHeader>
            <CardDescription className="text-sm text-gray-500">
              Active services
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-primary">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <AnimatedNumber value={active} />
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeUp}
        whileHover={hoverLift.whileHover}
        transition={hoverLift.transition}
      >
        <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 py-0 shadow-sm transition-shadow duration-300 hover:shadow-xl">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
          </div>
          <CardHeader>
            <CardDescription className="text-sm text-gray-500">
              Top service
            </CardDescription>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-40" />
            ) : (
              <>
                <CardTitle className="text-base font-semibold leading-tight text-gray-900">
                  {topName}
                </CardTitle>
                {topSales !== undefined && (
                  <p className="text-xs text-gray-500">
                    Sales / bookings: {topSales}
                  </p>
                )}
              </>
            )}
          </CardHeader>
        </Card>
      </motion.div>
    </motion.div>
  );
}
