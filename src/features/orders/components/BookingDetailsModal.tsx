import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import {
  useGetServiceOrderByIdQuery,
  useDeliverServiceOrderMutation,
} from "@/features/orders/services/orderApi";
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

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "in_progress":
      return "border-[#895129]/35 bg-[#895129]/10 text-[#895129]";
    case "pending":
      return "border-zinc-200 bg-zinc-50 text-zinc-800";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-border bg-muted text-foreground";
  }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[#895129] text-xs font-semibold uppercase tracking-wide">
      {children}
    </h3>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-sm font-medium leading-snug break-words">
        {value || "—"}
      </div>
    </div>
  );
}

type BookingDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
};

export function BookingDetailsModal({
  open,
  onOpenChange,
  bookingId,
}: BookingDetailsModalProps) {
  const navigate = useNavigate();

  const { data: b, isLoading } = useGetServiceOrderByIdQuery(bookingId ?? "", {
    skip: !bookingId,
  });

  const [deliverOrder, { isLoading: isDelivering }] =
    useDeliverServiceOrderMutation();

  function close() {
    onOpenChange(false);
  }

  function openChat() {
    close();
    void navigate("/service/messages");
  }

  async function handleDeliver() {
    if (!bookingId) return;
    try {
      await deliverOrder(bookingId).unwrap();
      toast.success("Order marked as delivered!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to deliver order");
    }
  }

  if (!bookingId) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[min(96vw,56rem)] rounded-xl border-border/60 bg-white">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full mt-4" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!b) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[min(96vw,56rem)] rounded-xl border-border/60 bg-white">
          <p className="text-muted-foreground text-sm">Booking not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const timelineSteps = [
    { key: "created", label: "Created", done: true, date: b.createdAt },
    {
      key: "ongoing",
      label: "Ongoing",
      done: b.orderStatus === "in_progress" || b.orderStatus === "completed",
      date: b.orderStatus !== "pending" ? b.updatedAt : undefined,
    },
    {
      key: "completed",
      label: "Completed",
      done: b.orderStatus === "completed",
      date:
        b.completedAt ||
        (b.orderStatus === "completed" ? b.updatedAt : undefined),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="flex max-h-[min(90vh,44rem)] max-w-[min(96vw,56rem)] flex-col gap-0 overflow-hidden rounded-xl border-border/60 bg-white p-0 shadow-lg"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">
            Booking details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {b.orderId} · Manage status and view delivery context.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* Timeline */}
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="text-muted-foreground mb-3 text-xs font-medium">
                Progress
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {timelineSteps.map((step, i) => (
                  <div
                    key={step.key}
                    className="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial"
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        step.done
                          ? "bg-[#895129] text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          step.done
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </div>
                      {step.date ? (
                        <div className="text-muted-foreground text-xs">
                          {fmtDate(step.date)}
                        </div>
                      ) : null}
                    </div>
                    {i < timelineSteps.length - 1 ? (
                      <div className="bg-border mx-1 hidden h-px w-6 shrink-0 sm:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Service */}
              <div className="space-y-3">
                <SectionTitle>Service info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Service name"
                    value={b.service?.name}
                    className="sm:col-span-2"
                  />
                  <InfoItem
                    label="Description"
                    value={b.service?.description}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-3">
                <SectionTitle>Customer info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Name"
                    value={b.customer?.name}
                    className="sm:col-span-2"
                  />
                  <InfoItem label="Email" value={b.customer?.email} />
                </div>
              </div>

              {/* Booking */}
              <div className="space-y-3">
                <SectionTitle>Booking info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem label="Booking ID" value={b.orderId} />
                  <InfoItem label="Date" value={fmtDate(b.createdAt)} />
                  <InfoItem label="Status" value="" className="hidden" />
                  <div className="space-y-2 sm:col-span-2">
                    <div className="text-muted-foreground text-xs">Status</div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          statusBadgeClass(b.orderStatus),
                        )}
                      >
                        {b.orderStatus === "in_progress"
                          ? "Ongoing"
                          : b.orderStatus}
                      </Badge>
                    </div>
                  </div>
                  <InfoItem
                    label="Payment Status"
                    value={b.paymentStatus || "Unpaid"}
                    className="sm:col-span-2 capitalize"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <SectionTitle>Pricing</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:grid-cols-2">
                  <InfoItem
                    label="Base price"
                    value={fmtUsd(b.service?.price || 0)}
                  />
                  <div className="border-border/60 flex items-center justify-between border-t pt-3 sm:col-span-2">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-[#895129] text-lg font-semibold tabular-nums">
                      {fmtUsd(b.price || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-3 lg:col-span-2">
                <SectionTitle>Delivery</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoItem
                    label="Expected Delivery"
                    value={fmtDate(b.deliveryDate)}
                  />
                  {b.completedAt && (
                    <InfoItem
                      label="Completed At"
                      value={fmtDate(b.completedAt)}
                    />
                  )}
                </div>
                {b.deliveryDescription && (
                  <div className="mt-4 rounded-lg bg-muted/30 p-4 border border-border/50 text-sm">
                    <span className="font-semibold text-xs text-muted-foreground block mb-2">
                      Delivery Note
                    </span>
                    {b.deliveryDescription}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <SectionTitle>Actions</SectionTitle>
              <div className="flex flex-row flex-wrap items-center gap-2">
                {b.orderStatus === "in_progress" ||
                b.orderStatus === "pending" ? (
                  <Button
                    type="button"
                    className="bg-[#895129] hover:bg-[#7b4723]"
                    onClick={handleDeliver}
                    disabled={isDelivering}
                  >
                    {isDelivering ? "Delivering..." : "Deliver Order"}
                  </Button>
                ) : null}
                {b.orderStatus === "completed" ? (
                  <p className="text-muted-foreground text-sm">
                    No further actions — booking is completed.
                  </p>
                ) : null}
                {b.orderStatus === "cancelled" ? (
                  <p className="text-muted-foreground text-sm">
                    No actions available for this booking.
                  </p>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10 ml-auto"
                  onClick={openChat}
                >
                  <MessageCircle className="mr-2 size-4" />
                  Open chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
