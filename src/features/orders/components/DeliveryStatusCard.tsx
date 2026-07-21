import { motion } from "framer-motion";
import type { Delivery } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  orderDetailsDeliveryStatusBodyVariants,
  orderDetailsStatusBadgeVariants,
} from "@/features/orders/motion/order-details-variants";

export function DeliveryStatusCard({ delivery }: { delivery: Delivery }) {
  const isIntl = delivery.type === "international";
  const statusKey = `${delivery.deliveryStatus}-${delivery.driverStatus ?? ""}-${delivery.trackingStatus ?? ""}`;

  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Delivery status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <motion.div
            key={`type-${delivery.type}`}
            variants={orderDetailsStatusBadgeVariants}
            initial="initial"
            animate="animate"
          >
            <Badge variant="secondary" className="capitalize">
              {delivery.type ?? "local"}
            </Badge>
          </motion.div>
          <span className="text-muted-foreground">·</span>
          <motion.span
            key={delivery.deliveryStatus}
            className="font-medium capitalize"
            variants={orderDetailsStatusBadgeVariants}
            initial="initial"
            animate="animate"
          >
            {delivery.deliveryStatus}
          </motion.span>
        </div>

        <motion.div
          key={statusKey}
          className="space-y-3"
          variants={orderDetailsDeliveryStatusBodyVariants}
          initial="hidden"
          animate="visible"
        >
          {!isIntl ? (
            <>
              <div>
                <div className="text-muted-foreground">Driver</div>
                <div className="font-medium">{delivery.driverName ?? "—"}</div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground">ETA</div>
                  <div className="font-medium">
                    {delivery.etaMinutes != null
                      ? `${delivery.etaMinutes} min`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">
                    {delivery.driverStatus}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-muted-foreground">Courier</div>
                <div className="font-medium">{delivery.courier ?? "—"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tracking ID</div>
                <div className="font-medium">{delivery.trackingId ?? "—"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-muted-foreground">Tracking status</div>
                <div className="font-medium">
                  {delivery.trackingStatus ?? "—"}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
