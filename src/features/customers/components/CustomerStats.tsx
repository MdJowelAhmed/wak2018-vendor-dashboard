import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerLifetimeValue } from "@/types/api";
import {
  cardHoverTransition,
  staggerCardVariants,
  staggerParentVariants,
} from "@/features/customers/motion/customer-details-variants";

function fmtMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="h-full rounded-xl border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function StatGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      variants={staggerParentVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

function StatMotionWrap({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={staggerCardVariants}
      whileHover={{ y: -4, transition: cardHoverTransition }}
      className="h-full min-h-0"
    >
      {children}
    </motion.div>
  );
}

export function CustomerStats({ ltv }: { ltv: CustomerLifetimeValue }) {
  return (
    <div className="space-y-6">
      <StatGrid>
        <StatMotionWrap>
          <StatCard label="Total Spend" value={fmtMoney(ltv.totalSpend)} />
        </StatMotionWrap>
        <StatMotionWrap>
          <StatCard
            label="Total Orders"
            value={new Intl.NumberFormat().format(ltv.totalOrders)}
          />
        </StatMotionWrap>
        <StatMotionWrap>
          <StatCard label="Average Order Value" value={fmtMoney(ltv.aov)} />
        </StatMotionWrap>
        <StatMotionWrap>
          <StatCard
            label="Points"
            value={new Intl.NumberFormat().format(ltv.points)}
          />
        </StatMotionWrap>
      </StatGrid>

      <StatGrid>
        <StatMotionWrap>
          <StatCard
            label="Last 30 days orders"
            value={new Intl.NumberFormat().format(ltv.last30DaysOrders)}
          />
        </StatMotionWrap>
        <StatMotionWrap>
          <StatCard
            label="Abandoned carts"
            value={new Intl.NumberFormat().format(ltv.abandonedCarts)}
          />
        </StatMotionWrap>
        <StatMotionWrap>
          <StatCard
            label="Refunds"
            value={new Intl.NumberFormat().format(ltv.refunds)}
          />
        </StatMotionWrap>
        <StatMotionWrap>
          <StatCard
            label="Refunded amount"
            value={fmtMoney(ltv.refundedAmount)}
          />
        </StatMotionWrap>
      </StatGrid>
    </div>
  );
}
