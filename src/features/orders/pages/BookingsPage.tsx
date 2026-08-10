import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingDetailsModal } from "@/features/orders/components/BookingDetailsModal";
import { cn } from "@/utils/utils";
import { useGetServiceOrdersQuery } from "@/features/orders/services/orderApi";
import { Skeleton } from "@/components/ui/skeleton";

const fmtUsd = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function fmtDate(ymd: string) {
  if (!ymd) return "—";
  const d = new Date(ymd);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "in_progress"
        ? "border-[#895129]/35 bg-[#895129]/10 text-[#895129]"
        : status === "pending"
          ? "border-zinc-200 bg-zinc-50 text-zinc-700"
          : "border-red-200 bg-red-50 text-red-700"; // cancelled
  return (
    <Badge variant="outline" className={cn("capitalize", cls)}>
      {status === "in_progress" ? "Ongoing" : status}
    </Badge>
  );
}

export function BookingsPage() {
  const { data: apiOrders = [], isLoading } = useGetServiceOrdersQuery();
  const [detailsId, setDetailsId] = useState<string | null>(null);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-muted-foreground text-sm">
          Track incoming and active bookings.
        </p>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Bookings</CardTitle>
          <CardDescription>
            View all your service orders and bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <Skeleton className="h-6 w-full max-w-sm mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : apiOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiOrders.map((b) => (
                    <TableRow key={b._id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        {b.orderId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {b.service?.name || "—"}
                      </TableCell>
                      <TableCell>{b.customer?.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtDate(b.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtUsd(b.price || 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={b.orderStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10"
                          onClick={() => setDetailsId(b._id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BookingDetailsModal
        open={detailsId != null}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
        bookingId={detailsId}
      />
    </div>
  );
}
