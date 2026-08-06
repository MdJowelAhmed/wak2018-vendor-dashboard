import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardRecentOrder } from "@/types/api";
import { DashboardOrderStatusBadge } from "@/features/dashboard/components/dashboard-status-badge";
import { cn } from "@/utils/utils";
import { formatCurrency } from "@/utils/format-currency";
import { motion } from "framer-motion";
import { fadeUp, hoverLift } from "@/components/ui/motion";

type Props = {
  orders: DashboardRecentOrder[];
  isLoading?: boolean;
  className?: string;
};

export function RecentOrders({ orders, isLoading, className }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={hoverLift.whileHover}
      transition={hoverLift.transition}
      className="flex h-full flex-col"
    >
      <Card
        className={cn(
          "group flex h-full flex-col relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
        </div>

        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent orders</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Latest orders
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-2xl" />
          ) : !orders.length ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No recent orders
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70">
                    <TableHead className="text-gray-600">Order ID</TableHead>
                    <TableHead className="text-gray-600">Type</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                    <TableHead className="text-right text-gray-600">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-white">
                      <TableCell className="font-mono text-sm text-gray-900">
                        {o.id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-gray-200 bg-white/70 capitalize text-gray-700"
                        >
                          {o.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DashboardOrderStatusBadge
                          statusKey={o.statusKey}
                          label={o.displayStatus}
                          className="rounded-full px-2.5 py-1 text-xs"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-gray-900">
                        {formatCurrency(o.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
