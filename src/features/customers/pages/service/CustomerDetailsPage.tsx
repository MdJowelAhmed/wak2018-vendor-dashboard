import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerHeader } from "@/features/customers/components/CustomerHeader";
import { CustomerStats } from "@/features/customers/components/CustomerStats";
import { useGetCustomerDetailsQuery } from "@/features/customers/services/customerApi";
import {
  cardHoverTransition,
  pageLoadTransition,
  staggerCardVariants,
  staggerParentVariants,
  staggerTileVariants,
  staggerTilesParentVariants,
} from "@/features/customers/motion/customer-details-variants";

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

export function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: customer,
    isLoading,
    isError,
  } = useGetCustomerDetailsQuery(
    { id: id!, role: "service" },
    { skip: !id },
  );

  if (isLoading) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        Loading service customer details...
      </div>
    );
  }

  if (!id || isError || !customer) {
    return (
      <p className="text-destructive text-sm">Service customer details not found.</p>
    );
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
                {customer.lastOrderAt ? (
                  <Badge variant="outline" className="text-xs">
                    Last order {fmtDate(customer.lastOrderAt)}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="text-sm font-semibold">Contact &amp; Location</div>
                <div className="mt-3 space-y-2 text-sm">
                  {customer.email ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{customer.email}</span>
                    </div>
                  ) : null}
                  {customer.phone ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                  ) : null}
                  {customer.country ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{customer.country}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <div className="text-sm font-semibold">Summary Stats</div>
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
                    <div className="text-muted-foreground text-xs">Total Orders</div>
                    <div className="text-lg font-semibold tabular-nums">
                      {customer.lifetimeValue.totalOrders}
                    </div>
                  </motion.div>
                  <motion.div
                    variants={staggerTileVariants}
                    className="rounded-lg border border-border/60 p-3"
                  >
                    <div className="text-muted-foreground text-xs">Total Spend</div>
                    <div className="text-lg font-semibold tabular-nums">
                      ${customer.lifetimeValue.totalSpend}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
