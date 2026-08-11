import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  useGetProductOrdersQuery,
  useGetServiceOrdersQuery,
} from "@/features/orders";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useGetProfileQuery } from "@/services/userApi";
import type { UserRole } from "@/features/auth/types/authTypes";
import type {
  Order,
  ProductOrderStatus,
  ServiceOrderStatus,
} from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/status-badge";

type StatusFilter = "all" | ProductOrderStatus | ServiceOrderStatus;
type DeliveryTypeFilter = "all" | "local" | "international" | "none";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function OrdersListPage() {
  const authRole: UserRole | undefined = useSelector(
    (s: RootState) => s.auth.user?.role,
  );
  const { data: profile } = useGetProfileQuery();
  const role: UserRole | null = authRole ?? profile?.role ?? null;

  const pQ = useGetProductOrdersQuery(undefined, { skip: role !== "vendor" });
  const sQ = useGetServiceOrdersQuery(undefined, { skip: role !== "service" });

  const [status, setStatus] = useState<StatusFilter>("all");
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeFilter>("all");

  const rows = useMemo(() => {
    const all: Order[] = [...(pQ.data ?? []), ...(sQ.data ?? [])];
    const filtered = all.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (deliveryType !== "all") {
        const dt = o.deliveryType ?? "none";
        if (deliveryType === "none" && dt !== null && dt !== "none")
          return false;
        if (deliveryType !== "none" && dt !== deliveryType) return false;
      }
      return true;
    });
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [pQ.data, sQ.data, status, deliveryType]);

  const isLoading = pQ.isLoading || sQ.isLoading;
  const isError = pQ.isError || sQ.isError;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Manage product and service orders with delivery tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs">Status</span>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as StatusFilter)}
            >
              <SelectTrigger className="w-[12rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivery_requested">
                  Delivery requested
                </SelectItem>
                <SelectItem value="shipment_created">
                  Shipment created
                </SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="accepted">Accepted (service)</SelectItem>
                <SelectItem value="in_progress">
                  In progress (service)
                </SelectItem>
                <SelectItem value="completed">Completed (service)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <span className="text-muted-foreground text-xs">Delivery Type</span>
            <Select
              value={deliveryType}
              onValueChange={(v) => setDeliveryType(v as DeliveryTypeFilter)}
            >
              <SelectTrigger className="w-[12rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none">Not arranged</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Order listing</CardTitle>
          {isError ? (
            <p className="text-destructive text-sm">Failed to load orders.</p>
          ) : null}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[1%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">
                      {'orderId' in o && o.orderId ? o.orderId : `#${o.id}`}
                    </TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell className="capitalize">{o.type}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status as any} />
                    </TableCell>
                    <TableCell className="capitalize">
                      {o.deliveryType ?? "—"}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: "USD",
                      }).format(o.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/vendor/orders/${o.id}`}>
                          <Eye className="mr-2 size-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-muted-foreground py-6 text-center"
                    >
                      No orders match your filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
