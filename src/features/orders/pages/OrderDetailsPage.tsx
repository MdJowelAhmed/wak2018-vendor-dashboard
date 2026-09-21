import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeliveryStatusCard } from "@/features/orders/components/DeliveryStatusCard";
import { StatusDropdown } from "@/features/orders/components/StatusDropdown";
import { VendorOrderStatusControl } from "@/features/orders/components/VendorOrderStatusControl";
import { MilestoneList } from "@/features/orders/components/MilestoneList";
import {
  useGetProductOrderByIdQuery,
  useGetServiceOrderByIdQuery,
  useUpdateServiceOrderStatusMutation,
  useRequestVendorLocalDeliveryMutation,
  useRequestVendorInternationalShipmentMutation,
} from "@/features/orders";
import {
  useGetDeliveryStatusQuery,
  useDeliveryRealtime,
} from "@/features/delivery";
import type {
  Order,
  ProductOrder,
  ProductOrderItem,
  ProductOrderItemProduct,
  ServiceOrderStatus,
} from "@/types/api";
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
import { cn, getImageUrl } from "@/utils/utils";
import { OrderStatusBadge } from "@/components/status-badge";
import {
  formatCurrency as fmtMoney,
  useCurrency,
} from "@/utils/format-currency";

type DeliveryMethod = "local" | "international";

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatInCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function titleCase(value?: string | null) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function itemProduct(
  product: ProductOrderItem["product"],
): ProductOrderItemProduct | null {
  if (product && typeof product === "object") return product;
  return null;
}

function itemName(it: ProductOrderItem, fallback: string) {
  const product = itemProduct(it.product);
  if (product?.name) return product.name;
  if (typeof it.product === "string" && it.product) return fallback;
  return fallback;
}

function CopyValue({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label ? `${label} copied` : "Copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
      aria-label={label ? `Copy ${label}` : "Copy"}
    >
      {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function fileNameFromUrl(url: string, fallback: string) {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop();
    if (last?.toLowerCase().endsWith(".pdf")) return last;
  } catch {
    /* ignore */
  }
  return fallback;
}

function ShipmentDownloadButton({
  url,
  label,
  filename,
}: {
  url: string;
  label: string;
  filename: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileNameFromUrl(url, filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = fileNameFromUrl(url, filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 w-full justify-start gap-2 rounded-lg"
      disabled={busy}
      onClick={() => void download()}
    >
      <Download className="size-3.5" />
      {busy ? "Downloading…" : label}
    </Button>
  );
}

function MetaRow({
  label,
  value,
  copy,
}: {
  label: string;
  value?: ReactNode;
  copy?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="mt-0.5 text-sm font-medium break-words">{value || "—"}</div>
      </div>
      {copy ? <CopyValue value={copy} label={label} /> : null}
    </div>
  );
}

export function OrderDetailsPage() {
  useCurrency();
  const { id } = useParams();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const isVendor = pathname.startsWith("/vendor");

  const productOrderQ = useGetProductOrderByIdQuery(id ?? "", {
    skip: !id || !isVendor,
    pollingInterval: 4000,
  });

  const serviceOrderQ = useGetServiceOrderByIdQuery(id ?? "", {
    skip: !id || isVendor,
    pollingInterval: 4000,
  });

  const orderQ = isVendor ? productOrderQ : serviceOrderQ;
  const order = orderQ.data as Order | undefined;
  const productOrder = order?.type === "product" ? (order as ProductOrder) : null;

  const deliveryQ = useGetDeliveryStatusQuery(
    { orderId: id ?? "" },
    { skip: !id, pollingInterval: 4000 },
  );

  const [updateS] = useUpdateServiceOrderStatusMutation();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("local");

  const [requestLocal, { isLoading: localRequestLoading }] =
    useRequestVendorLocalDeliveryMutation();
  const [requestIntl, { isLoading: intlRequestLoading }] =
    useRequestVendorInternationalShipmentMutation();

  useDeliveryRealtime(id);

  useEffect(() => {
    if (productOrder?.deliveryType === "international") {
      setDeliveryMethod("international");
    } else if (productOrder?.deliveryType === "local") {
      setDeliveryMethod("local");
    }
  }, [productOrder?.deliveryType]);

  if (orderQ.isLoading || !id) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[420px] lg:col-span-2" />
          <Skeleton className="h-[420px]" />
        </div>
      </div>
    );
  }
  if (orderQ.isError || !order) {
    return <p className="text-destructive text-sm">Failed to load order.</p>;
  }

  const customer = order.customer ?? { name: order.customerName };
  const shipping = productOrder?.shippingAddress;
  const displayId = productOrder?.orderId || `#${order.id}`;
  const backHref = isVendor ? "/vendor/orders" : "/service/bookings";

  const displayItems =
    order.items?.map((it: any) => {
      const product = itemProduct(it.product);
      return {
        name: itemName(it, productOrder?.productName || (order as any).serviceName || "Item"),
        quantity: it.quantity || 1,
        price: it.unitPrice ?? it.price ?? 0,
        total: it.unitTotal ?? (it.unitPrice ?? it.price ?? 0) * (it.quantity || 1),
        image: product?.images?.[0],
        listPrice: product?.price,
        discountPrice: product?.discountPrice,
      };
    }) ?? [
      {
        name:
          order.type === "product"
            ? order.productName
            : (order as any).serviceName,
        quantity: (order as any).quantity ?? 1,
        price: order.total,
        total: order.total,
        image: undefined as string | undefined,
        listPrice: undefined as number | undefined,
        discountPrice: undefined as number | undefined,
      },
    ];

  const subtotal =
    productOrder?.subTotal !== undefined
      ? productOrder.subTotal
      : displayItems.reduce((a, it) => a + it.total, 0);

  const deliveryFee = productOrder?.shippingFee ?? 0;
  const discount = productOrder?.discount || 0;
  const total =
    productOrder?.grandTotalUSD ??
    productOrder?.grandTotal ??
    order.total ??
    subtotal + deliveryFee - discount;

  const paymentCurrency = productOrder?.paymentCurrency;
  const baseCurrency = productOrder?.baseCurrency || "USD";
  const exchangeRate = productOrder?.exchangeRate;
  const paidLocal = productOrder?.grandTotalLocal;
  const hasLocalCharge =
    Boolean(paymentCurrency) &&
    paymentCurrency !== baseCurrency &&
    paidLocal != null;

  const busy = localRequestLoading || intlRequestLoading;
  const orderStatus = String(productOrder?.status || "").toLowerCase();
  const showDeliveryActions =
    order.type === "product" &&
    productOrder?.deliveryOption !== "pickup" &&
    orderStatus === "confirmed";

  const mapsUrl =
    shipping?.latitude != null && shipping?.longitude != null
      ? `https://maps.google.com/?q=${shipping.latitude},${shipping.longitude}`
      : null;

  async function createLocalDelivery(orderId: string) {
    await requestLocal({
      id: orderId,
      deliveryFee: productOrder?.shippingFee ?? 0,
    }).unwrap();
  }

  async function createInternationalDelivery(orderId: string) {
    await requestIntl({ id: orderId }).unwrap();
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={orderDetailsPageLoadTransition}
    >
      <motion.div
        className="flex flex-wrap items-start justify-between gap-4"
        variants={orderDetailsHeaderVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="min-w-0 space-y-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground"
            onClick={() => navigate(backHref)}
          >
            <ArrowLeft className="mr-1 size-4" />
            Back to orders
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{displayId}</h1>
            <CopyValue value={displayId} label="Order ID" />
          </div>
          <p className="text-muted-foreground text-sm">
            Placed {fmtDateTime(order.createdAt)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {productOrder?.paymentStatus ? (
              <OrderStatusBadge status={productOrder.paymentStatus} />
            ) : null}
            {productOrder?.paymentMethod ? (
              <Badge variant="outline" className="capitalize">
                {productOrder.paymentMethod}
              </Badge>
            ) : null}
            {productOrder?.deliveryType ? (
              <Badge variant="secondary" className="capitalize">
                {productOrder.deliveryType} {productOrder.deliveryOption || "delivery"}
              </Badge>
            ) : null}
          </div>
        </div>
        {order.type === "product" ? (
          <VendorOrderStatusControl
            orderId={order.id}
            status={order.status}
            deliveryType={productOrder?.deliveryType}
            deliveryOption={productOrder?.deliveryOption}
            onUpdated={() => {
              void orderQ.refetch();
            }}
          />
        ) : (
          <StatusDropdown
            kind={order.type}
            value={order.status}
            onChange={async (next) => {
              try {
                await updateS({
                  id: order.id,
                  status: next as ServiceOrderStatus,
                }).unwrap();
                toast.success("Status updated");
                void orderQ.refetch();
              } catch {
                toast.error("Update failed");
              }
            }}
          />
        )}
      </motion.div>

      {productOrder ? (
        <motion.div
          className="grid w-full grid-cols-2 gap-3 lg:grid-cols-4"
          variants={orderDetailsCardsStaggerParentVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              label: "Items",
              value: String(productOrder.totalQuantity ?? displayItems.length),
            },
            { label: "Subtotal", value: fmtMoney(subtotal) },
            { label: "Shipping", value: fmtMoney(deliveryFee) },
            { label: "Grand total", value: fmtMoney(total) },
          ].map((stat) => (
            <motion.div key={stat.label} variants={orderDetailsCardVariants}>
              <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
                <div className="text-muted-foreground text-xs font-medium">
                  {stat.label}
                </div>
                <div className="mt-1 text-lg font-semibold tabular-nums">
                  {stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            variants={orderDetailsCardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="size-4 text-[#895129]" />
                  Order items
                </CardTitle>
                <span className="text-muted-foreground text-xs">
                  {displayItems.length} item{displayItems.length === 1 ? "" : "s"}
                </span>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="divide-y divide-gray-100"
                  variants={orderDetailsItemsStaggerParentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {displayItems.map((it, idx) => (
                    <motion.div
                      key={`${it.name}-${idx}`}
                      variants={orderDetailsItemRowVariants}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-xl border border-gray-100">
                        {it.image ? (
                          <img
                            src={getImageUrl(it.image)}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="text-muted-foreground flex size-full items-center justify-center">
                            <Package className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{it.name}</div>
                        <div className="text-muted-foreground mt-0.5 text-sm">
                          Qty {it.quantity} × {fmtMoney(it.price)}
                        </div>
                        {it.listPrice != null &&
                        it.discountPrice != null &&
                        it.discountPrice < it.listPrice ? (
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground line-through">
                              {fmtMoney(it.listPrice)}
                            </span>
                            <span className="rounded-md bg-[#895129]/10 px-1.5 py-0.5 font-medium text-[#895129]">
                              Sale {fmtMoney(it.discountPrice)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right font-semibold tabular-nums">
                        {fmtMoney(it.total)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={orderDetailsPaymentVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4 text-[#895129]" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MetaRow
                    label="Payment method"
                    value={titleCase(productOrder?.paymentMethod || "—")}
                  />
                  <MetaRow
                    label="Payment status"
                    value={
                      productOrder?.paymentStatus ? (
                        <OrderStatusBadge status={productOrder.paymentStatus} />
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">{fmtMoney(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping fee</span>
                    <span className="font-medium tabular-nums">{fmtMoney(deliveryFee)}</span>
                  </div>
                  {discount > 0 ? (
                    <div className="flex items-center justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-medium tabular-nums">-{fmtMoney(discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-medium">Grand total</span>
                    <span className="text-lg font-semibold tabular-nums text-[#895129]">
                      {fmtMoney(total)}
                    </span>
                  </div>
                </div>
                {hasLocalCharge ? (
                  <div className="rounded-xl border border-[#895129]/15 bg-[#895129]/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        Charged in {paymentCurrency}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatInCurrency(paidLocal ?? 0, paymentCurrency!)}
                      </span>
                    </div>
                    {exchangeRate ? (
                      <div className="text-muted-foreground mt-1 text-xs">
                        1 {baseCurrency} = {exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {paymentCurrency}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {productOrder?.stripeSessionId ? (
                  <MetaRow
                    label="Stripe session"
                    value={
                      <span className="font-mono text-xs">
                        {productOrder.stripeSessionId}
                      </span>
                    }
                    copy={productOrder.stripeSessionId}
                  />
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {productOrder?.statusLog?.length ? (
            <motion.div
              variants={orderDetailsCardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Status timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {productOrder.statusLog.map((log, idx) => {
                      const last = idx === productOrder.statusLog!.length - 1;
                      return (
                        <li key={`${log.status}-${log.timestamp}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={cn(
                                "mt-1 size-2.5 rounded-full",
                                last ? "bg-[#895129]" : "bg-gray-300",
                              )}
                            />
                            {idx < productOrder.statusLog!.length - 1 ? (
                              <span className="mt-1 w-px flex-1 bg-gray-200" />
                            ) : null}
                          </div>
                          <div className="min-w-0 pb-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <OrderStatusBadge status={log.status} />
                              <span className="text-muted-foreground text-xs">
                                {fmtDateTime(log.timestamp)}
                              </span>
                            </div>
                            {log.note ? (
                              <p className="text-muted-foreground mt-1 text-sm">{log.note}</p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {order.type === "service" ? (
            <motion.div
              variants={orderDetailsCardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <MilestoneList orderId={order.id} canEdit />
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          className="space-y-6"
          variants={orderDetailsCardsStaggerParentVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={orderDetailsCardVariants}>
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4 text-[#895129]" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <MetaRow label="Name" value={customer.name} />
                {customer.email ? (
                  <div className="flex items-start gap-2">
                    <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <a
                      href={`mailto:${customer.email}`}
                      className="hover:text-[#895129] min-w-0 break-all font-medium"
                    >
                      {customer.email}
                    </a>
                  </div>
                ) : null}
                {customer.phone ? (
                  <div className="flex items-start gap-2">
                    <Phone className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <a
                      href={`tel:${customer.phone.replace(/\s/g, "")}`}
                      className="hover:text-[#895129] font-medium"
                    >
                      {customer.phone}
                    </a>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          {shipping ? (
            <motion.div variants={orderDetailsCardVariants}>
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="size-4 text-[#895129]" />
                    Shipping address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">{shipping.fullName}</div>
                    {shipping.phone ? (
                      <a
                        href={`tel:${shipping.phone.replace(/\s/g, "")}`}
                        className="text-muted-foreground hover:text-[#895129] mt-0.5 block"
                      >
                        {shipping.phone}
                      </a>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {[
                      shipping.address,
                      shipping.city,
                      shipping.state,
                      shipping.postalCode,
                      shipping.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {shipping.countryCode ? (
                      <Badge variant="outline">{shipping.countryCode}</Badge>
                    ) : null}
                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#895129] hover:underline"
                      >
                        Open in Maps
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {productOrder ? (
            <motion.div variants={orderDetailsCardVariants}>
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="size-4 text-[#895129]" />
                    Shipment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 gap-3">
                    <MetaRow
                      label="Delivery type"
                      value={titleCase(
                        [productOrder.deliveryType, productOrder.deliveryOption]
                          .filter(Boolean)
                          .join(" · "),
                      )}
                    />
                    {productOrder.shipment?.carrier ? (
                      <MetaRow
                        label="Carrier"
                        value={titleCase(productOrder.shipment.carrier)}
                      />
                    ) : null}
                    {productOrder.shipment?.trackingId ? (
                      <MetaRow
                        label="Tracking ID"
                        value={
                          <span className="font-mono text-xs">
                            {productOrder.shipment.trackingId}
                          </span>
                        }
                        copy={productOrder.shipment.trackingId}
                      />
                    ) : null}
                    {productOrder.shipment?.trackingUrl ? (
                      <MetaRow
                        label="Tracking URL"
                        value={
                          <a
                            href={productOrder.shipment.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#895129] hover:underline"
                          >
                            Track shipment
                            <ExternalLink className="size-3" />
                          </a>
                        }
                      />
                    ) : null}
                    <MetaRow
                      label="Tracking status"
                      value={
                        productOrder.shipment?.trackingStatus ? (
                          <OrderStatusBadge
                            status={productOrder.shipment.trackingStatus}
                          />
                        ) : (
                          "—"
                        )
                      }
                    />
                    {productOrder.shipment?.requestedAt ? (
                      <MetaRow
                        label="Requested"
                        value={fmtDateTime(productOrder.shipment.requestedAt)}
                      />
                    ) : null}
                    {productOrder.shipment?.lastSyncedAt ? (
                      <MetaRow
                        label="Last synced"
                        value={fmtDateTime(productOrder.shipment.lastSyncedAt)}
                      />
                    ) : null}
                    <MetaRow
                      label="Local delivery"
                      value={titleCase(productOrder.localDeliveryStatus)}
                    />
                    <MetaRow
                      label="Stock"
                      value={titleCase(productOrder.stockReservationStatus)}
                    />
                    {/* {productOrder.shippoShipmentId ? (
                      <MetaRow
                        label="Shippo shipment"
                        value={
                          <span className="font-mono text-xs">
                            {productOrder.shippoShipmentId}
                          </span>
                        }
                        copy={productOrder.shippoShipmentId}
                      />
                    ) : null}
                    {productOrder.shippoRateId ? (
                      <MetaRow
                        label="Shippo rate"
                        value={
                          <span className="font-mono text-xs">
                            {productOrder.shippoRateId}
                          </span>
                        }
                        copy={productOrder.shippoRateId}
                      />
                    ) : null}
                    {productOrder.payoutSettled != null ? (
                      <MetaRow
                        label="Payout"
                        value={productOrder.payoutSettled ? "Settled" : "Not settled"}
                      />
                    ) : null} */}
                  </div>
                  {productOrder.shipment?.labelUrl ||
                  productOrder.shipment?.commercialInvoiceUrl ? (
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <div className="text-muted-foreground text-xs">Documents</div>
                      {productOrder.shipment.labelUrl ? (
                        <ShipmentDownloadButton
                          url={productOrder.shipment.labelUrl}
                          label="Download shipping label"
                          filename={`shipping-label-${String(displayId).replace(/[^a-zA-Z0-9-]/g, "")}.pdf`}
                        />
                      ) : null}
                      {productOrder.shipment.commercialInvoiceUrl ? (
                        <ShipmentDownloadButton
                          url={productOrder.shipment.commercialInvoiceUrl}
                          label="Download commercial invoice"
                          filename={`commercial-invoice-${String(displayId).replace(/[^a-zA-Z0-9-]/g, "")}.pdf`}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {deliveryQ.data ? (
            <motion.div variants={orderDetailsCardVariants}>
              <DeliveryStatusCard delivery={deliveryQ.data} />
            </motion.div>
          ) : null}

          {showDeliveryActions ? (
            <motion.div variants={orderDetailsCardVariants}>
              <Card className="rounded-2xl border-gray-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="size-4 text-[#895129]" />
                    Arrange delivery
                  </CardTitle>
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
                      Local
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
                      International
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
                      <p className="text-muted-foreground text-xs">
                        Fast delivery using nearby drivers. Delivery fee:{" "}
                        {fmtMoney(deliveryFee)}
                      </p>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="inline-flex"
                          {...orderDetailsButtonMotionProps}
                        >
                          <button
                            type="button"
                            className="rounded-xl bg-[#895129] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#7b4723] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={busy}
                            onClick={async () => {
                              try {
                                await createLocalDelivery(order.id);
                                toast.success("Local delivery requested");
                                void deliveryQ.refetch();
                                void orderQ.refetch();
                              } catch {
                                toast.error("Failed to request local delivery");
                              }
                            }}
                          >
                            Request local delivery
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="intl-panel"
                      className="space-y-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: orderDetailsEase }}
                    >
                      <p className="text-muted-foreground text-xs">
                        Create a courier shipment for this order.
                      </p>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="inline-flex"
                          {...orderDetailsButtonMotionProps}
                        >
                          <button
                            type="button"
                            className="rounded-xl bg-[#895129] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#7b4723] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={busy}
                            onClick={async () => {
                              try {
                                await createInternationalDelivery(order.id);
                                toast.success("Shipment request created");
                                void deliveryQ.refetch();
                                void orderQ.refetch();
                              } catch {
                                toast.error("Failed to create shipment request");
                              }
                            }}
                          >
                            Create shipment
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </motion.div>
      </div>

    </motion.div>
  );
}
