import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetDeliveryRequestsQuery,
  useRejectDeliveryMutation,
  useUpdateDeliveryStatusMutation,
} from "@/features/delivery";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Delivery } from "@/types/api";
import { useDeliveryRealtime } from "@/features/delivery";
import { DeliveryTabs } from "@/features/delivery/components/DeliveryTabs";
import { DeliveryDetailsModal } from "@/features/delivery/components/DeliveryDetailsModal";
import { nextStatus } from "@/features/delivery/utils/deliveryStatusUi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/utils/format-currency";

export function DeliveryRequestsPage() {
  useCurrency();
  useDeliveryRealtime();

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"local" | "international">("local");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchTerm(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useGetDeliveryRequestsQuery({
    searchTerm: searchTerm || undefined,
    page,
    limit,
    deliveryType: activeTab,
  });

  const [update, { isLoading: updating }] = useUpdateDeliveryStatusMutation();
  const [reject, { isLoading: rejecting }] = useRejectDeliveryMutation();
  const busy = updating || rejecting;

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Delivery | null>(null);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPage ?? 1);
  const total = pagination?.total ?? rows.length;
  const safePage = Math.min(page, totalPages);

  const local = rows.filter((d) => (d.type ?? "local") !== "international");
  const international = rows.filter((d) => d.type === "international");

  async function accept(d: Delivery) {
    if (d.driverStatus !== "requested") return;
    try {
      await update({
        id: d.id,
        driverStatus: "accepted",
        deliveryStatus: "accepted",
      }).unwrap();
      toast.success("Accepted");
    } catch {
      toast.error("Accept failed");
    }
  }

  async function decline(d: Delivery) {
    if (d.driverStatus !== "requested") return;
    try {
      await reject(d.id).unwrap();
      toast.success("Rejected");
    } catch {
      toast.error("Reject failed");
    }
  }

  async function step(d: Delivery) {
    const n = nextStatus(d.driverStatus);
    if (!n) return;
    try {
      await update({
        id: d.id,
        driverStatus: n,
        deliveryStatus: n,
      }).unwrap();
      toast.success("Status updated");
    } catch {
      toast.error("Could not update delivery");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Delivery Management</h1>
        <p className="text-muted-foreground">
          Track local riders and international shipments from your orders.
        </p>
      </div>
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>
            Order status, tracking, rider assignment, and shipping documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <p className="text-destructive mb-3 text-sm">
              Could not load deliveries.
            </p>
          ) : null}

          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or customer name"
              className="rounded-xl border-gray-200 bg-white shadow-sm"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
            </div>
          ) : (
            <DeliveryTabs
              local={local}
              international={international}
              isDriver={false}
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v);
                setPage(1);
              }}
              busy={busy}
              onViewDetails={(d) => {
                setSelected(d);
                setDetailsOpen(true);
              }}
              onAccept={accept}
              onReject={decline}
              onStep={step}
            />
          )}

          {!isLoading ? (
            <div className="mt-5 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-semibold">
                  {total ? (safePage - 1) * limit + 1 : 0}–
                  {Math.min(safePage * limit, total)}
                </span>{" "}
                of <span className="font-semibold">{total}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <div className="text-sm text-gray-700">
                  Page <span className="font-semibold">{safePage}</span> /{" "}
                  <span className="font-semibold">{totalPages}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <DeliveryDetailsModal
        open={detailsOpen}
        onOpenChange={(v) => {
          setDetailsOpen(v);
          if (!v) setSelected(null);
        }}
        delivery={
          selected && rows.length
            ? (rows.find((d) => d.id === selected.id) ?? selected)
            : selected
        }
      />
    </div>
  );
}
