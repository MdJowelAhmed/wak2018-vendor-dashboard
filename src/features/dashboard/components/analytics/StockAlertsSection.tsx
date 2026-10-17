import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  XCircle,
  ExternalLink,
  Pencil,
  PackageCheck,
  PackageX,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/utils/utils";
import { formatCurrency, useCurrency } from "@/utils/format-currency";
import type { InventoryStockAlertItem } from "@/types/api";

type Props = {
  lowStockAlerts?: InventoryStockAlertItem[];
  outOfStockAlerts?: InventoryStockAlertItem[];
  isLoading?: boolean;
};

export function StockAlertsSection({
  lowStockAlerts = [],
  outOfStockAlerts = [],
  isLoading,
}: Props) {
  useCurrency();
  const [activeTab, setActiveTab] = useState<"all" | "out" | "low">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const outList = useMemo(
    () => outOfStockAlerts.map((item) => ({ ...item, alertType: "out" as const })),
    [outOfStockAlerts],
  );

  const lowList = useMemo(
    () => lowStockAlerts.map((item) => ({ ...item, alertType: "low" as const })),
    [lowStockAlerts],
  );

  const allAlerts = useMemo(() => [...outList, ...lowList], [outList, lowList]);

  const filteredAlerts = useMemo(() => {
    let list =
      activeTab === "out" ? outList : activeTab === "low" ? lowList : allAlerts;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.slug.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeTab, outList, lowList, allAlerts, searchTerm]);

  const totalCount = allAlerts.length;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-col gap-3 pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-200">
              <AlertTriangle className="size-4" />
            </span>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Stock Replenishment Alerts
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Real-time catalog items requiring immediate reordering or restocking
          </CardDescription>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by name, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-44 rounded-lg border border-border/70 bg-white pl-8 pr-3 text-xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="inline-flex rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-muted-foreground hover:text-gray-900"
              }`}
            >
              All
              <span className="rounded-full bg-gray-100 px-1.5 py-0.2 text-[10px] font-bold">
                {totalCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("out")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === "out"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-muted-foreground hover:text-rose-700"
              }`}
            >
              Out of Stock
              <span className="rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold">
                {outList.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("low")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === "low"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-muted-foreground hover:text-amber-700"
              }`}
            >
              Low Stock
              <span className="rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.2 text-[10px] font-bold">
                {lowList.length}
              </span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 ring-1 ring-emerald-100">
              <PackageCheck className="size-7" />
            </div>
            <h3 className="font-semibold text-gray-900">
              {totalCount === 0 ? "No Stock Alerts" : "No matching products found"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              {totalCount === 0
                ? "Congratulations! All inventory items have sufficient stock units above their replenishment thresholds."
                : "No products matched your search or selected tab."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredAlerts.map((item) => {
              const isOut = item.alertType === "out" || item.stock === 0;
              const threshold = item.lowStockThreshold ?? 10;
              const stockPct = threshold > 0 ? Math.min((item.stock / threshold) * 100, 100) : 0;
              const imgUrl = item.images?.[0] ? getImageUrl(item.images[0]) : null;

              return (
                <div
                  key={item._id}
                  className={`group/row flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-3.5 transition-all duration-200 hover:shadow-md ${
                    isOut
                      ? "border-rose-200/80 bg-rose-50/20 hover:bg-rose-50/40"
                      : "border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/40"
                  }`}
                >
                  {/* Product Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-gray-200/80 bg-gray-100 shadow-xs">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="size-full object-cover transition-transform duration-300 group-hover/row:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <PackageX className="size-6" />
                        </div>
                      )}
                      {isOut && (
                        <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-white">
                            Zero
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/vendor/products/${item._id}`}
                          className="font-semibold text-gray-900 hover:text-primary transition-colors truncate text-sm max-w-[280px] sm:max-w-[320px]"
                        >
                          {item.name}
                        </Link>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground">
                          {item.sku}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.discountPrice ?? item.price)}
                        </span>
                        {item.discountPrice && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground capitalize">
                          Status: {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    {/* Stock level badge & progress */}
                    <div className="min-w-[130px] sm:text-right">
                      {isOut ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                          <XCircle className="size-4 shrink-0 text-rose-600" />
                          <span>0 In Stock (Depleted)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between sm:justify-end gap-1.5 text-xs font-bold text-amber-800">
                            <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                            <span>
                              {item.stock} left{" "}
                              <span className="text-[11px] font-normal text-muted-foreground">
                                / {threshold} min
                              </span>
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${Math.max(stockPct, 8)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Edit / Restock Action Button */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/vendor/products/edit/${item._id}`}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-all ${
                          isOut
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : "bg-amber-600 text-white hover:bg-amber-700"
                        }`}
                      >
                        <Pencil className="size-3.5" />
                        Restock
                      </Link>
                      <Link
                        to={`/vendor/products/${item._id}`}
                        title="View details"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-white text-muted-foreground hover:text-gray-900 hover:bg-slate-50 transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
