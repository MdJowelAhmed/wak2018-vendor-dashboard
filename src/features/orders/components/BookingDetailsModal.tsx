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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/utils";
import type {
  DashboardBooking,
  DashboardBookingStatus,
} from "@/features/orders/model/dashboard-booking";

const fmtUsd = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function fmtDate(ymd: string) {
  const d = new Date(ymd + "T12:00:00");
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusBadgeClass(status: DashboardBookingStatus) {
  switch (status) {
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Ongoing":
      return "border-[#895129]/35 bg-[#895129]/10 text-[#895129]";
    case "Pending":
      return "border-zinc-200 bg-zinc-50 text-zinc-800";
    case "Rejected":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Cancelled":
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
  booking: DashboardBooking | null;
  onStatusChange: (id: number, status: DashboardBookingStatus) => void;
};

export function BookingDetailsModal({
  open,
  onOpenChange,
  booking,
  onStatusChange,
}: BookingDetailsModalProps) {
  const navigate = useNavigate();

  function close() {
    onOpenChange(false);
  }

  function openChat() {
    close();
    void navigate("/service/messages");
  }

  if (!booking) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[min(96vw,56rem)] rounded-xl border-border/60 bg-white">
          <p className="text-muted-foreground text-sm">Booking not found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const b = booking;
  const approvalLabel =
    b.status !== "Completed"
      ? "—"
      : b.customerApproved
        ? "Approved"
        : "Awaiting customer approval";

  const timelineSteps = [
    { key: "created", label: "Created", done: true, date: b.createdAt },
    {
      key: "ongoing",
      label: "Ongoing",
      done: b.status === "Ongoing" || b.status === "Completed",
      date: b.status !== "Pending" ? b.date : undefined,
    },
    {
      key: "completed",
      label: "Completed",
      done: b.status === "Completed",
      date: b.status === "Completed" ? b.date : undefined,
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
            {b.bookingRef} · Manage status and view delivery & communication
            context.
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
                    value={b.service}
                    className="sm:col-span-2"
                  />
                  <InfoItem label="Category" value={b.category} />
                  <InfoItem
                    label="Description"
                    value={b.description}
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
                    value={b.customer}
                    className="sm:col-span-2"
                  />
                  <InfoItem label="Email" value={b.customerEmail} />
                  <InfoItem label="Phone" value={b.customerPhone} />
                  <InfoItem
                    label="Location"
                    value={[b.customerCity, b.customerCountry]
                      .filter(Boolean)
                      .join(", ")}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Booking */}
              <div className="space-y-3">
                <SectionTitle>Booking info</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem label="Booking ID" value={b.bookingRef} />
                  <InfoItem label="Date" value={fmtDate(b.date)} />
                  <InfoItem label="Time" value={b.scheduledAt} />
                  <div className="space-y-2 sm:col-span-2">
                    <div className="text-muted-foreground text-xs">Status</div>
                    <Select
                      value={b.status}
                      onValueChange={(v) =>
                        onStatusChange(b.id, v as DashboardBookingStatus)
                      }
                    >
                      <SelectTrigger className="h-10 w-full max-w-xs border-border/60">
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
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", statusBadgeClass(b.status))}
                      >
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                  <InfoItem
                    label="Approval status"
                    value={approvalLabel}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <SectionTitle>Pricing</SectionTitle>
                <Separator />
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:grid-cols-2">
                  <InfoItem label="Base price" value={fmtUsd(b.basePrice)} />
                  <InfoItem
                    label="Custom offer"
                    value={
                      b.customOfferPrice != null
                        ? fmtUsd(b.customOfferPrice)
                        : "—"
                    }
                  />
                  <div className="border-border/60 flex items-center justify-between border-t pt-3 sm:col-span-2">
                    <span className="text-muted-foreground text-sm">Total</span>
                    <span className="text-[#895129] text-lg font-semibold tabular-nums">
                      {fmtUsd(b.amount)}
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
                    label="Delivery window"
                    value={`${b.deliveryDays} days`}
                  />
                  <InfoItem label="Deadline" value={fmtDate(b.deadline)} />
                  <div className="sm:col-span-2">
                    <div className="text-muted-foreground text-xs">
                      Progress
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-[#895129] transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(0, b.deliveryProgress))}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {b.deliveryProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div className="space-y-3 lg:col-span-2">
                <SectionTitle>Communication</SectionTitle>
                <Separator />
                <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-muted-foreground text-xs">
                      Last message
                    </div>
                    <p className="text-foreground mt-1 text-sm leading-relaxed line-clamp-2">
                      {b.lastMessagePreview}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10"
                    onClick={openChat}
                  >
                    <MessageCircle className="mr-2 size-4" />
                    Open chat
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <SectionTitle>Actions</SectionTitle>
              <div className="flex flex-row flex-wrap items-center gap-2">
                {b.status === "Pending" ? (
                  <Button
                    type="button"
                    className="bg-[#895129] hover:bg-[#7b4723]"
                    onClick={() => onStatusChange(b.id, "Ongoing")}
                  >
                    Accept booking
                  </Button>
                ) : null}
                {b.status === "Ongoing" ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#895129]/40 text-[#895129] hover:bg-[#895129]/10"
                    onClick={() => onStatusChange(b.id, "Completed")}
                  >
                    Mark as completed
                  </Button>
                ) : null}
                {b.status === "Completed" ? (
                  <p className="text-muted-foreground text-sm">
                    No further actions — booking is completed.
                  </p>
                ) : null}
                {b.status === "Rejected" || b.status === "Cancelled" ? (
                  <p className="text-muted-foreground text-sm">
                    No actions available for this booking.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
