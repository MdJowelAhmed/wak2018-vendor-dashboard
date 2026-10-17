import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  BarChart3,
  RefreshCw,
  Plus,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  useGetInventoryAnalyticsQuery,
  useGetDashboardOverviewQuery,
  useGetMonthlyRevenueQuery,
} from "@/features/dashboard";
import { useGetUserProfileQuery } from "@/services/profileApi";
import type { AnalyticsRevenuePoint } from "@/types/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnalyticsKPI } from "@/features/dashboard/components/analytics/AnalyticsKPI";
import { RevenueChart } from "@/features/dashboard/components/analytics/RevenueChart";
import { InventoryOverviewCards } from "@/features/dashboard/components/analytics/InventoryOverviewCards";
import { InventoryHealthCard } from "@/features/dashboard/components/analytics/InventoryHealthCard";
import { CategoryBreakdownCard } from "@/features/dashboard/components/analytics/CategoryBreakdownCard";
import { StockAlertsSection } from "@/features/dashboard/components/analytics/StockAlertsSection";
import { TopStockedProductsCard } from "@/features/dashboard/components/analytics/TopStockedProductsCard";

export function AnalyticsPage() {
  const { data: profileRes } = useGetUserProfileQuery();
  const profile = profileRes?.data;
  const role = profile?.role === "service" ? "service" : "vendor";

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<string>("inventory");

  // Queries
  const inventoryQ = useGetInventoryAnalyticsQuery();
  const overviewQ = useGetDashboardOverviewQuery({ role });
  const monthlyRevenueQ = useGetMonthlyRevenueQuery({ year, role });

  const isRefreshing =
    inventoryQ.isFetching || overviewQ.isFetching || monthlyRevenueQ.isFetching;

  const handleRefresh = () => {
    inventoryQ.refetch();
    overviewQ.refetch();
    monthlyRevenueQ.refetch();
  };

  const chartPoints = useMemo<AnalyticsRevenuePoint[]>(() => {
    if (!monthlyRevenueQ.data) return [];
    return monthlyRevenueQ.data.map((d) => ({
      label: d.month,
      revenue: d.revenue,
      ordersJobs: 0,
    }));
  }, [monthlyRevenueQ.data]);

  const inventoryData = inventoryQ.data;
  const totalAlerts =
    (inventoryData?.lowStockAlerts?.length ?? 0) +
    (inventoryData?.outOfStockAlerts?.length ?? 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Analytics
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Vendor Hub
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time inventory valuation, stock health metrics, alerts, and revenue trends.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
            />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </Button>

          <Link to="/vendor/products/create">
            <Button size="sm" className="h-9 gap-1.5 text-xs font-medium">
              <Plus className="size-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Error Notice if inventory query fails */}
      {inventoryQ.isError && (
        <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Failed to load live inventory analytics. Please check your connection or retry.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => inventoryQ.refetch()}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border/80 pb-1">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="inventory" className="gap-2 text-xs font-semibold sm:text-sm">
              <Boxes className="size-4" />
              <span>Inventory Analytics</span>
              {totalAlerts > 0 && (
                <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                  {totalAlerts}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2 text-xs font-semibold sm:text-sm">
              <TrendingUp className="size-4" />
              <span>Revenue & Sales</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Inventory Analytics */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Key Metric Overview Cards */}
          <InventoryOverviewCards
            data={inventoryData?.overview}
            isLoading={inventoryQ.isLoading}
          />

          {/* Health Rate & Top Stocked Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <InventoryHealthCard
                healthRate={inventoryData?.healthRate}
                overview={inventoryData?.overview}
                isLoading={inventoryQ.isLoading}
              />
            </div>
            <div className="lg:col-span-5">
              <TopStockedProductsCard
                data={inventoryData?.topStockedProducts}
                isLoading={inventoryQ.isLoading}
              />
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <CategoryBreakdownCard
            data={inventoryData?.categoryBreakdown}
            isLoading={inventoryQ.isLoading}
          />

          {/* Critical Stock Alerts Center */}
          <StockAlertsSection
            lowStockAlerts={inventoryData?.lowStockAlerts}
            outOfStockAlerts={inventoryData?.outOfStockAlerts}
            isLoading={inventoryQ.isLoading}
          />
        </TabsContent>

        {/* TAB 2: Revenue & Sales Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsKPI
              title="Total Revenue"
              value={overviewQ.data?.totalRevenue}
              loading={overviewQ.isLoading}
              format="currency"
            />
            <AnalyticsKPI
              title="Total Orders"
              value={overviewQ.data?.totalOrders}
              loading={overviewQ.isLoading}
            />
            <AnalyticsKPI
              title="Total Products"
              value={overviewQ.data?.products?.total}
              loading={overviewQ.isLoading}
            />
            <AnalyticsKPI
              title="Active Deliveries"
              value={overviewQ.data?.activeDeliveries}
              loading={overviewQ.isLoading}
            />
          </div>

          <RevenueChart
            year={year}
            onChangeYear={setYear}
            points={chartPoints}
            isLoading={monthlyRevenueQ.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
