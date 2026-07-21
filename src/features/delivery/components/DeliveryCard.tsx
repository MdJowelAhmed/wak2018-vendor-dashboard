import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Delivery } from "@/types/api";
import { badgeClassFor, labelFor, nextStatus } from "../utils/deliveryStatusUi";
import { fadeUp, hoverLift } from "@/components/ui/motion";

export function DeliveryCard({
  delivery,
  isDriver,
  onViewDetails,
  onAccept,
  onReject,
  onStep,
  busy,
}: {
  delivery: Delivery;
  isDriver: boolean;
  onViewDetails: (d: Delivery) => void;
  onAccept: (d: Delivery) => void;
  onReject: (d: Delivery) => void;
  onStep: (d: Delivery) => void;
  busy?: boolean;
}) {
  const canAccept = delivery.driverStatus === "requested";
  const next = nextStatus(delivery.driverStatus);
  const canStep = Boolean(next) && delivery.driverStatus !== "delivered";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={hoverLift.whileHover}
      transition={hoverLift.transition}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
        </div>

        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold text-gray-900">
              Order{" "}
              <span className="font-mono text-gray-700">
                #{delivery.orderId}
              </span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={badgeClassFor("local", delivery.driverStatus)}>
                {labelFor("local", delivery.driverStatus)}
              </Badge>
              <Badge
                variant="outline"
                className="border-gray-200 bg-white/70 text-gray-700"
              >
                Local Delivery
              </Badge>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-gray-200 bg-white/70 hover:bg-white"
            onClick={() => onViewDetails(delivery)}
          >
            <ExternalLink className="mr-2 size-4" />
            View details
          </Button>
        </CardHeader>

        <CardContent className="grid gap-4 text-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Driver</div>
              <div className="mt-0.5 font-medium text-gray-900">
                {delivery.driverName ?? "—"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">ETA</div>
              <div className="mt-0.5 font-medium text-gray-900">
                {delivery.etaMinutes != null
                  ? `${delivery.etaMinutes} min`
                  : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Pickup</div>
              <div className="mt-0.5 font-medium whitespace-pre-wrap break-words text-gray-900">
                {delivery.pickupLocation}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/60 p-3">
              <div className="text-xs text-gray-500">Drop</div>
              <div className="mt-0.5 font-medium whitespace-pre-wrap break-words text-gray-900">
                {delivery.dropLocation}
              </div>
            </div>
          </div>

          {isDriver ? (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              {canAccept ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={busy}
                    onClick={() => onAccept(delivery)}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-gray-200 bg-white/70 hover:bg-white"
                    disabled={busy}
                    onClick={() => onReject(delivery)}
                  >
                    Reject
                  </Button>
                </>
              ) : canStep ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  disabled={busy}
                  onClick={() => onStep(delivery)}
                >
                  {next === "picked_up"
                    ? "Picked Up"
                    : next === "in_transit"
                      ? "Mark In Transit"
                      : next === "delivered"
                        ? "Mark Delivered"
                        : "Next"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
