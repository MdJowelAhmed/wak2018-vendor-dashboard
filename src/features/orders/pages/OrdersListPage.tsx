import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  useGetProductOrdersQuery,
  useGetServiceOrdersQuery,
} from "@/features/orders";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useGetUserProfileQuery } from "@/services/profileApi";
import type { UserRole } from "@/features/auth/types/authTypes";
import {
  PRODUCT_ORDER_STATUS,
  PRODUCT_ORDER_DELIVERY_TYPE,
  type Order,
  type ProductOrderStatus,
  type ServiceOrderStatus,
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

type StatusFilter = "all" | `${PRODUCT_ORDER_STATUS}`;
type DeliveryTypeFilter = "all" | `${PRODUCT_ORDER_DELIVERY_TYPE}`;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export function OrdersListPage() {
  const authRole: UserRole | undefined = useSelector(
    (s: RootState) => s.auth.user?.role,
  );
  const { data: profileRes } = useGetUserProfileQuery();
  const profile = profileRes?.data;
  const role: UserRole | null = authRole ?? profile?.role ?? null;

  const [status, setStatus] = useState<StatusFilter>("all");
  const [deliveryType, setDeliveryType] = useState<DeliveryTypeFilter>("all");
  const [page, setPage] = useState(1);

  const pQ = useGetProductOrdersQuery(
    {
      status: status === "all" ? undefined : (status as ProductOrderStatus),
      deliveryType: deliveryType === "all" ? undefined : deliveryType,
      page,
      limit: 10,
    },
    { skip: role !== "vendor" }
  );
  const sQ = useGetServiceOrdersQuery(undefined, { skip: role !== "service" });

  const rows = useMemo(() => {
    const all: Order[] = [...(pQ.data?.data ?? []), ...(sQ.data ?? [])];
    const filtered = all.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (deliveryType !== "all") {
        const dt = o.deliveryType;
        if (dt !== deliveryType) return false;
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
                <SelectItem value={PRODUCT_ORDER_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.PROCESSING}>Processing</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.SHIPPED}>Shipped</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.OUT_FOR_DELIVERY}>Out For Delivery</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.REFUNDED}>Refunded</SelectItem>
                <SelectItem value={PRODUCT_ORDER_STATUS.READY_FOR_PICKUP}>Ready For Pickup</SelectItem>
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
                <SelectItem value={PRODUCT_ORDER_DELIVERY_TYPE.LOCAL}>Local</SelectItem>
                <SelectItem value={PRODUCT_ORDER_DELIVERY_TYPE.INTERNATIONAL}>International</SelectItem>
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
            <div className="space-y-4">
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
              
              {pQ.data?.pagination && pQ.data.pagination.totalPage > 1 && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {pQ.data.pagination.totalPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pQ.data.pagination.totalPage}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
