import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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
import { cn } from "@/utils/utils";
import { SERVICE_BOOKINGS_DEMO, SERVICE_DEMO } from "@/features/services";

const fmtUsd = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function StatusBadge({ status }: { status: "Active" | "Draft" | "Disabled" }) {
  const cls =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Draft"
        ? "border-zinc-200 bg-zinc-50 text-zinc-700"
        : "border-red-200 bg-red-50 text-red-700";
  return (
    <Badge variant="outline" className={cn(cls)}>
      {status}
    </Badge>
  );
}

export function ServiceDetailsPage() {
  const { id } = useParams();
  const serviceId = Number(id);
  const service = useMemo(
    () => SERVICE_DEMO.find((s) => s.id === serviceId) ?? null,
    [serviceId],
  );

  const derivedStatus: "Active" | "Draft" | "Disabled" = service
    ? service.isActive
      ? service.status
      : "Disabled"
    : "Draft";
  const bookings = useMemo(
    () => SERVICE_BOOKINGS_DEMO.filter((b) => b.serviceId === serviceId),
    [serviceId],
  );

  if (!id || Number.isNaN(serviceId)) {
    return <Navigate to="/service/services" replace />;
  }
  if (!service) {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Service details
            </h1>
            <p className="text-muted-foreground text-sm">
              Service not found in demo data.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/service/services">Back to services</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {service.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Service performance and bookings overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/service/services">Back</Link>
          </Button>
          <Button asChild className="bg-[#895129] hover:bg-[#7b4723]">
            <Link to="/service/add-service">Edit</Link>
          </Button>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-xl border-border/60 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Service details</CardTitle>
            <CardDescription>Pricing, delivery and status</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground">Price</div>
              <div className="font-semibold tabular-nums">
                {fmtUsd(service.price)}{" "}
                <span className="text-muted-foreground font-medium">
                  / {service.type}
                </span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Delivery time</div>
              <div className="font-medium">{service.delivery}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="mt-1">
                <StatusBadge status={derivedStatus} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
            <CardDescription>Summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-muted-foreground text-sm">
                Total earnings
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {fmtUsd(service.earnings)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">
                Total bookings
              </div>
              <div className="text-2xl font-semibold tabular-nums">
                {service.totalBookings}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Recent bookings for this service</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length ? (
                bookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {b.customerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-border/60 bg-muted/20"
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {fmtUsd(b.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-10 text-center text-sm"
                  >
                    No bookings yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
