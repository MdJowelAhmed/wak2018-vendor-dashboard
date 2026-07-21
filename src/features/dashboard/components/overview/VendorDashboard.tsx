import { Link } from "react-router-dom";
import { Banknote, Package, ShoppingCart, Truck } from "lucide-react";
import type { DashboardOverview } from "@/types/api";
import { ProductsOverview } from "@/features/dashboard/components/ProductsOverview";
import { cn } from "@/utils/utils";
import { formatCurrency } from "@/utils/format-currency";
import { StatsCards, type StatCard } from "./StatsCards";
import { RevenueChart } from "./RevenueChart";
import { OrdersTable } from "./OrdersTable";
import { DeliveriesCard } from "./DeliveriesCard";

export function VendorDashboard({ data }: { data: DashboardOverview }) {
  const stats: StatCard[] = [
    {
      key: "rev",
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: Banknote,
    },
    {
      key: "ord",
      label: "Total Orders",
      value: String(data.totalOrders),
      sub: "orders",
      icon: ShoppingCart,
    },
    {
      key: "del",
      label: "Active Deliveries",
      value: String(data.activeDeliveries),
      sub: "on the road",
      icon: Truck,
    },
    {
      key: "prod",
      label: "Total Products",
      value: String(data.products.total),
      sub: "listings",
      icon: Package,
    },
  ];

  return (
    <div className="w-full space-y-6">
      <StatsCards items={stats} />

      <div className="w-full">
        <RevenueChart
          weekly={data.revenueWeekly}
          monthly={data.revenueMonthly}
          mode="product"
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <OrdersTable
          orders={data.recentOrders.filter((o) => o.type === "product")}
          className="min-w-0"
        />
        <div className="flex min-w-0 flex-col gap-6">
          <DeliveriesCard items={data.activeDeliveriesList} />
          <QuickLinks />
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-foreground text-lg font-semibold">Inventory</h2>
        <ProductsOverview
          total={data.products.total}
          lowStockCount={data.products.lowStockCount}
          topName={data.products.topProduct.name}
          topSales={data.products.topProduct.sales}
        />
      </section>
    </div>
  );
}

function QuickLinks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-muted/30 border-border/60 flex flex-wrap items-center gap-2 rounded-xl border p-6 text-sm",
        className,
      )}
    >
      <span className="text-muted-foreground w-full sm:w-auto">
        Quick links:
      </span>
      <Link
        to="/vendor/orders"
        className="text-primary font-medium hover:underline"
      >
        All orders
      </Link>
      <span className="text-muted-foreground">·</span>
      <Link
        to="/vendor/analytics"
        className="text-primary font-medium hover:underline"
      >
        Analytics
      </Link>
      <span className="text-muted-foreground">·</span>
      <Link
        to="/vendor/products"
        className="text-primary font-medium hover:underline"
      >
        Products
      </Link>
    </div>
  );
}
