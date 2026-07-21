import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingDetailsModal } from "@/features/orders/components/BookingDetailsModal";
import {
  bookingFromOffer,
  type DashboardBooking,
  type DashboardBookingStatus,
} from "@/features/orders/model/dashboard-booking";
import { cn } from "@/utils/utils";

type BookingFromOfferState = {
  offerId: string;
  title: string;
  customer: string;
  amount: number;
};

const fmtUsd = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function StatusBadge({ status }: { status: DashboardBookingStatus }) {
  const cls =
    status === "Completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Ongoing"
        ? "border-[#895129]/35 bg-[#895129]/10 text-[#895129]"
        : status === "Pending"
          ? "border-zinc-200 bg-zinc-50 text-zinc-700"
          : status === "Rejected"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-red-200 bg-red-50 text-red-700";
  return (
    <Badge variant="outline" className={cn(cls)}>
      {status}
    </Badge>
  );
}

export function BookingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const processedOfferIds = useRef<Set<string>>(new Set());

  const [bookings, setBookings] = useState<DashboardBooking[]>([
    {
      id: 1,
      bookingRef: "BK-1001",
      service: "Full-Stack Web Development",
      category: "IT Services",
      description: "End-to-end app delivery with React, Node, and PostgreSQL.",
      customer: "John Doe",
      customerEmail: "john.doe@example.com",
      customerPhone: "+1 (555) 010-2031",
      customerCity: "Austin",
      customerCountry: "United States",
      date: "2025-05-01",
      scheduledAt: "2:00 PM",
      amount: 250,
      basePrice: 200,
      customOfferPrice: 250,
      status: "Ongoing",
      customerApproved: false,
      deliveryDays: 7,
      deadline: "2025-05-08",
      deliveryProgress: 45,
      lastMessagePreview: "Can you finish today?",
      createdAt: "2025-04-28",
    },
  ]);

  const [detailsId, setDetailsId] = useState<number | null>(null);
  const details = useMemo(
    () => bookings.find((b) => b.id === detailsId) ?? null,
    [bookings, detailsId],
  );

  useEffect(() => {
    const payload = (
      location.state as { fromOffer?: BookingFromOfferState } | null
    )?.fromOffer;
    if (!payload?.offerId || processedOfferIds.current.has(payload.offerId))
      return;
    processedOfferIds.current.add(payload.offerId);
    const today = new Date().toISOString().slice(0, 10);
    setBookings((prev) => {
      const nextId = prev.reduce((max, b) => Math.max(max, b.id), 0) + 1;
      return [
        ...prev,
        bookingFromOffer({
          id: nextId,
          title: payload.title,
          customer: payload.customer,
          amount: payload.amount,
          dateYmd: today,
        }),
      ];
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  function setStatus(id: number, next: DashboardBookingStatus) {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (next === "Completed")
          return { ...b, status: next, customerApproved: false };
        return { ...b, status: next };
      }),
    );
  }

  function approvalLabel(b: DashboardBooking) {
    if (b.status !== "Completed") return null;
    if (b.customerApproved) return "Completed ✅";
    return "Waiting for customer approval";
  }

  useEffect(() => {
    const pending = bookings.filter(
      (b) => b.status === "Completed" && !b.customerApproved,
    );
    if (!pending.length) return;

    const timers = pending.map((b) =>
      window.setTimeout(() => {
        setBookings((prev) =>
          prev.map((x) =>
            x.id === b.id ? { ...x, customerApproved: true } : x,
          ),
        );
      }, 3000),
    );

    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [bookings]);

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
            Update status and simulate customer approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Service Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => {
                  const approval = approvalLabel(b);
                  return (
                    <TableRow key={b.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{b.service}</TableCell>
                      <TableCell>{b.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.date}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {fmtUsd(b.amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={b.status}
                          onValueChange={(v) =>
                            setStatus(b.id, v as DashboardBookingStatus)
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {b.status === "Completed" ? (
                          b.customerApproved ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              {approval}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-50 text-amber-700"
                            >
                              {approval}
                            </Badge>
                          )
                        ) : (
                          <StatusBadge status={b.status} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10"
                          onClick={() => setDetailsId(b.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        booking={details}
        onStatusChange={setStatus}
      />
    </div>
  );
}
