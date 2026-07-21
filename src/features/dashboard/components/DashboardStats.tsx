import type { ComponentType } from "react";
import { Banknote, ShoppingCart, Truck, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/utils";
import { formatCurrency } from "@/utils/format-currency";

type Stat = {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
};

type Props = {
  totalRevenue: number;
  totalOrders: number;
  activeDeliveries: number;
  activeServices: number;
  isLoading?: boolean;
  className?: string;
};

export function DashboardStats({
  totalRevenue,
  totalOrders,
  activeDeliveries,
  activeServices,
  isLoading,
  className,
}: Props) {
  const items: Stat[] = [
    {
      key: "rev",
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      sub: undefined,
      icon: Banknote,
    },
    {
      key: "ord",
      label: "Total Orders",
      value: String(totalOrders),
      sub: "orders",
      icon: ShoppingCart,
    },
    {
      key: "del",
      label: "Active Deliveries",
      value: String(activeDeliveries),
      sub: "on the road",
      icon: Truck,
    },
    {
      key: "svc",
      label: "Active Services",
      value: String(activeServices),
      sub: "listings",
      icon: Wrench,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((s) => (
        <Card
          key={s.key}
          className="bg-card text-card-foreground border-border/60 rounded-xl border py-0 shadow-sm"
        >
          <CardContent className="flex items-start justify-between gap-3 p-6">
            <div className="min-w-0 space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                {s.label}
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {s.value}
                  </p>
                  {s.sub && (
                    <p className="text-muted-foreground text-xs">{s.sub}</p>
                  )}
                </>
              )}
            </div>
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <s.icon className="size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
