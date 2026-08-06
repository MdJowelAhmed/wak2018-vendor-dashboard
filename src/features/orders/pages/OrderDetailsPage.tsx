import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DeliveryModal } from "@/features/orders/components/DeliveryModal";
import { DeliveryStatusCard } from "@/features/orders/components/DeliveryStatusCard";
import { StatusDropdown } from "@/features/orders/components/StatusDropdown";
import { MilestoneList } from "@/features/orders/components/MilestoneList";
import {
  useGetOrderByIdQuery,
  useUpdateProductOrderStatusMutation,
  useUpdateServiceOrderStatusMutation,
} from "@/features/orders";
import {
  useCreateInternationalShipmentMutation,
  useGetDeliveryStatusQuery,
  useRequestLocalDeliveryMutation,
} from "@/features/delivery";
import type {
  Order,
  ProductOrderStatus,
  ServiceOrderStatus,
} from "@/types/api";
import { useDeliveryRealtime } from "@/features/delivery";
import { useGetProfileQuery } from '@/services/userApi';
import {
  orderDetailsButtonMotionProps,
  orderDetailsCardVariants,
  orderDetailsCardsStaggerParentVariants,
  orderDetailsEase,
  orderDetailsHeaderVariants,
  orderDetailsItemRowVariants,
  orderDetailsItemsStaggerParentVariants,
  orderDetailsPageLoadTransition,
  orderDetailsPaymentVariants,
  orderDetailsTabSpring,
} from "@/features/orders/motion/order-details-variants";
import { cn } from "@/utils/utils";

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

type DeliveryMethod = "local" | "international";
type CourierKey = "" | "dhl" | "fedex" | "ups";

export function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const orderQ = useGetOrderByIdQuery(id ?? "", {
    skip: !id,
    pollingInterval: 4000,
  });
  const order = orderQ.data as Order | undefined;

  const deliveryQ = useGetDeliveryStatusQuery(
    { orderId: id ?? "" },
    { skip: !id, pollingInterval: 4000 },
  );

  const { data: profile } = useGetProfileQuery();

  const [updateP] = useUpdateProductOrderStatusMutation();
  const [updateS] = useUpdateServiceOrderStatusMutation();

  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("local");
  const [selectedCourier, setSelectedCourier] = useState<CourierKey>("");
  const [localRequested, setLocalRequested] = useState(false);
  const [intlRequested, setIntlRequested] = useState(false);

  const [requestLocal, { isLoading: localRequestLoading }] =
    useRequestLocalDeliveryMutation();
  const [createIntl, { isLoading: intlRequestLoading }] =
    useCreateInternationalShipmentMutation();

  useDeliveryRealtime(id);

  const canArrangeDelivery = useMemo(() => {
    if (!order) return false;
    // spec: only when Ready
    return (
      order.type === "product" && order.status === "ready" && !deliveryQ.data
    );
  }, [order, deliveryQ.data]);

  if (orderQ.isLoading || !id) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }
  if (orderQ.isError || !order) {
    return <p className="text-destructive text-sm">Failed to load order.</p>;
  }

  const customer = order.customer ?? { name: order.customerName };
  const displayItems = order.items?.map((it: any) => ({
    name: it.name || (order.type === 'product' ? 'Product Item' : (order as any).serviceName),
    quantity: it.quantity || 1,
    price: it.price ?? it.unitPrice ?? 0,
    total: it.unitTotal ?? (it.price ?? it.unitPrice ?? 0) * (it.quantity || 1),
  })) ?? [
    {
      name: order.type === "product" ? order.productName : (order as any).serviceName,
      quantity: (order as any).quantity ?? 1,
      price: order.total,
      total: order.total,
    },
  ];

  const subtotal = order.type === 'product' && order.subTotal !== undefined 
    ? order.subTotal 
    : displayItems.reduce((a, it) => a + it.total, 0);

  const deliveryFee = order.type === 'product' && order.shippingFee !== undefined
    ? order.shippingFee
    : order.deliveryType
    ? order.deliveryType === "international"
      ? 15
      : 5
    : 0;

  const discount = order.type === 'product' ? (order.discount || 0) : 0;

  const total = order.type === 'product' && order.grandTotal !== undefined
    ? order.grandTotal
    : subtotal + deliveryFee - discount;

  const vendorId =
    profile?.id ?? localStorage.getItem("vendor_id") ?? "demo-vendor";
  const vendorPickup =
    localStorage.getItem("vendor_pickup_address") ??
    "Demo vendor pickup address";
  const dropLocation = order.customer?.address ?? "";

  const isAlreadyRequested = Boolean(deliveryQ.data);
  const busy = localRequestLoading || intlRequestLoading;

  async function createLocalDelivery(orderId: string) {
    await requestLocal({
      order_id: orderId,
      type: "local",
      pickup_location: vendorPickup,
      drop_location: dropLocation,
      vendor_id: vendorId,
    }).unwrap();
  }

  async function createInternationalDelivery(
    orderId: string,
    courier: Exclude<CourierKey, "">,
  ) {
    await createIntl({
      order_id: orderId,
      type: "international",
      courier,
      // Required by API contract; keep minimal for now.
      weight: 1,
      dimensions: "N/A",
      pickup_location: vendorPickup,
      drop_location: dropLocation,
      vendor_id: vendorId,
    }).unwrap();
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={orderDetailsPageLoadTransition}
    >
      <motion.div
        className="flex flex-wrap items-center justify-between gap-3"
        variants={orderDetailsHeaderVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <p className="text-muted-foreground text-sm">
            Created {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <motion.div
            className="inline-flex"
            {...orderDetailsButtonMotionProps}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/vendor/orders")}
            >
              Back to orders
            </Button>
          </motion.div>
          <StatusDropdown
            kind={order.type}
            value={order.status}
            onChange={async (next) => {
              try {
                if (order.type === "product") {
                  await updateP({
                    id: order.id,
                    status: next as ProductOrderStatus,
                  }).unwrap();
                } else {
                  await updateS({
                    id: order.id,
                    status: next as ServiceOrderStatus,
                  }).unwrap();
                }
                toast.success("Status updated");
                void orderQ.refetch();
              } catch {
                toast.error("Update failed");
              }
            }}
          />
        </div>
      </motion.div>

      <motion.div
        className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2"
        variants={orderDetailsCardsStaggerParentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={orderDetailsCardVariants} className="min-h-0">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Customer details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.type === 'product' && order.shippingAddress ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{order.shippingAddress.fullName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{order.shippingAddress.phone ?? "—"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-muted-foreground">Address</div>
                    <div className="font-medium">
                      {[
                        order.shippingAddress.address,
                        order.shippingAddress.city,
                        order.shippingAddress.state,
                        order.shippingAddress.postalCode,
                        order.shippingAddress.country
                      ].filter(Boolean).join(", ") || "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{customer.name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div className="font-medium">{customer.phone ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{customer.email ?? "—"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-muted-foreground">Address</div>
                    <div className="font-medium">{customer.address ?? "—"}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={orderDetailsCardVariants} className="min-h-0">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Delivery Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative flex w-full gap-2 rounded-xl border border-gray-200 bg-gray-50/50 p-1 shadow-sm">
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg bg-[#895129] shadow-sm"
                  initial={false}
                  animate={{
                    left: deliveryMethod === "local" ? 4 : "calc(50% + 2px)",
                  }}
                  transition={orderDetailsTabSpring}
                />
                <motion.button
                  type="button"
                  onClick={() => setDeliveryMethod("local")}
                  className={cn(
                    "relative z-10 flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                    deliveryMethod === "local"
                      ? "text-white"
                      : "text-gray-900 hover:text-gray-950",
                  )}
                  animate={{ scale: deliveryMethod === "local" ? 1.02 : 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  Local Delivery
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setDeliveryMethod("international")}
                  className={cn(
                    "relative z-10 flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                    deliveryMethod === "international"
                      ? "text-white"
                      : "text-gray-900 hover:text-gray-950",
                  )}
                  animate={{
                    scale: deliveryMethod === "international" ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  International Courier
                </motion.button>
              </div>

              {deliveryMethod === "local" ? (
                <motion.div
                  key="local-panel"
                  className="space-y-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: orderDetailsEase }}
                >
                  <div className="text-xs text-gray-600">
                    Fast delivery using nearby drivers
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.div
                      className="inline-flex"
                      {...orderDetailsButtonMotionProps}
                    >
                      <button
                        type="button"
                        className="bg-[#895129] hover:bg-[#7b4723] text-white rounded-xl shadow-sm px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={
                          busy ||
                          localRequested ||
                          isAlreadyRequested ||
                          order.type !== "product"
                        }
                        onClick={async () => {
                          try {
                            if (order.type !== "product") return;
                            await createLocalDelivery(order.id);
                            setLocalRequested(true);
                            toast.success("Local delivery requested");
                            void deliveryQ.refetch();
                          } catch {
                            toast.error("Failed to request local delivery");
                          }
                        }}
                      >
                        Request Local Delivery
                      </button>
                    </motion.div>

                    {(localRequested || isAlreadyRequested) && (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800">
                        Requested
                      </span>
                    )}
                  </div>

                  {order.type !== "product" ? (
                    <div className="text-xs text-gray-600">
                      Services don’t require delivery.
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <motion.div
                  key="intl-panel"
                  className="space-y-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: orderDetailsEase }}
                >
                  <div className="text-xs text-gray-600">
                    Use trusted courier partners for long-distance shipping
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">
                      Courier
                    </label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 text-sm transition-[box-shadow,border-color] duration-200 focus-visible:border-[#895129]/45 focus-visible:ring-2 focus-visible:ring-[#895129]/20 focus-visible:outline-none"
                      value={selectedCourier}
                      onChange={(e) =>
                        setSelectedCourier(e.target.value as CourierKey)
                      }
                      disabled={
                        busy ||
                        intlRequested ||
                        isAlreadyRequested ||
                        order.type !== "product"
                      }
                    >
                      <option value="">Select a courier</option>
                      <option value="dhl">DHL</option>
                      <option value="fedex">FedEx</option>
                      <option value="ups">UPS</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.div
                      className="inline-flex"
                      {...orderDetailsButtonMotionProps}
                    >
                      <button
                        type="button"
                        className="bg-[#895129] hover:bg-[#7b4723] text-white rounded-xl shadow-sm px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={
                          busy ||
                          intlRequested ||
                          isAlreadyRequested ||
                          order.type !== "product"
                        }
                        onClick={async () => {
                          if (order.type !== "product") return;
                          if (!selectedCourier) {
                            toast.error("Please select a courier");
                            return;
                          }
                          try {
                            await createInternationalDelivery(
                              order.id,
                              selectedCourier as Exclude<CourierKey, "">,
                            );
                            setIntlRequested(true);
                            toast.success("Shipment request created");
                            void deliveryQ.refetch();
                          } catch {
                            toast.error("Failed to create shipment request");
                          }
                        }}
                      >
                        Create Shipment Request
                      </button>
                    </motion.div>

                    {(intlRequested || isAlreadyRequested) && (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800">
                        Requested
                      </span>
                    )}
                  </div>

                  {order.type !== "product" ? (
                    <div className="text-xs text-gray-600">
                      Services don’t require delivery.
                    </div>
                  ) : null}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {deliveryQ.data ? (
          <motion.div
            variants={orderDetailsCardVariants}
            className="min-h-0 lg:col-span-2"
          >
            <DeliveryStatusCard delivery={deliveryQ.data} />
          </motion.div>
        ) : (
          <motion.div
            variants={orderDetailsCardVariants}
            className="min-h-0 lg:col-span-2"
          >
            <Card className="rounded-xl border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-muted-foreground">
                  {order.type === "product"
                    ? "Arrange local driver or international shipment when order is Ready."
                    : "Services don’t require delivery."}
                </div>
                {order.type === "product" ? (
                  <motion.div
                    className="inline-flex"
                    {...orderDetailsButtonMotionProps}
                  >
                    <Button
                      type="button"
                      className="bg-[#895129] hover:bg-[#7b4723]"
                      disabled={!canArrangeDelivery}
                      onClick={() => setDeliveryOpen(true)}
                    >
                      Arrange Delivery
                    </Button>
                  </motion.div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2"
        variants={orderDetailsCardsStaggerParentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={orderDetailsCardVariants} className="min-h-0">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Order items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div
                className="space-y-2"
                variants={orderDetailsItemsStaggerParentVariants}
                initial="hidden"
                animate="visible"
              >
                {displayItems.map((it, idx) => (
                  <motion.div
                    key={`${it.name}-${idx}`}
                    variants={orderDetailsItemRowVariants}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-muted-foreground">
                        Qty {it.quantity} &times; {fmtMoney(it.price)}
                      </div>
                    </div>
                    <div className="font-medium tabular-nums">
                      {fmtMoney(it.total)}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={orderDetailsPaymentVariants} className="min-h-0">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {fmtMoney(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-medium tabular-nums">
                  {fmtMoney(deliveryFee)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="text-muted-foreground text-green-600">Discount</span>
                  <span className="font-medium tabular-nums">
                    -{fmtMoney(discount)}
                  </span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="font-semibold tabular-nums">
                  {fmtMoney(total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {order.type === "service" ? (
        <motion.div
          variants={orderDetailsCardVariants}
          initial="hidden"
          animate="visible"
          className="min-h-0"
        >
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneList orderId={order.id} canEdit />
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      <DeliveryModal
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        order={order}
        disabled={!canArrangeDelivery}
        onDone={() => {
          void deliveryQ.refetch();
          void orderQ.refetch();
        }}
      />
    </motion.div>
  );
}
