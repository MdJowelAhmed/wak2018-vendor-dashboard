import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageCircle, Phone, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Delivery } from "@/types/api";
import { badgeClassFor, labelFor } from "../utils/deliveryStatusUi";
import { DeliveryTimeline } from "./DeliveryTimeline";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { useUpdateDeliveryStatusMutation } from "@/features/delivery";

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function fmtEta(minutes?: number) {
  if (minutes == null || !Number.isFinite(minutes)) return "—";
  if (minutes < 180) return `${Math.max(1, Math.round(minutes))} min`;
  const h = Math.round(minutes / 60);
  return `~${h} h`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-foreground text-sm font-semibold tracking-tight">
      {children}
    </h3>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-sm font-medium break-words">{value}</div>
    </div>
  );
}

export function DeliveryDetailsModal({
  open,
  onOpenChange,
  delivery,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  delivery: Delivery | null;
}) {
  const navigate = useNavigate();
  const [updateStatus, { isLoading: markingDone }] =
    useUpdateDeliveryStatusMutation();

  if (!delivery) return null;

  const d = delivery;
  const isIntl = d.type === "international";
  const canMarkDelivered = d.deliveryStatus !== "delivered";
  const driverPhone = d.driverPhone?.trim();

  async function markDelivered() {
    try {
      await updateStatus({
        id: d.id,
        driverStatus: "delivered",
        deliveryStatus: "delivered",
      }).unwrap();
      toast.success("Marked as delivered");
    } catch {
      toast.error("Could not update status");
    }
  }

  function contactDriver() {
    if (!driverPhone) return;
    window.location.href = `tel:${driverPhone.replace(/\s/g, "")}`;
  }

  function openCustomerChat() {
    void navigate("/vendor/messages");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-border shrink-0 space-y-1 border-b px-6 pt-6 pb-4">
          <DialogTitle>Delivery details</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Order{" "}
            <span className="text-foreground font-medium">#{d.orderId}</span>
            {d.orderLineItemName ? (
              <>
                {" "}
                ·{" "}
                <span className="text-foreground font-medium">
                  {d.orderLineItemName}
                </span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[min(72vh,calc(90vh-11rem))]">
          <div className="space-y-0 px-6 py-4">
            <div className="space-y-3">
              <SectionTitle>Order info</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Order ID" value={d.orderId} />
                <Field
                  label="Product / service"
                  value={d.orderLineItemName ?? "—"}
                />
                <Field
                  label="Customer name"
                  value={d.orderCustomerName ?? "—"}
                />
                <Field
                  label="Phone"
                  value={
                    d.orderCustomerPhone ? (
                      <a
                        className="text-[#895129] hover:underline"
                        href={`tel:${String(d.orderCustomerPhone).replace(/\s/g, "")}`}
                      >
                        {d.orderCustomerPhone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <Field
                  label="Email"
                  value={
                    d.orderCustomerEmail ? (
                      <a
                        className="text-[#895129] hover:underline"
                        href={`mailto:${d.orderCustomerEmail}`}
                      >
                        {d.orderCustomerEmail}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <SectionTitle>Delivery overview</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {d.type === "international" ? "International" : "Local"}
                </Badge>
                <Badge className={badgeClassFor(d.type, d.deliveryStatus)}>
                  {labelFor(d.type, d.deliveryStatus)}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Pickup address" value={d.pickupLocation} />
                <Field label="Drop address" value={d.dropLocation} />
                <Field
                  label="Distance"
                  value={d.distanceKm != null ? `${d.distanceKm} km` : "—"}
                />
                <Field label="ETA" value={fmtEta(d.etaMinutes)} />
              </div>
              {!isIntl ? (
                <Field label="Assigned driver" value={d.driverName ?? "—"} />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Courier" value={d.courier ?? "—"} />
                  <Field
                    label="Tracking ID"
                    value={
                      <span className="font-mono text-xs">
                        {d.trackingId ?? "—"}
                      </span>
                    }
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Tracking status"
                      value={d.trackingStatus ?? "—"}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <SectionTitle>Driver info</SectionTitle>
              {isIntl ? (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Last-mile driver details are assigned by{" "}
                  {d.courier ?? "the courier"}. Use tracking and courier tools
                  for handoff updates.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Driver name" value={d.driverName ?? "—"} />
                  <Field
                    label="Phone"
                    value={
                      driverPhone ? (
                        <a
                          className="text-[#895129] hover:underline"
                          href={`tel:${driverPhone.replace(/\s/g, "")}`}
                        >
                          {driverPhone}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Field
                    label="Vehicle type"
                    value={d.vehicleType ? d.vehicleType : "—"}
                  />
                  <Field
                    label="Vehicle number"
                    value={d.vehicleNumber ?? "—"}
                  />
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <SectionTitle>Timeline</SectionTitle>
              <p className="text-muted-foreground text-xs">
                Status updates automatically as the delivery progresses.
                Timestamps appear when each step is recorded.
              </p>
              <DeliveryTimeline delivery={d} />
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <SectionTitle>Payment</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Delivery fee"
                  value={d.deliveryFee != null ? fmtMoney(d.deliveryFee) : "—"}
                />
                <div className="min-w-0 space-y-1">
                  <div className="text-muted-foreground text-xs font-medium">
                    Status
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        d.deliveryPaid
                          ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-800"
                          : "border-amber-600/30 bg-amber-600/10 text-amber-900"
                      }
                    >
                      {d.deliveryPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Payment method"
                    value={d.paymentMethod ?? "—"}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <SectionTitle>Live tracking</SectionTitle>
              <LiveTrackingMap
                pickupText={d.pickupLocation}
                dropText={d.dropLocation}
                driverText={!isIntl ? (d.driverName ?? "") : ""}
                driverLat={!isIntl ? d.currentLat : undefined}
                driverLng={!isIntl ? d.currentLng : undefined}
                currentAddress={d.currentAddress}
                lastUpdatedAt={d.lastLocationUpdatedAt}
              />
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <SectionTitle>Notes</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Customer note"
                  value={d.customerNote?.trim() ? d.customerNote : "—"}
                />
                <Field
                  label="Delivery instructions"
                  value={
                    d.deliveryInstructions?.trim()
                      ? d.deliveryInstructions
                      : "—"
                  }
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-border bg-muted/20 flex flex-wrap gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!driverPhone || isIntl}
            onClick={contactDriver}
          >
            <Phone className="size-3.5" />
            Contact driver
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={openCustomerChat}
          >
            <MessageCircle className="size-3.5" />
            Chat with customer
          </Button>
          <Button
            type="button"
            size="sm"
            className="ml-auto gap-1.5 bg-[#895129] text-white hover:bg-[#7b4723]"
            disabled={!canMarkDelivered || markingDone}
            onClick={() => void markDelivered()}
          >
            <Truck className="size-3.5" />
            {markingDone ? "Updating…" : "Mark as delivered"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
