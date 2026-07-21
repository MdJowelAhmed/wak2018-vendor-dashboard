import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardActiveDelivery } from "@/types/api";
import { OrderStatusBadge } from "@/components/status-badge";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import { fadeUp, hoverLift } from "@/components/ui/motion";

type Props = {
  items: DashboardActiveDelivery[];
  isLoading?: boolean;
  className?: string;
};

export function ActiveDeliveries({ items, isLoading, className }: Props) {
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

        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-semibold">
              Active deliveries
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Driver assignments and state
            </CardDescription>
          </div>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-xl bg-primary/10 text-primary hover:bg-primary/15"
          >
            <Link to="/vendor/delivery-requests">View all</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <Skeleton className="h-36 w-full rounded-2xl" />
          ) : !items.length ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No active deliveries
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-white/60 p-3 transition-colors hover:bg-white"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {d.orderId}
                    </p>
                    <p className="text-xs text-gray-500">
                      Driver: {d.driverName}
                    </p>
                  </div>
                  <OrderStatusBadge
                    status={d.status}
                    className="rounded-full px-2.5 py-1 text-xs"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
