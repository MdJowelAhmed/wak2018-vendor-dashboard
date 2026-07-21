import { toast } from "sonner";
import {
  useGetDriverQueueQuery,
  useRejectDeliveryMutation,
  useUpdateDeliveryStatusMutation,
} from "@/features/delivery";
import { OrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Delivery, DeliveryDriverStatus } from "@/types/api";

const statusFlow: DeliveryDriverStatus[] = [
  "requested",
  "accepted",
  "picked_up",
  "in_transit",
  "delivered",
];

function nextOf(s: DeliveryDriverStatus): DeliveryDriverStatus | null {
  const i = statusFlow.indexOf(s);
  if (i < 0 || i >= statusFlow.length - 1) {
    return null;
  }
  return statusFlow[i + 1] ?? null;
}

export function DriverQueuePage() {
  const { data, isLoading, isError, refetch } = useGetDriverQueueQuery();
  const [update, { isLoading: busy }] = useUpdateDeliveryStatusMutation();
  const [reject, { isLoading: rejecting }] = useRejectDeliveryMutation();

  async function step(d: Delivery) {
    const n = nextOf(d.driverStatus);
    if (!n) {
      return;
    }
    try {
      await update({ id: d.id, driverStatus: n, deliveryStatus: n }).unwrap();
      toast.success("Status updated");
      void refetch();
    } catch {
      toast.error("Could not update delivery");
    }
  }

  async function accept(d: Delivery) {
    if (d.driverStatus !== "requested") {
      return;
    }
    try {
      await update({
        id: d.id,
        driverStatus: "accepted",
        deliveryStatus: "accepted",
      }).unwrap();
      toast.success("Accepted");
      void refetch();
    } catch {
      toast.error("Accept failed");
    }
  }

  async function onReject(d: Delivery) {
    if (d.driverStatus !== "requested") {
      return;
    }
    try {
      await reject(d.id).unwrap();
      toast.success("Rejected");
      void refetch();
    } catch {
      toast.error("Reject failed (ensure POST /delivery/:id/reject exists)");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Driver queue</h1>
        <p className="text-muted-foreground">
          Requested → Accepted → Picked up → In transit → Delivered. Real-time
          over socket on updates.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active deliveries for you</CardTitle>
          {isError && (
            <CardDescription className="text-destructive">
              Failed to load; ensure driver role and /driver/deliveries.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Driver / delivery</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="w-[1%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((d) => {
                  const canNext =
                    nextOf(d.driverStatus) !== null &&
                    d.driverStatus !== "delivered";
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">
                        {d.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <OrderStatusBadge status={d.driverStatus} />
                          <OrderStatusBadge status={d.deliveryStatus} />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm whitespace-normal text-sm">
                        <p className="line-clamp-1">
                          <span className="text-foreground/80">From: </span>
                          {d.pickupLocation}
                        </p>
                        <p className="line-clamp-1">
                          <span className="text-foreground/80">To: </span>
                          {d.dropLocation}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {d.driverStatus === "requested" && (
                          <div className="inline-flex flex-wrap justify-end gap-1">
                            <Button
                              size="sm"
                              type="button"
                              disabled={busy}
                              onClick={() => accept(d)}
                            >
                              Accept
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={rejecting}
                              onClick={() => onReject(d)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        {d.driverStatus !== "requested" && canNext && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy}
                            onClick={() => step(d)}
                            variant="secondary"
                          >
                            {nextOf(d.driverStatus) === "picked_up"
                              ? "Mark picked up"
                              : nextOf(d.driverStatus) === "in_transit"
                                ? "In transit"
                                : nextOf(d.driverStatus) === "delivered"
                                  ? "Mark delivered"
                                  : "Next"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!data?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-6 text-center"
                    >
                      No items in the driver queue from the API.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
