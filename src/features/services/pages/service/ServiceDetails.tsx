import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVICE_DEMO } from "@/features/services";
import { cn } from "@/utils/utils";
import {
  servicePageLoadTransition,
  serviceStatCardHover,
  serviceStatCardVariants,
  serviceStatsStaggerParentVariants,
  serviceTableRowVariants,
  serviceTableSectionVariants,
  serviceTableStaggerParentVariants,
  serviceTopCardVariants,
} from "@/features/services/motion/service-details-variants";

const bookings = [
  {
    id: 1,
    customer: "John",
    date: "2025-05-01",
    status: "Completed",
    amount: 250,
  },
  {
    id: 2,
    customer: "Alex",
    date: "2025-05-03",
    status: "Ongoing",
    amount: 150,
  },
] as const;

const fmtUsd = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function bookingStatusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "completed")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s === "ongoing")
    return "border-[#895129]/35 bg-[#895129]/10 text-[#895129]";
  return "border-border/60 bg-muted/20 text-foreground";
}

const tableRowClass =
  "border-b transition-colors duration-200 hover:bg-muted/40 data-[state=selected]:bg-muted [&:last-child]:border-0";

export function ServiceDetails() {
  const { id } = useParams();
  const serviceId = Number(id);

  const service = useMemo(
    () => SERVICE_DEMO.find((s) => s.id === serviceId),
    [serviceId],
  );

  if (!service || !id || Number.isNaN(serviceId)) {
    return (
      <div className="w-full text-sm text-muted-foreground">
        Service not found
      </div>
    );
  }

  const totalBookings = bookings.length;
  const totalEarnings = bookings.reduce((acc, b) => acc + b.amount, 0);
  const completedEarnings = bookings
    .filter((b) => b.status === "Completed")
    .reduce((acc, b) => acc + b.amount, 0);
  const pendingEarnings = totalEarnings - completedEarnings;

  const statusCls =
    service.status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-zinc-200 bg-zinc-50 text-zinc-700";

  const statItems = [
    { title: "Total Earnings", value: fmtUsd(totalEarnings) },
    { title: "Completed Earnings", value: fmtUsd(completedEarnings) },
    { title: "Pending Earnings", value: fmtUsd(pendingEarnings) },
    { title: "Total Bookings", value: String(totalBookings) },
  ] as const;

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={servicePageLoadTransition}
    >
      <motion.div
        variants={serviceTopCardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">{service.title}</CardTitle>
            <CardDescription>Service overview</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-sm">
              <div className="font-semibold tabular-nums">
                {fmtUsd(service.price)}{" "}
                <span className="text-muted-foreground font-medium">
                  / {service.type}
                </span>
              </div>
              <div className="text-muted-foreground">
                Delivery time: {service.delivery}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("transition-colors duration-300", statusCls)}
            >
              {service.status}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          variants={serviceTableSectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="rounded-xl border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                Latest bookings for this service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  className="[&_tr:last-child]:border-0"
                  variants={serviceTableStaggerParentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {bookings.map((b) => (
                    <motion.tr
                      key={b.id}
                      variants={serviceTableRowVariants}
                      className={tableRowClass}
                    >
                      <TableCell className="font-medium">
                        {b.customer}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.date}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "transition-colors duration-300 ease-out",
                            bookingStatusBadgeClass(b.status),
                          )}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtUsd(b.amount)}
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={serviceStatsStaggerParentVariants}
          initial="hidden"
          animate="visible"
        >
          {statItems.map((item) => (
            <motion.div
              key={item.title}
              variants={serviceStatCardVariants}
              {...serviceStatCardHover}
              className="min-h-0"
            >
              <Card className="h-full rounded-xl border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {item.value}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
