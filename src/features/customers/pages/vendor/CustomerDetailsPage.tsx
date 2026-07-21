import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerHeader } from "@/features/customers/components/CustomerHeader";
import { CustomerStats } from "@/features/customers/components/CustomerStats";
import { useGetCustomerDetailsQuery } from "@/features/customers";
import {
  cardHoverTransition,
  pageLoadTransition,
  staggerCardVariants,
  staggerParentVariants,
  staggerTileVariants,
  staggerTilesParentVariants,
  timelineItemVariants,
} from "@/features/customers/motion/customer-details-variants";

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("deliver") || s === "completed")
    return "bg-emerald-600 text-white border-emerald-600";
  if (
    s.includes("transit") ||
    s.includes("ship") ||
    s.includes("progress") ||
    s.includes("ready")
  )
    return "bg-orange-500 text-white border-orange-500";
  if (s.includes("cancel") || s.includes("reject") || s.includes("refund"))
    return "bg-red-600 text-white border-red-600";
  return "bg-slate-600 text-white border-slate-600";
}

export function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const q = useGetCustomerDetailsQuery(id ?? "", { skip: !id });
  const customer = q.data;

  const recentOrders = useMemo(() => {
    const rows = (customer?.orders ?? []).slice();
    rows.sort((a, b) => (b.date > a.date ? 1 : -1));
    return rows.slice(0, 5);
  }, [customer?.orders]);

  const deliveryOverview = useMemo(() => {
    const history = customer?.deliveryHistory ?? [];
    const total = history.length;
    const inTransit = history.filter((h) =>
      String(h.status).toLowerCase().includes("transit"),
    ).length;
    const delivered = history.filter((h) =>
      String(h.status).toLowerCase().includes("deliver"),
    ).length;
    const cancelled = history.filter((h) =>
      String(h.status).toLowerCase().includes("cancel"),
    ).length;
    return { total, inTransit, delivered, cancelled };
  }, [customer?.deliveryHistory]);

  const timeline = useMemo(() => {
    const items: Array<{
      label: string;
      date?: string;
      tone: "good" | "warn" | "bad" | "neutral";
    }> = [];

    // Most actionable events first; keep it compact.
    for (const o of (customer?.orders ?? [])
      .slice()
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 3)) {
      items.push({
        label: `Order ${o.id} · ${o.status}`,
        date: o.date,
        tone: "neutral",
      });
    }
    for (const d of (customer?.deliveryHistory ?? [])
      .slice()
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 3)) {
      const s = String(d.status).toLowerCase();
      const tone = s.includes("deliver")
        ? "good"
        : s.includes("transit")
          ? "warn"
          : s.includes("cancel")
            ? "bad"
            : "neutral";
      items.push({
        label: `Delivery ${d.id} · ${d.status}`,
        date: d.date,
        tone,
      });
    }
    if (customer?.lastActiveAt) {
      items.push({
        label: "Last active",
        date: customer.lastActiveAt,
        tone: "good",
      });
    }

    items.sort((a, b) => ((b.date ?? "") > (a.date ?? "") ? 1 : -1));
    return items.slice(0, 8);
  }, [customer?.orders, customer?.deliveryHistory, customer?.lastActiveAt]);

  if (!id || q.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (q.isError || !customer) {
    return <p className="text-destructive text-sm">Failed to load customer.</p>;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={pageLoadTransition}
    >
      <CustomerHeader customer={customer} onBack={() => navigate(-1)} />

      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={staggerParentVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={staggerCardVariants}
          whileHover={{ y: -4, transition: cardHoverTransition }}
          className="min-h-0"
        >
          <Card className="h-full rounded-xl border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>Lifetime value</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerStats ltv={customer.lifetimeValue} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={staggerCardVariants}
          whileHover={{ y: -4, transition: cardHoverTransition }}
          className="min-h-0"
        >
          <Card className="h-full rounded-xl border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Customer Insights</CardTitle>
                {customer.lastActiveAt ? (
                  <Badge variant="outline" className="text-xs">
                    Last active {fmtDate(customer.lastActiveAt)}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Recent Orders</div>
                  <div className="text-xs text-muted-foreground">
                    Last {Math.min(5, recentOrders.length)} orders
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {recentOrders.length ? (
                    recentOrders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            <span className="font-mono">#{o.id}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fmtDate(o.date)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold tabular-nums">
                            {fmtMoney(o.amount)}
                          </div>
                          <Badge className={statusBadgeClass(o.status)}>
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      No orders yet.
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="h-px bg-border" />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className="text-sm font-semibold">Delivery Overview</div>
                <motion.div
                  className="mt-3 grid grid-cols-2 gap-3 text-sm"
                  variants={staggerTilesParentVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    variants={staggerTileVariants}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="text-muted-foreground text-xs">Total</div>
                    <div className="text-lg font-semibold tabular-nums">
                      {deliveryOverview.total}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={staggerTileVariants}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="text-muted-foreground text-xs">
                      In transit
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                      {deliveryOverview.inTransit}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={staggerTileVariants}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="text-muted-foreground text-xs">
                      Delivered
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                      {deliveryOverview.delivered}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={staggerTileVariants}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="text-muted-foreground text-xs">
                      Cancelled
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                      {deliveryOverview.cancelled}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="h-px bg-border" />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className="text-sm font-semibold">Activity Timeline</div>
                <div className="mt-3 space-y-3">
                  {timeline.length ? (
                    timeline.map((t, idx) => (
                      <motion.div
                        key={`${t.label}-${idx}`}
                        custom={idx}
                        variants={timelineItemVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={[
                              "mt-1 size-2 rounded-full",
                              t.tone === "good"
                                ? "bg-emerald-600"
                                : t.tone === "warn"
                                  ? "bg-orange-500"
                                  : t.tone === "bad"
                                    ? "bg-red-600"
                                    : "bg-slate-400",
                            ].join(" ")}
                          />
                          {idx !== timeline.length - 1 ? (
                            <div className="mt-1 h-full w-px bg-border" />
                          ) : null}
                        </div>
                        <div className="min-w-0 pb-1">
                          <div className="text-sm font-medium truncate">
                            {t.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fmtDate(t.date)}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground py-2">
                      No recent activity.
                    </div>
                  )}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
