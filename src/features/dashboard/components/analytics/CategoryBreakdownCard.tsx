import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Layers, ArrowUpDown, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, useCurrency } from "@/utils/format-currency";
import type { InventoryCategoryBreakdown } from "@/types/api";

type Props = {
  data?: InventoryCategoryBreakdown[];
  isLoading?: boolean;
};

export function CategoryBreakdownCard({ data = [], isLoading }: Props) {
  useCurrency();
  const [viewMetric, setViewMetric] = useState<"value" | "stock">("value");

  const totalCatalogValue = useMemo(
    () => data.reduce((acc, cat) => acc + (cat.totalValue || 0), 0),
    [data],
  );

  const totalCatalogStock = useMemo(
    () => data.reduce((acc, cat) => acc + (cat.totalStock || 0), 0),
    [data],
  );

  const chartData = useMemo(() => {
    return data.map((cat) => ({
      name: cat.categoryName,
      stock: cat.totalStock,
      value: cat.totalValue,
      productCount: cat.productCount,
      percentage: totalCatalogValue > 0 ? ((cat.totalValue / totalCatalogValue) * 100).toFixed(1) : 0,
    }));
  }, [data, totalCatalogValue]);

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Category Distribution
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Stock volume & asset valuation broken down by product category
          </CardDescription>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMetric("value")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              viewMetric === "value"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-muted-foreground hover:text-gray-900"
            }`}
          >
            <DollarSign className="size-3.5" />
            Inventory Value
          </button>
          <button
            type="button"
            onClick={() => setViewMetric("stock")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
              viewMetric === "stock"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-muted-foreground hover:text-gray-900"
            }`}
          >
            <Package className="size-3.5" />
            Stock Units
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-60 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
            <Layers className="size-10 text-muted-foreground/30 mb-2" />
            <p>No category breakdown data available.</p>
          </div>
        ) : (
          <>
            {/* Visual Bar Chart */}
            <div className="h-64 w-full rounded-xl border border-border/50 bg-slate-50/50 p-2.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                  <XAxis dataKey="name" tickLine={false} className="text-xs font-medium" />
                  <YAxis
                    tickLine={false}
                    className="text-xs"
                    tickFormatter={(val) =>
                      viewMetric === "value"
                        ? val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
                        : String(val)
                    }
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const row = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border bg-white p-3 text-xs shadow-lg space-y-1">
                            <p className="font-bold text-gray-900 text-sm">{row.name}</p>
                            <p className="text-muted-foreground">
                              Products: <span className="font-semibold text-gray-900">{row.productCount}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Total Stock: <span className="font-semibold text-gray-900">{row.stock} units</span>
                            </p>
                            <p className="text-muted-foreground">
                              Valuation: <span className="font-semibold text-emerald-700">{formatCurrency(row.value)}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Share of Inventory: <span className="font-semibold text-primary">{row.percentage}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {viewMetric === "value" ? (
                    <Bar
                      dataKey="value"
                      name="Total Valuation"
                      fill="#895129"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  ) : (
                    <Bar
                      dataKey="stock"
                      name="Stock Units"
                      fill="#0d9488"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Structured Category List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>Category</span>
                <div className="flex items-center gap-6">
                  <span className="hidden sm:inline">Units / Share</span>
                  <span>Total Value</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
                {data.map((cat) => {
                  const valShare = totalCatalogValue > 0 ? (cat.totalValue / totalCatalogValue) * 100 : 0;
                  const avgPerUnit = cat.totalStock > 0 ? cat.totalValue / cat.totalStock : 0;

                  return (
                    <div
                      key={cat.categoryId || cat.categorySlug}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 transition-colors hover:bg-slate-50/80 gap-2 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-xs">
                          {cat.categoryName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">
                            {cat.categoryName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cat.productCount} {cat.productCount === 1 ? "product" : "products"} · Avg {formatCurrency(avgPerUnit)}/unit
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right">
                        <div className="min-w-[120px]">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="font-medium text-gray-900">{cat.totalStock} units</span>
                            <span>{valShare.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(valShare, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="min-w-[90px] text-right">
                          <span className="text-sm font-bold text-gray-900 block">
                            {formatCurrency(cat.totalValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
